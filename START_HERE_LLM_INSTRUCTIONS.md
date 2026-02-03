# 🚀 START HERE - LLM/Developer Onboarding Guide
## Essential Instructions for Working on ReelRecs
### Last Updated: November 2024

---

## 🎯 Welcome to ReelRecs

You are about to work on the **ReelRecs** React Native application - an AI-powered movie recommendation platform. This document is your **primary starting point**. Read this first, then follow the documentation hierarchy below.

---

## 📋 Documentation Reading Order

### Phase 1: Understanding the Project (30 minutes)
1. **THIS FILE** - You are here
2. **[README.md](README.md)** - Project overview and setup
3. **[docs/DOCUMENTATION_INDEX.md](docs/DOCUMENTATION_INDEX.md)** - Complete documentation guide
4. **[docs/architecture/COMPLETE_PROJECT_CONTEXT.md](docs/architecture/COMPLETE_PROJECT_CONTEXT.md)** - Full project understanding
5. **[docs/architecture/COMPREHENSIVE_CODEBASE_AUDIT.md](docs/architecture/COMPREHENSIVE_CODEBASE_AUDIT.md)** - Technical deep dive

### Phase 2: Technical Implementation (45 minutes)
6. **[docs/architecture/CODEBASE_MAP.md](docs/architecture/CODEBASE_MAP.md)** - Navigation guide
7. **[docs/api/REELRECS_API_DOCUMENTATION.md](docs/api/REELRECS_API_DOCUMENTATION.md)** - Backend API reference
8. **[docs/features/ranking/BINARY_SEARCH_IMPLEMENTATION.md](docs/features/ranking/BINARY_SEARCH_IMPLEMENTATION.md)** - Core ranking algorithm
9. **[docs/features/video/iOS_HLS_H265_IMPLEMENTATION_GUIDE.md](docs/features/video/iOS_HLS_H265_IMPLEMENTATION_GUIDE.md)** - Video streaming setup

### Phase 3: Development Practices (15 minutes)
10. **[docs/guides/DEBUGGING_GUIDE.md](docs/guides/DEBUGGING_GUIDE.md)** - Debugging tools
11. **[docs/guides/COMMON_PITFALLS.md](docs/guides/COMMON_PITFALLS.md)** - Known issues
12. **[docs/guides/ENHANCED_LOGGING_SUMMARY.md](docs/guides/ENHANCED_LOGGING_SUMMARY.md)** - Logging system

### Phase 4: Reference Documents (As needed)
13. **[docs/reference/MASTER_CONSOLIDATED_DOCUMENTATION.md](docs/reference/MASTER_CONSOLIDATED_DOCUMENTATION.md)** - Complete reference
14. **[docs/features/ranking/PAIRWISE_RANKING_ANALYSIS.md](docs/features/ranking/PAIRWISE_RANKING_ANALYSIS.md)** - Ranking system details
15. **[docs/features/ranking/PAIRWISE_RANKING_FIX_COMPLETE.md](docs/features/ranking/PAIRWISE_RANKING_FIX_COMPLETE.md)** - Recent fixes
16. **[docs/features/ranking/USER_MOVIE_RANKINGS.md](docs/features/ranking/USER_MOVIE_RANKINGS.md)** - Ranking feature guide

---

## 🏗️ Project Architecture

### Tech Stack
```
Frontend:
├── React Native 0.74.5
├── TypeScript
├── Redux Toolkit
├── React Navigation v6
└── react-native-video v6.17.0

Backend:
├── Custom API (Python/FastAPI assumed)
├── PostgreSQL database
└── S3 for video storage
```

### Key Features
1. **Movie Discovery** - Browse and search movies from TMDB
2. **Pairwise Ranking** - Binary search algorithm for preference ranking
3. **Video Streaming** - HLS adaptive bitrate with H.265/HEVC
4. **Social Features** - Friends and watch groups
5. **AI Recommendations** - Personalized suggestions

---

## ✅ Current Project Status

### What's Working Well
- ✅ H.265/HEVC video playback on iOS (recently fixed)
- ✅ Authentication and token management
- ✅ Pairwise ranking API integration
- ✅ Movie discovery and search
- ✅ User profile management
- ✅ Friends system
- ✅ Redux state management
- ✅ Cross-platform compatibility (iOS & Android)

### Known Issues (Minor)
- ⚠️ Pairwise ranking has minor state sync issues
- ⚠️ Limited test coverage (0% currently)
- ⚠️ Some TypeScript type improvements needed
- ⚠️ Memory management could be optimized

### Recent Achievements
1. **Fixed H.265 Video Playback** - S3 permissions and iOS configuration
2. **Resolved Token Management** - GlobalToken initialization
3. **Fixed Pairwise Ranking** - Correct API endpoints and parameters
4. **Upgraded Dependencies** - react-native-video v6.17.0

---

## 🛠️ Essential Development Commands

### Running the App
```bash
# Start Metro bundler
npx react-native start --reset-cache

# iOS (recommended simulator)
npx react-native run-ios --simulator="iPhone 16 Pro"

# Android
npx react-native run-android

# Clean iOS build
cd ios && rm -rf ~/Library/Developer/Xcode/DerivedData && pod install
```

### Git Workflow
```bash
# Current working branch
git checkout wmg/test

# Check status
git status

# Commit with message
git add -A
git commit -m "feat: description"
git push origin wmg/test
```

