import { View, Text, StyleSheet, TouchableOpacity, ScrollView, RefreshControl } from 'react-native';
import { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { trpc } from '../utils/trpc';
import type { SystemStatus } from '@multi-shop/shared';

export default function HealthCheckScreen() {
  const [lastRefresh, setLastRefresh] = useState(new Date());

  const {
    data: healthData,
    isLoading,
    refetch,
    error
  } = trpc.health.check.useQuery(undefined, {
    refetchInterval: 30000, // Refresh every 30 seconds
    onSuccess: () => {
      setLastRefresh(new Date());
    },
    retry: 2,
    retryDelay: 1000,
  });

  const handleRefresh = async () => {
    await refetch();
  };

  const getStatusColor = (isHealthy: boolean) => {
    return isHealthy ? '#10b981' : '#ef4444';
  };

  const getStatusIcon = (isHealthy: boolean) => {
    return isHealthy ? '✅' : '❌';
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString();
  };

  return (
    <View style={styles.container}>
      <StatusBar style="auto" />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={handleRefresh} />
        }
      >
        {error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorTitle}>Connection Error</Text>
            <Text style={styles.errorText}>
              Unable to connect to the health check API. Please ensure the server is running and try again.
            </Text>
            <TouchableOpacity style={styles.retryButton} onPress={handleRefresh}>
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : isLoading && !healthData ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Checking system status...</Text>
          </View>
        ) : (
          <>
            {/* Main Status */}
            <View style={styles.statusCard}>
              <Text style={styles.statusTitle}>System Status</Text>
              <View style={styles.statusRow}>
                <Text style={styles.statusIcon}>
                  {getStatusIcon(healthData?.system.status === 'healthy')}
                </Text>
                <Text
                  style={[
                    styles.statusText,
                    { color: getStatusColor(healthData?.system.status === 'healthy') }
                  ]}
                >
                  {healthData?.system.status === 'healthy' ? 'System Operational' : 'System Unhealthy'}
                </Text>
              </View>
            </View>

            {/* Detailed Status */}
            <View style={styles.grid}>
              <View style={styles.statusItem}>
                <Text style={styles.itemTitle}>Database</Text>
                <View style={styles.statusRow}>
                  <Text style={styles.statusIcon}>
                    {getStatusIcon(healthData?.system.database || false)}
                  </Text>
                  <Text
                    style={[
                      styles.itemStatus,
                      { color: getStatusColor(healthData?.system.database || false) }
                    ]}
                  >
                    {healthData?.system.database ? 'Connected' : 'Disconnected'}
                  </Text>
                </View>
              </View>

              <View style={styles.statusItem}>
                <Text style={styles.itemTitle}>Authentication</Text>
                <View style={styles.statusRow}>
                  <Text style={styles.statusIcon}>
                    {getStatusIcon(healthData?.system.auth || false)}
                  </Text>
                  <Text
                    style={[
                      styles.itemStatus,
                      { color: getStatusColor(healthData?.system.auth || false) }
                    ]}
                  >
                    {healthData?.system.auth ? 'Operational' : 'Offline'}
                  </Text>
                </View>
              </View>

              <View style={styles.statusItem}>
                <Text style={styles.itemTitle}>Response Time</Text>
                <Text style={styles.responseTime}>
                  {healthData?.system.responseTime}ms
                </Text>
              </View>

              <View style={styles.statusItem}>
                <Text style={styles.itemTitle}>Last Checked</Text>
                <Text style={styles.lastChecked}>
                  {formatTime(lastRefresh)}
                </Text>
              </View>
            </View>

            {/* System Info */}
            <View style={styles.infoCard}>
              <Text style={styles.infoTitle}>System Information</Text>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Version:</Text>
                <Text style={styles.infoValue}>{healthData?.version}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Environment:</Text>
                <Text style={styles.infoValue}>{healthData?.environment}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Platform:</Text>
                <Text style={styles.infoValue}>React Native / Expo</Text>
              </View>
            </View>

            <TouchableOpacity style={styles.refreshButton} onPress={handleRefresh}>
              <Text style={styles.refreshButtonText}>
                {isLoading ? 'Checking...' : 'Refresh Status'}
              </Text>
            </TouchableOpacity>
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  scrollContent: {
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 200,
  },
  loadingText: {
    fontSize: 16,
    color: '#6b7280',
  },
  statusCard: {
    backgroundColor: '#ffffff',
    padding: 24,
    borderRadius: 12,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statusTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 16,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  statusText: {
    fontSize: 18,
    fontWeight: '600',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
    gap: 16,
  },
  statusItem: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 8,
    width: '47%',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  itemTitle: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 8,
  },
  itemStatus: {
    fontSize: 14,
    fontWeight: '500',
  },
  responseTime: {
    fontSize: 16,
    color: '#2563eb',
    fontWeight: '600',
  },
  lastChecked: {
    fontSize: 14,
    color: '#6b7280',
  },
  infoCard: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 24,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 14,
    color: '#6b7280',
  },
  infoValue: {
    fontSize: 14,
    color: '#1f2937',
    fontWeight: '500',
  },
  refreshButton: {
    backgroundColor: '#2563eb',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16,
  },
  refreshButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  errorContainer: {
    backgroundColor: '#fef2f2',
    padding: 20,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#fecaca',
    marginBottom: 16,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#dc2626',
    marginBottom: 8,
  },
  errorText: {
    fontSize: 14,
    color: '#7f1d1d',
    lineHeight: 20,
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#dc2626',
    padding: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  retryButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
});