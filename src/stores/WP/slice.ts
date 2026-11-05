// ** Redux Imports
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { RootState } from "../store";

import { wpStart, wpStatus, wpCommit} from "./services"
import {FilterOptions} from "./types"



export interface WPState {
  status: "idle" | "loading" | "failed";
  transaction: any;
  statusTransaction: string;
  statusData: any;
  // commitOk: boolean;
  commitData: any;
  
  
 errorMessage:string;
}

export const initialState: WPState = {
  status: "idle",
  transaction: {},
  statusData: {},
  statusTransaction: "",
  // commitOk: false,
  commitData: {},
  errorMessage:"",
};


// locationId?: string;
// isActive?: boolean;


export const setWPStart = createAsyncThunk(
  "WP/create",
  async (objFilter: FilterOptions) => {
    try {
      const response:any = await wpStart({...objFilter});
      return response;
    } catch (error) {
      console.error(">>>>ERROR FETCH setWPStart", error)
      return Promise.reject(error);
    }
  }
);
export const setWPStatus = createAsyncThunk(
  "WP/status",
  async (objFilter: FilterOptions) => {
    try {
      const response:any = await wpStatus({...objFilter});
      return response;
    } catch (error) {
      console.error(">>>>ERROR FETCH wpStatus", error)
      return Promise.reject(error);
    }
  }
);
export const setWPCommit = createAsyncThunk(
  "WP/commit",
  async (objFilter: FilterOptions) => {
    try {
      const response:any = await wpCommit({...objFilter});
      return response;
    } catch (error) {
      console.error(">>>>ERROR FETCH wpCommit", error)
      return Promise.reject(error);
    }
  }
);


export const WPSlice = createSlice({
  name: "WP",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
       // GET START
       .addCase(setWPStart.rejected, (state, action) => {
        const objPayload: any = action.payload;
        state.status = "failed";
        state.errorMessage = objPayload.errorMessage;
      })
      .addCase(setWPStart.pending, (state) => {
        state.status = "loading";
      })
      .addCase(setWPStart.fulfilled, (state, action) => {
        const objPayload: any = action.payload;
        state.status = "idle";
        
        // console.log("---objPayload--", objPayload.data)
        
        function parseTransaction(str:string) {
          try {
              // Usar regex para extraer solo la parte del body
              const bodyMatch = str.match(/body=({.*})/);
              if (bodyMatch && bodyMatch[1]) {
                  // Extraer el objeto JSON del body
                  const bodyJson = bodyMatch[1]
                  .replace(/\\/g, '')     // Eliminar barras invertidas extras
                  .replace(/"{/g, '{')     // Limpiar comillas extra al inicio
                  .replace(/}"/g, '}')     // Limpiar comillas extra al final
                  .replace(/}}$/, '}');    // Eliminar llave extra al final
              
                  
        // console.log("---bodyJson--", bodyJson)
       
                      
                  
                  return JSON.parse(bodyJson);
              }
              return null;
          } catch (error) {
              console.error('Error al parsear:', error);
              return null;
          }
      }
      
      // Gen 2 returns a clean object; skip legacy string parsing
      const result = typeof objPayload.data === "string"
        ? parseTransaction(objPayload.data)
        : objPayload.data;
        // console.log("--bodyData--", result);

        state.transaction = result;
        // state.transaction = tokenAndUrl || {};
        
      })
      
       // GET COMMIT
       .addCase(setWPCommit.rejected, (state, action) => {
        const objPayload: any = action.payload;
        state.status = "failed";
        state.errorMessage = objPayload.errorMessage;
      })
      .addCase(setWPCommit.pending, (state) => {
        state.status = "loading";
      })
      .addCase(setWPCommit.fulfilled, (state, action) => {
        const objPayload: any = action.payload;
        state.status = "idle";
        
        // console.log("--setWPCommit-objPayload--", objPayload.data)
        
        function parseTransaction(str:string) {
          try {
              // Usar regex para extraer solo la parte del body
              const bodyMatch = str.match(/body=({.*})/);
              if (bodyMatch && bodyMatch[1]) {
                  // Extraer el objeto JSON del body
                  const bodyJson = bodyMatch[1]
                  .replace(/\\/g, '')     // Eliminar barras invertidas extras
                  .replace(/"{/g, '{')     // Limpiar comillas extra al inicio
                  .replace(/}"/g, '}')     // Limpiar comillas extra al final
                  .replace(/}}$/, '}');    // Eliminar llave extra al final
              
                  
        // console.log("---bodyJson--", bodyJson)
       
                      
                  
                  return JSON.parse(bodyJson);
              }
              return null;
          } catch (error) {
              console.error('Error al parsear:', error);
              return null;
          }
      }
      
      // Usar la función
      const result:any = parseTransaction(objPayload.data);
        // console.log("--bodyData--", result);

        state.commitData =result;
        // state.transaction = tokenAndUrl || {};
        
      })
      
       // GET STATUS
       .addCase(setWPStatus.rejected, (state, action) => {
        const objPayload: any = action.payload;
        state.status = "failed";
        state.errorMessage = objPayload.errorMessage;
      })
      .addCase(setWPStatus.pending, (state) => {
        state.status = "loading";
      })
      .addCase(setWPStatus.fulfilled, (state, action) => {
        const objPayload: any = action.payload;
        state.status = "idle";
        
        // console.log("---objPayload--", objPayload.data)
        
        function parseTransaction(str:string) {
          try {
              // Usar regex para extraer solo la parte del body
              const bodyMatch = str.match(/body=({.*})/);
              if (bodyMatch && bodyMatch[1]) {
                  // Extraer el objeto JSON del body
                  const bodyJson = bodyMatch[1]
                  .replace(/\\/g, '')     // Eliminar barras invertidas extras
                  .replace(/"{/g, '{')     // Limpiar comillas extra al inicio
                  .replace(/}"/g, '}')     // Limpiar comillas extra al final
                  .replace(/}}$/, '}');    // Eliminar llave extra al final
              
                  
        // console.log("---bodyJson--", bodyJson)
       
                      
                  
                  return JSON.parse(bodyJson);
              }
              return null;
          } catch (error) {
              console.error('Error al parsear:', error);
              return null;
          }
      }
      
      // Usar la función
      const result:any = parseTransaction(objPayload.data);
        // console.log("state.statusData ={...result}", result.message);

        
        state.statusTransaction = result?.message?.status && result?.message?.status;
        
        state.statusData =result;
        // state.transaction = tokenAndUrl || {};
        
      })
      
    
  },
});

export const selectWP = (state: RootState) => state.WP;

export default WPSlice.reducer;
