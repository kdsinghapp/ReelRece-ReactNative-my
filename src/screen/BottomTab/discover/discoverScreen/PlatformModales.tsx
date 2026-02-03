import React, { useState } from 'react';
import { View, ScrollView, Pressable, Image, TouchableOpacity, Modal, StyleSheet, Dimensions, ActivityIndicator, FlatList } from 'react-native';
import { Color } from '@theme/color';
import font from '@theme/font';
import CustomText from '@components/common/CustomText/CustomText';
import { getUserSubscriptions } from '@redux/Api/SettingApi';
import { RootState } from '@redux/store';
import { useSelector } from 'react-redux';
import imageIndex from '@assets/imageIndex';
import { SuccessMessageCustom } from '@components/index';
import { t } from 'i18next';

const PlatformModales = ({ visible,
    onClose,
    reset,
    onApply,
    platformsData,
    selectedPlatforms,
    setSelectedPlatforms }: boolean | string | object | number | null) => {

    const token = useSelector((state: RootState) => state.auth.token);
    const [toestMess, setToestMess] = useState(false)
    const [toestMessColorGreen, setToestMessGreen] = useState(false)
    const [toastMessage, setToastMessage] = useState('')

    const togglePlatform = (platformId) => {
        setSelectedPlatforms(prev =>
            prev.includes(platformId)
                ? prev.filter(id => id !== platformId)
                : [...prev, platformId]
        );
    };

    // const restoreFormSetting = async () => {
    //     try {
    //         const response = await getUserSubscriptions(token)
    //         let lengthItem = response?.data.length;

    //         response?.data.map((ok) => {
    //             togglePlatform(ok.subscription)

    //         })
    //     } catch (error) {

    //     }
    // }

    // useEffect(()=> {
    //     restoreFormSetting()
    // })
    // Select all platforms

    //   const togglePlatformForRestore = (platformName) => {
    //     setSelectedPlatforms(prev =>
    //         prev.includes(platformName)
    //             ? prev.filter(name => name !== platformName) // remove
    //             : [...prev, platformName]                   // add
    //     );
    // };

    // const togglePlatformForRestore = (index) => {
    //     setSelectedPlatforms(prev =>
    //         prev.includes(index)
    //             ? prev                 // already selected, do nothing
    //             : [...prev, index]     // add if not present
    //     );
    // };
    const restoreFormSetting = async () => {
        try {
            const response = await getUserSubscriptions(token);

            // Extract subscriptions
            const restoredPlatforms = response?.data.map(item => item.subscription) || [];

            // Update state ONCE
            setSelectedPlatforms(restoredPlatforms);

            // Show toast
            setToastMessage(t("errorMessage.savedPlatformsRestored"));
            // ("Saved platforms restored!");
            setToestMessGreen(true);
            setToestMess(true);

        } catch (error) {
            setToastMessage(t("errorMessage.failedrestoreplatforms"));
            setToestMessGreen(false);
            setToestMess(true);
        }
    };



    // const restoreFormSetting = async () => {
    //     try {
    //         const response = await getUserSubscriptions(token);
    //         let lengthItem = response?.data.length;

    //         response?.data.map((ok) => {
    //              
    //             togglePlatformForRestore(ok.subscription);
    //         });


    //         setToastMessage("Saved platforms restored!");
    //         setToestMessGreen(true);
    //         setToestMess(true);


    //         setTimeout(() => {
    //             setToestMess(false);
    //         }, 2000);
    //     } catch (error) {
    //         setToastMessage("Failed to restore platforms!");
    //         setToestMessGreen(false);
    //         setToestMess(true);

    //         setTimeout(() => {
    //             setToestMess(false);
    //         }, 2000);
    //     }
    // };


    const selectAll = () => {
        setSelectedPlatforms(platformsData.map(platform => platform.supported_platform));
    };

    // Reset selection
    // const resetSelection = () => {
    //     setSelectedPlatforms([]);
    // };

    // Apply selection
    // const applySelection = () => {
    //     onClose(selectedPlatforms);
    // };

    // Count services (assuming some platforms are marked as telecom)
    const totalServices = platformsData.filter(p => !p?.isTelecom).length;
    const selectedServices = selectedPlatforms.filter(id => {
        const platform = platformsData.find(p => p.supported_platform === id);
        return platform && !platform.isTelecom;
    }).length;

    return (
        <Modal visible={visible} transparent animationType="slide">
            {/* <TouchableOpacity style={styles.modalContainer} activeOpacity={1} onPress={() => onClose(selectedPlatforms)}  > */}
            {/* <TouchableOpacity style={styles.modalContainer} activeOpacity={1} onPress={() => onClose(selectedPlatforms)}  > */}

            {/* Background overlay */}
            <TouchableOpacity
                style={styles.modalContainer}
                activeOpacity={1}
                onPress={() => onClose(selectedPlatforms)}
            >
                <View style={{ flex: 1 }} />
            </TouchableOpacity>
            <View style={styles.modalBox}>
                {/* <Text style={styles.modalTitle}>Platform</Text> */}
                <CustomText
                    size={16}
                    color={Color.whiteText}
                    style={styles.modalTitle}
                // font={font.PoppinsBold}
                >
                    {(t("discover.platform"))}

                </CustomText>
                {/* Counters */}
                <View style={styles.countersContainer}>

                    <CustomText
                        size={13}
                        color={Color.whiteText}
                        style={styles.counterText}
                        font={font.PoppinsRegular}
                    >
                        {totalServices}                      {(t("discover.services"))}

                    </CustomText>


                    <CustomText
                        size={13}
                        color={Color.whiteText}
                        style={[styles.counterText, { color: Color.primary }]}
                        font={font.PoppinsRegular}
                    >
                        {selectedServices} {(t("discover.selected"))}
                    </CustomText>
                </View>



                {/* Select All button */}
                <TouchableOpacity onPress={selectAll} style={styles.selectAllButton}>

                    <CustomText
                        size={16}
                        color={Color.whiteText}
                        style={styles.selectAllText}
                        font={font.PoppinsMedium}
                    >
                        {(t("discover.selectall"))}
                    </CustomText>
                </TouchableOpacity>

                {/* Platforms list */}
                <View style={{ height: Dimensions.get('window').height * 0.4 }} >
                    <ScrollView contentContainerStyle={styles.modalContent}>

                        {platformsData.length == 0 ? (

                            <ActivityIndicator color={Color.primary}
                                size={'small'}
                            />
                        ) : (
                            <>

                                <FlatList
                                    data={platformsData}
                                    keyExtractor={(item) => item.supported_platform}
                                    renderItem={({ item }) => {
                                        const isSelected = selectedPlatforms.includes(item.supported_platform);

                                        return (
                                            <Pressable
                                                onPress={() => togglePlatform(item.supported_platform)}
                                                style={[styles.modalItem]} // optional selected style
                                            >
                                                <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                                                    <Image
                                                        source={{ uri: item.icon }}
                                                        style={styles.platformIcon}
                                                        resizeMode="contain"
                                                    />
                                                    <CustomText
                                                        size={14}
                                                        color={Color.whiteText}
                                                        style={[styles.modalItemText, { marginLeft: 10 }]}
                                                        font={font.PoppinsMedium}
                                                        numberOfLines={1}
                                                    >
                                                        {item.supported_platform}
                                                    </CustomText>
                                                </View>

                                                {/* Just show the checkbox, no need for TouchableOpacity */}
                                                <Image
                                                    source={isSelected ? imageIndex.checKBoxActive : imageIndex.checkBox}
                                                    style={styles.checkboxIcon}
                                                />
                                            </Pressable>
                                        );
                                    }}
                                    extraData={selectedPlatforms} // ensures re-render when selection changes
                                />


                                {/* {platformsData?.map((platform) => (
                            <Pressable
                                key={platform.supported_platform}
                                onPress={() => togglePlatform(platform.supported_platform)}
                                style={[styles.modalItem]}
                            >

                                <View style={{ flexDirection: 'row', alignItems: 'center' }} >
                                    <Image source={{ uri: platform?.icon }} style={styles.platformIcon} resizeMode="contain" />
                                    <CustomText
                                        size={14}
                                        color={Color.whiteText}
                                        style={[styles.modalItemText]}
                                        font={font.PoppinsMedium}
                                        numberOfLines={1}
                                    >
                                        {platform?.supported_platform}
                                    </CustomText>
                                </View>

                                <TouchableOpacity style={{ alignSelf: 'center', justifyContent: 'center' }} onPress={() => togglePlatform(platform?.supported_platform)}>
                                    <Image
                                        source={
                                            selectedPlatforms.includes(platform?.supported_platform)
                                                ? imageIndex.checKBoxActive
                                                : imageIndex.checkBox
                                        }
                                        style={styles.checkboxIcon}
                                    />
                                </TouchableOpacity>
                            </Pressable>
                        ))} */}

                            </>
                        )}

                    </ScrollView>

                </View>




                {/* Footer buttons */}
                <View style={styles.bottomButtonContainerBox}  >
                    <View style={styles.bottomButtonContainer}>
                        <TouchableOpacity onPress={reset} style={styles.selectButton}>
                            {/* <Text style={[styles.buttonTxt, { fontFamily: font.PoppinsMedium }]} >Reset</Text> */}

                            <CustomText
                                size={14}
                                color={Color.lightGrayText}
                                style={styles.buttonTxt}
                                font={font.PoppinsMedium}
                            >
                                {(t("discover.reset"))}

                            </CustomText>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={onApply} style={styles.cancelButton}>
                            {/* <Text style={styles.buttonTxt} >Apply</Text> */}
                            <CustomText
                                size={14}
                                color={Color.whiteText}
                                style={[styles.buttonTxt, {
                                    color: Color.whiteText
                                }]}
                                font={font.PoppinsMedium}
                            >
                                {(t("discover.apply"))}
                            </CustomText>
                        </TouchableOpacity>

                    </View>
                </View>



                {/* Close button */}
                <TouchableOpacity
                    onPress={restoreFormSetting}
                    style={styles.modalCloseBtn}>
                    <CustomText
                        size={14}
                        color={Color.lightGrayText}
                        style={{ color: Color.primary, }}
                        font={font.PoppinsRegular}
                    >
                        {(t("discover.restoresettings"))}

                    </CustomText>
                </TouchableOpacity>
                {toestMess && (
                    <SuccessMessageCustom
                        textColor={Color.whiteText}
                        color={toestMessColorGreen ? Color.green : Color.red}
                        message={toastMessage}
                    />
                )}
            </View>

            {/* </TouchableOpacity> */}
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalContainer: {
        flex: 1,
        justifyContent: 'flex-end',
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    modalBox: {
        backgroundColor: Color.modalBg,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        paddingVertical: 20,
        maxHeight: '80%',
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 10,
        textAlign: 'center',
        color: Color.whiteText,
    },
    countersContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginBottom: 10,
        paddingHorizontal: 24,
    },
    counterText: {
        marginRight: 4,
    },
    selectAllButton: {
        alignSelf: 'flex-start',
        marginBottom: 10,
        paddingHorizontal: 24,

    },
    selectAllText: {
        color: Color.whiteText,
        fontFamily: font.PoppinsRegular,
        fontSize: 16,
    },
    modalContent: {
        // paddingBottom: 20,
    },
    modalItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginVertical: 8,
        paddingHorizontal: 24,
    },
    selectedModalItem: {
        backgroundColor: '#f0f8ff',
    },
    platformIcon: {
        width: 40,
        height: 40,
        marginRight: 12,
        borderRadius: 10
    },
    modalItemText: {
        width: '77%',
    },

    // actionButtonsContainer: {
    //     flexDirection: 'row',
    //     justifyContent: 'space-between',
    //     alignItems:'center',
    //     // marginTop: 10,
    // },
    resetButton: {
        backgroundColor: '#e0e0e0',
        padding: 12,
        borderRadius: 8,
        flex: 1,
        marginRight: 10,
        alignItems: 'center',
    },
    applyButton: {
        backgroundColor: '#007AFF',
        padding: 12,
        borderRadius: 8,
        flex: 1,
        alignItems: 'center',
    },
    buttonText: {
        color: Color.whiteText,
    },
    modalCloseBtn: {
        paddingHorizontal: 15,
        paddingVertical: 6,
        borderRadius: 8,
        // marginTop: 8,
        alignItems: 'center',
    },
    checkboxIcon: {
        width: 20,
        height: 20,
    },
    bottomButtonContainerBox: {
        height: 90,
        width: '100%',                // ✅ full width
        paddingHorizontal: 20,
        backgroundColor: 'rgba(26,26,26,0.8)',
        justifyContent: 'center',
    },

    bottomButtonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between', // ✅ evenly spaced
        alignItems: 'center',
    },

    selectButton: {
        flex: 1,                      // ✅ equal width
        height: 43,
        borderWidth: 0.5,
        borderColor: Color.textGray,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 12,
        marginRight: 15,              // ✅ gap between buttons
    },

    cancelButton: {
        flex: 1,                      // ✅ equal width
        height: 43,
        backgroundColor: Color.primary,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 12,
    },

    buttonTxt: {
        fontSize: 14,
        color: '#CDCDCD',
        fontFamily: font.PoppinsRegular
    },


});

export default PlatformModales;