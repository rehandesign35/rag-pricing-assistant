const fs = require('fs/promises');
const path = require('path');
require('dotenv').config();
const { answerQuestion } = require('../api/answer');

async function pickRepresentativeQuestions() {
  const evalPath = path.join(__dirname, 'eval-set.json');
  const raw = await fs.readFile(evalPath, 'utf8');
  const data = JSON.parse(raw);
  const questions = data.questions || [];

  const exactLookup = questions.find((item) => item.category === 'exact_lookup');
  const synthesis = questions.find((item) => item.category === 'synthesis');
  const refusal = questions.find((item) => item.category === 'refusal');

  return [exactLookup, synthesis, refusal].filter(Boolean);
}

async function main() {
  const items = await pickRepresentativeQuestions();

  for (const item of items) {
    console.log('---');
    console.log(`ID: ${item.id}`);
    console.log(`Category: ${item.category}`);
    console.log(`Question: ${item.question}`);
    console.log(`Expected source_doc: ${JSON.stringify(item.source_doc)}`);

    const result = await answerQuestion(item.question);

    console.log(`Raw answer: ${result.rawAnswer}`);
    console.log(`citedSources: ${JSON.stringify(result.citedSources)}`);
    console.log(`question.source_doc: ${JSON.stringify(item.source_doc)}`);
  }
}

if (require.main === module) {
  main().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}
