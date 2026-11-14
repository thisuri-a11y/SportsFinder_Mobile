import { Stack } from 'expo-router';
import { useFonts } from 'expo-font';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider, useAuth } from '../auth/AuthProvider';
import { DatabaseGate } from '../db/DatabaseGate';

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    'Exo2-Regular': require('../../assets/fonts/Exo2-Regular.ttf'),
    'Exo2-SemiBold': require('../../assets/fonts/Exo2-SemiBold.ttf'),
    'Audiowide-Regular': require('../../assets/fonts/Audiowide-Regular.ttf'),
  });

  return (
    <DatabaseGate>
      {(fontsLoaded || fontError) && (
        <AuthProvider>
          <RootNavigator />
        </AuthProvider>
      )}
    </DatabaseGate>
  );
}

function RootNavigator() {
  const { account, bootstrapError, isLoading } = useAuth();

  return (
    <>
      <StatusBar style={account ? 'light' : 'dark'} />
      <Stack id="root-stack" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />

        <Stack.Protected guard={!isLoading && !bootstrapError && !account}>
          <Stack.Screen name="login" />
        </Stack.Protected>

        <Stack.Protected guard={!isLoading && !bootstrapError && Boolean(account)}>
          <Stack.Screen name="(tabs)" />
        </Stack.Protected>
      </Stack>
    </>
  );
}
