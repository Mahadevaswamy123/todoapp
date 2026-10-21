import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { Task } from '../types';
import { colors, spacing } from '../theme';

interface Props {
  task: Task;
  onToggle: () => void;
  onDelete: () => void;
}

const priorityColor = {
  low: colors.mint,
  medium: colors.amber,
  high: colors.coral,
};

function formatStamp(val: string | null): string | null {
  if (!val) return null;
  const d = new Date(val);
  if (Number.isNaN(d.getTime())) return null;

  const datePart = d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  const hasTime = d.getHours() !== 0 || d.getMinutes() !== 0;
  return hasTime
    ? `${datePart}, ${d.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })}`
    : datePart;
}

export function TaskCard({ task, onToggle, onDelete }: Props): React.JSX.Element {
  const contentText = task.description || task.notes || '';
  const formattedScheduled = formatStamp(task.dateTime);
  const formattedDeadline = formatStamp(task.deadline || task.dueDate);

  const isOverdue =
    !task.completed &&
    (task.deadline || task.dueDate) &&
    new Date(task.deadline || task.dueDate!).getTime() < Date.now();

  return (
    <View style={[styles.card, task.completed && styles.completedCard]}>
      <Pressable
        accessibilityRole="checkbox"
        accessibilityState={{ checked: task.completed }}
        onPress={onToggle}
        style={[styles.check, task.completed && styles.checked]}
      >
        {task.completed ? <Text style={styles.checkmark}>✓</Text> : null}
      </Pressable>

      <View style={styles.content}>
        <Text style={[styles.title, task.completed && styles.doneTitle]}>
          {task.title}
        </Text>

        {contentText ? (
          <Text numberOfLines={2} style={[styles.description, task.completed && styles.doneDescription]}>
            {contentText}
          </Text>
        ) : null}

        <View style={styles.meta}>
          {/* Priority */}
          <View style={styles.pill}>
            <View style={[styles.priorityDot, { backgroundColor: priorityColor[task.priority] }]} />
            <Text style={styles.metaText}>
              {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
            </Text>
          </View>

          {/* Category */}
          {task.category ? (
            <View style={[styles.pill, styles.categoryPill]}>
              <Text style={styles.categoryText}>{task.category}</Text>
            </View>
          ) : null}

          {/* Scheduled Date-Time */}
          {formattedScheduled ? (
            <View style={styles.pill}>
              <Text style={styles.metaText}>📅 {formattedScheduled}</Text>
            </View>
          ) : null}

          {/* Deadline */}
          {formattedDeadline ? (
            <View style={[styles.pill, isOverdue && styles.overduePill]}>
              <Text style={[styles.metaText, isOverdue && styles.overdueText]}>
                {isOverdue ? `Overdue (${formattedDeadline})` : `Due ${formattedDeadline}`}
              </Text>
            </View>
          ) : null}
        </View>
      </View>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Delete ${task.title}`}
        onPress={onDelete}
        hitSlop={10}
        style={styles.delete}
      >
        <Text style={styles.deleteText}>×</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 20,
    padding: spacing.md,
    marginBottom: 12,
  },
  completedCard: { opacity: 0.65 },
  check: {
    width: 24,
    height: 24,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: '#596482',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  checked: { backgroundColor: colors.mint, borderColor: colors.mint },
  checkmark: { color: colors.background, fontWeight: '900', fontSize: 13 },
  content: { flex: 1, gap: 6 },
  title: { color: colors.text, fontSize: 15, fontWeight: '700', lineHeight: 21 },
  doneTitle: { textDecorationLine: 'line-through', color: colors.muted },
  description: { color: colors.muted, fontSize: 12, lineHeight: 18 },
  doneDescription: { textDecorationLine: 'line-through', opacity: 0.6 },
  meta: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4, flexWrap: 'wrap' },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: colors.surfaceRaised,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  categoryPill: { backgroundColor: '#1C2542', borderWidth: 0.5, borderColor: '#344570' },
  categoryText: { color: colors.violet, fontSize: 10, fontWeight: '700' },
  priorityDot: { width: 6, height: 6, borderRadius: 3 },
  metaText: { color: colors.muted, fontSize: 11 },
  overduePill: { backgroundColor: '#381A22', borderWidth: 0.5, borderColor: '#692C3D' },
  overdueText: { color: colors.coral, fontWeight: '700' },
  delete: {
    width: 28,
    height: 28,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#222B43',
  },
  deleteText: { color: colors.muted, fontSize: 22, lineHeight: 24 },
});
