import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Image,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import FastImage from 'react-native-fast-image';
import { useTranslation } from 'react-i18next';
import { Color } from '@theme/color';
import font from '@theme/font';
import imageIndex from '@assets/imageIndex';
import { Button } from '@components/index';
import { Movie } from '@types/api.types';
import { getHubMovies, thumbsDownMovie, getThumbsDownMovies, deleteRatedMovie } from '@redux/Api/movieApi';

const { width } = Dimensions.get('window');
const HORIZONTAL_PADDING = 16;
const GRID_COLS = 3;
const GRID_GAP = 12;
const totalGridWidth = width - HORIZONTAL_PADDING * 2 - GRID_GAP * (GRID_COLS - 1);
const gridItemWidth = totalGridWidth / GRID_COLS;
const gridItemHeight = gridItemWidth * 1.45;

interface DislikeStepProps {
  onNext: () => void;
  token: string;
}

const DislikeStep = ({ onNext, token }: DislikeStepProps) => {
  const { t } = useTranslation();
  const [movies, setMovies] = useState<Movie[]>([]);
  const [dislikedIds, setDislikedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!token) return;
      setLoading(true);
      try {
        const [hubMovies, existingDislikes] = await Promise.all([
          getHubMovies(token),
          getThumbsDownMovies(token),
        ]);

        // Take exactly 18 movies from hub
        const moviesToDisplay = Array.isArray(hubMovies)
          ? hubMovies.slice(0, 18)
          : [];

        setMovies(moviesToDisplay);
        setDislikedIds(new Set(existingDislikes.map(m => m.imdb_id)));
      } catch (error) {
        console.error("Failed to fetch dislike screen data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [token]);

  const toggleDislike = async (movie: Movie) => {
    const imdbId = movie.imdb_id;
    if (!imdbId || !token) return;

    const isCurrentlyDisliked = dislikedIds.has(imdbId);

    // Optimistic UI update
    const newSet = new Set(dislikedIds);
    if (isCurrentlyDisliked) {
      newSet.delete(imdbId);
    } else {
      newSet.add(imdbId);
    }
    setDislikedIds(newSet);

    try {
      if (isCurrentlyDisliked) {
        await deleteRatedMovie(token, imdbId);
      } else {
        await thumbsDownMovie(token, imdbId);
      }
    } catch (error) {
      console.error("Failed to toggle dislike:", error);
      // Revert on error
      const revertSet = new Set(dislikedIds);
      if (isCurrentlyDisliked) {
        revertSet.add(imdbId);
      } else {
        revertSet.delete(imdbId);
      }
      setDislikedIds(revertSet);
    }
  };

  const renderItem = ({ item }: { item: Movie }) => {
    const isDisliked = dislikedIds.has(item.imdb_id);
    const hasImage = !!item.cover_image_url;

    return (
      <TouchableOpacity
        style={[styles.dislikeGridItem, !hasImage && styles.noImageItem]}
        onPress={() => hasImage && toggleDislike(item)}
        activeOpacity={hasImage ? 0.9 : 1}
        disabled={!hasImage}
      >
        {hasImage ? (
          <FastImage
            source={{ uri: item.cover_image_url }}
            style={styles.gridPoster}
            resizeMode={FastImage.resizeMode.stretch}
          />
        ) : (
          <View style={styles.noImagePlaceholder}>
            <Text style={styles.noImageText}>No Image</Text>
          </View>
        )}

        {hasImage && (
          <View style={[
            styles.dislikeIconBadge,

          ]}>
            <Image
              source={isDisliked ? imageIndex.dislike1 : imageIndex.thumpDown}
              style={[
                styles.dislikeSmallIcon,
                isDisliked && { tintColor: 'white' }
              ]}
            />
          </View>
        )}
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={[styles.root, styles.center]}>
        <ActivityIndicator size="large" color={Color.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <View style={styles.dislikeContainer}>
        <View style={styles.dislikeHeader}>
          <TouchableOpacity
            style={styles.skipContainer}
            onPress={onNext}
          >
            <Text style={styles.skipText}>Skip</Text>
          </TouchableOpacity>

          <Image source={imageIndex.appLogo} style={styles.dislikeLogo} resizeMode="contain" />
          <Text style={styles.dislikeTitle}>Skip the stuff you’d never watch</Text>
          <View style={styles.subTextContainer}>
            <Text style={styles.dislikeSubtitle}>
              If anything here isn't for you, tap
            </Text>
            <Image source={imageIndex.thumpDown} style={[styles.inlineDislikeIcon, {
              tintColor: "white"
            }]} />
          </View>
          <Text style={styles.dislikeSubtitles}>
            Dislikes sharpen your recommendations even more than likes do.
          </Text>
        </View>

        <FlatList
          data={movies}
          renderItem={renderItem}
          keyExtractor={(item) => item.imdb_id}
          numColumns={3}
          columnWrapperStyle={styles.gridColumnWrapper}
          contentContainerStyle={styles.dislikeListContent}
          showsVerticalScrollIndicator={false}
        />

        <View style={styles.dislikeBottomBtn}>
          <Button
            title={"Next"}
            onPress={onNext}
            buttonStyle={styles.nextButtonBlue}
            textStyle={styles.nextButtonText}
          />
        </View>
      </View>
    </SafeAreaView>
  );
};

export default DislikeStep;

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#000',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dislikeContainer: {
    flex: 1,
    paddingHorizontal: HORIZONTAL_PADDING,
  },
  dislikeHeader: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 20,
  },
  dislikeLogo: {
    width: 40,
    height: 46.43,
    marginBottom: 15,
  },
  dislikeTitle: {
    color: '#FFF',
    fontSize: 22,
    fontFamily: font.PoppinsBold,
    textAlign: 'center',
    marginBottom: 8,
  },
  subTextContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    marginBottom: 4,
  },
  dislikeSubtitle: {
    color: '#fff',
    fontSize: 14,
    fontFamily: font.PoppinsRegular,
    textAlign: 'center',
  },
  dislikeSubtitles: {
    color: '#A0A0A0',
    fontSize: 12,
    fontFamily: font.PoppinsRegular,
    textAlign: 'center',
    lineHeight: 20,
  },
  inlineDislikeIcon: {
    width: 16,
    height: 16,
    tintColor: '#A0A0A0',
  },
  skipContainer: {
    position: 'absolute',
    right: 0,
    top: 0,
    padding: 10,
  },
  skipText: {
    color: Color.primary,
    fontFamily: font.PoppinsMedium,
    fontSize: 14,
  },
  dislikeGridItem: {
    width: gridItemWidth,
    height: gridItemHeight,
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: GRID_GAP,
  },
  gridPoster: {
    width: '100%',
    height: '100%',
  },
  gridColumnWrapper: {
    justifyContent: 'flex-start',
    gap: GRID_GAP,
    marginBottom: GRID_GAP,
  },
  dislikeIconBadge: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    // backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    // borderWidth: 1,
    // borderColor: 'rgba(255,255,255,0.3)',
  },
  dislikeIconBadgeActive: {
    backgroundColor: 'rgba(255,59,48,0.2)',
    borderColor: '#FF3B30',
  },
  dislikeSmallIcon: {
    width: 15,
    height: 15,
  },
  dislikeListContent: {
    paddingHorizontal: 4,
    paddingBottom: 120,
  },
  noImageItem: {
    backgroundColor: '#1A1A1A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  noImagePlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  noImageText: {
    color: '#666',
    fontSize: 10,
    fontFamily: font.PoppinsMedium,
  },
  dislikeBottomBtn: {
    position: 'absolute',
    bottom: 20,
    left: HORIZONTAL_PADDING,
    right: HORIZONTAL_PADDING,
  },
  nextButtonBlue: {
    backgroundColor: '#00A8F5',
    borderRadius: 8,
    height: 54,
  },
  nextButtonText: {
    fontFamily: font.PoppinsBold,
    fontSize: 16,
  },
});
