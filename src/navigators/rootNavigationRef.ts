import { createNavigationContainerRef } from '@react-navigation/native';
import ScreenNameEnum from '@routes/screenName.enum';

/**
 * Root navigation ref for navigating outside React components (e.g. 401 auto-logout).
 */
export const rootNavigationRef = createNavigationContainerRef();

/**
 * Reset app to login screen (used on 401 / session expired).
 */
export function resetToLogin(): void {
  if (rootNavigationRef.isReady()) {
    rootNavigationRef.resetRoot({
      index: 0,
      routes: [{ name: ScreenNameEnum.LoginScreen }],
    });
  }
}
