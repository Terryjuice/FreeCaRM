import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Camera, CameraType, FlashMode } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { Button, Text, IconButton, Menu } from 'react-native-paper';
import { useInspection } from '../../context/InspectionContext';
import { ImageAngle } from '../../types';

const imageAngles: { label: string; value: ImageAngle }[] = [
  { label: 'Front', value: 'front' },
  { label: 'Rear', value: 'rear' },
  { label: 'Left Side', value: 'left_side' },
  { label: 'Right Side', value: 'right_side' },
  { label: 'Front Left', value: 'front_left' },
  { label: 'Front Right', value: 'front_right' },
  { label: 'Rear Left', value: 'rear_left' },
  { label: 'Rear Right', value: 'rear_right' },
  { label: 'Interior', value: 'interior' },
  { label: 'Dashboard', value: 'dashboard' },
  { label: 'VIN Plate', value: 'vin_plate' },
  { label: 'Damage Closeup', value: 'damage_closeup' },
];

const CameraScreen = ({ route, navigation }: any) => {
  const { inspectionId } = route.params;
  const { uploadImage } = useInspection();
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [type, setType] = useState(CameraType.back);
  const [flash, setFlash] = useState(FlashMode.off);
  const [selectedAngle, setSelectedAngle] = useState<ImageAngle>('front');
  const [menuVisible, setMenuVisible] = useState(false);
  const [uploading, setUploading] = useState(false);
  const cameraRef = useRef<Camera>(null);

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  const takePicture = async () => {
    if (cameraRef.current) {
      try {
        const photo = await cameraRef.current.takePictureAsync({
          quality: 0.8,
        });

        await handleUpload(photo.uri);
      } catch (error) {
        console.error('Failed to take picture:', error);
        Alert.alert('Error', 'Failed to take picture');
      }
    }
  };

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.8,
        allowsEditing: true,
      });

      if (!result.canceled && result.assets[0]) {
        await handleUpload(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Failed to pick image:', error);
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const handleUpload = async (uri: string) => {
    try {
      setUploading(true);
      await uploadImage(inspectionId, uri, selectedAngle);
      Alert.alert('Success', 'Image uploaded successfully', [
        { text: 'Take Another', onPress: () => {} },
        { text: 'Done', onPress: () => navigation.goBack() },
      ]);
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setUploading(false);
    }
  };

  if (hasPermission === null) {
    return <View />;
  }

  if (hasPermission === false) {
    return (
      <View style={styles.container}>
        <Text>No access to camera</Text>
        <Button onPress={() => Camera.requestCameraPermissionsAsync()}>
          Grant Permission
        </Button>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Camera style={styles.camera} type={type} flashMode={flash} ref={cameraRef}>
        <View style={styles.topBar}>
          <IconButton
            icon="close"
            iconColor="#fff"
            size={30}
            onPress={() => navigation.goBack()}
          />
          <IconButton
            icon={flash === FlashMode.off ? 'flash-off' : 'flash'}
            iconColor="#fff"
            size={30}
            onPress={() =>
              setFlash(flash === FlashMode.off ? FlashMode.on : FlashMode.off)
            }
          />
        </View>

        <View style={styles.bottomBar}>
          <View style={styles.angleSelector}>
            <Menu
              visible={menuVisible}
              onDismiss={() => setMenuVisible(false)}
              anchor={
                <Button
                  mode="contained"
                  onPress={() => setMenuVisible(true)}
                  icon="menu-down"
                >
                  {imageAngles.find((a) => a.value === selectedAngle)?.label}
                </Button>
              }
            >
              {imageAngles.map((angle) => (
                <Menu.Item
                  key={angle.value}
                  onPress={() => {
                    setSelectedAngle(angle.value);
                    setMenuVisible(false);
                  }}
                  title={angle.label}
                />
              ))}
            </Menu>
          </View>

          <View style={styles.controls}>
            <IconButton
              icon="image"
              iconColor="#fff"
              size={40}
              onPress={pickImage}
              disabled={uploading}
            />

            <TouchableOpacity
              style={styles.captureButton}
              onPress={takePicture}
              disabled={uploading}
            >
              <View style={styles.captureButtonInner} />
            </TouchableOpacity>

            <IconButton
              icon="camera-flip"
              iconColor="#fff"
              size={40}
              onPress={() =>
                setType(
                  type === CameraType.back ? CameraType.front : CameraType.back
                )
              }
              disabled={uploading}
            />
          </View>
        </View>
      </Camera>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  camera: {
    flex: 1,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 40,
    paddingHorizontal: 20,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    paddingBottom: 40,
  },
  angleSelector: {
    alignItems: 'center',
    marginBottom: 20,
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureButtonInner: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#2196F3',
  },
});

export default CameraScreen;
