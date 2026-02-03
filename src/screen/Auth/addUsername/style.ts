
import { Dimensions, StyleSheet } from 'react-native';
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
    backIcon:{
    height:24,
    width:24,
    resizeMode:'contain',
    marginHorizontal:16,
    marginTop: 50,
  },
  inputView: { marginTop: ResponsiveSize.marginTop(1), paddingVertical: hp(1), },
  txtHeading: {
    color: Color.whiteText,
    textAlign: "center",
    // fontWeight: "600",
    // fontSize: 24,
    marginTop: 1
  },
  loginHeading: {
    color: Color.whiteText,
    textAlign: "center",
    fontFamily:font.PoppinsBold,
    fontSize: 28,
    //  marginTop: 30,

  },
  imgLogo: {
    height: 40, width: 40,
    resizeMode: "contain"
  },
  // otpBox: {
  //   width: 50,
  //   height: 50,
  //   borderRadius: 8,
  //   borderWidth: 1,
  //   borderColor: '#777', // default
  //   textAlign: 'center',
  //   fontSize: 20,
  //   color:  Color.whiteText,
  //   marginHorizontal: 5,
  // },
  
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
    // marginTop: 30
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
    marginTop:30,
    lineHeight:22
  },
  subTitle: { lineHeight: 20, marginTop:-8,   color: Color.textGray,   },

// email verify

logoContainer: {
  alignItems: 'center',
marginTop: 30,
  
},

appName: {
  color:  Color.whiteText,
  fontSize: 16,
  fontFamily:font.PoppinsBold,
  lineHeight:20,
  // fontWeight: 'bold',
},
verifyTitle: {
  color:  Color.whiteText,
  fontSize: 20,
  fontWeight: 'bold',
  textAlign: 'center',
  marginTop: 20,
},
instructionText: {
  color:  Color.whiteText,
  textAlign: 'center',
    marginTop:30,

},
emailText: {
  color: Color.primary ,
  textAlign: 'center',
  marginTop: 16,
  // fontWeight: '600',
},
otpContainer: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  marginTop: 30,
  marginHorizontal: Dimensions.get('window').width * 0.12,
},
otpBox: {
  backgroundColor: Color.grey700,
  borderRadius: 8,
  height: 50,
  width: 50,
  color:  Color.whiteText,
  fontSize: 20,
  textAlign: 'center',
  borderWidth: 1,
  borderColor: '#555',
 

},
verifyButton: {
  backgroundColor: Color.primary,
  borderRadius: 8,
  paddingVertical: 14,
    marginTop:30,
  marginHorizontal: 20,
  alignItems: 'center',
},
verifyButtonText: {
  color:  Color.whiteText,
  fontSize: 16,
  fontWeight: 'bold',
},
resendText: {
  textAlign: 'center',
  // marginTop: 25,
  // backgroundColor:Color.primary,
},
resendLink: {
  color: '#00BFFF',
},

});
export default styles;
