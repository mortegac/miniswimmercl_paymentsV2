import React, { useState, useEffect, useRef } from "react";
import { formatCurrency } from "@/utils/helper";

import { HeaderTitle } from "./HeaderTitle";
import Lucide from "@/components/Base/Lucide";
import Button from "@/components/Base/Button";
import LoadingIcon from "@/components/Base/LoadingIcon";
import { NavigationBar } from "./NavigationBar";

import { selectShoppingCart } from "@/stores/ShoppingCart/slice";
import { selectWP, setWPStart } from "@/stores/WP/slice";
import { selectMP, setMPStart } from "@/stores/MercadoPago/slice";
import { useAppSelector, useAppDispatch } from "@/stores/hooks";

export const FormStep01 = (props: any) => {
  const { email, cartID } = props;
  const { status, shoppingCart } = useAppSelector(selectShoppingCart);
  const { transaction } = useAppSelector(selectWP);
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
          
            <div className=" absolute bottom-6  h-32 w-[90%] mb-8 ">
              
              <div className="flex flex-col gap-3.5 ml-auto text-right min-w-full">
                <div className="flex items-center justify-between mx-2">
                  <div className="text-primary text-xl">Total a pagar:</div>
                  <div className="font-medium text-primary text-xl">{`$${formatCurrency(total)}`}
                </div>
                </div>
              </div>
              
            </div>
          </>
        )}
        
        <div className=" absolute bottom-1  h-32 w-[90%] mb-8">
            <Button
              type="button"
              variant="outline-primary"
              rounded
              disabled={mpStatus === "loading" || !total}
              onClick={handleMercadoPago}
              className="w-full px-2 py-2 sm:py-3 text-sm sm:text-base mb-2"
            >
              {mpStatus === "loading" ? (
                <LoadingIcon color="#7E4996" icon="three-dots" className="w-8 h-8" />
              ) : (
                <span>Pagar con Mercado Pago</span>
              )}
            </Button>
            <NavigationBar />
        </div>
      </form>
    </>
  );
};