### Debugging
```bash
# View iOS logs
tail -f ~/Library/Developer/CoreSimulator/Devices/*/data/Containers/Data/Application/*/Documents/app_debug_logs.txt

# React Native debugger
npx react-devtools

# Clear all caches
watchman watch-del-all && rm -rf node_modules && npm install
```

---

## 🔑 Critical Files to Know

1. **Entry Point**: `index.js` → `App.tsx`
2. **Main Navigation**: `src/navigation/AppNavigator.js`
3. **Redux Store**: `src/redux/store.ts`
4. **API Service**: `src/service/api.tsx`
5. **Video Player**: `src/component/card/feedCard/FeedCard.tsx`

---

## 🎥 Video Implementation Key Points

### iOS H.265/HEVC Requirements
```javascript
// Critical iOS settings for H.265
<Video
  preferredForwardBufferDuration={5}  // MUST be > 0
  maxBitRate={8000000}  // 8 Mbps minimum
  // ... other props
/>
```

### Video File Structure
```
S3_BUCKET/videos/tt[imdbId]/
├── tt[imdbId].m3u8  // Master playlist
├── init_v0.mp4      // Init segments (critical)
├── seg_v0_00001.m4s // fMP4 segments
└── stream_v0.m3u8   // Variant playlists
```

**Remember**: Files must be publicly accessible in S3!

---

## 🚨 Platform Compatibility Requirements

### CRITICAL: Always Maintain Cross-Platform Support
- **Every change must work on BOTH iOS and Android**
- Test on both platforms before committing
- Use platform-specific code only when necessary:
  ```javascript
  import { Platform } from 'react-native';

  const setting = Platform.select({
    ios: iosSpecificValue,
    android: androidSpecificValue,
  });
  ```

### Minimum Versions
- iOS: 13.0+
- Android: API 23+ (6.0 Marshmallow)
- React Native: 0.74.5

---

## 📝 Code Style Guidelines

### TypeScript
- Use proper types, avoid `any`
- Define interfaces for all data structures
- Use enums for constants

### React Native
- Functional components with hooks
- Proper error boundaries
- Memoize expensive computations
- Clean up effects and subscriptions

### State Management
- Use Redux Toolkit slices
- Normalize state shape
- Use selectors for derived state
- Async logic in thunks

---

## 🐛 Debugging Tips

1. **Use FileLogger** for persistent logs:
   ```javascript
   import { fileLogger } from '../utils/FileLogger';
   fileLogger.info('[Component] Event', { data });
   ```

2. **Check Platform-Specific Issues**:
   - iOS Simulator doesn't support H.265
   - Android needs different buffer configs
   - Test on real devices when possible

3. **Common React Native Issues**:
   - All text must be in `<Text>` components
   - No JSX comments in render methods
   - State updates are asynchronous
   - Check for stale closures

---

## 🎯 Your Mission

As an LLM or developer working on this project:

### Immediate Priorities
1. **Maintain cross-platform compatibility** - Every change must work on iOS AND Android
2. **Preserve video playback functionality** - Don't break H.265 support
3. **Keep authentication working** - Token management is critical
4. **Test thoroughly** - The app is in production use

### Guidelines
- **Read the logs** before making assumptions
- **Test on both platforms** before claiming success
- **Document significant changes** in commit messages
- **Use existing patterns** found in the codebase
- **Ask for clarification** when requirements are unclear

### Communication Style
- Be precise and technical
- Provide evidence for claims
- Admit uncertainty when unsure
- Test before declaring success
- Document your reasoning

---

## 📚 Quick Reference Links

### External Resources
- [React Native Docs](https://reactnative.dev/docs)
- [React Navigation](https://reactnavigation.org/)
- [Redux Toolkit](https://redux-toolkit.js.org/)
- [TMDB API](https://developers.themoviedb.org/3)

### Internal APIs
- Authentication: `/login`, `/logout`, `/refresh-token`
- Movies: `/movies`, `/search`, `/trending`
- Rankings: `/record-pairwise-decision`, `/calculate-movie-rating`
- User: `/profile`, `/friends`, `/watchlist`

---

## 🏁 Getting Started Checklist

- [ ] Read all Phase 1 documentation
- [ ] Set up development environment
- [ ] Run the app on iOS simulator
- [ ] Run the app on Android emulator
- [ ] Review recent commits in wmg/test branch
- [ ] Familiarize with Redux DevTools
- [ ] Test video playback functionality
- [ ] Review API documentation
- [ ] Understand the pairwise ranking system
- [ ] Check FileLogger output

---

## 💡 Pro Tips

1. **Branch Strategy**: Always work on `wmg/test`, never directly on `main`
2. **Video Issues**: Check S3 permissions first, iOS settings second
3. **State Issues**: Use Redux DevTools to track state changes
4. **API Errors**: Check network tab and GlobalToken initialization
5. **Build Issues**: Clear caches and DerivedData on iOS
6. **Performance**: Use React.memo and useMemo appropriately
7. **Testing**: Test on real devices for video features

---

## 🆘 When You're Stuck

1. Check the relevant documentation file
2. Review recent commits for similar changes
3. Search the codebase for similar patterns
4. Check logs (FileLogger and console)
5. Test on both platforms
6. Document findings for future reference

---

**Remember**: The goal is to maintain a stable, cross-platform application that provides an excellent movie discovery experience. Every change should enhance, not compromise, the existing functionality.

Good luck, and happy coding! 🎬

---

*Document Version: 2.0*
*Updated for current project state without historical bug references*