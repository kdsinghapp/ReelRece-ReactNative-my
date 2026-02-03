
import { useNavigation } from '@react-navigation/native';
import { useCallback, useEffect, useState } from 'react';
import { searchMovies as fetchSearchMovies } from '@redux/Api/movieApi';
import { useSelector } from 'react-redux';
import { RootState } from '@redux/store';
import { getGroupActivities, getGroupMembers, getSearchGroup } from '@redux/Api/GroupApi';

const useWoodScreen = () => {
  const navigation = useNavigation();
  const token = useSelector((state: RootState) => state.auth.token);

  const [isVisible, setIsVisible] = useState(false);
  const [TooltipModal, setTooltipModal] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [stepsModal, setStepsModal] = useState(false);
  const [lovedImge, setlovedImge] = useState(false);
  const [selectedPlatforms, setSelectedPlatforms] = useState<string | object[]>([]);

  const [loading, setLoading] = useState(false);
  const [filteredItems, setFilteredItems] = useState<string | object[]>([]);
  const [groupsData, setGroupsData] = useState<string | object[]>([]);
  const [loadingGroups, setLoadingGroups] = useState(true);

  const togglePlatform = (item: string | object) => {
    const id = item.id;
    setSelectedPlatforms(prev =>
      prev.includes(id) ? prev.filter(pid => pid !== id) : [...prev, id]
    );
  };

  // 🔍 Search for Movies
  const searchFromAPI = async (query: string) => {
    try {
      setLoading(true);
      const result = await fetchSearchMovies(query, token);
      setFilteredItems(result?.data?.results || []);
    } catch (error) {
       setFilteredItems([]);
    } finally {
      setLoading(false);
    }
  };

  // 🔍 Search for Groups by Query
  const searchGroupFromApi = useCallback(async (query: string) => {
    try {
      setLoadingGroups(true);
      const result = await getSearchGroup(query, token);

      const basicGroups = result?.results || [];

      const enrichedGroups = await Promise.all(
        basicGroups?.map(async (group: string | object| number | string)  => {
           let activities = [];
          let members = [];
          const groupId = group?.group_id;
          const groupName = group.name;
          const isMuted = !group.notification; // convert notification to muted
// const activitiesRes = await getGroupActivities(token, groupId);
            // activities = activitiesRes || [];
          //  activities = group?.activities || [];
//  members = group?.members ;
          try {
            const activitiesRes = await getGroupActivities(token, groupId);
            activities = activitiesRes?.results || [];
          } catch (err) {
 }

          try {
            const membersRes = await getGroupMembers(token, groupId);
            members = membersRes?.results || [];
        

          } catch (err) {
           }
 
          return {
            groupId,
            groupName,
            isMuted,
            members,
            activities
          };
        })
      );

      setGroupsData(enrichedGroups.filter(Boolean));
    } catch (error) {
       setGroupsData([]);
    } finally {
      setLoadingGroups(false);
    }
  }, [token]);

  // 🔇 Mute/unmute toggle
  const handleToggleMute = useCallback((groupId: string) => {
    const updated = groupsData.map(group =>
      group.groupId === groupId
        ? { ...group, isMuted: !group.isMuted }
        : group
    );
    setGroupsData(updated);
  }, [groupsData]);

  return {
    navigation,
    togglePlatform,
    isVisible,
    setIsVisible,
    TooltipModal,
    setTooltipModal,
    modalVisible,
    setModalVisible,
    lovedImge,
    setlovedImge,
    selectedPlatforms,
    setSelectedPlatforms,
    stepsModal,
    setStepsModal,
    loading,
    filteredItems,
    setFilteredItems,
    searchFromAPI,
    searchGroupFromApi,
    handleToggleMute,
    groupsData,
    loadingGroups
  };
};

export default useWoodScreen;



// import { useNavigation } from '@react-navigation/native';
// import { useCallback, useEffect, useState } from 'react';
// import { searchMovies as fetchSearchMovies } from '@redux/Api/movieApi'; // ✅
// import { useSelector } from 'react-redux';
// import { RootState } from '@redux/store';
// import { getGroupActivities, getGroupMembers, getSearchGroup } from '@redux/Api/GroupApi';

// const useWoodScreen = () => {
//   const navigation = useNavigation();
//   const [isVisible, setIsVisible] = useState(false);
//   const [TooltipModal, setTooltipModal] = useState(true);
//   const [modalVisible, setModalVisible] = useState(false);
//   const [stepsModal, setStepsModal] = useState(false);
//   const [lovedImge, setlovedImge] = useState(false);
//   const [selectedPlatforms, setSelectedPlatforms] = useState<>([]);
//   const [loading, setLoading] = useState(false);
//   const [filteredItems, setFilteredItems] = useState([]);
//     const token = useSelector((state: RootState) => state.auth.token); // ✅ outside   condition
//     const [groupsData, setGroupsData] = useState([]);
//     const [loadingGroups, setLoadingGroups] = useState(true); // optional
  



