import React from 'react';
import { View, Text, ScrollView, StyleSheet, Image, FlatList, TouchableOpacity, SafeAreaView } from 'react-native';
import watchTogetherGroups from '@data/watchdata';
import { Color } from '@theme/color';
import GroupInterestCycle from './GroupInterestCycle';
import imageIndex from '@assets/imageIndex';
import { useNavigation } from '@react-navigation/native';
import { CustomStatusBar } from '@components';
import ScreenNameEnum from '@routes/screenName.enum';


const GroupListItem = ({ group }) => {
  const navigation = useNavigation()
  // Get the most recent message
  const recentMessage = group.groupuser.reduce((prev, current) => {
    return (new Date(prev.recentMessageTime) > new Date(current.recentMessageTime)) ? prev : current;
  });

  // Format time
  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffHours = Math.abs(now - date) / 36e5;

    if (diffHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };
  const getGridImageStyleByIndex = (index) => {
    switch (index) {
      case 0:
        return styles.gridImageTopLeft;
      case 1:
        return styles.gridImageTopRight;
      case 2:
        return styles.gridImageBottomLeft;
      case 3:
        return styles.gridImageBottomRight;
      default:
        return styles.gridImageTopLeft;
    }
  };
  // Render user images with condition (max 3 visible)
  const renderUserImages = () => {
    const users = group.groupuser;
    const totalUsers = users.length;

    const renderImage = (user, style, key = null) => (
      <Image
        key={key || user.userId}
        source={user.userImage}
        style={style}
        resizeMode='contain'
      />
    );

    switch (totalUsers) {
      case 1:
        return (
          <View style={styles.imageContainer}>
            {renderImage(users[0], styles.singleImage)}
          </View>
        );

      case 2:
        return (
          <View style={styles.imageContainer}>
            {renderImage(users[1], styles.dualBottomRight)}
            {renderImage(users[0], styles.dualTopLeft)}

          </View>
        );

      case 3:
        return (
          <View style={styles.imageContainer}>
            {renderImage(users[2], styles.triBottomRight)}
            {renderImage(users[1], styles.triBottomLeft)}
            {renderImage(users[0], styles.triTop)}


          </View>
        );

      case 4:
        return (
          <View style={styles.fourGrid}>
            {users.map((user, index) => {
              let imageStyle;

              switch (index) {
                case 0:
                  imageStyle = styles.gridImageTopLeft;
                  break;
                case 1:
                  imageStyle = styles.gridImageTopRight;
                  break;
                case 2:
                  imageStyle = styles.gridImageBottomLeft;
                  break;

                case 3:
                  imageStyle = styles.gridImageBottomRight;
                  break;





              }

              return renderImage(user, imageStyle, index.toString());
            })}
          </View>
        );
      default:
        return (
          <View style={styles.fourGrid}>
            {users.slice(0, 3).map((user, index) =>
              renderImage(
                user,
                getGridImageStyleByIndex(index),
                index.toString()
              )
            )}

            {/* 4th spot with +N count */}
            <View style={[getGridImageStyleByIndex(3), styles.moreUsersCircle]}>
              <Text style={styles.moreUsersText}>+{totalUsers - 3}</Text>
            </View>
          </View>
        );
    };
  }

  return (
    <View style={styles.groupItem}>
      {/* Left side - User images */}
      {renderUserImages()}

      {/* Center - Group name and recent chat */}
      <View style={styles.groupInfo}>
        <Text style={styles.groupName}>{group.groupName}</Text>

        <GroupInterestCycle group={group} />



      </View>

      {/* Right side - Recent message time */}
      {/* <Text style={styles.recentTime}>
        {formatTime(recentMessage.recentMessageTime)}
      </Text> */}
    </View>
  );
};

