import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { RootState } from "../store";
import { mpStart, mpStatus } from "./services";
import type { MercadoPagoInput, MercadoPagoStatusInput } from "./types";
import { emptyPreference, emptyStatusData, type MercadoPagoPreference, type MercadoPagoStatusData } from "./types";

export interface MercadoPagoState {
  status: "idle" | "loading" | "failed";
  preference: MercadoPagoPreference;
  statusData: MercadoPagoStatusData;
  errorMessage: string;
}

const initialState: MercadoPagoState = {
  status: "idle",
  preference: emptyPreference,
  statusData: emptyStatusData,
  errorMessage: "",
};

export const setMPStart = createAsyncThunk(
  "MercadoPago/start",
  async (input: MercadoPagoInput) => {
    try {
      return await mpStart(input);
    } catch (error) {
      return Promise.reject(error);
    }
  }
);

export const setMPStatus = createAsyncThunk(
  "MercadoPago/status",
  async (input: MercadoPagoStatusInput) => {
    try {
      return await mpStatus(input);
    } catch (error) {
      return Promise.reject(error);
    }
  }
);

export const MercadoPagoSlice = createSlice({
  name: "MercadoPago",
  initialState,
  reducers: {
    resetMPPreference(state) {
      state.preference = emptyPreference;
      state.errorMessage = "";
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(setMPStart.pending, (state) => {
        state.status = "loading";
        state.errorMessage = "";
      })
      .addCase(setMPStart.fulfilled, (state, action) => {
        state.status = "idle";
        state.preference = { ...emptyPreference, ...action.payload };
      })
      .addCase(setMPStart.rejected, (state, action) => {
        state.status = "failed";
        state.errorMessage = action.error.message ?? "Error al iniciar MercadoPago";
      })
      .addCase(setMPStatus.pending, (state) => {
        state.status = "loading";
        state.errorMessage = "";
      })
      .addCase(setMPStatus.fulfilled, (state, action) => {
        state.status = "idle";
        state.statusData = { ...emptyStatusData, ...action.payload };
      })
      .addCase(setMPStatus.rejected, (state, action) => {
        state.status = "failed";
        state.errorMessage = action.error.message ?? "Error al consultar estado MercadoPago";
      });
  },
});

export const { resetMPPreference } = MercadoPagoSlice.actions;
export const selectMP = (state: RootState) => state.mercadoPago;
export default MercadoPagoSlice.reducer;
