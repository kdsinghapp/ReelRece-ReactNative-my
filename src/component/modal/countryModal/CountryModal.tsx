import React, { useState } from 'react';
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
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Color } from '@theme/color';
import font from '@theme/font';
import imageIndex from '@assets/imageIndex';
import { COUNTRY_CODES } from '@utils/countryCodes';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { height } = Dimensions.get('window');

interface CountryModalProps {
  isVisible: boolean;
  onClose: () => void;
  onSelect: (code: string) => void;
  selectedCountry: string;
}

const CountryModal: React.FC<CountryModalProps> = ({ isVisible, onClose, onSelect, selectedCountry }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const insets = useSafeAreaInsets();

  const countries = Object.entries(COUNTRY_CODES).map(([code, name]) => ({
    code,
    name,
  })).sort((a, b) => a.name.localeCompare(b.name));

  const filteredCountries = countries.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderItem = ({ item }: { item: { code: string; name: string } }) => {
    const isSelected = item.code === selectedCountry;
    return (
      <TouchableOpacity
        style={[styles.countryItem, isSelected && styles.selectedCountryItem]}
        onPress={() => {
          onSelect(item.code);
          onClose();
        }}
      >
        <Text style={[styles.countryName, isSelected && styles.selectedCountryName]}>
          {item.name}
        </Text>
        {isSelected && (
          <Image source={imageIndex.Check} style={styles.checkIcon} resizeMode="contain" />
        )}
      </TouchableOpacity>
    );
  };

  return (
    <Modal
      visible={isVisible}
      animationType="slide"
      transparent
      statusBarTranslucent
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <TouchableOpacity
          style={styles.overlay}
          activeOpacity={1}
          onPress={onClose}
        >
          <TouchableWithoutFeedback>
            <View style={[
              styles.bottomSheet,
              {
                paddingBottom: Platform.OS === 'ios' ? insets.bottom + 10 : insets.bottom + 20,
                maxHeight: Platform.OS === 'ios' ? height * 0.8 : height * 0.8
              }
            ]}>
              <View style={styles.header}>
                <Text style={styles.title}>Select Country</Text>
                <TouchableOpacity onPress={onClose}>
                  <Image source={imageIndex.closeWhite} style={styles.closeIcon} resizeMode="contain" />
                </TouchableOpacity>
              </View>

              <View style={styles.searchContainer}>
                <Image source={imageIndex.search} style={styles.searchImg} resizeMode="contain" />
                <TextInput
                  placeholder="Search country..."
                  placeholderTextColor={Color.whiteText}
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  style={styles.searchInput}
                  returnKeyType="search"
                  autoCorrect={false}
                />
              </View>

              <FlatList
                data={filteredCountries}
                keyExtractor={(item) => item.code}
                renderItem={renderItem}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.listContent}
                keyboardShouldPersistTaps="handled"
                keyboardDismissMode="on-drag"
              />
            </View>
          </TouchableWithoutFeedback>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  bottomSheet: {
    backgroundColor: Color.grey,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 20,
    maxHeight: height * 0.8,
    minHeight: height * 0.5,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontFamily: font.PoppinsBold,
    color: Color.whiteText,
  },
  closeIcon: {
    width: 20,
    height: 20,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2A2A2A',
    borderRadius: 25,
    paddingHorizontal: 15,
    marginBottom: 15,
  },
  searchImg: {
    width: 18,
    height: 18,
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    height: 45,
    color: Color.whiteText,
    fontFamily: font.PoppinsMedium,
  },
  listContent: {
    paddingBottom: 20,
  },
  countryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 0.5,
    borderBottomColor: '#333',
  },
  selectedCountryItem: {
    // backgroundColor: '#333',
  },
  countryName: {
    fontSize: 16,
    fontFamily: font.PoppinsMedium,
    color: Color.whiteText,
  },
  selectedCountryName: {
    color: Color.primary,
    fontFamily: font.PoppinsBold,
  },
  checkIcon: {
    width: 20,
    height: 20,
    tintColor: Color.primary,
  },
});

export default CountryModal;
