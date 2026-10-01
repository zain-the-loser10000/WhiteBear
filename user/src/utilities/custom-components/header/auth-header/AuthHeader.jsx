/**
 * @file AuthHeader.jsx
 * @module utilities/custom-components/header/auth-header/AuthHeader
 * @description Renders the authentication header with logo and title.
 */

import React from 'react';
import { View, Image, StyleSheet, Dimensions, Text } from 'react-native';
import { theme } from '../../../../styles/Themes';

const { width, height } = Dimensions.get('window');

const AuthHeader = ({ logo, title }) => {
  return (
    <View style={styles.headerContainer}>
      <Image source={logo} style={styles.logo} resizeMode="contain" />
      <Text style={styles.authText}>{title}</Text>
    </View>
  );
};

export default AuthHeader;

const styles = StyleSheet.create({
  headerContainer: {
    height: height * 0.2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  logo: {
    width: width * 0.6,
    height: height * 0.16,
    objectFit: 'contain',
    resizeMode: 'contain',
  },

  authText: {
    color: theme.colors.white,
    fontSize: theme.typography.fontSize.xxl,
    fontFamily: theme.typography.bold,
    marginLeft: -width * 0.064,
  },
});
