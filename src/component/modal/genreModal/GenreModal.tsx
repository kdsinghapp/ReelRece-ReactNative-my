import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  FlatList,
  TouchableWithoutFeedback,
  Dimensions,
  StyleSheet,
  Image,
} from 'react-native';

import { Color } from '@theme/color';
import font from '@theme/font';
import imageIndex from '@assets/imageIndex';
import CustomText from '@components/common/CustomText/CustomText';
 

const { height } = Dimensions.get('window');

const GenreModal = ({
  isVisible,
  reset,
  onClose,
  genres,
  selectedGenres,
  setSelectedGenres,
  onApply,
}) => {
  const toggleGenre = (genre) => {
    if (selectedGenres.includes(genre)) {
      setSelectedGenres(selectedGenres.filter((g) => g !== genre));
    } else {
      setSelectedGenres([...selectedGenres, genre]);
    }
  };;

  const renderItem = ({ item }) => {
    const isSelected = selectedGenres.includes(item);
    return (
      <TouchableOpacity
        style={[
          styles.genreButton,
          isSelected && styles.selectedGenreButton,
        ]}
        onPress={() => toggleGenre(item)}
      >


        <CustomText
          size={14}
          color={Color.whiteText}
          style={[
            styles.genreText,
            isSelected && styles.selectedGenreText,
          ]}
          font={font.PoppinsRegular}
        >
          {item}
        </CustomText>


      </TouchableOpacity>
    );
  };

  return (
    <Modal visible={isVisible} animationType="slide" transparent>
      <TouchableOpacity style={styles.overlay} onPress={onClose}>
        <TouchableWithoutFeedback>
          <View style={styles.bottomSheet}>
            <View style={styles.header}>


              <CustomText
                size={16}
                color={Color.whiteText}
                style={styles.title}
                font={font.PoppinsBold}
              >
                Genres
              </CustomText>
              <TouchableOpacity onPress={onClose} >
                <Image source={imageIndex.closeimg} resizeMode='contain' style={styles.closeImg} />

              </TouchableOpacity>
            </View>

            <FlatList
              data={genres}
              keyExtractor={(item) => item} // Use the string itself as key
              numColumns={2}
              columnWrapperStyle={{ justifyContent: 'flex-start' }}
              renderItem={renderItem}
              initialNumToRender={10}
              maxToRenderPerBatch={10}
              windowSize={7}
              removeClippedSubviews

            />

            <View style={styles.bottomButtonContainer}>
              <TouchableOpacity
                onPress={reset}
                style={styles.selectButton}
              >

                <CustomText
                  size={14}
                  color={Color.lightGrayText}
                  style={styles.buttonTxt}
                  font={font.PoppinsMedium}
                >
                  Reset
                </CustomText>
              </TouchableOpacity>


              <TouchableOpacity
                onPress={onApply}
                style={styles.cancelButton}
              >

                <CustomText
                  size={14}
                  color={Color.whiteText}
                  style={styles.buttonTxt}
                  font={font.PoppinsBold}
                >
                  Apply
                </CustomText>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </TouchableOpacity>
    </Modal>
  );
};

export default GenreModal;

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
    padding: 14,
    minHeight: height * 0.4,
    maxHeight: height * 0.6,
    // borderRightColor:"red",

  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    marginTop: 5,
    paddingHorizontal: 20,
  },
  title: {
    flex: 1,
    textAlign: "center"
  },
  closeImg: {
    height: 22,
    width: 22,
  },
  closeIcon: {
    color: Color.whiteText,
    fontSize: 20,
  },
  genreButton: {
    flex: 1,
    width: '48%',
    marginHorizontal: 8,
    backgroundColor: Color.grey,
    alignItems: 'center',
    paddingVertical: 10,
    justifyContent: 'center',
    marginVertical: 6,
    borderRadius: 10,
  },
  genreText: {
    alignSelf: 'center',
    textAlign: 'center',
  },
  separator: {
    height: 1,
    backgroundColor: Color.whiteText,
    marginVertical: 5,
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

  selectedGenreButton: {
    backgroundColor: Color.primary, // या जो भी highlight color हो
  },
  selectedGenreText: {
    color: '#fff',
    fontWeight: 'bold',
  },


  bottomButtonContainer: {
    backgroundColor: Color.modalBg,
    flexDirection: 'row',
    marginBottom: 14,
    marginTop: 24,
    width: '100%',
    // alignSelf: 'flex-end',
    justifyContent: 'space-between',
  },
  selectButton: {
    width: '47%',
    backgroundColor: Color.modalBg,
    borderWidth: 0.5,
    borderRadius: 8,
    borderColor: Color.textGray,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 10,
  },
  cancelButton: {
    // borderColor:Color.whiteText,
    backgroundColor: Color.primary,
    width: '47%',
    height: 50,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 6,
    borderWidth: 1,
    marginLeft: 15
  },
  buttonTxt: {
    // marginVertical:20,
  }
});
