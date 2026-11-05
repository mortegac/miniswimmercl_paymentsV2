

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
  usersShoppingCartId: string
  createdAt: string
  
  // #Relations
  // user: Users! @belongsTo
  cartDetails: ShoppingCartDetail[];
  // paymentTransactions: [PaymentTransactions] @hasMany
}
export const emptyShoppingCart: ShoppingCart = {
  id: "",
  totalPrice: 0,
  status: "",
  usersShoppingCartId: "",
  createdAt: "",
  cartDetails: [emptyShoppingCartDetail],
  };





export type FilterOptions  = {
  cartID?: string;
  userId?: string;
}