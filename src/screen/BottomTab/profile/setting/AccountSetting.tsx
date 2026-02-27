import { Image,  StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React from 'react'
 
import imageIndex from '@assets/imageIndex'
import { useNavigation } from '@react-navigation/native'
import ScreenNameEnum from '@routes/screenName.enum'
import { Color } from '@theme/color'
import font from '@theme/font'
import { useSelector } from 'react-redux'
import { RootState } from '@redux/store'
import { SafeAreaView } from 'react-native-safe-area-context'
import StatusBarCustom from '@components/common/statusBar/StatusBarCustom'
import { HeaderCustom } from '@components/index'
import { t } from 'i18next'


const AccountSetting = () => {
    const navigation = useNavigation();
    const userdata = useSelector((state: RootState) => state.auth.userGetData); // ✅ outside any condition
    const user_email = userdata?.email_id ?? '********mail.com'
 const maskEmail = (user_email:string) => {
  if (!user_email) return "";

  const [localPart, domain] = user_email.split("@"); // split before and after @
  
  // Agar localPart 2 se kam hai to handle karna hoga
  const visiblePart = localPart.slice(0, 2); // first 2 chars
  return `${visiblePart}***@${domain}`;
};

// Example use
 // Output: rk***@gmail.com


  return (
  <SafeAreaView style={styles.container}>
      <StatusBarCustom />
      <HeaderCustom
        title={t("setting.menu.account")}
        backIcon={imageIndex.backArrow}
       // onRightPress={() => setBottomModal(true)}
      />
  
      {/* Email Row */}
      <View style={styles.row}>
        <Text style={styles.label}>{t("login.email")}</Text>
        <Text style={styles.value}>  {maskEmail(user_email)}</Text>
      </View>

      {/* Divider */}
      {/* <View style={styles.divider} /> */}

      {/* Change Password Row */}
      <View  style={styles.row}  
         
       >
        <Text style={styles.label}>{t("login.changepassword")}</Text>
        <TouchableOpacity  onPress={() => navigation.navigate(ScreenNameEnum.ChangePassSetting)} >
        <Image source={imageIndex.rightArrow}  style={styles.rightIcon} />

        </TouchableOpacity>
      </View>

      </SafeAreaView>

  )
};

export default React.memo(AccountSetting)

const styles = StyleSheet.create({

   container: {
    flex: 1,
    backgroundColor: Color.background,
  paddingTop:15,
  paddingHorizontal:15,
  
    // justifyContent: 'center',
    // alignItems: 'center',
  }, // Assuming dark background
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    marginTop:8,
  },
  label: {
    color: Color.whiteText,
    fontSize: 16,
    fontFamily:font.PoppinsMedium,
    lineHeight:20,
  },
  value: {
    color: Color.lightGrayText,
    fontSize: 14,
    fontFamily:font.PoppinsRegular,
    lineHeight:18,
  },
  // changeText: {
  //   color: Color.whiteText,
  //   fontWeight: 'bold',
  //   fontSize: 14,
  // },
  // divider: {
  //   height: 1,
  //   backgroundColor: '#444',
  //   marginHorizontal: 12,
  // },
  rightIcon:{
    height:16,
    resizeMode:'contain',
    width:18,
    tintColor: Color.lightGrayText
  },
});