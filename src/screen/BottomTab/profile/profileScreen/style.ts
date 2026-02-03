
import { StyleSheet } from 'react-native';
import { Color } from '@theme/color';
import font from '@theme/font';
     
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Color.background, },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 14,
    // marginHorizontal: 13
  },
  logo: { fontSize: 22, color:  Color.whiteText, fontWeight: '600', marginLeft: 10 },
  search: { fontSize: 20, color:  Color.whiteText },

  avatarList: { paddingVertical: 10 },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 60,
    marginRight: 10,
  },

  sectionTitle: {
    color:  Color.whiteText,
    fontSize: 16,
    // paddingHorizontal: 20,
    // marginVertical: 10,
    lineHeight:22,
  
    fontFamily: font.PoppinsBold,
  },
  cardList: { paddingBottom: 10 },
  movieCard: {
    width: 120,
    height: 180,
    borderRadius: 12,
    marginRight: 10,
    paddingHorizontal:20,
  },

  feedCard: {
    backgroundColor: '#222',
    padding: 12,
    borderRadius: 10,
    marginVertical: 10,
  },
  feedHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  feedAvatar: { width: 40, height: 40, borderRadius: 20, marginRight: 10 },
  feedUser: { color: '#ccc', fontSize: 12 },
  feedTitle: { color:  Color.whiteText, fontSize: 16, fontWeight: '600' },
  feedComment: { color: '#ccc', marginVertical: 8 },
  feedPoster: { width: '100%', height: 180, borderRadius: 12 },
  listArrow:{
      height: 24,
                  width: 24,
                  resizeMode: "contain"
  },
});
export default styles;
