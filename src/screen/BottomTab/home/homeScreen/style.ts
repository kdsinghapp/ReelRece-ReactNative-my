
import { StyleSheet } from 'react-native';
import { Color } from '@theme/color';
import font from '@theme/font';
 

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Color.background },
  // header: {
  //   flexDirection: 'row',
  //   justifyContent: 'space-between',
  //   alignItems: 'center',
  //   paddingHorizontal: 13,
  //   height:50,
  //   backgroundColor:'rgba(221, 6, 6, 0.24)',
  //   zIndex:99,

  // },

  header: {
    // position: 'absolute', // Makes it float
    top: 0,               // Stick to top
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    height: 50,
    width:"100%",
    backgroundColor: Color.headerTransparent, // ✅ Transparent
    zIndex: 10,  // ✅ This is clean
    //  marginBottom:20,
  },

  logo: {  color: Color.whiteText,  marginLeft: 12 },
  search: { fontSize: 20, color: Color.whiteText },

  avatarList: { paddingBottom:10, paddingHorizontal:14             , },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 60,
    marginRight: 14,
  },
  sectionTitle: {
    color: Color.whiteText,
    fontSize: 16,
    marginVertical: 5,
    marginLeft: 12,
    fontFamily: font.PoppinsBold
  },
  cardList: { paddingBottom: 10 },
  backArrowImg: {
    height: 20,
    width: 20,
    resizeMode: "contain",
    marginLeft: 14


  }




});
export default styles;
