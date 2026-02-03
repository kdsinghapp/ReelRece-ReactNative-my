
import { StyleSheet } from 'react-native';
import ResponsiveSize from '@utils/ResponsiveSize';
import { Color } from '@theme/color';
import { hp } from '@utils/Constant';
import font from '@theme/font';
 
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
    fontWeight: "600",
    fontSize: 24,
    marginTop: 1
  },
  loginHeading: {
    color: Color.whiteText,
    textAlign: "center",
    fontWeight: "700",
    fontSize: 28,
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
    marginTop: hp(15)
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
  subTitle: { lineHeight: 16,  marginBottom: 10, fontSize: 16, color: Color.textGray,   fontWeight: "400" }
});
export default styles;
