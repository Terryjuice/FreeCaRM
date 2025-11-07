import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';

// Auth Screens
import LoginScreen from '../screens/Auth/LoginScreen';
import RegisterScreen from '../screens/Auth/RegisterScreen';

// Main Screens
import HomeScreen from '../screens/Home/HomeScreen';
import InspectionsListScreen from '../screens/Inspections/InspectionsListScreen';
import InspectionDetailScreen from '../screens/Inspections/InspectionDetailScreen';
import NewInspectionScreen from '../screens/Inspections/NewInspectionScreen';
import CameraScreen from '../screens/Camera/CameraScreen';
import ProfileScreen from '../screens/Profile/ProfileScreen';
import ReportScreen from '../screens/Reports/ReportScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const TabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: any;

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Inspections') {
            iconName = focused ? 'list' : 'list-outline';
          } else if (route.name === 'NewInspection') {
            iconName = focused ? 'add-circle' : 'add-circle-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#2196F3',
        tabBarInactiveTintColor: 'gray',
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} options={{ title: 'Home' }} />
      <Tab.Screen name="Inspections" component={InspectionsListScreen} options={{ title: 'Inspections' }} />
      <Tab.Screen
        name="NewInspection"
        component={NewInspectionScreen}
        options={{ title: 'New', tabBarLabel: 'New' }}
      />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ title: 'Profile' }} />
    </Tab.Navigator>
  );
};

const AppNavigator = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return null; // Show loading screen
  }

  return (
    <Stack.Navigator>
      {!user ? (
        <>
          <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
          <Stack.Screen name="Register" component={RegisterScreen} options={{ title: 'Sign Up' }} />
        </>
      ) : (
        <>
          <Stack.Screen name="Main" component={TabNavigator} options={{ headerShown: false }} />
          <Stack.Screen name="InspectionDetail" component={InspectionDetailScreen} options={{ title: 'Inspection' }} />
          <Stack.Screen name="Camera" component={CameraScreen} options={{ title: 'Take Photo' }} />
          <Stack.Screen name="Report" component={ReportScreen} options={{ title: 'Report' }} />
        </>
      )}
    </Stack.Navigator>
  );
};

export default AppNavigator;
