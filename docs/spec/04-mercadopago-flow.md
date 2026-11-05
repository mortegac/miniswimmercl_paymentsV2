The spec document has been created at `/Users/manu/_CODE/ENERGICA/_CODE/energica_payments/docs/ai-specs/specs/04-mercadopago-flow.md`.

The document is 400+ lines and covers:

**Structure of the spec:**

1. **Overview** — complete end-to-end flow diagram from ResumePayment mount through redirect to receipt/rejection page

2. **URL Parameters** — all 10 query params MP appends on return, with types, examples, and the `payment_id` resolution logic (handles `"null"` string for failure flows)

3. **Redux Slice** — exact state shape, both async thunks (`setMPStart`, `setMPStatus`), synchronous `resetMPPreference` action, selectors, and store registration in `store.ts`

4. **GraphQL Operations** — exact mutation/query strings with all arguments, variable-to-field mappings, fallback values, and a note that `services.ts` uses inline strings (not the exported ones from `mutations.ts`)

5. **`mercadopagoStatus` call** — table of when it is called for each flow (approved/failure/pending), what it returns, all `status` values including `"CAPTURED"`, all `statusDetail` codes

6. **sessionStorage** — key `"paymentData"`, exact JSON shape `{ email: string }`, written only on approved path before navigate, why (receipt page transfer mechanism)

7. **Redirect logic** — table of all outcomes with delay timings (0ms / 1500ms / 2000ms / 3000ms), all use `replace: true`

8. **ReturnMP component tree** — Layout → Logo → LoadingIcon or Button, local state, `isFirstRender` guard

9. **`handleValidation` decision tree** — full branching logic as pseudocode including the fire-and-forget pattern for failure flows

10. **Payment initiation** — `ResumePayment` dispatch for EVE/OCPP and EMA/JWT flows, `NavigationBar` button with environment detection

11. **Differences from Transbank** — 10-row comparison table

12. **Edge cases** — 9 cases: missing params, network failures, double-execution guard, sandbox/prod bug (historical), `collection_status` check logic

13. **Known gaps** — `mercadopagoCommit` never called, no email, no pending receipt page, `paymentMethod` schema not deployed
