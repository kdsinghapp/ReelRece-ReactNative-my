#import <React/RCTViewManager.h>
#import <React/RCTBridgeModule.h>
#import <React/RCTEventDispatcher.h>

// Tell RN there is a module named AVPlayerViewManager (Swift side)
@interface RCT_EXTERN_MODULE(AVPlayerViewManager, RCTViewManager)

// Export view props (match Swift @objc properties)
RCT_EXPORT_VIEW_PROPERTY(source, NSDictionary)
RCT_EXPORT_VIEW_PROPERTY(paused, BOOL)
RCT_EXPORT_VIEW_PROPERTY(muted, BOOL)
RCT_EXPORT_VIEW_PROPERTY(volume, float)
RCT_EXPORT_VIEW_PROPERTY(seekTo, double)
RCT_EXPORT_VIEW_PROPERTY(resizeMode, NSString)
RCT_EXPORT_VIEW_PROPERTY(controls, BOOL)

// Export events (callbacks)
RCT_EXPORT_VIEW_PROPERTY(onVideoLoad, RCTDirectEventBlock)
RCT_EXPORT_VIEW_PROPERTY(onVideoError, RCTDirectEventBlock)
RCT_EXPORT_VIEW_PROPERTY(onVideoEnd, RCTDirectEventBlock)
RCT_EXPORT_VIEW_PROPERTY(onPlaybackStatus, RCTDirectEventBlock)
RCT_EXPORT_VIEW_PROPERTY(onVideoBuffer, RCTDirectEventBlock)
RCT_EXPORT_VIEW_PROPERTY(onVideoProgress, RCTDirectEventBlock)

// Export commands (methods)
RCT_EXTERN_METHOD(play:(nonnull NSNumber *)node)
RCT_EXTERN_METHOD(pause:(nonnull NSNumber *)node)
RCT_EXTERN_METHOD(seek:(nonnull NSNumber *)node position:(double)position)
RCT_EXTERN_METHOD(stop:(nonnull NSNumber *)node)
RCT_EXTERN_METHOD(setVolume:(nonnull NSNumber *)node volume:(float)volume)

@end
