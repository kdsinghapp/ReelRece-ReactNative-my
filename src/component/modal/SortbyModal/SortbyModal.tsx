import React from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Pressable,
  Image,
  Dimensions,
} from 'react-native';
import imageIndex from '@assets/imageIndex';
import { Color } from '@theme/color';
import font from '@theme/font';
import CustomText from '@components/common/CustomText/CustomText';

const { height } = Dimensions.get('window');

// Custom Genre Button
const GenreButton = React.memo(({ title, isSelected, onPress }: { title: string; isSelected: boolean; onPress: () => void; }) => {
   return (

    <TouchableOpacity
      style={[styles.genreButton]}
      onPress={onPress}
    >


      <CustomText
        size={16}
        color={Color.whiteText}
        style={[styles.genreText,
        {
          color: isSelected ? Color.primary : Color.whiteText,
          fontFamily: isSelected ? font.PoppinsBold : font.PoppinsRegular
        }
        ]}
        font={font.PoppinsRegular}
      >
        {title?.label}
      </CustomText>
      <View style={{
        borderBottomWidth: 1,
        borderColor: Color.whiteText,
        width: 156,
        // marginBottom: 12,
        alignItems: "center",
        justifyContent: "center"
      }} />
    </TouchableOpacity>
  )
}

)



const SortByModal = ({ visible, onClose, Data, selectedSortId, onSelectSort }: { visible: boolean; onClose: () => void; Data: object[]; selectedSortId: string; onSelectSort: (id: string) => void; }) => {

  return (
    <Modal
      animationType="slide"
      transparent
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <TouchableOpacity style={styles.backdrop} onPress={() => { onClose() }} />
        <View style={styles.bottomSheet}>
          <View style={styles.header}>
            <Text style={[styles.title, {
              textAlign: "center"
            }]}></Text>


            <CustomText
              size={16}
              color={Color.whiteText}
              style={[styles.title, {
                textAlign: "center"
              }]}
              font={font.PoppinsBold}
            >
              Sort by
            </CustomText>
            {/* <TouchableOpacity onPress={ ()=> {  onClose()  ;  setSelectedSortId(ItemRe)}}> */}
            <TouchableOpacity onPress={() => { onClose() }}>
              <Image source={imageIndex.closeimg}
                style={{
                  height: 24,
                  width: 24
                }}
                resizeMode='contain'
              />
            </TouchableOpacity>
          </View>

          <FlatList
            data={Data}
            showsVerticalScrollIndicator={false}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={{ marginTop: 30, }}
            renderItem={({ item }) => (
              <GenreButton
                title={item}
                isSelected={selectedSortId === item?.id}

                onPress={() => onSelectSort(item?.id)

                }
              />

            )}
            initialNumToRender={20}
maxToRenderPerBatch={20}
windowSize={7}
removeClippedSubviews

          // ItemSeparatorComponent={() => <View style={styles.separator} />}
          />


        </View>
      </View>
    </Modal>
  );
};

export default React.memo(SortByModal);


const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  backdrop: {
    flex: 1,
  },
  bottomSheet: {
    backgroundColor: Color.modalBg,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 20,
    minHeight: height * 0.7,
    maxHeight: height * 0.7,


  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    marginTop: 5
  },
  title: {
    textAlign: "center"
  },
  closeIcon: {
    color: Color.whiteText,
    fontSize: 20,
  },
  genreButton: {
    alignItems: 'center',
    // paddingVertical: 10,
  },
  genreText: {
    marginVertical: 24,
  },
  separator: {
    height: 1,
    backgroundColor: Color.whiteText,
    // marginVertical: 5,
    width: "20%",
    alignItems: "center",
    justifyContent: "center",

  },
  disabledButton: {
    opacity: 0.3,
  },
  disabledText: {
    color: '#ccc',
  },
  modalBtnContainer: {
    marginLeft: '30%',
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    alignContent: 'space-between',
    marginBottom: 18,

  },
  closeBtnContainer: {
    borderRadius: 10,
    borderWidth: 2,
    borderColor: Color.textGray,
    paddingVertical: 8,
    paddingHorizontal: 30,
  },
  applyBtnContainer: {
    backgroundColor: Color.primary,
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 30,
  },
  btnText: {
    color: Color.lightGrayText,
    fontSize: 14,
    fontFamily: font.PoppinsMedium
  },
  applyBtnText: {
    color: Color.whiteText,
    fontSize: 14,
    fontFamily: font.PoppinsBold
  },
});
