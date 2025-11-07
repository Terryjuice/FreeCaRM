import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { List, Avatar, Title, Paragraph, Button, Divider, Dialog, Portal, TextInput } from 'react-native-paper';
import { useAuth } from '../../context/AuthContext';

const ProfileScreen = ({ navigation }: any) => {
  const { user, signOut, updateProfile } = useAuth();
  const [editDialogVisible, setEditDialogVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    phoneNumber: user?.phoneNumber || '',
    company: user?.company || '',
  });

  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: signOut },
    ]);
  };

  const handleUpdateProfile = async () => {
    try {
      setLoading(true);
      await updateProfile(formData);
      setEditDialogVisible(false);
      Alert.alert('Success', 'Profile updated successfully');
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const openEditDialog = () => {
    setFormData({
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      phoneNumber: user?.phoneNumber || '',
      company: user?.company || '',
    });
    setEditDialogVisible(true);
  };

  return (
    <>
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <Avatar.Text
            size={80}
            label={`${user?.firstName[0]}${user?.lastName[0]}`}
            style={styles.avatar}
          />
          <Title style={styles.name}>
            {user?.firstName} {user?.lastName}
          </Title>
          <Paragraph>{user?.email}</Paragraph>
          {user?.role && (
            <Paragraph style={styles.role}>{user.role.toUpperCase()}</Paragraph>
          )}
        </View>

        <Divider />

        <List.Section>
          <List.Subheader>Account Information</List.Subheader>

          <List.Item
            title="Phone Number"
            description={user?.phoneNumber || 'Not set'}
            left={(props) => <List.Icon {...props} icon="phone" />}
          />

          <List.Item
            title="Company"
            description={user?.company || 'Not set'}
            left={(props) => <List.Icon {...props} icon="office-building" />}
          />
        </List.Section>

        <Divider />

        <List.Section>
          <List.Subheader>Actions</List.Subheader>

          <List.Item
            title="Edit Profile"
            left={(props) => <List.Icon {...props} icon="account-edit" />}
            right={(props) => <List.Icon {...props} icon="chevron-right" />}
            onPress={openEditDialog}
          />

          <List.Item
            title="Settings"
            left={(props) => <List.Icon {...props} icon="cog" />}
            right={(props) => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => Alert.alert('Coming Soon', 'Settings feature coming soon')}
          />

          <List.Item
            title="Help & Support"
            left={(props) => <List.Icon {...props} icon="help-circle" />}
            right={(props) => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => Alert.alert('Coming Soon', 'Help feature coming soon')}
          />
        </List.Section>

        <View style={styles.signOutContainer}>
          <Button mode="outlined" onPress={handleSignOut} style={styles.signOutButton}>
            Sign Out
          </Button>
        </View>
      </ScrollView>

      <Portal>
        <Dialog visible={editDialogVisible} onDismiss={() => setEditDialogVisible(false)}>
          <Dialog.Title>Edit Profile</Dialog.Title>
          <Dialog.Content>
            <TextInput
              label="First Name"
              value={formData.firstName}
              onChangeText={(value) => setFormData({ ...formData, firstName: value })}
              mode="outlined"
              style={styles.input}
            />
            <TextInput
              label="Last Name"
              value={formData.lastName}
              onChangeText={(value) => setFormData({ ...formData, lastName: value })}
              mode="outlined"
              style={styles.input}
            />
            <TextInput
              label="Phone Number"
              value={formData.phoneNumber}
              onChangeText={(value) => setFormData({ ...formData, phoneNumber: value })}
              mode="outlined"
              keyboardType="phone-pad"
              style={styles.input}
            />
            <TextInput
              label="Company"
              value={formData.company}
              onChangeText={(value) => setFormData({ ...formData, company: value })}
              mode="outlined"
              style={styles.input}
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setEditDialogVisible(false)}>Cancel</Button>
            <Button onPress={handleUpdateProfile} loading={loading}>
              Save
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  avatar: {
    marginBottom: 10,
  },
  name: {
    marginTop: 10,
  },
  role: {
    marginTop: 5,
    color: '#2196F3',
    fontWeight: 'bold',
  },
  signOutContainer: {
    padding: 20,
  },
  signOutButton: {
    borderColor: '#F44336',
  },
  input: {
    marginBottom: 10,
  },
});

export default ProfileScreen;
