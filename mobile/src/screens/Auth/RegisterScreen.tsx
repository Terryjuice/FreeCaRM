import React, { useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { TextInput, Button, HelperText } from 'react-native-paper';
import { useAuth } from '../../context/AuthContext';

const RegisterScreen = ({ navigation }: any) => {
  const { signUp } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    phoneNumber: '',
    company: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [secureTextEntry, setSecureTextEntry] = useState(true);

  const handleRegister = async () => {
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    try {
      setError('');
      setLoading(true);
      const { confirmPassword, ...signUpData } = formData;
      await signUp(signUpData);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const updateField = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          <TextInput
            label="First Name *"
            value={formData.firstName}
            onChangeText={(value) => updateField('firstName', value)}
            mode="outlined"
            style={styles.input}
            disabled={loading}
          />

          <TextInput
            label="Last Name *"
            value={formData.lastName}
            onChangeText={(value) => updateField('lastName', value)}
            mode="outlined"
            style={styles.input}
            disabled={loading}
          />

          <TextInput
            label="Email *"
            value={formData.email}
            onChangeText={(value) => updateField('email', value)}
            mode="outlined"
            autoCapitalize="none"
            keyboardType="email-address"
            style={styles.input}
            disabled={loading}
          />

          <TextInput
            label="Phone Number"
            value={formData.phoneNumber}
            onChangeText={(value) => updateField('phoneNumber', value)}
            mode="outlined"
            keyboardType="phone-pad"
            style={styles.input}
            disabled={loading}
          />

          <TextInput
            label="Company"
            value={formData.company}
            onChangeText={(value) => updateField('company', value)}
            mode="outlined"
            style={styles.input}
            disabled={loading}
          />

          <TextInput
            label="Password *"
            value={formData.password}
            onChangeText={(value) => updateField('password', value)}
            mode="outlined"
            secureTextEntry={secureTextEntry}
            right={
              <TextInput.Icon
                icon={secureTextEntry ? 'eye' : 'eye-off'}
                onPress={() => setSecureTextEntry(!secureTextEntry)}
              />
            }
            style={styles.input}
            disabled={loading}
          />

          <TextInput
            label="Confirm Password *"
            value={formData.confirmPassword}
            onChangeText={(value) => updateField('confirmPassword', value)}
            mode="outlined"
            secureTextEntry={secureTextEntry}
            style={styles.input}
            disabled={loading}
          />

          {error ? <HelperText type="error">{error}</HelperText> : null}

          <Button
            mode="contained"
            onPress={handleRegister}
            loading={loading}
            disabled={
              loading ||
              !formData.email ||
              !formData.password ||
              !formData.firstName ||
              !formData.lastName
            }
            style={styles.button}
          >
            Sign Up
          </Button>

          <Button
            mode="text"
            onPress={() => navigation.goBack()}
            disabled={loading}
          >
            Already have an account? Sign In
          </Button>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    padding: 20,
  },
  input: {
    marginBottom: 15,
  },
  button: {
    marginTop: 10,
    marginBottom: 15,
  },
});

export default RegisterScreen;
