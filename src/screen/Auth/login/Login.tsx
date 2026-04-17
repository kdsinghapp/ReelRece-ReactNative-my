import {
  View,
  Image,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import React from 'react';
import imageIndex from '@assets/imageIndex';
import ScreenNameEnum from '@routes/screenName.enum';
import font from '@theme/font';
import style from '@screens/Auth/signup/style';
import { Color } from '@theme/color';
import CustomText from '@components/common/CustomText/CustomText';
import ButtonCustom from '@components/common/button/ButtonCustom';
import styles from '@screens/Auth/signup/style';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNetworkStatus } from '@hooks/useNetworkStatus';
import LoadingModal from '@utils/Loader';
import useLogin from './useLogin';
import useSocialLogin from './useSocialLogin';
import { t } from 'i18next';
import { CustomStatusBar, InputFieldCustom, SuccessMessageCustom } from '@components/index';
export default function Login() {
  const isOnline = useNetworkStatus();
  const {
    navigation,
    LoginFunction,
    loading,
    handleIdentityText,
    handlePassText,
    emailError,
    passwordError,
    toastMess,
    toastMessColorGreen,
    toastMessage,
    email, password, emptyAlert } = useLogin()
  const { handleGoogleLogin, handleFacebookLogin, handleAppleLogin, socialLoading } = useSocialLogin()
  // useEffect(() => {
  //   if (validSuccess) {
  //     navigation.navigate(ScreenNameEnum.TabNavigator)
  //   }
  // }, [validSuccess]);
  return (
    <SafeAreaView edges={isOnline ? ['top'] : []} style={style.mainViewLogin}>
      <CustomStatusBar backgroundColor="transparent" translucent />

      {(loading || socialLoading) ? <LoadingModal /> : null}
      <ScrollView showsVerticalScrollIndicator={false} >

        <View
          style={style.viewCont}>
          <View style={styles.appLogoContainer}>

            <Image
              source={imageIndex.appLogowithName}
              style={style.imgLogo} resizeMode='contain'
            />
            {/* <Image
              source={imageIndex.reelRecs}
              style={{
                height: 18,
                width: 95,
                marginTop: 6,
                resizeMode: 'contain',
              }}
            /> */}

          </View>

          <View style={{ marginTop: 36 }}>
            <CustomText
              size={24}
              color={Color.whiteText}
              style={style.loginHeading}
              font={font.PoppinsSemiBold}
            >
              {t("login.title",)}
            </CustomText>
            {emptyAlert && (
              <CustomText
                size={24}
                color={Color.whiteText}
                style={style.loginHeading}
                font={font.PoppinsBold}
              >
                {t("login.title",)}
              </CustomText>
            )}
          </View>
          <View style={style.inputView}>
            <InputFieldCustom
              lable={t("login.email",)}
              text={email}
              onChangeText={handleIdentityText}
              placeholder={t("login.email",)}
              autoFocus={true}

            />
            {emailError ?
              <CustomText

                size={14}
                color={Color.whiteText}
                style={style.redText}
                font={font.PoppinsRegular}
              >
                {emailError}
              </CustomText>
              : null}
            <InputFieldCustom
              lable={t("login.password",)}

              text={password}
              onChangeText={handlePassText}
              placeholder={t("login.password",)}
              showEye={true}
              hide={true}
            />
            {passwordError ?
              <CustomText
                size={14}
                color={Color.whiteText}
                style={style.redText}
                font={font.PoppinsRegular}
              >
                {passwordError}
              </CustomText>
              : null}
            <TouchableOpacity
              onPress={() => {
                navigation.navigate(ScreenNameEnum.PasswordReset)
              }}
              style={{
                marginTop: 1,
              }}>
              <CustomText
                size={13}
                color={Color.primary}
                style={style.pass}
                font={font.PoppinsRegular}
              >
                {t("login.reset_password",)}
              </CustomText>

            </TouchableOpacity>
          </View>
          <View style={{
            marginTop: 30,
          }}>
            <ButtonCustom
              title={t("login.sign_in")}
              onPress={LoginFunction}
              textStyle={{
                color: Color.whiteText
              }}
            />

          </View>

          <CustomText
            size={16}
            color={Color.whiteText}
            style={style.subTitle}
            font={font.PoppinsRegular}
          >
            {t("login.or_continue_with",)}

          </CustomText>
          <View style={styles.otherLoginContainer}>
            <TouchableOpacity style={style.iconButton} onPress={handleFacebookLogin} disabled={socialLoading}>
              <Image
                source={imageIndex.fb}
                style={style.iconImage}
              />
            </TouchableOpacity>

            <TouchableOpacity style={style.iconButton} onPress={handleGoogleLogin} disabled={socialLoading}>
              <Image
                source={imageIndex.google}
                style={style.iconImage}
              />
            </TouchableOpacity>

            <TouchableOpacity style={style.iconButton} onPress={handleAppleLogin} disabled={socialLoading}>
              <Image
                source={imageIndex.apple}
                style={style.iconImage}
              />
            </TouchableOpacity>
          </View>

        </View>
        <View
          style={style.titlView}>
          <CustomText
            size={14}
            color={Color.whiteText}
            style={style.tite}
            font={font.PoppinsMedium}
          >
            {t("login.no_account",)}
          </CustomText>
          <TouchableOpacity
            style={{}}
            onPress={() => {
              navigation.navigate(ScreenNameEnum.SignUpScreen)
            }}>
            <CustomText
              size={14}
              color={Color.primary}
              style={style.text}
              font={font.PoppinsMedium}
            >
              {""} {t("login.sign_up",)}
            </CustomText>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {toastMess && (
        <SuccessMessageCustom
          textColor={Color.whiteText}
          color={toastMessColorGreen ? Color.green : Color.red}
          message={toastMessage}
        />
      )}
    </SafeAreaView>
  );
}
