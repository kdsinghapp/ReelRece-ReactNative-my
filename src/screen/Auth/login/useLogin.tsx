import { useNavigation } from '@react-navigation/native';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import TokenService from '@services/TokenService';
import { RootStackParamList } from './LoginTypes';
import { loginSuccess } from '@redux/feature/authSlice';
import NetInfo from "@react-native-community/netinfo";
import { loginUser_Api } from '@redux/Api/authService';
import { t } from 'i18next';
const useLogin = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const dispatch = useDispatch();
  const [email, setEmail] = useState<string>('sunny.2309@yahoo.in');
  const [password, setPassword] = useState<string>('test12345');
  const [emailError, setEmailError] = useState<string>('');
  const [passwordError, setPasswordError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [toestMess, setToestMess] = useState(false)
  const [toestMessColorGreen, setToestMessGreen] = useState(false)
  const [toastMessage, setToastMessage] = useState('');

  const emailRegex: RegExp = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  // Email Input Validation
  const handleIdentityText = (value: string): void => {
    setEmail(value.trim());
    if (!value.trim()) {
      setEmailError(t('errorMessage.email'));
    } else if (!emailRegex.test(value.trim())) {
      setEmailError(t('errorMessage.invalidEmail'));
    } else {
      setEmailError('');
    }
  };

  // Password Input Validation
  const handlePassText = (value: string): void => {
    setPassword(value);
    if (!value.trim()) {
      setPasswordError(t('errorMessage.password'));
    } else if (value.trim().length < 6) {
      setPasswordError(t('errorMessage.invalidPassword'));
    } else {
      setPasswordError('');
    }
  };
  const toestMessFunc = ({ green = false, message = '' }) => {
    setToestMess(true);
    setToastMessage(message);

    if (green) setToestMessGreen(true);

    setTimeout(() => {
      setToestMess(false);
      setToestMessGreen(false);
      setToastMessage('');
    }, 2000);
  };

  // ✅ LOGIN FUNCTION
  const LoginFunction = async (): Promise<void> => {
    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();
    // 🔴 Basic Validation
    if (!trimmedEmail || !trimmedPassword) {
      // Alert.alert('Error', 'Email AND  Password SEND BOTH are required');
      return;
    }

    if (!emailRegex.test(trimmedEmail)) {
      setEmailError(t('errorMessage.invalidEmail'));

      return;
    }

    if (trimmedPassword.length < 6) {
      setPasswordError(t('errorMessage.invalidPassword'));

      return;
    }

    try {
      setLoading(true);
      const netState = await NetInfo.fetch();
      if (!netState.isConnected) {
        toestMessFunc({ message: 'No Internet Connection ❌' });
        setLoading(false);
        return;
      }

      // ✅ loginUser_Api now returns ApiResponse<string>
      const response = await loginUser_Api(trimmedEmail, trimmedPassword);

      // ✅ Extract token from ApiResponse
      if (response.success && response.data) {
        const token = response.data; // ✅ Extract the actual token string

        // ✅ Dispatch token to Redux
        dispatch(loginSuccess({ token }));

        // ✅ Save token to TokenService
        await TokenService.setToken(token);

        toestMessFunc({ green: true, message: 'Login Success ' });

        // ✅ Navigate only when login is successful
        setTimeout(() => {
          navigation.replace('TabNavigator');
        }, 2000);

        // Reset
        setEmail('');
        setPassword('');
      } else {
        // ✅ Handle API error response
        const errorMessage = response.error || 'Invalid Credentials';

        toestMessFunc({ message: errorMessage + ' ❌' });
        setEmailError(t('errorMessage.invalidemailpassword'))
        setPasswordError(t('errorMessage.invalidemailpassword'))
      }
    } catch (error) {
      toestMessFunc({ message: 'Login failed. Please try again ❌' });
    } finally {
      setLoading(false);
    }
  };



  return {
    navigation,
    LoginFunction,
    loading,
    handleIdentityText,
    handlePassText,
    emailError,
    setEmailError,
    passwordError,
    setPasswordError,
    email,
    setEmail,
    password,
    setPassword,
    toestMess, setToestMess,
    toestMessColorGreen, setToestMessGreen,
    toastMessage, setToastMessage,
  };
};

export default useLogin;
