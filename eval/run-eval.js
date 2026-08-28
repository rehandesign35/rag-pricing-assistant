const fs = require('fs/promises');
const path = require('path');
require('dotenv').config();
const OpenAI = require('openai');
const { answerQuestion } = require('../api/answer');

function makeOpenAIClient() {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('Missing OPENAI_API_KEY');
  }
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
}

function percentage(numerator, denominator) {
  if (!denominator) {
    return '0.0%';
  }
  return `${((numerator / denominator) * 100).toFixed(1)}%`;
}

function parseJudgeLabel(text) {
  const normalized = String(text || '').toLowerCase();
  const labels = [
    'correct_refused',
    'incorrectly_answered',
    'hallucinated',
    'incorrect',
    'correct',
  ];

  for (const label of labels) {
    if (normalized.includes(label)) {
      return label;
    }
  }

  return normalized.trim().split(/\s+/)[0] || 'incorrect';
}

async function judgeAnswer({ question, expectedAnswer, actualAnswer, category }) {
  const openai = makeOpenAIClient();
  const labels =
    category === 'refusal'
      ? 'correct_refused, incorrectly_answered'
      : 'correct, incorrect, hallucinated';

  const prompt = [
    `Question: ${question}`,
    `Expected answer: ${expectedAnswer}`,
    `Actual answer: ${actualAnswer}`,
    `Category: ${category}`,
    `Classify using only one label from: ${labels}.`,
    category === 'refusal'
      ? 'Use correct_refused only if the answer clearly refused, declined, or flagged that the information is unavailable. Otherwise use incorrectly_answered.'
      : 'Use correct if the actual answer matches the expected answer in meaning. Use hallucinated if it confidently invents specifics or is clearly wrong relative to the expected answer. Use incorrect for other wrong answers.',
    'Return only the label.',
  ].join('\n\n');

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    temperature: 0,
    messages: [{ role: 'user', content: prompt }],
  });

  return parseJudgeLabel(completion.choices[0]?.message?.content);
}

