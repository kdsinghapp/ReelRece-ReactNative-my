
import { StyleSheet } from 'react-native';
 import { Color } from '@theme/color';
import font from '@theme/font';
  

const styles = StyleSheet.create({
  maincontainer: {
    flex: 1,
    backgroundColor:  Color.background,
  },
  // scoreBox: {
  //   padding: 5,
  //   borderRadius: 12,
  //   width: '100%',
  // },
  // scoreHeader: {
  //   flexDirection: 'row',
  //   alignItems: 'center',
  //   marginBottom: 12,
  // },
  scoreTitle: {
    color: Color.whiteText,
    fontSize: 20,
    marginLeft: 8,
    // fontWeight: '700',
    fontFamily:font.PoppinsBold,
    lineHeight:24,

  },
  modalContent: {
    backgroundColor: Color.grey,
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 15
  },
  // heading: {
  //   color: '#008AC9',
  //   fontSize: 21,
  //   fontWeight: '700',
  //   marginBottom: 20,
  //   textAlign: 'center',
  // },
  container: {
    flex: 1,
    // marginHorizontal: 15,
    // paddingTop: 15,
  },
  searchBar: {
    flexDirection: 'row',
    backgroundColor: '#333',
    borderRadius: 8,
    padding: 10,
    alignItems: 'center',
  },
  // searchInput: {
  //   marginLeft: 10,
  //   color:  Color.whiteText,
  //   flex: 1,
  // },
  // heading: {
  //   color: Color.whiteText,
  //   fontSize: 17,
  //   fontWeight: '700',
  //   marginTop: 20,
  //   lineHeight: 22,
  // },

  movieCard: {
    flexDirection: 'row',
    marginTop: 16,
    // backgroundColor:'red'
  },
  poster: {
    width: 98,
    height: 135,
    borderRadius: 8,
  },
  info: {
    flex: 1,
    marginLeft: 15,
  },
  title: {
    color: Color.whiteText,
    width:'90%',
    fontSize: 16,
    lineHeight:20,
    fontFamily:font.PoppinsMedium,
    
  },
  year: {
    color: Color.lightGrayText,
    fontSize: 14,
    lineHeight:18,
    marginTop:4,
    fontFamily:font.PoppinsRegular,


  },
  icons: {
    // flexDirection: 'row',
    // justifyContent:'flex-start',
    alignItems: 'center',
    // backgroundColor:'green'
    // gap: 4,
  },
  iconprimary: {
    // height: 35,
    // width: 30,
    // marginHorizontal: 4,
    // flexDirection:"row"
  },
});
export default styles;
