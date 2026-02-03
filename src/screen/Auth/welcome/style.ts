
import { StyleSheet } from 'react-native';
import { Color } from '@theme/color';
const styles = StyleSheet.create({
    container: {
        flex: 1,
        resizeMode: 'cover',
        justifyContent: 'flex-end',
        paddingBottom: 50,
    },
    logo: {
        width: 60,
        height: 60,
        marginBottom: 10,
    },
    heading: {
        fontSize: 32,
        fontWeight: '700',
        color: Color.whiteText,
        textAlign: 'center',
        marginBottom: 12,
    },
    subHeading: {
        fontSize: 16,
        color: Color.whiteText,
        textAlign: 'center',
        marginBottom: 30,
        paddingHorizontal: 10,
        marginTop: 18,
        lineHeight: 22
    },
    contentWrapper: {
        marginHorizontal: 16,
     },
    contentWrapp: {
        alignItems: 'center',
    },
});

export default styles;

