 import imageIndex from "@assets/imageIndex";
import DiscoverTab from "@navigators/DiscoverTab";
import FeedTab from "@navigators/FeedTab";
import ProfileTab from "@navigators/ProfileTab";
import RankingTab from "@navigators/RankingTab";
import TabNavigator from "@navigators/TabNavigator";
import WatchTab from "@navigators/WatchTab";
import AddUsername from "@screens/Auth/addUsername/AddUsername";
import EmailVerify from "@screens/Auth/addUsername/EmailVerify";
// import AddUsername from "@screens/Auth/addUsername/AddUsername";
// import AddUsername from "@screens/Auth/AddUsername/AddUsername";
// import EmailVerify from "@screens/Auth/addUsername/EmailVerify";
import Login from "@screens/Auth/login/Login";
import OnboardingScreen from "@screens/Auth/onboardingScreen/OnboardingScreen";
import OnboardingStepTwo from "@screens/Auth/onboardingScreen/OnboardingStepTwo";
import NewPassword from "@screens/Auth/passwordReset/NewPassword";
import PasswordReset from "@screens/Auth/passwordReset/PasswordReset";
import Signup from "@screens/Auth/signup/Signup";
import Welcome from "@screens/Auth/welcome/Welcome";
import Notification from "@screens/BottomTab/home/homeScreen/Notification/Notification";
import StreamService from "@screens/BottomTab/profile/setting/StreamService";
import WoodsScreen from "@screens/BottomTab/ranking/woodsScreen/WoodsScreen";
import CreateGroupScreen from "@screens/BottomTab/watch/watchScreen/CreateGroupScreen";
import WatchScreen from "@screens/BottomTab/watch/watchScreen/WatchScreen";
import ScreenNameEnum from "@routes/screenName.enum";


const _routes = () => {

  return {
    REGISTRATION_ROUTE: [
      { name: ScreenNameEnum.WELCOME, Component: Welcome },
       { name: ScreenNameEnum.LoginScreen, Component: Login },
       { name: ScreenNameEnum.SignUpScreen, Component: Signup },
       { name: ScreenNameEnum.PasswordReset, Component: PasswordReset },
       { name: ScreenNameEnum.AddUsername, Component: AddUsername },
      { name: ScreenNameEnum.TabNavigator, Component: TabNavigator },
      { name: ScreenNameEnum.EmailVerify, Component: EmailVerify },
      { name: ScreenNameEnum.NewPassword, Component: NewPassword },
      { name: ScreenNameEnum.Notification, Component: Notification},
      { name: ScreenNameEnum.WoodsScreen, Component: WoodsScreen },
      { name: ScreenNameEnum.CreateGroupScreen, Component: CreateGroupScreen },
      { name: ScreenNameEnum.WatchScreen, Component: WatchScreen },
      { name: ScreenNameEnum.StreamService, Component: StreamService },
      { name: ScreenNameEnum.OnboardingScreen, Component: OnboardingScreen },
      { name: ScreenNameEnum.OnboardingScreen2, Component: OnboardingStepTwo },
      
      // { name: ScreenNameEnum.WatchWithFrind, Component: WatchWithFrind },
      
    ],

    BOTTOMTAB_ROUTE: [
      {
        name: ScreenNameEnum.FeedTab,
        Component: FeedTab,
        label: "Feed",
        logo: imageIndex.home,
        logo1: imageIndex.homeActive,
      },
      {
        name: ScreenNameEnum.DiscoverTab,
        Component: DiscoverTab,
        label: "Discover",
        logo: imageIndex.discover,
        logo1: imageIndex.discoverActive,
      },
      {
        name: ScreenNameEnum.RankingTab,
        Component: RankingTab,
        label: "Ranking",
        logo: imageIndex.rankingTab,
        logo1: imageIndex.rankingActive,
      },
     
      {
        name: ScreenNameEnum.WatchTab,
        Component: WatchTab,
        label: "Watch+",
        logo: imageIndex.usersGroup,
        logo1: imageIndex.usersGroupActive,
      },
      {
        name: ScreenNameEnum.ProfileTab,
        Component: ProfileTab,
        label: "Profile",
        logo: imageIndex.UserProfile,
        logo1: imageIndex.profileActive,
      },


    ],
  };
};

export default _routes;
