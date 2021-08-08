import { createSlice } from "@reduxjs/toolkit"

const slice = createSlice({
  name: "auth",
  initialState: {
    initiated: false,
    user: null,
    loginSince: null,
  },
  reducers: {
    setAuth: (state, action) => {
      return { ...state, ...action.payload }
    },
  },
})

export const { setAuth } = slice.actions

export default slice.reducer
