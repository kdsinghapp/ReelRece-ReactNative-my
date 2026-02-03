import {
  Image,

  StyleSheet,
  Text,
  KeyboardAvoidingView,
  TouchableOpacity,
  View,
  Platform,
  ScrollView,
  Dimensions,
  Keyboard,
  TextInput,
  Animated,
  Easing,
  TouchableWithoutFeedback,
  LayoutAnimation,
} from 'react-native';
import React, { useEffect, useState, useRef } from 'react';
import { Color } from '@theme/color';
import { useNavigation, useRoute } from '@react-navigation/native';
import ScreenNameEnum from '@routes/screenName.enum';
import font from '@theme/font';
import Svg, { Defs, RadialGradient, Rect, Stop } from 'react-native-svg';
import LinearGradient from 'react-native-linear-gradient';
import { userFeedback } from '@redux/Api/SettingApi';
import { useSelector } from 'react-redux';
import { RootState } from '@redux/store';
import { SafeAreaView } from 'react-native-safe-area-context';
import imageIndex from '@assets/imageIndex';
import { Button, CustomStatusBar, HeaderCustom, SuccessMessageCustom } from '@components/index';
import { t } from 'i18next';
const FeatureRequest = () => {
  const token = useSelector((state: RootState) => state.auth.token);

  const navigation = useNavigation();
  const route = useRoute()
  const { setFeedBAckSucc } = route?.params || {}

  const textInputRef = useRef<TextInput>(null);
  const scrollViewRef = useRef<ScrollView>(null);

  const [feedBAck, setFeedBAck] = useState(false);
  const [isCheckBox, setIsCheckBox] = useState<boolean>(false);
  const [inputValue, setInputValue] = useState('');
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const [feedBaCkText, setFeedBaCkText] = useState('');
  const [isAnimationSlide, setIsAnimationSlide] = useState(false)
  // Animation values
  const shareTextAnim = useRef(new Animated.Value(-Dimensions.get('window').width)).current;
  // const formAnim = useRef(new Animated.Value(0)).current;
  const feedbackOptionsAnim = useRef(new Animated.Value(0)).current;
  const topSectionAnim = useRef(new Animated.Value(0)).current;
  const formVerticalAnim = useRef(new Animated.Value(Dimensions.get('window').height)).current;
  const formAnim = useRef(new Animated.Value(Dimensions.get('window').width)).current;
  const [showForm, setShowForm] = useState(false); // New state for form animation
  const formSlideAnim = useRef(new Animated.Value(Dimensions.get('window').height)).current;

  const [isSlide, setIsSlide] = useState(true);
  const [firstRight, setFirstRight] = useState(true);
  const [firstRightAni, setFirstRightAni] = useState(false);
  const [hasUserInteracted, setHasUserInteracted] = useState(false);
  const [toestMess, setToestMess] = useState(false);
  const [toestMessColorGreen, setToestMessGreen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  useEffect(() => {
    setFirstRightAni(true)
  }, [])
  useEffect(() => {
    if (firstRight && isAnimationSlide)
      setFirstRight(false)
  })
  useEffect(() => {
    // Initialize animation values on first render
    formSlideAnim.setValue(0); // Start from visible position for first render
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      Animated.timing(topSectionAnim, {
        toValue: 1,
        duration: 900,
        useNativeDriver: true,
      }).start();
    }, 100);

    // Only horizontal animation on first load
    Animated.timing(shareTextAnim, {
      toValue: 0,
      duration: 2300,
      easing: Easing.out(Easing.exp),
      useNativeDriver: true,
    }).start();

    Animated.timing(formAnim, {
      toValue: 0,
      duration: 2500,
      easing: Easing.out(Easing.exp),
      useNativeDriver: true,
    }).start();


    // Reset form position when component mounts
    formVerticalAnim.setValue(0);

    Animated.timing(formAnim, {
      toValue: 0,
      duration: 2500,
      easing: Easing.out(Easing.exp),
      useNativeDriver: true,
    }).start();

    if (feedBAck) {
      Animated.timing(feedbackOptionsAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      feedbackOptionsAnim.setValue(0);
    }


    if (!feedBAck) {
      Animated.timing(formSlideAnim, {
        toValue: 0,
        duration: 500,
        easing: Easing.out(Easing.exp),
        useNativeDriver: true,
      }).start();
      setShowForm(true);
      setIsAnimationSlide(true)
      if (!feedBAck && isSlide) {
        setIsAnimationSlide(true)
      }
    } else {
      formSlideAnim.setValue(Dimensions.get('window').height);
      setShowForm(false);
    }

    const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', () => {
      setIsKeyboardVisible(true);
    });
    const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => {
      setIsKeyboardVisible(false);
    });

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
      clearTimeout(timer);
    };
  }, [feedBAck]);


  const handleFormPress = async () => {


    if (inputValue.trim() === '') {
      setToestMess(true);
      setToestMessGreen(false);
      setToastMessage(t("errorMessage.pleasefeedback"));
    };
    if (feedBaCkText === '') {
      setToestMess(true);
      setToestMessGreen(false);
      setToastMessage(t("errorMessage.feedbacktype"));
      return;
    }
    try {
      const response = await userFeedback(token, feedBaCkText, isCheckBox, inputValue);

      setFeedBAckSucc(true)
      // navigation.navigate(ScreenNameEnum.MainSetting);
      navigation.reset({
        index: 0,
        routes: [
          {
            name: ScreenNameEnum.MainSetting,
            params: { toastTrue: true }, // 👈 param भेज दिया
          },
        ],
      });
    } catch (error) {
    } finally {
      setToestMess(false);
      setToestMessGreen(false);
      setToastMessage('');
    }
  };


  const handleOutsidePress = () => {
    Keyboard.dismiss();
  };

  const handleTextInputFocus = () => {
    setIsKeyboardVisible(true);
    setTimeout(() => {
      scrollViewRef.current?.scrollTo({ y: 200, animated: true });
    }, 100);
  };


  const toggleFeedback = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setFeedBAck(!feedBAck);
    setHasUserInteracted(true)

  };

  const handleFeedbackSelection = (text: string) => {
    setFeedBaCkText(text);
    // Reset vertical position to bottom
    formVerticalAnim.setValue(Dimensions.get('window').height);
    // Animate up
    Animated.timing(formVerticalAnim, {
      toValue: 0,
      duration: 400,
      easing: Easing.out(Easing.exp),
      useNativeDriver: true,
    }).start();
    setFeedBAck(false);
  };

  const slideTextAnimation = () => {
    return (
      <>
        <TouchableWithoutFeedback onPress={() => textInputRef.current?.focus()}>
          <View style={[
            styles.inputContainer,
            inputValue && !isKeyboardVisible && {
              shadowColor: Color.primary,
              shadowOffset: { width: 2, height: 4 },
              shadowOpacity: 0.5,
              shadowRadius: 6,
              elevation: 6,
              borderWidth: 1,
              borderColor: Color.primary
            },
          ]}>
            <TextInput
              ref={textInputRef}
              value={inputValue}
              onChangeText={setInputValue}
              style={styles.inputStyle}
              placeholderTextColor={Color.lightGrayText}
              placeholder={(t("errorMessage.pleasedescribe"))
              }
              multiline={true}
              onFocus={handleTextInputFocus}
              onBlur={() => setIsKeyboardVisible(false)}
              keyboardType="default"
              returnKeyType="done"
            />
          </View>
        </TouchableWithoutFeedback>

        <View style={styles.CheckContainer}>
          <TouchableOpacity
            style={[
              styles.checkBox,
              {
                backgroundColor: isCheckBox ? Color.primary : "transparent",
                borderWidth: isCheckBox ? 0 : 1,
                borderRadius: 4.5
              }
            ]}
            onPress={() => setIsCheckBox(!isCheckBox)}
          >
            {isCheckBox && <Image source={imageIndex.Check} style={styles.checkStyle} />}
          </TouchableOpacity>
          <Text style={styles.checkText}>{(t("home.makethisanonymous"))}</Text>
        </View>

        <View style={{ marginTop: 20 }}>
          <Button
            title=

            {(t("home.save"))}

            textStyle={{
              color: Color.whiteText
            }}
            // onPress={() => navigation.navigate(ScreenNameEnum.MainSetting)}
            onPress={() => handleFormPress()}
          />
        </View>


      </>
    )
  }
  const renderFormContent = () => {
    if (!isAnimationSlide) return null;
    return hasUserInteracted ? (
      <Animated.View
        style={[
          {
            transform: [{ translateY: formSlideAnim }],
            opacity: formSlideAnim.interpolate({
              inputRange: [0, Dimensions.get('window').height],
              outputRange: [1, 0]
            })
          }
        ]}
      >
        {slideTextAnimation()}
      </Animated.View>
    ) : (
      <View>
        {slideTextAnimation()}
      </View>
    );
  };
  const renderFeedbackOptions = () => {
    return (
      <Animated.View
        style={[
          styles.optionsContainer,

          {
            opacity: feedbackOptionsAnim,
            transform: [{
              translateY: feedbackOptionsAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [20, 0]
              })
            }]
          },
          { backgroundColor: 'transparent' }
        ]}
      >
        <TouchableOpacity
          style={styles.optionItem}
          onPress={() => handleFeedbackSelection('Feature Request')}
        >
          <Text style={[styles.optionText, { color: feedBaCkText === "Feature Request" ? Color.primary : Color.whiteText, fontFamily: feedBaCkText === "Feature Request" ? font.PoppinsBold : font.PoppinsMedium }]}>{t("setting.feedback.featureRequest")}</Text>
        </TouchableOpacity>
        <View style={styles.optionItemBorder} />
        <TouchableOpacity
          style={styles.optionItem}
          onPress={() => handleFeedbackSelection('General Feedback')}
        >
          <Text style={[styles.optionText, { color: feedBaCkText === "General Feedback" ? Color.primary : Color.whiteText, fontFamily: feedBaCkText === "General Feedback" ? font.PoppinsBold : font.PoppinsMedium }]}>{t("setting.feedback.generalFeedback")}</Text>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  const renderItem = () => {
    return (
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
      >
        <View style={{ flex: 1 }}>
          {/* (t("errorMessage.pleasedescribe") */}
          <HeaderCustom
            title={(t("home.streamingservices"))}
            backIcon={imageIndex.backArrow}
            rightIcon={false}
            onRightPress={() => navigation.navigate(ScreenNameEnum.MainSetting)}
          />
          <ScrollView
            ref={scrollViewRef}
            contentContainerStyle={{
              paddingHorizontal: 18,
              paddingBottom: 50,
              flexGrow: 1
            }}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <Text style={styles.suggestionsText}>
              {(t("home.havean"))}
            </Text>

            <Animated.Text
              style={[
                styles.shareText,
                {
                  transform: [{ translateX: shareTextAnim }],
                  opacity: shareTextAnim.interpolate({
                    inputRange: [0, Dimensions.get('window').width],
                    outputRange: [1, 0]
                  })
                }
              ]}
            >
              {(t("home.share"))}
            </Animated.Text>

            <Animated.View
              style={[
                {
                  transform: [
                    {
                      translateX: formAnim.interpolate({
                        inputRange: [0, Dimensions.get('window').width],
                        outputRange: [0, Dimensions.get('window').width]
                      })
                    },
                    { translateY: formVerticalAnim }
                  ],
                  opacity: formAnim.interpolate({
                    inputRange: [0, Dimensions.get('window').width],
                    outputRange: [1, 0]
                  })
                }
              ]}
            >
              <TouchableOpacity
                activeOpacity={0.8}
                style={styles.sectionHeader}
                onPress={toggleFeedback}
              >
                <Text style={styles.sectionTitle}>
                  {feedBaCkText ? feedBaCkText : (t("home.typeFeedback"))}
                </Text>
                <Image
                  source={feedBAck ? imageIndex.arrowUp : imageIndex.arrowDown}
                  style={styles.arrowStyle}
                />
              </TouchableOpacity>

              {feedBAck && renderFeedbackOptions()}


              {renderFormContent()}

            </Animated.View>
          </ScrollView>
        </View>
      </KeyboardAvoidingView >
    );
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      {/* <View style={[styles.container, { backgroundColor: Color.background }]}> */}
      <LinearGradient
        colors={[Color.settingFreatureSvgTras, Color.background,]}
        style={styles.container}
      >


        {/* Radial Gradient Background */}

        <Animated.View
          style={[
            styles.topSection,
            {
              opacity: topSectionAnim,
              transform: [{
                translateY: topSectionAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [-20, 0]
                })
              }]
            }
          ]}
        >
          <Svg height="100%" width="100%" style={StyleSheet.absoluteFill}>
            <Defs>
              <RadialGradient
                id="grad"
                cx="50%"
                cy="50%"
                rx="80%"
                ry="80%"
                fx="50%"
                fy="50%"
                gradientUnits="userSpaceOnUse"
              >
                {/* <Stop offset="0" stopColor="#010C12" stopOpacity="1" />
                <Stop offset="1" stopColor="#000305" stopOpacity="1" /> */}

                <Stop offset="0" stopColor="#4EC8FF" stopOpacity="0.3" />
                <Stop offset="1" stopColor="#000000" stopOpacity="0.5" />

              </RadialGradient>
            </Defs>
            <Rect
              x="0"
              y="0"
              width="100%"
              height="100%"
              fill="url(#grad)"
            />
          </Svg>

        </Animated.View>

        <CustomStatusBar />

        {renderItem()}
        {/* </View> */}



        {toestMess && (
          <SuccessMessageCustom
            textColor={Color.whiteText}
            color={toestMessColorGreen ? Color.green : Color.red}
            message={toastMessage}
          />
        )}


      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topSection: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '50%',
    width: '100%',
    zIndex: 0,
  },
  suggestionsText: {
    marginTop: 50,
    fontSize: 14,
    fontFamily: font.PoppinsRegular,
    textAlign: 'center',
    color: Color.primary600,
    zIndex: 2
  },
  shareText: {
    marginTop: 6,
    fontSize: 26,
    fontFamily: font.PoppinsBold,
    textAlign: 'center',
    color: Color.whiteText,
    marginBottom: 30,
    zIndex: 2
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingVertical: 14,
    paddingHorizontal: 20,
    marginVertical: 10,
    backgroundColor: Color.darkGrey,
    borderRadius: 10,
    zIndex: 2
  },
  sectionTitle: {
    textAlign: 'center',
    flex: 1,
    fontSize: 14,
    color: Color.whiteText,
    fontFamily: font.PoppinsBold,
  },
  arrowStyle: {
    height: 22,
    width: 22,
    resizeMode: "contain",
    tintColor: Color.primary
  },
  inputContainer: {
    width: '100%',
    backgroundColor: Color.darkGrey,
    minHeight: Dimensions.get('window').height * 0.36,
    maxHeight: Dimensions.get('window').height * 0.5,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 14,
    zIndex: 2
  },
  inputStyle: {
    width: "100%",
    flex: 1,
    padding: 10,
    color: Color.whiteText,
    fontSize: 14,
    fontFamily: font.PoppinsRegular,
    textAlignVertical: 'top',
  },
  CheckContainer: {
    flexDirection: 'row',
    marginTop: 14,
    alignItems: 'center',
    zIndex: 2
  },
  checkBox: {
    height: 18,
    width: 18,
    marginRight: 14,
    borderColor: Color.whiteText,
    borderWidth: 0.6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkStyle: {
    height: 15,
    width: 15,
    tintColor: Color.whiteText,

  },
  checkText: {
    color: Color.whiteText,
    fontSize: 12,
    fontFamily: font.PoppinsMedium,
  },
  optionsContainer: {
    borderRadius: 10,
    marginTop: 4,
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: Color.darkGrey,
    zIndex: 2
  },
  optionItemBorder: {
    borderBottomColor: Color.whiteText,
    borderBottomWidth: 0.5,
    width: '50%',
    alignSelf: 'center'
  },
  optionItem: {
    paddingVertical: 10,
    flex: 1,

    // width:'50%'
  },
  optionText: {
    color: Color.whiteText,
    fontSize: 14,
    fontFamily: font.PoppinsRegular,
    textAlign: 'center',
  },
});

export default React.memo(FeatureRequest);