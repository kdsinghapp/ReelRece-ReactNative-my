import { Color } from "@theme/color";
import font from "@theme/font";
import { Platform, StyleSheet } from "react-native";
 export const WatchStyle = StyleSheet.create({
  mincontainer: {
    flex: 1,
    backgroundColor: Color.background,
  },
  container: {
    flex: 1,
    backgroundColor: Color.background,
    // marginTop: 18,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 15,
    alignItems: 'center',
    marginTop: 10
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center"
  },
  headerRight: {
    flexDirection: "row"
  },
  logo: {
    fontSize: 20,
    color: Color.whiteText,
    // fontWeight: '600'
    fontFamily: font.PoppinsBold,
    lineHeight: 28,
  },
  notificationIcon: {
    height: 22,
    width: 22,
    marginRight: 12,
  },
  searchIcon: {
    height: 20,
    width: 20
  },
  onlineuserContainer: {
    marginTop: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  userOnlineImg: {
    height: 60,
    width: 60,
    borderRadius: 30,
    marginRight: 10,
  },
  invitBtnContianerr: {
    height: 60,
    width: 60,
    borderRadius: 30,
    marginRight: 10,
    backgroundColor: Color.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  invitBtnIcon: {
    height: 20,
    width: 20,
  },
  groupsContainer: {
    // marginBottom: 150,
    marginBottom: 50,
    marginTop: 20, 
    },
  modalOverlay: {
    position: 'absolute',
    top: 0,
  bottom: Platform.OS === 'ios' ? 60 : 11,
    left: 10,
    right: 5,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 99,
  },
  modalContent: {
    // paddingHorizontal: 14,
    width: '100%',
  },
  modalButtonsContainer: {
    backgroundColor: Color.grey,
    borderRadius: 10,
    // marginTop: -25,
    paddingHorizontal: 14,
  },
  modalItemContainer: {
    paddingHorizontal: 14,
    backgroundColor: Color.grey,
    paddingVertical: 16,
    borderRadius: 10,
   },
  modalContainer: {
    flexDirection: 'row',
    paddingVertical: 6,
  },
  modalRow: {
    borderBottomColor: Color.textGray,
    borderBottomWidth: 1,
    marginVertical: 10,
  },
  modalImg: {
    height: 20,
    width: 20,
    resizeMode: 'contain',
    // marginRight: 14,
    alignSelf: 'center',
  },
  modalText: {
    marginLeft: 14,
  },
  // bottomActionBar: {
  //   // position: 'relative',
  //   position: 'absolute',
  //   bottom: 0, // Height of your tab bar (adjust if different)
  //   left: 0,
  //   right: 0,
  //   backgroundColor: Color.background,
  //   paddingVertical: 16,
  //   flexDirection: 'row',
  //   justifyContent: 'space-around',
  //   alignItems: 'flex-end',
  //   // borderTopWidth: 1,
  //   // borderTopColor: Color.textGray,
  //   zIndex: 1000, // Higher than tab bar
  //   elevation: 100, // For Android
  // },



  bottomActionBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0, // sit exactly at bottom
    // top:11,
    // height: 60, // same as tab bar if you want exact overlap
    backgroundColor: Color.background,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingBottom: 20,
    zIndex: 1001, // higher than tab bar
    elevation: 101,
  },

  bottomActionButton: {
    paddingHorizontal: 10,
    justifyContent: 'center'
  },
  bottomActionText: {
    alignSelf: 'center'
  },
});