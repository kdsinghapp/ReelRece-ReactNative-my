import { useState } from 'react';
import { Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useDispatch } from 'react-redux';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { LoginManager, AccessToken } from 'react-native-fbsdk-next';
import { appleAuth } from '@invertase/react-native-apple-authentication';
import TokenService from '@services/TokenService';
import { loginSuccess } from '@redux/feature/authSlice';
import { socialLogin_Api } from '@redux/Api/authService';
import { getAllRatedMovies } from '@redux/Api/movieApi';
import { errorToast } from '@utils/customToast';
import { RootStackParamList } from './LoginTypes';

GoogleSignin.configure({
  webClientId: '1001335650941-lonj4dper84hfndl6r2681r3d6op44k9.apps.googleusercontent.com',
  iosClientId: '1001335650941-anfmlqsqkfhtvnemkmhus2juhna580g7.apps.googleusercontent.com',
});

const useSocialLogin = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const dispatch = useDispatch();
  const [socialLoading, setSocialLoading] = useState(false);
  const handleLoginSuccess = async (token: string) => {
    dispatch(loginSuccess({ token }));
    await TokenService.setToken(token);

    // Match useLogin onboarding check: new users (< 5 rated) go to onboarding
    let ratedCount = 0;
    try {
      const ratedMoviesResponse = await getAllRatedMovies(token);
      ratedCount = Array.isArray(ratedMoviesResponse?.results) ? ratedMoviesResponse.results.length : 0;
    } catch {
      // Fallback — go to onboarding if we can't check
    }

    if (ratedCount < 5) {
      (navigation as { replace: (s: string) => void }).replace('OnboardingScreen');
    } else {
      (navigation as { replace: (s: string) => void }).replace('TabNavigator');
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setSocialLoading(true);
      await GoogleSignin.hasPlayServices();
      const response = await GoogleSignin.signIn();
      const idToken = response.data?.idToken;

      if (!idToken) {
        errorToast('Google sign-in failed: no ID token');
        return;
      }
      const result = await socialLogin_Api('google', idToken);
      if (result.success && result.data) {
        await handleLoginSuccess(result.data);
      } else {
        errorToast(result.error || 'Google login failed');
      }
    } catch (error: any) {
      if (error?.code !== 'SIGN_IN_CANCELLED') {
        errorToast('Google sign-in failed');
      }
    } finally {
      setSocialLoading(false);
    }
  };

  const handleFacebookLogin = async () => {
    try {
      setSocialLoading(true);
      const result = await LoginManager.logInWithPermissions(['public_profile', 'email']);

      if (result.isCancelled) {
        return;
      }

      const tokenData = await AccessToken.getCurrentAccessToken();
      if (!tokenData?.accessToken) {
        errorToast('Facebook sign-in failed: no access token');
        return;
      }

      const apiResult = await socialLogin_Api('facebook', tokenData.accessToken);
      if (apiResult.success && apiResult.data) {
        await handleLoginSuccess(apiResult.data);
      } else {
        errorToast(apiResult.error || 'Facebook login failed');
      }
    } catch (error) {
      errorToast('Facebook sign-in failed');
    } finally {
      setSocialLoading(false);
    }
  };

  const handleAppleLogin = async () => {
    if (Platform.OS !== 'ios') {
      errorToast('Apple sign-in is only available on iOS');
      return;
    }

    try {
      setSocialLoading(true);
      const appleAuthRequestResponse = await appleAuth.performRequest({
        requestedOperation: appleAuth.Operation.LOGIN,
        requestedScopes: [appleAuth.Scope.FULL_NAME, appleAuth.Scope.EMAIL],
      });

      const { identityToken } = appleAuthRequestResponse;
      if (!identityToken) {
        errorToast('Apple sign-in failed: no identity token');
        return;
      }

      const credentialState = await appleAuth.getCredentialStateForUser(
        appleAuthRequestResponse.user,
      );

      if (credentialState !== appleAuth.State.AUTHORIZED) {
        errorToast('Apple sign-in not authorized');
        return;
      }

      const result = await socialLogin_Api('apple', identityToken);
      if (result.success && result.data) {
        await handleLoginSuccess(result.data);
      } else {
        errorToast(result.error || 'Apple login failed');
      }
    } catch (error: any) {
      if (error?.code !== appleAuth.Error.CANCELED) {
        errorToast('Apple sign-in failed');
      }
    } finally {
      setSocialLoading(false);
    }
  };

  return {
    handleGoogleLogin,
    handleFacebookLogin,
    handleAppleLogin,
    socialLoading,
  };
};

export default useSocialLogin;
