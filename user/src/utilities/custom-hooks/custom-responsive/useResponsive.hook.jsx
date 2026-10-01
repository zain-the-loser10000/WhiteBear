/**
 * @file useResponsive.hook.jsx
 * @module utilities/custom-hooks/custome-responsive/useResponsive
 * @description A custom hook for handling responsive design logic based on window dimensions.
 */

import { useWindowDimensions } from 'react-native';

const GUIDELINE_BASE_WIDTH = 375;
const GUIDELINE_BASE_HEIGHT = 812;

export const useResponsive = () => {
  const { width, height } = useWindowDimensions();
  const isLandscape = width > height;

  const shortDimension = isLandscape ? height : width;
  const longDimension = isLandscape ? width : height;

  const scale = size => (shortDimension / GUIDELINE_BASE_WIDTH) * size;
  const verticalScale = size => (longDimension / GUIDELINE_BASE_HEIGHT) * size;
  const moderateScale = (size, factor = 0.5) =>
    size + (scale(size) - size) * factor;

  return {
    width,
    height,
    isLandscape,
    isPortrait: !isLandscape,
    scale,
    verticalScale,
    moderateScale,
    wp: percentage => (width * percentage) / 100,
    hp: percentage => (height * percentage) / 100,
  };
};
