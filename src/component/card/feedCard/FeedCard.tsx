
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Image,
  TouchableOpacity,
  Animated,
  NativeModules,
  Platform,
  LayoutChangeEvent
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import Video from 'react-native-video';
import imageIndex from '@assets/imageIndex';
import ScreenNameEnum from '@routes/screenName.enum';
import { Color } from '@theme/color';
import font from '@theme/font';
import { useCompareContext } from '../../../context/CompareContext';
import { useTrailerTracker } from '@hooks/useTrailerTracker';
import { useBookmarks } from '@hooks/useBookmark';
import FastImage from 'react-native-fast-image';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@redux/store';
import { toggleMute } from '@redux/feature/videoAudioSlice';
import { styles } from './FeedCardstyle';
import CustomText from '@components/common/CustomText/CustomText';
import RankingWithInfo from '@components/ranking/RankingWithInfo';
import { t } from 'i18next';
import ScoreIntroModal from '@components/modal/ScoreIntroModal/ScoreIntroModal';


const FeedCard = ({
  screenName,
  avatar, user, title, comment, poster, videoUri, isPaused, shouldAutoPlay, is_bookMark, videoIndex,
  rankPress, isVisible, ranked, imdb_id, created_date, token, release_year, shouldPlay, scoreType, username,
  feedData = []
}) => {
  const navigation = useNavigation();
  const [posterOpacity] = useState(new Animated.Value(1));
  const [videoDuration, setVideoDuration] = useState(0);
  const videoRef = useRef(null);
  const trailerTracker = useTrailerTracker(token);
  const videoUriRef = useRef(videoUri);
  const { toggleBookmark } = useBookmarks(token);
  const [showFirstModal, setShowFirstModal] = useState(false);
  const previousImdbRef = useRef<string | null>(null);
  const [paused, setPaused] = useState(shouldAutoPlay ? !isVisible : true);
  const isMuted = useSelector((state: RootState) => state.videoAudio.isMuted);
  const [isBookmarked, setIsBookmarked] = useState(!!is_bookMark);
  const [posterVisible, setPosterVisible] = useState(true);
  const dispatch = useDispatch()
  const progressAnim = useRef(new Animated.Value(0)).current;


  const isPlaying = shouldAutoPlay && isVisible && shouldPlay && !paused;
  const isScreenFocused = useIsFocused();



  const hasInteractedRef = useRef(false);
  useEffect(() => {
    videoUriRef.current = videoUri;
  }, [videoUri]);

  useEffect(() => {
    const shouldPlayVideo = shouldAutoPlay && isVisible && shouldPlay;
    setPaused(!shouldPlayVideo);
  }, [shouldAutoPlay, isVisible, shouldPlay]);
  const stableVideoUri = useRef(videoUri);


  const handleVideoLoad = useCallback((data?: { duration?: number }) => {
    if (data?.duration) setVideoDuration(data.duration);
    setTimeout(() => {
      Animated.timing(posterOpacity, {
        toValue: 0,
        duration: 1000,
        useNativeDriver: true,
      }).start(() => setPosterVisible(false));
    }, 1200);
  }, [posterOpacity]);

  useEffect(() => {
    setIsBookmarked(!!is_bookMark);
  }, [is_bookMark]);

  const handleToggleBookmark = useCallback(async () => {
    const prev = isBookmarked;
    setIsBookmarked(!prev);
    try {
      await toggleBookmark(imdb_id);
    } catch (err) {
      setIsBookmarked(prev);
    }
  }, [isBookmarked, imdb_id, toggleBookmark]);

  useEffect(() => {
    const shouldTrigger = paused && !hasInteractedRef.current && imdb_id;
    if (shouldTrigger) {
      hasInteractedRef.current = true;
      trailerTracker.triggerInteractionIfAny();
      trailerTracker.resetTracker();
    }
  }, [paused, imdb_id]);

  const compareHook = useCompareContext();
  const handleRankingPress = useCallback((movie: object) => {
    compareHook.openFeedbackModal(movie);
  }, [compareHook]);

  useEffect(() => {
    if (isVisible) {
      hasInteractedRef.current = false;
      trailerTracker.resetTracker();
    }
  }, [isVisible]);
  const handleNavigation = useCallback((id: string, tok: string) => {
    const movieIndex = Array.isArray(feedData) ? feedData.findIndex((m: any) => m?.movie?.imdb_id === id) : -1;
    navigation.navigate(ScreenNameEnum.MovieDetailScreen, {
      imdb_idData: id,
      token: tok,
      movieList: feedData || [],
      initialIndex: movieIndex >= 0 ? movieIndex : 0,
      source: 'feed',
      filterGenreString: '',
      platformFilterString: '',
      selectedSimpleFilter: '1',
      selectedSortId: null,
      contentSelect: null,
      currentPage: 1,
      totalPages: 1,
    });
  }, [navigation, feedData]);

  // Clear video buffer when component unmounts
  useEffect(() => {
    return () => {
      if (videoRef.current) {
        videoRef.current = null; // release ref
      }
      // Optional force GC hint
      global.gc && global.gc();
    };
  }, [isScreenFocused]);

  // const previousImdbRef = useRef<string | null>(null);

  useEffect(() => {
    if (previousImdbRef.current && previousImdbRef.current !== imdb_id) {
      trailerTracker.triggerInteractionIfAny();
      trailerTracker.resetTracker();
    }
    previousImdbRef.current = imdb_id;
  }, [imdb_id]);

  const handleTogglePause = useCallback(() => {
    if (!shouldAutoPlay) setPaused(prev => !prev);
  }, [shouldAutoPlay]);

  const lastProgressRef = useRef(0);
  const onVideoProgress = useCallback((data: { currentTime: number; seekableDuration: number }) => {
    if (paused) return;
    const seekable = data.seekableDuration || 1;
    const progressPercent = Math.min(1, data.currentTime / seekable);
    if (Math.abs(progressPercent - lastProgressRef.current) >= 0.01) {
      lastProgressRef.current = progressPercent;
      Animated.timing(progressAnim, {
        toValue: progressPercent,
        duration: 250,
        useNativeDriver: false,
      }).start();
    }
    trailerTracker.onProgress({ currentTime: data.currentTime, imdb_id, trailer_url: videoUri });
  }, [paused, imdb_id, videoUri, progressAnim, trailerTracker]);

  useEffect(() => {
    if (!isScreenFocused || !isVisible) {
      setPaused(true);
    } else {
      setTimeout(() => {
        setPaused(!(shouldAutoPlay && shouldPlay));

      }, 100);
    }
  }, [isVisible, isScreenFocused, shouldAutoPlay, shouldPlay, videoIndex]);


  useEffect(() => {
    if (videoUri && videoUri !== stableVideoUri.current) {
      stableVideoUri.current = videoUri;
    }
  }, [videoUri, videoIndex]);


  const navigateOnPoster = useCallback(() => {
    handleNavigation(imdb_id, token);
  }, [handleNavigation, imdb_id, token]);

  const item = useMemo(() => ({ username }), [username]);
  const onHeaderTitlePress = useCallback(() => handleNavigation(imdb_id, token), [handleNavigation, imdb_id, token]);
  const onProfilePress = useCallback(() => navigation.navigate(ScreenNameEnum.OtherProfile, { item }), [navigation, item]);
  const setShowFirstModalToggle = useCallback(() => setShowFirstModal(prev => !prev), []);
  const closeScoreModal = useCallback(() => setShowFirstModal(false), []);
  const movieForRank = useMemo(() => ({
    imdb_id,
    title,
    release_year,
    cover_image_url: poster?.uri ?? '',
  }), [imdb_id, title, release_year, poster?.uri]);
  const onRankingPress = useCallback(() => handleRankingPress(movieForRank), [handleRankingPress, movieForRank]);

  const avatarSource = useMemo(() => ({
    ...avatar,
    priority: FastImage.priority.low,
    cache: FastImage.cacheControl.immutable,
  }), [avatar]);
  const posterSource = useMemo(() => ({
    ...poster,
    priority: FastImage.priority.low,
    cache: FastImage.cacheControl.immutable,
  }), [poster]);



  const [isLowMemoryDevice, setIsLowMemoryDevice] = useState(false);

  useEffect(() => {
    if (Platform.OS === 'android') {
      NativeModules?.DeviceInfo?.isLowRamDevice?.().then(setIsLowMemoryDevice);
    }
  }, []);

  const [isExpanded, setIsExpanded] = useState(false);
  const [showSeeMore, setShowSeeMore] = useState(false);

  const onTextLayout = useCallback((e: any) => {
    if (e.nativeEvent.lines.length > 10 && !isExpanded) {
      setShowSeeMore(true);
    }
  }, [isExpanded]);

  return (
    <View style={styles.feedCard}>
      <View style={styles.feedHeader}>
        <TouchableOpacity onPress={onProfilePress}>
          <FastImage source={avatarSource} style={styles.feedAvatar} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.feedHeaderRow} onPress={onHeaderTitlePress}>
          <View style={styles.feedHeaderTitleWrap}>
            <CustomText
              size={15}
              color={Color.whiteText}
              style={styles.feedUser}
              font={font.PoppinsBold}
            >{user}
              <CustomText
                size={14}
                color={Color.whiteText}
                style={styles.rankedText}
                font={font.PoppinsRegular}
              >                  {t("common.ranked",)}

              </CustomText>
            </CustomText>

            <CustomText
              size={16}
              color={Color.lightPrimary}
              style={styles.feedTitle}
              font={font.PoppinsBold}
              numberOfLines={2}
            >{title}</CustomText>

            {/* <Text >Today</Text> */}
            <CustomText
              size={12}
              color={Color.textGray}
              style={styles.todayText}
              font={font.PoppinsRegular}
            >{created_date}</CustomText>
          </View>
          <TouchableOpacity style={styles.rankingTouch} onPress={setShowFirstModalToggle}>

            <RankingWithInfo
              score={ranked}
              title={scoreType === "Rec" ? "Rec Score" : t("discover.friendscore")}

              description={
                scoreType === "Rec"
                  ? t("discover.recscoredes")
                  : t("discover.frienddes")
                // "This score shows the rating from your friend for this title."
              }
            />
          </TouchableOpacity>

        </TouchableOpacity>
      </View>

      {(comment ?? '').trim() !== '' && (
        <View style={styles.feedComment}>
          <TouchableOpacity
            activeOpacity={0.9}
            style={{ position: 'relative' }}
            onPress={() => setIsExpanded(!isExpanded)}
          >
            <CustomText
              size={14}
              color={Color.whiteText}
              font={font.PoppinsBold}
              style={{ lineHeight: 20 }}
              numberOfLines={isExpanded ? undefined : 10}
              onTextLayout={onTextLayout}
            >
              {t("common.comment")} :
              <CustomText
                size={14}
                color={Color.whiteText}
                font={font.PoppinsRegular}
              >
                {' '}{comment}
              </CustomText>
            </CustomText>

            {!isExpanded && showSeeMore && (
              <LinearGradient
                colors={['transparent', Color.background, Color.background]}
                start={{ x: 0, y: 0 }}
                end={{ x: 0.35, y: 0 }}
                style={styles.seeMoreContainer}
              >
                <CustomText
                  size={14}
                  color={Color.lightPrimary}
                  font={font.PoppinsBold}
                >
                  ...{t("common.seeMore")}
                </CustomText>
              </LinearGradient>
            )}
          </TouchableOpacity>

          {isExpanded && showSeeMore && (
            <TouchableOpacity onPress={() => setIsExpanded(false)}>
              <CustomText
                size={14}
                color={Color.lightPrimary}
                font={font.PoppinsBold}
                style={{ marginTop: 2 }}
              >
                {t("common.seeLess")}
              </CustomText>
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* Video / Poster */}
      <TouchableOpacity onPress={handleTogglePause}>
        <View style={styles.videoWrapper}>
          <TouchableOpacity activeOpacity={1} onPress={navigateOnPoster} style={styles.posterOverlay}>
            {!isPlaying && (
              <FastImage
                source={posterSource}
                style={styles.posterOverlay}
                resizeMode={FastImage.resizeMode.stretch}
              />
            )}
          </TouchableOpacity>
          {isLowMemoryDevice && !isVisible ? (
            <Image source={{ uri: typeof poster === 'string' ? poster : poster?.uri }} resizeMode="stretch" style={styles.video} />
          ) : (
            <Video
              source={{ uri: stableVideoUri.current }}

              resizeMode="cover"
              repeat
              paused={paused}
              style={styles.video}
              muted={isMuted}
              automaticallyWaitsToMinimizeStalling={true} // iOS: auto buffer
              bufferConfig={{
                minBufferMs: 3000,
                maxBufferMs: 10000,
                bufferForPlaybackMs: 1500,
                bufferForPlaybackAfterRebufferMs: 3000,
              }}

              onLoad={handleVideoLoad}               // <- pass data automatically
              onReadyForDisplay={() => handleVideoLoad()}  // optional, for extra safety
              onProgress={onVideoProgress}
              onEnd={() => {

                if (!imdb_id || hasInteractedRef.current) {
                  return;
                }
                hasInteractedRef.current = true;
                trailerTracker.triggerInteractionIfAny();
              }}
              playInBackground={false}
              playWhenInactive={false}
              controls={false}
              disableFocus={true}
              hideShutterView
              shutterColor="transparent"
              progressUpdateInterval={250}
            />
          )}

          {/* 👇 Progress bar should go here */}
        </View>
        <View style={styles.progressBarContainer}>
          <Animated.View
            style={[
              styles.progressBar,
              {
                width: progressAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0%', '100%'],
                }),
              },
            ]}
          />


          {!paused && (
            <TouchableOpacity style={styles.tButton} onPress={() => dispatch(toggleMute())}>
              <Image source={isMuted ? imageIndex.volumeOff : imageIndex.mute} style={styles.muteIcon} resizeMode="contain" />
            </TouchableOpacity>
          )}
        </View>
      </TouchableOpacity>

      {/* Footer Actions */}
      <View style={styles.footerActions}>
        <TouchableOpacity onPress={onRankingPress}>
          <Image
            source={imageIndex.mdRankings}
            style={styles.footerIcon}
            resizeMode="contain"
          />
        </TouchableOpacity>
        <TouchableOpacity style={styles.bookmarkTouch} onPress={handleToggleBookmark}>
          <Image
            source={isBookmarked ? imageIndex.save : imageIndex.saveMark}
            style={styles.footerSaveIcon}
            resizeMode="contain"
          />
        </TouchableOpacity>

      </View>
      <View style={styles.footerDivider} />
      <ScoreIntroModal
        visible={showFirstModal}
        onClose={closeScoreModal}
        variant="second"
      />
      
    </View>
  );
};



// export default FeedCard;
export default React.memo(FeedCard);






