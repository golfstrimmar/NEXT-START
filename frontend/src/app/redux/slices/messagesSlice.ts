import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface Message {
  id: number;
  text: string;
  author: string;
  createdAt: string;
}

interface MessageState {
  messages: Message[];
}

const initialState: MessageState = {
  messages: [],
};

const messagesSlice = createSlice({
  name: "messages",
  initialState,
  reducers: {
    setMessages: (state, action: PayloadAction<Message[]>) => {
      state.messages = action.payload;
    },
    addMessage: (state, action: PayloadAction<Message>) => {
      state.messages.unshift(action.payload);
    },
    clearMessages: (state) => {
      state.messages = [];
    },
  },
});

export const { setMessages, addMessage, clearMessages } = messagesSlice.actions;
export default messagesSlice.reducer;
