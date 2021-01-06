import { createSlice, PayloadAction } from "@reduxjs/toolkit";

import {
  firstLoginThunk,
  subsequentLoginThunk,
  editProfileThunk,
  editUserDisplayThunk,
  updatePositionThunk,
  sampleLogin,
} from "../actions/users";
import { SuccessfullLoginData } from "../apis/usersApi";

type initialStateType = {
  login: boolean;
  user?: {
    id: number;
    name: string;
    image: string | null;
    introduce: string;
    message: string;
    display: boolean;
    lat: number | null;
    lng: number | null;
  };
  temporarilySavedData?: {
    name?: string;
    introduce?: string;
    statusMessage?: string;
  };
};

export type User = NonNullable<initialStateType["user"]>;

const initialState: initialStateType = {
  login: false,
};

const userSlice = createSlice({
  name: "user",
  initialState: initialState,
  reducers: {
    saveEditData: (
      state,
      action: PayloadAction<initialStateType["temporarilySavedData"]>
    ) => {
      if (action.payload?.name) {
        return {
          ...state,
          temporarilySavedData: {
            ...state.temporarilySavedData,
            name: action.payload.name,
          },
        };
      }
      if (action.payload?.introduce || action.payload?.introduce === "") {
        return {
          ...state,
          temporarilySavedData: {
            ...state.temporarilySavedData,
            introduce: action.payload.introduce,
          },
        };
      }
      if (
        action.payload?.statusMessage ||
        action.payload?.statusMessage === ""
      ) {
        return {
          ...state,
          temporarilySavedData: {
            ...state.temporarilySavedData,
            statusMessage: action.payload.statusMessage,
          },
        };
      }
    },
    resetEditData: (state) => ({
      ...state,
      temporarilySavedData: undefined,
    }),
  },
  extraReducers: {
    [sampleLogin.fulfilled.type]: (state, action) => {
      return {
        ...state,
        login: true,
        user: action.payload.user,
      };
    },
    "index/logout": () => {
      return initialState;
    },
    [firstLoginThunk.fulfilled.type]: (
      state,
      action: PayloadAction<SuccessfullLoginData>
    ) => {
      return {
        ...state,
        login: true,
        user: action.payload.user,
      };
    },
    [subsequentLoginThunk.fulfilled.type]: (
      state,
      action: PayloadAction<SuccessfullLoginData>
    ) => {
      return {
        ...state,
        login: true,
        user: action.payload.user,
      };
    },
    [editProfileThunk.fulfilled.type]: (
      state,
      actions: PayloadAction<User>
    ) => ({
      ...state,
      user: {
        ...state.user!,
        name: actions.payload.name,
        introduce: actions.payload.introduce,
        image: actions.payload.image,
        message: actions.payload.message,
      },
    }),
    [editUserDisplayThunk.fulfilled.type]: (
      state,
      action: PayloadAction<boolean>
    ) => ({
      ...state,
      user: { ...state.user!, display: action.payload },
    }),
    [updatePositionThunk.fulfilled.type]: (
      state,
      action: PayloadAction<{ lat: number; lng: number }>
    ) => ({
      ...state,
      user: {
        ...state.user!,
        lat: action.payload.lat,
        lng: action.payload.lng,
      },
    }),
  },
});

export const { saveEditData, resetEditData } = userSlice.actions;

export const userReducer = userSlice.reducer;
