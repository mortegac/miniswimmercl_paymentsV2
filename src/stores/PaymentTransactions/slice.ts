// ** Redux Imports
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { RootState } from "../store";

import { fetchData} from "./services"
import {FilterOptions, PaymentTransactions, emptyPaymentTransactions} from "./types"



export interface WPState {
  statusPay: "idle" | "loading" | "failed";
  transaction: PaymentTransactions;
   
  errorMessage:string;
}

export const initialState: WPState = {
  statusPay: "idle",
  transaction: emptyPaymentTransactions,
  errorMessage:"",
};

export const getPaymentTransactions = createAsyncThunk(
  "paymentTransactions/list",
  async (objFilter: FilterOptions) => {
    try {
      // console.log("getShoppingCarts--objFilter:", objFilter)
      const response:any = await fetchData({...objFilter});
      return response;
    } catch (error) {
      console.error(">>>>ERROR FETCH ShoppingCartS", error)
      return Promise.reject(error);
    }
  }
);

export const paymentTransactionsSlice = createSlice({
  name: "paymentTransactions",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
       // GET START
        // GET Relationships
        .addCase(getPaymentTransactions.rejected, (state, action) => {
          const objPayload: any = action.payload;
          state.statusPay = "failed";
          state.errorMessage = objPayload.errorMessage;
        })
        .addCase(getPaymentTransactions.pending, (state) => {
          state.statusPay = "loading";
        })
        .addCase(getPaymentTransactions.fulfilled, (state, action) => {
          const objPayload: any = action.payload;
          state.statusPay = "idle";
          // console.log("getShoppingCarts>> ", objPayload)
          state.transaction = { ...objPayload }
          
        })
  },
});

export const selectPaymentTransactions = (state: RootState) => state.paymentTransactions;

export default paymentTransactionsSlice.reducer;
