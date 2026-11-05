

type detailType = "  ENROLLMENTS" | "PRODUCTS"; 

export type ShoppingCartDetail = {
  id: string
  type: detailType
  quantity: number
  amount: number
  detail: string
}
export const emptyShoppingCartDetail: ShoppingCartDetail = {
  id: "",
  type: "PRODUCTS",
  quantity: 0,
  amount: 0,
  detail: "",
};


export type ShoppingCart = {
  id: string
  totalPrice: number
  status: string
  createdAt: string
  
  // #Relations
  // user: Users! @belongsTo
  cartDetails: [];
  // cartDetails: ShoppingCartDetail[];
  // paymentTransactions: [PaymentTransactions] @hasMany
}
export const emptyShoppingCart: ShoppingCart = {
  id: "",
  totalPrice: 0,
  status: "",
  createdAt: "",
  cartDetails: [],
  };





export type FilterOptions  = {
  buyOrder?: string
  amount?: number
  userId?: string
  glosa?: string
  cartId?: string
  token?: string
}