import { Stack } from 'expo-router';

export const unstable_settings = { initialRouteName: 'index' };

export default function ShopsLayout() {
  return (
    <Stack id="shops-stack" screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="[id]" />
    </Stack>
  );
}
