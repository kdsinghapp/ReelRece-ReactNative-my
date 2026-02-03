
import { StyleSheet } from 'react-native';
import { hp, wp } from '@utils/Constant';
import { Color } from '@theme/color';
 import font from '@theme/font';
import ResponsiveSize from '@utils/ResponsiveSize';

const styles = StyleSheet.create({
  mainView: { flex: 1, backgroundColor: Color.background },
  text: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '700',
    color: Color.primary,
    bottom: 2,
  },
  inputView: { marginTop: ResponsiveSize.marginTop(1), paddingVertical: hp(1), },
  txtHeading: {
    color: Color.whiteText,
    textAlign: "center",
    marginTop: 1
  },
  loginHeading: {
    color: Color.whiteText,
    textAlign: "center",
    bottom: 5
  },
  imgLogo: {
    height: 40, width: 40,
    resizeMode: "contain"
  },

  titlView: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
    alignSelf: 'center',
    justifyContent: 'flex-start', marginBottom: 20,
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
    marginTop: hp(4)
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
  tite:{
    fontSize: 16, lineHeight: 20, color: Color.whiteText,  
  },
  titlSub: {
    color: Color.whiteText,
     fontSize: 16,
    bottom: 5,
    marginTop:35,
    lineHeight:22
  },
  subTitle: { lineHeight: 16, marginTop: 33, marginBottom: 15, fontSize: 16, color: Color.whiteText, textAlign: "center",fontFamily:font.PoppinsBold },
  icon: {
    width: 24,
    height: 24,


  },
});
export default styles;
