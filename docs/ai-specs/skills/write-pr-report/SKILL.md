---
name: write-pr-report
description: Generate a clean, human-readable Pull Request description from current repository changes. The output must be concise, structured, and reviewer-friendly, avoiding internal implementation noise.
---

# Write PR Report

## Purpose

Generate a Pull Request description that a human reviewer can quickly understand and trust.

The output must prioritize clarity, signal, and reviewability over completeness.

## Core Principles

1. The output is written for a human reviewer, not for documentation.
2. Be concise. Remove anything that does not help understanding the change.
3. Do not expose internal reasoning, planning artifacts, or implementation noise.
4. Prefer clarity over completeness.
5. Avoid AI-style verbosity and generic explanations.

## Strict Output Rules (Mandatory)

### 1. Keep it short

- Target length: approximately 150 to 300 words
- No long paragraphs
- No repetition

### 2. Only include relevant information

Include:
- What was added or changed
- Where, at a high level, such as files or layers
- Why it matters
- How it was validated, briefly

Exclude:
- Internal helper details
- Refactoring noise
- Planning artifacts such as `tasks_for_AI` or specs
- Implementation mechanics unless critical

### 3. Validation must be credible

Allowed:
- "All tests passing"
- "Integration tests added for X"
- "Regression tests confirm Y remains unchanged"

Forbidden:
- Listing raw commands
- Mentioning inability to reproduce tests
- Referencing local environment issues
- Saying "based on execution report"

### 4. Language constraints

- Use simple, direct English
- Avoid phrases like:
  - "The implementation introduces..."
  - "This change aims to..."
  - "Based on the current repository evidence..."
- Prefer:
  - "Adds"
  - "Fixes"
  - "Exposes"
  - "Keeps"

### 5. Structure is fixed

Always produce:

# <Short title>

## Summary
<2 to 3 sentences max>

## What Changed
- grouped by area (API, Services, Domain, Tests)

## Validation

### Automated
<short bullet list>

### Manual
<short bullet list or "None">

## Reviewer Notes
<where to look>

## Risks
<only real risks>

## Rollback
<one short sentence>

Do not add extra sections.

### 6. No speculation or critique

- Do not question the implementation
- Do not highlight risks unless they are obvious and relevant
- Do not audit the code
- This is a description, not a review

### 7. No internal artifacts

Never mention:
- `tasks_for_AI`
- planning docs
- "execution report"
- "this session"
- "AI-generated"

## Process

1. Inspect repository changes using git diff and git status.
2. Group changes by responsibility: API, Services, Domain, Tests.
3. Extract the intent of the change.
4. Generate the PR description following the strict rules above.

## Output

Return only the PR description in Markdown.

No explanations. No meta commentary.
