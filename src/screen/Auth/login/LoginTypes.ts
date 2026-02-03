 import { useNavigation } from '@react-navigation/native';

export interface LoginParams {
  email: string;
  password: string;
  navigation: ReturnType<typeof useNavigation>;
}

export interface RootStackParamList {
  SignUpScreen: undefined;
  PasswordReset: undefined;
  [key: string]: undefined; // Adding an index signature
}
