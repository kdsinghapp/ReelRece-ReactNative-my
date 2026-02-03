import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import React from 'react';
import { useNavigation, useRoute } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import imageIndex from '@assets/imageIndex';
import { Color } from '@theme/color';
import font from '@theme/font';
import SearchBarCustom from '@components/common/searchBar/SearchBarCustom';
import HeaderCustom from '@components/common/header/HeaderCustom';
import { CustomStatusBar } from '..';
import { t } from 'i18next';
const helpMessage = () => {
  const route = useRoute();
  const { data } = route?.params;
  const navigation = useNavigation();
  // const renderItem = () => {
  //     return (
  //          <View>
  //             <Text style={styles.pointText} >1. Check Your Internet Connection:</Text>
  //             <Text  style={styles.detailText} >Ensure you have a stable internet connection. Try loading a webpage or another app to verify connectivity.</Text>
  //             </View>
  //     )
  // }
  return (
    <SafeAreaView style={styles.container}>
      <CustomStatusBar />
      <HeaderCustom
        title="Help"
        backIcon={imageIndex.backArrow}
        // rightIcon={imageIndex.menu}
        onRightPress={() => navigation.goBack()}
      />
      <View style={{ marginBottom: 12, paddingHorizontal: 16 }} >
        <SearchBarCustom />

      </View>

      <ScrollView style={{ paddingHorizontal: 16, paddingBottom: 20, flex: 1, }} >

        <View>
          <Text style={[styles.headingText, { fontSize: 16, marginLeft: 0 }]}>
            {t("discover.whatdo")}

          </Text>
          <Text style={styles.detailText} >
            {t("discover.ifyou")}
          </Text>

        </View>

        {data?.map((item) => (
          <View key={item.id} style={{ paddingBottom: 0 }}>
            <Text style={styles.headingText}>{`${item?.id}. ${item?.title}`}</Text>

            <Text style={styles.detailText}>{item?.description}</Text>
          </View>
        ))}

      </ScrollView>
    </SafeAreaView>
  )
}

export default helpMessage

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Color.background,
    paddingTop: 12,
  },
  detailContainer: {
    marginTop: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',

    alignItems: 'center',


  },
  icon: {
    width: 25,
    height: 25,


    // backgroundColor:'pink',

  },
  headingText: {
    fontSize: 14,
    fontFamily: font.PoppinsBold,
    lineHeight: 20,
    color: Color.whiteText,
    // marginBottom: 6,
    marginTop: 10,
    marginLeft: 10,

  },
  pointText: {
    fontSize: 14,
    fontFamily: font.PoppinsRegular,
    color: Color.whiteText,
    // marginBottom: 6,
    marginTop: 10,
  },
  detailText: {
    fontSize: 14,
    lineHeight: 18,
    color: Color.lightGrayText,
    fontFamily: font.PoppinsRegular,

    marginTop: 10,


  },
})