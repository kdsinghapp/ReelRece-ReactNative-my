import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
 import FastImage from 'react-native-fast-image';
import ShimmerPlaceholder from 'react-native-shimmer-placeholder';
import LinearGradient from 'react-native-linear-gradient';
import ButtonCustom from '@components/common/button/ButtonCustom';
import ScreenNameEnum from '@routes/screenName.enum';
import { Color } from '@theme/color';
import font from '@theme/font';
import { t } from 'i18next';


const ProfileCard = ({
    imageUri,
    name,
    rank,
    followers,
    following,
    bio,
    onFollowPress,
    isFollowing,
    butt = true,
    onFollowing,
    onFollow,
    rankscreenData,
    imageLoading,
    setImageLoading,
    loaderFollow,
    // onSuggested
}) => {
    const navigation = useNavigation();
 
    return (
        <View style={styles.profileContainer}>
            {/* <Image source={{ uri: imageUri }} style={styles.profileImage} resizeMode='contain' /> */}

            <ShimmerPlaceholder
                visible={!imageLoading}
                isInteraction={false}
                LinearGradient={LinearGradient}
                style={styles.profileImage}
                shimmerColors={['#181818ff', '#464545ff', '#181717ff']}

            >
                <FastImage
                    source={{
                        uri: imageUri,
                        priority: FastImage.priority.low,
                        cache: FastImage.cacheControl.web
                    }}
                    style={styles.profileImage}
                    resizeMode={FastImage.resizeMode.stretch}
                    onLoadStart={() => setImageLoading(true)}
                    onLoadEnd={() => setImageLoading(false)}
                    onError={() => setImageLoading(false)}
                />
            </ShimmerPlaceholder>


            {/* <FastImage
  source={{
    uri: imageUri,
    priority: FastImage.priority.high,
    cache: FastImage.cacheControl.web,
  }}
  style={styles.profileImage}
  resizeMode={FastImage.resizeMode.cover}
  onLoadStart={() => setImageLoading(true)}
  onLoadEnd={() => setImageLoading(false)}
  onError={() => {
    setImageLoading(false); 
  }}
/> */}

            <View style={styles.statsContainer}>
                <TouchableOpacity style={styles.statBox}
                    onPress={() => {
                        navigation.navigate(ScreenNameEnum.OtherTaingPrfofile,
                            {
                                datamovie: rankscreenData,
                                username: name,
                                imageUri: imageUri,
                            })
                    }}>
                    <Text allowFontScaling={false} style={styles.statNumber}>{rank}</Text>
                    <Text allowFontScaling={false} style={styles.statLabel}>{t("common.rankeds")}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.statBox, { marginLeft: 10 }]} onPress={onFollow} activeOpacity={0.6}>
                    <Text allowFontScaling={false} style={styles.statNumber}>{followers}</Text>
                    <Text allowFontScaling={false} style={styles.statLabel}>{t("common.followers")}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.statBox} onPress={onFollowing} activeOpacity={0.6}>
                    <Text allowFontScaling={false} style={styles.statNumber}>{following}</Text>
                    <Text allowFontScaling={false} style={styles.statLabel}>{t("common.following")}</Text>
                </TouchableOpacity>
            </View>
            {/* <Text style={styles.bioText}>{bio}</Text> */}
            {bio ? (
                <Text allowFontScaling={false} style={styles.bioText}>{bio}</Text>
            ) : null}
            {butt ? (
                <ButtonCustom
                    onPress={onFollowPress}
                    loaderFollow={loaderFollow}

                    title={isFollowing ?   t("common.following"): t("common.follow")}
                    buttonStyle={[
                        {
                            height: 42,
                            minWidth: 150,
                            paddingHorizontal: 16,
                            marginTop: 10,
                            borderRadius: 8,
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderWidth: 0.5,
                            // backgroundColor:  Color.whiteText,
                        },
                        isFollowing == true
                            ? {
                                borderWidth: 0.5,
                                borderColor: Color.whiteText,
                                backgroundColor: Color.background,
                            }
                            : {},
                    ]}
                    textStyle={{
                        fontSize: 14,
                        fontFamily: font.PoppinsBold,
                        lineHeight: 18,
                        textAlign: 'center',
                    }}
                />

            ) : (
                <ButtonCustom
                    onPress={onFollowPress}
                    title={t("home.editprofile")}
                    // onSelect={(option) => option.action()}
                    buttonStyle={{
                        height: 42,
                        minWidth: 150,
                        paddingHorizontal: 16,
                        marginTop: 10,
                        borderRadius: 8,
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: Color.background,
                        borderWidth: 0.5,
                        borderColor: Color.whiteText
                    }}
                    textStyle={{
                        fontSize: 14,
                        // fontWeight: '700',
                        textAlign: 'center',
                        fontFamily: font.PoppinsSemiBold
                    }}
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    profileContainer: {
        alignItems: 'center',
        borderRadius: 12,
        marginTop: 0
    },
    profileImage: {
        width: 100,
        height: 100,
        borderRadius: 50,
    },
    nameText: {
        fontSize: 20,
        fontWeight: 'bold',
        marginVertical: 10,
    },
    statsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        width: '90%',
        marginVertical: 10,
        marginTop: 16
    },
    statBox: {
        alignItems: 'center',
    },
    statNumber: {
        fontSize: 14,
        fontFamily: font.PoppinsBold,
        color: Color.whiteText
    },
    statLabel: {
        fontSize: 14,
        color: Color.textGray,
        fontFamily: font.PoppinsMedium,

    },
    bioText: {
        textAlign: 'center',
        marginVertical: 10,
        fontSize: 14,
        color: Color.whiteText,
        lineHeight: 20,
        marginTop: 16,
        fontFamily: font.PoppinsRegular,
    },
    followButton: {
        backgroundColor: Color.primary,
        paddingHorizontal: 30,
        paddingVertical: 10,
        borderRadius: 20,
    },
    followButtonText: {
        color: Color.whiteText,
        fontWeight: 'bold',
    },
});

export default React.memo(ProfileCard);
// export default ProfileCard;
