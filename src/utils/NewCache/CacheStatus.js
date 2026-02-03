// Cache status display component
const CacheStatus = () => {
  const [cacheInfo, setCacheInfo] = useState(null);

  useEffect(() => {
    const updateCacheInfo = async () => {
      const info = await ReactNativeVideoCacheManager.getCacheInfo();
      setCacheInfo(info);
    };

    updateCacheInfo();
    const interval = setInterval(updateCacheInfo, 10000); // Every 10 seconds

    return () => clearInterval(interval);
  }, []);

  if (!cacheInfo) return null;

  return (
    <View style={styles.cacheStatus}>
      <Text style={styles.cacheText}>
        Video Cache: {Math.round(cacheInfo.size / 1024 / 1024)}MB / {cacheInfo.fileCount} files
      </Text>
      {cacheInfo.status === 'NEEDS_CLEANUP' && (
        <Text style={styles.cacheWarning}>⚠️ Cache cleanup needed</Text>
      )}
    </View>
  );
};