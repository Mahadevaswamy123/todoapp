import React from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { Category, Priority, RootStackParamList } from '../types';
import { api } from '../api/client';
import { colors, spacing } from '../theme';
import { ErrorBanner, Field, PrimaryButton, Eyebrow } from '../components/Ui';

type Props = NativeStackScreenProps<RootStackParamList, 'CreateTask'>;

const CATEGORIES: Category[] = ['General', 'Work', 'Personal', 'Study', 'Urgent'];

export function CreateTaskScreen({ navigation }: Props): React.JSX.Element {
  const [title, setTitle] = React.useState('');
  const [description, setDescription] = React.useState('');
  const [dateTimeStr, setDateTimeStr] = React.useState('');
  const [deadlineStr, setDeadlineStr] = React.useState('');
  const [priority, setPriority] = React.useState<Priority>('medium');
  const [category, setCategory] = React.useState<Category>('General');

  const [error, setError] = React.useState('');
  const [loading, setLoading] = React.useState(false);

  const parseDateTimeInput = (input: string): string | null => {
    const trimmed = input.trim();
    if (!trimmed) return null;

    // YYYY-MM-DD
    if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
      const d = new Date(`${trimmed}T12:00:00`);
      return Number.isNaN(d.getTime()) ? 'INVALID' : d.toISOString();
    }

    // YYYY-MM-DD HH:mm
    if (/^\d{4}-\d{2}-\d{2}\s\d{2}:\d{2}$/.test(trimmed)) {
      const [datePart, timePart] = trimmed.split(' ');
      const d = new Date(`${datePart}T${timePart}:00`);
      return Number.isNaN(d.getTime()) ? 'INVALID' : d.toISOString();
    }

    const fallback = new Date(trimmed);
    return Number.isNaN(fallback.getTime()) ? 'INVALID' : fallback.toISOString();
  };

  const submit = async () => {
    setError('');

    if (!title.trim()) {
      return setError('Please enter a task title.');
    }

    let isoDateTime: string | null = null;
    if (dateTimeStr.trim()) {
      const parsed = parseDateTimeInput(dateTimeStr);
      if (parsed === 'INVALID') {
        return setError('Date-Time format should be YYYY-MM-DD or YYYY-MM-DD HH:mm');
      }
      isoDateTime = parsed;
    }

    let isoDeadline: string | null = null;
    if (deadlineStr.trim()) {
      const parsed = parseDateTimeInput(deadlineStr);
      if (parsed === 'INVALID') {
        return setError('Deadline format should be YYYY-MM-DD or YYYY-MM-DD HH:mm');
      }
      isoDeadline = parsed;
    }

    setLoading(true);
    try {
      await api.createTask({
        title: title.trim(),
        description: description.trim(),
        dateTime: isoDateTime,
        deadline: isoDeadline,
        priority,
        category,
      });

      navigation.goBack();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to create task.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.root} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.topRow}>
          <Pressable onPress={() => navigation.goBack()} style={styles.close}>
            <Text style={styles.closeText}>×</Text>
          </Pressable>
          <Text style={styles.topTitle}>NEW TASK</Text>
          <View style={{ width: 40 }} />
        </View>

        <View style={styles.hero}>
          <Eyebrow>TASK DETAILS</Eyebrow>
          <Text style={styles.heading}>Create a task</Text>
          <Text style={styles.subheading}>Fill in the task info and schedule.</Text>
        </View>

        <View style={styles.form}>
          {/* Title */}
          <Text style={styles.label}>TITLE *</Text>
          <Field
            value={title}
            onChangeText={setTitle}
            placeholder="e.g. Finish database migration"
            maxLength={120}
            autoFocus
          />

          {/* Description */}
          <Text style={[styles.label, { marginTop: 18 }]}>DESCRIPTION</Text>
          <Field
            value={description}
            onChangeText={setDescription}
            placeholder="Detailed notes or sub-tasks..."
            multiline
            numberOfLines={3}
            maxLength={1000}
            style={styles.notesInput}
          />

          {/* Date-Time */}
          <Text style={[styles.label, { marginTop: 18 }]}>DATE-TIME (SCHEDULED)</Text>
          <Field
            value={dateTimeStr}
            onChangeText={setDateTimeStr}
            placeholder="YYYY-MM-DD HH:mm (e.g. 2026-11-05 10:00)"
            autoCapitalize="none"
          />

          {/* Deadline */}
          <Text style={[styles.label, { marginTop: 18 }]}>DEADLINE</Text>
          <Field
            value={deadlineStr}
            onChangeText={setDeadlineStr}
            placeholder="YYYY-MM-DD HH:mm (e.g. 2026-11-05 18:00)"
            autoCapitalize="none"
          />

          {/* Priority */}
          <Text style={[styles.label, { marginTop: 20 }]}>PRIORITY</Text>
          <View style={styles.priorityRow}>
            {(['low', 'medium', 'high'] as Priority[]).map((val) => {
              const active = priority === val;
              const tint = val === 'low' ? colors.mint : val === 'medium' ? colors.amber : colors.coral;
              return (
                <Pressable
                  key={val}
                  onPress={() => setPriority(val)}
                  style={[styles.priority, active && { borderColor: tint, backgroundColor: `${tint}18` }]}
                >
                  <View style={[styles.dot, { backgroundColor: tint }]} />
                  <Text style={[styles.priorityText, active && { color: tint }]}>
                    {val.charAt(0).toUpperCase() + val.slice(1)}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          {/* Category */}
          <Text style={[styles.label, { marginTop: 20 }]}>CATEGORY</Text>
          <View style={styles.categoryRow}>
            {CATEGORIES.map((cat) => {
              const active = category === cat;
              return (
                <Pressable
                  key={cat}
                  onPress={() => setCategory(cat)}
                  style={[styles.categoryChip, active && styles.categoryChipActive]}
                >
                  <Text style={[styles.categoryText, active && styles.categoryTextActive]}>{cat}</Text>
                </Pressable>
              );
            })}
          </View>

          <ErrorBanner message={error} />
          <PrimaryButton title="Save task  →" onPress={() => void submit()} loading={loading} />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  content: { padding: 22, paddingBottom: 35 },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  close: { width: 40, height: 40, borderRadius: 14, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' },
  closeText: { color: colors.text, fontSize: 26, lineHeight: 28 },
  topTitle: { color: colors.muted, fontSize: 10, fontWeight: '900', letterSpacing: 2 },
  hero: { marginTop: 28, gap: 8 },
  heading: { color: colors.text, fontSize: 28, fontWeight: '800', letterSpacing: -0.8 },
  subheading: { color: colors.muted, fontSize: 13, lineHeight: 19 },
  form: { marginTop: 22 },
  label: { color: colors.muted, fontSize: 10, fontWeight: '800', letterSpacing: 1.3 },
  notesInput: { minHeight: 80, textAlignVertical: 'top' },
  priorityRow: { flexDirection: 'row', gap: 8, marginTop: 10 },
  priority: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 12, borderRadius: 13, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  dot: { width: 7, height: 7, borderRadius: 4 },
  priorityText: { color: colors.muted, fontSize: 12, fontWeight: '700' },
  categoryRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 10 },
  categoryChip: { paddingHorizontal: 13, paddingVertical: 8, borderRadius: 10, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  categoryChipActive: { borderColor: colors.violet, backgroundColor: '#211E48' },
  categoryText: { color: colors.muted, fontSize: 12, fontWeight: '600' },
  categoryTextActive: { color: colors.violet, fontWeight: '800' },
});
