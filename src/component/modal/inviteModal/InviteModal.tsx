import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    FlatList,
    Image,
    TouchableOpacity,
    StyleSheet,
    Modal,
    KeyboardAvoidingView,
    Platform,
    SafeAreaView
} from 'react-native';
import imageIndex from '@assets/imageIndex';
import SearchBarCustom from '@components/common/searchBar/SearchBarCustom';
import { t } from 'i18next';
const friendsData = [
    { id: '1', name: 'Jordan Sanzo', avatar: 'https://i.pravatar.cc/150?img=1' },
    { id: '2', name: 'Anika Kenter', avatar: 'https://i.pravatar.cc/150?img=2' },
    { id: '3', name: 'Anna Watson', avatar: 'https://i.pravatar.cc/150?img=3' },
    { id: '4', name: 'Terry Workman', avatar: 'https://i.pravatar.cc/150?img=4' },
    { id: '5', name: 'Kaiya Rosser', avatar: 'https://i.pravatar.cc/150?img=5' },
];

interface Props {
    visible: boolean;
    onClose: () => void;
}

const InviteModal: React.FC<Props> = ({ visible, onClose }) => {
    const [search, setSearch] = useState('');
    const [selected, setSelected] = useState<string[]>([]);

    const toggleSelect = (id: string) => {
        setSelected((prev) =>
            prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
        );
    };

    const filtered = friendsData.filter((friend) =>
        friend.name.toLowerCase().includes(search.toLowerCase())
    );

    return (

        <Modal
            animationType="slide"
            transparent
            visible={visible}
            onRequestClose={onClose}
            style={{ flex: 1 }}
        >

            <View style={styles.overlay}>
                <TouchableOpacity style={styles.backdrop} onPress={onClose} />

                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={{
                        flex: 1,
                        justifyContent: 'flex-end',
                    }}
                    keyboardVerticalOffset={Platform.OS === 'ios' ? 30 : 0}

                >
                    <SafeAreaView style={styles.modalContent}>
                        <View style={styles.header}>
                            <Text style={styles.title}></Text>
                            <Text style={styles.title}>      
                                                           {t("home.invite")}
                                                           
                            </Text>
                            <TouchableOpacity onPress={onClose}>
                                <Image
                                    source={imageIndex.closeimg}
                                    style={{ height: 30, width: 24 }}
                                    resizeMode="contain"
                                />
                            </TouchableOpacity>
                        </View>

                        <SearchBarCustom invide={true} />

                        <FlatList
                            data={filtered}
                            showsVerticalScrollIndicator={false}
                            keyExtractor={(item) => item.id}
                            style={{ marginTop: 2 }}
                            keyboardShouldPersistTaps="handled"
                            renderItem={({ item }) => (
                                <View style={styles.friendRow}>
                                    <Image
                                        source={imageIndex.onlineUser}
                                        resizeMode="cover"
                                        style={styles.avatar}
                                    />
                                    <Text style={styles.name}>{item.name}</Text>
                                    <TouchableOpacity onPress={() => toggleSelect(item.id)}>
                                        <Image
                                            source={
                                                selected.includes(item.id)
                                                    ? imageIndex.checKBoxActive
                                                    : imageIndex.checkBox
                                            }
                                            style={{
                                                height: 20,
                                                width: 20,
                                                resizeMode: 'contain',
                                            }}
                                        />
                                    </TouchableOpacity>
                                </View>
                            )}
                            initialNumToRender={10}
                            maxToRenderPerBatch={10}
                            windowSize={7}
                            removeClippedSubviews

                        />

                        <View style={styles.buttonRow}>
                            <TouchableOpacity style={styles.inviteprimary}>
                                <Text style={styles.primaryText}>Invite</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.cancelprimary} onPress={onClose}>
                                <Text style={[styles.primaryText, {
                                    color: "rgba(205, 205, 205, 1)",
                                    fontWeight: "500",
                                    fontSize: 14
                                }]}>Cancel</Text>
                            </TouchableOpacity>
                        </View>
                    </SafeAreaView>
                </KeyboardAvoidingView>
            </View>

        </Modal>
    );
};

const styles = StyleSheet.create({
    title: {
        fontSize: 18,
        color: '#fff',
        fontWeight: 'bold',
        marginBottom: 12,
    },

    overlay: {
        flex: 1,
        justifyContent: 'flex-end',
        backgroundColor: 'rgba(0,0,0,0.5)',

    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 10,
    },
    backdrop: {
        flex: 1,
    },
    modalContent: {
        backgroundColor: 'rgba(45, 45, 46, 1)',
        padding: 20,
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        marginTop: 20,
    },
    searchInput: {
        backgroundColor: '#2b2b2b',
        color: '#fff',
        padding: 10,
        borderRadius: 8,
        marginBottom: 10,
    },
    friendRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
        marginVertical: 5,
        marginTop: 5
    },
    avatar: {
        width: 50,
        height: 50,
        marginRight: 10,
    },
    name: {
        flex: 1,
        color: '#fff',
        fontSize: 16,
    },
    checkbox: {
        width: 24,
        height: 24,
        borderRadius: 6,
        borderWidth: 2,
        borderColor: '#007bff',
        alignItems: 'center',
        justifyContent: 'center',
    },
    checked: {
        width: 14,
        height: 14,
        backgroundColor: '#007bff',
        borderRadius: 4,
    },
    buttonRow: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        marginTop: 12,
        marginBottom: 10,
    },
    inviteprimary: {
        backgroundColor: 'rgba(0, 138, 201, 1)',
        borderRadius: 8,
        marginRight: 8,
        width: 89,
        height: 41,
        alignItems: "center",
        justifyContent: "center"
    },
    cancelprimary: {
        borderRadius: 8,
        width: 89,
        height: 41,
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 1,
        borderColor: "rgba(205, 205, 205, 1)"
    },
    primaryText: {
        color: '#fff',
        textAlign: 'center',
        fontWeight: '700',
        fontSize: 14
    },
});

export default InviteModal;
