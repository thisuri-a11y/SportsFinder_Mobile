import { Tabs } from 'expo-router';
import Feather from '@expo/vector-icons/Feather';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../auth/AuthProvider';
import { colors, type } from '../../components/theme';

function AppHeader() {
  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={styles.header}>
      <View style={styles.headerInner}>
        <View style={styles.mark}>
          <Feather name="activity" size={20} color={colors.forest} aria-hidden />
        </View>
        <Text accessibilityRole="header" style={styles.wordmark}>SportFinder</Text>
      </View>
    </SafeAreaView>
  );
}

function tabIcon(name) {
  return function TabIcon({ color, focused }) {
    return (
      <View style={[styles.icon, focused && styles.activeIcon]}>
        <Feather name={name} size={20} color={color} aria-hidden />
      </View>
    );
  };
}

const TAB_OPTIONS = {
  home: { title: 'Home', tabBarIcon: tabIcon('home') },
  find: { title: 'Find Gear', tabBarIcon: tabIcon('search') },
  shops: { title: 'Shops', tabBarIcon: tabIcon('shopping-bag'), popToTopOnBlur: true },
  catalogue: { title: 'Catalogue', tabBarIcon: tabIcon('grid') },
  account: { title: 'Account', tabBarIcon: tabIcon('user') },
  manage: { title: 'Manage', tabBarIcon: tabIcon('package') },
};

export const unstable_settings = { initialRouteName: 'home' };

export default function TabsLayout() {
  const { account } = useAuth();
  const { bottom } = useSafeAreaInsets();

  return (
    <Tabs
      id="main-tabs"
      initialRouteName="home"
      backBehavior="history"
      screenOptions={{
        header: AppHeader,
        tabBarHideOnKeyboard: true,
        tabBarLabelPosition: 'below-icon',
        tabBarActiveTintColor: colors.forest,
        tabBarInactiveTintColor: colors.muted,
        tabBarLabelStyle: {
          ...type.label,
          fontSize: 10,
        },
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          height: 64 + bottom,
          paddingBottom: 5 + bottom,
          paddingTop: 5,
        },
      }}
    >
      <Tabs.Screen name="home" options={TAB_OPTIONS.home} />
      <Tabs.Screen name="find" options={TAB_OPTIONS.find} />
      <Tabs.Screen name="shops" options={TAB_OPTIONS.shops} />
      <Tabs.Screen name="catalogue" options={TAB_OPTIONS.catalogue} />
      <Tabs.Protected guard={account?.role === 'admin' || account?.role === 'shop_owner'}>
        <Tabs.Screen name="manage" options={TAB_OPTIONS.manage} />
      </Tabs.Protected>
      <Tabs.Screen name="account" options={TAB_OPTIONS.account} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: colors.forest,
    borderBottomWidth: 2,
    borderBottomColor: colors.green,
  },
  headerInner: {
    alignItems: 'center',
    alignSelf: 'center',
    flexDirection: 'row',
    gap: 10,
    maxWidth: 1060,
    minHeight: 54,
    paddingHorizontal: 18,
    width: '100%',
  },
  mark: {
    alignItems: 'center',
    backgroundColor: colors.amber,
    borderRadius: 10,
    height: 32,
    justifyContent: 'center',
    width: 32,
  },
  wordmark: {
    ...type.display,
    color: colors.surface,
    fontSize: 22,
    fontStyle: 'italic',
  },
  icon: {
    alignItems: 'center',
    borderRadius: 13,
    height: 29,
    justifyContent: 'center',
    width: 42,
  },
  activeIcon: {
    backgroundColor: colors.mint,
  },
});
