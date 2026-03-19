import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import font from '@theme/font';
import WatchGroupCom from '@components/common/WatchGroupCom/WatchGroupCom';
import { t } from 'i18next';

export interface GroupSearchProps {
  groupData?: unknown[];
  searchQuery?: string;
  navigation?: unknown;
}

const GroupSearch = ({ groupData, searchQuery }: GroupSearchProps) => {
  const hasSearch = (searchQuery ?? '').trim().length > 0;
  const isEmpty = !groupData || groupData?.length === 0;

  return (
    <View style={styles.container}>
      {!isEmpty ? (
        <WatchGroupCom groups={groupData} />
      ) : (
        <Text
          style={{
            color: 'gray',
            textAlign: 'center',
            marginTop: 20,
            fontFamily: font.PoppinsMedium,
            fontSize: 16,
          }}
        >
          {hasSearch ? t('emptyState.nomatch') || 'No groups match your search' : t('emptyState.nogroups')}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    paddingHorizontal: 16,
    paddingTop: 20
  },
  searchBox: {
    height: 50,

    backgroundColor: '#1e1e1e',
    borderRadius: 10,
    paddingHorizontal: 16,
    color: 'white',
    marginBottom: 16,
  },
});

export default React.memo(GroupSearch);
