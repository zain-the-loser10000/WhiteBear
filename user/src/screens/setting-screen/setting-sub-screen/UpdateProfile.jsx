/**
 * @file UpdateProfile.jsx
 * @module screens/setting-screen/setting-sub-screen/UpdateProfile
 * @description User profile update screen with image upload and editable form fields.
 */

import React, { useState, useRef } from 'react';
import {
  StyleSheet,
  View,
  Image,
  TouchableOpacity,
  Text,
  ScrollView,
} from 'react-native';
import { theme } from '../../../styles/Themes';
import * as Animatable from 'react-native-animatable';
import Ionicons from 'react-native-vector-icons/Ionicons';
import ImagePicker from 'react-native-image-crop-picker';
import Modal from '../../../utilities/custom-components/modal/Modal';
import Toast from 'react-native-toast-message';
import { useDispatch, useSelector } from 'react-redux';
import { updateUser } from '../../../redux/slices/user.slice';
import Button from '../../../utilities/custom-components/button/Button';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useGlobalStyles } from '../../../styles/GlobalStyles';
import Header from '../../../utilities/custom-components/header/header/Header';
import InputField from '../../../utilities/custom-components/input-field/InputField';

const UpdateProfile = () => {
  const route = useRoute();
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const initialUserProfile = route.params?.userProfile;
  const [loading, setLoading] = useState(false);

  // FIXED: Connect live selectors to automatically update UI views without waiting for navigate actions
  const liveUser = useSelector(state => state.auth.user || state.user.user);
  const currentProfile = liveUser || initialUserProfile;

  // Responsive layout scaling framework
  const { wp, hp, moderateScale, isLandscape } = useGlobalStyles();
  const styles = createStyles({ wp, hp, moderateScale, isLandscape });

  const isFirstRender = useRef(true);
  const [showImageUploadModal, setShowImageUploadModal] = useState(false);
  const [fullName, setFullName] = useState(currentProfile?.fullName || '');

  /**
   * Unified profile updater matching backend thunk requirement
   */
  const handleUpdateProfile = async formData => {
    try {
      setLoading(true);
      const resultAction = await dispatch(
        updateUser({
          userId: currentProfile?.id || currentProfile?._id,
          formData,
        }),
      );

      if (updateUser.fulfilled.match(resultAction)) {
        Toast.show({
          type: 'success',
          text1: 'Success',
          text2: resultAction.payload?.message,
        });
        setShowImageUploadModal(false);
      } else if (updateUser.rejected.match(resultAction)) {
        Toast.show({
          type: 'error',
          text1: 'Update Failed',
          text2: resultAction.payload?.message || 'Something went wrong',
        });
      }
    } catch (err) {
      Toast.show({
        type: 'error',
        text1: 'Unexpected Error',
        text2: err?.message,
      });
    } finally {
      setLoading(false);
    }
  };

  /**
   * Processes and appends multi-media attachment adjustments
   */
  const handleImageUpload = async imagePath => {
    const formData = new FormData();
    formData.append('profilePicture', {
      uri: imagePath,
      type: 'image/jpeg',
      name: `profile_${Date.now()}.jpg`,
    });

    await handleUpdateProfile(formData);
  };

  /**
   * Persists interactive changes to the user's full name
   */
  const handleSaveChanges = async () => {
    if (!fullName.trim()) {
      Toast.show({
        type: 'error',
        text1: 'Validation Error',
        text2: 'Full Name field cannot be left blank.',
      });
      return;
    }

    const formData = new FormData();
    formData.append('fullName', fullName.trim());

    await handleUpdateProfile(formData);
  };

  const pickFromGallery = () => {
    ImagePicker.openPicker({
      width: 512,
      height: 512,
      cropping: true,
      mediaType: 'photo',
      quality: 0.8,
    })
      .then(image => handleImageUpload(image.path))
      .catch(err => {
        if (err.code !== 'E_PICKER_CANCELLED') {
          Toast.show({ type: 'error', text1: 'Error', text2: err.message });
        }
      });
  };

  const takePhoto = () => {
    ImagePicker.openCamera({
      width: 512,
      height: 512,
      cropping: true,
      mediaType: 'photo',
      quality: 0.8,
    })
      .then(image => handleImageUpload(image.path))
      .catch(err => {
        if (err.code !== 'E_PICKER_CANCELLED') {
          Toast.show({ type: 'error', text1: 'Error', text2: err.message });
        }
      });
  };

  // FIXED: Evaluates directly to a strict Boolean value based on live Redux subscription context
  const isFormUnchanged = fullName.trim() === (currentProfile?.fullName || '');
  const profileImageUri = currentProfile?.profilePicture;

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Header
          title="Update Profile"
          subtitle="Update your profile from here!"
          headerColor={theme.colors.dashboard.settings}
          onBackPress={() => navigation.goBack()}
        />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollPadding}
        keyboardShouldPersistTaps="handled"
      >
        {/* Profile Avatar Frame */}
        <Animatable.View
          animation={isFirstRender.current ? 'zoomInDown' : undefined}
          delay={100}
          duration={900}
          style={styles.profileImageWrapper}
        >
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => setShowImageUploadModal(true)}
            style={styles.imageContainer}
          >
            <Image
              source={
                profileImageUri
                  ? { uri: profileImageUri }
                  : require('../../../assets/placeHolder/placeholder.png')
              }
              style={styles.image}
            />
            <Animatable.View
              animation="pulse"
              iterationCount="infinite"
              duration={1800}
              style={styles.cameraIconBadge}
            >
              <Ionicons
                name="camera-outline"
                size={moderateScale(20)}
                color={theme.colors.white}
              />
            </Animatable.View>
          </TouchableOpacity>
        </Animatable.View>

        {/* Enhanced Form Card Section */}
        <Animatable.View
          animation={isFirstRender.current ? 'fadeInUp' : undefined}
          delay={300}
          duration={1000}
          style={styles.formCard}
        >
          <View style={styles.inputSpacing}>
            <Text style={styles.title}>Full Name</Text>
            <InputField
              placeholder="Full Name"
              value={fullName}
              onChangeText={setFullName}
              leftIcon={
                <Ionicons
                  name={'person-outline'}
                  size={moderateScale(21)}
                  color={theme.colors.primary}
                />
              }
            />
          </View>
        </Animatable.View>

        {/* Form Action Buttons Layout Interface */}
        <Animatable.View
          animation={isFirstRender.current ? 'fadeIn' : undefined}
          delay={500}
          style={styles.actionContainer}
        >
          <Button
            title="Save Profile Changes"
            onPress={handleSaveChanges}
            width={isLandscape ? wp(60) : wp(88)}
            loading={loading}
            disabled={isFormUnchanged || loading}
            backgroundColor={isFormUnchanged ?theme.colors.border : theme.colors.primary}
            textColor={isFormUnchanged ? '#94A3B8' : theme.colors.white}
            borderRadius={theme.borderRadius.medium}
          />
        </Animatable.View>
      </ScrollView>

      {/* Picture Selection Modal */}
      <Modal
        isOpen={showImageUploadModal}
        onClose={() => setShowImageUploadModal(false)}
        title="Update Profile Picture"
        showCloseButton={true}
        closeOnBackdrop={true}
      >
        <View style={styles.modalContainer}>
          <TouchableOpacity style={styles.optionRow} onPress={takePhoto}>
            <Ionicons
              name="camera-outline"
              size={moderateScale(36)}
              color={theme.colors.primary}
            />
            <Text style={styles.optionText}>Camera</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.optionRow} onPress={pickFromGallery}>
            <Ionicons
              name="images-outline"
              size={moderateScale(36)}
              color={theme.colors.primary}
            />
            <Text style={styles.optionText}>Gallery</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
};

