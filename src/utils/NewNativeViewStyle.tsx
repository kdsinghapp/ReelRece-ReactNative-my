import { Dimensions, StyleSheet } from "react-native";
const windowHeight = Dimensions.get('window').height
export const styles = StyleSheet.create({
  container: {
    backgroundColor: 'black',
    borderRadius: 0,
    overflow: 'hidden',
  },
  videoContainer: {
    position: 'relative',
    backgroundColor: 'black',
  },
  video: {
    width: '100%',
    height: windowHeight / 3.9, // Default height, can be overridden by style prop
    backgroundColor: 'black',
  },
  statusBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 8,
    paddingHorizontal: 12,
  },
  statusLeft: {
    flex: 1,
  },
  statusRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  statusSubText: {
    color: 'white',
    fontSize: 10,
    opacity: 0.9,
  },
  preloadButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  preloadText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  clearButton: {
    backgroundColor: 'rgba(255,0,0,0.3)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  clearText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingOverlayText: {
    color: 'white',
    marginTop: 8,
    fontSize: 14,
  },
  loadingText: {
    color: 'white',
    marginTop: 8,
    fontSize: 14,
  },
  debugButton: {
    padding: 4,
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
  },
  debugText: {
    color: '#666',
    fontSize: 10,
  },
  unsupportedContainer: {
    height: windowHeight / 3.9,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
  },
  unsupportedText: {
    color: '#666',
    fontSize: 14,
  },
   poster: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 9999,
    
  },
});
