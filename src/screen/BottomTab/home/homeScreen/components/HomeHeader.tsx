import React, { useCallback } from 'react';
import { View, Text } from 'react-native';
import HorizontalMovieList from '@components/common/HorizontalMovieList/HorizontalMovieList';
import ScreenNameEnum from '@routes/screenName.enum';
import { Color } from '@theme/color';
import { t } from 'i18next';
import styles from '../style';

type MovieItem = { imdb_id?: string; [k: string]: unknown };

type Props = {
  trendingData: MovieItem[];
  recommendData: MovieItem[];
  bookmarkData: MovieItem[];
  loadingTrending: boolean;
  loadingBookmark: boolean;
  loadingRecs: boolean;
  onFeedReached: () => void;
};

const HomeHeader = React.memo(({
  trendingData,
  recommendData,
  bookmarkData,
  loadingTrending,
  loadingBookmark,
  loadingRecs,
  onFeedReached,
}: Props) => {
  const handleLayout = useCallback(() => {
    onFeedReached();
  }, [onFeedReached]);

  return (
    <View style={{ marginHorizontal: 14, marginLeft: 5 }}>
      <View
        style={{
          borderWidth: 0.5,
          borderColor: Color.textGray,
          marginBottom: 8,
          marginLeft: 5,
        }}
      />
      <View style={{ paddingLeft: 10, paddingRight: 4 }}>
        <HorizontalMovieList
          title={t('home.trending')}
          data={trendingData}
          navigateTo={ScreenNameEnum.DiscoverTab}
          isSelectList="2"
          type="Trending"
          loading={loadingTrending}
          emptyData={t('emptyState.noTrending')}
          scoreType="Rec"
        />
        <HorizontalMovieList
          title={t('home.recsForYou')}
          data={recommendData}
          navigateTo={ScreenNameEnum.DiscoverTab}
          isSelectList="1"
          type="Recs"
          loading={loadingRecs}
          emptyData={t('emptyState.noRecsForYou')}
          scoreType="Rec"
        />
        {bookmarkData?.length > 0 && (
          <HorizontalMovieList
            title={t('home.wantwatch')}
            data={bookmarkData}
            navigateTo={ScreenNameEnum.DiscoverTab}
            isSelectList="5"
            type="wantWatch"
            loading={loadingBookmark}
            emptyData={t('emptyState.nobookmarks')}
            scoreType="Rec"
          />
        )}
      </View>
      <Text
        allowFontScaling={false}
        style={styles.sectionTitle}
        onLayout={handleLayout}
      >
        {t('home.yourFeed')}
      </Text>
    </View>
  );
});

HomeHeader.displayName = 'HomeHeader';

export default HomeHeader;
