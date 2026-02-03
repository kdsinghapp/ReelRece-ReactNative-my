import React, { useCallback } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LinearGradient from 'react-native-linear-gradient';
import ScreenNameEnum from '@routes/screenName.enum';
import { Color } from '@theme/color';
import GroupAllAvatars from '@components/common/GroupAllAvatars/GroupAllAvatars';
import GroupInterestCycle from '@screens/BottomTab/watch/watchScreen/GroupInterestCycle';
const GroupListItem = ({

  group,
  isSettingsMode,
  onGroupSelect,
  navigationOff,
  selectedGroupIds,
  isMultiSelectMode,
  setSelectedGroup,
  setIsSettingsMode

}) => {
  const navigation = useNavigation();
  // const handlePress = useCallback(() => {
  //   if (isMultiSelectMode) {
  //     // ✅ Checkbox select + Modal open both
  //     //       onGroupSelect(group);           // selection logic
  //     setSelectedGroup(group);        // modal show purpose
  //     // setIsSettingsMode(true);        // modal active flag
  //   } else if (isSettingsMode) {
  //     onGroupSelect(group);           // modal open logic
  //   } else if (!navigationOff) {
  //     // navigation.navigate(ScreenNameEnum.WatchWithFrind, { group:group });
  //      navigation.navigate(ScreenNameEnum.WatchWithFrind, {
  //     groupProps: group,
  //     groupId: group?.groupId,
  //     // 👈 now groupId is also explicitly passed
  //   });
  //   }
  // }, [isMultiSelectMode, isSettingsMode, group, selectedGroupIds]);


  const handlePress = useCallback(async () => {
    if (isMultiSelectMode) {
      // setSelectedGroup(group);

      // await AsyncStorage.setItem('selected_group', JSON.stringify(group)); // ✅ Store
    }
    // else if (isSettingsMode) {
    //   // onGroupSelect(group);
    //   // await AsyncStorage.setItem('selected_group', JSON.stringify(group)); // ✅ Store
    // } 

    else if (!navigationOff) {
      await AsyncStorage.setItem('selected_group', JSON.stringify(group)); // ✅ Store
      navigation.navigate(ScreenNameEnum.WatchWithFrind, {
        groupProps: group,
        groupId: group?.groupId,
        maxActivitiescnt: group?.max_activities_cnt
      });
    };
  }, [isMultiSelectMode, group, selectedGroupIds]);
  const onLongPress = useCallback(async () => {
    if (isMultiSelectMode) {
      setSelectedGroup(group);
      await AsyncStorage.setItem('selected_group', JSON.stringify(group)); // ✅ Store
    }
    onGroupSelect(group);
    await AsyncStorage.setItem('selected_group', JSON.stringify(group)); // ✅ Store

  }, [isMultiSelectMode, group, selectedGroupIds]);




  // useEffect(() => {
  //   if (isMultiSelectMode && !isSettingsMode) {
  //     setIsSettingsMode(true);
  //   }
  // }, [isMultiSelectMode]);
  return (
    <TouchableOpacity
      onPress={handlePress}
      onLongPress={onLongPress}
      // delayLongPress={300}

      style={styles.groupItem}>
      <LinearGradient
        colors={[Color.darkGrey, 'rgba(0, 108, 157,0.65)']}
        start={{ x: 0.1, y: 1 }}            // gradient direction (top-left)
        end={{ x: 6, y: 0.9 }}              // gradient direction (bottom-right)
        style={styles.gradientContainer}
      >
        <View style={{
          flexDirection: "row",
          alignItems: "center",
          marginHorizontal: 5

        }}>
          <GroupAllAvatars group={group} />
          <GroupInterestCycle
            group={group}
            onGroupSelect={onGroupSelect}
            isMultiSelectMode={isMultiSelectMode}
            selectedGroupIds={selectedGroupIds}
          />
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
};


const WatchGroupCom = ({
  groups,
  isSettingsMode,
  onGroupSelect,
  navigationOff,
  isMultiSelectMode,
  selectedGroupIds,
  setSelectedGroup,
  setIsSettingsMode,
  // groupTest={groupTest}
}) => {
  return (
    <FlatList
      data={groups}
      keyExtractor={(item) => item.groupId.toString()}
      initialNumToRender={5}
      maxToRenderPerBatch={10}
      contentContainerStyle={{
        paddingBottom: 70, // ya 40, 50 as needed
      }}
      windowSize={5}
      removeClippedSubviews={true}
      style={{
        paddingHorizontal: 10,

      }}
      renderItem={({ item }) => (
        <GroupListItem
          key={item.id}
          group={item}
          isSettingsMode={isSettingsMode}
          onGroupSelect={onGroupSelect}
          navigationOff={navigationOff}
          isMultiSelectMode={isMultiSelectMode}
          selectedGroupIds={selectedGroupIds}
          setSelectedGroup={setSelectedGroup}
          setIsSettingsMode={setIsSettingsMode}
        // groupTest={groupTest}

        />
      )}
    // contentContainerStyle={styles.listContent}
    />

  );
};

const styles = StyleSheet.create({

  listContent: {
    paddingBottom: 100,
  },
  groupItem: {
    marginBottom: 10,
    borderRadius: 20,
    overflow: 'hidden',
  },

  gradientContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 92,
    borderRadius: 20,
  },
  // userImagesContainer: {
  //   flexDirection: 'row',
  //   marginRight: 12,
  // },
  userImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 2.5,
    borderColor: "#28292A",
    backgroundColor: '#ddd',
  },


});

export default WatchGroupCom;