# 06-backend-amplify.md — AWS Amplify Gen 2 Backend Specification

## 1. Overview

The energica_payments frontend connects to AWS AppSync (GraphQL) via **AWS Amplify Gen 2**. The entire API is public — no user authentication is required. All operations use API Key authorization.

The backend is defined in `amplify/` and the generated TypeScript types live in `amplify/graphql/API.ts`. The frontend consumes the API through two distinct patterns (see §7).

---

## 2. Amplify Client Initialization

### `src/init.ts`

```typescript
import { generateClient } from "aws-amplify/data";
import { MainTypes } from "@types";           // alias → amplify/data/resource
import { configureAmplify } from "@utils/amplify-config";

configureAmplify();                           // must run before generateClient()

export const client = generateClient<MainTypes>();
```

`client` is the **typed Amplify Gen 2 data client**. It is used exclusively by `src/stores/Eves/services.ts` and `src/stores/Charger/services.ts`.

### `src/utils/amplify-config.ts`

Environment-based config switching:

```typescript
import { Amplify } from "aws-amplify";
import outputsProd from "../../amplify_outputs.json";
import outputsDev  from "../../amplify_outputs_dev.json";

export const getAmplifyConfig = () => {
  const environment = import.meta.env.VITE_ENVIRONMENT || 'DEV';
  return environment === 'PROD' ? { ...outputsProd } : { ...outputsDev };
};

export const configureAmplify = () => {
  const config = getAmplifyConfig();
  Amplify.configure(config);
  return config;
};

export const isProduction  = () => import.meta.env.VITE_ENVIRONMENT === 'PROD';
export const isDevelopment = () => !isProduction();

// Side-effect: configures Amplify on module load
export const amplifyConfig = configureAmplify();
```

**Selection logic:**
- `VITE_ENVIRONMENT === "PROD"` → loads `amplify_outputs.json` (production AppSync endpoint)
- anything else (default `"DEV"`) → loads `amplify_outputs_dev.json` (dev AppSync endpoint)

---

## 3. Authorization Model

```typescript
authorizationModes: {
  defaultAuthorizationMode: "apiKey",
  apiKeyAuthorizationMode: { expiresInDays: 30 },
}
```

- **Public API only** — no Cognito, no IAM, no OIDC.
- API keys expire every 30 days and must be rotated.
- All schema models grant `allow.guest()` access (unauthenticated).
- Some schemas also include `allow.authenticated()` and `allow.publicApiKey()`.

---

## 4. `amplify/data/resource.ts` — Schema Assembly

```typescript
import { defineData } from "@aws-amplify/backend";
import { ParameterSchema }      from "./parameter.schema";
import { FAQSchema }            from "./faq.schema";
import { ResumeDashboardSchema } from "./resume.schema";
// MainSchema and ResolverSchema are commented out (not deployed via Amplify Gen 2 currently)

export type * from "./parameter.schema";
export type * from "./faq.schema";
export type * from "./main.schema";
export type * from "./resume.schema";

export const data = defineData({
  schema: {
    schemas: [FAQSchema, ParameterSchema, ResumeDashboardSchema],
  },
  authorizationModes: {
    defaultAuthorizationMode: "apiKey",
    apiKeyAuthorizationMode: { expiresInDays: 30 },
  },
});
```

`MainSchema` (the full domain model) and `ResolverSchema` (custom resolvers) are **commented out** in `resource.ts`. They exist as `.ts` and `.txt` files but the actual AppSync schema for the main data types is managed separately (the codegen in `amplify/graphql/` was generated from the deployed AppSync instance, not from these schema files directly).

---

## 5. Amplify Data Schemas

### 5.1 `amplify/data/faq.schema.ts`

```typescript
export const FAQSchema = a.schema({
  Tag: a.model({
    tagId: a.id().required(),
    name:  a.string().required(),
    FaqPerTag: a.hasMany("FaqPerTag", "tagId"),
  }).identifier(["tagId"]),

  Faq: a.model({
    faqId:    a.id().required(),
    question: a.string().default(""),
    answer:   a.string().default(""),
    FaqPerTag: a.hasMany("FaqPerTag", "faqId"),
  }).identifier(["faqId"]),

  FaqPerTag: a.model({
    faqId: a.id().required(),
    tagId: a.id().required(),
    Faq: a.belongsTo("Faq", "faqId"),
    Tag: a.belongsTo("Tag", "tagId"),
  }).identifier(["faqId", "tagId"]),
}).authorization((allow) => [allow.guest()]);
```

