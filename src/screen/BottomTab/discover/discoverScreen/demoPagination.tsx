import { t } from 'i18next';
import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  StyleSheet,
   Button,
  RefreshControl,
} from 'react-native';

const TabPaginationScreen = () => {
  // State (same as before)
  const [items, setItems] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Refs
  const isFetchingRef = useRef(false);
  const flatListRef = useRef<FlatList>(null);

  // Mock API
  const mockApiCall = useCallback((page: number) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const data = Array.from({ length: 10 }, (_, i) => ({
          id: `item-${page}-${i}`,
          title: `Item ${(page - 1) * 10 + i + 1}`,
        }));

        resolve({
          items: data,
          currentPage: page,
          totalPages: 5,
          hasMore: page < 5,
        });
      }, 1000);
    });
  }, []);

  // Initial load
  useEffect(() => {
    loadData(1, true);
  }, []);

  const loadData = async (page: number, reset: boolean = false) => {
    if (isFetchingRef.current) return;

    if (reset) {
      setLoading(true);
    } else {
      setLoadingMore(true);
    }

    isFetchingRef.current = true;

    try {
      const response = await mockApiCall(page);

      if (reset) {
        setItems(response.items);
      } else {
        setItems(prev => [...prev, ...response.items]);
      }

      setCurrentPage(response.currentPage);
      setHasMore(response.hasMore);
    } catch (err) {
    } finally {
      setLoading(false);
      setLoadingMore(false);
      isFetchingRef.current = false;
    }
  };

  const handleEndReached = () => {
    if (!loadingMore && hasMore && !isFetchingRef.current) {
      loadData(currentPage + 1, false);
    }
  };

  const handleRefresh = () => {
    loadData(1, true);
  };

  const renderItem = ({ item }: { item: object | string | number }) => (
    <View style={styles.item}>
      <Text style={styles.itemText}>{item?.title}</Text>
    </View>
  );

  const renderFooter = () => {
    if (loadingMore) {
      return (
        <View style={styles.footer}>
          <ActivityIndicator size="small" color="#007AFF" />
          <Text style={styles.footerText}>{t("discover.loading")}</Text>
        </View>
      );
    }

    if (!hasMore && items.length > 0) {
      return (
        <View style={styles.footer}>
          <Text style={styles.endText}>{t("discover.alloaded")} {items.length}</Text>
        </View>
      );
    }

    return null;
  };

  // ✅ IMPORTANT: Yeh fixed height wala solution use karein
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t("discover.dis_cover")}</Text>
      </View>

      {/* Main Content */}
      <View style={styles.contentContainer}>
        {loading && items.length === 0 ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#007AFF" />
            <Text>{t("discover.loading")}</Text>
          </View>
        ) : (
          <FlatList
            ref={flatListRef}
            data={items}
            renderItem={renderItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            onEndReached={handleEndReached}
            onEndReachedThreshold={0.3}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={handleRefresh}
              />
            }
            ListFooterComponent={renderFooter}
            // ✅ Performance optimizations
            initialNumToRender={10}
            maxToRenderPerBatch={10}
            windowSize={5}
            removeClippedSubviews={true}
            // ✅ Extra data for re-renders
            extraData={{ loadingMore, hasMore }}
          />
        )}
      </View>

      {/* Bottom Controls */}
      <View style={styles.bottomControls}>
        <Button
          title={t("discover.load")}

          onPress={() => loadData(currentPage + 1, false)}
          disabled={loadingMore || !hasMore}
        />
        <Button
          title={t("discover.reset")}
          onPress={() => loadData(1, true)}
          color="#FF3B30"
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  // ✅ FIXED: Proper container styling for bottom tab
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    padding: 16,
    backgroundColor: '#007AFF',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
  },
  // ✅ FIXED: Content container with flex: 1
  contentContainer: {
    flex: 1, // This is KEY for bottom tab navigation
  },
  listContent: {
    padding: 16,
    paddingBottom: 80, // Space for bottom controls
    flexGrow: 1, // Important for empty states
  },
  item: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    backgroundColor: 'white',
    marginBottom: 8,
    borderRadius: 8,
  },
  itemText: {
    fontSize: 16,
  },
  footer: {
    padding: 20,
    alignItems: 'center',
  },
  footerText: {
    marginLeft: 10,
    fontSize: 14,
    color: '#666',
  },
  endText: {
    fontSize: 14,
    color: '#666',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bottomControls: {
    padding: 16,
    backgroundColor: '#f8f8f8',
    borderTopWidth: 1,
    borderTopColor: '#ddd',
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
});

export default TabPaginationScreen;