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
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '700',
        },
        tabBarItemStyle: {
          minHeight: 54,
        },
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          height: 62,
          paddingBottom: 5,
          paddingTop: 4,
        },
      }}
    >
      <Tabs.Screen name="home" options={{ title: 'Home' }} />
      <Tabs.Screen name="find" options={{ title: 'Find Gear' }} />
      <Tabs.Screen name="shops" options={{ title: 'Shops' }} />
      <Tabs.Screen name="catalogue" options={{ title: 'Catalogue' }} />
    </Tabs>
  );
}