### 5.2 `amplify/data/parameter.schema.ts`

```typescript
export const ParameterSchema = a.schema({
  ParameterEnc: a.model({
    parameterEncId: a.id().required(),
    description:    a.string().required(),
    Parameters: a.hasMany("Parameter", "parameterEncId"),
  }).identifier(["parameterEncId"]),

  Metadata: a.model({
    metadataId:  a.id().required(),
    key:         a.string().default(""),
    value:       a.string().default(""),
    parameterId: a.string(),
    Parameter: a.belongsTo("Parameter", "parameterId"),
  }).identifier(["metadataId"]),

  Parameter: a.model({
    parameterId:    a.id().required(),
    label:          a.string().required(),
    value:          a.string().required(),
    parameterEncId: a.id(),
    ParameterEnc: a.belongsTo("ParameterEnc", "parameterEncId"),
    Metadata: a.hasMany("Metadata", "parameterId"),
  }).identifier(["parameterId"]),
}).authorization((allow) => [allow.guest(), allow.authenticated()]);
```

### 5.3 `amplify/data/resume.schema.ts`

```typescript
export const ResumeDashboardSchema = a.schema({
  ResumeDashboard: a.model({
    resumeDashboardId: a.id().required(),
    name:              a.string().required(),
    type:    a.enum(["residences", "none"]),
    subtype: a.enum([
      "eves", "smartmeters", "companies", "residences", "users",
      "builderDashboard", "measurementBuilders", "paymentReceived",
      "returns", "openTicket", "energy", "none",
    ]),
    count:       a.float(),
    isAll:       a.boolean(),
    idResidence: a.string().default("none"),
    date:        a.datetime(),
  }).identifier(["resumeDashboardId"]),
}).authorization((allow) => [allow.guest()]);
```

### 5.4 Custom Resolver Schema (`amplify/data/resolvers.schema.txt` — reference only)

This file defines the **Lambda-backed custom operations** that exist on the deployed AppSync endpoint. It is the source of truth for the Webpay and utility operations.

**Custom Queries:**

| Operation | Type | Arguments | Returns |
|---|---|---|---|
| `CalculateEvePricing` | query | `eveId: String`, `stationId: String`, `chargingHours: Float!` | `Int` |
| `mercadopagoStatus` | query | `paymentId: String`, `preferenceId: String`, `externalReference: String`, `mpStatus: String` | `MercadoPagoStatusResult` |

**Custom Mutations:**

| Operation | Type | Arguments | Returns |
|---|---|---|---|
| `webpayStart` | mutation | `amount: Int!`, `glosa: String!`, `userId: String`, `idEve: String`, `stationId: String`, `chargingHours: Float`, `type: WebpayStartType` | `{ order, token, url }` |
| `webpayCommit` | mutation | `token: String!` | `{ message, status }` |
| `webpayStatus` | mutation | `token: String!` | `WebpayStatusResult` |
| `mercadopagoStart` | mutation | `amount: Float!`, `glosa: String!`, `userId: String!`, `idEve: String`, `stationId: String`, `chargingHours: Float`, `type: String!` | `MercadoPagoPreferenceResult` |
| `controlEve` | mutation | `eveId: String!`, `type: ControlEveType`, `version: String` | `String` |
| `sendEmail` | mutation | `email: String!`, `template: String!`, `id: String!` | `String` |
| `recalculateEveTransactions` | mutation | `year: String!`, `month: String!`, `residenceId: String!`, `newPrice: Float!` | `String` |
| `canBuildingCharge` | mutation | `residenceId: String!` | `{ message, canCharge, datetime, eveId }` |
| `CalculateRefunds` | mutation | `residenceId: String`, `year: String`, `month: String` | `String` |

**Enum `WebpayStartType`:** `"EVE" | "EMA" | "OCPP" | "OTHER"`

---

## 6. Auto-Generated GraphQL Operations (`amplify/graphql/`)

These files are auto-generated by Amplify codegen from the deployed AppSync schema. They must not be edited manually.

### 6.1 Key Queries (`amplify/graphql/queries.ts`)

All queries are typed as `GeneratedQuery<InputType, OutputType>`.

