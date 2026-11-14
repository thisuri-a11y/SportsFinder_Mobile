import { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../auth/AuthProvider';
import { colors } from '../components/theme';

export default function LoginScreen() {
  const { createUserAccount, signIn } = useAuth();
  const [mode, setMode] = useState('sign-in');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isNewAccount = mode !== 'sign-in';
  const title = mode === 'buyer'
    ? 'Create buyer account'
    : mode === 'shop_owner' ? 'Create shop owner account' : 'Sign in';

  async function submit() {
    if (isSubmitting) return;
    setError('');
    setIsSubmitting(true);

    try {
      if (isNewAccount) {
        await createUserAccount({ username, password }, mode);
      } else {
        await signIn({ username, password });
      }
    } catch (submitError) {
      setError(submitError.message || 'Could not complete this action. Try again.');
    } finally {
      setIsSubmitting(false);
    }
  }

  function changeMode(nextMode) {
    setMode(nextMode);
    setError('');
    setPassword('');
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.card}>
            <View style={styles.brandMark}>
              <Text style={styles.brandMarkText}>S</Text>
            </View>
            <Text style={styles.brand}>SportFinder</Text>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.subtitle}>
              Find sports equipment across Sri Lanka.
            </Text>

            <View style={styles.modeList}>
              <ModeButton
                active={mode === 'buyer'}
                label="Create buyer account"
                onPress={() => changeMode('buyer')}
              />
              <ModeButton
                active={mode === 'shop_owner'}
                label="Create shop owner account"
                onPress={() => changeMode('shop_owner')}
              />
              <ModeButton
                active={mode === 'sign-in'}
                label="Sign in"
                onPress={() => changeMode('sign-in')}
              />
            </View>

            <Text style={styles.label}>Username</Text>
            <TextInput
              accessibilityLabel="Username"
              autoCapitalize="none"
              autoCorrect={false}
              maxLength={64}
              onChangeText={setUsername}
              onSubmitEditing={submit}
              placeholder="Your username"
              placeholderTextColor={colors.muted}
              returnKeyType="next"
              style={styles.input}
              textContentType="username"
              value={username}
            />

            <Text style={styles.label}>Password</Text>
            <TextInput
              accessibilityLabel="Password"
              autoCapitalize="none"
              onChangeText={setPassword}
              onSubmitEditing={submit}
              placeholder={isNewAccount ? 'At least 8 characters' : 'Your password'}
              placeholderTextColor={colors.muted}
              returnKeyType="done"
              secureTextEntry
              style={styles.input}
              textContentType={isNewAccount ? 'newPassword' : 'password'}
              value={password}
            />

            {error ? (
              <Text accessibilityRole="alert" style={styles.error}>{error}</Text>
            ) : null}

            <Pressable
              accessibilityRole="button"
              disabled={isSubmitting}
              onPress={submit}
              style={({ pressed }) => [
                styles.submitButton,
                pressed && !isSubmitting && styles.pressed,
                isSubmitting && styles.disabled,
              ]}
            >
              {isSubmitting ? (
                <ActivityIndicator color={colors.surface} />
              ) : (
                <Text style={styles.submitButtonText}>{title}</Text>
              )}
            </Pressable>

            <Text style={styles.hint}>
              Usernames are 3–32 characters. New passwords need at least 8 characters.
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function ModeButton({ active, label, onPress }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      onPress={onPress}
      style={[styles.modeButton, active && styles.modeButtonActive]}
    >
      <Text style={[styles.modeButtonText, active && styles.modeButtonTextActive]}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 22,
  },
  card: {
    alignSelf: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 24,
    borderWidth: 1,
    maxWidth: 440,
    padding: 24,
    width: '100%',
  },
  brandMark: {
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: colors.forest,
    borderRadius: 18,
    height: 54,
    justifyContent: 'center',
    marginBottom: 10,
    width: 54,
  },
  brandMarkText: {
    color: colors.surface,
    fontSize: 30,
    fontWeight: '800',
  },
  brand: {
    color: colors.forest,
    fontSize: 17,
    fontWeight: '700',
    textAlign: 'center',
  },
  title: {
    color: colors.ink,
    fontSize: 25,
    fontWeight: '800',
    marginTop: 24,
    textAlign: 'center',
  },
  subtitle: {
    color: colors.muted,
    fontSize: 14,
    marginTop: 7,
    textAlign: 'center',
  },
  modeList: {
    gap: 8,
    marginTop: 24,
    marginBottom: 20,
  },
  modeButton: {
    alignItems: 'center',
    borderColor: colors.border,
    borderRadius: 12,
    borderWidth: 1,
    justifyContent: 'center',
    minHeight: 43,
    paddingHorizontal: 10,
  },
  modeButtonActive: {
    backgroundColor: colors.mint,
    borderColor: colors.forest,
  },
  modeButtonText: {
    color: colors.muted,
    fontSize: 14,
    fontWeight: '600',
  },
  modeButtonTextActive: {
    color: colors.forest,
  },
  label: {
    color: colors.ink,
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 7,
    marginTop: 12,
  },
  input: {
    backgroundColor: colors.background,
    borderColor: colors.border,
    borderRadius: 12,
    borderWidth: 1,
    color: colors.ink,
    fontSize: 16,
    minHeight: 50,
    paddingHorizontal: 14,
  },
  error: {
    color: colors.danger,
    fontSize: 14,
    lineHeight: 20,
    marginTop: 12,
  },
  submitButton: {
    alignItems: 'center',
    backgroundColor: colors.forest,
    borderRadius: 14,
    justifyContent: 'center',
    marginTop: 20,
    minHeight: 52,
  },
  submitButtonText: {
    color: colors.surface,
    fontSize: 16,
    fontWeight: '700',
  },
  pressed: {
    opacity: 0.82,
  },
  disabled: {
    opacity: 0.65,
  },
  hint: {
    color: colors.muted,
    fontSize: 12,
    lineHeight: 18,
    marginTop: 14,
    textAlign: 'center',
  },
});
