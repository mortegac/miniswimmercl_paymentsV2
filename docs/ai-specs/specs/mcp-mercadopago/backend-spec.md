# Backend Implementation Plan: MercadoPago Integration

**Version:** 1.0
**Project:** eve-backend-v2 (`/Users/manu/_CODE/ENERGICA/_CODE/EVE/BACKEND/eve-backend-v2`)
**Status:** Ready to implement

---

## Overview

This plan adds two new AppSync resolvers to the eve-backend-v2 Amplify Gen2 project:

- `mercadopagoStart` — mutation that creates a MercadoPago Checkout Pro preference and returns the init point URL
- `mercadopagoStatus` — query that fetches a payment's current status from MercadoPago

The pattern follows the existing `webpayStart` / `webpayStatus` resolvers exactly. No MercadoPago SDK is used in Lambda — all calls are made via the native `fetch()` API against the MercadoPago REST endpoints.

---

## 1. Schema additions — `amplify/data/resolvers.schema.ts`

**File to modify:** `/amplify/data/resolvers.schema.ts`

### 1.1 Add imports at the top of the file

Add two import lines alongside the existing resolver imports:

```typescript
import { mercadopagoStart } from "../resolvers/mercadopagoStart/resource";
import { mercadopagoStatus } from "../resolvers/mercadopagoStatus/resource";
```

### 1.2 Add `mercadopagoStart` mutation to the schema

Insert after the `webpayStatus` mutation block and before `controlEve`:

```typescript
mercadopagoStart: a
  .mutation()
  .arguments({
    amount: a.float().required(),
    glosa: a.string().required(),
    userId: a.string().required(),
    idEve: a.string(),
    stationId: a.string(),
    chargingHours: a.float(),
    type: a.enum(["EVE", "EMA", "OCPP"]),
    externalReference: a.string().required(),
  })
  .returns(
    a.customType({
      preferenceId: a.string(),
      initPoint: a.string(),
      sandboxInitPoint: a.string(),
    }),
  )
  .handler(a.handler.function(mercadopagoStart)),
```

### 1.3 Add `mercadopagoStatus` query to the schema

Insert after the `mercadopagoStart` block:

```typescript
mercadopagoStatus: a
  .query()
  .arguments({
    paymentId: a.string().required(),
  })
  .returns(
    a.customType({
      paymentId: a.string(),
      status: a.string(),
      statusDetail: a.string(),
      amount: a.float(),
      glosa: a.string(),
      externalReference: a.string(),
      payerEmail: a.string(),
      paymentMethodId: a.string(),
      dateApproved: a.string(),
    }),
  )
  .handler(a.handler.function(mercadopagoStatus)),
```

### 1.4 Add resources to authorization block

The `.authorization()` call at the bottom of the schema does not need changes — the existing `allow.guest()`, `allow.authenticated()`, and `allow.publicApiKey()` rules already cover these new operations.

---

## 2. `mercadopagoStart` resolver

### 2.1 `amplify/resolvers/mercadopagoStart/resource.ts`

**Full file content:**

```typescript
import { defineFunction } from "@aws-amplify/backend";

export const mercadopagoStart = defineFunction({
  name: "mercadopagoStart-gen2",
  entry: "./handler.ts",
  environment: {
    ENV: "prod",
  },
  timeoutSeconds: 30,
  runtime: 22,
});
```

Notes:
- `ENV` is set here as a default. The actual `prod`/`dev` distinction and the sensitive MP tokens are applied in `backend.ts` via `addEnvironment()` — same pattern as `webpayStart`.
- Runtime `22` targets Node.js 22.x, matching all existing resolvers.

### 2.2 `amplify/resolvers/mercadopagoStart/handler.ts`

**Full file content:**

