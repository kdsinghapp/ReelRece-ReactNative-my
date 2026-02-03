import { Color } from "@theme/color";
import font from "@theme/font";
import { Dimensions, StyleSheet } from "react-native";
 
const { height: windowHeight } = Dimensions.get('window');

export const styles = StyleSheet.create({
  feedCard: {
    backgroundColor: Color.background,
    marginBottom: 20,
    paddingHorizontal: 16,
  },
  feedHeader: {
    flexDirection: 'row',

    marginBottom: 0,
  },
  feedAvatar: {
    width: 60,
    height: 60,
    borderRadius: 60,
    marginRight: 10,
  },
  feedUser: {
    fontFamily: font.PoppinsBold,
    marginBottom: 4,
    // marginTop: 3,
  },
  rankedText: {
    marginVertical: 4,
    // fontWeight:'500',
    marginLeft: 4,
    color: Color.whiteText,
  },
  feedTitle: {
    flexShrink: 1,
  },
  feedComment: {
    marginTop: 12,
    marginRight: 8,
  },
  todayText: {
    color: Color.textGray,
    fontSize: 12,
    fontFamily: font.PoppinsRegular,
    lineHeight: 16,
  },
  videoWrapper: {
    height: windowHeight / 3.7,
    // height:300,
    width: '100%',
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: Color.background,
    marginTop: 14, 
      borderRadius: 10,
  },
  video: {
    height: '100%',
    marginTop: 1,
    ...StyleSheet.absoluteFillObject,
    borderRadius: 0,
    alignSelf: 'center',
    width: '100%',
    // zIndex:2
  },

  posterOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1,
    overflow: 'hidden',
    height: "100%",
    resizeMode: "cover",
    width: '100%',
    borderRadius: 10,
  },
  progressBarContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: Color.grey, // Optional: background for contrast
    zIndex: 3,
    borderBottomLeftRadius: 3,
    borderBottomRightRadius: 3,
  },
  progressBar: {
    height: 3,
    backgroundColor: Color.primary, // Blue color line
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
  },
  tButton: {
    position: 'absolute',
    right: 10,
    bottom: 24,
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 10,
    borderRadius: 20,
    zIndex: 15,
  },

  footerActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 12,
  },
  footerIcon: {
    height: 20,
    width: 20,
    marginRight: 14,
  },
  footerSaveIcon: {
    height: 20,
    width: 20,
    marginRight: 10,
  },
  footerDivider: {
    borderWidth: 0.8,
    borderColor: Color.grey,
    marginTop: 15,
  },
 
});