import { configureStore } from "@reduxjs/toolkit";
import socketReducer from "./slices/socketSlice";
// import auctionsReducer from "./slices/auctionsSlice"; --kann sein
import authReducer from "./slices/authSlice";
import commentsReducer from "./slices/commentsSlice";
import messagesReducer from "./slices/messagesSlice";
import { useDispatch, useSelector, TypedUseSelectorHook } from "react-redux";

export const store = configureStore({
  reducer: {
    socket: socketReducer,
    // auctions: auctionsReducer, --kann sein
    auth: authReducer,
    messages: messagesReducer,
    comments: commentsReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
