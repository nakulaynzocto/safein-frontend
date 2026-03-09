import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface UIState {
    isAssistantOpen: boolean;
    initialAssistantMessage: string;
}

const initialState: UIState = {
    isAssistantOpen: false,
    initialAssistantMessage: "",
};

const uiSlice = createSlice({
    name: "ui",
    initialState,
    reducers: {
        toggleAssistant: (state) => {
            state.isAssistantOpen = !state.isAssistantOpen;
        },
        setAssistantOpen: (state, action: PayloadAction<boolean>) => {
            state.isAssistantOpen = action.payload;
        },
        setAssistantMessage: (state, action: PayloadAction<string>) => {
            state.initialAssistantMessage = action.payload;
        },
    },
});

export const { toggleAssistant, setAssistantOpen, setAssistantMessage } = uiSlice.actions;
export default uiSlice.reducer;
