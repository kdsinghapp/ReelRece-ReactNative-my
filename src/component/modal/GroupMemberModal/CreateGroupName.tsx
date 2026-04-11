import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { Color } from '@theme/color';
import imageIndex from '@assets/imageIndex';
import font from '@theme/font';
import { t } from 'i18next';

const CreateGroupName = ({
  groupName,
  setGroupName,
  onClose,
  onCreate,
  selectedMembers,
  existingGroupNames = [],
  showToast,
  toastMess
}: any) => {
  const isNameExists = existingGroupNames.some(
    (name: string) => name?.toLowerCase() === groupName?.trim()?.toLowerCase()
  );

  const content = (
    <View style={styles.modalContent}> 
      <View style={[styles.inputContainer, isNameExists && { borderColor: Color.red, borderWidth: 1 }]}>
        <TextInput
          value={groupName}
          onChangeText={(text) => {
            setGroupName(text);
          }}
          placeholder={t("home.enterGroupName")}
          placeholderTextColor={Color.placeHolder}
          style={styles.groupInput}
          returnKeyType="done"
          keyboardAppearance="light"
        /> 
        <TouchableOpacity onPress={() => {
          setGroupName('')
        }
        }>
          <Image style={[styles.closeIcon, { tintColor: groupName?.length > 0 ? Color.whiteText : Color.placeHolder }]} source={imageIndex.closeimg} />
        </TouchableOpacity> 
      </View>

      {isNameExists && (
        <Text style={styles.errorText}>Group name already exists</Text>
      )}
      <View style={[styles.bottomButtonContainer, { marginTop: isNameExists ? 10 : 20 }]}>
        <TouchableOpacity style={styles.selectButton} onPress={onClose}>
          <Text style={[styles.buttonTxt, { fontFamily: font.PoppinsMedium }]}>{t("common.cancel")}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          disabled={selectedMembers?.length > 0 && !isNameExists ? false : true}
          style={[styles.cancelButton, {
            backgroundColor: selectedMembers?.length > 0 && !isNameExists ? Color.primary : Color.grey
          }]} onPress={onCreate}>
          <Text style={[styles.buttonTxt, {
            color: selectedMembers?.length > 0 && !isNameExists ? Color.whiteText : Color.lightGrayText
          }]}>{t("common.create")}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    content
  )
};


const styles = StyleSheet.create({

  modalContent: {
    backgroundColor: Color.background,
    height: 160,
    paddingHorizontal: 20,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingBottom: 30,
    bottom: 0,
    position: 'absolute',
  },
  inputContainer: {
    backgroundColor: '#1c1c1e',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 4,
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  groupInput: {
    flex: 1,
    color: Color.whiteText,
    fontSize: 16,
    height: 45,
    width: '90%',
    fontFamily: font.PoppinsRegular
  },
  closeIcon: {
    height: 18,
    width: 18,

    paddingHorizontal: 6,
  },
  bottomButtonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  selectButton: {
    borderColor: Color.placeHolder,
    borderWidth: 1,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    width: "47%",
    height: 48

  },
  cancelButton: {
    backgroundColor: Color.grey,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    width: "47%",
    borderWidth: 1,
    marginLeft: 15,
    height: 48
  },
  buttonTxt: {
    color: Color.whiteText,
    fontFamily: font.PoppinsBold,
    fontSize: 14,
    lineHeight: 18,
    textAlign: 'center',

  },
  toastContainer: {
    bottom: 80,
    width: Dimensions.get('window').width * 1,
    alignSelf: 'center',
  },
  errorText: {
    color: Color.red,
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
    fontFamily: font.PoppinsRegular,
  },
});

export default CreateGroupName;