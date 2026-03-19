import { createNavigationContainerRef } from '@react-navigation/native';
import ScreenNameEnum from '@routes/screenName.enum';

export const rootNavigationRef = createNavigationContainerRef();
 
export function resetToLogin(): void {
  if (rootNavigationRef.isReady()) {
    rootNavigationRef.resetRoot({
      index: 0,
      routes: [{ name: ScreenNameEnum.LoginScreen }],
    });
  }
}
