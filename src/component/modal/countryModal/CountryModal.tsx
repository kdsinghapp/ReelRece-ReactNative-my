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
import { useSafeAreaInsets, SafeAreaView } from 'react-native-safe-area-context';

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
      transparent={false}
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.container}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={{ flex: 1 }}
        >
          <View style={styles.header}>
            <TouchableOpacity onPress={onClose} style={styles.backButton}>
              <Image source={imageIndex.backArrow} style={styles.backIcon} resizeMode="contain" />
            </TouchableOpacity>
            <Text style={styles.title}>Select Country</Text>
            <View style={{ width: 40 }} />
          </View>

          <View style={styles.searchContainer}>
            <Image source={imageIndex.search} style={styles.searchImg} resizeMode="contain" />
            <TextInput
              placeholder="Search country..."
              placeholderTextColor="#888"
              value={searchQuery}
              onChangeText={setSearchQuery}
              style={styles.searchInput}
              returnKeyType="search"
              autoCorrect={false}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Image source={imageIndex.closeWhite} style={styles.clearIcon} resizeMode="contain" />
              </TouchableOpacity>
            )}
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
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Color.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  backIcon: {
    width: 20,
    height: 20,
  },
  title: {
    fontSize: 18,
    fontFamily: font.PoppinsBold,
    color: Color.whiteText,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    marginHorizontal: 16,
    paddingHorizontal: 12,
    marginBottom: 16,
    height: 48,
    borderWidth: 1,
    borderColor: '#333',
  },
  searchImg: {
    width: 18,
    height: 18,
    marginRight: 10,
    tintColor: '#888',
  },
  searchInput: {
    flex: 1,
    height: 48,
    color: Color.whiteText,
    fontFamily: font.PoppinsMedium,
    fontSize: 14,
  },
  clearIcon: {
    width: 16,
    height: 16,
    tintColor: '#888',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  countryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: '#222',
  },
  selectedCountryItem: {
    // Optional highlight
  },
  countryName: {
    fontSize: 15,
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
