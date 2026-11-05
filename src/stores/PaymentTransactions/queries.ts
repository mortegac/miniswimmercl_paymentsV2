

export const listPaymentTransactions = /* GraphQL */ `
  query ListPaymentTransactions(
    $filter: ModelPaymentTransactionsFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listPaymentTransactions(
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
        id
        amount
        status
        buy_order
        card_number
        transaction_date
        accounting_date
        installments_number
        payment_type_code
        session_id
        card_detail
        installments_amount
        authorization_code
        response_code
        vci
        day
        month
        year
        hour
        glosa
       
        usersPaymentTransactionsId
       
      }
    }
  }
`;


export const paymentTransactionsByToken = /* GraphQL */ `
  query PaymentTransactionsByToken(
    $token: String!
    $sortDirection: ModelSortDirection
    $filter: ModelPaymentTransactionsFilterInput
    $limit: Int
    $nextToken: String
  ) {
    paymentTransactionsByToken(
      token: $token
      sortDirection: $sortDirection
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
        id
        status
        token
        urlWebpay
        amount
        buy_order
        card_number
        transaction_date
        accounting_date
        installments_number
        payment_type_code
        session_id
        card_detail
        installments_amount
        authorization_code
        response_code
        vci
        day
        month
        year
        hour
        glosa
        hasRefund
        createdAt
        updatedAt
        shoppingCartPaymentTransactionsId
        usersPaymentTransactionsId
        __typename
      }
      nextToken
      __typename
    }
  }
`;