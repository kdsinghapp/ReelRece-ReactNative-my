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
  suggestedRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  suggestedLabel: {
    color: Color.whiteText,
    fontFamily: font.PoppinsMedium,
    fontSize: 14,
  },
  suggestedFollowButton: {
    backgroundColor: Color.primary,
    // paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 90,
    height:36
  },
  suggestedFollowingButton: {
    backgroundColor: Color.background,
    borderColor: Color.whiteText,
    borderWidth: 0.5,
  },
  suggestedFollowText: {
    color: Color.whiteText,
    fontFamily: font.PoppinsBold,
    fontSize: 12,
  },
  feedHeader: {
    flexDirection: 'row',

    marginBottom: 0,
  },
  feedAvatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    marginRight: 10,
  },
  feedUser: {
    fontFamily: font.PoppinsMedium,
    marginBottom: 4,
    // marginTop: 3,
  },
  rankedText: {
    marginVertical: 4,
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
    backgroundColor: Color.grey,
    zIndex: 3,
    borderBottomLeftRadius: 3,
    borderBottomRightRadius: 3,
  },
  progressBar: {
    height: 3,
    backgroundColor: Color.primary,
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
    height: 24,
    width: 24,
    marginRight: 14,
  },
  footerSaveIcon: {
    height: 24,
    width: 24,
    marginRight: 10,
  },
  footerDivider: {
    borderWidth: 0.8,
    borderColor: Color.grey,
    marginTop: 15,
  },
  feedHeaderRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  feedHeaderTitleWrap: {
    flex: 1,
    paddingRight: 10,
  },
  commentMargin: {
    marginLeft: 6,
  },
  muteIcon: {
    height: 18,
    width: 18,
    tintColor: Color.whiteText,
  },
  rankingTouch: {
    alignSelf: 'flex-start',
  },
  bookmarkTouch: {
    height: 35,
    width: 30,
  },
});