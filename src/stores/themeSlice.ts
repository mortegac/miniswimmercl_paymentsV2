import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "./store";
import Echo from "../themes/Echo";


export const themes = [
  {
    name: "echo",
    component: Echo,
  }
] as const;

export type Themes = (typeof themes)[number];

interface ThemeState {
  value: Themes["name"];
}

export const getTheme = (search?: Themes["name"]) => {
  const theme = search === undefined ? localStorage.getItem("theme") : search;
  return themes.filter((item, key) => {
    return item.name === theme;
  })[0];
};

const initialState: ThemeState = {
  value:
    localStorage.getItem("theme") === null ? themes[0].name : getTheme().name,
};

export const themeSlice = createSlice({
  name: "theme",
  initialState,
  reducers: {
    setTheme: (state, action: PayloadAction<Themes["name"]>) => {
      state.value = action.payload;
    },
  },
});

export const { setTheme } = themeSlice.actions;

export const selectTheme = (state: RootState) => {
  if (localStorage.getItem("theme") === null) {
    localStorage.setItem("theme", "echo");
  }

  return state.theme.value;
};

export default themeSlice.reducer;
