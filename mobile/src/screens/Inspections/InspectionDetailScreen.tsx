import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, Image, Alert, Dimensions } from 'react-native';
import {
  Card,
  Title,
  Paragraph,
  Button,
  Chip,
  Text,
  ActivityIndicator,
  List,
  FAB,
} from 'react-native-paper';
import { useInspection } from '../../context/InspectionContext';
import { Inspection, ImageAngle } from '../../types';
import { format } from 'date-fns';

const { width } = Dimensions.get('window');

const InspectionDetailScreen = ({ route, navigation }: any) => {
  const { inspectionId } = route.params;
  const { getInspectionById, analyzeInspection, deleteInspection, loading } = useInspection();
  const [inspection, setInspection] = useState<Inspection | null>(null);
  const [analyzing, setAnalyzing] = useState(false);

  useEffect(() => {
    loadInspection();
  }, [inspectionId]);

  const loadInspection = async () => {
    try {
      const data = await getInspectionById(inspectionId);
      setInspection(data);
    } catch (error) {
      console.error('Failed to load inspection:', error);
      Alert.alert('Error', 'Failed to load inspection');
    }
  };

  const handleAnalyze = async () => {
    Alert.alert(
      'Analyze Inspection',
      'This will analyze all uploaded images for damage. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Analyze',
          onPress: async () => {
            try {
              setAnalyzing(true);
              await analyzeInspection(inspectionId);
              await loadInspection();
              Alert.alert('Success', 'Analysis completed');
            } catch (error: any) {
              Alert.alert('Error', error.message);
            } finally {
              setAnalyzing(false);
            }
          },
        },
      ]
    );
  };

  const handleDelete = () => {
    Alert.alert('Delete Inspection', 'Are you sure you want to delete this inspection?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteInspection(inspectionId);
            navigation.goBack();
          } catch (error: any) {
            Alert.alert('Error', error.message);
          }
        },
      },
    ]);
  };

  const handleAddPhoto = () => {
    navigation.navigate('Camera', { inspectionId });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return '#4CAF50';
      case 'in_progress':
        return '#2196F3';
      case 'analyzing':
        return '#FF9800';
      case 'draft':
        return '#9E9E9E';
      default:
        return '#757575';
    }
  };

  if (loading || !inspection) {
    return <ActivityIndicator style={styles.loader} />;
  }

  return (
    <>
      <ScrollView style={styles.container}>
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.header}>
              <Title>
                {inspection.vehicleInfo.year} {inspection.vehicleInfo.make}{' '}
                {inspection.vehicleInfo.model}
              </Title>
              <Chip
                mode="flat"
                style={{ backgroundColor: getStatusColor(inspection.status) }}
                textStyle={{ color: '#fff' }}
              >
                {inspection.status.replace('_', ' ')}
              </Chip>
            </View>
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Title title="Vehicle Details" />
          <Card.Content>
            {inspection.vehicleInfo.vin && <Paragraph>VIN: {inspection.vehicleInfo.vin}</Paragraph>}
            {inspection.vehicleInfo.licensePlate && (
              <Paragraph>License Plate: {inspection.vehicleInfo.licensePlate}</Paragraph>
            )}
            {inspection.vehicleInfo.mileage && (
              <Paragraph>Mileage: {inspection.vehicleInfo.mileage.toLocaleString()} miles</Paragraph>
            )}
            {inspection.vehicleInfo.color && <Paragraph>Color: {inspection.vehicleInfo.color}</Paragraph>}
            <Paragraph>Created: {format(new Date(inspection.createdAt), 'MMM dd, yyyy HH:mm')}</Paragraph>
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Title title="Photos" subtitle={`${inspection.images.length} photo(s)`} />
          <Card.Content>
            {inspection.images.length === 0 ? (
              <Paragraph>No photos yet</Paragraph>
            ) : (
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {inspection.images.map((image, index) => (
                  <View key={index} style={styles.imageContainer}>
                    <Image
                      source={{ uri: `${image.url}` }}
                      style={styles.image}
                      resizeMode="cover"
                    />
                    <Text style={styles.imageLabel}>{image.angle.replace('_', ' ')}</Text>
                  </View>
                ))}
              </ScrollView>
            )}
          </Card.Content>
          <Card.Actions>
            <Button onPress={handleAddPhoto}>Add Photo</Button>
          </Card.Actions>
        </Card>

        <Card style={styles.card}>
          <Card.Title
            title="Damages"
            subtitle={`${inspection.damages.length} damage(s) detected`}
          />
          <Card.Content>
            {inspection.damages.length === 0 ? (
              <Paragraph>No damages detected</Paragraph>
            ) : (
              inspection.damages.map((damage, index) => (
                <List.Item
                  key={damage._id}
                  title={`${damage.type.replace('_', ' ')} - ${damage.severity}`}
                  description={`${damage.location.part} | $${damage.estimatedCost.total.toFixed(2)}`}
                  left={(props) => <List.Icon {...props} icon="alert-circle" />}
                />
              ))
            )}
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Title title="Cost Estimate" />
          <Card.Content>
            <Title>${inspection.totalEstimatedCost.toFixed(2)}</Title>
            <Paragraph>Total estimated repair cost</Paragraph>
          </Card.Content>
        </Card>

        {inspection.notes && (
          <Card style={styles.card}>
            <Card.Title title="Notes" />
            <Card.Content>
              <Paragraph>{inspection.notes}</Paragraph>
            </Card.Content>
          </Card>
        )}

        <View style={styles.actions}>
          {inspection.status === 'in_progress' && inspection.images.length > 0 && (
            <Button
              mode="contained"
              onPress={handleAnalyze}
              loading={analyzing}
              disabled={analyzing}
              style={styles.actionButton}
            >
              Analyze Damages
            </Button>
          )}

          {inspection.status === 'completed' && (
            <Button
              mode="contained"
              onPress={() => navigation.navigate('Report', { inspectionId })}
              style={styles.actionButton}
            >
              View Report
            </Button>
          )}

          <Button mode="outlined" onPress={handleDelete} style={styles.actionButton}>
            Delete Inspection
          </Button>
        </View>
      </ScrollView>

      <FAB icon="camera" style={styles.fab} onPress={handleAddPhoto} />
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loader: {
    marginTop: 50,
  },
  card: {
    margin: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  imageContainer: {
    marginRight: 10,
  },
  image: {
    width: width * 0.6,
    height: 200,
    borderRadius: 8,
  },
  imageLabel: {
    marginTop: 5,
    textAlign: 'center',
    textTransform: 'capitalize',
  },
  actions: {
    padding: 10,
    paddingBottom: 80,
  },
  actionButton: {
    marginVertical: 5,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
});

export default InspectionDetailScreen;
