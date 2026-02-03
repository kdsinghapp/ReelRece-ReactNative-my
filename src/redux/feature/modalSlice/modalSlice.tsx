// modalSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface ModalState {
  isModalClosed: boolean;
}

const initialState: ModalState = {
  isModalClosed: false,
};

const modalSlice = createSlice({
  name: 'modal',
  initialState,
  reducers: {
    setModalClosed(state, action: PayloadAction<boolean>) {
      state.isModalClosed = action.payload;
    },
    toggleModalClosed(state) {
      state.isModalClosed = !state.isModalClosed;
    },
  },
});

export const { setModalClosed, toggleModalClosed } = modalSlice.actions;
export default modalSlice.reducer;





// // src/store/slices/stepModalSlice.ts

// import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// interface StepModalState {
//   currentStep: number;
// }

// const initialState: StepModalState = {
//   currentStep: 0, // default step
// };

// export const stepModalSlice = createSlice({
//   name: 'stepModal',
//   initialState,
//   reducers: {
//     setCurrentStep: (state, action: PayloadAction<number>) => {
//       state.currentStep = action.payload;
//     },
//     resetStep: (state) => {
//       state.currentStep = 0;
//     },
//   },
// });

// export const { setCurrentStep, resetStep } = stepModalSlice.actions;

// export default stepModalSlice.reducer;
