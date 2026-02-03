import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useState } from 'react';
import { DiscoverTabParamList, RootStackParamList } from '@navigators/type';
 
const useHome = () => {
    type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
  const navigation = useNavigation<NavigationProp>();
 
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const [TooltipModal, setTooltipModal] = useState<boolean>(true);
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [stepsModal, setStepsModal] = useState<boolean>(false);
  const [lovedImge, setlovedImge] = useState<boolean>(false);
   const [selectedPlatforms, setSelectedPlatforms] = useState<object| string | null | number[]>([]);

  const togglePlatform = (item: object| string | null | number) => {
    const id = item?.id;
    const currentSelection = Array.isArray(selectedPlatforms) ? selectedPlatforms : [];
    if (currentSelection.includes(id)) {
      setSelectedPlatforms(currentSelection?.filter(pid => pid !== id));
    } else {
      setSelectedPlatforms([...currentSelection, id]);

    }
  };
  return {
    navigation,
    togglePlatform ,
    isVisible, setIsVisible ,
    TooltipModal, setTooltipModal ,
    modalVisible, setModalVisible ,
    lovedImge, setlovedImge , 
    selectedPlatforms, setSelectedPlatforms,
    stepsModal, setStepsModal
  };
};

export default useHome;
