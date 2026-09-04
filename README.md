# Solar RAG Pricing Assistant

This project answers solar pricing questions from the supplied source documents using hybrid retrieval. Answers include source citations or a documented refusal when the retrieved material is insufficient.

## Verification

Run the citation checker with:

```sh
npm test
```

The full evaluation uses the configured live OpenAI and Supabase services:

```sh
npm run eval:hybrid
```

Fresh results are written to [docs/eval-results.md](docs/eval-results.md). Each run records its timestamp, Git commit, and deployment provenance. The current clean run should be compared with the previously reported hybrid numbers of 93.3% recall@5, 73.3% synthesis accuracy, and 0.0% citation accuracy.

The clean run was measured after a new production deployment and compared with the prior production deployment. Retrieval quality and citation accuracy showed no meaningful change: recall@5 remains 93.3%, and citation accuracy remains 0.0% (0/28). The citation checker itself is covered by three unit cases, but the deployed model still emits no matching citations in this eval.