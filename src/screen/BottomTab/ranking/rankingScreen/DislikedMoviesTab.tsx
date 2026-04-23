import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
  Image,
} from 'react-native';
import FastImage from 'react-native-fast-image';
import { useNavigation } from '@react-navigation/native';
import { Color } from '@theme/color';
import font from '@theme/font';
import imageIndex from '@assets/imageIndex';
import { Movie } from '@types/api.types';
import { getThumbsDownMovies, deleteRatedMovie } from '@redux/Api/movieApi';
import ScreenNameEnum from '@routes/screenName.enum';

const { width } = Dimensions.get('window');
const HORIZONTAL_PADDING = 16;
const GRID_COLS = 3;
const GRID_GAP = 12;
const totalGridWidth = width - HORIZONTAL_PADDING * 2 - GRID_GAP * (GRID_COLS - 1);
const gridItemWidth = totalGridWidth / GRID_COLS;
const gridItemHeight = gridItemWidth * 1.45;

interface DislikedMoviesTabProps {
  token: string;
}

const DislikedMoviesTab = ({ token }: DislikedMoviesTabProps) => {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();

  const fetchDisliked = useCallback(async () => {
    if (!token) return;
    try {
      const data = await getThumbsDownMovies(token);
      setMovies(data || []);
    } catch (error) {
      console.error('Failed to fetch disliked movies:', error);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchDisliked();
  }, [fetchDisliked]);

  const handleRemoveDislike = useCallback(async (imdbId: string) => {
    try {
      await deleteRatedMovie(token, imdbId);
      setMovies(prev => prev.filter(m => m.imdb_id !== imdbId));
    } catch (error) {
      console.error('Failed to remove dislike:', error);
    }
  }, [token]);

  const handleNavigate = useCallback((item: Movie) => {
    navigation.navigate(ScreenNameEnum.MovieDetailScreen as never, {
      imdb_idData: item.imdb_id,
      token: token,
      movieList: movies,
      initialIndex: movies.findIndex(m => m.imdb_id === item.imdb_id),
      source: 'ranking',
    } as never);
  }, [navigation, token, movies]);

  const renderItem = useCallback(({ item }: { item: Movie }) => (
    <TouchableOpacity
      style={styles.gridItem}
      onPress={() => handleNavigate(item)}
      activeOpacity={0.8}
    >
      <FastImage
        source={{ uri: item.cover_image_url }}
        style={styles.poster}
        resizeMode={FastImage.resizeMode.stretch}
      />
      <TouchableOpacity
        style={styles.dislikeBadge}
        onPress={() => handleRemoveDislike(item.imdb_id)}
      >
        <Image
          source={imageIndex.disLikeFill}
          style={styles.badgeIcon}
        />
      </TouchableOpacity>
    </TouchableOpacity>
  ), [handleNavigate, handleRemoveDislike]);

  const listHeader = useMemo(() => (
    <View style={styles.headerContainer}>
      <Text style={styles.description}>
        These are titles you’ve marked as not of interest. They won’t influence your ratings but help sharpen your recommendations.
      </Text>
    </View>
  ), []);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={Color.primary} />
      </View>
    );
  }

  return (
    <FlatList
      data={movies}
      renderItem={renderItem}
      keyExtractor={item => item.imdb_id}
      numColumns={GRID_COLS}
      columnWrapperStyle={styles.columnWrapper}
      contentContainerStyle={styles.listContent}
      ListHeaderComponent={listHeader}
      showsVerticalScrollIndicator={false}
      ListEmptyComponent={() => (
        <View style={styles.center}>
          <Text style={styles.emptyText}>No titles marked as not interested yet.</Text>
        </View>
      )}
    />
  );
};

export default React.memo(DislikedMoviesTab);

const styles = StyleSheet.create({
  center: {
    paddingTop: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerContainer: {
    marginBottom: 20,
    paddingHorizontal: 4,
    marginTop: 9
  },
  description: {
    color: Color.subText,
    fontSize: 12.3,
    fontFamily: font.PoppinsRegular,
  },
  listContent: {
    paddingBottom: 20,
  },
  columnWrapper: {
    justifyContent: 'flex-start',
    gap: GRID_GAP,
    marginBottom: GRID_GAP,
  },
  gridItem: {
    width: gridItemWidth,
    height: gridItemHeight,
    borderRadius: 8,
    overflow: 'hidden',
    position: 'relative',
  },
  poster: {
    width: '100%',
    height: '100%',
  },
  dislikeBadge: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    // backgroundColor: 'rgba(0,0,0,0.6)',
    // borderRadius: 12,
    // width: 24,
    // height: 24,
    // justifyContent: 'center',
    // alignItems: 'center',
    // borderWidth: 1,
    // borderColor: 'rgba(255,255,255,0.3)',
  },
  badgeIcon: {
    width: 24,
    height: 24,
  },
  emptyText: {
    color: '#666',
    fontFamily: font.PoppinsRegular,
    fontSize: 14,
    textAlign: 'center',
  },
});
