# Agent Verification Guide

## Purpose

Use this document to choose the right verification path for a task without rediscovering scripts, services, or test suites.

This is not a catalog of every command in the repository.
It is a curated guide for:

- fast local checks,
- integration validation,
- end-to-end validation,
- debugging retrieval and streaming behavior.

Use the cheapest verification that can detect the risk introduced by the task.

## Verification Strategy

Prefer this order:

1. unit tests for local contract/rule changes,
2. integration tests for multi-layer or repository/API behavior,
3. end-to-end tests for real routing, real vector DB, real LLM, or final user-visible behavior,
4. manual smoke/debug commands only when tests are too indirect or when you need to inspect live payloads.

Do not default to E2E for every change.
Do use E2E when prompt behavior, retrieval classification, streaming parity, or vector DB behavior is the real success criterion.

## Quick Map

### I changed pure logic or parsing

Use:

- `poetry run pytest -q --no-cov tests/unit`

Best for:

- structured JSON parsing,
- citation normalization,
- context building,
- answer contract rules,
- stream extraction behavior.

### I changed service wiring, repositories, or API contracts

Use:

- `poetry run pytest -q --no-cov tests/integration`

Best for:

- API response shape,
- repository/service interaction,
- Qdrant repository behavior,
- error handler behavior,
- indexing pipeline integration.

### I changed prompt behavior, routing, or final model behavior

Use:

- `poetry run pytest -q --no-cov tests/e2e/test_answer_routing_matrix_qdrant_real_corpus.py`

Best for:

- `retrieval` vs `llm_knowledge` vs `none`,
- real Qdrant retrieval,
- real LLM classification,
- validating prompt changes against a controlled corpus.

### I changed `/query-stream`, prompt parsing, or final stream metadata

Use:

- `poetry run pytest -q --no-cov tests/e2e/test_query_stream_parity_qdrant_real_corpus.py`

Best for:

- parity between `/query` and `/query-stream`,
- preventing cases where streamed text is correct but `done` metadata is wrong,
- retrieval/knowledge/none parity at endpoint level.

## Recommended Commands By Goal

### Verify full unit safety net

```bash
poetry run pytest -q --no-cov tests/unit
```

Use when:

- touching domain rules,
- changing parsing logic,
- refactoring services internally.

### Verify API + repository integration

```bash
poetry run pytest -q --no-cov tests/integration
```

Use when:

- changing route behavior,
- changing repository contracts,
- changing integration fixtures,
- changing Qdrant/Pinecone selection logic.

### Verify routing matrix with real LLM and real Qdrant

```bash
poetry run pytest -q --no-cov tests/e2e/test_answer_routing_matrix_qdrant_real_corpus.py
```

Use when:

- changing `qa_answer.yaml`,
- changing `AnswerService`,
- changing retrieval classification,
- changing how citations are validated.

Notes:

- uses Qdrant real,
- creates isolated collection,
- indexes `evals/manuals/tesa_flexo_printing_troubleshooting_guide.md`,
- calls the real LLM.

### Verify `/query` and `/query-stream` parity end to end

```bash
poetry run pytest -q --no-cov tests/e2e/test_query_stream_parity_qdrant_real_corpus.py
```

Use when:

- changing `StreamAnswerService`,
- changing structured answer parsing,
- changing stream finalization,
- changing SSE semantics,
- changing prompt output contract.

Notes:

- primary guardrail for stream `done` regressions,
- covers `retrieval`, `llm_knowledge`, and `none`.

### Run the full E2E subtree

```bash
poetry run pytest -q --no-cov tests/e2e
```

Use when:

- you changed both routing and stream behavior,
- you want confidence in real end-to-end behavior before handing off.

Avoid for:

- routine fast feedback,
- small local refactors with no behavior change.

## Manual / Debug Checks

### Smoke test `POST /query` against a running API

```bash
poetry run python scripts/smoke_test_query.py --base-url http://localhost:8001 --question "cual es el objetivo de FIRST?"
```

Use when:

- the API is already running,
- you want a quick HTTP contract check.

Warning:

- this script is older than the current public contract and may need maintenance when response keys change.
- prefer integration/API tests for canonical verification.

### Call `/query` directly with curl

Example:

```bash
curl -s -X POST "http://127.0.0.1:8001/query" \
  -H "Content-Type: application/json" \
  -d '{"question":"¿Cuáles son las posibles causas de que el borde de la plancha se levante durante la impresión?"}'
```

Use when:

- you need the raw HTTP response quickly,
- you are debugging API-only behavior.

### Inspect `/query-stream` raw SSE

Use a short local Python snippet with `TestClient` or a real client against the running API.

Best for:

- checking raw `delta` events,
- verifying final `done`,
- reproducing frontend-reported stream bugs without using the frontend.

### Run the eval pipeline for one manual/document id

```bash
PYTHONPATH=src poetry run python -m flexo_app.evals.pipeline --document-id <document_id>
```

Use when:

- validating a document-scoped retrieval dataset,
- checking retrieval quality for a specific manual,
- reproducing eval behavior outside tests.

Optional:

```bash
PYTHONPATH=src poetry run python -m flexo_app.evals.pipeline --document-id <document_id> --skip-index
```

### Parse one markdown/PDF input quickly

```bash
poetry run python scripts/parse_md_print.py "/absolute/path/to/document.pdf"
```

Use when:

- debugging parsing quality,
- checking whether the source material was extracted correctly before indexing.

### Parse a folder in parallel

```bash
poetry run python scripts/parse_folder_parallel.py "/absolute/path/to/folder" --pattern "*.pdf" --concurrency 4
```

Use when:

- validating parsing over a batch of documents.

## Vector DB Verification Notes

### Qdrant

For the real-vector-db verification paths in this guide, use Qdrant.

In practice, this includes:

- integration tests that exercise a real vector database,
- end-to-end tests with real retrieval behavior,
- isolated corpus validation intended to be reproducible.

Start locally:

```bash
docker compose -f docker-compose.qdrant.yml up -d
```

Health check:

```bash
curl http://localhost:6333/collections
```

### Pinecone


Pinecone can still be useful for production-like manual checks, but the canonical real-vector-db verification paths documented here use Qdrant.

## When To Use Service-Level Verification

Prefer service-level verification or debugging when the API transport is not the thing under test.

Useful inspection points:

- `AnswerService.retrieve_top_chunks(...)` to understand why a question classified as `retrieval`,
- `AnswerService.answer(...)` to inspect final single-pass behavior without SSE,
- `StreamAnswerService.stream(...)` to debug stream finalization or SSE semantics.

Service-level verification is especially useful when:

- frontend reports a mismatch,
- API transport is probably not the root cause,
- you need to see intermediate behavior fast.

## Anti-patterns

Do not:

- use E2E as the first and only debugging tool for every task,
- rely only on frontend manual tests for stream bugs,
- trust outdated smoke scripts as canonical contract validators,
- duplicate a test’s purpose manually if a stable automated suite already exists.
