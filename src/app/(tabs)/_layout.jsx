import { Tabs } from 'expo-router';
import { colors } from '../../components/theme';

export default function TabsLayout() {
  return (
    <Tabs
      id="main-tabs"
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.forest,
        tabBarInactiveTintColor: colors.muted,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
        },
      }}
    >
      <Tabs.Screen name="home" options={{ title: 'Home' }} />
    </Tabs>
  );
}
