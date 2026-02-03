
import { StyleSheet } from 'react-native';
import ResponsiveSize from '@utils/ResponsiveSize';
import { Color } from '@theme/color';
import { hp } from '@utils/Constant';
import font from '@theme/font';
  

const styles = StyleSheet.create({
  maincontainer: {
    flex: 1,
    backgroundColor:  Color.background,
  },
  scoreBox: {
    padding: 5,
    borderRadius: 12,
    width: '100%',
  },
  scoreHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  scoreTitle: {
    color: '#fff',
    fontSize: 20,
    marginLeft: 8,
      fontFamily:font.PoppinsBold,
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
    paddingTop: 18,
  },
  searchBar: {
    flexDirection: 'row',
    backgroundColor: '#333',
    borderRadius: 8,
    padding: 10,
    alignItems: 'center',
  },
  searchInput: {
    marginLeft: 10,
    color:  Color.whiteText,
    flex: 1,
  },
  heading: {
    color: Color.whiteText,
    fontSize: 18,
    fontFamily:font.PoppinsBold,
    marginTop: 20,
    lineHeight: 22,
  },
  todayText:{
    fontSize:16,
    fontFamily:font.PoppinsBold,
    color:Color.whiteText,
  },
  subText: {
   fontFamily:font.PoppinsBold,
    color: Color.lightGrayText,

  },
  movieCard: {
    flexDirection: 'row',
    marginTop: 16,
    paddingHorizontal:18,
    // backgroundColor:'red'
    // paddingBottom:20, 
  },
  poster: {
    width: 98,
    height: 135,
    borderRadius: 8,
  },
  info: {
    flex: 1,
    marginLeft: 15,
    // backgroundColor:'red',
  },
  title: {
    color: Color.whiteText,
    fontSize: 16,
       fontFamily:font.PoppinsMedium,
    width:'95%',
  },
  year: {
    color: Color.lightGrayText,
    fontSize: 12,
   fontFamily:font.PoppinsRegular
     

  },
  icons: {
    // flexDirection: 'row',
    // alignItems: 'center',
    // gap: 8,
    // backgroundColor:'green' ,
  },
  iconprimary: {
    paddingHorizontal: 8,
    paddingVertical:4,
    height: 35,
    width: 30,
    // marginRight: 4,
    flexDirection:"row",
    // backgroundColor:'red'
  },

  

});
export default styles;
