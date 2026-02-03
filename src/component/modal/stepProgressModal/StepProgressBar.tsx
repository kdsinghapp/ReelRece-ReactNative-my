import React, { useEffect, useState } from 'react';
import { View, TouchableOpacity, Image, StyleSheet, Text } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import imageIndex from '@assets/imageIndex';
 import { NavigationContainer, useNavigation, useRoute } from '@react-navigation/native';
import { Color } from '@theme/color';
import font from '@theme/font';

// interface StepProgressBarProps {
//   totalSteps: number;  
//   disable?: boolean;
 //   currentStepRanking: number;
//  setMoviereommNav: (val: boolean) => {},

// }

// const StepProgressBar: React.FC<StepProgressBarProps> = ({ totalSteps, currentStepModal, navigationProps, disable, currentStepRanking ,onClose, setMoviereommNav }) => {
//   const [currentStep, setCurrentStep] = useState(1);
//   const route =  useRoute();
// // const selectedMovieId = route?.params?.selectedMovieId ?? '';

//   const navigation = useNavigation();
//   useEffect((currentStepModal) => {
//     getSavedStep();

//     saveStep(currentStepModal)
//   }, currentStepModal,);

//   const getSavedStep = async () => {
//     try {
//       const saved = await AsyncStorage.getItem('currentStep');
//       if (saved !== null) setCurrentStep(parseInt(saved, 10));
 //     } catch (e) {
 //     }
//   };
//  const saveStep = async (step: number) => {
//   if (typeof step !== 'number') return;
//   try {
//     await AsyncStorage.setItem('currentStep', step.toString());
//   } catch (e) {
 //   }
// };
//   const handleStepPress = (index: number) => {
//   const step = index + 1;
//   const safeCurrent = typeof currentStep === 'number' ? currentStep : 0;
//   const newStep = step === safeCurrent ? safeCurrent - 1 : step;

//   setCurrentStep(newStep);
//   saveStep(newStep);

//   setTimeout(() => {
//     if (typeof onClose === 'function') onClose();
//   }, 500);
// };

//  useEffect(() => {
//   if (currentStep === 6) {
//     if (typeof setMoviereommNav === 'function') {
//       setMoviereommNav(true); 
//     }
//   }
// }, [currentStep]);

//   // useEffect(() => {
//   //   if (currentStep === 6) {
//   //     handleNavigation(); // just call this here
//   //   }
//   // }, [currentStep]);

  
//     const progressPercentage = (currentStep / totalSteps) * 100;


//   return (
//    <>
//     <TouchableOpacity  
//     activeOpacity={1}
//     style={styles.modalContent}>
//       <View style={styles.scoreHeader}>
//         <Image source={imageIndex.bluePlay} style={{ height: 24, width: 24 }}

//           resizeMode='contain'
//         />
//         <Text style={styles.scoreTitle}> Recs Score Progress</Text>
//       </View>
     
//   <View style={styles.progressWrapper}>
//         {/* Background Bar */}
//         <View style={styles.progressBackground}>
//           <View style={[styles.progressFill, { width: `${progressPercentage}%` }]} />
//         </View>

//         {/* Step Icons */}
//         <View style={styles.imageRow}>
//           {Array.from({ length: totalSteps }).map((_, index) => (
//             <TouchableOpacity
//               key={index}
//               disabled={disable}
//               onPress={() => handleStepPress(index)}
//               style={styles.touchIconWrapper}
//             >
//               <Image
//                 source={imageIndex.progressBarCenter}
//                 style={[
//                   styles.icon,
//                   { tintColor: index < currentStep ? '#bde8ff' : '#aaa' },
//                 ]}
//               />
//             </TouchableOpacity>
//           ))}
//         </View>
//       </View>

//       <Text style={styles.subText}>
//         Rate a few more movies/shows to get your personalized recommendations.
//       </Text>
//     </TouchableOpacity>




//    </>


//   );
// };