```typescript
import { env } from "$amplify/env/mercadopagoStart-gen2";
import { ResolversTypes } from "../../data/resolvers.schema";

// MercadoPago Checkout Pro preference creation
// Docs: https://www.mercadopago.com.ar/developers/en/reference/preferences/resource

interface MercadopagoPreferenceResponse {
  id: string;
  init_point: string;
  sandbox_init_point: string;
}

export const handler: ResolversTypes["mercadopagoStart"]["functionHandler"] =
  async (event) => {
    console.log("mercadopagoStart event:", JSON.stringify(event));

    const ENVIRONMENT: string = env.ENV || "qa";
    console.log("running in environment:", ENVIRONMENT);

    if (!(ENVIRONMENT === "prod" || ENVIRONMENT === "qa")) {
      const message =
        "failed to load the environment " + JSON.stringify(ENVIRONMENT);
      console.error(message);
      throw message;
    }

    if (event.arguments === undefined || event.arguments === null) {
      const message = "event arguments not found";
      console.error(message);
      throw message;
    }

    const {
      amount,
      glosa,
      userId,
      externalReference,
      chargingHours,
      type,
    } = event.arguments;

    const idEve = event.arguments.idEve;
    const stationId = event.arguments.stationId;

    // Resolve which access token to use based on environment
    const accessToken =
      ENVIRONMENT === "prod"
        ? env.MP_ACCESS_TOKEN
        : env.MP_ACCESS_TOKEN_TEST;

    if (!accessToken) {
      const message =
        "MercadoPago access token is not configured for environment: " +
        ENVIRONMENT;
      console.error(message);
      throw message;
    }

    const FRONTEND_URL = env.FRONTEND_URL || "http://localhost:5173";
    const BACKEND_WEBHOOK_URL = env.BACKEND_WEBHOOK_URL || "";

    // Validate required fields
    if (!amount || amount <= 0) {
      const message = "amount must be a positive number, received: " + amount;
      console.error(message);
      throw message;
    }

    if (!glosa || glosa.trim() === "") {
      const message = "glosa is required";
      console.error(message);
      throw message;
    }

    if (!userId || userId.trim() === "") {
      const message = "userId (payer email) is required";
      console.error(message);
      throw message;
    }

    if (!externalReference || externalReference.trim() === "") {
      const message = "externalReference is required";
      console.error(message);
      throw message;
    }

    if (!(type === "EMA" || type === "EVE" || type === "OCPP")) {
      const message =
        "type of transaction is invalid: " + JSON.stringify(type);
      console.error(message);
      throw message;
    }

    // Build the preference payload
    // Reference: POST https://api.mercadopago.com/checkout/preferences
    const preferenceBody = {
      items: [
        {
          id: externalReference,
          title: glosa,
          quantity: 1,
          unit_price: amount,
          currency_id: "CLP",
        },
      ],
      payer: {
        email: userId,
      },
      back_urls: {
        success: `${FRONTEND_URL}/return-mp?status=approved`,
        failure: `${FRONTEND_URL}/return-mp?status=failure`,
        pending: `${FRONTEND_URL}/return-mp?status=pending`,
      },
      auto_return: "approved",
      external_reference: externalReference,
      notification_url: BACKEND_WEBHOOK_URL
        ? `${BACKEND_WEBHOOK_URL}/mp-webhook`
        : undefined,
      statement_descriptor: "ENERGICA",
      binary_mode: true,
      // Additional metadata for traceability
      metadata: {
        type,
        idEve: idEve || null,
        stationId: stationId || null,
        chargingHours: chargingHours || null,
      },
    };

    console.log(
      "Creating MercadoPago preference:",
      JSON.stringify({ ...preferenceBody, payer: { email: "***" } }),
    );

    let preferenceResponse: MercadopagoPreferenceResponse;
    try {
      const response = await fetch(
        "https://api.mercadopago.com/checkout/preferences",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify(preferenceBody),
        },
      );

      if (!response.ok) {
        const errorBody = await response.text();
        const message =
          "MercadoPago API error " +
          response.status +
          ": " +
          errorBody;
        console.error(message);
        throw message;
      }

      preferenceResponse =
        (await response.json()) as MercadopagoPreferenceResponse;
    } catch (error) {
      if (typeof error === "string") throw error;
      const message =
        "failed to create MercadoPago preference: " +
        JSON.stringify(error);
      console.error(message);
      throw message;
    }

    console.log(
      "MercadoPago preference created:",
      JSON.stringify({
        id: preferenceResponse.id,
        init_point: preferenceResponse.init_point,
        sandbox_init_point: preferenceResponse.sandbox_init_point,
      }),
    );

    return {
      preferenceId: preferenceResponse.id,
      initPoint: preferenceResponse.init_point,
      sandboxInitPoint: preferenceResponse.sandbox_init_point,
    };
  };
```

**Key design decisions:**

