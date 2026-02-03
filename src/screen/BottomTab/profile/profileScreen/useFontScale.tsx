import { useEffect, useState } from 'react';
import { PixelRatio, Dimensions } from 'react-native';

export function useFontScale() {
  const [fontScale, setFontScale] = useState(1);

  useEffect(() => {
    try {
      const scale = PixelRatio.getFontScale?.() || 1;
      setFontScale(scale);
    } catch (error) {
       setFontScale(1); // fallback
    }

     const subscription = Dimensions.addEventListener('change', () => {
      try {
        const scale = PixelRatio.getFontScale?.() || 1;
        setFontScale(scale);
      } catch {
        setFontScale(1);
      }
    });

    return () => {
      subscription?.remove?.();
    };
  }, []);

  return fontScale;
}
