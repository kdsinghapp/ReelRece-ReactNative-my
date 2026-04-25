import React, { memo, useMemo } from 'react';
import { View, Text } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import styles from '../style';
import { ScrollView } from 'react-native-gesture-handler';
import { Image } from 'react-native';
import imageIndex from '@assets/imageIndex';

interface MovieDescriptionSectionProps {
  item: any;
  recommendationRowHeight: number;
  titleLines: number;
  formatRuntime: (runtime: any) => string;
  emptyStateText: string;
}

const MovieDescriptionSection = ({
  item,
  recommendationRowHeight,
  titleLines,
  formatRuntime,
  emptyStateText
}: MovieDescriptionSectionProps) => {

  const containerStyle = useMemo(() => ({
    flexDirection: 'row' as const,
    maxHeight: recommendationRowHeight - ((titleLines || 1) > 1 ? 25 : 0),
    marginTop: 2
  }), [recommendationRowHeight, titleLines]);

  const innerContainerStyle = useMemo(() => ({
    flexDirection: 'row' as const,
    maxHeight: recommendationRowHeight - ((titleLines || 1) > 1 ? 25 : 0),
    marginTop: 10
  }), [recommendationRowHeight, titleLines]);

  const formattedSubgenres = useMemo(() => {
    if (!item?.subgenres || !item.subgenres.length) return null;
    return (item.subgenres as string[])
      .map(s => s.charAt(0).toUpperCase() + s.slice(1))
      .join(', ');
  }, [item?.subgenres]);

  const formattedCast = useMemo(() => {
    if (!item?.cast || !item.cast.length) return null;
    return item.cast.join(', ');
  }, [item?.cast]);

  const formattedGenres = useMemo(() => {
    if (!item?.genres || !item.genres.length) return null;
    return item.genres.join(', ');
  }, [item?.genres]);

  if (!item) {
    return <Text style={styles.description}>{emptyStateText}</Text>;
  }

  return (
    <View style={containerStyle}>
      <View style={innerContainerStyle}>
        <ScrollView nestedScrollEnabled={false} showsVerticalScrollIndicator={false} bounces={true} contentContainerStyle={{ paddingBottom: 38 }}>
          {(item?.plot || item?.description) && (
            <Text style={[styles.description, { marginBottom: 0 }]}>
              {item?.plot || item?.description}
            </Text>
          )}

          {item?.media_type && (
            <Text style={styles.descriptionLabel}>
              Media Type: <Text style={styles.descriptionValue}>{item.media_type}</Text>
            </Text>
          )}

          {item?.languages_spoken && (
            <Text style={styles.descriptionLabel}>
              Language: <Text style={styles.descriptionValue}>{item.languages_spoken}</Text>
            </Text>
          )}

          {item?.director && (
            <Text style={styles.descriptionLabel}>
              Director(s): <Text style={styles.descriptionValue}>{item.director}</Text>
            </Text>
          )}

          {formattedCast && (
            <Text style={styles.descriptionLabel}>
              Stars: <Text style={styles.descriptionValue}>{formattedCast}</Text>
            </Text>
          )}

          {formattedGenres && (
            <Text style={styles.descriptionLabel}>
              Genre: <Text style={styles.descriptionValue}>{formattedGenres}</Text>
            </Text>
          )}

          {formattedSubgenres && (
            <Text style={styles.descriptionLabel}>
              Subgenres: <Text style={styles.descriptionValue}>{formattedSubgenres}</Text>
            </Text>
          )}

          {item?.release_date && (
            <Text style={styles.descriptionLabel}>
              Release Date: <Text style={styles.descriptionValue}>{item.release_date}</Text>
            </Text>
          )}

          {item?.runtime && (
            <Text style={styles.descriptionLabel}>
              Runtime: <Text style={styles.descriptionValue}>{formatRuntime(item.runtime)}</Text>
            </Text>
          )}

          {/* <View style={{ height: 40 }} />
          <LinearGradient
            colors={['rgba(0,0,0,0.15)', 'rgba(0,0,0,0.9)']}
            start={{ x: 0.5, y: 0 }}
            end={{ x: 0.5, y: 1 }}
            style={styles.gradient}
          /> */}
        </ScrollView>
        <Image source={imageIndex.desBottom} style={{ height: 38, width: '100%', position: 'absolute', bottom: 0, zIndex: 1 }} resizeMode="stretch" />

      </View>
    </View>
  );
};

export default memo(MovieDescriptionSection);
