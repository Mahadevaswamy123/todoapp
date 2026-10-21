import React from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View, Pressable } from 'react-native';
import { useAuthStore } from '../stores/authStore';
import { colors, spacing } from '../theme';
import { ErrorBanner, Field, PrimaryButton, Eyebrow } from '../components/Ui';

export function AuthScreen(): React.JSX.Element {
  const [mode, setMode] = React.useState<'login' | 'register'>('login');
  const [name, setName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [error, setError] = React.useState('');
  const [loading, setLoading] = React.useState(false);

  const signIn = useAuthStore((state) => state.signIn);
  const signUp = useAuthStore((state) => state.signUp);

  const submit = async () => {
    setError('');

    if (mode === 'register' && name.trim().length < 2) {
      return setError('Please enter your name (at least 2 characters).');
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      return setError('Enter a valid email address.');
    }
    if (password.length < 8) {
      return setError('Use a password with at least 8 characters.');
    }

    setLoading(true);
    try {
      if (mode === 'login') {
        await signIn(email, password);
      } else {
        await signUp(name, email, password);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.root} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={styles.glow} />

        <View style={styles.brandRow}>
          <View style={styles.logo}><Text style={styles.logoText}>✦</Text></View>
          <Text style={styles.brand}>taskflow</Text>
        </View>

        <View style={styles.hero}>
          <Eyebrow>YOUR DAY, IN FLOW</Eyebrow>
          <Text style={styles.heading}>{mode === 'login' ? 'Make space for\nwhat matters.' : 'A fresh start\nstarts here.'}</Text>
          <Text style={styles.subheading}>A calmer way to plan, focus, and finish what you start.</Text>
        </View>

        <View style={styles.panel}>
          <View style={styles.tabs}>
            <Pressable onPress={() => { setMode('login'); setError(''); }} style={[styles.tab, mode === 'login' && styles.activeTab]}>
              <Text style={[styles.tabText, mode === 'login' && styles.activeTabText]}>Sign in</Text>
            </Pressable>
            <Pressable onPress={() => { setMode('register'); setError(''); }} style={[styles.tab, mode === 'register' && styles.activeTab]}>
              <Text style={[styles.tabText, mode === 'register' && styles.activeTabText]}>Create account</Text>
            </Pressable>
          </View>

          {mode === 'register' ? (
            <>
              <Text style={styles.label}>YOUR NAME</Text>
              <Field value={name} onChangeText={setName} placeholder="Alex Morgan" autoCapitalize="words" returnKeyType="next" />
            </>
          ) : null}

          <Text style={[styles.label, { marginTop: 18 }]}>EMAIL ADDRESS</Text>
          <Field value={email} onChangeText={setEmail} placeholder="you@example.com" keyboardType="email-address" autoCapitalize="none" autoCorrect={false} returnKeyType="next" />

          <Text style={[styles.label, { marginTop: 18 }]}>PASSWORD</Text>
          <Field value={password} onChangeText={setPassword} placeholder="At least 8 characters" secureTextEntry returnKeyType="done" onSubmitEditing={() => void submit()} />

          <ErrorBanner message={error} />
          <PrimaryButton title={mode === 'login' ? 'Sign in  →' : 'Create account  →'} onPress={() => void submit()} loading={loading} />

          <Text style={styles.footnote}>Your tasks. Your pace. One clear next step.</Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  scroll: { flexGrow: 1, paddingHorizontal: 24, paddingTop: 28, paddingBottom: 30, overflow: 'hidden' },
  glow: { position: 'absolute', top: -130, right: -130, width: 320, height: 320, borderRadius: 160, backgroundColor: '#282052', opacity: 0.7 },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  logo: { width: 36, height: 36, borderRadius: 13, backgroundColor: colors.violet, alignItems: 'center', justifyContent: 'center' },
  logoText: { color: colors.white, fontSize: 22, fontWeight: '900' },
  brand: { color: colors.text, fontSize: 21, fontWeight: '800', letterSpacing: -0.6 },
  hero: { marginTop: 44, marginBottom: 30, gap: 13 },
  heading: { color: colors.text, fontSize: 39, fontWeight: '800', letterSpacing: -1.4, lineHeight: 44 },
  subheading: { color: colors.muted, fontSize: 14, lineHeight: 22, maxWidth: 300 },
  panel: { backgroundColor: '#10172A', borderWidth: 1, borderColor: colors.border, borderRadius: 24, padding: 18 },
  tabs: { flexDirection: 'row', padding: 4, borderRadius: 13, backgroundColor: colors.background, marginBottom: 22 },
  tab: { flex: 1, paddingVertical: 11, borderRadius: 10, alignItems: 'center' },
  activeTab: { backgroundColor: colors.surfaceRaised },
  tabText: { color: colors.muted, fontWeight: '600', fontSize: 13 },
  activeTabText: { color: colors.text },
  label: { color: colors.muted, fontSize: 10, fontWeight: '800', letterSpacing: 1.4 },
  footnote: { color: colors.muted, textAlign: 'center', fontSize: 11, marginTop: 18 },
});
