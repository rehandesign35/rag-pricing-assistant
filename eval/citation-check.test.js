const assert = require('node:assert/strict');
const { citationMatchesExpected, extractCitationSources } = require('./citation-check');

const cases = [
  {
    response: 'The XR-400 panel is 400W. [source: spec-sheets.md]',
    expectedDocs: ['spec-sheets.md'],
    expectedSources: ['spec-sheets.md'],
    expectedMatch: true,
  },
  {
    response: 'The package costs $43,700. [SOURCE: pricing-table.md] It includes storage. [source: spec-sheets.md ]',
    expectedDocs: ['pricing-table.md'],
    expectedSources: ['pricing-table.md', 'spec-sheets.md'],
    expectedMatch: true,
  },
  {
    response: 'I do not have enough information to answer this accurately.',
    expectedDocs: ['financing-options.md'],
    expectedSources: [],
    expectedMatch: false,
  },
];

for (const testCase of cases) {
  assert.deepEqual(extractCitationSources(testCase.response), testCase.expectedSources);
  assert.equal(
    citationMatchesExpected(testCase.response, testCase.expectedDocs),
    testCase.expectedMatch,
  );
}

console.log(`Citation checker passed ${cases.length} cases.`);