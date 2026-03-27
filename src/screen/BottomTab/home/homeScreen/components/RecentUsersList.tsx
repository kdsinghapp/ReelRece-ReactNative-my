import React from 'react';
import { FlatList, TouchableOpacity } from 'react-native';
import FastImage from 'react-native-fast-image';
import imageIndex from '@assets/imageIndex';
import ScreenNameEnum from '@routes/screenName.enum';
import { BASE_IMAGE_URL } from '@config/api.config';
import isEqual from 'lodash.isequal';
import styles from '../style';

type UserItem = { username?: string; id?: string | number; avatar?: string };

type Props = {
  users: UserItem[];
  onUserPress: (item: UserItem) => void;
};

const RecentUsersList = React.memo(
  ({ users, onUserPress }: Props) => (
    console.log("users",users),
    <FlatList
      data={users}
      horizontal
      keyExtractor={(item, index) => item?.username ?? item?.id?.toString() ?? `recent-${index}`}
      contentContainerStyle={styles.avatarList}
      showsHorizontalScrollIndicator={false}
      initialNumToRender={7}
      maxToRenderPerBatch={6}
      renderItem={({ item }) => {

        console.log("item ------ ",item)
        const avatarSource = item?.avatar
          ? {
              uri: `${BASE_IMAGE_URL}${item.avatar}`,
              priority: FastImage.priority.low,
              cache: FastImage.cacheControl.immutable,
            }
          : imageIndex.profileImg;
        return (
          <TouchableOpacity
            onPress={() => onUserPress(item)}
            style={{ alignItems: 'center', marginRight: 12 }}
          >
            <FastImage
              source={avatarSource}
              style={{ height: 60, width: 60, borderRadius: 60 }}
            />
          </TouchableOpacity>
        );
      }}
    />
  ),
  (prev, next) => isEqual(prev.users, next.users)
);

RecentUsersList.displayName = 'RecentUsersList';

export default RecentUsersList;
