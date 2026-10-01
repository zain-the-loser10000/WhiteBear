/**
 * @file RoadmapBottomSheet.jsx
 * @module utilities/custom-components/bottom-sheet/RoadmapBottomSheet
 * @description Premium native animated container optimized specifically for text-heavy, multiphase roadmaps with real-time markdown token rendering.
 */

import React, { useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Modal,
  TouchableOpacity,
  Animated,
  TouchableWithoutFeedback,
  ScrollView,
} from 'react-native';
import { theme } from '../../../styles/Themes';
import { useGlobalStyles } from '../../../styles/GlobalStyles';

const RoadmapBottomSheet = ({
  visible,
  onClose,
  title = 'AI Generated Roadmap',
  roadmapText = '',
  accentColor = theme.colors.dashboard.goals,
}) => {
  const { wp, hp, moderateScale } = useGlobalStyles();

  const backdropOpacity = useRef(new Animated.Value(0)).current;
  const sheetTranslateY = useRef(new Animated.Value(hp(100))).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(backdropOpacity, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.spring(sheetTranslateY, {
          toValue: 0,
          friction: 7.5,
          tension: 45,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      handleAnimateDismiss();
    }
  }, [visible]);

  const handleAnimateDismiss = () => {
    Animated.parallel([
      Animated.timing(backdropOpacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(sheetTranslateY, {
        toValue: hp(100),
        duration: 220,
        useNativeDriver: true,
      }),
    ]).start(() => {
      if (onClose) onClose();
    });
  };

  /**
   * Parses raw markdown lines into native structured sub-components
   * Handles Main Headings (##), Subheadings (###), Sub-subheadings (####), and Bullet Points (*)
   */
  const renderFormattedMarkdown = rawText => {
    if (!rawText)
      return (
        <Text style={styles.roadmapBodyText}>
          No roadmap strategy details provided.
        </Text>
      );

    const lines = rawText.split('\n');

    return lines.map((line, index) => {
      const trimmedLine = line.trim();

      // Skip purely empty lines to avoid double spacing spacing bugs
      if (!trimmedLine)
        return <View key={`empty-${index}`} style={styles.lineBreakGap} />;

      // 1. Main Heading (## Heading)
      if (trimmedLine.startsWith('## ')) {
        return (
          <Text key={index} style={styles.h1HeadingText}>
            {trimmedLine.replace('## ', '')}
          </Text>
        );
      }

      // 2. Section Subheading (### Subheading)
      if (trimmedLine.startsWith('### ')) {
        return (
          <Text key={index} style={styles.h2HeadingText}>
            {trimmedLine.replace('### ', '')}
          </Text>
        );
      }

      // 3. Mini Subheading / Phases (#### Title)
      if (trimmedLine.startsWith('#### ')) {
        return (
          <Text key={index} style={styles.h3HeadingText}>
            {trimmedLine.replace('#### ', '')}
          </Text>
        );
      }

      // 4. Bullet Points (* List Item)
      if (trimmedLine.startsWith('* ') || trimmedLine.startsWith('- ')) {
        const cleanBulletText = trimmedLine.replace(/^[\*\-\s]+/, '');

        // Inline bold parser for instances like **Your Goal:**
        return (
          <View key={index} style={styles.bulletRowLayout}>
            <Text style={[styles.bulletPointMarker, { color: accentColor }]}>
              •
            </Text>
            <Text style={styles.bulletRowContentText}>
              {parseInlineBoldTokens(cleanBulletText)}
            </Text>
          </View>
        );
      }

      // 5. Standard Paragraph Line (Handles inline **bolding** anywhere)
      return (
        <Text key={index} style={styles.roadmapBodyText}>
          {parseInlineBoldTokens(trimmedLine)}
        </Text>
      );
    });
  };

  /**
   * Helper function to detect and split text containing **bold structural indicators**
   */
  const parseInlineBoldTokens = textBlock => {
    const boldRegex = /\*\*([^*]+)\*\*/g;
    const elements = [];
    let lastIndex = 0;
    let match;
    let keyCounter = 0;

    while ((match = boldRegex.exec(textBlock)) !== null) {
      // Append preceding plain text
      if (match.index > lastIndex) {
        elements.push(textBlock.substring(lastIndex, match.index));
      }
      // Append formatted bold string segment
      elements.push(
        <Text key={`bold-${keyCounter++}`} style={styles.inlineBoldText}>
          {match[1]}
        </Text>,
      );
      lastIndex = boldRegex.lastIndex;
    }

    if (lastIndex < textBlock.length) {
      elements.push(textBlock.substring(lastIndex));
    }

    return elements.length > 0 ? elements : textBlock;
  };

  const styles = createStyles({ wp, hp, moderateScale, accentColor });

  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      onRequestClose={handleAnimateDismiss}
    >
      <View style={styles.mainModalViewLayer}>
        <TouchableWithoutFeedback onPress={handleAnimateDismiss}>
          <Animated.View
            style={[styles.modalBackdrop, { opacity: backdropOpacity }]}
          />
        </TouchableWithoutFeedback>

        <Animated.View
          style={[
            styles.sheetSurfacePanel,
            { transform: [{ translateY: sheetTranslateY }] },
          ]}
        >
          {/* Header */}
          <View style={styles.headerBlock}>
            <Text numberOfLines={1} style={styles.headerTitleText}>
              {title}
            </Text>
            <View style={styles.horizontalDividerLine} />
          </View>

          {/* Core Roadmap Text Content Stream */}
          <ScrollView
            showsVerticalScrollIndicator={true}
            contentContainerStyle={styles.scrollContent}
          >
            {renderFormattedMarkdown(roadmapText)}
          </ScrollView>

          {/* Footer Actions Panel */}
          <View style={styles.footerActionContainerRow}>
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={handleAnimateDismiss}
              style={styles.continueActionButton}
            >
              <Text style={styles.continueButtonText}>Close Roadmap</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

export default RoadmapBottomSheet;

const createStyles = ({ wp, hp, moderateScale, accentColor }) => {
  return StyleSheet.create({
    mainModalViewLayer: {
      flex: 1,
      justifyContent: 'flex-end',
    },

    modalBackdrop: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'rgba(15, 23, 42, 0.4)',
    },

    sheetSurfacePanel: {
      backgroundColor: '#F8FAFC',
      borderTopLeftRadius: moderateScale(24),
      borderTopRightRadius: moderateScale(24),
      paddingHorizontal: wp(5),
      paddingTop: hp(2.5),
      paddingBottom: hp(4),
      maxHeight: hp(80),
      shadowColor: '#000',
      shadowOffset: { width: 0, height: -4 },
      shadowOpacity: 0.12,
      shadowRadius: 16,
      elevation: 24,
    },

    headerBlock: {
      width: '100%',
      marginBottom: hp(1.5),
    },

    headerTitleText: {
      fontFamily: theme.typography.bold,
      fontSize: moderateScale(18),
      color: '#0F172A',
      paddingLeft: wp(1),
    },

    horizontalDividerLine: {
      height: 1,
      backgroundColor: theme.colors.border,
      width: '100%',
      marginTop: hp(1.5),
    },

    scrollContent: {
      paddingHorizontal: wp(1),
      paddingVertical: hp(1),
      flexGrow: 1,
    },

    lineBreakGap: {
      height: hp(1),
    },

    h1HeadingText: {
      fontFamily: theme.typography.bold,
      fontSize: moderateScale(18),
      color: '#0F172A',
      marginTop: hp(2),
      marginBottom: hp(1),
    },

    h2HeadingText: {
      fontFamily: theme.typography.semiBold,
      fontSize: moderateScale(16),
      color: '#1E293B',
      marginTop: hp(1.8),
      marginBottom: hp(0.8),
    },

    h3HeadingText: {
      fontFamily: theme.typography.semiBold,
      fontSize: moderateScale(14),
      color: '#334155',
      marginTop: hp(1.2),
      marginBottom: hp(0.6),
    },

    roadmapBodyText: {
      fontFamily: theme.typography.regular,
      fontSize: moderateScale(14),
      color: '#475569',
      lineHeight: moderateScale(22),
      marginBottom: hp(0.8),
    },

    inlineBoldText: {
      fontFamily: theme.typography.bold,
      color: '#1E293B',
    },

    bulletRowLayout: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      marginBottom: hp(0.6),
      paddingLeft: wp(2),
      width: '96%',
    },

    bulletPointMarker: {
      fontSize: moderateScale(16),
      marginRight: wp(2),
      lineHeight: moderateScale(20),
    },

    bulletRowContentText: {
      fontFamily: theme.typography.regular,
      fontSize: moderateScale(14),
      color: '#475569',
      lineHeight: moderateScale(21),
      flex: 1,
    },

    footerActionContainerRow: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: hp(2),
      width: '100%',
    },

    continueActionButton: {
      flex: 1,
      backgroundColor: accentColor,
      borderRadius: moderateScale(12),
      paddingVertical: hp(1.6),
      alignItems: 'center',
      justifyContent: 'center',
    },

    continueButtonText: {
      fontFamily: theme.typography.bold,
      fontSize: moderateScale(14),
      color: theme.colors.white,
    },
  });
};
