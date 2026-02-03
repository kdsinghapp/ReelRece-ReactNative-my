import { useNavigation } from '@react-navigation/native';
import React, { useEffect } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Alert, Pressable, Platform, } from 'react-native';
import { Color } from '@theme/color';
import font from '@theme/font';
import { t } from 'i18next';



interface HeaderCustomProps {
  title?: string;
  onBackPressW?: () => void;
  onRightPress?: () => void;
  backIcon?: string | number | null;         // keeping  for Image source
  rightIcon?: string | number | null;
  headerColor?: string;   // Should be color string, not ReactNode
  multiplename?: boolean;

}

const HeaderCustom: React.FC<HeaderCustomProps> = ({
  title,
  onBackPressW,
  onRightPress,
  backIcon,
  rightIcon,
  headerColor,
  multiplename,
}) => {
  const navigation = useNavigation()
  const onBackPress = () => {
    if (onBackPressW) {
      onBackPressW();  // Custom back press
    } else if (navigation.canGoBack()) {
      navigation.goBack();  // Default back
    } else {
      // Alert.alert("No previous screen to go back to.");
    }
  };

  return (
    <View style={[
      styles.container,  // Default styles (when no headerColor)
      headerColor && {  // Only if headerColor exists, apply these overrides
        backgroundColor: headerColor,
        // position: 'absolute',
        // top: 0,
        // left: 0,
        // right: 0,
        zIndex: 10, // ensure it shows above content
        paddingHorizontal: 16,
        height: 50,
      }
    ]}>
      {/* {backIcon   &&  ( */}
      <TouchableOpacity onPress={backIcon && onBackPress}>
        <Image source={backIcon} style={[styles.icon,]} resizeMode="contain" />
      </TouchableOpacity>
      {/* )  } */}
      {multiplename
        ? <View style={styles.multiplenameContainer} >
          <Text allowFontScaling={false} style={styles.title}>{t("common.you")}</Text>
          <Text allowFontScaling={false} style={styles.andText}>{t("common.and")}</Text>
          <Text allowFontScaling={false} style={styles.title} numberOfLines={1}>{title}</Text>
        </View>
        : <Text allowFontScaling={false} style={styles.title}>{title}</Text>
      }


      <TouchableOpacity onPress={onRightPress} style={styles.sideIcon}>
        {rightIcon && (<Image source={rightIcon} style={[styles.icon, { height: 24, width: 24 }]} resizeMode="contain" />
        )}
      </TouchableOpacity>

    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    // marginTop: 10,
    marginBottom: Platform.OS === 'ios' ? 10 : 27,
    // marginHorizontal: 16,
    // backgroundColor:'red'
    paddingHorizontal: 16
  },
  multiplenameContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    // backgroundColor:'red',
    width: "82%"
  },
  andText: {
    color: Color.whiteText,
    fontFamily: font.PoppinsRegular,
    lineHeight: 16,
    fontSize: 14,
    marginHorizontal: 8,

  },
  title: {
    // alignSelf: 'center',
    textAlign: 'center',
    fontSize: 16,
    fontFamily: font.PoppinsBold,
    color: Color.whiteText,
    lineHeight: 20,
    flex: 1,

  },
  sideIcon: {
    width: 28,
    justifyContent: 'flex-end',
    //  backgroundColor:'red'
  },
  icon: {
    width: 28,
    height: 28,
    justifyContent: 'flex-end',


    // backgroundColor:'red'
  },
});

export default React.memo(HeaderCustom);
