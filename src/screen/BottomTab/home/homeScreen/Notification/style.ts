
import { Platform, StyleSheet } from 'react-native';
import { Color } from '@theme/color';
import font from '@theme/font';
 
const styles = StyleSheet.create({
  container: { flex: 1,backgroundColor:Color.background,     marginTop: Platform.OS === 'ios' ? 15 : 4,
 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 18,
    marginHorizontal: 5
  },
  logo: { fontSize: 22, color:  Color.whiteText, fontWeight: '600', marginLeft: 10 },
  search: { fontSize: 20, color:  Color.whiteText },
cardContainer:{
  marginVertical:6,
},
card: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    // backgroundColor:'red'
  },
  
  content: {
    flex: 1,
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  name: {
    color:  Color.whiteText,
fontFamily:font.PoppinsBold,
lineHeight:18,
    fontSize: 16,
  },
  headerContainer:{
    flexDirection:'row',
    alignItems:'center',
    marginBottom:20,
    paddingHorizontal:18,
    marginTop: Platform.OS === 'ios' ? 0 : 18,
    justifyContent:"center"
  },
  action: {
    fontSize: 14,
    fontFamily: font.PoppinsRegular,
    lineHeight: 18,
    color: Color.whiteText,
  },
  movie: {
    color: Color.primary,
    fontFamily: font.PoppinsBold,
lineHeight:16,
    fontSize: 14,
    marginTop: 2,
  },
  time: {
    color: Color.placeHolder,
    fontSize: 14,
       fontFamily: font.PoppinsRegular,
lineHeight:16,
    marginTop: 2,
  },
    icon: {
    width: 24,
    height: 24,
   

  },
    title: {
  flex: 1,
  textAlign: 'center',
  fontSize: 20,
  color: Color.whiteText,
  fontFamily: font.PoppinsBold, // 👈 Poppins font added
    
  },
  buttonGroup: {
    // backgroundColor:"red",
    width:180,
    flexDirection: 'row',
    marginRight:20,
    alignSelf:'flex-end',
    // marginTop:-0,
    marginBottom:28
  },
  accept: {
    backgroundColor: Color.primary,
    paddingVertical: 9,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginRight: 18,
  },
  decline: {
    borderWidth: 1,
    borderColor: '#fff',
    paddingVertical: 9,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  buttonText: {
    color: Color.lightGrayText,
    fontSize: 14,
    lineHeight:16,
    fontFamily:font.PoppinsMedium,
  },
  rating: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
  },
  rankingText:{
    color:  Color.whiteText,
    fontWeight: '600',
    fontSize: 10,
  },
  ranking:{
    height:45,
    width:35 ,
    // alignItems:'center',
    justifyContent:'center',
    paddingLeft:8
  },
  avatarContainer: {
    position: 'relative',
    // Adjust width/height if needed to match your avatar size
  },
  avatar: {
    width: 60,  // adjust as needed
    height: 60, 
    borderRadius: 33, // half of width/height to make it circular
    marginRight:30,
  },
  onlineIndicator: {
    position: 'absolute',
    right: 0,
    left:45,
    top: 2,
    width: 14,  // size of the indicator
    height: 14, // size of the indicator
    borderRadius: 10, // half of width/height to make it circular
    backgroundColor: 'lightgreen',
    borderWidth: 2.5,
    borderColor: Color.background, // or whatever your background color is
  },
  noNotiText:{
    fontFamily:font.PoppinsMedium,
    fontSize:14.5,
    color:Color.lightGrayText,
   textAlign:"center" ,
 
  },
});
export default styles;
