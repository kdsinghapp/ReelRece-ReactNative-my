import React, { useMemo, useState } from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import { CustomStatusBar, HeaderCustom, SearchBarCustom } from "@components/index";
import { Color } from "@theme/color";
import font from "@theme/font";
import imageIndex from "@assets/imageIndex";
import { t } from "i18next";

const HelpSetting = () => {
  const navigation = useNavigation();

  const [search, setSearch] = useState("");

  // ✅ Steps data (i18n)
  const troubleshootingSteps = useMemo(
    () => [
      {
        id: 1,
        title: t("helpsetting.title"),
        description: t("helpsetting.description"),
      },
      {
        id: 2,
        title: t("helpsetting.titleone"),
        description: t("helpsetting.descriptionone"),
      },
      {
        id: 3,
        title: t("helpsetting.titletwo"),
        description: t("helpsetting.descriptiontwo"),
      },
      {
        id: 4,
        title: t("helpsetting.titlethree"),
        description: t("helpsetting.descriptionthree"),
      },
      {
        id: 5,
        title: t("helpsetting.titlefour"),
        description: t("helpsetting.descriptionfour"),
      },
      {
        id: 6,
        title: t("helpsetting.titlefive"),
        description: t("helpsetting.descriptionfive"),
      },
      {
        id: 7,
        title: t("helpsetting.titlesix"),
        description: t("helpsetting.descriptionsix"),
      },
      {
        id: 8,
        title: t("helpsetting.titleseven"),
        description: t("helpsetting.descriptionseven"),
      },
    ],
    []
  );

  // ✅ Sections + questions (i18n)
  const sections = useMemo(
    () => [
      {
        id: "account",
        title: t("helpsetting.section.account"),
        items: [
          t("helpsetting.account.q1"),
          t("helpsetting.account.q2"),
          t("helpsetting.account.q3"),
          t("helpsetting.account.q4"),
        ],
      },
      {
        id: "watching",
        title: t("helpsetting.section.watching"),
        items: [
          t("helpsetting.watching.q1"),
          t("helpsetting.watching.q2"),
          t("helpsetting.watching.q3"),
          t("helpsetting.watching.q4"),
        ],
      },
      {
        id: "subscription",
        title: t("helpsetting.section.subscription"),
        items: [
          t("helpsetting.subscription.q1"),
          t("helpsetting.subscription.q2"),
          t("helpsetting.subscription.q3"),
          t("helpsetting.subscription.q4"),
        ],
      },
    ],
    []
  );

  const openHelpMessage = () => {
    navigation.navigate("HelpMessage", { data: troubleshootingSteps });
  };

  const filteredSections = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return sections;

    return sections
      .map((s) => ({
        ...s,
        items: s.items.filter((it) => it.toLowerCase().includes(q)),
      }))
      .filter((s) => s.items.length > 0);
  }, [sections, search]);

  return (
    <SafeAreaView style={styles.container}>
      <CustomStatusBar />

      <HeaderCustom
        title={t("helpsetting.header")}
        backIcon={imageIndex.backArrow}
        onRightPress={() => navigation.goBack()}
      />

      <View style={styles.searchWrap}>
        <SearchBarCustom
          value={search}
          onChangeText={setSearch}
          placeholder={t("helpsetting.searchPlaceholder")}
        />
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {filteredSections.map((section) => (
          <TouchableOpacity
            key={section.id}
            style={styles.sectionCard}
            activeOpacity={0.8}
            onPress={openHelpMessage}
          >
            <View style={styles.detailContainer}>
              <Text style={styles.headingText}>{section.title}</Text>
              <Image source={imageIndex.rightArrow} style={styles.icon} />
            </View>

            {section.items.map((item, index) => (
              <Text key={`${section.id}-${index}`} style={styles.detailText}>
                {item}
              </Text>
            ))}
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

export default React.memo(HelpSetting);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Color.background,
    paddingTop: 12,
  },
  searchWrap: {
    marginBottom: 12,
    paddingHorizontal: 16,
  },
  scroll: {
    paddingHorizontal: 18,
  },
  sectionCard: {
    paddingBottom: 10,
  },
  detailContainer: {
    marginTop: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  icon: {
    width: 18,
    height: 16,
    resizeMode: "contain",
    tintColor: Color.lightGrayText,
  },
  headingText: {
    fontSize: 16,
    fontFamily: font.PoppinsBold,
    color: Color.whiteText,
    marginBottom: 8,
    lineHeight: 20,
  },
  detailText: {
    marginVertical: 3,
    fontSize: 14,
    lineHeight: 18,
    fontFamily: font.PoppinsRegular,
    color: Color.whiteText,
    marginBottom: 6,
    maxWidth: "90%",
  },
});
