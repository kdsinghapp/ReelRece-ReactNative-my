import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  StyleSheet,
  Dimensions,
  Image,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Keyboard
} from 'react-native';
import imageIndex from '@assets/imageIndex';
import { Color } from '@theme/color';
import { checkUsernameAvailability } from '@redux/Api/authService';
import { renameGroup } from '@redux/Api/GroupApi';
import { G } from 'react-native-svg';
import font from '@theme/font';
import ButtonCustom from '@components/common/button/ButtonCustom';

interface EditNameModalProps {
  modalVisible: boolean;
  setModalVisible: (visible: boolean) => void;
  onClose: () => void;
  onSave: (key: string, newValue: string) => void;
  fieldLabel?: string;
  fieldKey?: string;
  initialValue?: string;
  type?: string;
  group_name?: string,
  groupId?: string;
  token: string;
  setGroup_name?: (name: string) => void;
}

const EditNameModal: React.FC<EditNameModalProps> = ({
  modalVisible,
  setModalVisible,
  onClose,
  onSave,
  fieldLabel = 'Edit Field',
  fieldKey = '',
  initialValue = '',
  type,
  groupId,
  group_name,
  token,
  setGroup_name,
}) => {
  const [value, setValue] = useState(initialValue);

  React.useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);


  const handleSave = async () => {
    const trimmedValue = value.trim();
    const trimmedInitial = (initialValue ?? '').trim();

    if (trimmedValue === '') return;

    if (trimmedValue === trimmedInitial) {
      onClose();
      return;
    }

    if (fieldKey === 'username') {
      try {
        const result = await checkUsernameAvailability(trimmedValue);
        if (!result.success) {
          return;
        }

        if (!result.available) {
          return;
        }
      } catch (error) {
        return;
      }
    }

    // ✅ group_name API call
    if (fieldKey === 'group_name' && groupId && group_name && trimmedValue !== group_name) {
      try {

        const response = await renameGroup(token, groupId, trimmedValue);
        Alert.alert(response.status_code)
        if (response) {
          setGroup_name(trimmedValue)
        }
      } catch (error) {
      }
    }

    onSave(fieldKey, trimmedValue)
    onClose();
  };
  return (
    <Modal
      transparent
      visible={modalVisible}
      animationType="slide"
      onRequestClose={() => setModalVisible(false)}
    >
      <TouchableWithoutFeedback onPress={() => { Keyboard.dismiss(); onClose(); }}>
        <View style={styles.modalOverlay}>
          <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
            <KeyboardAvoidingView
              behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
              style={styles.keyboardAvoid}
              keyboardVerticalOffset={Platform.OS === 'ios' ? 10 : 0}
            >
              <View style={styles.modalContainer}>
                <View style={styles.header}>
                  <Text style={styles.headerText}>{fieldLabel}</Text>
                  <TouchableOpacity onPress={onClose}>
                    <Image
                      source={imageIndex.closeimg}
                      style={{ height: 24, width: 24, resizeMode: 'contain' }}
                    />
                  </TouchableOpacity>
                </View>

                <ScrollView
                  keyboardShouldPersistTaps="handled"
                  showsVerticalScrollIndicator={false}
                  contentContainerStyle={styles.scrollContent}
                >
                  <TextInput
                    style={[
                      styles.input,
                      fieldKey === 'bio' && {
                        height: 170,
                        textAlignVertical: 'top',
                      }
                    ]}
                    multiline={fieldKey === 'bio'}
                    numberOfLines={fieldKey === 'bio' ? 6 : 1}
                    placeholder={initialValue}
                    placeholderTextColor='rgba(255, 255, 255, 0.7)'
                    value={value}
                    onChangeText={setValue}
                    autoFocus={true}
                    keyboardAppearance="light"
                  />

                  <ButtonCustom
                    title="Save"
                    onPress={handleSave}
                    buttonStyle={styles.saveButton}
                    textStyle={{
                      color: Color.whiteText
                    }}
                  />
                </ScrollView>
              </View>
            </KeyboardAvoidingView>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.0)',
    justifyContent: 'flex-end',
  },
  keyboardAvoid: {
    width: '100%',
  },
  modalContainer: {
    backgroundColor: Color.graybackGround,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 20,
    maxHeight: Dimensions.get('window').height * 0.7,
  },
  scrollContent: {
    paddingBottom: 24,
  },
  header: {
    flexDirection: 'row',
    // justifyContent: 'space-between',
    marginBottom: 20,
    //  alignSelf:'center',
    // flex:1,
  },
  headerText: {
    fontSize: 18,
    fontFamily: font.PoppinsBold,
    lineHeight: 20,
    // fontWeight: '700',
    color: Color.whiteText,
    textAlign: 'center',
    alignSelf: 'center',
    flex: 1,

  },
  input: {
    height: 45,
    borderWidth: 1,
    borderColor: Color.primary,
    borderRadius: 8,
    paddingHorizontal: 15,
    // flex:1,
    color: Color.whiteText,
    marginBottom: 24,
    fontFamily: font.PoppinsRegular
  },
  saveButton: {
    // marginHorizontal: 120,
  },
});

export default EditNameModal;
