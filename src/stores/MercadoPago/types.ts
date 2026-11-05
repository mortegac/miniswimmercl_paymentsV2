export type MercadoPagoInput = {
  amount?: number;
  userId?: string;
  glosa?: string;
  cartId?: string;
};

export type MercadoPagoStatusInput = {
  paymentId?: string;
  preferenceId?: string;
  externalReference?: string;
  mpStatus?: string;
};

export type MercadoPagoPreference = {
  preferenceId: string;
  initPoint: string;
  sandboxInitPoint: string;
};
export const emptyPreference: MercadoPagoPreference = {
  preferenceId: "",
  initPoint: "",
  sandboxInitPoint: "",
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
export const emptyStatusData: MercadoPagoStatusData = {
  paymentId: "",
  status: "",
  statusDetail: "",
  amount: 0,
  glosa: "",
  externalReference: "",
  payerEmail: "",
  paymentMethodId: "",
  dateApproved: "",
};
