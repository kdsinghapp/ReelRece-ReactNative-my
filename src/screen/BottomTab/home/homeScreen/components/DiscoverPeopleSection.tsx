import React, { useCallback } from 'react';
import { View, Text, TouchableOpacity, Image, FlatList } from 'react-native';
import imageIndex from '@assets/imageIndex';
import { Color } from '@theme/color';
import ScreenNameEnum from '@routes/screenName.enum';
import SuggestedFriendCard from '@components/common/SuggestedFriendCard/SuggestedFriendCard';
import { BASE_IMAGE_URL } from '@config/api.config';
import { t } from 'i18next';
import styles from '../style';

export type SuggestedUser = {
  avatar?: string;
  name?: string | null;
  username: string;
  is_following?: boolean;
};

type Props = {
  users: SuggestedUser[];
  onFollow: (username: string) => void;
  onSeeAll: () => void;
};

const DiscoverPeopleSection = React.memo(({ users, onFollow, onSeeAll }: Props) => {
  const renderItem = useCallback(
    ({ item }: { item: SuggestedUser }) => (
      <SuggestedFriendCard
        item={{ ...item, avatar: item.avatar ?? '' }}
        BASE_IMAGE_URL={BASE_IMAGE_URL}
        onFollow={onFollow}
      />
    ),
    [onFollow]
  );

  if (!users?.length) return null;

  return (
    <View style={{ marginHorizontal: 14, marginLeft: 5, marginBottom: 16 }}>
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginTop: 8,
          paddingHorizontal: 5,
          marginBottom: 10,
        }}
      >
        <Text style={styles.sectionTitle}>{t('home.discoverPeople')}</Text>
        <TouchableOpacity onPress={onSeeAll}>
          <Image
            source={imageIndex.rightArrow}
            style={{ height: 20, width: 20, tintColor: Color.placeHolder }}
            resizeMode="contain"
          />
        </TouchableOpacity>
      </View>
      <FlatList
        horizontal
        data={users}
        keyExtractor={(item, index) => item?.username ?? `suggested-${index}`}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 10, paddingRight: 20 }}
        initialNumToRender={5}
        renderItem={renderItem}
      />
    </View>
  );
});

DiscoverPeopleSection.displayName = 'DiscoverPeopleSection';

export default DiscoverPeopleSection;
