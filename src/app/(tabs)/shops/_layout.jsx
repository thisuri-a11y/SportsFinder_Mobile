import { Stack } from 'expo-router';

export default function ShopsLayout() {
  return (
    <Stack id="shops-stack" screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="[id]" />
    </Stack>
  );
}