- Errors are thrown as strings (not `Error` objects) — exactly matching the `webpayStart` / `webpayStatus` pattern.
- The token selection (`MP_ACCESS_TOKEN` vs `MP_ACCESS_TOKEN_TEST`) is driven by the `ENV` environment variable, avoiding any logic that depends on reading the access token prefix.
- `binary_mode: true` ensures only `approved` or `rejected` statuses are returned — no `pending` state, simplifying the frontend flow.
- `notification_url` is omitted when `BACKEND_WEBHOOK_URL` is empty, which is safe for local dev where no public webhook endpoint exists.
- `amount` is sent as-is (a `Float`). MercadoPago for Chile (CLP) expects integer pesos — the frontend is responsible for sending an integer-valued float (e.g., `5000.0`). The field type is `a.float()` in the schema to match the existing `webpayStart` pattern where `amount` is `a.integer()` — see note in Section 5 below.
- `fetch()` is available natively in Node.js 18+; since runtime is 22, no `node-fetch` import is needed.
- The `$amplify/env/mercadopagoStart-gen2` import is the Amplify Gen2 typed env mechanism — the function name in `defineFunction` must match the suffix after `$amplify/env/`.

---

## 3. `mercadopagoStatus` resolver

### 3.1 `amplify/resolvers/mercadopagoStatus/resource.ts`

**Full file content:**

```typescript
import { defineFunction } from "@aws-amplify/backend";

export const mercadopagoStatus = defineFunction({
  name: "mercadopagoStatus-gen2",
  entry: "./handler.ts",
  environment: {
    ENV: "prod",
  },
  timeoutSeconds: 30,
  runtime: 22,
});
```

### 3.2 `amplify/resolvers/mercadopagoStatus/handler.ts`

**Full file content:**

```typescript
import { env } from "$amplify/env/mercadopagoStatus-gen2";
import { ResolversTypes } from "../../data/resolvers.schema";

// MercadoPago Payment Status
// Docs: https://www.mercadopago.com.ar/developers/en/reference/payments/resource

interface MercadopagoPaymentResponse {
  id: number;
  status: string;                  // "approved" | "rejected" | "pending" | "cancelled"
  status_detail: string;           // e.g. "accredited"
  transaction_amount: number;
  description: string;             // maps to glosa
  external_reference: string;
  payer: {
    email: string;
  };
  payment_method_id: string;       // e.g. "visa", "account_money"
  date_approved: string | null;    // ISO 8601 or null when not approved
}

export const handler: ResolversTypes["mercadopagoStatus"]["functionHandler"] =
  async (event) => {
    console.log("mercadopagoStatus event:", JSON.stringify(event));

    const ENVIRONMENT: string = env.ENV || "qa";
    console.log("running in environment:", ENVIRONMENT);

    if (event.arguments === undefined || event.arguments === null) {
      const message = "event arguments not found";
      console.error(message);
      throw message;
    }

    const { paymentId } = event.arguments;

    if (!paymentId || paymentId.trim() === "") {
      const message = "paymentId is required";
      console.error(message);
      throw message;
    }

    // Use sandbox token in non-prod so sandbox payment IDs resolve correctly
    const accessToken =
      ENVIRONMENT === "prod"
        ? env.MP_ACCESS_TOKEN
        : env.MP_ACCESS_TOKEN_TEST;

    if (!accessToken) {
      const message =
        "MercadoPago access token is not configured for environment: " +
        ENVIRONMENT;
      console.error(message);
      throw message;
    }

    console.log("Fetching MercadoPago payment status for paymentId:", paymentId);

    let paymentData: MercadopagoPaymentResponse;
    try {
      const response = await fetch(
        `https://api.mercadopago.com/v1/payments/${paymentId}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
      );

      if (!response.ok) {
        const errorBody = await response.text();
        const message =
          "MercadoPago payments API error " +
          response.status +
          " for paymentId " +
          paymentId +
          ": " +
          errorBody;
        console.error(message);
        throw message;
      }

      paymentData =
        (await response.json()) as MercadopagoPaymentResponse;
    } catch (error) {
      if (typeof error === "string") throw error;
      const message =
        "failed to fetch MercadoPago payment status: " +
        JSON.stringify(error);
      console.error(message);
      throw message;
    }

    console.log(
      "MercadoPago payment data:",
      JSON.stringify({
        id: paymentData.id,
        status: paymentData.status,
        status_detail: paymentData.status_detail,
        transaction_amount: paymentData.transaction_amount,
        external_reference: paymentData.external_reference,
      }),
    );

    return {
      paymentId: String(paymentData.id),
      status: paymentData.status,
      statusDetail: paymentData.status_detail,
      amount: paymentData.transaction_amount,
      glosa: paymentData.description,
      externalReference: paymentData.external_reference,
      payerEmail: paymentData.payer?.email ?? "",
      paymentMethodId: paymentData.payment_method_id,
      dateApproved: paymentData.date_approved ?? "",
    };
  };
