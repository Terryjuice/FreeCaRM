import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { TextInput, Button, Title, HelperText } from 'react-native-paper';
import { useInspection } from '../../context/InspectionContext';

const NewInspectionScreen = ({ navigation }: any) => {
  const { createInspection } = useInspection();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    make: '',
    model: '',
    year: '',
    vin: '',
    licensePlate: '',
    mileage: '',
    color: '',
    notes: '',
  });

  const updateField = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleCreate = async () => {
    if (!formData.make || !formData.model || !formData.year) {
      setError('Please fill in required fields');
      return;
    }

    const year = parseInt(formData.year);
    if (isNaN(year) || year < 1900 || year > new Date().getFullYear() + 1) {
      setError('Please enter a valid year');
      return;
    }

    try {
      setError('');
      setLoading(true);

      const inspectionData = {
        vehicleInfo: {
          make: formData.make,
          model: formData.model,
          year,
          vin: formData.vin || undefined,
          licensePlate: formData.licensePlate || undefined,
          mileage: formData.mileage ? parseInt(formData.mileage) : undefined,
          color: formData.color || undefined,
        },
        notes: formData.notes || undefined,
      };

      const inspection = await createInspection(inspectionData);
      navigation.navigate('InspectionDetail', { inspectionId: inspection._id });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          <Title style={styles.title}>Create New Inspection</Title>

          <TextInput
            label="Make *"
            value={formData.make}
            onChangeText={(value) => updateField('make', value)}
            mode="outlined"
            style={styles.input}
            disabled={loading}
          />

          <TextInput
            label="Model *"
            value={formData.model}
            onChangeText={(value) => updateField('model', value)}
            mode="outlined"
            style={styles.input}
            disabled={loading}
          />

          <TextInput
            label="Year *"
            value={formData.year}
            onChangeText={(value) => updateField('year', value)}
            mode="outlined"
            keyboardType="numeric"
            style={styles.input}
            disabled={loading}
          />

          <TextInput
            label="VIN"
            value={formData.vin}
            onChangeText={(value) => updateField('vin', value.toUpperCase())}
            mode="outlined"
            autoCapitalize="characters"
            style={styles.input}
            disabled={loading}
          />

          <TextInput
            label="License Plate"
            value={formData.licensePlate}
            onChangeText={(value) => updateField('licensePlate', value.toUpperCase())}
            mode="outlined"
            autoCapitalize="characters"
            style={styles.input}
            disabled={loading}
          />

          <TextInput
            label="Mileage"
            value={formData.mileage}
            onChangeText={(value) => updateField('mileage', value)}
            mode="outlined"
            keyboardType="numeric"
            style={styles.input}
            disabled={loading}
          />

          <TextInput
            label="Color"
            value={formData.color}
            onChangeText={(value) => updateField('color', value)}
            mode="outlined"
            style={styles.input}
            disabled={loading}
          />

          <TextInput
            label="Notes"
            value={formData.notes}
            onChangeText={(value) => updateField('notes', value)}
            mode="outlined"
            multiline
            numberOfLines={4}
            style={styles.input}
            disabled={loading}
          />

          {error ? <HelperText type="error">{error}</HelperText> : null}

          <Button
            mode="contained"
            onPress={handleCreate}
            loading={loading}
            disabled={loading || !formData.make || !formData.model || !formData.year}
            style={styles.button}
          >
            Create Inspection
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
  title: {
    marginBottom: 20,
  },
  input: {
    marginBottom: 15,
  },
  button: {
    marginTop: 10,
  },
});

export default NewInspectionScreen;