//   const togglePlatform = (item) => {
//     const id = item.id;
//     if (selectedPlatforms.includes(id)) {
//       setSelectedPlatforms(selectedPlatforms.filter(pid => pid !== id));
//     } else {
//       setSelectedPlatforms([...selectedPlatforms, id]);
//     }
//   };
//   const searchFromAPI = async (query: string, token: string) => {
//     try {
//       setLoading(true);
//       const result = await fetchSearchMovies(query, token);
//       setFilteredItems(result?.data?.results);
 //     } catch (error) {
 //       setFilteredItems([]);
//     } finally {
//       setLoading(false);
//     }
//   };


//  const searchGroupFromApi = async (query: string, token: string) => {
//   try {
//     setLoading(true);
//     const result = await getSearchGroup(query, token);
    
//     const groups = result?.results || [];
 //     setFilteredItems(groups);
    
//   } catch (error) {
 //     setFilteredItems([]);
//   } finally {
//     setLoading(false);
//   }
// };
//   const handleToggleMute = useCallback((groupId) => {
//     const updatedGroups = groupsData.map(group =>
//       group.groupId === groupId ? { ...group, isMuted: !group.isMuted } : group
//     );
//     setGroupsData(updatedGroups);
//     // setSelectedGroup(prev => prev ? { ...prev, isMuted: !prev.isMuted } : null);
//   }, [groupsData]);


//    useEffect(() => {
//       const fetchGroups = async () => {
//         try {
//           setLoadingGroups(true);
//           const groupsRes = await getSearchGroup(token , qu); // groupsRes.results = array of groups
 //           // const enrichedGroups = await Promise.all(
//           //   groupsRes.results.map(async (group) => {
//           //     try {
//           //       const groupId = group.group_id;
//           //       const groupName = group.name;
//           //       // const members = group.members ?? []; // if members already included in API
//           //       const activities = await getGroupActivities(token, groupId);
//           //       const members = await getGroupMembers(token, groupId);
   
//           //       return {
//           //         groupId,
//           //         groupName,
//           //         isMuted: false,
//           //          members: members.results,
//           //         activities,
//           //       };
//           //     } catch (innerErr) {
 //           //       return null;
//           //     }
//           //   })
//           // );
//           // filter out nulls
//           const enrichedGroups = await Promise.all(
//             groupsRes.results.map(async (filteredItems) => {
//               const groupId = group.group_id;
//               const groupName = group.name;
  
//               let activities = [];
//               let members = [];
  
//               try {
//                 activities = await getGroupActivities(token, groupId);
//               } catch (err) {
 //               }
  
//               try {
//                 const m = await getGroupMembers(token, groupId);
//                 members = m.results;
//               } catch (err) {
 //               }
  
//               return {
//                 groupId,
//                 groupName,
//                 isMuted: false,
//                 members,
//                 activities,
//               };
//             })
//           );
//           const filteredGroups = enrichedGroups.filter(Boolean);
//           setGroupsData(filteredGroups);
 //         } catch (error) {
 //         } finally {
//           setLoadingGroups(false);
//         }
//       };
//       fetchGroups();
//     }, []);

 
//   return {
//     navigation,
//     togglePlatform,
//     isVisible, setIsVisible,
//     TooltipModal, setTooltipModal,
//     modalVisible, setModalVisible,
//     lovedImge, setlovedImge,
//     selectedPlatforms, setSelectedPlatforms,
//     stepsModal, setStepsModal,
//     loading,
//     filteredItems, setFilteredItems,
//     searchFromAPI,
//     searchGroupFromApi
//   };
// };

// export default useWoodScreen;









































// // import { useNavigation } from '@react-navigation/native';
// // import { useState } from 'react';
// // import { searchMovies as fetchSearchMovies } from '@redux/Api/movieApi';


// // const useWoodScreen = () => {
// //   const navigation = useNavigation();
 
// //   const [isVisible, setIsVisible] = useState<boolean>(false);
// //   const [TooltipModal, setTooltipModal] = useState<boolean>(true);
// //   const [modalVisible, setModalVisible] = useState<boolean>(false);
// //   const [stepsModal, setStepsModal] = useState<boolean>(false);
// //   const [lovedImge, setlovedImge] = useState<boolean>(false);
// //    const [selectedPlatforms, setSelectedPlatforms] = useState([]);

// //   const togglePlatform = (item) => {
// //     const id = item.id;
// //     const currentSelection = Array.isArray(selectedPlatforms) ? selectedPlatforms : [];
// //     if (currentSelection.includes(id)) {
// //       setSelectedPlatforms(currentSelection.filter(pid => pid !== id));
// //     } else {
// //       setSelectedPlatforms([...currentSelection, id]);

// //     }
// //   };
// //   return {
// //     navigation,
// //     togglePlatform ,
// //     isVisible, setIsVisible ,
// //     TooltipModal, setTooltipModal ,
// //     modalVisible, setModalVisible ,
// //     lovedImge, setlovedImge , 
// //     selectedPlatforms, setSelectedPlatforms,
// //     stepsModal, setStepsModal
// //   };
// // };

// // export default useWoodScreen;





