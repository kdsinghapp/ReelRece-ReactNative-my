 import { useNavigation } from '@react-navigation/native';

export interface LoginParams {
  email: string;
  password: string;
  navigation: ReturnType<typeof useNavigation>;
}

export interface RootStackParamList {
  SignUpScreen: undefined;
  PasswordReset: undefined;
  EmailVerify: { email: string; password?: string; purpose?: string };
  AddName: { email: string; password?: string };
  AddUsername: { email: string; password?: string; firstName?: string; lastName?: string };
  StreamService: { fromSignUp?: boolean };
  TabNavigator: undefined;
  LoginScreen: undefined;
  [key: string]: any;
}
