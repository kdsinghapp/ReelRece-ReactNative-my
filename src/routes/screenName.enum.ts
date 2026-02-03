/**
 * Screen Name Enumeration
 * 
 * Centralized enum for all navigation screen names in the app.
 * Organized by feature area for better maintainability.
 * 
 * Last cleaned: January 2026
 * - Removed: OtpScreen, CreatePassword, Profile, AddService, AddDocument (unused/deprecated)
 * 
 * @see /src/navigators for stack navigator definitions
 * @see /src/routes/routes.ts for route configurations
 */

enum ScreenNameEnum {
  // ============================================
  // AUTH & ONBOARDING SCREENS
  // ============================================
  /** Welcome/Splash screen */
  WELCOME = 'Welcome',
  
  /** Main onboarding flow (step 1) */
  OnboardingScreen = "OnboardingScreen",
  
  /** Onboarding step 2 */
  OnboardingScreen2 = "OnboardingScreen2",
  
  /** User login */
  LoginScreen = "LoginScreen",
  
  /** User registration */
  SignUpScreen = "SignUpScreen",
  
  /** Username selection during signup */
  AddUsername = "AddUsername",
  
  /** Email verification (OTP) */
  EmailVerify = "EmailVerify",
  
  /** Password reset flow - email input */
  PasswordReset = "PasswordReset",
  
  /** Password reset flow - new password */
  NewPassword = "NewPassword",

  // ============================================
  // MAIN NAVIGATION
  // ============================================
  /** Main tab navigator container */
  TabNavigator = "TabNavigator",
  
  /** Home feed tab (bottom tab) */
  FeedTab = "FeedTab",
  
  /** Discover movies tab (bottom tab) */
  DiscoverTab = "DiscoverTab",
  
  /** Ranking/recommendations tab (bottom tab) */
  RankingTab = "RankingTab",
  
  /** Watch together tab (bottom tab) */
  WatchTab = "WatchTab",
  
  /** User profile tab (bottom tab) */
  ProfileTab = "ProfileTab",

  // ============================================
  // HOME/FEED SCREENS
  // ============================================
  /** Main home feed screen */
  HOME_SCREEN = "HOME_SCREEN",
  
  /** User notifications */
  Notification = "Notification",
  
  /** Other user's profile view */
  OtherProfile = "OtherProfile",
  
  /** Other user's "Taing" (watching) profile */
  OtherTaingPrfofile = "OtherTaingPrfofile",
  
  /** Other user's "Want to watch" profile */
  OtherWantPrfofile = "OtherWantPrfofile",
  
  /** List of users who watched/saved a movie */
  WatchSaveUser = "WatchSaveUser",
  
  /** Followers/following list */
  Followers = "Followers",

  // ============================================
  // DISCOVER/MOVIE SCREENS
  // ============================================
  /** Main discover/search screen */
  DiscoverScreen = "DiscoverScreen",
  
  /** Detailed movie information */
  MovieDetailScreen = "MovieDetailScreen",
  
  /** Movie detail from search results */
  SearchMovieDetail = 'SearchMovieDetail',
  
  /** YouTube trailer player */
  YoutubePlayerScreen = 'YoutubePlayerScreen',

  // ============================================
  // RANKING SCREENS
  // ============================================
  /** Main ranking screen */
  RankingScreen = "RankingScreen",
  
  /** Woods algorithm movie recommendations */
  WoodsScreen = "WoodsScreen",

  // ============================================
  // WATCH TOGETHER SCREENS
  // ============================================
  /** Main watch together screen */
  WatchScreen = "WatchScreen",
  
  /** Watch with friends flow */
  WatchWithFrind = "WatchWithFrind",
  
  /** Create new watch group */
  CreateGroupScreen = "CreateGroupScreen",
  
  /** Search for watch groups */
  GroupSearch = "GroupSearch",

  // ============================================
  // PROFILE & SETTINGS SCREENS
  // ============================================
  /** User's own profile */
  ProfileScreen = "ProfileScreen",
  
  /** Edit user profile */
  EditProfile = "EditProfile",
  
  /** Main settings menu */
  MainSetting = "MainSetting",
  
  /** Account settings */
  AccountSetting = "AccountSetting",
  
  /** Playback preferences */
  PlaybackSetting = "PlaybackSetting",
  
  /** Privacy settings */
  PrivacySetting = "PrivacySetting",
  
  /** Help & support settings */
  HelpSetting = "HelpSetting",
  
  /** Help message/contact form */
  HelpMessage = "HelpMessage",
  
  /** Change password in settings */
  ChangePassSetting = "ChangePassSetting",
  
  /** Logout confirmation */
  SettingLogOut = "SettingLogOut",
  
  /** Streaming service preferences */
  StreamService = "StreamService",
  
  /** Feature request form */
  FeatureRequest = "FeatureRequest",
}

export default ScreenNameEnum;
