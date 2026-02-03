
import { Dimensions, StyleSheet } from 'react-native';
import { Color } from '@theme/color';
import font from '@theme/font';
  const { height: windowHeight } = Dimensions.get('window');



const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Color.background, },
  headerContainer:{
flexDirection:'row',
justifyContent:'space-between',
alignItems:'center',
paddingHorizontal:18,
marginBottom:18,
// marginTop:8,

  },
  imageSize:{
    width:24,
    height:24,
    resizeMode:'contain',
  },
  posterContainer: {},
  poster: { width: '100%', height: 220 },
 icon: {
    width: 24,
    height: 24,


  },
  infoContainer: {  padding: 14, marginTop: 0,  },
  title: {},
  subInfo: {
    color: Color.lightGrayText,
    fontSize: 12,
    fontFamily: font.PoppinsRegular,
    lineHeight: 14,
    marginRight:0,
  },
  scoreRow: { flexDirection: 'row',
     justifyContent: "space-between", 
    //  marginVertical: 10,
    alignItems:'center',
    // backgroundColor:'green'
    },
  scoreBoxGreen: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent:'center',
  },
  scoreBoxYellow: {
    flexDirection: "row",
    alignItems: "center"
    ,

  },
  footerSaveIcon: {
    height: 20,
    width: 20,
    marginRight: 4,
  },
  genres: {
    flexDirection: 'row',
  },
  genresText: {
    color: Color.lightGrayText,
    fontSize: 12,
    fontFamily: font.PoppinsRegular,
    lineHeight: 16,
    marginRight: 12,
  },
  scoreValue: { color: Color.whiteText,
     fontWeight: 'bold' },

  scoreLabel: { color: Color.whiteText,
     fontSize: 10 },

  description: {
    lineHeight: 19, fontSize: 14, fontFamily: font.PoppinsRegular
    , color: Color.lightGrayText,
     marginTop:4,
       marginBottom:10,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems:"center",
    
    // backgroundColor:'red'
    // marginTop: 4,
    // marginBottom: 10,

  },

  btnContainer: {

    justifyContent: 'space-between'
  },
  playText: { color: Color.whiteText, fontWeight: 'bold' },
  netflixButton: {
    backgroundColor: '#000',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderWidth: 1,
    borderColor: Color.whiteText,
    borderRadius: 6,
  },
  netflixText: { color: Color.whiteText, marginLeft: 6 },
  footerNav: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    // marginTop: 30,
    alignItems: "center",
    // marginVertical: 24,
     paddingHorizontal:24,
    //   marginTop:
  },
  // linkText: { color: color.whitetext, fontSize: 14, fontWeight: "500", textAlign: "center" },

  footerButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  linkText: {
    fontSize: 14,
    color: Color.primary,
    // marginRight: 5,
    fontFamily: font.PoppinsMedium,
    lineHeight:18
  },
  arrowIcon: {
    height: 18,
    width: 18,
    marginLeft: 6
  },

  watchNowContainer: {

    flexDirection: 'row',
    // marginVertical:'auto',
    // marginTop: "5%",
    // marginBottom: "auto",
    justifyContent: 'center',
    alignSelf: 'center',
    backgroundColor: Color.grey700,
    height: 45,
    alignItems: 'center',
    width: Dimensions.get('window').width * 0.30,
    borderRadius: 10,
  },
  watchNowImg: {
    height: 16,
    width: 16,
    tintColor:Color.whiteText,
    // marginRight: 16,

  },
  watchNowText: {
    fontSize: 14,
    fontFamily: font.PoppinsBold,
    color: Color.whiteText,
    lineHeight: 18,
  },
 scrollBarTrack: {
    width: 6,
    alignItems: 'center',
    marginRight: 4,
    backgroundColor:Color.darkGrey
  },
  scrollBar: {
    width: 4,
    borderRadius: 2,
    backgroundColor: '#808080', // 👈 custom gray scrollbar
  },
  gradient: {
    position: 'absolute',
    bottom: -4,
    left: 0,
    right: 0,
    height: 44,
  },
  scrollView: {
    flex: 1,
    paddingRight: 8,
  },
  scrollViewContainer: {
    height: windowHeight * 0.25,
    marginTop: 0,
    flexDirection: 'row',
    overflow:'hidden',
    // position: 'relative',
  },
   tButton: {
    position: 'absolute',
    right: 10,
    bottom: 10,
    padding: 6,
    borderRadius: 20,
    // zIndex: 111111,

  },






  video: {
    width: '100%',
    height: 250,
  },
  loader: {
    position: 'absolute',
    alignSelf: 'center',
  },
  controls: {
    position: 'absolute',
    bottom: 10,
    left: 10,
    right: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  controlBtn: {
    marginHorizontal: 10,
  },
  slider: {
    flex: 1,
  },
});

export default styles;
