// ** Redux Imports
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { RootState } from "../store";

import {fetchData} from "./services"
import {ShoppingCart, emptyShoppingCart, FilterOptions} from "./types"



export interface ShoppingCartState {
  status: "idle" | "loading" | "failed";
  shoppingCart: ShoppingCart;
  // shoppingCarts: ShoppingCart[];
 errorMessage:string;
}

export const initialState: ShoppingCartState = {
  status: "idle",
  shoppingCart: emptyShoppingCart,
  // shoppingCarts: [emptyShoppingCart],
  errorMessage:"",
};


// locationId?: string;
// isActive?: boolean;
  

export const getShoppingCarts = createAsyncThunk(
  "shoppingCarts/list",
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


export const shoppingCartSlice = createSlice({
  name: "shoppingCart",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
       // GET Relationships
       .addCase(getShoppingCarts.rejected, (state, action) => {
        state.status = "failed";
        state.errorMessage = (action.payload as any)?.errorMessage ?? String(action.error?.message ?? "Error");
      })
      .addCase(getShoppingCarts.pending, (state) => {
        state.status = "loading";
      })
      .addCase(getShoppingCarts.fulfilled, (state, action) => {
        const objPayload: any = action.payload;
        state.status = "idle";
        if (!objPayload) {
          state.shoppingCart = emptyShoppingCart;
          return;
        }
        state.shoppingCart = {
          id: String(objPayload.id),
          totalPrice: Number(objPayload.totalPrice),
          status: String(objPayload.status),
          createdAt: String(objPayload.createdAt),
          cartDetails: [...(objPayload?.cartDetails?.items ?? [])],
          usersShoppingCartId: objPayload?.usersShoppingCartId ?? objPayload?.userId ?? "",
        };
      })
      
    
  },
});

export const selectShoppingCart = (state: RootState) => state.shoppingCart;

export default shoppingCartSlice.reducer;
