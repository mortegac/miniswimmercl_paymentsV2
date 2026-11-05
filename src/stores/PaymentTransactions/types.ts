
export type PaymentTransactions = {
  id: string
  usersPaymentTransactionsId: string
  amount: number
  buy_order: string
  card_number: string
  transaction_date: string
  accounting_date: string
  installments_number: string
  payment_type_code: string
  session_id: string
  card_detail: string
  installments_amount: string
  authorization_code: string
  response_code: string
  vci: string
  day: string
  month: string
  year: string
  hour: string
  glosa: string
  
}

export const emptyPaymentTransactions: PaymentTransactions = {
  id:"",
  usersPaymentTransactionsId:"",
  amount: 0,
  buy_order:"",
  card_number:"",
  transaction_date:"",
  accounting_date:"",
  installments_number:"",
  payment_type_code:"",
  session_id:"",
  card_detail:"",
  installments_amount:"",
  authorization_code:"",
  response_code:"",
  vci:"",
  day:"",
  month:"",
  year:"",
  hour:"",
  glosa:"",
}



export type FilterOptions  = {
  token?: string
}