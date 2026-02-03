import { useNavigation } from '@react-navigation/native';
import { useState } from 'react';

const useDiscover = () => {
  const navigation = useNavigation();

  const [sortByModal, setSortByModal] = useState(false);
  const [contentSelect, setContentSelect] = useState(1);
  const [selectedSortId, setSelectedSortId] = useState(1); // Default: Rec Score
  const [platformId, setPlatformId] = useState<string[]>([]);
  const [trending, setTrending] = useState([]);

  const contantFilter = (item) => {

    if (contentSelect === item.id) {
      setContentSelect(item.type);
     } else {
      setContentSelect(item.id);
     }
  };

  return {
    navigation,
    platformId,
    sortByModal, setSortByModal,
    contantFilter, contentSelect, setContentSelect,
    selectedSortId, setSelectedSortId,
    trending, setTrending
  };
};

export default useDiscover;
