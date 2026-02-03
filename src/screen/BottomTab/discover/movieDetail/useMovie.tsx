import { useNavigation } from '@react-navigation/native';
import { useState } from 'react';
  
const useMovie = () => {
  const navigation = useNavigation();
  const [watchModal, setWatchModal] = useState(false);
  const [episVisible, setEpisVisible] = useState(false);
  const [MorelikeModal, setMorelikeModal] = useState(false)
  const [InfoModal, setInfoModal] = useState(false)
  const [thinkModal, setthinkModal] = useState(false)
  return {
    navigation,
    watchModal, setWatchModal ,
    episVisible, setEpisVisible ,
    MorelikeModal, setMorelikeModal ,
    InfoModal, setInfoModal ,
    thinkModal, setthinkModal
  };
};

export default useMovie;
