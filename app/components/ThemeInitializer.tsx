'use client';

import { useEffect } from 'react';
import { initTheme } from '../store/settings';

export const ThemeInitializer = () => {
  useEffect(() => {
    initTheme();
  }, []);

  return null;
};