```

**Key design decisions:**

- `paymentData.id` is a `number` in the MP API response — it is coerced to `string` via `String()` before returning, since the schema field is `a.string()`.
- `date_approved` can be `null` when a payment is not yet approved — the handler maps `null` to `""` (empty string) rather than returning `null`, to match the `a.string()` non-nullable field type.
- The `payer.email` field uses optional chaining with a fallback, since pending/cancelled payments may have an anonymous payer object.
- No GraphQL client (`generateClient`) is instantiated here because this resolver only reads from MercadoPago — it does not write to the EVE DynamoDB tables. If future requirements need to update a `PaymentTransaction` record upon status fetch, add the `Amplify.configure()` + `generateClient()` block following the `webpayStatus` handler pattern exactly.

---

## 4. `amplify/backend.ts` changes

**File to modify:** `/amplify/backend.ts`

### 4.1 Add imports (alongside existing resolver imports)

```typescript
import { mercadopagoStart } from "./resolvers/mercadopagoStart/resource";
import { mercadopagoStatus } from "./resolvers/mercadopagoStatus/resource";
```

### 4.2 Add to `defineBackend()` call

```typescript
const backend = defineBackend({
  auth,
  data,
  storage,
  calculateEvePricing,
  calculateMonthlyAverage,
  canBuildingCharge,
  controlEve,
  chargeEventHandler,
  heartbeatHandler,
  recalculateEveTransactions,
  sendEmailResolver,
  updateEveLogHandler,
  verifyNetworkHealth,
  webpayCommit,
  webpayStatus,
  webpayStart,
  mercadopagoStart,   // ADD THIS
  mercadopagoStatus,  // ADD THIS
});
```

### 4.3 Add to `allFunctions` array

```typescript
const allFunctions = [
  // ... existing entries ...
  backend.webpayCommit,
  backend.webpayStatus,
  backend.webpayStart,
  backend.mercadopagoStart,   // ADD THIS
  backend.mercadopagoStatus,  // ADD THIS
];
```

This ensures the `environment` and `LOG_LEVEL` env vars applied by the `allFunctions.forEach(...)` loop are also set on the new resolvers.

### 4.4 Add environment variables in the production/development branches

Inside the `if (isProduction) { ... } else { ... }` block, add the MP-specific env vars for both branches:

```typescript
if (isProduction) {
  // ... existing prod config ...

  // MercadoPago production credentials
  backend.mercadopagoStart.addEnvironment("MP_ACCESS_TOKEN", process.env.MP_ACCESS_TOKEN || "");
  backend.mercadopagoStart.addEnvironment("MP_ACCESS_TOKEN_TEST", "");
  backend.mercadopagoStart.addEnvironment("FRONTEND_URL", "https://pagos.energica.city");
  backend.mercadopagoStart.addEnvironment("BACKEND_WEBHOOK_URL", "https://pagos.energica.city");

  backend.mercadopagoStatus.addEnvironment("MP_ACCESS_TOKEN", process.env.MP_ACCESS_TOKEN || "");
  backend.mercadopagoStatus.addEnvironment("MP_ACCESS_TOKEN_TEST", "");

} else {
  // ... existing dev config ...

  // MercadoPago sandbox credentials
  backend.mercadopagoStart.addEnvironment("MP_ACCESS_TOKEN", "");
  backend.mercadopagoStart.addEnvironment("MP_ACCESS_TOKEN_TEST", process.env.MP_ACCESS_TOKEN_TEST || "");
  backend.mercadopagoStart.addEnvironment("FRONTEND_URL", "http://localhost:5173");
  backend.mercadopagoStart.addEnvironment("BACKEND_WEBHOOK_URL", "");

  backend.mercadopagoStatus.addEnvironment("MP_ACCESS_TOKEN", "");
  backend.mercadopagoStatus.addEnvironment("MP_ACCESS_TOKEN_TEST", process.env.MP_ACCESS_TOKEN_TEST || "");
}
```

> **IMPORTANT:** Never hardcode actual token values in `backend.ts`. The values above read from `process.env` which is resolved at deploy time from the CI/CD environment or Amplify Console environment variable configuration. See Section 5 for where these are set.

---

## 5. Environment variables

### 5.1 Variables consumed by the Lambda functions

| Variable | Used in | Description |
|---|---|---|
| `ENV` | Both resolvers | `"prod"` or `"qa"` — controls which MP token is active |
| `MP_ACCESS_TOKEN` | Both resolvers | Production access token from the MP developer panel |
| `MP_ACCESS_TOKEN_TEST` | Both resolvers | Sandbox/test access token from the MP developer panel |
| `FRONTEND_URL` | `mercadopagoStart` only | Base URL for `back_urls` (e.g. `https://pagos.energica.city`) |
| `BACKEND_WEBHOOK_URL` | `mercadopagoStart` only | Base URL for `notification_url` (can be empty in dev) |
| `environment` | Both (via forEach loop) | Injected automatically by `allFunctions.forEach` in backend.ts |
| `LOG_LEVEL` | Both (via forEach loop) | Injected automatically by `allFunctions.forEach` in backend.ts |

