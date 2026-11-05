import { configureStore, ThunkAction, Action } from "@reduxjs/toolkit";
import darkModeReducer from "./darkModeSlice";
import colorSchemeReducer from "./colorSchemeSlice";
import sideMenuReducer from "./sideMenuSlice";
import themeReducer from "./themeSlice";
import compactMenuReducer from "./compactMenuSlice";
import pageLoaderReducer from "./pageLoaderSlice";

import shoppingCartReducer from "./ShoppingCart/slice";
import WPReducer from "./WP/slice";
import PaymentTransactionsReducer from "./PaymentTransactions/slice";
import mercadoPagoReducer from "./MercadoPago/slice";



export const store = configureStore({
  reducer: {
    darkMode: darkModeReducer,
    colorScheme: colorSchemeReducer,
    sideMenu: sideMenuReducer,
    theme: themeReducer,
    compactMenu: compactMenuReducer,
    pageLoader: pageLoaderReducer,
    
    shoppingCart: shoppingCartReducer,
    WP: WPReducer,
    paymentTransactions: PaymentTransactionsReducer,
    mercadoPago: mercadoPagoReducer,

  },
});

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  Action<string>
>;
