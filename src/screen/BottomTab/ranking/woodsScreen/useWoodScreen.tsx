
import { useNavigation, useRoute } from '@react-navigation/native';
import { useCallback, useEffect, useRef, useState } from 'react';
import { searchMovies as fetchSearchMovies } from '@redux/Api/movieApi';
import { useSelector } from 'react-redux';
import { RootState } from '@redux/store';
import { getGroupActivities, getGroupMembers, getSearchGroup } from '@redux/Api/GroupApi';

const useWoodScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
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

  /** When opened with type 'group', use the group list passed from WatchScreen */
  useEffect(() => {
    const params = route?.params as { type?: string; groupsData?: unknown[] } | undefined;
    if (params?.type === 'group' && Array.isArray(params?.groupsData)) {
      setGroupsData(params.groupsData);
      setLoadingGroups(false);
    }
  }, [route?.params]); 
  const [loadingMore, setLoadingMore] = useState(false); ;
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  /** Ignore responses for older queries so only the latest search updates the list (fixes jumping data). */
  const latestSearchQueryRef = useRef('');

  const togglePlatform = useCallback((item: string | object) => {
    const id = (item as { id?: string })?.id;
    if (id == null) return;
    setSelectedPlatforms(prev =>
      (prev as string[]).includes(id) ? (prev as string[]).filter(pid => pid !== id) : [...(prev as string[]), id]
    );
  }, []);
 
  const searchFromAPI = useCallback(async (query: string, authToken: string, page: number = 1, replace: boolean = false) => {
    if (!query?.trim()) return;
    const normalizedQuery = query.toLowerCase().trim();
    if (page === 1) latestSearchQueryRef.current = normalizedQuery;

    try {
      if (page === 1 || replace) {
        setLoading(true);
        if (page === 1) setCurrentPage(1);
      } else {
        setLoadingMore(true);
      }

      const result = await fetchSearchMovies(query, authToken, page);
      const newResults = result?.data?.results ?? [];

      if (latestSearchQueryRef.current !== normalizedQuery) return;

      setFilteredItems(prev =>
        page === 1 || replace ? newResults : [...(Array.isArray(prev) ? prev : []), ...newResults]
      );
      setTotalPages(result?.data?.total_pages ?? 1);
      setCurrentPage(page);
    } catch (error) {
      if (latestSearchQueryRef.current === normalizedQuery && (page === 1 || replace)) {
        setFilteredItems([]);
      }
    } finally {
      if (latestSearchQueryRef.current === normalizedQuery) {
        setLoading(false);
        setLoadingMore(false);
      }
    }
  }, []);

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
    loadingGroups,
    loadingMore,
    currentPage,
    totalPages,
    setCurrentPage,
  };
};

export default useWoodScreen;