interface StepProgressBarProps {
  totalSteps  : number;  // <-- already here
  disable?: boolean;
  onClose?: () => void;
  currentStepModal?: number;
  setMoviereommNav?: (val: boolean) => void;
  // navigationProps?: () => void;
}
const StepProgressBar: React.FC<StepProgressBarProps> = ({
  totalSteps,
  currentStepModal,
  // navigationProps,
  disable,
  onClose,
  setMoviereommNav
}) => {
  // const [currentStep, setCurrentStep] = useState(currentStepModal);

  // useEffect(() => {
  //   getSavedStep();
  //   saveStep(currentStepModal);
  // }, [currentStepModal]); // <-- dependency fix

  // const getSavedStep = async () => {
  //   try {
  //     const saved = await AsyncStorage.getItem('currentStep');
  //     if (saved !== null) setCurrentStep(parseInt(saved, 10));
  //   } catch (e) {
   //   }
  // };

 

  // const handleStepPress = (index: number) => {
  //   const step = index + 1;
  //   const safeCurrent = typeof currentStep === 'number' ? currentStep : 0;
  //   const newStep = step === safeCurrent ? safeCurrent - 1 : step;

  //   setCurrentStep(newStep);
  //   saveStep(newStep);

  //   setTimeout(() => {
  //     if (typeof onClose === 'function') onClose();
  //   }, 500);
  // };
  useEffect(() => {
    if (currentStepModal === totalSteps) { // <-- dynamic check
      if (typeof setMoviereommNav === 'function') {
        setMoviereommNav(true);
      }
    }
  }, [currentStepModal, totalSteps]);
  const progressPercentage = (currentStepModal / totalSteps) * 100;
  return (
    <TouchableOpacity activeOpacity={1} style={styles.modalContent}>
      <View style={styles.scoreHeader}>
        <Image source={imageIndex.bluePlay} style={{ height: 24, width: 24 }} resizeMode='contain' />
        <Text style={styles.scoreTitle}> Recs Score Progress</Text>
      </View>
      <View style={styles.progressWrapper}>
        <View style={styles.progressBackground}>
          <View style={[styles.progressFill, { width: `${progressPercentage}%` }]} />
        </View>

        <View style={styles.imageRow}>
          {Array.from({ length: totalSteps }).map((_, index) => (
            <TouchableOpacity
              key={index}
              disabled={disable}
              // onPress={() => handleStepPress(index)}
              style={styles.touchIconWrapper}
            >
              <Image
                source={imageIndex.progressBarCenter}
                style={[
                  styles.icon,
                  // { tintColor: index < currentStepModal ? '#bde8ff' : '#aaa' },
                  { tintColor: 'rgba(255, 255, 255, 0.5)' },
                ]}
              />
            </TouchableOpacity>
          ))}
        </View>
      </View>
      <Text allowFontScaling={false} style={styles.subText}>
       {/* Rate a few more movies/shows to get your personalized recommendations. */}
       You’ve completed ranking for 5 movies! Your personalized Rec Score is now available.
      </Text>
    </TouchableOpacity>
  );
};
export default StepProgressBar;
const styles = StyleSheet.create({
  modalContent: {
    padding: 18,
    // marginTop: 5,
    borderRadius:10,
    backgroundColor: Color.grey,
  },
  scoreHeader: {
    flexDirection: 'row',
    height:28,
    alignItems:'center'

    // alignItems: 'center',
    // marginBottom: 5,
  },
  scoreTitle: {
    color: Color.whiteText,
    fontSize: 20,
    marginLeft: 8,
    // fontWeight:'700',
    fontFamily:font.PoppinsBold,
    lineHeight:26
  },
  
  progressWrapper: {
    height: 30,
    justifyContent: 'center',
    marginVertical: 2,
    marginBottom:6
  },
  progressBackground: {
    height: 14,
    backgroundColor: '#333',
    borderRadius: 20,
    overflow: 'hidden',
    // alignItems:'center',
// justifyContent:'center',

  },
  progressFill: {
    height: '100%',
    backgroundColor: Color.primary,
    borderRadius: 20,
    // alignItems:'center',
    // justifyContent:'center',
  },
  imageRow: {
    position: 'absolute',
    // top: -6,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  touchIconWrapper: {
    // padding: 6,
    justifyContent:'center',
    alignItems:'center',
  },
  icon: {
    width: 8,
    height: 8,
    resizeMode:'contain',
   
  },
  subText: {
    color: Color.whiteText,
    fontSize: 14,
    lineHeight: 18,
    fontFamily:font.PoppinsRegular,
  },

});