### 5.2 Where to set the secret values

**Option A — Amplify Console (recommended for Amplify-hosted backends):**

In the AWS Amplify Console, go to App Settings > Environment Variables and add:
- `MP_ACCESS_TOKEN` = `<production access token>`
- `MP_ACCESS_TOKEN_TEST` = `<test/sandbox access token>`

These are then available as `process.env.MP_ACCESS_TOKEN` at deploy time when `backend.ts` runs its CDK synthesis.

**Option B — CI/CD environment (GitHub Actions, etc.):**

Set the same variables as CI secrets. The `amplify deploy` step will have them in `process.env` during synthesis.

**Option C — AWS Secrets Manager (most secure, optional):**

If the project moves to Secrets Manager, the `addEnvironment()` calls in `backend.ts` would be replaced with a Secrets Manager lookup at Lambda startup. This is not needed for the initial implementation.

### 5.3 How to obtain the tokens

1. Go to https://www.mercadopago.com.ar/developers/panel/app
2. Create or select the application for this project
3. Under "Credentials":
   - Copy the **Test access token** → `MP_ACCESS_TOKEN_TEST`
   - Copy the **Production access token** → `MP_ACCESS_TOKEN`
4. For Chile, confirm the application is configured with Site ID `MLC`

### 5.4 Note on `amount` field type

The schema uses `a.float()` for `amount` in `mercadopagoStart` (matching the spec). MercadoPago for Chile (CLP) expects `unit_price` to be an integer (pesos have no decimal subdivision). The frontend must always send integer-valued amounts (e.g., `5000.0`, not `4999.99`). This is a frontend responsibility and does not require a schema type change.

---

## 6. MercadoPago API reference

### 6.1 Create Checkout Pro preference

**Endpoint:**
```
POST https://api.mercadopago.com/checkout/preferences
```

**Headers:**
```
Authorization: Bearer {MP_ACCESS_TOKEN}
Content-Type: application/json
```

**Request body (exact shape used by the handler):**
```json
{
  "items": [
    {
      "id": "{externalReference}",
      "title": "{glosa}",
      "quantity": 1,
      "unit_price": 5000,
      "currency_id": "CLP"
    }
  ],
  "payer": {
    "email": "{userId}"
  },
  "back_urls": {
    "success": "{FRONTEND_URL}/return-mp?status=approved",
    "failure": "{FRONTEND_URL}/return-mp?status=failure",
    "pending": "{FRONTEND_URL}/return-mp?status=pending"
  },
  "auto_return": "approved",
  "external_reference": "{externalReference}",
  "notification_url": "{BACKEND_WEBHOOK_URL}/mp-webhook",
  "statement_descriptor": "ENERGICA",
  "binary_mode": true,
  "metadata": {
    "type": "EVE",
    "idEve": "{idEve}",
    "stationId": null,
    "chargingHours": 60
  }
}
```

**Successful response (200/201):**
```json
{
  "id": "1234567890-abcdef12-3456-7890-abcd-ef1234567890",
  "init_point": "https://www.mercadopago.cl/checkout/v1/redirect?pref_id=1234567890-...",
  "sandbox_init_point": "https://sandbox.mercadopago.cl/checkout/v1/redirect?pref_id=1234567890-...",
  "date_created": "2024-01-15T10:30:00.000-03:00",
  "...": "other fields not consumed by our handler"
}
```

