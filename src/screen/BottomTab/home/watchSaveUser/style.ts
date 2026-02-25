
import { StyleSheet } from 'react-native';
import { Color } from '@theme/color';
import font from '@theme/font';


const styles = StyleSheet.create({
  maincontainer: {
    flex: 1,
    backgroundColor: Color.background,
  },

  scoreTitle: {
    color: Color.whiteText,
    fontSize: 20,
    marginLeft: 8,
    fontFamily: font.PoppinsBold,
    lineHeight: 24,

  },
  modalContent: {
    backgroundColor: Color.grey,
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 15
  },
  container: {
    flex: 1,
  },
  searchBar: {
    flexDirection: 'row',
    backgroundColor: '#333',
    borderRadius: 8,
    padding: 10,
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
  },
  title: {
    color: Color.whiteText,
    width: '90%',
    fontSize: 16,
    lineHeight: 20,
    fontFamily: font.PoppinsMedium,

  },
  year: {
    color: Color.lightGrayText,
    fontSize: 14,
    lineHeight: 18,
    marginTop: 4,
    fontFamily: font.PoppinsRegular,


  },
  icons: {
    alignItems: 'center',
  },
  iconprimary: {
  },
});
export default styles;
