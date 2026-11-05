

export const setStart = /* GraphQL */ `
  mutation V2WebpayStart(
    $amount: Float!
    $userId: String!
    $glosa: String!
    $cartId: String!
  ) {
    v2WebpayStart(
      amount: $amount
      userId: $userId
      glosa: $glosa
      cartId: $cartId
    ) {
      url token orden
    }
  }
`;

export const setCommit = /* GraphQL */ `
  mutation V2WebpayCommit($token: String!) {
    v2WebpayCommit(token: $token) {
      status buy_order amount
    }
  }
`;

export const setStatus = /* GraphQL */ `
  mutation V2WebpayStatus($token: String!) {
    v2WebpayStatus(token: $token) {
      status buy_order amount
    }
  }
`;