**The handler reads:**
- `id` → returned as `preferenceId`
- `init_point` → returned as `initPoint`
- `sandbox_init_point` → returned as `sandboxInitPoint`

**Error responses:**

| HTTP Status | Meaning |
|---|---|
| 400 | Bad request — malformed body, invalid `unit_price` (must be > 0), missing required field |
| 401 | Invalid or expired access token |
| 403 | App not authorized for the requested operation |
| 422 | Unprocessable entity — business rule violation (e.g. invalid `currency_id` for site) |

All non-2xx responses cause the handler to throw a string containing the status code and the raw error body from MP.

### 6.2 Get payment status

**Endpoint:**
```
GET https://api.mercadopago.com/v1/payments/{paymentId}
```

**Headers:**
```
Authorization: Bearer {MP_ACCESS_TOKEN}
```

**No request body.**

**Successful response (200):**
```json
{
  "id": 98765432,
  "status": "approved",
  "status_detail": "accredited",
  "transaction_amount": 5000,
  "description": "1 hr de carga electrica Estacionamiento A1",
  "external_reference": "buy-order-12345",
  "payer": {
    "id": "987654321",
    "email": "user@example.com",
    "identification": { "type": "RUT", "number": "12345678-9" }
  },
  "payment_method_id": "visa",
  "date_approved": "2024-01-15T10:35:00.000-03:00",
  "date_created": "2024-01-15T10:30:00.000-03:00"
}
```

**Status values:**

| `status` | `status_detail` examples | Meaning |
|---|---|---|
| `approved` | `accredited` | Payment accepted and settled |
| `rejected` | `cc_rejected_insufficient_amount`, `cc_rejected_bad_filled_card_number` | Payment rejected |
| `pending` | `pending_waiting_payment` | Awaiting payment (not possible with `binary_mode: true`) |
| `cancelled` | `expired` | Preference expired without payment |

**The handler maps to:**
- `id` (number) → `paymentId` (string, via `String()`)
- `status` → `status`
- `status_detail` → `statusDetail`
- `transaction_amount` → `amount`
- `description` → `glosa`
- `external_reference` → `externalReference`
- `payer.email` → `payerEmail`
- `payment_method_id` → `paymentMethodId`
- `date_approved` → `dateApproved` (null mapped to `""`)

---

## 7. `back_urls` — return flow to `/return-mp`

### 7.1 URL structure sent to MercadoPago

The preference is created with these exact `back_urls`:

```
success: {FRONTEND_URL}/return-mp?status=approved
failure: {FRONTEND_URL}/return-mp?status=failure
pending: {FRONTEND_URL}/return-mp?status=pending
```

With `auto_return: "approved"`, MercadoPago automatically redirects the browser to the `success` URL when the payment is approved, without requiring the user to click a button. For `failure` and `pending`, the user sees a MP result screen with a "Return to site" button.

### 7.2 Query parameters appended by MercadoPago upon redirect

When MercadoPago redirects to a `back_url`, it appends these query parameters:

| Parameter | Type | Description |
|---|---|---|
| `collection_id` | string | Same as `payment_id` |
| `collection_status` | string | `"approved"`, `"rejected"`, etc. |
| `payment_id` | string | Numeric ID of the payment — use this to call `mercadopagoStatus` |
| `status` | string | Matches `collection_status` |
| `external_reference` | string | The `externalReference` sent during preference creation |
| `payment_type` | string | `"credit_card"`, `"account_money"`, etc. |
| `merchant_order_id` | string | MP internal order ID |
| `preference_id` | string | The preference ID returned by `mercadopagoStart` |
| `site_id` | string | `"MLC"` for Chile |
| `processing_mode` | string | `"aggregator"` |
| `merchant_account_id` | string or null | Merchant account ID |

### 7.3 What the `/return-mp` frontend page must read

The minimum fields required:

```typescript
const status = searchParams.get("status");          // "approved" | "failure" | "pending"
const paymentId = searchParams.get("payment_id");   // numeric string, use for mercadopagoStatus call
const preferenceId = searchParams.get("preference_id"); // for cross-checking
const externalReference = searchParams.get("external_reference"); // buy order / trx ID
```

### 7.4 Environment-specific base URLs

