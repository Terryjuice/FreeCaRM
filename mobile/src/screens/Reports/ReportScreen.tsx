import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Card, Title, Paragraph, Button, ActivityIndicator, Divider, List } from 'react-native-paper';
import { useInspection } from '../../context/InspectionContext';
import api from '../../config/api';
import { Inspection } from '../../types';
import { format } from 'date-fns';

const ReportScreen = ({ route }: any) => {
  const { inspectionId } = route.params;
  const { getInspectionById } = useInspection();
  const [inspection, setInspection] = useState<Inspection | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [reportUrl, setReportUrl] = useState<string | null>(null);

  useEffect(() => {
    loadInspection();
  }, [inspectionId]);

  const loadInspection = async () => {
    try {
      const data = await getInspectionById(inspectionId);
      setInspection(data);
    } catch (error) {
      Alert.alert('Error', 'Failed to load inspection');
    } finally {
      setLoading(false);
    }
  };

  const generateReport = async () => {
    try {
      setGenerating(true);
      const response = await api.post(`/reports/generate/${inspectionId}`);
      setReportUrl(response.data.reportUrl);
      Alert.alert('Success', 'Report generated successfully');
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.error || 'Failed to generate report');
    } finally {
      setGenerating(false);
    }
  };

  const downloadReport = async () => {
    if (!reportUrl) return;

    Alert.alert('Coming Soon', 'Report download feature will be available soon');
  };

  if (loading || !inspection) {
    return <ActivityIndicator style={styles.loader} />;
  }

  const totalLabor = inspection.damages.reduce((sum, d) => sum + d.estimatedCost.labor, 0);
  const totalParts = inspection.damages.reduce((sum, d) => sum + d.estimatedCost.parts, 0);

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.card}>
        <Card.Title title="Inspection Report" />
        <Card.Content>
          <Title>
            {inspection.vehicleInfo.year} {inspection.vehicleInfo.make}{' '}
            {inspection.vehicleInfo.model}
          </Title>
          <Paragraph>Report ID: {inspection._id}</Paragraph>
          <Paragraph>
            Generated: {format(new Date(), 'MMM dd, yyyy HH:mm')}
          </Paragraph>
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Title title="Vehicle Information" />
        <Card.Content>
          {inspection.vehicleInfo.vin && <Paragraph>VIN: {inspection.vehicleInfo.vin}</Paragraph>}
          {inspection.vehicleInfo.licensePlate && (
            <Paragraph>License Plate: {inspection.vehicleInfo.licensePlate}</Paragraph>
          )}
          {inspection.vehicleInfo.mileage && (
            <Paragraph>Mileage: {inspection.vehicleInfo.mileage.toLocaleString()}</Paragraph>
          )}
          {inspection.vehicleInfo.color && <Paragraph>Color: {inspection.vehicleInfo.color}</Paragraph>}
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Title title="Damages Summary" subtitle={`${inspection.damages.length} damage(s) detected`} />
        <Card.Content>
          {inspection.damages.map((damage, index) => (
            <View key={damage._id}>
              <List.Item
                title={`${index + 1}. ${damage.type.replace('_', ' ').toUpperCase()} - ${damage.severity.toUpperCase()}`}
                description={`Location: ${damage.location.part} (${damage.location.side})`}
              />
              <Paragraph style={styles.costText}>
                Estimated Cost: ${damage.estimatedCost.total.toFixed(2)}
              </Paragraph>
              {damage.description && (
                <Paragraph style={styles.description}>
                  Description: {damage.description}
                </Paragraph>
              )}
              {index < inspection.damages.length - 1 && <Divider style={styles.divider} />}
            </View>
          ))}
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Title title="Cost Breakdown" />
        <Card.Content>
          <View style={styles.costRow}>
            <Paragraph>Labor:</Paragraph>
            <Paragraph>${totalLabor.toFixed(2)}</Paragraph>
          </View>
          <View style={styles.costRow}>
            <Paragraph>Parts:</Paragraph>
            <Paragraph>${totalParts.toFixed(2)}</Paragraph>
          </View>
          <Divider style={styles.divider} />
          <View style={styles.costRow}>
            <Title>Total:</Title>
            <Title>${inspection.totalEstimatedCost.toFixed(2)}</Title>
          </View>
        </Card.Content>
      </Card>

      {inspection.notes && (
        <Card style={styles.card}>
          <Card.Title title="Additional Notes" />
          <Card.Content>
            <Paragraph>{inspection.notes}</Paragraph>
          </Card.Content>
        </Card>
      )}

      <View style={styles.actions}>
        {!reportUrl ? (
          <Button
            mode="contained"
            onPress={generateReport}
            loading={generating}
            disabled={generating}
            style={styles.button}
          >
            Generate PDF Report
          </Button>
        ) : (
          <Button
            mode="contained"
            onPress={downloadReport}
            icon="download"
            style={styles.button}
          >
            Download Report
          </Button>
        )}
      </View>
    </ScrollView>
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
  costText: {
    marginLeft: 16,
    marginBottom: 8,
    fontWeight: 'bold',
  },
  description: {
    marginLeft: 16,
    marginBottom: 8,
    fontStyle: 'italic',
  },
  divider: {
    marginVertical: 10,
  },
  costRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 5,
  },
  actions: {
    padding: 15,
    paddingBottom: 30,
  },
  button: {
    marginVertical: 5,
  },
});

export default ReportScreen;
