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
  Alert
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
  type?:string;
group_name?:string,
groupId?:string;
token:string;
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


  // const handleSave = () => {
  //   onSave(fieldKey, value);
  //   setModalVisible(false);
  // };


const handleSave = async () => {
  const trimmedValue = value.trim(); 

  if (trimmedValue === '') return;

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
     
    const response =   await renameGroup(token, groupId, trimmedValue);
       // Alert.alert(response.status_code)
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
      <TouchableWithoutFeedback onPress={() => onClose()}>
        <View style={styles.modalOverlay}>
          <TouchableWithoutFeedback>


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

              <TextInput
                style={[
                  styles.input,
                  fieldKey === 'bio' && {
                    height: 170,
                    textAlignVertical: 'top', // Makes multiline text start at the top
                  }
                ]}
                multiline={fieldKey === 'bio'}
                numberOfLines={fieldKey === 'bio' ? 6 : 1}
                placeholder={initialValue}
                placeholderTextColor='rgba(255, 255, 255, 0.7)'
                value={value}
                onChangeText={setValue}
                autoFocus={true}
              />

              <ButtonCustom
                title="Save"
                onPress={handleSave}
                buttonStyle={styles.saveButton}
                textStyle={{
                  color:Color.whiteText
                }}
              />
            </View>


          </TouchableWithoutFeedback>
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
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 20,
    maxHeight: Dimensions.get('window').height * 0.7,
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
    fontFamily:font.PoppinsBold,
    lineHeight:20,
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
     fontFamily:font.PoppinsRegular
  },
  saveButton: {
    // marginHorizontal: 120,
  },
});

export default EditNameModal;