**Payment-critical query:**

```graphql
query CalculateEvePricing(
  $chargingHours: Float!
  $eveId: String
  $stationId: String
) {
  CalculateEvePricing(
    chargingHours: $chargingHours
    eveId: $eveId
    stationId: $stationId
  )
}
```

**Charger queries:**

- `getCharger($stationId: ID!)` → full `Charger` object with relations
- `getChargerChargeEvent($chargerChargeEventId: ID!)`
- `listChargers(...)` with filter/limit/nextToken/sortDirection
- `listChargerChargeEvents(...)`
- `listChargerChargeEventByStationIdAndHoraOff($stationId: ID!, $horaOff: ...)`
- `listChargerMeasurementByStationIdAndDate($stationId: ID!, $date: ...)`

**EVE queries:**

- `getEve($eveId: ID!)` → full `Eve` object
- `getEveChargeEvent($eveChargeEventId: ID!)`
- `listEves(...)`
- `listEveChargeEvents(...)`
- `listEveChargeEventByEveIdAndHoraOff($eveId: ID!, $horaOff: ...)`
- `listEveMeasurementByEveIdAndDate($eveId: ID!, $date: ...)`

**Payment queries:**

- `getPaymentTransaction($paymentTransactionId: ID!)`
- `listPaymentTransactions(...)`
- `listPaymentTransactionByToken($token: ID!)` — **used in `PaymentTransactions/services.ts`**
- `listPaymentTransactionByResidenceIdAndDate($residenceId: ID!, $date: ...)`
- `listPaymentTransactionByStatusAndDate($status: String!, $date: ...)`

**Other queries (management data):**

- `getFaq`, `listFaqs`, `getFaqPerTag`, `listFaqPerTags`, `getTag`, `listTags`
- `getParameter`, `listParameters`, `getParameterEnc`, `listParameterEncs`, `getMetadata`, `listMetadata`
- `getResumeDashboard`, `listResumeDashboards`
- `getResidence`, `listResidences`
- `getUser`, `listUsers`, `getRole`, `listRoles`
- `getRefund`, `listRefunds`, `getRefundDetail`, `listRefundDetails`
- `getPaymentsUser`, `listPaymentsUsers`
- `getMeasurement`, `getSmartmeter`, `getSmartmeterMeasurement`, `getMeasurementSmartmeterAcrel`
- `getSupportTicket`, `listSupportTickets`, `getTicketComment`, `listTicketComments`

### 6.2 Key Mutations (`amplify/graphql/mutations.ts`)

**Webpay mutations (from codegen):**

```graphql
mutation WebpayStart(
  $amount: Int!
  $chargingHours: Float
  $glosa: String!
  $idEve: String
  $stationId: String
  $type: WebpayStartType
  $userId: String
) {
  webpayStart(
    amount: $amount
    chargingHours: $chargingHours
    glosa: $glosa
    idEve: $idEve
    stationId: $stationId
    type: $type
    userId: $userId
  ) {
    order
    token
    url
  }
}
```

```graphql
mutation WebpayCommit($token: String!) {
  webpayCommit(token: $token) {
    message
    status
  }
}
```

```graphql
mutation WebpayStatus($token: String!) {
  webpayStatus(token: $token) {
    amount
    buy_order
    card_number
    email
    eveId
    glosa
    message
    paymentTransactionId
    payment_type_code
    status
    usersPaymentTransactionsId
  }
}
```

**Other custom mutations:**

```graphql
mutation CalculateRefunds($month: String, $residenceId: String, $year: String) {
  CalculateRefunds(month: $month, residenceId: $residenceId, year: $year)
}

mutation CanBuildingCharge($residenceId: String!) {
  canBuildingCharge(residenceId: $residenceId) {
    canCharge
    datetime
    eveId
    message
  }
}

mutation ControlEve($eveId: String!, $type: ControlEveType, $version: String) {
  controlEve(eveId: $eveId, type: $type, version: $version)
}
```

CRUD mutations exist for all domain models: `createCharger`, `updateCharger`, `deleteCharger`, `createEve`, `updateEve`, `deleteEve`, `createPaymentTransaction`, `updatePaymentTransaction`, etc.

### 6.3 Subscriptions (`amplify/graphql/subscriptions.ts`)

