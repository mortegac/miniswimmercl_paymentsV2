import { generateClient } from "aws-amplify/api";
import { mpStartMutation, mpStatusQuery } from "./mutations";
import type { MercadoPagoInput, MercadoPagoStatusInput } from "./types";

const client = generateClient();

export const mpStart = async (input: MercadoPagoInput): Promise<any> => {
  const res: any = await client.graphql({
    query: mpStartMutation,
    variables: {
      amount: input.amount,
      glosa: input.glosa,
      userId: input.userId,
      cartId: input.cartId,
    },
  });
  return res?.data?.mercadopagoStart || {};
};

export const mpStatus = async (input: MercadoPagoStatusInput): Promise<any> => {
  const res: any = await client.graphql({
    query: mpStatusQuery,
    variables: {
      paymentId: input.paymentId || undefined,
      preferenceId: input.preferenceId || undefined,
      externalReference: input.externalReference || undefined,
      mpStatus: input.mpStatus || undefined,
    },
  });
  return res?.data?.mercadopagoStatus || {};
};
