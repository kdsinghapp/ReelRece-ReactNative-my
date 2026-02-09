import { Image, StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { Color } from '@theme/color';
 import FastImage from 'react-native-fast-image';
import { BASE_IMAGE_URL } from '@config/api.config';

const GroupAllAvatars = ({ group }: { group: { members: Array<{ avatar: string }> } }) => {

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
    const renderUserImages = () => {
       const users = group?.members
  ? group?.members?.map((item) => item?.avatar)
  : group?.map((item) => item?.avatar) || []; // fallback if group is an array

// Total number of users
const totalUsers = users.length;
        // const renderImage = (user, style, key = null) => (
        //     <Image
        //         key={key || user?.userId}
        //         source={user?.userImage}
        //         style={style}
        //         resizeMode='contain'
        //     />

        // );

        const renderImage = (avatarPath, style, key = null) => (
            <FastImage 
            
            
            source={{
                uri: `${BASE_IMAGE_URL}${avatarPath}`,
                cache :FastImage.cacheControl.immutable,
                priority: FastImage.priority.low
            }}
            style={style}
            resizeMode={FastImage.resizeMode.cover}
            />
            // <Image
            //     key={key}
            //     source={{ uri: `${BASE_IMAGE_URL}${avatarPath}` }}
            //     style={style}
            //     resizeMode="cover"
            // />
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
                        {users?.slice(0, 3).map((user, index) =>
                            renderImage(
                                user,
                                getGridImageStyleByIndex(index),
                                index.toString()
                            )
                        )}

                        {/* 4th spot with +N count */}
                        <View style={[getGridImageStyleByIndex(3), styles.moreUsersCircle]}>
                            <Text  allowFontScaling={false}  style={styles.moreUsersText}>{totalUsers}</Text>
                        </View>
                    </View>
                );
        };
    }

    return (
        renderUserImages()
        // renderUserImages
    )
}

export default GroupAllAvatars

const styles = StyleSheet.create({


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
        backgroundColor: Color.primary,
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
        marginRight: 14,

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
