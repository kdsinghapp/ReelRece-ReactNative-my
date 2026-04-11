import React, { useMemo } from 'react';
import { View, TouchableOpacity, Image, StyleSheet, Animated } from 'react-native';
import imageIndex from '@assets/imageIndex';
import { Color } from '@theme/color';

interface RankingTabsProps {
  activeTab: 'ranking' | 'dislike';
  onTabPress: (tab: 'ranking' | 'dislike') => void;
}

const RankingTabs = ({ activeTab, onTabPress }: RankingTabsProps) => {
  const isRanking = activeTab === 'ranking';

  return (
    <View style={styles.container}>
      <View style={styles.tabsRow}>
        <TouchableOpacity
          style={styles.tab}
          onPress={() => onTabPress('ranking')}
          activeOpacity={0.7}
        >
          <Image
            source={imageIndex.rankingTab}
            style={[styles.icon,]}
            resizeMode="contain"
          />
          {isRanking && <View style={styles.activeIndicator} />}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.tab}
          onPress={() => onTabPress('dislike')}
          activeOpacity={0.7}
        >
          <Image
            source={imageIndex.thumpDown}
            style={[styles.icon]}
            resizeMode="contain"
          />
          {!isRanking && <View style={styles.activeIndicator} />}
        </TouchableOpacity>
      </View>
      <View style={styles.bottomBorder} />
    </View>
  );
};

export default React.memo(RankingTabs);

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginBottom: 7,
  },
  tabsRow: {
    flexDirection: 'row',
    height: 50,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  icon: {
    width: 28,
    height: 28,
  },
  activeIndicator: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    height: 2,
    backgroundColor: Color.whiteText,
  },
  bottomBorder: {
    width: '100%',
    height: 1,
    backgroundColor: '#333',
    position: 'absolute',
    bottom: 0,
  },
});
