import { useState, useEffect } from "react";
import { useLocation } from 'react-router-dom';

import * as jose from 'jose'
import _ from "lodash";


import LoadingIcon from "@/components/Base/LoadingIcon";
import {Logo} from "./components/Logo";
import {FormStep01} from "./components/FormStep01";
import {CartNotExist} from "./components/CartNotExist";
import { NavigationBar } from "./components/NavigationBar";

import { useAppSelector, useAppDispatch } from "@/stores/hooks";
import { selectShoppingCart, getShoppingCarts} from "@/stores/ShoppingCart/slice";



function Main() {
  
  const location = useLocation();
  const pathSegments = location.pathname.split('/');
  const JWT = pathSegments[pathSegments.length - 1];
  const [paymentData, setPaymentData] = useState({
    sub: "",
    // cartID: "",
    iat: 0
  });
  const [error, setError] = useState(false);
  const dispatch = useAppDispatch();

  
  const {shoppingCart, status} = useAppSelector(selectShoppingCart);


useEffect(() => {
  
  if(JWT){
      (async () => {
        try {
          const claims:any = jose.decodeJwt(JWT)
          // console.log("claims: ", claims)
          setPaymentData(claims)
          claims?.sub && dispatch(getShoppingCarts({ cartID:claims?.sub}))
        } catch (error) {
            console.log("claims: ", error)
            
        }
      })();
  }
  if (!JWT) {
      setError(true);
      return;
  }
     return () => { };
}, []);
  

  
  return (
    <>
      <div className="grid grid-cols-12 gap-y-10 gap-x-6 mt-4">
        <div className="col-span-12 sm:col-span-10 sm:col-start-2 max-w-3xl w-full mx-auto px-2 sm:px-0">
          <div className="flex justify-center items-center">
            <Logo/>
          </div>
            <div className="flex flex-col justify-between box min-h-[600px] p-8 space-y-4 mt-8 ">
              <div className="flex flex-col justify-start ">
              {status === "loading" && (
          <div className="flex justify-center mt-8">
            <div className="w-16 h-16">
              <LoadingIcon
                color="#7E4996"
                icon="oval"
                className="w-10 h-10 mt-10"
              />
            </div>
          </div>
        )}

              { (error || status === "failed" || (status === "idle" && shoppingCart?.status !== "PENDING")) &&
                <CartNotExist/>
              }
              
              {/* { !error && status === "idle" && shoppingCart?.status === "PENDING" && <FormStep01 data={shoppingCart?.cartDetails} cartID={paymentData?.cartID}/> } */}
              { !error && status === "idle" && shoppingCart?.status === "PENDING" && 
                <FormStep01 
                  data={shoppingCart?.cartDetails} 
                  email={shoppingCart?.usersShoppingCartId || ""} 
                  cartID={paymentData?.sub}
                />
              }
              
              </div>
              
            </div>
      
        </div>
      </div>
    </>
  );
}

export default Main;
