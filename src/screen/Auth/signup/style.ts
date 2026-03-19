
import { Dimensions, StyleSheet } from 'react-native';
import { Color } from '@theme/color';
import font from '@theme/font';
// sign-up
const styles = StyleSheet.create({
  mainView: { flex: 1, backgroundColor: Color.background },
  text: {
    fontSize: 16,
    lineHeight: 24,

    fontFamily: font.PoppinsBold,
    color: Color.primary,
    // bottom: 2,
  },
  inputView: { marginTop: 36 },
  txtHeading: {
    color: Color.whiteText,
    textAlign: "center",
    // fontWeight: ,
    fontFamily: font.PoppinsBold,
    fontSize: 24,
    marginTop: 1
  },
  loginHeading: {
    color: Color.whiteText,
    textAlign: "center",
    fontSize: 20,
    lineHeight: 28,
    fontFamily: font.PoppinsSemiBold,
    // bottom: 5
  },
  imgLogo: {
    height: 47.31, width: 40.76,
    resizeMode: "contain"
  },

  titlView: {
    flexDirection: 'row',
    alignItems: 'center',
    // marginTop: 20,
    alignSelf: 'center',
    justifyContent: 'flex-start',
    marginHorizontal: 15,
  },
  redText: {
    color: 'red', fontSize: 12,
    fontFamily: font.PoppinsRegular,
    lineHeight: 16,
  },
  pass: {
    color: Color.primary,
    fontSize: 14,
    lineHeight: 18,
    textAlign: "right"
  },
  viewCont: {
    marginHorizontal: 16,
    flex: 1,
    marginTop: 103,
  },
  appLogoContainer: {
    alignItems: 'center', justifyContent: 'center', flex: 1,
  },
  mainViewLogin: {
    flex: 1,
    backgroundColor: Color.background
  },
  iconButton: {
    padding: 8,
    borderRadius: 10,
  },
  iconImage: {
    height: 24,
    width: 24,
    resizeMode: 'contain',
  },
  backIcon: {
    height: 24,
    width: 24,
    resizeMode: 'contain',
    // marginTop: 50,
  },
  tite: {
    fontSize: 16, lineHeight: 20, color: Color.whiteText,
    fontFamily: font.PoppinsSemiBold,
  },
  subTitle: { lineHeight: 20, marginTop: 36, fontSize: 16, color: Color.whiteText, textAlign: "center", fontFamily: font.PoppinsRegular },
  otherLoginContainer: {
    marginVertical: 36, flexDirection: "row", alignItems: "center", justifyContent: "space-around", paddingHorizontal: 20
  },

});
export default styles;
