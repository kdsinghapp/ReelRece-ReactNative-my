import React, { useRef } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
 } from 'react-native';
 import imageIndex from '@assets/imageIndex';
import styles from './style';
import { Color } from '@theme/color';
import { useNavigation, useRoute } from '@react-navigation/native';
import usePasswordReset from './usePasswordReset';
import useToastMessage from '@components/useToastMessage/useToastMessage';
import CustomText from '@components/common/CustomText/CustomText';
import font from '@theme/font';
import ButtonCustom from '@components/common/button/ButtonCustom';
import ScreenNameEnum from '@routes/screenName.enum';
import { SafeAreaView } from 'react-native-safe-area-context';
import LoadingModal from '@utils/Loader';
import { CustomStatusBar, InputFieldCustom, SuccessMessageCustom } from '@components/index';
import { t } from 'i18next';
export default function NewPassword() {
  const route = useRoute();
  const { email } = route?.params || {};

const {
  toastVisible,
  toastMessage,
  toastGreen,
  showToast,
} = useToastMessage(); //  Declare first

const {
  password,
  confirmPassword,
  handlePassText,
  handleConfirmPassText,
  passwordError,
  changeOldPassword,
  loading,
} = usePasswordReset({ showToast }); //  Now this is safe

  const passwordRef = useRef(null);
  const confirmPasswordRef = useRef(null);
const navigation = useNavigation();


const onBackPress  = () => {
navigation.navigate(ScreenNameEnum.LoginScreen);
};


  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Color.background }}>
      <CustomStatusBar backgroundColor="transparent" translucent />
      {loading && <LoadingModal />}
 <View style={{ marginTop: 60, marginLeft:16,}} >
    <TouchableOpacity onPress={onBackPress}>
          <Image source={imageIndex.backArrow} style={styles.icon} resizeMode="contain" />
        </TouchableOpacity>
        {/* <HeaderCustom
          backIcon={imageIndex.backArrow}
        /> */}
      </View>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.viewCont}>
          {/* App Logo */}
          <View style={{ alignItems: 'center', justifyContent: 'center', flex: 1 }}>
            <Image source={imageIndex.appLogo} style={styles.imgLogo} resizeMode="contain" />
              <CustomText

                 size={22}
              color={Color.whiteText}
              style={styles.txtHeading}
                           font={font.PoppinsRegular}
             
                >
       
            {t("login.appText",)}
                </CustomText>
          </View>

          {/* Headings */}
          <View style={{ marginTop: 40 }}>

              <CustomText

                size={24}
                color={Color.whiteText}
                style={styles.loginHeading}
                font={font.PoppinsBold}
              >
                {t("login.password_reset",)}
              </CustomText> 
            {/* <Text style={styles.loginHeading}>Password Reset</Text> */}
          </View>
          {/* <Text style={styles.titlSub}>Create a new password for your account.</Text> */}
          <CustomText
                 size={16}
              color={Color.whiteText}
            style={styles.titlSub}
                           font={font.PoppinsRegular}
                >
                        {t("login.createnewpassword",)}
              
                </CustomText>

          {/* Input Fields */}
          <View style={styles.inputView}>
            <InputFieldCustom
              lable=                        {t("login.password",)}

              text={password}
              onChangeText={handlePassText}
              placeholder=  {t("login.password",)}
              showEye={true}
               hide={true}
              ref={passwordRef}
              onSubmitEditing={() => confirmPasswordRef.current?.focus()}
              returnKeyType="next"
            />

            <InputFieldCustom
              lable= {t("login.confirmpassword",)}
              text={confirmPassword}
              onChangeText={handleConfirmPassText}
              placeholder= {t("login.confirmpassword",)}
              showEye={true}
              ref={confirmPasswordRef}
              returnKeyType="done"
               hide={true}
            />
          </View>

          {/* Button */}
          <View style={{ marginTop: 35 }}>
             <ButtonCustom
                            title={t("login.changepassword",)}
                           onPress={() => {changeOldPassword(password,confirmPassword, email);
                            }}
                            // buttonStyle={styles.saveButton}
                          />
          
            {passwordError ? (
              // <Text style={{ color: 'red', marginTop: 10 }}>{passwordError}</Text>
                 <CustomText

              size={16}
              color={'red'}
              style={[styles.loginHeading, { marginTop: 10 }]}
              font={font.PoppinsRegular}
            >
             {passwordError}
            </CustomText>
            ) : null}
          </View>
        </View>
      </ScrollView>

      {/* Success Message Toast */}
       {toastVisible && (
        <SuccessMessageCustom
          message={toastMessage}
          color={toastGreen ? Color.green : Color.red}
          textColor={Color.whiteText}
        />
      )}
    </SafeAreaView>
  );
}


