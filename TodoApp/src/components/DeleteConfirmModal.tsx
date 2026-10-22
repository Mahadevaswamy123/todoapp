import React from 'react';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import type { Task } from '../types';
import { colors } from '../theme';

interface Props {
  visible: boolean;
  task: Task | null;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function DeleteConfirmModal({
  visible,
  task,
  loading = false,
  onConfirm,
  onCancel,
}: Props): React.JSX.Element {
  if (!task) return <></>;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <Pressable style={styles.backdrop} onPress={onCancel}>
        <Pressable style={styles.dialog} onPress={(e) => e.stopPropagation()}>
          <View style={styles.iconCircle}>
            <Text style={styles.iconText}>🗑️</Text>
          </View>

          <Text style={styles.title}>Delete Task?</Text>
          <Text style={styles.description}>
            Are you sure you want to delete <Text style={styles.taskTitle}>“{task.title}”</Text>? This action cannot be undone.
          </Text>

          <View style={styles.btnRow}>
            <Pressable
              onPress={onCancel}
              disabled={loading}
              style={[styles.btn, styles.cancelBtn]}
            >
              <Text style={styles.cancelText}>Cancel</Text>
            </Pressable>

            <Pressable
              onPress={onConfirm}
              disabled={loading}
              style={[styles.btn, styles.deleteBtn]}
            >
              {loading ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.deleteText}>Delete Task</Text>
              )}
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(5, 8, 14, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  dialog: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: '#121826',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 99, 132, 0.25)',
    padding: 24,
    alignItems: 'center',
  },
  iconCircle: {
    width: 58,
    height: 58,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 99, 132, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255, 99, 132, 0.35)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  iconText: {
    fontSize: 26,
  },
  title: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.3,
    marginBottom: 8,
  },
  description: {
    color: colors.muted,
    fontSize: 14,
    lineHeight: 21,
    textAlign: 'center',
    marginBottom: 24,
  },
  taskTitle: {
    color: '#fff',
    fontWeight: '700',
  },
  btnRow: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  btn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelBtn: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cancelText: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '700',
  },
  deleteBtn: {
    backgroundColor: colors.coral,
  },
  deleteText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
});