Auto-generated `onCreateX`, `onUpdateX`, `onDeleteX` subscriptions for all domain models (7,645 lines). Not currently consumed by the payments frontend.

---

## 7. Frontend Service Pattern — Two Clients

The codebase uses **two distinct GraphQL client approaches**:

### Pattern A: Typed Amplify Gen 2 Data Client (`client` from `src/init.ts`)

Used by:
- `src/stores/Eves/services.ts` → `fetchEve`
- `src/stores/Charger/services.ts` → `fetchCharger`

This client is typed with `MainTypes` (the full domain schema). Queries are **inline GraphQL strings** passed to `client.graphql<ResponseType>()`.

```typescript
// Example: src/stores/Eves/services.ts
import { client } from "../../init";

const response = await client.graphql<EveResponse>({
  query: `query GetEve($eveId: ID!) { getEve(eveId: $eveId) { ... } }`,
  variables: { eveId: objFilter.eveId.toUpperCase() },
}) as GraphQLResult<EveResponse>;
```

### Pattern B: Untyped `generateClient()` from `aws-amplify/api`

Used by:
- `src/stores/WP/services.ts` — Webpay operations
- `src/stores/MercadoPago/services.ts` — MercadoPago operations
- `src/stores/PaymentTransactions/services.ts` — transaction lookup

```typescript
import { generateClient } from 'aws-amplify/api';
const client = generateClient();

const response = await client.graphql<ResponseType>({
  query: `...inline GraphQL string...`,
  variables: { ... },
}) as GraphQLResult<ResponseType>;
```

These clients use the same configured Amplify instance (from `configureAmplify()` called in `src/init.ts`). The difference is only in TypeScript typing.

---

## 8. Service Files — Exact Inline GraphQL Strings

### 8.1 `src/stores/WP/services.ts`

**`getCalculatePricing(objFilter: wpInput)`**

```graphql
query getCalculateEvePricing(
  $eveId: String!
  $stationId: String!
  $chargingHours: Float!
) {
  CalculateEvePricing(eveId: $eveId, stationId: $stationId, chargingHours: $chargingHours)
}
```

Returns: `number` (`response.data.CalculateEvePricing`)

**`wpStart(objFilter: wpInput)`**

```graphql
mutation WebpayStart(
  $idEve: String
  $stationId: String
  $userId: String
  $amount: Int!
  $glosa: String!
  $chargingHours: Float
  $type: WebpayStartType!
) {
  webpayStart(
    idEve: $idEve, stationId: $stationId, userId: $userId,
    amount: $amount, glosa: $glosa, chargingHours: $chargingHours, type: $type,
  ) {
    order
    token
    url
  }
}
```

Returns: `{ order: string, token: string, url: string }`

**`wpCommit(objFilter: wpInput)`**

```graphql
mutation wpCommit($token: String!) {
  webpayCommit(token: $token) {
    message
    status
  }
}
```

Returns: `{ message: string, status: string }`

**`wpStatus(objFilter: wpInput)`**

```graphql
mutation webpayStatus($token: String!) {
  webpayStatus(token: $token) {
    paymentTransactionId
    payment_type_code
    buy_order
    amount
    glosa
    card_number
    usersPaymentTransactionsId
    status
    eveId
    stationId
  }
}
```

Returns: `StatusData` (note: `webpayStatus` is declared as a **mutation** in AppSync, not a query)

### 8.2 `src/stores/MercadoPago/services.ts`

**`mpStart(input: MercadoPagoInput)`**

```graphql
mutation MercadopagoStart(
  $amount: Float!
  $glosa: String!
  $userId: String!
  $idEve: String
  $stationId: String
  $chargingHours: Float
  $type: String!
) {
  mercadopagoStart(
    amount: $amount
    glosa: $glosa
    userId: $userId
    idEve: $idEve
    stationId: $stationId
    chargingHours: $chargingHours
    type: $type
  ) {
    preferenceId
    initPoint
    sandboxInitPoint
  }
}
```

Returns: `{ preferenceId: string, initPoint: string, sandboxInitPoint: string }`

**`mpStatus(input: MercadoPagoStatusInput)`**

```graphql
query MercadopagoStatus(
  $paymentId: String
  $preferenceId: String
  $externalReference: String
  $mpStatus: String
) {
  mercadopagoStatus(
    paymentId: $paymentId
    preferenceId: $preferenceId
    externalReference: $externalReference
    mpStatus: $mpStatus
  ) {
    paymentId
    status
    statusDetail
    amount
    glosa
    externalReference
    payerEmail
    paymentMethodId
    dateApproved
  }
}
```

