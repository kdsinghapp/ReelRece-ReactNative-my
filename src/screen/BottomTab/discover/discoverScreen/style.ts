
import { StyleSheet } from 'react-native';
import { Color } from '@theme/color';
import font from '@theme/font';
 
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Color.background, },
  header: { paddingTop: 5, flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 19.8 },
  filterRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 10 },
  filterButton: {
    // paddingBottom:40,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginRight: 4,
    height: 30, borderRadius: 30
  },

  logo: { fontSize: 22, color: Color.whiteText, fontWeight: '600', marginLeft: 10 },

  card: { width: '48%', marginBottom: 15, borderRadius: 10, overflow: 'hidden', },
  image: {   width: '100%',
  aspectRatio: 2 / 3, // common poster ratio
  borderRadius: 8, },
  rating: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    paddingHorizontal: 0,
    paddingVertical: 0,
    borderRadius: 6,
  },
  filterText: {
    color: Color.whiteText,
    fontWeight: '500',
    fontSize: 12,
  },

  ratingText: { color: Color.whiteText, fontWeight: 'bold' },
  list: { paddingBottom: 200,flexGrow:1 },
  sortbyImg: { height: 16, width: 16, resizeMode: 'contain' },
  // sortByText:{fontSize:12, color:Color.whiteText,marginLeft:7 ,fontFamily:font.PoppinsRegular},

  contentTypeContainer: {
    width: '45%', flexDirection: 'row', justifyContent: "space-between",
    //  backgroundColor: "#191919", 
    backgroundColor: Color.green,
    borderRadius: 20
  },
  //  filter

  rowWrapper: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    flexWrap: 'wrap',
    width: '100%',
    marginTop: 6,
    height: 27,
  },
  contentTypeWrapper: {
    flexDirection: 'row',
    // paddingVertical: 4,
    height: 27,
    borderRadius: 20,
    backgroundColor:Color.graybackGround,
    width: '46%',
    flexWrap: 'wrap',
  },
  contentTypeButton: {
    flex: 1,
    // height:'%',
    // paddingVertical: "auto",
    height: '99%',
        backgroundColor:Color.graybackGround,

    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    // marginBottom: 6,
    // marginRight: 6,
  },
  contentTypeButtonActive: {
    backgroundColor: Color.grey,
  },
  contentTypeText: {
    color: Color.whiteText,
    fontSize: 12,
    textAlign: 'center',
    fontFamily: font.PoppinsRegular,
    lineHeight: 16,
  },
  contentTypeTextActive: {
    color: Color.primary,
  },
  sortByWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    borderRadius: 20,
    width: '48%',
    height: 27,
  },
  sortIcon: {
    width: 16,
    height: 14,
  },
  sortByIcon: {
    marginRight: 4,
  },
  sortByLabel: {
  },
  sortByValueWrapper: {
    marginLeft: 6,
    borderRadius: 20,
    // paddingVertical: 6,
    height: 27,

    backgroundColor: Color.modalBg,
    flex: 1,
    justifyContent: 'center',
  },
  sortByValueText: {
    alignSelf: 'center',
  },
  noMoreMovie:{fontSize:16, color:Color.grey200, fontFamily:font.PoppinsMedium,marginTop:20,marginBottom:40,}
});
export default styles;
