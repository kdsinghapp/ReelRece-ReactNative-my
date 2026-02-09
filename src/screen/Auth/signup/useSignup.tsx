

import { useNavigation } from '@react-navigation/native';
import { useState } from 'react';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { checkEmailExists, checkUsernameAvailability, confirmEmailCodeApi, loginUser_Api, sendOTPToEmail_GET, signupWithUsername } from '@redux/Api/authService';
import { RootStackParamList } from './SignupTypes';
import Toast from 'react-native-toast-message';
import { useDispatch } from 'react-redux';
import { loginSuccess } from '@redux/feature/authSlice';
import { BackHandler } from 'react-native';
import ScreenNameEnum from '@routes/screenName.enum';
import { t } from 'i18next';
const useSignup = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  const [loading, setLoading] = useState(false);
  const [username, setUsername] = useState('');
  const [usernameError, setUsernameError] = useState('');
  const [toestMess, setToestMess] = useState(false)
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const dispatch = useDispatch();


  const toestMessFunc = () => {
    setToestMess(true);
    setTimeout(() => {
      setToestMess(false);
    }, 2000);
  }


  const handleIdentityText = (value: string) => {
    setEmail(value.trim());
    if (!value.trim()) {
      setEmailError(t('errorMessage.email'))
    } else if (!emailRegex.test(value.trim())) {
      setEmailError(t('errorMessage.entervalidemail'))
    } else {
      setEmailError('');
    }
  };
  const handlePassText = (value: string) => {
    setPassword(value);
    if (!value.trim()) {
      setPasswordError(t('errorMessage.password'))
    } else if (value.length < 6) {
      setPasswordError(t('errorMessage.invalidPassword'))
    } else {
      setPasswordError('');
    }
  };

  const handleConfirmPassText = (value: string) => {
    setConfirmPassword(value);
    if (!value.trim()) {
      setConfirmPasswordError(t('errorMessage.confirmpasswordrequired'))
    } else if (value !== password) {
      setConfirmPasswordError(t('errorMessage.passwordsmatch'))
    } else {
      setConfirmPasswordError('');
    }
  };

  const handleVerify = async (code: string[], email: string, password: string) => {
    const enteredCode = code.join('');
    if (enteredCode.length !== 4) {
      Toast.show({ type: 'error', text1: 'Please enter 4 digit code' });
      return;
    }

    try {
      // const result = await confirmEmailCodeApi("jk@yopmail.com", enteredCode); // ✅ Dynamic email
      const result = await confirmEmailCodeApi(email, enteredCode);


      if (result.success) {
        Toast.show({ type: 'success', text1: 'Email verified -  ✅' });
        toestMessFunc()
        // ✅ Navigate to next step
        setTimeout(() => {
          navigation.navigate(ScreenNameEnum.AddUsername, {
            email: email,
            password: password,
          });
        }, 1000);

      } else {
        Toast.show({ type: 'error', text1: result.message || 'Invalid OTP' });
      }
    } catch (error) {
      Toast.show({ type: 'error', text1: 'Something went wrong' });
    }
  };


  const SignupUser = async () => {
    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();

    // ✅ Step 1: Validate fields
    if (!trimmedEmail) {
      setEmailError(t('errorMessage.email'))
      return;
    } else if (!emailRegex.test(trimmedEmail)) {
      setEmailError(t('errorMessage.requiredemail'))
      return;
    }

    if (!trimmedPassword) {
      setPasswordError(t('errorMessage.password_required'))

      return;
    } else if (trimmedPassword.length < 6) {
      setPasswordError(t('errorMessage.invalidPassword'))
      return;
    }

    if (!confirmPassword.trim()) {
      setConfirmPasswordError(t('errorMessage.confirmpasswordrequired'))
      return;
    } else if (confirmPassword !== trimmedPassword) {
      setConfirmPasswordError(t('errorMessage.passwordsmatch'))

      return;
    }

    try {
      setLoading(true);

      const emailCheck = await checkEmailExists(trimmedEmail);
      if (!emailCheck.success) {
        Toast.show({ type: 'error', text1: emailCheck.error || 'Failed to verify email' });
        return;
      }
      if (emailCheck.data) {
        setEmailError(t('errorMessage.emailalready'))

        return;
      }

      // ✅ Step 3: Send OTP using GET API
      const result = await sendOTPToEmail_GET(trimmedEmail);

      if (!result.success) {
        Toast.show({ type: 'error', text1: result.message || 'Failed to send OTP' });
        return;
      }
      setToestMess(true)

      setTimeout(() => {
        navigation.navigate(ScreenNameEnum.EmailVerify, {
          email: trimmedEmail,
          password: trimmedPassword,
        });
      }, 900);
      Toast.show({ type: 'success', text1: 'OTP sent successfully' });

    } catch (error) {
      Toast.show({ type: 'error', text1: 'Something went wrong' });
    } finally {
      setLoading(false);
    }
  };

  const handleFinalSignup = async (usernameValue: string, email: string, password: string) => {
    const trimmedUsername = usernameValue.trim();
    if (!trimmedUsername) {
      setUsernameError(t('errorMessage.usernamerequired'))
      return;
    }
    try {
      setLoading(true);
      const check = await checkUsernameAvailability(trimmedUsername);
      if (!check.success) {
        Toast.show({ type: 'error', text1: check.message || 'Failed to check username' });
        return;
      }
      if (check.available) {
        setUsernameError(t('errorMessage.usernamealready'))

        return;
      }
      const result = await signupWithUsername(email, password, trimmedUsername);
      if (!result?.success) {
         // Toast.show({ type: 'error', text1: result?.message || 'Signup failed' });
        Toast.show({ type: 'error', text1: 'Username already exists' });
        return;
      }
      const token = await loginUser_Api(email, password);
      const token1 = token?.data
      dispatch(loginSuccess({ token: token1 }));
      Toast.show({ type: 'success', text1: 'Account created 🎉' });
      navigation.navigate(ScreenNameEnum.StreamService, {
        fromSignUp: true,
      })
      BackHandler.addEventListener("hardwareBackPress", () => true);

      // navigation.reset({
      //   index: 0,
      //   routes: [{ name: ScreenNameEnum.TabNavigator }],
      // });
    } catch (error) {
      Toast.show({ type: 'error', text1: 'Something went wrong' });
    } finally {
      setLoading(false);
    }
  };
  return {
    email, setEmail, password, setPassword, confirmPassword, setConfirmPassword,
    emailError, passwordError, confirmPasswordError,
    handleIdentityText, handlePassText, handleConfirmPassText,
    SignupUser,
    loading,
    navigation,
    handleVerify,
    handleFinalSignup,
    username,
    setUsername,
    setToestMess, toestMess,
    usernameError,
  };
};

export default useSignup;