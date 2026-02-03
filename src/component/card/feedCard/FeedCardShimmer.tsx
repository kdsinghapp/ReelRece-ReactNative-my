import React from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { createShimmerPlaceholder } from 'react-native-shimmer-placeholder';

const ShimmerPlaceholder = createShimmerPlaceholder(LinearGradient);
const { height: windowHeight } = Dimensions.get('window');

const FeedCardShimmer = () => {
  return (
    <View style={styles.feedCard}>
      {/* Header Section */}
      <View style={styles.feedHeader}>
        {/* Avatar Shimmer */}
        <ShimmerPlaceholder
          style={styles.feedAvatar}
          shimmerColors={['#181818ff', '#464545ff', '#181717ff']}
        />
        
        {/* Text Content */}
        <View style={styles.headerTextContainer}>
          <View style={styles.usernameRow}>
            <ShimmerPlaceholder
              style={[styles.textShimmer, { width: '40%' }]}
              shimmerColors={['#181818ff', '#464545ff', '#181717ff']}
            />
            <ShimmerPlaceholder
              style={[styles.textShimmer, { width: '20%', marginLeft: 5 }]}
              shimmerColors={['#181818ff', '#464545ff', '#181717ff']}
            />
          </View>
          
          <ShimmerPlaceholder
            style={[styles.textShimmer, { width: '70%', height: 18 }]}
            shimmerColors={['#181818ff', '#464545ff', '#181717ff']}
          />
          
          <ShimmerPlaceholder
            style={[styles.textShimmer, { width: '30%', height: 12 }]}
            shimmerColors={['#181818ff', '#464545ff', '#181717ff']}
          />
        </View>
        
        {/* Ranking Score */}
        {/* <ShimmerPlaceholder
          style={styles.rankingShimmer}
          shimmerColors={['#181818ff', '#464545ff', '#181717ff']}
        /> */}
      </View>

      {/* Comment Section */}
      <View style={styles.commentSection}>
        <ShimmerPlaceholder
          style={[styles.textShimmer, { width: '20%' }]}
          shimmerColors={['#181818ff', '#464545ff', '#181717ff']}
        />
        <ShimmerPlaceholder
          style={[styles.textShimmer, { width: '50%', marginLeft: 5 }]}
          shimmerColors={['#181818ff', '#464545ff', '#181717ff']}
        />
      </View>

      {/* Video/Poster Section */}
      <View style={styles.videoSection}>
        <ShimmerPlaceholder
          style={styles.videoShimmer}
          shimmerColors={['#181818ff', '#464545ff', '#181717ff']}
        />
        
        {/* Progress Bar */}
        {/* <View style={styles.progressContainer}>
          <ShimmerPlaceholder
            style={styles.progressBar}
            shimmerColors={['#181818ff', '#464545ff', '#181717ff']}
          />
        </View> */}
        
        {/* Mute Button */}
        {/* <View style={styles.muteButton}>
          <ShimmerPlaceholder
            style={styles.muteIcon}
            shimmerColors={['#181818ff', '#464545ff', '#181717ff']}
          />
        </View> */}
      </View>

      {/* Footer Actions */}
      {/* <View style={styles.footerActions}>
        <ShimmerPlaceholder
          style={styles.footerIcon}
          shimmerColors={['#181818ff', '#464545ff', '#181717ff']}
        />
        <ShimmerPlaceholder
          style={[styles.footerIcon, { marginLeft: 14 }]}
          shimmerColors={['#181818ff', '#464545ff', '#181717ff']}
        />
      </View> */}

      {/* Divider */}
      <ShimmerPlaceholder
        style={styles.divider}
        shimmerColors={['#181818ff', '#464545ff', '#181717ff']}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  feedCard: {
    backgroundColor: '#121212',
    marginBottom: 20,
    paddingHorizontal: 18,
  },
  feedHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  feedAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 10,
  },
  headerTextContainer: {
    flex: 1,
    paddingRight: 10,
    justifyContent: 'center',
  },
  usernameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  textShimmer: {
    height: 16,
    borderRadius: 4,
    marginBottom: 4,
  },
  rankingShimmer: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  commentSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    marginBottom: 8,
  },
  videoSection: {
    height: windowHeight / 3.7,
    width: '100%',
    borderRadius: 10,
    overflow: 'hidden',
    marginTop: 14,
    backgroundColor: '#1a1a1a',
  },
  videoShimmer: {
    width: '100%',
    height: '100%',
    borderRadius: 10,
  },
  progressContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 3,
  },
  progressBar: {
    height: 3,
    width: '30%',
    borderRadius: 2,
  },
  muteButton: {
    position: 'absolute',
    right: 10,
    bottom: 24,
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 10,
    borderRadius: 20,
  },
  muteIcon: {
    width: 18,
    height: 18,
    borderRadius: 9,
  },
  footerActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 12,
    paddingHorizontal: 4,
  },
  footerIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
  },
  divider: {
    width: '100%',
    height: 1,
    marginTop: 15,
    borderRadius: 0,
  },
});

export default FeedCardShimmer;