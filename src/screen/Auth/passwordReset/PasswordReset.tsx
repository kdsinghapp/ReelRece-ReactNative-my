import {
  View,
  Text,
  Image,
  ScrollView,
} from 'react-native';
import React from 'react';
  import Styles from './style';
import styles from './style';
import { Color } from '@theme/color';
import usePasswordReset from './usePasswordReset';
import useToastMessage from '@components/useToastMessage/useToastMessage';
import font from '@theme/font';
import CustomText from '@components/common/CustomText/CustomText';
import ButtonCustom from '@components/common/button/ButtonCustom';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CustomStatusBar, HeaderCustom, InputFieldCustom, SuccessMessageCustom } from '@components/index';
import LoadingModal from '@utils/Loader';
import imageIndex from '@assets/imageIndex';
import { t } from 'i18next';

export default function PasswordReset() {
  const {
    email,
    handleIdentityText,
    emailError,
    loading,
    handleSendResetOTP, // use updated function from hook
  } = usePasswordReset();
  const {
    toastVisible,
    toastMessage,
    toastGreen,
    showToast,
  } = useToastMessage();
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Color.background, paddingTop: 15 }}>
      <CustomStatusBar backgroundColor="transparent" translucent />

      {loading && <LoadingModal />}
      <View style={{ marginTop: 20, }} >
        <HeaderCustom
          backIcon={imageIndex.backArrow}
        />
      </View>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.viewCont}>
          <View
            style={{ alignItems: 'center', justifyContent: 'center', flex: 1 }}
          >
            <Image
              source={imageIndex.appLogo}
              style={styles.imgLogo}
              resizeMode="contain"
            />
            <CustomText
              size={22}
              color={Color.whiteText}
              style={[styles.txtHeading, { marginTop: 6 }]}
              font={font.PoppinsRegular}
            >
               {t("login.appText",)}
            </CustomText>
            {/* <Text style={styles.txtHeading}>ReelRecs</Text> */}
          </View>

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


          <CustomText

            size={16}
            color={Color.whiteText}
            style={styles.titlSub}
            font={font.PoppinsRegular}
          >
                                       {t("login.enteryouremail",)}

          
          </CustomText>

          {/* <Text style={styles.titlSub}>
           
          </Text> */}

          <View style={styles.inputView}>
            <InputFieldCustom
              text={email}
              onChangeText={handleIdentityText}
              placeholder=  {t("login.email",)}
            />
            {emailError ? (
              <Text style={Styles.redText}>{emailError}</Text>
            ) : null}
          </View>

          <View style={{ marginTop: 20 }}>
 {/* {t("login.email",)} */}
            <ButtonCustom
              title=  {t("login.requestpassword",)}
                 textStyle={{
                            color:Color.whiteText
                          }}
              onPress={() => {
                handleSendResetOTP();

              }}
            // buttonStyle={styles.saveButton}
            />




          </View>
        </View>
      </ScrollView>

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