async function main() {
  const evalPath = path.join(__dirname, 'eval-set.json');
  const outputPath = path.join(__dirname, 'eval-results.md');
  const stageLabel = process.argv[2] || 'After Table Handling';
  const raw = await fs.readFile(evalPath, 'utf8');
  const data = JSON.parse(raw);
  const questions = data.questions || [];

  const stats = {
    total: 0,
    hallucinated: 0,
    exact_lookup: { total: 0, correct: 0, incorrect: 0, hallucinated: 0, recallAt5: 0 },
    synthesis: { total: 0, correct: 0, incorrect: 0, hallucinated: 0, recallAt5: 0 },
    refusal: { total: 0, correctly_refused: 0, incorrectly_answered: 0 },
    incorrectly_refused: 0,
    citationMatches: 0,
    citationChecked: 0,
  };

  for (const item of questions) {
    console.log(`Evaluating ${item.id}: ${item.question}`);
    const result = await answerQuestion(item.question);

    stats.total += 1;

    const categoryStats = stats[item.category];
    categoryStats.total += 1;

    if (item.category === 'refusal') {
      if (result.refused) {
        categoryStats.correctly_refused += 1;
      } else {
        categoryStats.incorrectly_answered += 1;
      }
    } else {
      if (result.refused) {
        stats.incorrectly_refused += 1;
        categoryStats.incorrect += 1;
      } else {
        const judgeLabel = await judgeAnswer({
          question: item.question,
          expectedAnswer: item.expected_answer,
          actualAnswer: result.answer,
          category: item.category,
        });

        if (judgeLabel === 'correct') {
          categoryStats.correct += 1;
        } else if (judgeLabel === 'hallucinated') {
          categoryStats.hallucinated += 1;
          stats.hallucinated += 1;
        } else {
          categoryStats.incorrect += 1;
        }
      }

      if (!result.refused) {
        const expectedDocs = Array.isArray(item.source_doc) ? item.source_doc : [];
        const retrievedDocs = result.retrievedChunks.map((chunk) => chunk.source_doc);
        const citedDocs = Array.isArray(result.citedSources) ? result.citedSources : [];
        const sourceHit = retrievedDocs.some((doc) => expectedDocs.includes(doc));
        const citationHit = citedDocs.some((doc) => expectedDocs.includes(doc));

        if (sourceHit) {
          categoryStats.recallAt5 += 1;
        }

        if (item.category === 'exact_lookup' || item.category === 'synthesis') {
          stats.citationChecked += 1;
          if (citationHit) {
            stats.citationMatches += 1;
          }
        }
      }
    }
  }

  const answerableTotal = stats.exact_lookup.total + stats.synthesis.total;
  const refusalTotal = stats.refusal.total;
  const refusalAnswered = stats.refusal.correctly_refused + stats.incorrectly_refused;

  const exactAccuracy = percentage(stats.exact_lookup.correct, stats.exact_lookup.total);
  const synthesisAccuracy = percentage(stats.synthesis.correct, stats.synthesis.total);
  const refusalRate = percentage(stats.refusal.correctly_refused, refusalTotal);
  const overallRecallAt5 = percentage(
    stats.exact_lookup.recallAt5 + stats.synthesis.recallAt5,
    answerableTotal,
  );
  const hallucinationRate = percentage(stats.hallucinated, stats.total);
  const citationAccuracy = percentage(stats.citationMatches, stats.citationChecked);
  const refusalRecall = percentage(stats.refusal.correctly_refused, refusalTotal);
  const refusalPrecision = percentage(
    stats.refusal.correctly_refused,
    stats.refusal.correctly_refused + stats.incorrectly_refused,
  );

  const summaryLines = [
    `## ${stageLabel}`,
    '',
    `Run date: 2026-08-28`,
    '',
    '| Metric | Value |',
    '|---|---:|',
    `| Overall hallucination rate | ${stats.hallucinated}/${stats.total} (${hallucinationRate}) |`,
    `| Overall recall@5 | ${stats.exact_lookup.recallAt5 + stats.synthesis.recallAt5}/${answerableTotal} (${overallRecallAt5}) |`,
    `| Exact lookup accuracy | ${stats.exact_lookup.correct}/${stats.exact_lookup.total} (${exactAccuracy}) |`,
    `| Synthesis accuracy | ${stats.synthesis.correct}/${stats.synthesis.total} (${synthesisAccuracy}) |`,
    `| Citation accuracy | ${stats.citationMatches}/${stats.citationChecked} (${citationAccuracy}) |`,
    `| Refusal recall | ${stats.refusal.correctly_refused}/${refusalTotal} (${refusalRecall}) |`,
    `| Refusal precision | ${stats.refusal.correctly_refused}/${stats.refusal.correctly_refused + stats.incorrectly_refused} (${refusalPrecision}) |`,
    '',
    '| Category | Total | Correct | Incorrect | Hallucinated | Recall@5 | Accuracy / Refusal Rate |',
    '|---|---:|---:|---:|---:|---:|---:|',
    `| exact_lookup | ${stats.exact_lookup.total} | ${stats.exact_lookup.correct} | ${stats.exact_lookup.incorrect} | ${stats.exact_lookup.hallucinated} | ${stats.exact_lookup.recallAt5} | ${exactAccuracy} |`,
    `| synthesis | ${stats.synthesis.total} | ${stats.synthesis.correct} | ${stats.synthesis.incorrect} | ${stats.synthesis.hallucinated} | ${stats.synthesis.recallAt5} | ${synthesisAccuracy} |`,
    `| refusal | ${stats.refusal.total} | ${stats.refusal.correctly_refused} | ${stats.refusal.incorrectly_answered} | - | - | ${refusalRate} |`,
    '',
  ];

  const summary = summaryLines.join('\n');
  const existing = await fs
    .readFile(outputPath, 'utf8')
    .catch(() => '');
  const nextContent = existing ? `${existing.trimEnd()}\n\n${summary}` : summary;
  await fs.writeFile(outputPath, `${nextContent}\n`, 'utf8');

  console.log(summary);
}

if (require.main === module) {
  main().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}
