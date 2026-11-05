export const mpStartMutation = /* GraphQL */ `
  mutation MercadopagoStart(
    $amount: Float!
    $glosa: String!
    $userId: String!
    $cartId: String
  ) {
    mercadopagoStart(
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
`;
