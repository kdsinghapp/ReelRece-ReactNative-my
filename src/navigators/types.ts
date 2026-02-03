import { NavigatorScreenParams } from '@react-navigation/native';

export type TabParamList = {
  Home: undefined;
  Discover: undefined;
  Watch: undefined;
  Ranking: undefined;
  Profile: undefined;
};

export type RootStackParamList = {
  TabNavigator: NavigatorScreenParams<TabParamList>;
  MovieDetail: { movieId: string; title?: string };
  MovieDetailScreen: { imdb_idData: string; token: string };
  OtherProfile: { userId: string; username?: string };
  RankingTab: { openTooltipModal?: boolean };
  WatchScreen: { getAllGroupReferace?: number };
  Settings: undefined;
  EditProfile: undefined;
  Login: undefined;
  Signup: undefined;
  Welcome: undefined;
  AddUsername: undefined;
  EmailVerify: { email: string };
  PasswordReset: undefined;
  NewPassword: { email: string; otp: string };
};

export type AuthStackParamList = {
  Welcome: undefined;
  Login: undefined;
  Signup: undefined;
  AddUsername: undefined;
  EmailVerify: { email: string };
  PasswordReset: undefined;
  NewPassword: { email: string; otp: string };
};