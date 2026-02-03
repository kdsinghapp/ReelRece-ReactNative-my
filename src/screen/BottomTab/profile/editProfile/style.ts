
import { StyleSheet } from 'react-native';
import { Color } from '@theme/color';
import font from '@theme/font';
     
const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: Color.background,
      paddingTop:16,
  
    },
    avatar: {
      width: 100,
      height: 100,
      borderRadius: 50,
      alignSelf: 'center',
      // resizeMode:'contain',
    },
    button: {
      alignSelf: 'center',
      marginVertical: 10,
      paddingVertical: 6,
      paddingHorizontal: 24,
      borderColor: Color.whiteText,
      borderWidth: 0.5,
      borderRadius: 8,
      marginTop: 30,
      height: 41,
      alignItems: "center",
      justifyContent: "center"
    },
    buttonText: {
      color:  Color.whiteText,
      fontSize: 14,
      fontFamily:font.PoppinsMedium,
      lineHeight:16,
      // fontWeight: "500"
    },
    fieldRow: {
      marginTop: 20,
    },
    label: {
      color: Color.whiteText,
      fontSize: 14,
      fontFamily:font.PoppinsBold,
    },
    fieldContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    fieldText: {
      color: Color.placeHolder,
      fontSize: 14,
      fontFamily:font.PoppinsRegular,
      
    },
    editIcon: {
      height:15,
      width:15,
      resizeMode:'contain',
    },
  });
export default styles;
