import { useRef, useState, useEffect, useCallback } from 'react';
import { FlatList, ScrollView } from 'react-native';

interface UseNestedScrollProps {
  flatListRef: React.RefObject<FlatList>;
  currentIndex: number;
  movieData: object[];
}

interface UseNestedScrollReturn {
  // Refs
  scrollRef: React.RefObject<ScrollView>;
  descriptionScrollRef: React.RefObject<ScrollView>;
  outerScrollEnabled: React.MutableRefObject<boolean>;
  
  // State values
  wholeContentHeight: number;
  visibleContentHeight: number;
  scrollIndicatorHeight: number;
  scrollIndicatorPosition: number;
  isScrollingDescription: boolean;
  
  // Handlers
  handleContentSizeChange: (contentWidth: number, contentHeight: number) => void;
  handleLayout: (event: { nativeEvent: { layout: { height: number } } }) => void;
  handleScroll: (event: { nativeEvent: { contentOffset: { y: number } } }) => void;
  setOuterScrollEnabled: (val: boolean) => void;
  enableOuterScroll: () => void;
  disableOuterScroll: () => void;
  
  // Inner scroll handlers for description
  onDescriptionTouchStart: () => void;
  onDescriptionTouchEnd: () => void;
  onDescriptionScrollBeginDrag: () => void;
  onDescriptionMomentumScrollEnd: () => void;
}

export const useNestedScroll = ({
  flatListRef,
  currentIndex,
  movieData,
}: UseNestedScrollProps): UseNestedScrollReturn => {
  // Refs
  const scrollRef = useRef<ScrollView>(null);
  const descriptionScrollRef = useRef<ScrollView>(null);
  const outerScrollEnabled = useRef(true);
  const descriptionScrollOffset = useRef(0);
  
  // State
  const [wholeContentHeight, setWholeContentHeight] = useState(1);
  const [visibleContentHeight, setVisibleContentHeight] = useState(0);
  const [scrollIndicatorHeight, setScrollIndicatorHeight] = useState(0);
  const [scrollIndicatorPosition, setScrollIndicatorPosition] = useState(0);
  const [isScrollingDescription, setIsScrollingDescription] = useState(false);

  // Update FlatList scroll enabled state
  const updateFlatListScrollEnabled = useCallback((enabled: boolean) => {
    outerScrollEnabled.current = enabled;
    flatListRef.current?.setNativeProps({
      scrollEnabled: enabled
    });
  }, [flatListRef]);

  // Set outer scroll enabled
  const setOuterScrollEnabled = useCallback((val: boolean) => {
    updateFlatListScrollEnabled(val);
  }, [updateFlatListScrollEnabled]);

  // Enable outer scroll
  const enableOuterScroll = useCallback(() => {
    updateFlatListScrollEnabled(true);
  }, [updateFlatListScrollEnabled]);

  // Disable outer scroll
  const disableOuterScroll = useCallback(() => {
    updateFlatListScrollEnabled(false);
  }, [updateFlatListScrollEnabled]);

  // Content size change handler -> total content height
  const handleContentSizeChange = useCallback((contentWidth: number, contentHeight: number) => {
    setWholeContentHeight(contentHeight || 1);
  }, []);

  // Layout handler -> visible area height
  const handleLayout = useCallback(({ nativeEvent: { layout: { height } } }: { nativeEvent: { layout: { height: number } } }) => {
    setVisibleContentHeight(height || 0);
  }, []);

  // Scroll handler -> update indicator position
  const handleScroll = useCallback(({ nativeEvent: { contentOffset: { y } } }: { nativeEvent: { contentOffset: { y: number } } }) => {
    const scrollableHeight = Math.max(0, wholeContentHeight - visibleContentHeight);
    const indicatorScrollableHeight = Math.max(0, visibleContentHeight - scrollIndicatorHeight);
    const position = scrollableHeight > 0 
      ? (y / scrollableHeight) * indicatorScrollableHeight 
      : 0;
    setScrollIndicatorPosition(position);
    descriptionScrollOffset.current = y;
  }, [wholeContentHeight, visibleContentHeight, scrollIndicatorHeight]);

  // Description scroll touch handlers
  const onDescriptionTouchStart = useCallback(() => {
    setIsScrollingDescription(true);
    disableOuterScroll();
  }, [disableOuterScroll]);

  const onDescriptionTouchEnd = useCallback(() => {
    setIsScrollingDescription(false);
    enableOuterScroll();
  }, [enableOuterScroll]);

  const onDescriptionScrollBeginDrag = useCallback(() => {
    setIsScrollingDescription(true);
    disableOuterScroll();
  }, [disableOuterScroll]);

  const onDescriptionMomentumScrollEnd = useCallback(() => {
    setIsScrollingDescription(false);
    enableOuterScroll();
  }, [enableOuterScroll]);

  // Calculate indicator height whenever sizes change
  useEffect(() => {
    if (wholeContentHeight > 0 && visibleContentHeight > 0) {
      const ratio = visibleContentHeight / wholeContentHeight;
      const clampedRatio = Math.min(1, ratio);
      const minIndicatorHeight = 20;
      const calcHeight = Math.max(
        visibleContentHeight * clampedRatio,
        Math.min(minIndicatorHeight, visibleContentHeight)
      );
      setScrollIndicatorHeight(calcHeight);
    }
  }, [wholeContentHeight, visibleContentHeight, currentIndex, movieData]);

  // Initial setup
  useEffect(() => {
    flatListRef.current?.setNativeProps({
      scrollEnabled: outerScrollEnabled.current
    });
  }, [flatListRef]);

  return {
    // Refs
    scrollRef,
    descriptionScrollRef,
    outerScrollEnabled,
    
    // State values
    wholeContentHeight,
    visibleContentHeight,
    scrollIndicatorHeight,
    scrollIndicatorPosition,
    isScrollingDescription,
    
    // Handlers
    handleContentSizeChange,
    handleLayout,
    handleScroll,
    setOuterScrollEnabled,
    enableOuterScroll,
    disableOuterScroll,
    
    // Inner scroll handlers
    onDescriptionTouchStart,
    onDescriptionTouchEnd,
    onDescriptionScrollBeginDrag,
    onDescriptionMomentumScrollEnd,
  };
};

export default useNestedScroll;
