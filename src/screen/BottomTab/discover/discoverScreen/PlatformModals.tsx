import React, { useState, useCallback, useMemo } from 'react';
import { View, Pressable, Image, TouchableOpacity, Modal, StyleSheet, Dimensions, ActivityIndicator, FlatList } from 'react-native';
import { Color } from '@theme/color';
import font from '@theme/font';
import CustomText from '@components/common/CustomText/CustomText';
import { getUserSubscriptions } from '@redux/Api/SettingApi';
import { RootState } from '@redux/store';
import { useSelector } from 'react-redux';
import imageIndex from '@assets/imageIndex';
import { SuccessMessageCustom } from '@components/index';
import { t } from 'i18next';

type PlatformItem = { supported_platform: string; icon: string; isTelecom?: boolean };

interface PlatformModalsProps {
    visible: boolean;
    onClose: (platforms: string[]) => void;
    reset: () => void;
    onApply: () => void;
    platformsData: PlatformItem[];
    selectedPlatforms: string[];
    setSelectedPlatforms: React.Dispatch<React.SetStateAction<string[]>>;
}

const LIST_HEIGHT = Dimensions.get('window').height * 0.4;

const PlatformRow = React.memo(({ item, isSelected, onToggle }: { item: PlatformItem; isSelected: boolean; onToggle: (id: string) => void }) => (
    <Pressable onPress={() => onToggle(item.supported_platform)} style={styles.modalItem}>
        <View style={styles.platformRow}>
            <Image source={{ uri: item.icon }} style={styles.platformIcon} resizeMode="contain" />
            <CustomText size={14} color={Color.whiteText} style={styles.modalItemTextWithMargin} font={font.PoppinsMedium} numberOfLines={1}>
                {item.supported_platform}
            </CustomText>
        </View>
        <Image source={isSelected ? imageIndex.checKBoxActive : imageIndex.checkBox} style={styles.checkboxIcon} />
    </Pressable>
));

const PlatformModals = ({ visible, onClose, reset, onApply, platformsData, selectedPlatforms, setSelectedPlatforms }: PlatformModalsProps) => {
    const token = useSelector((state: RootState) => state.auth.token);
    const [toastMess, setToastMess] = useState(false);
    const [toastMessColorGreen, setToastMessGreen] = useState(false);
    const [toastMessage, setToastMessage] = useState('');

    const togglePlatform = useCallback((platformId: string) => {
        setSelectedPlatforms((prev: string[]) =>
            prev.includes(platformId)
                ? prev.filter((id: string) => id !== platformId)
                : [...prev, platformId]
        );
    }, [setSelectedPlatforms]);

    const restoreFormSetting = useCallback(async () => {
        try {
            const response = await getUserSubscriptions(token ?? '');
            const restoredPlatforms = response?.data.map((item: { subscription: string }) => item.subscription) || [];
            setSelectedPlatforms(restoredPlatforms);
            setToastMessage(t("saved platform restored") ?? '');
            setToastMessGreen(true);
            setToastMess(true);
        } catch (error) {
            setToastMessage(t("errorMessage.failedrestoreplatforms") ?? '');
            setToastMessGreen(false);
            setToastMess(true);
        }
    }, [token, setSelectedPlatforms]);

    const selectAll = useCallback(() => {
        setSelectedPlatforms(platformsData.map((platform: PlatformItem) => platform.supported_platform));
    }, [platformsData, setSelectedPlatforms]);

    const selectedServices = useMemo(() => {
        return selectedPlatforms?.filter((id: string) => {
            const platform = platformsData?.find((p: PlatformItem) => p.supported_platform === id);
            return platform && !platform.isTelecom;
        }).length;
    }, [selectedPlatforms, platformsData]);

    const handleClose = useCallback(() => onClose(selectedPlatforms), [onClose, selectedPlatforms]);

    const renderItem = useCallback(({ item }: { item: PlatformItem }) => {
        const isSelected = selectedPlatforms.includes(item?.supported_platform);
        return <PlatformRow item={item} isSelected={isSelected} onToggle={togglePlatform} />;
    }, [selectedPlatforms, togglePlatform]);

    const keyExtractor = useCallback((item: PlatformItem) => item.supported_platform, []);

    return (
        <Modal visible={visible} transparent animationType="slide">
            <TouchableOpacity style={styles.modalContainer} activeOpacity={1} onPress={handleClose}>
                <View style={styles.modalOverlayFill} />
            </TouchableOpacity>
            <View style={styles.modalBox}>
                <CustomText
                    size={16}
                    color={Color.whiteText}
                    style={styles.modalTitle}
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
                        {(t("discover.services"))}

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

                {/* Platforms list - FlatList only (no ScrollView) so virtualization works */}
                <View style={styles.listContainer}>
                    {platformsData?.length === 0 ? (
                        <ActivityIndicator color={Color.primary} size="small" />
                    ) : (
                        <FlatList
                            data={platformsData}
                            keyExtractor={keyExtractor}
                            renderItem={renderItem}
                            extraData={selectedPlatforms}
                            contentContainerStyle={styles.modalContent}
                            removeClippedSubviews={true}
                            maxToRenderPerBatch={12}
                            windowSize={5}
                            initialNumToRender={10}
                        />
                    )}
                </View>
                {/* Footer buttons */}
                <View style={styles.bottomButtonContainerBox}  >
                    <View style={styles.bottomButtonContainer}>
                        <TouchableOpacity onPress={reset} style={styles.selectButton}>

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
                {toastMess && (
                    <SuccessMessageCustom
                        textColor={Color.whiteText}
                        color={toastMessColorGreen ? Color.green : Color.red}
                        message={toastMessage}
                    />
                )}
            </View>

        </Modal>
    );
};

export default React.memo(PlatformModals);

const styles = StyleSheet.create({
    modalContainer: {
        flex: 1,
        justifyContent: 'flex-end',
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    modalOverlayFill: {
        flex: 1,
    },
    listContainer: {
        height: LIST_HEIGHT,
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
    platformRow: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    platformIcon: {
        width: 40,
        height: 40,
        marginRight: 12,
        borderRadius: 10,
    },
    modalItemText: {
        width: '77%',
    },
    modalItemTextWithMargin: {
        width: '77%',
        marginLeft: 10,
    },
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
