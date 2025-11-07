import React, { useEffect, useState } from 'react';
import { View, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { Card, Text, Chip, FAB, Searchbar, ActivityIndicator } from 'react-native-paper';
import { useInspection } from '../../context/InspectionContext';
import { Inspection } from '../../types';
import { format } from 'date-fns';

const InspectionsListScreen = ({ navigation }: any) => {
  const { inspections, getInspections, loading } = useInspection();
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredInspections, setFilteredInspections] = useState<Inspection[]>([]);

  useEffect(() => {
    loadInspections();
  }, []);

  useEffect(() => {
    filterInspections();
  }, [searchQuery, inspections]);

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

  const filterInspections = () => {
    if (!searchQuery) {
      setFilteredInspections(inspections);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = inspections.filter(
      (inspection) =>
        inspection.vehicleInfo.make.toLowerCase().includes(query) ||
        inspection.vehicleInfo.model.toLowerCase().includes(query) ||
        inspection.vehicleInfo.year.toString().includes(query) ||
        inspection.vehicleInfo.vin?.toLowerCase().includes(query)
    );
    setFilteredInspections(filtered);
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

  const renderInspection = ({ item }: { item: Inspection }) => (
    <Card
      style={styles.card}
      onPress={() => navigation.navigate('InspectionDetail', { inspectionId: item._id })}
    >
      <Card.Content>
        <View style={styles.cardHeader}>
          <Text variant="titleMedium">
            {item.vehicleInfo.year} {item.vehicleInfo.make} {item.vehicleInfo.model}
          </Text>
          <Chip
            mode="flat"
            style={{ backgroundColor: getStatusColor(item.status) }}
            textStyle={{ color: '#fff' }}
          >
            {item.status.replace('_', ' ')}
          </Chip>
        </View>

        {item.vehicleInfo.vin && (
          <Text variant="bodySmall" style={styles.vin}>
            VIN: {item.vehicleInfo.vin}
          </Text>
        )}

        <View style={styles.details}>
          <Text variant="bodySmall">Photos: {item.images.length}</Text>
          <Text variant="bodySmall">Damages: {item.damages.length}</Text>
          <Text variant="bodySmall">Cost: ${item.totalEstimatedCost.toFixed(2)}</Text>
        </View>

        <Text variant="bodySmall" style={styles.date}>
          {format(new Date(item.createdAt), 'MMM dd, yyyy')}
        </Text>
      </Card.Content>
    </Card>
  );

  return (
    <View style={styles.container}>
      <Searchbar
        placeholder="Search by make, model, VIN..."
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={styles.searchbar}
      />

      {loading && !refreshing ? (
        <ActivityIndicator style={styles.loader} />
      ) : (
        <FlatList
          data={filteredInspections}
          renderItem={renderInspection}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text>No inspections found</Text>
            </View>
          }
        />
      )}

      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => navigation.navigate('NewInspection')}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  searchbar: {
    margin: 10,
  },
  list: {
    padding: 10,
  },
  card: {
    marginBottom: 10,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  vin: {
    color: '#666',
    marginBottom: 10,
  },
  details: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
    marginBottom: 5,
  },
  date: {
    color: '#999',
    marginTop: 5,
  },
  loader: {
    marginTop: 50,
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 50,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
});

export default InspectionsListScreen;
