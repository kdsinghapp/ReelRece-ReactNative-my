import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  Animated,
  Dimensions,

} from 'react-native';
import { Color } from '@theme/color';
import FastImage from 'react-native-fast-image';

const { height } = Dimensions.get('window');

const ITEM_HEIGHT = 40;
const LIST_HEIGHT =115; // Your required 90% height

const friendMessages = [
    {
        id: '1',
        userId: 'u1',
        username: 'Rahul',
        avatar: 'https://i.pravatar.cc/150?img=1',
        text: 'Hey guys, ready to watch?',
      },
      {
        id: '2',
        userId: 'u2',
        username: 'Anjali',
        avatar: 'https://i.pravatar.cc/150?img=2',
        text: 'Yes! Play the movie',
      },
      {
        id: '3',
        userId: 'u3',
        username: 'You',
        avatar: 'https://i.pravatar.cc/150?img=3',
        text: 'Starting in 3...2...1!',
      },
      {
        id: '4',
        userId: 'u4',
        username: 'Vikram',
        avatar: 'https://i.pravatar.cc/150?img=4',
        text: 'Don’t forget the popcorn 🍿',
      },
      {
        id: '5',
        userId: 'u5',
        username: 'Sneha',
        avatar: 'https://i.pravatar.cc/150?img=5',
        text: 'Excited for this one!',
      },
      {
        id: '6',
        userId: 'u6',
        username: 'Amit',
        avatar: 'https://i.pravatar.cc/150?img=6',
        text: 'Hope it has subtitles 😂',
      },
      {
        id: '7',
        userId: 'u7',
        username: 'Neha',
        avatar: 'https://i.pravatar.cc/150?img=7',
        text: 'Let’s gooo! 🔥',
      },
      {
        id: '8',
        userId: 'u8',
        username: 'suraj',
        avatar: 'https://i.pravatar.cc/150?img=8',
        text: 'do this 😂',
      },
];

const FriendChat = () => {
  const scrollY = useRef(new Animated.Value(0)).current;
  const [contentHeight, setContentHeight] = useState(1);
  const [visibleHeight, setVisibleHeight] = useState(1);

  const indicatorHeight = visibleHeight * (visibleHeight / contentHeight);

  const indicatorTranslateY = Animated.multiply(
    scrollY,
    visibleHeight / contentHeight
  );

  const renderItem = ({ item }) => (
    <View style={styles.messageContainer}>
      {/* <Image source={{ uri: item?.avatar }} style={styles.avatarFriend} /> */}
      <FastImage source={{
        uri: item?.avatar,
        priority:FastImage.priority.low,
        cache:FastImage.cacheControl.web
      }}  
      style={styles.avatarFriend}
      />
      <View style={{ flexDirection: 'row', flexShrink: 1 }}>
     
        <Text  allowFontScaling={false} style={styles.username}>{item.username}: </Text>
        <Text  allowFontScaling={false} style={styles.message}>{item.text}</Text>
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { height: LIST_HEIGHT }]}>
      <View style={styles.listWrapper}>
        <Animated.FlatList
          data={friendMessages}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          onLayout={(e) => setVisibleHeight(e.nativeEvent.layout.height)}
          onContentSizeChange={(_, height) => setContentHeight(height)}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { y: scrollY } } }],
            { useNativeDriver: false }
          )}
          scrollEventThrottle={16}
          showsVerticalScrollIndicator={false}
        />
        <View style={[styles.scrollIndicatorContainer, { height: LIST_HEIGHT }]}>
          <View style={styles.scrollTrack}>
            <Animated.View
              style={[
                styles.scrollIndicator,
                {
                  height: indicatorHeight,
                  transform: [{ translateY: indicatorTranslateY }],
                },
              ]}
            />
          </View>
        </View>
      </View>
    </View>
  );
};

export default FriendChat;

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 15,
    // backgroundColor: 'pink',
    height:95,
    // marginVertical:10,
  },
  listWrapper: {
    flexDirection: 'row',
    flex: 1,
  },
  messageContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    height: ITEM_HEIGHT,
    paddingHorizontal: 10,
  },
  avatarFriend: {
    width: 35,
    height: 35,
    borderRadius: 18,
    marginRight: 10,
  },
  username: {
    fontWeight: 'bold',
    fontSize: 14,
    color:  Color.whiteText,
  },
  message: {
    fontSize: 14,
    color:  Color.whiteText,
  },
  scrollIndicatorContainer: {
    width: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollTrack: {
    width: 6,
    height: '100%',
    backgroundColor: Color.whiteText,
    borderRadius: 3,
  },
  scrollIndicator: {
    width: 6,
    backgroundColor: Color.lightGrayText,
    borderRadius: 3,
  },
});
