
import { StyleSheet } from 'react-native';
 import { Color } from '@theme/color';
import font from '@theme/font';
 
const styles = StyleSheet.create({
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
    fontWeight: '700',
  },
  modalContent: {
    backgroundColor: Color.grey,
    borderRadius: 8,
    padding: 10,
    alignItems: 'center',
    marginTop: 15
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
    color: Color.whiteText,
    flex: 1,
  },
  heading: {
    color: Color.whiteText,
    fontSize: 15,

    fontFamily: font.PoppinsBold,

    marginTop: 20,
    lineHeight: 22,
    marginBottom: 10,
  },
  subText: {
    fontWeight: '400',
    color: '#CDCDCD',
    fontSize: 14

  }, 
  movieCardButton: {
    flexDirection: 'row',
    flex: 1
  }, 
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  titleContainer: {
    flex: 1,
    paddingRight: 10,
  },
  closeIcon: {
    height: 20,
    width: 19,
  },

  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 6,
  },
  iconRow: {
    // marginTop:22,
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconImage: {
    height: 23,
    width: 23,
    marginLeft: 10,
  },

 
  maincontainer: {
    flex: 1,
    backgroundColor: Color.background,
  },
  container: {
    flex: 1,
    marginHorizontal: 16,
    paddingTop: 5,
  },
  centerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },

  movieCard: {
    flexDirection: 'row',
    marginTop: 16,
  },
  poster: {
    width: 98,
    height: 135,
    borderRadius: 8,
    
  },
  info: {
    flex: 1,
    marginLeft: 15,
    // backgroundColor:'green',

  },
  title: {
    paddingRight: 18
    // flex:1

  },
  year: {
    marginTop: 5,
  },
  icons: {
    gap: 8,
  },
  iconprimary: {
    marginHorizontal: 3, 
    flex: 1, 
  },
  discoverprimaryContainer: {
    backgroundColor: '#008ac9',
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    // marginHorizontal: 20,
    borderRadius: 10,
    marginTop: 10,


  },
  discoverprimary: {
    color: Color.whiteText,
    fontSize: 16,
    fontFamily: font.PoppinsBold,


  },
  chanceText: {
    // marginTop:24,
    fontSize: 16,
    fontFamily: font.PoppinsBold,
    color: Color.whiteText,

  },


});
export default styles;
