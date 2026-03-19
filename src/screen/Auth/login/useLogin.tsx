import { useNavigation } from '@react-navigation/native';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import TokenService from '@services/TokenService';
import { RootStackParamList } from './LoginTypes';
import { loginSuccess } from '@redux/feature/authSlice';
import NetInfo from "@react-native-community/netinfo";
import { loginUser_Api } from '@redux/Api/authService';
import { getAllRatedMovies } from '@redux/Api/movieApi';
import { t } from 'i18next';
import { Alert } from 'react-native';
import { errorToast } from '@utils/customToast';
import { DEV_EMAIL, DEV_PASSWORD } from './devCredentials';

const useLogin = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const dispatch = useDispatch();

  const [email, setEmail] = useState<string>(
    __DEV__ ? DEV_EMAIL : ''
  );

  const [password, setPassword] = useState<string>(
    __DEV__ ? DEV_PASSWORD : ''
  );
  const [emailError, setEmailError] = useState<string>('');
  const [passwordError, setPasswordError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [toastMess, setToastMess] = useState(false);
  const [toastMessColorGreen, setToastMessGreen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const emailRegex: RegExp = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

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

  const handlePassText = (value: string): void => {
    setPassword(value);
    if (!value.trim()) {
    } else if (value.trim().length < 6) {
    } else {
      setPasswordError('');
    }
  };

  const toastMessFunc = ({ green = false, message = '' }) => {
    setToastMess(true);
    setToastMessage(message);

    if (green) setToastMessGreen(true);

    setTimeout(() => {
      setToastMess(false);
      setToastMessGreen(false);
      setToastMessage('');
    }, 2000);
  };

  const LoginFunction = async (): Promise<void> => {
    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();

    if (!trimmedEmail || !trimmedPassword) {
      errorToast(t('errorMessage.enterboth'));
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
        toastMessFunc({ message: 'No Internet Connection ❌' });
        setLoading(false);
        return;
      }

      const response = await loginUser_Api(trimmedEmail, trimmedPassword);

      if (response.success && response.data) {
        const token = response.data;

        dispatch(loginSuccess({ token }));
        await TokenService.setToken(token);

        toastMessFunc({ green: true, message: 'Login Success ' });

        // Enforce onboarding check
        let ratedCount = 0;
        try {
          const ratedMoviesResponse = await getAllRatedMovies(token);
          ratedCount = Array.isArray(ratedMoviesResponse?.results) ? ratedMoviesResponse.results.length : 0;
        } catch (error) {
          // If fetch fails, safer to fallback to onboarding or regular flow
        }

        setTimeout(() => {
          if (ratedCount < 5) {
            (navigation as { replace: (s: string) => void }).replace('OnboardingScreen');
          } else {
            (navigation as { replace: (s: string) => void }).replace('TabNavigator');
          }
        }, 2000);

        setEmail('');
        setPassword('');
      } else {
        const errorMessage = response.error || 'Invalid Credentials';
        toastMessFunc({ message: errorMessage + ' ❌' });
        setEmailError(t('errorMessage.invalidemailpassword'));
        setPasswordError(t('errorMessage.invalidemailpassword'));
      }
    } catch (error) {
      toastMessFunc({ message: 'Login failed. Please try again ❌' });
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
    toastMess,
    setToastMess,
    toastMessColorGreen,
    setToastMessGreen,
    toastMessage,
    setToastMessage,
  };
};

export default useLogin;