Returns: `MercadoPagoStatusData`

### 8.3 `src/stores/Charger/services.ts`

```graphql
query getOneCharger($stationId: ID!) {
  getCharger(stationId: $stationId) {
    stationId
    fantasyName
    connectorStatus
    lastCheckedIn
    updatedAt
  }
}
```

Returns: `{ stationId, fantasyName, connectorStatus, lastCheckedIn, updatedAt }`

### 8.4 `src/stores/Eves/services.ts`

```graphql
query GetEve($eveId: ID!) {
  getEve(eveId: $eveId) {
    eveId
    name
    eveState
    lastCheckedIn
    updatedAt
    currentActivity
  }
}
```

Note: `eveId` is uppercased before being sent (`objFilter.eveId.toUpperCase()`).

Returns: `{ eveId, name, eveState, lastCheckedIn, updatedAt }`

### 8.5 `src/stores/PaymentTransactions/services.ts`

```graphql
query ListPaymentTransactionByToken($token: ID!) {
  listPaymentTransactionByToken(token: $token) {
    items {
      paymentTransactionId
      status
      amount
      horaOn
      horaOff
      chargingHours
      date
      buy_order
      card_number
      transaction_date
      accounting_date
      installments_number
      installments_amount
      payment_type_code
      card_detail
      session_id
      authorization_code
      response_code
      vci
      glosa
      transactionType
      usersPaymentTransactionsId
      eveId
      stationId
    }
    nextToken
  }
}
```

Returns: first item from `items[]`

---

## 9. TypeScript Types

### 9.1 WP types (`src/stores/WP/types.ts`)

```typescript
export type wpInput = {
  amount?: number;
  userId?: string;
  userName?: string;
  userPhone?: string;
  glosa?: string;
  idEve?: string;
  stationId?: string;
  chargingHours?: number;
  token?: string;
  typeOfCharger?: string;
};

export interface wpStartResponse {
  webpayStart: { order: string; token: string; url: string; };
}
export interface wpCommitResponse {
  webpayCommit: { message: string; status: string; };
}
export interface wpStatusResponse {
  webpayStatus: {
    paymentTransactionId: string;
    payment_type_code: string;
    buy_order: string;
    amount: string;
    glosa: string;
    card_number: string;
    usersPaymentTransactionsId: string;
    status: string;
    eveId: string;
    stationId: string;
  };
}
export interface wpCalculatePricingResponse {
  CalculateEvePricing: number;
}

export type Transaction = { order: string; token: string; url: string; };
export type CommitData  = { message: string; status: string; };
export type StatusData  = {
  paymentTransactionId: string;
  payment_type_code: string;
  buy_order: string;
  amount: string;
  glosa: string;
  card_number: string;
  usersPaymentTransactionsId: string;
  status: string;
  eveId: string;
  stationId: string;
};
```

### 9.2 MercadoPago types (`src/stores/MercadoPago/types.ts`)

```typescript
export type MercadoPagoInput = {
  amount?: number;
  userId?: string;
  glosa?: string;
  idEve?: string;
  stationId?: string;
  chargingHours?: number;
  typeOfCharger?: string;
};

export type MercadoPagoStatusInput = {
  paymentId?: string;         // present only for approved flows
  preferenceId?: string;      // from return URL when paymentId is null
  externalReference?: string; // fallback from return URL
  mpStatus?: string;          // failure/pending string from URL
};

export type MercadoPagoPreference = {
  preferenceId: string;
  initPoint: string;
  sandboxInitPoint: string;
};

export type MercadoPagoStatusData = {
  paymentId: string;
  status: string;
  statusDetail: string;
  amount: number;
  glosa: string;
  externalReference: string;
  payerEmail: string;
  paymentMethodId: string;
  dateApproved: string;
};
```

### 9.3 Auto-generated types (`amplify/graphql/API.ts`)

The file is 25,341 lines (803 KB) and contains auto-generated TypeScript for every model, enum, filter input, condition input, CRUD operation input/output, query variable/response, mutation variable/response, and subscription variable/response. Key payment-related types include:

