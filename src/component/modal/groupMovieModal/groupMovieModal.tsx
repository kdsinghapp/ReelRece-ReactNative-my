import React, { useEffect, useState, useRef } from 'react';
import {
    View,
    Text,
    Modal,
    TouchableOpacity,
    StyleSheet,
    FlatList,
    Image,
    TouchableNativeFeedback,
     LayoutChangeEvent
} from 'react-native';
import Slider from '@react-native-community/slider';
import imageIndex from '@assets/imageIndex';
import { Color } from '@theme/color';
import font from '@theme/font';
 import FastImage from 'react-native-fast-image';
import { BASE_IMAGE_URL } from '@config/api.config';

const THUMB_SIZE = 24;
const BUBBLE_WIDTH = 50;
const BUBBLE_HEIGHT = 30;
const ARROW_SIZE = 6;
 
const GroupMovieModal = ({ visible, onClose, setTotalFilterApply, group, groupId, token, filterFunc, groupTotalMember }) => {
    const [selectedUsers, setSelectedUsers] = useState<number[]>([]);
    const [userSectionOpen, setUserSectionOpen] = useState(true);
    const [groupSectionOpen, setGroupSectionOpen] = useState(true);
    const [groupValue, setGroupValue] = useState(0);
    const [sliderWidth, setSliderWidth] = useState(0);
     const group_members = group?.members || group;
// const groupTotalMember = group_members?.map(item => ({
//     ...item,
//     active: (item.activities_cnt ?? 0) > 0,
//   }))
//   .filter(item => item.active === true)
//   .length;

 
    let countfilter = 0;
    
    const toggleUser = (id: number) => {

         // Double-check that we're only toggling active users
        const user = group_members?.find(member => member?.username === id);
        if (user && (user?.active === false)) {
            return; // Don't toggle inactive users
        }
        
        setSelectedUsers(prev =>
            prev.includes(id) ? prev.filter(uid => uid !== id) : [...prev, id]
        );
    };
    
    useEffect(() => {
        if (groupValue > 0) {
            countfilter = 1;
        }
        countfilter = selectedUsers.length + countfilter;
        setTotalFilterApply(countfilter);
    }, [selectedUsers, groupValue]);

    // PERFECT BUBBLE POSITIONING - Centers bubble over thumb in ALL cases
    const getBubblePosition = () => {
        if (groupTotalMember === 0 || sliderWidth === 0) return 0;
        if(groupValue ==0){

        } else if(groupValue == 4 )
     {           const trackWidth = sliderWidth - THUMB_SIZE;
   
         if (groupValue === groupTotalMember) return trackWidth - (BUBBLE_WIDTH / 2) + (THUMB_SIZE / 2);
        
        // Calculate percentage of current value
        const percentage = groupValue / groupTotalMember;
          const thumbCenter = (percentage * trackWidth) + (THUMB_SIZE / 2);
 const bubbleLeft = thumbCenter - (BUBBLE_WIDTH / 
    
    2);
    
         return bubbleLeft +1;


        } else{

                    const trackWidth = sliderWidth - THUMB_SIZE;
    
         // Handle edge cases
        if (groupValue === 0) return 0;
        if (groupValue === groupTotalMember) return trackWidth - (BUBBLE_WIDTH / 2) + (THUMB_SIZE / 2);
        
        // Calculate percentage of current value
        const percentage = groupValue / groupTotalMember;
          const thumbCenter = (percentage * trackWidth) + (THUMB_SIZE / 2);
 const bubbleLeft = thumbCenter - (BUBBLE_WIDTH / 
    
    2);
 

          return bubbleLeft -2.5;
        }
        // Calculate available track width (excluding thumb radius on both ends)

    };
    

    const handleSliderLayout = (e: LayoutChangeEvent) => {
        const { width } = e.nativeEvent.layout;
        setSliderWidth(width);
    };

    const resetFilters = () => {
        setSelectedUsers([]);
        setGroupValue(0);
        countfilter = 0;
        onClose();
    };

    return (
        <Modal 
            animationType="slide"
            transparent
            visible={visible}
            onRequestClose={onClose}
        >
            <TouchableOpacity style={styles.overlay} onPress={() => onClose()}>
                <TouchableNativeFeedback>
                    <View style={styles.modalContent}>
                        {/* Header */}
                        <View style={styles.header}>
                            <Text style={styles.modalTitle}>Filter</Text>
                            <TouchableOpacity onPress={onClose}>
                                <Image source={imageIndex.closeimg} style={styles.closeIcon} />
                            </TouchableOpacity>
                        </View>

                        {/* Liked by User Section */}
                        <TouchableOpacity
                            activeOpacity={0.8}
                            style={styles.sectionHeader}
                            onPress={() => setUserSectionOpen(!userSectionOpen)}
                        >
                            <Text style={styles.sectionTitle}>Liked by User</Text>
                            {userSectionOpen ? 
                                <Image source={imageIndex.arrowUp} style={styles.arrowStyle} /> : 
                                <Image source={imageIndex.arrowDown} style={styles.arrowStyle} />
                            }
                        </TouchableOpacity>
                        
                        <View style={{ maxHeight: '35%' }}>
                            {userSectionOpen && (
                                <FlatList
                                    data={group_members}
                                    keyExtractor={item => item?.username.toString()}
                                    renderItem={({ item }) => {
                                        const selected = selectedUsers.includes(item?.username);
                                        const isActive = item?.active ?? true; // Default to true for backward compatibility
                                        const activitiesCount = item?.activities_cnt ?? 0;
                                        
                                        return (
                                            <View style={[
                                                styles.userItem,
                                                !isActive && styles.userItemInactive
                                            ]}>
                                                <FastImage
                                                    style={[
                                                        styles.avatar,
                                                        !isActive && styles.avatarInactive
                                                    ]}
                                                    source={{
                                                        uri: `${BASE_IMAGE_URL}${item?.avatar}`,
                                                        priority: FastImage.priority.low,
                                                        cache: FastImage.cacheControl.immutable,
                                                    }}
                                                    resizeMode={FastImage.resizeMode.cover}
                                                />
                                                <View style={styles.userInfo}>
                                                    <Text style={[
                                                        styles.userName,
                                                        !isActive && styles.userNameInactive
                                                    ]}>
                                                        {item?.name ? item?.name : item?.username}
                                                    </Text>
                                                    {activitiesCount > 0 && (
                                                        <Text style={styles.activityCount}>
                                                            {activitiesCount} {activitiesCount === 1 ? 'activity' : 'activities'}
                                                        </Text>
                                                    )}
                                                </View>
                                                <TouchableOpacity 
                                                    onPress={() => isActive && toggleUser(item?.username)}
                                                    disabled={!isActive}
                                                    style={styles.checkboxContainer}
                                                >
                                                    <Image
                                                        source={
                                                            selected && isActive
                                                                ? imageIndex.checKBoxActive
                                                                : imageIndex.checkBox
                                                        }
                                                        style={[
                                                            styles.checkboxIcon,
                                                            !isActive && styles.checkboxInactive
                                                        ]}
                                                    />
                                                </TouchableOpacity>
                                            </View>
                                        );
                                    }}
                                    initialNumToRender={10}
                                    maxToRenderPerBatch={10}
                                    windowSize={7}
                                    removeClippedSubviews
                                />
                            )}
                        </View>
                        
                        {/* Liked by Group Section */}
                        <TouchableOpacity
                            activeOpacity={0.8}
                            style={styles.sectionHeader}
                            onPress={() => setGroupSectionOpen(!groupSectionOpen)}
                        >
                            <Text style={styles.sectionTitle}>Liked by Group</Text>
                            {groupSectionOpen ? 
                                <Image source={imageIndex.arrowUp} style={styles.arrowStyle} /> : 
                                <Image source={imageIndex.arrowDown} style={styles.arrowStyle} />
                            }
                        </TouchableOpacity>
                        
                        {groupSectionOpen && (
                            <View style={styles.sliderSection}>
                                <Text style={styles.groupValue}>0</Text>
                                
                                <View style={styles.sliderWrapper}>
                                    {/* Slider Container with Bubble */}
                                    <View 
                                        style={styles.sliderContainer}
                                        onLayout={handleSliderLayout}
                                    >
                                        {/* Bubble positioned absolutely */}
                                        {sliderWidth > 0 && (
                                            <View
                                                style={[
                                                    styles.bubbleContainer,
                                                    { 
left: groupValue  == 0 ?  -9.5 :  groupValue  == groupTotalMember ?   sliderWidth-42:getBubblePosition(),                                                    }
                                                ]}
                                            >
                                                <View style={styles.bubble}>
                                                    <Text style={styles.bubbleText}>{groupValue}</Text>
                                                    <Image
                                                        source={imageIndex.thumpUP}
                                                        resizeMode="contain"
                                                        style={styles.likeIcon}
                                                    />
                                                </View>
                                                <View style={styles.bubbleArrow} />
                                            </View>
                                        )}
                                        
                                        {/* Slider Component */}
                                        <Slider
                                            style={styles.slider}
                                            minimumValue={0}
                                            maximumValue={groupTotalMember || 0}
                                            step={1}
                                            value={groupValue}
                                            onValueChange={value => setGroupValue(Math.round(value))}
                                            minimumTrackTintColor={Color.primary}
                                            maximumTrackTintColor="#ccc"
                                            thumbTintColor={Color.whiteText}
                                            thumbSize={THUMB_SIZE}
                                        />
                                    </View>
                                </View>
                                
                                <Text style={styles.groupValue}>{groupTotalMember}</Text>
                            </View>
                        )}

                        {/* Footer buttons */}
                        <View style={styles.bottomButtonContainerBox}>
                            <View style={styles.bottomButtonContainer}>
                                <TouchableOpacity onPress={resetFilters} style={styles.selectButton}>
                                    <Text style={[styles.buttonTxt, { fontFamily: font.PoppinsMedium }]}>Reset</Text>
                                </TouchableOpacity>
                                <TouchableOpacity  

  disabled={groupTotalMember<=  0}
                                    onPress={() => {
                                        onClose();
                                        filterFunc(selectedUsers, groupValue);
                                    }} 
                                    style={[
    styles.cancelButton,
    groupTotalMember <=0  && {
        opacity:0.6
    },
  ]}
                                >
                                    <Text style={styles.buttonTxt}>Apply</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </TouchableNativeFeedback>
            </TouchableOpacity>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        justifyContent: 'flex-end',
        backgroundColor: 'rgba(0,0,0,0.2)',
    },
    modalContent: {
        backgroundColor: Color.modalTransperant,
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        paddingTop: 20,
        maxHeight: '75%',
        minHeight: '75%',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
        paddingHorizontal: 20,
    },
    modalTitle: {
        fontSize: 18,
        color: 'white',
        textAlign: 'center',
        flex: 1,
        fontFamily: font.PoppinsBold
    },
    closeIcon: {
        width: 18,
        height: 18,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 14,
        paddingHorizontal: 20,
        marginVertical: 10,
        backgroundColor: Color.grey,
        borderRadius: 10,
        marginHorizontal: 20,
    },
    sectionTitle: {
        fontSize: 14,
        color: Color.whiteText,
        fontFamily: font.PoppinsBold,
    },
    userItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
        paddingHorizontal: 20,
    },
    userItemInactive: {
        opacity: 0.5,
    },
    avatar: {
        width: 32,
        height: 32,
        borderRadius: 16,
        marginRight: 10,
    },
    avatarInactive: {
        opacity: 0.6,
    },
    userInfo: {
        flex: 1,
        justifyContent: 'center',
    },
    userName: {
        color: 'white',
        fontSize: 16,
        fontFamily: font.PoppinsMedium
    },
    userNameInactive: {
        color: '#888',
    },
    activityCount: {
        color: Color.primary,
        fontSize: 11,
        fontFamily: font.PoppinsRegular,
        marginTop: 2,
    },
    checkboxContainer: {
        padding: 4,
    },
    checkboxIcon: {
        width: 20,
        height: 20,
    },
    checkboxInactive: {
        opacity: 0.3,
    },
    groupValue: {
        color: 'white',
        textAlign: 'center',
        width: 30,
        fontSize: 14,
        fontFamily: font.PoppinsMedium
    },
    sliderSection: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 20,
         marginHorizontal: 11,
    },
    sliderWrapper: {
        flex: 1,
         position: 'relative',
    },
    sliderContainer: {
        width: '100%',
        height: 50,
        position: 'relative',
        justifyContent: 'center',
        alignItems: 'center',
    },
    bubbleContainer: {
        position: 'absolute',
        top: -BUBBLE_HEIGHT - ARROW_SIZE + 8, // Position bubble above the slider
        width: BUBBLE_WIDTH,
        height: BUBBLE_HEIGHT + ARROW_SIZE,
        alignItems: 'center',
        justifyContent: 'flex-end',
        zIndex: 10,
    },
    bubble: {
        width: BUBBLE_WIDTH,
        height: BUBBLE_HEIGHT,
        backgroundColor: Color.primary,
        borderRadius: 8,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 8,
    },
    bubbleText: {
        color: Color.whiteText,
        fontSize: 12,
        fontFamily: font.PoppinsMedium,
        textAlign: 'center',
        marginRight: 4,
    },
    likeIcon: {
        height: 16,
        width: 16,
    },
    bubbleArrow: {
        width: 0,
        height: 0,
        borderLeftWidth: ARROW_SIZE,
        borderRightWidth: ARROW_SIZE,
        borderTopWidth: ARROW_SIZE,
        borderLeftColor: 'transparent',
        borderRightColor: 'transparent',
        borderTopColor: Color.primary,
        marginTop: -1,
    },
    slider: {
        width: '100%',
        height: 40,
    },
    arrowStyle: {
        height: 22,
        width: 22,
        resizeMode: "contain",
        tintColor: Color.primary,
    },
    bottomButtonContainerBox: {
        height: 90,
        bottom: 20,
        position: 'absolute',
        right: 20,
        left: 20,
         // backgroundColor: "rgba(26, 26, 26,0.8)",
    },
    bottomButtonContainer: {
        flexDirection: 'row',
        marginBottom: 14,
        marginTop: 24,
        // maxHeight: '42%',
        justifyContent: 'space-between',
        flex:1
    },
    selectButton: {
        width: '46%',
        borderWidth: 0.5,
        borderColor: Color.textGray,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 24,
        paddingVertical: 6,
    },
    cancelButton: {
        backgroundColor: Color.primary,
        width: '47%',
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 24,
        paddingVertical: 10,
        borderWidth: 1,
        marginLeft: 15
    },
    buttonTxt: {
        color: Color.whiteText,
        fontFamily: font.PoppinsBold,
        fontSize: 14,
    }
});

export default GroupMovieModal; 