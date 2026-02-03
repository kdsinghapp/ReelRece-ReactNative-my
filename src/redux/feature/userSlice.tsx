import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { UserProfile } from "@types/api.types";
 
interface UserState {
  userGetData: UserProfile | null;
  isSuccess: boolean;
  isError: boolean;
}

const initialState: UserState = {
  userGetData: null,
  isSuccess: false,
  isError: false,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    getSuccess(state, action: PayloadAction<{ userGetData: UserProfile }>) {
      state.userGetData = action.payload.userGetData;
      state.isSuccess = true;
      state.isError = false;
    },
    updateUserData(state, action: PayloadAction<Partial<UserProfile>>) {
      state.userGetData = {
        ...state.userGetData,
        ...action.payload,
      } as UserProfile;
    },
  },
});

export const { getSuccess, updateUserData } = userSlice.actions;
export default userSlice.reducer;