export default UpdateProfile;

// Extracted baseline default stylesheet setup
const createStyles = ({ wp, hp, moderateScale, isLandscape }) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },

    headerContainer: {
      width: '100%',
    },

    scrollPadding: {
      paddingBottom: hp(4),
      alignItems: 'center',
    },

    profileImageWrapper: {
      marginTop: hp(3),
      marginBottom: hp(2),
    },

    imageContainer: {
      width: moderateScale(120),
      height: moderateScale(120),
      borderRadius: moderateScale(60),
      position: 'relative',
    },

    image: {
      width: '100%',
      height: '100%',
      borderRadius: moderateScale(60),
      borderWidth: 2,
      borderColor:theme.colors.primary,
    },

    cameraIconBadge: {
      position: 'absolute',
      bottom: 0,
      right: 0,
      backgroundColor: theme.colors.primary,
      padding: moderateScale(8),
      borderRadius: moderateScale(20),
    },

    formCard: {
      width: isLandscape ? wp(60) : wp(88),
      marginTop: hp(2),
    },

    inputSpacing: {
      width: '100%',
    },

    title: {
      color: theme.colors.white,
      marginBottom: hp(1),
      fontFamily: theme.typography.semiBold,
      fontSize: moderateScale(14),
    },

    actionContainer: {
      marginTop: hp(4),
    },

    modalContainer: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      paddingVertical: hp(2),
    },

    optionRow: {
      alignItems: 'center',
      width: wp(25),
    },

    optionText: {
      color: theme.colors.white,
      marginTop: hp(1),
      fontFamily: theme.typography.medium,
      fontSize: moderateScale(14),
    },
  });
