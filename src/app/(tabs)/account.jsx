import { useRef, useState } from 'react';
import Feather from '@expo/vector-icons/Feather';
import Constants from 'expo-constants';
import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { updateAccountPassword } from '../../auth/accounts';
import { useAuth } from '../../auth/AuthProvider';
import { AppButton, ScreenContainer, ScreenTitle, SectionTitle } from '../../components/browse-ui';
import { colors, type } from '../../components/theme';
import { useDatabase } from '../../db/DatabaseGate';

const ROLES = { buyer: 'User', shop_owner: 'Shop owner', admin: 'Admin' };

export default function AccountScreen() {
  const { account, signOut } = useAuth();
  const database = useDatabase();
  const [editingPassword, setEditingPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [notice, setNotice] = useState(null);
  const [busy, setBusy] = useState(false);
  const busyRef = useRef(false);

  if (!account) return null;

  function closePasswordForm() {
    setEditingPassword(false);
    setCurrentPassword('');
    setNewPassword('');
  }

  async function runAccountAction(action) {
    if (busyRef.current) return;
    busyRef.current = true;
    setBusy(true);
    setNotice(null);
    try {
      await action();
    } catch (error) {
      setNotice({ message: error.message || 'Try again.', error: true });
    } finally {
      busyRef.current = false;
      setBusy(false);
    }
  }

  function savePassword() {
    return runAccountAction(async () => {
      await updateAccountPassword(database, account, { currentPassword, newPassword });
      closePasswordForm();
      setNotice({ message: 'Password updated.' });
    });
  }

  return (
    <ScreenContainer>
      <ScreenTitle title="Account" />
      <View style={styles.profile}>
        <View style={styles.avatar}>
          <Feather name="user" size={26} color={colors.forest} aria-hidden />
        </View>
        <View style={styles.rowCopy}>
          <Text style={styles.username}>{account.username}</Text>
          <Text style={styles.role}>{ROLES[account.role]}</Text>
        </View>
      </View>

      <View>
        <SectionTitle title="Settings" />
        <View style={styles.settings}>
          {account.role !== 'buyer' && (
            <AccountAction icon="package" title="Manage shops and equipment"
              description={account.role === 'admin' ? 'Manage listings across all shops.' : 'Manage your shops and products.'}
              onPress={() => router.navigate('/manage')} disabled={busy} />
          )}
          {!editingPassword && (
            <AccountAction icon="lock" title="Change password" disabled={busy} onPress={() => {
              setNotice(null);
              setEditingPassword(true);
            }} />
          )}
          {editingPassword && (
            <View style={styles.form}>
              <Text style={styles.actionTitle}>Change password</Text>
              <PasswordField label="Current password" value={currentPassword} onChangeText={setCurrentPassword} editable={!busy} />
              <PasswordField label="New password" value={newPassword} onChangeText={setNewPassword} editable={!busy} isNew />
              <View style={styles.actions}>
                <AppButton label="Cancel" secondary disabled={busy} onPress={() => {
                  setNotice(null);
                  closePasswordForm();
                }} />
                <AppButton label={busy ? 'Saving…' : 'Save password'} disabled={busy} onPress={savePassword} />
              </View>
            </View>
          )}
          <View style={styles.offline}>
            <Feather name="wifi-off" size={20} color={colors.green} aria-hidden />
            <View style={styles.rowCopy}>
              <Text style={styles.actionTitle}>Local storage</Text>
              <Text style={styles.description}>Your account and catalogue are saved on this device.</Text>
            </View>
          </View>
        </View>
      </View>

      {notice && (
        <Text accessibilityRole={notice.error ? 'alert' : 'status'} style={notice.error ? styles.error : styles.description}>
          {notice.message}
        </Text>
      )}
      <AppButton label="Sign out" secondary disabled={busy} onPress={() => runAccountAction(signOut)} />
      <Text style={styles.version}>SportFinder {Constants.expoConfig?.version ?? '1.0.0'}</Text>
    </ScreenContainer>
  );
}

function AccountAction({ icon, title, description, onPress, disabled }) {
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={title} accessibilityHint={description}
      disabled={disabled} onPress={onPress} style={({ pressed }) => [styles.action, pressed && styles.pressed]}>
      <Feather name={icon} size={20} color={colors.green} aria-hidden />
      <View style={styles.rowCopy}>
        <Text style={styles.actionTitle}>{title}</Text>
        {description && <Text style={styles.description}>{description}</Text>}
      </View>
      <Feather name="chevron-right" size={20} color={colors.muted} aria-hidden />
    </Pressable>
  );
}

function PasswordField({ label, value, onChangeText, editable, isNew = false }) {
  return (
    <View style={styles.field}>
      <Text style={styles.actionTitle}>{label}</Text>
      <TextInput accessibilityLabel={label} value={value} onChangeText={onChangeText} editable={editable}
        style={styles.input} secureTextEntry autoCapitalize="none" autoCorrect={false}
        autoComplete={isNew ? 'new-password' : 'current-password'}
        placeholder={isNew ? 'At least 8 characters' : undefined} placeholderTextColor={colors.muted} />
    </View>
  );
}

const styles = StyleSheet.create({
  profile: { flexDirection: 'row', alignItems: 'center', gap: 14, padding: 20, borderRadius: 20, backgroundColor: colors.forest },
  avatar: { alignItems: 'center', justifyContent: 'center', backgroundColor: colors.amber, width: 52, height: 52, borderRadius: 16 },
  rowCopy: { flex: 1, minWidth: 0 },
  username: { ...type.display, color: colors.surface, fontSize: 25 },
  role: { ...type.label, color: colors.mint, marginTop: 4 },
  settings: { backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1, borderRadius: 18, overflow: 'hidden' },
  action: { alignItems: 'center', flexDirection: 'row', minHeight: 58, gap: 12, padding: 15, borderBottomColor: colors.border, borderBottomWidth: 1 },
  pressed: { backgroundColor: colors.mint },
  actionTitle: { ...type.label, color: colors.ink, fontSize: 15 },
  offline: { alignItems: 'center', flexDirection: 'row', gap: 12, padding: 15 },
  description: { ...type.body, color: colors.muted, fontSize: 14, lineHeight: 20 },
  error: { ...type.body, color: colors.danger, fontSize: 14 },
  form: { gap: 12, padding: 15, borderBottomColor: colors.border, borderBottomWidth: 1 },
  field: { gap: 6 },
  input: { ...type.body, backgroundColor: colors.background, borderColor: colors.border, borderWidth: 1, borderRadius: 10, minHeight: 46, paddingHorizontal: 12, fontSize: 16, color: colors.ink },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  version: { textAlign: 'center', color: colors.muted, fontSize: 12 },
});
