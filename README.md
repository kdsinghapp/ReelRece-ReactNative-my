# ReelRecs - AI-Powered Movie Recommendation Platform

## Overview
ReelRecs is a React Native mobile application that provides personalized movie recommendations using a unique pairwise ranking system. Users can discover, rate, and get AI-curated movie suggestions based on their preferences.

## Key Features
- 🎬 **Movie Discovery**: Browse trending movies and new releases from TMDB
- 🏆 **Pairwise Ranking**: Rank movies using an efficient binary search algorithm
- 🤝 **Social Features**: Connect with friends and share watch lists
- 📹 **Video Trailers**: Stream movie trailers with HLS adaptive bitrate (H.265/HEVC)
- 🎯 **Smart Recommendations**: AI-powered suggestions based on your taste
- 📊 **User Rankings**: Track and manage your movie preferences

## Technical Stack
- **Framework**: React Native 0.74.5
- **State Management**: Redux Toolkit with TypeScript
- **Video**: react-native-video v6.17.0 with HLS support
- **Navigation**: React Navigation v6
- **Backend**: Custom API (see REELRECS_API_DOCUMENTATION.md)
- **Platform Support**: iOS and Android

## Project Structure
```
frontend/
├── src/
│   ├── component/     # Reusable UI components
│   ├── screen/        # Application screens
│   ├── redux/         # State management
│   ├── service/       # API services
│   └── utils/         # Utilities and helpers
├── ios/              # iOS native code
├── android/          # Android native code
└── *.md             # Documentation files
```

## Getting Started

### Prerequisites
- Node.js 18+
- React Native development environment
- iOS: Xcode 15+, CocoaPods
- Android: Android Studio, JDK 17

### Installation
```bash
# Clone repository
git clone https://github.com/reelrecs/frontend.git
cd frontend

# Install dependencies
npm install

# iOS setup
cd ios && pod install && cd ..

# Start Metro bundler
npm start

# Run on iOS
npx react-native run-ios --simulator="iPhone 16 Pro"

# Run on Android
npx react-native run-android
```

### Environment Setup
Create `.env` file:
```
API_BASE_URL=your_api_url_here
TMDB_API_KEY=your_tmdb_key_here
```

## Current Branch
- **Working Branch**: `wmg/test`
- **Main Branch**: `main`
- All development happens on `wmg/test` before merging to main

## Documentation

### For New Developers/LLMs
1. **Start Here**: [START_HERE_LLM_INSTRUCTIONS.md](START_HERE_LLM_INSTRUCTIONS.md)
2. **Documentation Index**: [docs/DOCUMENTATION_INDEX.md](docs/DOCUMENTATION_INDEX.md)
3. **Project Context**: [docs/architecture/COMPLETE_PROJECT_CONTEXT.md](docs/architecture/COMPLETE_PROJECT_CONTEXT.md)
4. **Codebase Audit**: [docs/architecture/COMPREHENSIVE_CODEBASE_AUDIT.md](docs/architecture/COMPREHENSIVE_CODEBASE_AUDIT.md)

### Technical References
- [docs/architecture/CODEBASE_MAP.md](docs/architecture/CODEBASE_MAP.md) - File structure and navigation
- [docs/api/REELRECS_API_DOCUMENTATION.md](docs/api/REELRECS_API_DOCUMENTATION.md) - Backend API reference
- [docs/features/video/iOS_HLS_H265_IMPLEMENTATION_GUIDE.md](docs/features/video/iOS_HLS_H265_IMPLEMENTATION_GUIDE.md) - Video implementation
- [docs/features/ranking/BINARY_SEARCH_IMPLEMENTATION.md](docs/features/ranking/BINARY_SEARCH_IMPLEMENTATION.md) - Ranking algorithm
- [docs/reference/MASTER_CONSOLIDATED_DOCUMENTATION.md](docs/reference/MASTER_CONSOLIDATED_DOCUMENTATION.md) - Complete reference

### Development Guides
- [docs/guides/DEBUGGING_GUIDE.md](docs/guides/DEBUGGING_GUIDE.md) - Debugging tools and techniques
- [docs/guides/COMMON_PITFALLS.md](docs/guides/COMMON_PITFALLS.md) - Known issues and solutions
- [docs/guides/ENHANCED_LOGGING_SUMMARY.md](docs/guides/ENHANCED_LOGGING_SUMMARY.md) - Logging system

## Known Issues
- Pairwise ranking has minor state synchronization issues
- Limited test coverage (working on improvements)
- Type safety improvements needed in some areas

## Recent Updates
- ✅ Fixed H.265/HEVC video playback on iOS
- ✅ Resolved authentication token management
- ✅ Fixed pairwise ranking API integration
- ✅ Upgraded to react-native-video v6.17.0
- ✅ Improved error handling and logging

## Platform Compatibility
- **iOS**: 13.0+
- **Android**: API 23+ (Android 6.0)
- **React Native**: 0.74.5

## Contributing
This is a private repository. Contact the team for access.

## License
Proprietary - All rights reserved

## Support
For issues or questions, refer to the documentation or contact the development team.

---
*Last Updated: November 2024*
