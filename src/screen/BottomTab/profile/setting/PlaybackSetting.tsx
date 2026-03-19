import { StyleSheet, Text, View } from 'react-native';
import React from 'react';
import { Color } from '@theme/color';
import { useNavigation } from '@react-navigation/native';
import useToggleFlag from './useToggleFlag';
import font from '@theme/font';
import { SafeAreaView } from 'react-native-safe-area-context';
import imageIndex from '@assets/imageIndex';
import { CustomStatusBar, HeaderCustom } from '@components/index';
import CustomSwitch from '@components/common/CustomSwitch/CustomSwitch';
import { t } from 'i18next';
import { useNetworkStatus } from '@hooks/useNetworkStatus';

const PlaybackSetting = () => {


  const navigation = useNavigation();

  const { flagValue: isTrailer, handleToggle: handleTrailerToggle } = useToggleFlag("autoplay_trailer");
  const { flagValue: isSound, handleToggle: handleSoundToggle } = useToggleFlag("videos_start_with_sound");
 const isOnline = useNetworkStatus();
  return (
    <SafeAreaView edges={isOnline ? ['top'] : []}  style={styles.container}>
      <CustomStatusBar />
      <HeaderCustom
        title={t("setting.menu.playback")}
        backIcon={imageIndex.backArrow}
        onRightPress={() => navigation.goBack()}
      />
      <View style={styles.detailContainer}>
        <View>
          <Text style={styles.headingText}>{t("setting.playback.autoplayTrailer")}</Text>
          <Text style={styles.detailText}>{t("setting.playback.trailerWillAutoPlay")}</Text>
        </View>

        <CustomSwitch
          value={isTrailer}
          onValueChange={handleTrailerToggle}
        />
      </View>

      <View style={styles.detailContainer}>
        <Text style={styles.headingText}>{t("setting.playback.videosStartWithSound")}</Text>

        <CustomSwitch
          value={isSound}
          onValueChange={handleSoundToggle}
        />

      </View>
    </SafeAreaView>
  );
};

export default React.memo(PlaybackSetting);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Color.background,
    paddingTop: 12,
  },
  detailContainer: {
    marginTop: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    alignItems: 'center',
  },
  headingText: {
    fontSize: 16,
    fontFamily: font.PoppinsMedium,
    lineHeight: 20,
    color: Color.whiteText,
    marginBottom: 6,
  },
  detailText: {
    fontSize: 14,
    fontFamily: font.PoppinsRegular,
    lineHeight: 18,
    color: Color.placeHolder,
    marginBottom: 6,
  },
});