- `WebpayStartMutationVariables`, `WebpayStartMutation`
- `WebpayCommitMutationVariables`, `WebpayCommitMutation`
- `WebpayStatusMutationVariables`, `WebpayStatusMutation`
- `CalculateEvePricingQueryVariables`, `CalculateEvePricingQuery`
- `GetEveQueryVariables`, `GetEveQuery`
- `GetChargerQueryVariables`, `GetChargerQuery`
- `ListPaymentTransactionByTokenQueryVariables`, `ListPaymentTransactionByTokenQuery`
- `GetPaymentTransactionQueryVariables`, `GetPaymentTransactionQuery`

---

## 10. Domain Model Summary (from `amplify/data/main.schema.ts`)

The main schema (the full AppSync-deployed model) defines these entities:

| Model | Primary Key | Key Relations |
|---|---|---|
| `User` | `userId` | Role, Company, Eves, Chargers, EveChargeEvents, SupportTickets |
| `Role` | `roleId` | Users (hasMany) |
| `Company` | `companyId` | Users, Residences |
| `Residence` | `residenceId` | Eves, Chargers, Measurements, PaymentTransactions, Refunds |
| `Eve` | `eveId` | Residence, User, EveChargeEvents, EveMeasurements, PaymentTransactions |
| `EveChargeEvent` | `eveChargeEventId` | Eve, User, PaymentTransactions, EveMeasurements |
| `EveMeasurement` | `eveMeasurementId` | Eve, EveChargeEvent |
| `Charger` | `stationId` | Residence, ChargerModel, ChargerChargeEvents, ChargingProfiles |
| `ChargerChargeEvent` | `chargerChargeEventId` | Charger, PaymentTransactions |
| `ChargerMeasurement` | `chargerMeasurementId` | Charger, ChargerChargeEvent |
| `PaymentTransaction` | `paymentTransactionId` | Eve, EveChargeEvent, Charger, ChargerChargeEvent, Residence, Refund |
| `Refund` | `refundId` | Residence, PaymentTransactions, RefundDetails |
| `PaymentsUser` | `paymentsUsersId` | UserRefunds, SupportTickets |
| `SupportTicket` | `supportTicketId` | PaymentsUser, TicketComments |
| `ChargerModel` | `chargerModelId` | Chargers, DefaultChargingProfile |
| `ChargingProfile` | `chargingProfileId` | Charger |
| `ExternalSupplier` | `externalSupplierId` | Eves |
| `Measurement` | `id` | Residential, ThingSmartmeter |
| `Smartmeter` | `smartmeterId` | Residence, SmartmeterMeasurements |

Key enums in main schema:
- `statusChargeEventEnum`: `payment_commited`, `payment_status`, `remote_start_transaction`, `start_transaction`, `charge_finished`, etc.
- `transactionType`: includes `webpay`
- `paymentMethod` on `UserRefund`: `string` (default `"webpay"`)

---

## 11. Environment Variables

| Variable | Values | Effect |
|---|---|---|
| `VITE_ENVIRONMENT` | `"PROD"` / unset | Selects `amplify_outputs.json` vs `amplify_outputs_dev.json` |
| `VITE_LOG_LEVEL` | `0`–`3` | Logger verbosity (0=NONE, 3=INFO) |

---

## 12. Key Architectural Notes

1. **`mercadopagoStart` and `mercadopagoStatus` are NOT in the codegen files** (`amplify/graphql/mutations.ts` / `queries.ts`). They are inline-only in `src/stores/MercadoPago/services.ts` and defined in `src/stores/MercadoPago/mutations.ts`. This means the AppSync schema was extended with MP operations after the last codegen run.

2. **`webpayStatus` is a mutation**, not a query, in the AppSync schema. The services call it correctly as a mutation.

3. **The typed client** (`client` from `src/init.ts` typed as `generateClient<MainTypes>()`) is used only for `getEve` and `getCharger`. All payment operations use the untyped `generateClient()` from `aws-amplify/api`.

4. **Inline GraphQL strings** are the universal pattern. The generated query/mutation exports in `amplify/graphql/queries.ts` and `amplify/graphql/mutations.ts` are **not imported** by any service file (except `listPaymentTransactionByToken` is imported in `PaymentTransactions/services.ts` but then **re-declared inline** in the same file).

5. **No subscriptions** are consumed by the payments frontend.
