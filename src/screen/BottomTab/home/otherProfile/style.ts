
import { StyleSheet } from 'react-native';
import { Color } from '@theme/color';
import font from '@theme/font';
 
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Color.background, position: 'relative', },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 14,
    // marginHorizontal: 13
  },
  logo: { fontSize: 22, color: Color.whiteText, fontWeight: '600', marginLeft: 10 },
  search: { fontSize: 20, color: Color.whiteText },

  avatarList: { paddingVertical: 10 },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 60,
    marginRight: 10,
  },

  sectionTitle: {
    color: Color.whiteText,
    fontSize: 16,
    lineHeight:20,
    marginVertical: 10,
    fontFamily: font.PoppinsBold
    
  },
  cardList: { paddingBottom: 10 },
  backArrow: {
    height: 24,
    width: 24,
    resizeMode: "contain"
  },
  headingContainer: { flexDirection: "row", justifyContent: "space-between", alignItems: 'center' },

profileCardContainer:{
  marginTop:0,
  marginBottom:20,
}
});
export default styles;
