import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { TRPCProvider } from '../providers/trpc-provider';

export default function RootLayout() {
  return (
    <TRPCProvider>
      <StatusBar style="auto" />
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: '#f9fafb',
          },
          headerTintColor: '#1f2937',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      >
        <Stack.Screen
          name="index"
          options={{
            title: 'System Health Check',
            headerShown: true,
          }}
        />
        <Stack.Screen
          name="health-check"
          options={{
            title: 'Health Check Details',
            headerShown: true,
          }}
        />
      </Stack>
    </TRPCProvider>
  );
}