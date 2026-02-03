import React, {   useEffect, } from 'react';
import {
  Modal, View, Text, StyleSheet, TouchableWithoutFeedback,  
} from 'react-native';
 import StepProgressBar from './StepProgressBar'; // import component
import { Color } from '@theme/color';
import { fileLogger } from '@utils/FileLogger';

// interface ProgressModalProps {
//   visible: boolean;
//   progress: number; // 0 to 1
//   onClose?: () => void;
//   navigationProps: () => void;
 //   setStepsModal: boolean,
//   selectedMovieId?: string;
//   setMoviereommNav?: (val: boolean) => void;

// }

// const StepProgressModal: React.FC<ProgressModalProps> = ({
//   visible,
//   progress,
//   navigationProps,
//   onClose,
//   currentStep,
//   setCurrentStep,
//   setStepsModal,
//   selectedMovieId,
//   setMoviereommNav,
// }) => {
//   const totalSteps = 6;
 //   // const [currentStep, setCurrentStep] = useState(1);

//   // useEffect(() => {
//   // Load saved step
//   const loadStep = async () => {
//     const saved = await AsyncStorage.getItem('currentStep');
//     if (saved) setCurrentStep(parseInt(saved, 10));
//   };
//   loadStep();
//   // }, []);

//   const handleStepPress = useCallback(
//     async (index: number) => {
//       const step = index + 1;
//       const updatedStep = step === currentStep ? step - 1 : step;
 
//       setCurrentStep(updatedStep);
//       await AsyncStorage.setItem('currentStep', updatedStep.toString());

//       if (setStepsModal) setStepsModal(false);
//     },
//     [currentStep, setCurrentStep, setStepsModal]
//   );
 
//   return (
//     <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}  >
//       <TouchableWithoutFeedback onPress={onClose}>
//         <View style={styles.overlay}>
//           <Text style={styles.heading}>
//             Awesome! You’ve just ranked your {'\n'}first movie!
//           </Text>

//           <View style={{ width: '90%' }} >
//             <StepProgressBar
//               navigationProps={navigationProps}
//               currentStepModal={currentStep ?? 0}
//               setMoviereommNav={setMoviereommNav}
//               totalSteps={totalSteps}
//               disable={true}
//               onStepPress={handleStepPress}
//               onClose={() => setStepsModal(false)}
//               selectedMovieId={selectedMovieId}
//             />
//           </View>


//         </View>

//       </TouchableWithoutFeedback>
//     </Modal>
//   );
// };



interface ProgressModalProps {
  visible: boolean;
  progress: number;
  onClose?: () => void;
  navigationProps: () => void;
  setCurrentStep: (step: number) => void;
  currentStep: number;
  setStepsModal: (visible: boolean) => void;
  selectedMovieId?: string;
  setMoviereommNav?: (val: boolean) => void;
  totalSteps: number; // <-- added
}

const StepProgressModal: React.FC<ProgressModalProps> = ({
  visible,
  navigationProps,
  onClose,
  currentStep,
  setStepsModal,
  totalSteps, // <-- receive from props
}) => {
 
  
  useEffect(() => {
    if (visible) {
      fileLogger.info('StepProgressModal opened', {
        currentStep,
        totalSteps,
        visible
      });
    }
  }, [visible, currentStep, totalSteps]);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <Text style={styles.heading}>
            Awesome! You’ve just ranked your {'\n'}first movie!
          </Text>

          <View style={{ width: '90%' }}>
            <StepProgressBar
              navigationProps={navigationProps}
              currentStepModal={currentStep ?? 0}
              // setMoviereommNav={setMoviereommNav}
              totalSteps={totalSteps} // <-- dynamic
              disable={true}
              // onStepPress={handleStepPress}
              onClose={() => setStepsModal(false)}
              // selectedMovieId={selectedMovieId}
            />
          </View>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};



export default StepProgressModal;


const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    width: 12,
    height: 12,
    resizeMode: 'contain',
  },
  step: {
    flex: 1,
    height: 6,
    borderRadius: 4,
    marginHorizontal: 2,

  },
  segment: {
    height: 30,
    borderRadius: 999,
    justifyContent: 'center',
    alignItems: 'center',
  },
  segmentActive: {
    backgroundColor: '#009DE0',
  },
  segmentInactive: {
    backgroundColor: '#444',
  },
  stepActive: {
    backgroundColor: Color.primary,
  },
  stepInactive: {
    backgroundColor: '#555',
  },
  modalContent: {
    backgroundColor: Color.grey,
    borderRadius: 8,
    padding: 5,
    width: '90%',
    alignItems: 'center',
    marginTop: 10,
    height: 100
  },
  heading: {
    color: Color.primary,
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 20,
    textAlign: 'center',
  },
  scoreBox: {
    padding: 16,
    borderRadius: 12,
    width: '100%',
  },
  scoreHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,

  },
  scoreTitle: {
    color: Color.whiteText,
    fontSize: 20,
    marginLeft: 8,
    fontWeight: '700',
  },
  progressBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  barSegment: {
    height: 6,
    flex: 1,
    marginHorizontal: 2,
    borderRadius: 4,
  },
  barFilled: {
    backgroundColor: 'red',
    borderRadius: 20
  },
  barEmpty: {
    backgroundColor: '#666',
  },

  closeButton: {
    marginTop: 16,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    borderColor: Color.whiteText,
    borderWidth: 1,
  },
  closeText: {
    color: Color.whiteText,
    fontWeight: '600',
  },
});

