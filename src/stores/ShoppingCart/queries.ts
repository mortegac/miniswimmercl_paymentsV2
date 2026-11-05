export const getShoppingCart = /* GraphQL */ `
  query GetV2ShoppingCart($id: ID!) {
    getV2ShoppingCart(id: $id) {
      id
      totalPrice
      status
      createdAt
      cartDetails {
        items {
          id
          type
          quantity
          amount
          detail
        }
      }
      updatedAt
      userId
      __typename
    }
  }
`;
export const listShoppingCarts = /* GraphQL */ `
  query ListShoppingCarts(
    $filter: ModelShoppingCartFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listShoppingCarts(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
        id
        totalPrice
        status
        createdAt
        updatedAt
        usersShoppingCartId
        __typename
      }
      nextToken
      __typename
    }
  }
`;