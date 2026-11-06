import React, { useState, useEffect, useRef } from "react";
import { formatCurrency } from "@/utils/helper";

import { HeaderTitle } from "./HeaderTitle";
import Lucide from "@/components/Base/Lucide";
import Button from "@/components/Base/Button";
import LoadingIcon from "@/components/Base/LoadingIcon";
import { WebpayLogo } from "./WebpayLogo";
import { MercadoPagoLogo } from "./MercadoPagoLogo";

import { selectShoppingCart } from "@/stores/ShoppingCart/slice";
import { selectWP, setWPStart } from "@/stores/WP/slice";
import { selectMP, setMPStart } from "@/stores/MercadoPago/slice";
import { useAppSelector, useAppDispatch } from "@/stores/hooks";

export const FormStep01 = (props: any) => {
  const { email, cartID } = props;
  const { status, shoppingCart } = useAppSelector(selectShoppingCart);
  const { transaction, status: wpStatus } = useAppSelector(selectWP);
  const { status: mpStatus } = useAppSelector(selectMP);
  const dispatch = useAppDispatch();

  const handleMercadoPago = async (e: React.MouseEvent) => {
    e.preventDefault();
    const result: any = await dispatch(setMPStart({
      amount: total,
      userId: shoppingCart.usersShoppingCartId,
      glosa: `Productos miniswimmer | ${shoppingCart?.id}`,
      cartId: cartID,
    }));
    const pref = result?.payload;
    const url = window.location.hostname === "localhost"
      ? pref?.sandboxInitPoint || pref?.initPoint
      : pref?.initPoint;
    if (url) window.location.href = url;
  };
  
  const cartDetails:any = shoppingCart?.cartDetails;
  const total =
    Array.isArray(cartDetails) &&
    cartDetails?.reduce((sum: number, item: any) => sum + item.amount, 0);

  const startDispatched = useRef(false);

  useEffect(() => {
    if (startDispatched.current) return;
    startDispatched.current = true;
    dispatch(setWPStart({
      amount: total,
      userId: shoppingCart.usersShoppingCartId,
      glosa: `Productos miniswimmer | ${shoppingCart?.id}`,
      cartId: cartID,
    })).catch((error: any) => console.log("setWPStart: ", error));
  }, []);
      

    
    
  return (
    <>
      <HeaderTitle
        title={`Confirme su pedido`}
        description={`Email: ${email}`}
      />
      <form
        className="form flex flex-col flex-wrap w-full"
        action={transaction && transaction?.url || ""}
        method="POST"
      >
        <input
          id="token_ws"
          type="hidden"
          name="token_ws"
          value={transaction?.token || ""}
        />

        {status === "idle" && (
          <>
            <div className="mt-4 overflow-auto -mx-8">
              <div className="overflow-auto h-72  bg-slate-100/35 px-8">
                {Array.isArray(cartDetails) &&
                  cartDetails.map((item: any, i: number) => {
                    return (
                      <div key={`${i}DETAIL`} className="mt-2 ">
                        <div className="flex items-start justify-between px-2 py-2 border-b border-dashed">
                          <div className="flex items-start flex-row flex-wrap sm:flex-col sm:w-full " >
                            <p className="max-w-52 font-dm-sans text-slate-500 capitalize  text-sm">
                              {item.detail}
                            </p>
                          </div>
                          <div className="min-w-16 text-left font-dm-sans whitespace-nowrap">
                            $ {formatCurrency(item.amount)}
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          
            <div className=" absolute bottom-36 h-10 w-[90%]">
              <div className="flex items-center justify-between mx-2">
                <div className="text-primary text-xl">Total a pagar:</div>
                <div className="font-medium text-primary text-xl">{`$${formatCurrency(total)}`}</div>
              </div>
            </div>
          </>
        )}

        {/* Selector de método de pago: MercadoPago (izquierda) | Webpay (derecha) */}
        <div className=" absolute bottom-1 w-[90%] mb-8">
          <p className="text-center text-slate-600 font-medium mb-3">Seleccione el método de pago</p>
          <div className="flex items-stretch gap-3">
            <button
              type="button"
              aria-label="Pagar con Mercado Pago"
              disabled={mpStatus === "loading" || !total}
              onClick={handleMercadoPago}
              className="flex-1 flex items-center justify-center border border-slate-200 rounded-xl py-3 bg-white hover:border-primary hover:shadow-md transition-all disabled:opacity-40"
            >
              {mpStatus === "loading" ? (
                <LoadingIcon color="#009EE3" icon="three-dots" className="w-10 h-10" />
              ) : (
                <MercadoPagoLogo />
              )}
            </button>
            <button
              type="submit"
              aria-label="Pagar con Webpay"
              disabled={!(transaction?.token && transaction?.token !== "")}
              className="flex-1 flex items-center justify-center border border-slate-200 rounded-xl py-3 bg-white hover:border-primary hover:shadow-md transition-all disabled:opacity-40"
            >
              {wpStatus === "loading" ? (
                <LoadingIcon color="#7E4996" icon="three-dots" className="w-10 h-10" />
              ) : (
                <WebpayLogo />
              )}
            </button>
          </div>
        </div>
      </form>
    </>
  );
};
