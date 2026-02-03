import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import React, { useEffect } from 'react';
 import imageIndex from '@assets/imageIndex';
 import ScreenNameEnum from '@routes/screenName.enum';
// import style from './style';
import font from '@theme/font';
import { Button, CustomStatusBar, InputFieldCustom, SuccessMessageCustom } from '@components';
import style from '@screens/Auth/signup/style';
import { Color } from '@theme/color';
import CustomText from '@components/common/CustomText/CustomText';
import ButtonCustom from '@components/common/button/ButtonCustom';
import styles from '@screens/Auth/signup/style';
import { SafeAreaView } from 'react-native-safe-area-context';
import LoadingModal from '@utils/Loader';
import useLogin from './useLogin';
import { t } from 'i18next';
export default function Login() {
  const {
    navigation,
    LoginFunction,
    loading,
    handleIdentityText,
    handlePassText,
    emailError,
    passwordError,
    validSuccess,
    toestMess,  
    toestMessColorGreen, 
    toastMessage,  
    email, password, emptyAlert } = useLogin()    
  useEffect(() => {
    if (validSuccess) {
       navigation.navigate(ScreenNameEnum.TabNavigator)
    }
  }, [validSuccess]);
   return (
    <SafeAreaView style={style.mainViewLogin}>
      <CustomStatusBar backgroundColor="transparent" translucent />

      {loading ? <LoadingModal /> : null}
      <ScrollView showsVerticalScrollIndicator={false} >
     
        <View
          style={style.viewCont}>
          <View style={styles.appLogoContainer}>

            <Image
              source={imageIndex.appLogo}
              style={style.imgLogo} resizeMode='contain'
            />
            <CustomText

              size={24}
              color={Color.whiteText}
              style={style.txtHeading}
              font={font.PoppinsBold}
            >
                 {t("login.appText",)}
            </CustomText>
          </View>

          <View style={{ marginTop: 30 }}>
            <CustomText
              size={24}
              color={Color.whiteText}
              style={style.loginHeading}
              font={font.PoppinsBold}
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
              validSuccess={validSuccess}
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
              hide={true} //  This controls initial hiding
            />
            {passwordError ?
              <CustomText
                size={14}
                color={Color.whiteText}
                style={style.redText}
                font={font.PoppinsRegular}
              >
                {emailError}
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

                size={14}
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
              color:Color.whiteText
            }}
            />

          </View>

          <CustomText
            size={16}
            color={Color.whiteText}
            style={style.subTitle}
            font={font.PoppinsBold}
          >
                    {t("login.or_continue_with",)}

          </CustomText>
          <View style={styles.otherLoginContainer}>
            <TouchableOpacity style={style.iconButton}>
              <Image
                source={imageIndex.fb}
                style={style.iconImage}
              />
            </TouchableOpacity>

            {/* Button 2 */}
            <TouchableOpacity style={style.iconButton}>

              <Image
                source={imageIndex.google}
                style={style.iconImage}
              />
            </TouchableOpacity>

            {/* Button 3 */}
            <TouchableOpacity style={style.iconButton}>

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
          size={16}
          color={Color.whiteText}
          style={style.tite}
          font={font.PoppinsBold}
        >
         {t("login.no_account",)}
        </CustomText>
        <TouchableOpacity
          style={{}}
          onPress={() => {
            navigation.navigate(ScreenNameEnum.SignUpScreen)
          }}>
          <CustomText

            size={16}
            color={Color.primary}
            style={style.text}
            font={font.PoppinsRegular}
          >
            {t("login.sign_up",)}
          </CustomText>
        </TouchableOpacity>
      </View>
      </ScrollView>
    
      {toestMess && (
        <SuccessMessageCustom
          textColor={Color.whiteText}
          color={toestMessColorGreen ? Color.green : Color.red}
          message={toastMessage}
        />
      )}
    </SafeAreaView>
  );
}
