import React from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  type TextInputProps,
  type ViewStyle,
} from 'react-native';
import { colors, spacing } from '../theme';

export function Field(props: TextInputProps): React.JSX.Element {
  return (
    <TextInput
      placeholderTextColor={colors.muted}
      selectionColor={colors.violet}
      {...props}
      style={[styles.field, props.style]}
    />
  );
}

export function PrimaryButton({
  title,
  onPress,
  loading = false,
  disabled = false,
  style,
}: {
  title: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
}): React.JSX.Element {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.button,
        (pressed || disabled || loading) && styles.buttonMuted,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={colors.background} />
      ) : (
        <Text style={styles.buttonText}>{title}</Text>
      )}
    </Pressable>
  );
}

export function Eyebrow({ children }: { children: React.ReactNode }): React.JSX.Element {
  return <Text style={styles.eyebrow}>{children}</Text>;
}

export function ErrorBanner({ message }: { message: string }): React.JSX.Element | null {
  if (!message) return null;
  return (
    <View style={styles.error}>
      <Text style={styles.errorText}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  field: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 15,
    color: colors.text,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    marginTop: 8,
  },
  button: {
    backgroundColor: colors.mint,
    borderRadius: 15,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.md,
    minHeight: 52,
  },
  buttonMuted: { opacity: 0.65 },
  buttonText: { color: colors.background, fontWeight: '800', fontSize: 15 },
  eyebrow: { color: colors.mint, textTransform: 'uppercase', letterSpacing: 2.2, fontSize: 10, fontWeight: '800' },
  error: { backgroundColor: '#3B202D', borderColor: '#73384A', borderWidth: 1, borderRadius: 12, padding: 12, marginTop: 12 },
  errorText: { color: '#FFC4CF', fontSize: 13, lineHeight: 18 },
});
