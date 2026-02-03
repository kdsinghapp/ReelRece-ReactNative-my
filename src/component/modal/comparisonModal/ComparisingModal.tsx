import React, { useEffect, useRef, useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ImageBackground,
  TouchableWithoutFeedback,
  Dimensions,
  Animated,
} from 'react-native';
import imageIndex from '@assets/imageIndex';
import { Color } from '@theme/color';

interface Movie {
  title: string;
  year: string;
  poster: string;
  rating?: string;
}

interface ComparisonModalProps {
  visible: boolean;
  onSelectFirst: () => void;
  onSelectSecond: () => void;
  onSkip: () => void;
  firstMovie: Movie;
  secondMovie: Movie;
  onClose: () => void;
}
const screenHeight = Dimensions.get('window').height;
const screenWidth = Dimensions.get('window').width;
const ComparisonModal: React.FC<ComparisonModalProps> = ({
  visible,
  onSelectFirst,
  onSelectSecond,
  onSkip,
  firstMovie,
  secondMovie,
  onClose
}) => {

  const leftAnim = useRef(new Animated.Value(0)).current;
  const rightAnim = useRef(new Animated.Value(0)).current;
  const [selected, setSelected] = useState<'first' | 'second' | null>(null);
// useEffect(() => {
//   if (visible) {
//     // Start with cards outside of screen
//     leftAnim.setValue(screenWidth / 2);   // off-screen left
//     rightAnim.setValue(-screenWidth / 2);   // off-screen right

//     // Animate them into position
//     Animated.parallel([
//       Animated.timing(leftAnim, {
//         toValue: 0,
//         duration: 300,
//         useNativeDriver: true,
//       }),
//       Animated.timing(rightAnim, {
//         toValue: 0,
//         duration: 300,
//         useNativeDriver: true,
//       }),
//     ]).start();
//   }
// }, [visible]);

  useEffect(() => {
    if (visible) {
      setSelected(null); // Reset when modal opens
      leftAnim.setValue(screenWidth / 2);
      rightAnim.setValue(-screenWidth / 2);

      Animated.parallel([
        Animated.timing(leftAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(rightAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);
//   const slideImages = () => {
//   Animated.parallel([
//     Animated.timing(leftAnim, {
//       toValue: screenWidth , // balanced slide left
//       duration: 300,
//       useNativeDriver: true,
//     }),
//     Animated.timing(rightAnim, {
//       toValue: -screenWidth , // balanced slide right
//       duration: 300,
//       useNativeDriver: true,
//     }),
//   ]).start();
// };


 const slideImages = () => {
    Animated.parallel([
      Animated.timing(leftAnim, {
        toValue: screenWidth,
        duration: 1300,
        useNativeDriver: true,
      }),
      Animated.timing(rightAnim, {
        toValue: -screenWidth,
        duration: 1300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setSelected(null); // Reset after slide
    });
  };

  return (
    <Modal visible={visible} animationType="fade" transparent  onRequestClose={onClose} >
      <TouchableWithoutFeedback onPress={onClose}>

        <View style={styles.overlay}>
          <View style={styles.modalContent}>
            <Text style={styles.heading}>Which do you prefer?</Text>
            <View style={styles.moviesContainer}>



{/* right second  */}
             {/* <Animated.View style={[styles.movieCard, { transform: [{ translateX: rightAnim }] }]}>
  <TouchableOpacity onPress={() => {
    slideImages();
    onSelectSecond(); // ← trigger the correct one
  }}>
    <View>
      <View style={styles.posterWrapper}>
        <Image
          resizeMode='contain'
          source={secondMovie.poster}
          style={styles.poster}
        />
      </View>
      <Text style={styles.title}>{secondMovie.title}</Text>
      <Text style={styles.year}>{secondMovie.year}</Text>
      {secondMovie.rating && (
        <View style={styles.ratingBadge}>
          <ImageBackground
            source={imageIndex.acrtivePlay}
            resizeMode='contain'
            style={styles.ratingBackground}
            imageStyle={{ borderRadius: 20 }}
          >
            <Text style={styles.ratingText}>9.8</Text>
          </ImageBackground>
        </View>
      )}
    </View>
  </TouchableOpacity>
</Animated.View> */}

<Animated.View style={[styles.movieCard, { transform: [{ translateX: rightAnim }] }]}>
  <TouchableOpacity
    // disabled={!!selected}
    onPress={() => {
      setSelected('second');
      slideImages();
      onSelectSecond();
    }}
  >
    <View>
      <View style={styles.posterWrapper}>
        <Image resizeMode='contain' source={secondMovie.poster} style={styles.poster} />
        {selected === 'first' && (
          <View style={styles.overlayGray} />
        )}
      </View>
      <Text style={styles.title}>{secondMovie.title}</Text>
      <Text style={styles.year}>{secondMovie.year}</Text>
      {secondMovie.rating && (
        <View style={styles.ratingBadge}>
          <ImageBackground
            source={imageIndex.acrtivePlay}
            resizeMode='contain'
            style={styles.ratingBackground}
            imageStyle={{ borderRadius: 20 }}
          >
            <Text style={styles.ratingText}>9.8</Text>
          </ImageBackground>
        </View>
      )}
    </View>
  </TouchableOpacity>
</Animated.View>
            {/* left first  */}
{/* <Animated.View style={[styles.movieCard, { transform: [{ translateX: leftAnim }] }]}>
  <TouchableOpacity onPress={() => {
    slideImages();
    onSelectFirst(); // ← trigger the correct one
  }}>
    <View>
      <View style={styles.posterWrapper}>
        <Image
          resizeMode="contain"
          source={firstMovie.poster}
          style={styles.poster}
        />
      </View>
      <Text style={styles.title}>{firstMovie.title}</Text>
      <Text style={styles.year}>{firstMovie.year}</Text>
    </View>
  </TouchableOpacity>
</Animated.View> */}

{/* lefyt card */}

<Animated.View style={[styles.movieCard, { transform: [{ translateX: leftAnim }] }]}>
  <TouchableOpacity
    // disabled={!!selected}
  onPress={() => {
   setSelected('first');
  slideImages();
  onSelectFirst();
}}
  >
    <View>
    <View style={styles.posterWrapper}>
  <Image
    resizeMode="contain"
    source={firstMovie.poster}
    style={styles.poster}
  />
  {selected === 'second' && (
    <View style={styles.overlayGray} />
  )}
</View>
      <Text style={styles.title}>{firstMovie.title}</Text>
      <Text style={styles.year}>{firstMovie.year}</Text>
    </View>
  </TouchableOpacity>
</Animated.View>


             

            </View>
            <TouchableOpacity style={styles.skipButton} onPress={onSkip}>
              <Text style={styles.skipText}>Skip</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.orContainer}>
            <Image
              source={imageIndex.orCircle}
              style={styles.orImage}
              resizeMode='contain'
            />
          </View>

        </View>
      </TouchableWithoutFeedback>
    </Modal >
  );
};

export default ComparisonModal;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.80)',

  },
  modalContent: {
    padding: 14,
    borderRadius: 20,
    width: '100%',
    alignItems: 'center',
  },
  heading: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 12,
  },
  moviesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    // backgroundColor:'red',
  },
  movieCard: {
    width: '48%', // ensures both cards fit side by side evenly
    alignItems: 'center',
  },
  posterWrapper: {
    borderRightColor:'red',
  width: '100%',
  aspectRatio: 2 / 3,
  borderRadius: 10,
  overflow: 'hidden',
  justifyContent: 'center',
  alignItems: 'center', // 🔑 This ensures the image is centered
  backgroundColor: '#000', // optional: fallback background
},

poster: {
    borderRightColor:'red',

  width: '100%',
  height: '100%',
  resizeMode: 'cover', // 🔑 Ensures it fills without leaving borders
},
  ratingBackground: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    width: '100%',
    height: '100%',
  },

 

  title: {
    color: '#fff',
    fontWeight: '500',
    fontSize: 16,
    marginTop: 8,
    marginLeft: 1
  },
  year: {
    color: '#CDCDCD',
    fontSize: 14,
    marginLeft: 1

  },
  orBadge: {
    position: "absolute",
    left: 0,
    right: 15,
    alignItems: "center",
    justifyContent: "center",
  },
  orContainer: {
    position: 'absolute',
    top: '48%',
    left: '50%',
    transform: [{ translateX: -16 }, { translateY: -16 }], // half of image size (32x32)
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },

  orImage: {
    height: 34,
    width: 34,
    resizeMode: "contain",
  }
  ,
  orText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  ratingBadge: {
    position: 'absolute', // changed to absolute for better control
    left: 10,
    bottom: 80,
    width: 40,
    height: 40,
  },
  ratingText: {
  color: Color.whiteText,
  fontWeight: '700',
  fontSize: 12,
  textAlign: 'center'
},
  skipButton: {
    marginTop: 16,
    borderColor: '#CDCDCD',
    borderWidth: 1,
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 8,
  },
  skipText: {
    color: '#FFFFFF',
    fontWeight: '500',
    fontSize: 14
  },
 overlayGray: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(241, 4, 4, 1)',
    zIndex: 10,
    borderRadius: 10,
  },
  dimmedText: {
    opacity: 0.6,
  },
});

