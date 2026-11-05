export const mpStartMutation = /* GraphQL */ `
  mutation V2MercadopagoStart(
    $amount: Float!
    $glosa: String!
    $userId: String!
    $cartId: String!
  ) {
    v2MercadopagoStart(
      amount: $amount
      glosa: $glosa
      userId: $userId
      cartId: $cartId
    ) {
      preferenceId
      initPoint
      sandboxInitPoint
    }
  }
`;

export const mpStatusQuery = /* GraphQL */ `
  query V2MercadopagoStatus($paymentId: String!) {
    v2MercadopagoStatus(paymentId: $paymentId) {
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
`;
