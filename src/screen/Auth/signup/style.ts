
import { Dimensions, StyleSheet } from 'react-native';
import { Color } from '@theme/color';
import font from '@theme/font';
 // sign-up
const styles = StyleSheet.create({
  mainView: { flex: 1, backgroundColor: Color.background },
  text: {
    fontSize: 16,
    lineHeight: 24,

fontFamily:font.PoppinsBold,
    color: Color.primary,
    // bottom: 2,
  },
  inputView: { marginTop: 30 },
  txtHeading: {
    color: Color.whiteText,
    textAlign: "center",
    // fontWeight: ,
    fontFamily:font.PoppinsBold,
    fontSize: 24,
    marginTop: 1
  },
  loginHeading: {
    color: Color.whiteText,
    textAlign: "center",
    fontFamily:font.PoppinsBold,
    fontSize: 24,
    lineHeight:28,
    // bottom: 5
  },
  imgLogo: {
    height: 44, width: 40,
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
    fontFamily:font.PoppinsRegular,
    lineHeight:16,
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
    marginTop:80,
  },
  appLogoContainer:{
    alignItems: 'center', justifyContent: 'center', flex: 1 ,
  },
  mainViewLogin:{
      flex: 1,
      backgroundColor: Color.background
    },
  iconButton: {
    padding: 8,
    borderRadius: 10,
   },
  iconImage: {
    height: 33,
    width: 33,
    resizeMode: 'contain',
  },
  backIcon:{
    height:24,
    width:24,
    resizeMode:'contain',
    // marginTop: 50,
  },
  tite:{
    fontSize: 16, lineHeight: 20, color: Color.whiteText,
    fontFamily:font.PoppinsBold,  
  },
  subTitle: { lineHeight: 20, marginTop: 30,  fontSize: 16, color: Color.whiteText, textAlign: "center",fontFamily:font.PoppinsBold },
  otherLoginContainer:{
     marginVertical: 30, flexDirection: "row", alignItems: "center", justifyContent: "space-around", paddingHorizontal: 20
  },
  // iconButton: {
  //   padding: 8,
  //   borderRadius: 10,
  //  },
  // iconImage: {
  //   height: 33,
  //   width: 33,
  //   resizeMode: 'contain',
  // },
 
});
export default styles;
