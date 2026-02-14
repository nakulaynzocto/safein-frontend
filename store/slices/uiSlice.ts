import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface UIState {
    isAssistantOpen: boolean;
}

const initialState: UIState = {
    isAssistantOpen: false,
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
    },
});

export const { toggleAssistant, setAssistantOpen } = uiSlice.actions;
export default uiSlice.reducer;
