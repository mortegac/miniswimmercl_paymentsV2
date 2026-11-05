export const getShoppingCart = /* GraphQL */ `
  query GetShoppingCart($id: ID!) {
    getShoppingCart(id: $id) {
      id
      totalPrice
      status
      createdAt
      # user {
      #   id
      #   name
      #   email
      # }
      cartDetails {
        items{
        id
        type
        quantity
        amount
        detail 
        
       }
      }
      # paymentTransactions {
      #   nextToken
      #   __typename
      # }
      updatedAt
      usersShoppingCartId
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