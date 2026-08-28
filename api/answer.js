require('dotenv').config();
const OpenAI = require('openai');
const { retrieveChunks } = require('../retrieval/hybrid-retrieve');

const REFUSAL_STRING =
  "I don't have enough information in the provided documents to answer this accurately.";

function makeOpenAIClient() {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('Missing OPENAI_API_KEY');
  }
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
}

function parseResponse(responseText) {
  const answer = String(responseText || '').trim();
  const refused = answer === REFUSAL_STRING || answer.startsWith(REFUSAL_STRING);
  const citedSources = Array.from(
    new Set(
      [...answer.matchAll(/\[source:\s*([^\]]+?)\s*\]/gi)].map((match) => match[1].trim()),
    ),
  );

  return { answer, refused, citedSources };
}

async function answerQuestion(question) {
  console.log(
    'SYSTEM PROMPT:',
    [
      'You answer only using the provided context.',
      'Do not use outside knowledge.',
      'Every factual claim must be followed immediately by a citation in the exact format [source: filename.md].',
      `If the retrieved context does not contain enough information to answer confidently and accurately, respond with exactly this string and nothing else: "${REFUSAL_STRING}"`,
    ].join(' '),
  );

  const retrievedChunks = await retrieveChunks(question, 5);
  const context = retrievedChunks.map((chunk) => chunk.content).join('\n\n');
  const systemPrompt = [
    'You answer only using the provided context.',
    'Do not use outside knowledge.',
    'Every factual claim must be followed immediately by a citation in the exact format [source: filename.md].',
    `If the retrieved context does not contain enough information to answer confidently and accurately, respond with exactly this string and nothing else: "${REFUSAL_STRING}"`,
  ].join(' ');
  const userPrompt = `Context:\n${context}\n\nQuestion: ${question}`;

  const openai = makeOpenAIClient();
  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    temperature: 0,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
  });

  const parsed = parseResponse(completion.choices[0]?.message?.content);

  return {
    rawAnswer: completion.choices[0]?.message?.content || '',
    answer: parsed.answer,
    retrievedChunks,
    refused: parsed.refused,
    citedSources: parsed.citedSources,
  };
}

module.exports = { answerQuestion };
