import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { UserProfile } from '@types/api.types';
 
interface AuthState {
  isLoading: boolean;
  isError: boolean;
  isSuccess: boolean;
  isLogin: boolean;
  userData: UserProfile | null;
  token: string | null;
  userGetData: UserProfile | null;
  logout: boolean | null;
}

interface GetSuccessPayload {
  userGetData: UserProfile;
}
const initialState: AuthState = {
  isLoading: false,
  isError: false,
  isSuccess: false,
  isLogin: false,
  userData: null,
  token: null,
  userGetData: null,
  logout:null,
};

const AuthSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginSuccess(state, action: PayloadAction<{ token: string }>) {
      state.token = action.payload.token;
      state.isLogin = true;
      
    },
    logout(state) {
      state.isLogin = false;
      state.isSuccess = false;
      state.isError = false;
      state.isLoading = false;
      state.userData = null;
      state.token = null;
      state.userGetData = null; // ✅ Clear user profile data on logout
      state.logout = true;
    },
    setUserProfile(state, action: PayloadAction<GetSuccessPayload>) {
      state.isSuccess = true;
      state.isError = false;
      state.userGetData = action.payload.userGetData;
    },
  

     //  NEW REDUCER
    updateUserProfileField(state, action: PayloadAction<{ key: keyof UserProfile; value: string | number | undefined }>) {
      if (state.userGetData) {
        state.userGetData = {
          ...state.userGetData,
          [action.payload.key]: action.payload.value,
        };
      }
    },

    clearUserProfile: (state) => {
      state.userGetData = null;
    },
  }
  });
export const { loginSuccess, logout, setUserProfile , clearUserProfile ,updateUserProfileField, } = AuthSlice.actions;
export default AuthSlice.reducer;