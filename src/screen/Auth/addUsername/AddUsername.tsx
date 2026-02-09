import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import React from 'react';
import imageIndex from '@assets/imageIndex';
import Styles from './style';
import styles from './style';
import { useNavigation, useRoute } from '@react-navigation/native';
import useSignup from '@screens/Auth/signup/useSignup';
import CustomText from '@components/common/CustomText/CustomText';
import { Color } from '@theme/color';
import font from '@theme/font';
import ButtonCustom from '@components/common/button/ButtonCustom';
import { SafeAreaView } from 'react-native-safe-area-context';
import LoadingModal from '@utils/Loader';
import { CustomStatusBar, InputFieldCustom } from '@components/index';
import { t } from 'i18next';
export default function AddUsername() {
  const {
    loading,
    handleFinalSignup,
    username,
    setUsername,
    usernameError,
    // email, password 
  } = useSignup()
  const route = useRoute();
  const { email, password } = route?.params || {};
  const navigating = useNavigation()

  return (
    <SafeAreaView style={{
      flex: 1,
      backgroundColor: "black"
    }}>
      <CustomStatusBar backgroundColor="transparent" translucent />

      {loading ? <LoadingModal /> : null}
      <ScrollView showsVerticalScrollIndicator={false} >

        <View
          style={styles.viewCont}>
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
          <View style={{ marginTop: 30 }}>

            <CustomText
              size={24}
              color={Color.whiteText}
              style={styles.loginHeading}
              font={font.PoppinsBold}
            >
              {t("login.yourusername",)}
            </CustomText>
            {/* <Text style={styles.loginHeading}>Your username</Text> */}
          </View>
          <CustomText
            size={16}
            color={Color.whiteText}
            style={styles.titlSub}
            font={font.PoppinsRegular}

          >
            {t("login.whatname",)}
          </CustomText>


          <View style={styles.inputView}>

            <InputFieldCustom
              text={username}
              onChangeText={setUsername}
              placeholder={t("login.@username",)}

            // placeholder="@ username"
            />
            {usernameError ?
              // <Text style={Styles.redText}></Text> 

              <CustomText
                size={16}
                color={Color.whiteText}
                style={Styles.redText}
                font={font.PoppinsRegular}

              >
                {usernameError}

              </CustomText>

              : null}

          </View>

          <CustomText

            size={14}
            color={Color.placeHolder}
            style={styles.subTitle}
            font={font.PoppinsRegular}
          >
            {t("login.youcan",)}
          </CustomText>

          <View style={{
            marginTop: 30
          }}>

            <ButtonCustom
              title={t("login.next",)}
              onPress={() => {
                handleFinalSignup(username, email, password);
              }}
            // buttonStyle={styles.saveButton}
            />


          </View>
        </View>
      </ScrollView>

    </SafeAreaView>
  );
}

