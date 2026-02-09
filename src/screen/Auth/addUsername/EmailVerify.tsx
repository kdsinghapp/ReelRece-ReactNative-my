import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  
  TextInput,
  ScrollView,
  Keyboard,
  Dimensions,
} from 'react-native';
import styles from './style';
 import { useNavigation, useRoute } from '@react-navigation/native';
 import { Color } from '@theme/color';
 import useVerifyResetPassword from './UseVerifyResetPassword';
import CustomText from '@components/common/CustomText/CustomText';
import font from '@theme/font';
import ButtonCustom from '@components/common/button/ButtonCustom';
import { sendOTPToEmail_GET } from '@redux/Api/authService';
import { SafeAreaView } from 'react-native-safe-area-context';
import imageIndex from '@assets/imageIndex';
import { CustomStatusBar } from '@components/index';
import useSignup from '@screens/Auth/signup/useSignup';
import { t } from 'i18next';

const EmailVerify = () => {
  const route = useRoute();
  const { email, password, purpose = 'signup' } = route?.params || {};

  const {
    navigation,
    handleVerify,
    toestMess,
    setToestMess,
    loading,
    toastMessage,
    toestMessColorGreen,
  } = purpose === 'reset_password'
      ? useVerifyResetPassword()
      : useSignup();

  // const route = useRoute();
  // const { email, password } = route.params || {};


  const [code, setCode] = useState(['', '', '', '']);
  const inputRefs = useRef([]);
  const [focusedIndex, setFocusedIndex] = useState(null); // to track which input is focused


  const navigating = useNavigation()

  const handleFocus = (index) => {
    const firstEmptyIndex = code.findIndex((digit) => digit === '');

    if (firstEmptyIndex !== -1 && firstEmptyIndex < index) {
      inputRefs.current[firstEmptyIndex]?.focus();
      setFocusedIndex(firstEmptyIndex);
    } else {
      setFocusedIndex(index);
    }
  };


  const handleChange = (text, index) => {
    // Only allow change if all previous boxes are filled
    const allPreviousFilled = code.slice(0, index).every(digit => digit !== '');

    if (allPreviousFilled || index === 0) {
      const newCode = [...code];
      newCode[index] = text;
      setCode(newCode);

      if (text.length === 1 && index < 3) {
        inputRefs.current[index + 1]?.focus();

      }
      if (newCode.every(digit => digit !== '')) {
        Keyboard.dismiss();
      }
    }
  };

 const resendOtp = async ()=> {
  setCode(['', '', '', ''])
  try {
const response  = await sendOTPToEmail_GET(email)
   } catch (error) {
   }
 };
  useEffect(() => {
    // Dismiss keyboard when all 4 digits are filled
    if (code.every(digit => digit !== '')) {
      Keyboard.dismiss();
    }
  }, [code]);
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: 'black' }}>
      <CustomStatusBar backgroundColor="transparent" translucent />
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* <AuthBack /> */}

        <View style={[styles.mainView, { justifyContent: 'center', }]}>
          <TouchableOpacity onPress={() => navigating.goBack()} >
          <Image source={imageIndex.backArrow} style={styles.backIcon} />
        </TouchableOpacity>
          {/* Logo & App Name */}
          <View style={styles.logoContainer}>
            <Image
              source={imageIndex.appLogo}
              style={styles.imgLogo}
              resizeMode="contain"
            />
                      <Image
                        source={imageIndex.reelRecs}
                        style={{
                      height: 18,
              width: 95,
              marginTop: 6,
              resizeMode: 'contain', // important for proper image fit
                        }}  
                      />
          </View>



          {/* Headings */}

          <CustomText

            size={24}
            color={Color.whiteText}
            style={[styles.loginHeading, { marginTop: 25 }]}
            font={font.PoppinsBold}
          >
            {t("login.verifyEmail")}
          </CustomText>


          <CustomText
            size={16}
            color={Color.whiteText}
            style={styles.instructionText}
            font={font.PoppinsRegular}
          >
            {t("login.enterCode")}

          </CustomText>





          <CustomText

            size={16}
            color={Color.whiteText}
            style={styles.emailText}
            font={font.PoppinsBold}
          >
            {email}

          </CustomText>

          {/* OTP Boxes */}
          <View style={styles.otpContainer}>
            {code.map((digit, index) => (
              // Then in your TextInput component:
              <TextInput
                key={index}
                ref={(ref) => (inputRefs.current[index] = ref)}
                style={[
                  styles.otpBox,
                  // focusedIndex === index && { borderColor: Color.whiteText, borderWidth: 1 },
                  (focusedIndex === index || code[index] !== '') && { borderColor: Color.whiteText, borderWidth: 1 },
                ]}
                maxLength={1}
                keyboardType="numeric"
                value={digit}
                onFocus={() => handleFocus(index)}
                onBlur={() => setFocusedIndex(null)}
                onChangeText={(text) => handleChange(text, index)}
                onKeyPress={({ nativeEvent }) => {
                  if (nativeEvent.key === 'Backspace' && code[index] === '') {
                    if (index > 0) {
                      inputRefs.current[index - 1]?.focus();
                      const newCode = [...code];
                      newCode[index - 1] = '';
                      setCode(newCode);
                    }
                  }
                }}
                allowFontScaling={false}
              />

            ))}
          </View>

          <ButtonCustom
            title={t("common.verify")}
            onPress={() => handleVerify(code, email, password)}
            buttonStyle={styles.verifyButton}
          />
          {/* Resend Code */}
          <TouchableOpacity style={{marginTop:30}}  activeOpacity={1} onPress={()=> resendOtp()} >
            <CustomText
              size={16}
              color={Color.whiteText}
              style={styles.resendText}
              font={font.PoppinsRegular}
            >
              Didn’t receive the code?
              <CustomText
                size={16}
                color={Color.primary}
                style={styles.resendLink}
                font={font.PoppinsRegular}
              > {t("common.resend")}

              </CustomText>
            </CustomText>


          </TouchableOpacity>
        </View>
      </ScrollView>
      {/* {toestMess && (
              <SuccessMessageCustom
                textColor={Color.whiteText}
                color={toestMessColorGreen ? Color.green : Color.red}
                message={toastMessage}
              />
            )} */}
      {/* {toestMess && (
        <SuccessMessageCustom textColor={Color.whiteText} color={Color.green} message="We’ve sent a new verification code to your email. Please check your inbox!" />
      )} */}
    </SafeAreaView>
  );
};

export default EmailVerify;
