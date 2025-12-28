import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { Card, Title, Paragraph, Button, Text, ActivityIndicator } from 'react-native-paper';
import { useAuth } from '../../context/AuthContext';
import { useInspection } from '../../context/InspectionContext';

const HomeScreen = ({ navigation }: any) => {
  const { user } = useAuth();
  const { inspections, getInspections, loading } = useInspection();
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadInspections();
  }, []);

  const loadInspections = async () => {
    try {
      await getInspections();
    } catch (error) {
      console.error('Failed to load inspections:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadInspections();
    setRefreshing(false);
  };

  const recentInspections = inspections.slice(0, 3);
  const completedCount = inspections.filter((i) => i.status === 'completed').length;
  const inProgressCount = inspections.filter((i) => i.status === 'in_progress').length;

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <View style={styles.header}>
        <Title>Welcome, {user?.firstName}!</Title>
        <Paragraph>Manage your vehicle inspections</Paragraph>
      </View>

      <View style={styles.statsContainer}>
        <Card style={styles.statCard}>
          <Card.Content>
            <Title>{inspections.length}</Title>
            <Paragraph>Total Inspections</Paragraph>
          </Card.Content>
        </Card>

        <Card style={styles.statCard}>
          <Card.Content>
            <Title>{completedCount}</Title>
            <Paragraph>Completed</Paragraph>
          </Card.Content>
        </Card>

        <Card style={styles.statCard}>
          <Card.Content>
            <Title>{inProgressCount}</Title>
            <Paragraph>In Progress</Paragraph>
          </Card.Content>
        </Card>
      </View>

      <View style={styles.actionContainer}>
        <Button
          mode="contained"
          icon="plus"
          onPress={() => navigation.navigate('NewInspection')}
          style={styles.actionButton}
        >
          New Inspection
        </Button>
      </View>

      <Card style={styles.recentCard}>
        <Card.Title title="Recent Inspections" />
        <Card.Content>
          {loading ? (
            <ActivityIndicator />
          ) : recentInspections.length === 0 ? (
            <Paragraph>No inspections yet</Paragraph>
          ) : (
            recentInspections.map((inspection) => (
              <Card
                key={inspection._id}
                style={styles.inspectionCard}
                onPress={() =>
                  navigation.navigate('InspectionDetail', { inspectionId: inspection._id })
                }
              >
                <Card.Content>
                  <Text variant="titleMedium">
                    {inspection.vehicleInfo.year} {inspection.vehicleInfo.make}{' '}
                    {inspection.vehicleInfo.model}
                  </Text>
                  <Text variant="bodySmall" style={styles.statusText}>
                    Status: {inspection.status.replace('_', ' ').toUpperCase()}
                  </Text>
                  <Text variant="bodySmall">
                    Damages: {inspection.damages.length} | Cost: $
                    {inspection.totalEstimatedCost.toFixed(2)}
                  </Text>
                </Card.Content>
              </Card>
            ))
          )}
        </Card.Content>
        <Card.Actions>
          <Button onPress={() => navigation.navigate('Inspections')}>View All</Button>
        </Card.Actions>
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 20,
    backgroundColor: '#fff',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 10,
  },
  statCard: {
    flex: 1,
    margin: 5,
  },
  actionContainer: {
    padding: 15,
  },
  actionButton: {
    paddingVertical: 5,
  },
  recentCard: {
    margin: 15,
  },
  inspectionCard: {
    marginVertical: 5,
  },
  statusText: {
    marginTop: 5,
    color: '#666',
  },
});

export default HomeScreen;
