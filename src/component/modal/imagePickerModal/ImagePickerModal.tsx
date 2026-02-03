import React from 'react';
import { Modal, View, Text, TouchableOpacity, TouchableWithoutFeedback, StyleSheet, Dimensions, Image } from 'react-native';
import imageIndex from '@assets/imageIndex';
import { Color } from '@theme/color';

interface ImagePickerModalProps {
    modalVisible: boolean;
    setModalVisible: (visible: boolean) => void;
    pickImageFromGallery: () => void;
    takePhotoFromCamera: () => void;
    onClose: () => void;
}

const ImagePickerModal: React.FC<ImagePickerModalProps> = ({
    modalVisible,
    setModalVisible,
    pickImageFromGallery,
    takePhotoFromCamera,
    onClose
}) => {
    return (
        <Modal
            transparent
            visible={modalVisible}
            animationType="slide"
            onRequestClose={() => setModalVisible(false)}
        >
            <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContainer}>
                        <View style={styles.header}>
                            <Text allowFontScaling={false} style={styles.headerText}></Text>
                            <Text allowFontScaling={false} style={styles.headerText}>Change profile picture</Text>
                            <TouchableOpacity onPress={onClose}>
                                <Image source={imageIndex.closeimg}
                                    style={{
                                        height: 24,
                                        width: 24
                                    }}
                                    resizeMode='contain'
                                />
                            </TouchableOpacity>
                        </View>
                        <View style={{
                            flexDirection: "row",
                            alignItems: "center",
                            justifyContent: "space-between",
                            marginHorizontal: 22,
                            marginTop: 40,
                            marginBottom: 40
                        }}>
                            <TouchableOpacity
                                onPress={() => {
                                    setModalVisible(false);
                                    takePhotoFromCamera();
                                }}
                            >
                                <Image source={imageIndex.camera}
                                    style={{
                                        height: 120,
                                        width: 120,
                                        resizeMode: "contain"
                                    }}
                                />

                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={() => {
                                    setModalVisible(false);
                                    pickImageFromGallery();

                                }}

                            >
                                <Image source={imageIndex.gallery} style={{
                                    height: 120,
                                    width: 120,
                                    resizeMode: "contain"
                                }} />
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </TouchableWithoutFeedback>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.6)',
        justifyContent: 'flex-end',
    },
    modalContainer: {
        backgroundColor: Color.graybackGround,
        borderRadius: 16,
        padding: 16,
        maxHeight: Dimensions.get('window').height * 0.7,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 16,
        marginTop: 13
    },
    headerText: {
        fontSize: 18,
        fontWeight: '700',
        color: Color.whiteText,
    },
    closeText: {
        fontSize: 20,
        color: '#aaa',
    },
    handleBar: {
        width: 40,
        height: 4,
        backgroundColor: '#ccc',
        borderRadius: 3,
        marginBottom: 10,
    },
    title: {
        fontSize: 18,
        fontWeight: '800',
        color: 'black',
        marginBottom: 10,
    },
    optionButton: {
        width: '100%',
        paddingVertical: 15,
        borderRadius: 10,
        alignItems: 'center',
    },
    optionText: {
        fontSize: 16,
        color: '#333',
        fontWeight: '500',
    },
    cancelButton: {
        width: '100%',
        backgroundColor: 'black',
        paddingVertical: 15,
        borderRadius: 15,
        alignItems: 'center',
        marginTop: 10,
    },
    cancelText: {
        fontSize: 16,
        color:  Color.whiteText,
        fontWeight: '600',
    },
});

export default ImagePickerModal;
