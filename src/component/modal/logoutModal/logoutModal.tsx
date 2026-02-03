// import React from 'react';
// import { Modal, View, Text, Pressable, StyleSheet, TouchableOpacity, TouchableNativeFeedbackComponent, TouchableWithoutFeedback } from 'react-native';
// import { Color } from '@theme/color';
// import font from '@theme/font';

// type Props = {
//   visible: boolean;
//   onCancel: () => void;
//   onConfirm: () => void;
//   title: string;
//   details: string;
// };


// const LogoutModal = ({ visible, onCancel, onConfirm , title , details}) => {


  
//   return (
//     <Modal
//       animationType="slide"
//       transparent={true}
//       visible={visible}
//       onRequestClose={onCancel}
//     >
//  <TouchableWithoutFeedback onPress={onCancel}>
//         <View style={styles.modalContainer}>
//           <TouchableWithoutFeedback>
//             <View style={styles.modalBox}>
//               <Text style={styles.logoutHeading}>{title}</Text>
//               <Text style={styles.title}>{details}</Text>
//               <View style={styles.buttonRow}>
//                 <Pressable onPress={onCancel}>
//                   <Text style={styles.cancelText}>Cancel</Text>
//                 </Pressable>
//                 <Pressable onPress={onConfirm}>
//                   <Text style={styles.logoutText}>{title}</Text>
//                 </Pressable>
//               </View>
//             </View>
//           </TouchableWithoutFeedback>
//         </View>
//       </TouchableWithoutFeedback>
//     </Modal>
//   );
// };

// export default LogoutModal;

// const styles = StyleSheet.create({
//   modalContainer: {
//     flex: 1,
//     backgroundColor: 'rgba(0,0,0,0.6)',
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   modalBox: {

//     backgroundColor: '#1A1A1A',
//     justifyContent: 'center',
//     padding: 20,
//     height: "25%",
//     borderRadius: 10,
//     width: '90%',
//     alignItems: 'center',
//     paddingHorizontal:"15%",
//   },
//   logoutHeading: {
//     fontSize: 20,
//     marginBottom: 20,
//     textAlign: 'center',
//  fontFamily:font.PoppinsBold,
//     color: Color.whiteText
//   },
//   title: {
//     fontSize: 16,
//     marginBottom: 20,
//     textAlign: 'center',
//     color: Color.whiteText,
//     fontFamily:font.PoppinsRegular,
//   },
//   buttonRow: {
//     flexDirection: 'row',
//     justifyContent: 'space-evenly',
//     width: '100%',
//   },
//   cancelText: {
//     color: Color.whiteText,
//     fontSize: 16,
//     marginRight: 30,
//     fontFamily:font.PoppinsMedium,
//   },
//   logoutText: {
//     color: '#FF3B30',
//     fontSize: 16,
//     fontFamily:font.PoppinsMedium,

//   },
// });
import React, { useRef, useEffect } from 'react';
import { 
  Modal, 
  View, 
  Text, 
  Pressable, 
  StyleSheet, 
  TouchableWithoutFeedback,
  Animated 
} from 'react-native';
import { Color } from '@theme/color';
import font from '@theme/font';

type Props = {
  visible: boolean;
  onCancel: () => void;
  onConfirm: () => void;
  title: string;
  details: string;
};

const LogoutModal = ({ visible, onCancel, onConfirm, title, details }: Props) => {
  const slideAnim = useRef(new Animated.Value(-300)).current; // Negative value for left side

  useEffect(() => {
    if (visible) {
      Animated.timing(slideAnim, {
        toValue: 0, // Slide in to position 0
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: -300, // Slide out to left
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  return (
    <Modal
      animationType="none" // Disable default animation
      transparent={true}
      visible={visible}
      onRequestClose={onCancel}
    >
      <TouchableWithoutFeedback onPress={onCancel}>
        <View style={styles.modalContainer}>
          <TouchableWithoutFeedback>
            <Animated.View 
              style={[
                styles.modalBox,
                {
                  transform: [{ translateX: slideAnim }]
                }
              ]}
            >
              <Text style={styles.logoutHeading}>{title}</Text>
              <Text style={styles.title}>{details}</Text>
              <View style={styles.buttonRow}>
                <Pressable onPress={onCancel}>
                  <Text style={styles.cancelText}>Cancel</Text>
                </Pressable>
                <Pressable onPress={onConfirm}>
                  <Text style={styles.logoutText}>{title}</Text>
                </Pressable>
              </View>
            </Animated.View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

export default LogoutModal;

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'flex-start', // Align to left side
  },
  modalBox: {
    backgroundColor: '#1A1A1A',
    justifyContent: 'center',
    padding: 20,
    height: "25%",
    borderRadius: 10,
    width: '90%',
    alignItems: 'center',
    paddingHorizontal: "15%",
    marginLeft: 20, // Add some margin from left edge
  },
  logoutHeading: {
    fontSize: 20,
    marginBottom: 20,
    textAlign: 'center',
    fontFamily: font.PoppinsBold,
    color: Color.whiteText
  },
  title: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
    color: Color.whiteText,
    fontFamily: font.PoppinsRegular,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    width: '100%',
  },
  cancelText: {
    color: Color.whiteText,
    fontSize: 16,
    marginRight: 30,
    fontFamily: font.PoppinsMedium,
  },
  logoutText: {
    color: Color.red,
    fontSize: 16,
    fontFamily: font.PoppinsMedium,
  },
});