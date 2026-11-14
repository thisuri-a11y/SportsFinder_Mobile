import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider, useAuth } from '../auth/AuthProvider';
import { DatabaseGate } from '../db/DatabaseGate';

export default function RootLayout() {
  return (
    <DatabaseGate>
      <AuthProvider>
        <StatusBar style="dark" />
        <RootNavigator />
      </AuthProvider>
    </DatabaseGate>
  );
}

function RootNavigator() {
  const { account, bootstrapError, isLoading } = useAuth();

  return (
    <Stack id="root-stack" screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />

      <Stack.Protected guard={!isLoading && !bootstrapError && !account}>
        <Stack.Screen name="login" />
      </Stack.Protected>

      <Stack.Protected guard={!isLoading && !bootstrapError && Boolean(account)}>
        <Stack.Screen name="(tabs)" />
      </Stack.Protected>
    </Stack>
  );
}
