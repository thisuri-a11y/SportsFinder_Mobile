import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { DatabaseGate } from '../db/DatabaseGate';

export default function RootLayout() {
  return (
    <DatabaseGate>
      <>
        <StatusBar style="dark" />
        <Stack
          screenOptions={{
            headerShown: false,
          }}
        >
          <Stack.Screen name="index" />
        </Stack>
      </>
    </DatabaseGate>
  );
}
