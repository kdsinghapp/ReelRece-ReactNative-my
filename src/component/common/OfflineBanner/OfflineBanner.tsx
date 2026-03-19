import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';

const OfflineBanner: React.FC = () => {
  const { t } = useTranslation();

  return (
    <SafeAreaView edges={['top']} style={styles.banner}>
      <View style={styles.indicator} />
      <Text style={styles.text} allowFontScaling={false}>
        {t('common.offline')}
      </Text>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  banner: {
    backgroundColor: '#C34429',
    paddingVertical: 8,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  indicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.9)',
  },
  text: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
});

export default OfflineBanner;
