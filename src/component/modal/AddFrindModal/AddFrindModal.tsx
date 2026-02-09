import React, { useEffect, useState } from 'react';
import { Modal, View, Text, Image, TouchableOpacity, StyleSheet,  Dimensions } from 'react-native';
import imageIndex from '@assets/imageIndex';
import { Color } from '@theme/color';
 import font from '@theme/font';
 import { BlurView } from '@react-native-community/blur';
import { addMembersToGroup, getGroupMembers } from '@redux/Api/GroupApi';
import SelectFriendCom from '@components/common/SelectFriendCom/SelectFriendCom';
import { t } from 'i18next';
 

interface props {
    type: boolean;
    token: string;
}
const AddFrindModal = ({ visible, onClose, groupId, token ,fetchGroups}) => {
    const [addmembers, setAddMembers] = useState<string[]>([])
     const handleAddMemberss = async (token, groupId, addmembers) => {   
        try {
            const response = await addMembersToGroup(token, groupId, addmembers)
          } catch (error) {
        }
    }
     const buttonBlur = () => {
        <View style={styles.bottomButtonContainer}>
            {/* <View style={styles.blurBackground}> */}
            {/* <BlurView
      style={StyleSheet.absoluteFill}
      blurType="dark"
      blurAmount={20}
      reducedTransparencyFallbackColor="rgba(255, 0, 0, 0.8)"
    /> */}
            {/* </View> */}
            <TouchableOpacity style={styles.selectButton} onPress={onClose}>
                <Text  allowFontScaling={false}  style={[styles.buttonTxt, { fontFamily: font.PoppinsMedium }]}>{t("common.cancel")}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.addBtn} onPress={onClose} >
                <Text  allowFontScaling={false}  style={styles.buttonTxt}>{t("common.add")}</Text>
            </TouchableOpacity>
        </View>
    }
     return (
        <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose} >
            <View style={styles.modalOverlay}>
                <View style={styles.modalContainer}>
                    <View style={styles.header}>
                        <Text  allowFontScaling={false}  style={styles.headerText}></Text>
                        <Text  allowFontScaling={false}  style={styles.headerText}>{t("discover.addFriend")}</Text>
                        <TouchableOpacity onPress={onClose}>
                            <Image source={imageIndex.closeimg}
                                style={{
                                    height: 38,
                                    width: 24
                                }}
                                resizeMode='contain'
                            />
                        </TouchableOpacity>
                    </View>
                    {/* <AddSelectFriendComCopy token={token} 
groupId={groupId}
                     type={"Friend"} setAddMembers={setAddMembers} /> */}
                    {/* <SelectFriendCom token={token} 
groupId={groupId}
                     type={"Friend"} setAddMembers={setAddMembers} /> */}

                     <SelectFriendCom token={token} 
groupId={groupId}
                     type={"Friend"} setAddMembers={setAddMembers} />
                    {/* Buttons */}
                    <View style={styles.bottomButtonContainer}>
                        <View style={styles.blurBackground}>
                            <BlurView
                                style={StyleSheet.absoluteFill}
                                blurType="dark"
                                blurAmount={20}
                                reducedTransparencyFallbackColor="rgba(215, 47, 47, 0.8)"
                            />
                        </View>
                        <TouchableOpacity style={styles.selectButton} onPress={onClose}>
                            <Text  allowFontScaling={false}  style={[styles.buttonTxt, { fontFamily: font.PoppinsMedium }]}>Cancel</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.addBtn}
                            onPress={async () => {
                                await handleAddMemberss(token, groupId, addmembers);
                                onClose(addmembers);
                            }}
                        >
                            <Text  allowFontScaling={false}  style={styles.buttonTxt}>{t("common.add")}
                                </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContainer: {
        backgroundColor: 'rgba(37, 37, 37, 0.9)',
        // padding: 20,
        borderTopLeftRadius: 10,
        borderTopRightRadius: 10,
         maxHeight: Dimensions.get('window').height * 0.7,
    minHeight: Dimensions.get('window').height * 0.7,
        // position:"absolute",
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
        marginTop: 18,
        paddingHorizontal: 18
    },
    headerText: {
        color: Color.whiteText,
        fontSize: 20,
        fontFamily: font.PoppinsBold
     },
    groupScore: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        marginBottom: 8,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center"
    },
    groupScoreText: {
        color: Color.lightGrayText,
        fontWeight: 'bold',
        fontSize: 14,
    },
    userRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
        paddingVertical: 2,
    },
    avatar: {
        width: 50,
        height: 50,
        marginRight: 10,
    },
    dot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        marginRight: 8,
    },
    name: {
        flex: 1,
        color: Color.whiteText,
        fontSize: 15,
        fontWeight: '700',
    },
    scoreBox: {
        borderRadius: 14,
        paddingHorizontal: 10,
        paddingVertical: 5,
    },
    scoreText: {
        color: '#1f1f1f',
        fontWeight: 'bold',
        fontSize: 13,
    },
    bottomButtonContainer: {
        // flex:1,
        backgroundColor: 'rgba(37, 37, 37, 0.9)',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: 20,
        paddingHorizontal: 18,
        bottom: 0,
        right: 0,
        left: 0,
        paddingVertical: 20,
        position: 'absolute',
    },
    blurBackground: {
        ...StyleSheet.absoluteFillObject,
        borderTopLeftRadius: 10,
        borderTopRightRadius: 10,
        overflow: 'hidden',
        zIndex: -1, // 👈 behind the buttons
    },

    selectButton: {
        borderColor: Color.placeHolder,
        borderWidth: 1,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        width: "47%",
        // paddingHorizontal: "20%",
        paddingVertical: 10,
        height:42 ,
 
    },
    addBtn: {
        backgroundColor: Color.primary,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        // paddingHorizontal: 24,
        width: "47%",
            height:42 ,

         borderWidth: 1,
        marginLeft: 15,
    },
    buttonTxt: {
        color: Color.whiteText,
        fontFamily: font.PoppinsBold,
        fontSize: 14,
        textAlign:"center"
    },
});

export default AddFrindModal;
