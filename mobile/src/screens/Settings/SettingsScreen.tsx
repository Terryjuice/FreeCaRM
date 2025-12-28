import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { TextInput, Button, Card, Title, Paragraph, Switch, List, Divider, HelperText } from 'react-native-paper';
import api from '../../config/api';

const SettingsScreen = () => {
  const [loading, setLoading] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [hasApiKey, setHasApiKey] = useState(false);
  const [autoAnalyze, setAutoAnalyze] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [testing, setTesting] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const response = await api.get('/settings');
      const { settings } = response.data;
      setHasApiKey(settings.hasApiKey);
      setAutoAnalyze(settings.preferences.autoAnalyze);
      setNotifications(settings.preferences.notificationsEnabled);
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
  };

  const handleSaveApiKey = async () => {
    if (!apiKey.trim()) {
      Alert.alert('Error', 'Please enter an API key');
      return;
    }

    try {
      setLoading(true);
      await api.post('/settings/api-key', { apiKey: apiKey.trim() });
      setHasApiKey(true);
      setApiKey('');
      Alert.alert('Success', 'Claude API key saved successfully! You can now use AI-powered damage detection.');
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.error || 'Failed to save API key');
    } finally {
      setLoading(false);
    }
  };

  const handleTestApiKey = async () => {
    try {
      setTesting(true);
      await api.post('/settings/test-api-key');
      Alert.alert('Success', 'API key is valid and working!');
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.error || 'Failed to test API key');
    } finally {
      setTesting(false);
    }
  };

  const handleUpdatePreferences = async (key: string, value: boolean) => {
    try {
      await api.put('/settings', {
        preferences: { [key]: value },
      });

      if (key === 'autoAnalyze') setAutoAnalyze(value);
      if (key === 'notificationsEnabled') setNotifications(value);
    } catch (error) {
      Alert.alert('Error', 'Failed to update preferences');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.card}>
        <Card.Title title="Claude AI Configuration" />
        <Card.Content>
          <Paragraph style={styles.description}>
            Integrate with Anthropic's Claude AI for advanced damage detection. Get your API key from:
            https://console.anthropic.com/
          </Paragraph>

          {hasApiKey ? (
            <>
              <View style={styles.statusContainer}>
                <List.Icon icon="check-circle" color="#4CAF50" />
                <Paragraph style={styles.connectedText}>API Key Configured</Paragraph>
              </View>

              <Button
                mode="outlined"
                onPress={handleTestApiKey}
                loading={testing}
                disabled={testing}
                style={styles.button}
              >
                Test Connection
              </Button>

              <Divider style={styles.divider} />

              <Paragraph style={styles.updateText}>Update API Key:</Paragraph>
            </>
          ) : (
            <HelperText type="info">
              Enter your Anthropic API key to enable AI-powered damage detection
            </HelperText>
          )}

          <TextInput
            label="Claude API Key"
            value={apiKey}
            onChangeText={setApiKey}
            mode="outlined"
            secureTextEntry
            right={<TextInput.Icon icon="key" />}
            placeholder="sk-ant-api03-..."
            style={styles.input}
            disabled={loading}
          />

          <Button
            mode="contained"
            onPress={handleSaveApiKey}
            loading={loading}
            disabled={loading || !apiKey.trim()}
            style={styles.button}
          >
            {hasApiKey ? 'Update API Key' : 'Save API Key'}
          </Button>
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Title title="Preferences" />
        <Card.Content>
          <View style={styles.preferenceRow}>
            <View style={styles.preferenceText}>
              <Paragraph>Auto-analyze images</Paragraph>
              <HelperText type="info">
                Automatically analyze images after upload
              </HelperText>
            </View>
            <Switch
              value={autoAnalyze}
              onValueChange={(value) => handleUpdatePreferences('autoAnalyze', value)}
            />
          </View>

          <Divider style={styles.divider} />

          <View style={styles.preferenceRow}>
            <View style={styles.preferenceText}>
              <Paragraph>Notifications</Paragraph>
              <HelperText type="info">
                Receive notifications about inspection updates
              </HelperText>
            </View>
            <Switch
              value={notifications}
              onValueChange={(value) => handleUpdatePreferences('notificationsEnabled', value)}
            />
          </View>
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Title title="About Claude AI" />
        <Card.Content>
          <Paragraph style={styles.aboutText}>
            Claude AI provides advanced computer vision capabilities for accurate vehicle damage detection.
            It can identify scratches, dents, cracks, paint damage, and more with high accuracy.
          </Paragraph>
          <Paragraph style={styles.aboutText}>
            Benefits:
            {'\n'}• More accurate damage detection
            {'\n'}• Detailed damage descriptions
            {'\n'}• Better severity assessment
            {'\n'}• Faster processing
          </Paragraph>
        </Card.Content>
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  card: {
    margin: 15,
  },
  description: {
    marginBottom: 15,
    lineHeight: 20,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  connectedText: {
    color: '#4CAF50',
    fontWeight: 'bold',
    marginLeft: 10,
  },
  updateText: {
    marginTop: 10,
    marginBottom: 5,
    fontWeight: 'bold',
  },
  input: {
    marginBottom: 15,
  },
  button: {
    marginVertical: 5,
  },
  divider: {
    marginVertical: 15,
  },
  preferenceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 5,
  },
  preferenceText: {
    flex: 1,
  },
  aboutText: {
    marginBottom: 10,
    lineHeight: 20,
  },
});

export default SettingsScreen;
