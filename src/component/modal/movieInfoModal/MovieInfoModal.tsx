 import React, { useState } from 'react';
import {
    Modal,
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Dimensions,
    Image,
    ScrollView,
    TouchableWithoutFeedback,
    Platform,
} from 'react-native';
 import imageIndex from '@assets/imageIndex';
import { Color } from '@theme/color';
import font from '@theme/font';
import { t } from 'i18next';

interface Props {
    visible: boolean;
    onClose: () => void;
    title: string;
    synopsis: string;
    releaseDate: string;
    genre: string;
    type?: string;
    groupMembers?:[];
}

const MovieInfoModal: React.FC<Props> = ({
    visible,
    onClose,
    title,
    synopsis,
    releaseDate,
    genre,
    type,
    groupMembers
}) => {
    const [expanded, setExpanded] = useState(false);
    const shortText = synopsis.slice(0, 150);

    return (
        <Modal transparent animationType="slide" visible={visible} onRequestClose={onClose}>
            <TouchableWithoutFeedback onPress={onClose}>
                <View style={styles.overlay}>
                    <TouchableWithoutFeedback>
                        <View style={[styles.modalContent, { backgroundColor: type === "watchModal" ? Color.modalTransperant : Color.modalBg }]}>
                            {/* Header */}

                            <View style={styles.header}>
<View  style={{ height: 24, width: 24 }}></View>
                                <Text style={styles.headerText}>{t("common.info")}</Text>
                                <TouchableOpacity onPress={onClose}>
                                    <Image
                                        source={imageIndex.closeimg}
                                        style={{ height: 24, width: 24 }}
                                        resizeMode='contain'
                                    />
                                </TouchableOpacity>
                            </View>
                            <ScrollView showsVerticalScrollIndicator={false}>


                                {/* Title */}
                                <Text style={styles.title}>{title}</Text>

                                {/* Synopsis */}
                                <Text style={styles.sectionTitle}>{t("common.synopsis")}</Text>
                                <Text style={styles.text}>
                                    {synopsis}
                                    {/* {expanded ? synopsis : `${shortText}... `}
                                    {synopsis.length > 120 && (
                                        <Text onPress={() => setExpanded(!expanded)} style={styles.readMore}>
                                            {expanded ? 'Read less' : 'Read more..'}
                                        </Text>
                                    )} */}
                                </Text>

                                {/* Release Date */}
                                <Text style={styles.sectionTitle}>{t("common.releaseDate")}</Text>
                                <Text style={styles.text}>{releaseDate}</Text>

                                {/* Genre */}
                                <Text style={styles.sectionTitle}>{t("common.genre")}</Text>
                                <Text style={styles.text}>{genre}</Text>


                                {/* Close Button */}
                                {/* <TouchableOpacity style={styles.closeBtnContainer} onPress={onClose}>
                                    <Text style={styles.closeText}>Close</Text>
                                </TouchableOpacity> */}
                            </ScrollView>
                        </View>
                    </TouchableWithoutFeedback>
                </View>
            </TouchableWithoutFeedback>
        </Modal>
    );
};

export default MovieInfoModal;

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        justifyContent: 'flex-end',
        // backgroundColor: 'rgba(0,0,0,0.5)',
    },
    modalContent: {
   backgroundColor: Color.modalBg,
    paddingTop: 16,
    paddingBottom: 12,
    paddingHorizontal: 16,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    // height:  Dimensions.get('window').height * 0.7,
maxHeight:
      Dimensions.get('window').height *
      (Platform.OS === 'ios' ? 0.63 : 0.62 ),    

    // maxHeight: Dimensions.get('window').height * 0.63,
    height: Dimensions.get('window').height * 0.66,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 14,
    },
    headerText: {
        color: Color.whiteText,
        fontSize: 20,
        fontFamily: font.PoppinsBold,
    },
    title: {
        fontSize: 24,

        fontFamily: font.PoppinsBold,

        color: Color.whiteText,
        // marginBottom: 14,
        // marginTop: 10,
    },
    sectionTitle: {
        fontSize: 14,
        color: Color.whiteText,
        marginTop: 14,
        fontFamily: font.PoppinsBold,

    },
    text: {
        fontSize: 14,
        color: Color.whiteText,
        marginTop: 6,
        lineHeight: 21,
        marginBottom: 11,
        fontFamily: font.PoppinsRegular,
    },
    readMore: {
        color: Color.whiteText,
        fontSize: 13,
    },
    // closeBtnContainer: {
    //     alignItems: 'center',
    //     justifyContent: 'center',
    //     alignSelf: 'center',
    //     borderColor: Color.placeHolder,
    //     borderWidth: 1,
    //     borderRadius: 10,
    //     marginTop: 20,
    //     marginBottom: 30,
    // },
    // closeText: {
    //     fontSize: 16,
    //     color: Color.lightGrayText,
    //     fontFamily: font.PoppinsRegular,
    //     marginVertical: 10,
    //     marginHorizontal: 30,
    // },
});