const WatchScreen = () => {
  const navigation = useNavigation()

  return (
    <SafeAreaView style={[styles.mincontainer,]}>

      <View style={styles.container}>


        <CustomStatusBar translucent={true} />


        <View style={styles.header}>
          <View style={{ flexDirection: "row", alignItems: "center", }}>
            <Text style={styles.logo}>Watch Together Top Bar</Text>
          </View>

          <View style={{ flexDirection: "row", }}>
            <TouchableOpacity onPress={() => navigation.navigate(ScreenNameEnum.Notification)}>
              <Image source={imageIndex.notification} style={{
                height: 22,
                width: 22,
                marginRight: 12,
              }} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => navigation.navigate(ScreenNameEnum.WoodsScreen)}>
              <Image source={imageIndex.search} style={{
                height: 22,
                width: 22
              }} />
            </TouchableOpacity>
          </View>
        </View>


        <View style={styles.onlineuserContainer} >
          <Image style={styles.userOnlineImg} source={imageIndex.profile1} />
          <View style={styles.invitBtnContianerr}  >
            <Image source={imageIndex.invitIcon}  style={styles.invitBtnIcon}  />
          </View>
        </View>

    
       <View style={{marginBottom:150,marginTop:20,}} >
         <FlatList
          data={watchTogetherGroups}
          keyExtractor={(item) => item.groupId}
          renderItem={({ item }) => <GroupListItem group={item} />}
          contentContainerStyle={styles.listContent}
        />
       </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  mincontainer: {
    flex: 1,
    // paddingBottom: insets.bottom + 25, // Adds some extra space above safe area
    // backgroundColor: '#1F1F1F',
  },
  container: {
    flex: 1,
    backgroundColor: Color.background,
    paddingTop: 40,
    paddingHorizontal: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 15,
    alignItems: 'center',
    marginTop: 15
  },
  logo: { fontSize: 22, color: Color.whiteText, fontWeight: '600', },

  onlineuserContainer: {
    marginTop: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    // marginBottom:20s,
  },
  userOnlineImg: {
    height: 60,
    width: 60,
    borderRadius: 30,
    marginRight: 10,
  },
  invitBtnContianerr: {
    height: 60,
    width: 60,
    borderRadius: 30,
    marginRight: 10,
    backgroundColor: Color.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  invitBtnIcon: {
    height:20,
    width:20,
  },
  subHeader: {
    fontSize: 16,
    color: Color.whiteText,
    marginBottom: 20,
  },
  listContent: {
    paddingBottom: 20,
  },
  groupItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: "#28292A",
    marginBottom: 12,
    padding: 15,
    height: 92,
    borderRadius: 20,
  },
  userImagesContainer: {
    flexDirection: 'row',
    marginRight: 12,
  },
  userImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 2.5,
    borderColor: "#28292A",
    backgroundColor: '#ddd',
  },
  moreUsersCircle: {
    backgroundColor: '#6e3b6e',
    justifyContent: 'center',
    alignItems: 'center',
    // marginLeft: -10,
  },
  moreUsersText: {
    color: Color.whiteText,
    fontWeight: 'bold',
    fontSize: 12,
  },
  groupInfo: {
    flex: 1,
    // marginRight: 12,
  },
  groupName: {
    color: Color.whiteText,
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 4,
  },
  recentChat: {
    color: Color.whiteText,
    fontSize: 14,
  },
  recentTime: {
    color: Color.whiteText,
    fontSize: 12,
  },
  imageContainer: {
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  singleImage: {
    width: 60,
    height: 60,
    borderRadius: 32,
    borderWidth: 2.5,
    borderColor: "#28292A",

  },


  dualTopLeft: {
    width: 38,
    height: 38,
    borderRadius: 20,
    position: 'absolute',
    top: 0,
    left: 0,
    borderWidth: 2.5,
    borderColor: "#28292A",



  },
  dualBottomRight: {
    width: 38,
    height: 38,
    borderRadius: 20,
    position: 'absolute',
    bottom: 0,
    right: 0,
    borderWidth: 2.5,
    borderColor: "#28292A",


  },


  triTop: {
    width: 33,
    height: 33,
    borderRadius: 17,
    position: 'absolute',
    top: 0,
    left: 11,
    borderWidth: 2.5,
    borderColor: "#28292A",


  },
  triBottomLeft: {
    width: 33,
    height: 33,
    borderRadius: 18,
    position: 'absolute',
    bottom: 0,
    left: 0,
    borderWidth: 2.5,
    borderColor: "#28292A",


  },
  triBottomRight: {
    width: 33,
    height: 33,
    borderRadius: 18,
    position: 'absolute',
    bottom: 0,
    right: 0,
    borderWidth: 2.5,
    borderColor: "#28292A",


  },

  fourGrid: {
    width: 60,
    height: 60,
    flexWrap: 'wrap',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,

    // justifyContent: 'space-between',
    // alignContent: 'space-between',
  },

  gridImageTopLeft: {
    width: 32,
    height: 32,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: "#28292A",
    zIndex: 999,
    top: 2,
    marginRight: -5,

    // bring closer to right one
  },

  gridImageTopRight: {
    width: 32,
    height: 32,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: "#28292A",
    zIndex: 998,


    // right:3,
    // top:3,
    // marginTop: 5,     
    //      // slightly lower than top-left
    // marginLeft: -10,       // overlap slightly if needed

  },

  gridImageBottomLeft: {
    width: 32,
    height: 32,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: "#28292A",
    zIndex: 997,


    // alignSelf: 'flex-end',

  },

  gridImageBottomRight: {

    width: 32,
    height: 32,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: "#28292A",
    zIndex: 996,
    marginLeft: -5
    // alignSelf: 'flex-end',
  },
});

export default WatchScreen;