| Environment | `FRONTEND_URL` value in Lambda | `back_url` example |
|---|---|---|
| Production | `https://pagos.energica.city` | `https://pagos.energica.city/return-mp?status=approved` |
| Development/QA | `http://localhost:5173` | `http://localhost:5173/return-mp?status=approved` |

**Note:** MercadoPago sandbox accepts `localhost` URLs in test mode. In production mode, the `back_url` must be a publicly reachable HTTPS URL.

---

## 8. File summary

### New files to create

| Path (relative to `amplify/`) | Description |
|---|---|
| `resolvers/mercadopagoStart/resource.ts` | `defineFunction` declaration |
| `resolvers/mercadopagoStart/handler.ts` | Lambda handler — calls MP preference API |
| `resolvers/mercadopagoStatus/resource.ts` | `defineFunction` declaration |
| `resolvers/mercadopagoStatus/handler.ts` | Lambda handler — calls MP payments API |

### Files to modify

| Path (relative to project root) | What changes |
|---|---|
| `amplify/data/resolvers.schema.ts` | Add 2 imports + `mercadopagoStart` mutation + `mercadopagoStatus` query |
| `amplify/backend.ts` | Add 2 imports, add to `defineBackend()`, add to `allFunctions[]`, add `addEnvironment()` calls in prod/dev branches |

---

## 9. Critical implementation notes

### 9.1 `$amplify/env/` import names must match `defineFunction` name

The `name` field in `defineFunction` is used to form the auto-generated `$amplify/env/` module path. If `name: "mercadopagoStart-gen2"` then the import must be:

```typescript
import { env } from "$amplify/env/mercadopagoStart-gen2";
```

Any mismatch causes a TypeScript compile error at build time.

### 9.2 Error throwing pattern — strings only

All errors in the handlers must be thrown as strings, not `Error` objects:

```typescript
// CORRECT (matches project pattern)
throw "failed to create MercadoPago preference: " + JSON.stringify(error);

// WRONG (do not use)
throw new Error("failed to create MercadoPago preference");
```

This is because AppSync serializes Lambda errors differently when the Lambda throws a non-Error value — the project has established this pattern throughout all existing resolvers.

### 9.3 Re-throw guard for string errors

When catching an error inside a `try/catch` that may have already thrown a string, add the re-throw guard to avoid double-wrapping the message:

```typescript
} catch (error) {
  if (typeof error === "string") throw error;
  const message = "failed to create MercadoPago preference: " + JSON.stringify(error);
  console.error(message);
  throw message;
}
```

### 9.4 No Amplify client needed in `mercadopagoStatus`

Unlike `webpayStatus` (which reads and writes `PaymentTransaction` DynamoDB records), the initial `mercadopagoStatus` implementation only calls the MercadoPago REST API. There is no need for `Amplify.configure()` or `generateClient()`. If a future requirement adds DynamoDB writes (e.g., updating a `PaymentTransaction` status), add the full Amplify client block from `webpayStatus/handler.ts`.

### 9.5 `fetch()` availability

Node.js 22 (runtime: 22) includes the global `fetch` API without any imports or polyfills. Do not add `node-fetch` as a dependency.

### 9.6 Amount type consideration

The spec defines `amount` as `a.float()` in the schema. The MercadoPago API for Chile (CLP) requires `unit_price` to be a positive number. Since CLP has no decimal cents, the frontend must always send integer-valued amounts. The Lambda does not round or floor the value — it passes it through as received. If type safety is a concern, consider adding a validation step: `if (!Number.isInteger(amount)) throw "amount must be an integer for CLP";`.

### 9.7 `notification_url` in development

In local development, `BACKEND_WEBHOOK_URL` is set to `""` (empty string), so the preference body omits `notification_url` entirely. This is correct behavior — MP will not attempt to deliver webhooks that cannot be received. In production, the webhook endpoint (`/mp-webhook`) needs to be implemented separately (not covered in this spec).

### 9.8 Deployment order

When deploying for the first time:
1. Set `MP_ACCESS_TOKEN` and `MP_ACCESS_TOKEN_TEST` in the Amplify Console (or CI secrets) before running `amplify deploy`.
2. The `backend.ts` CDK synthesis reads these from `process.env` — if they are absent, the Lambda functions are deployed with empty string values, which causes runtime errors on the first call.
3. After deploy, verify the new resolvers appear in the AppSync console under "Functions".
