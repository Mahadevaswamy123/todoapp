import React from 'react';
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import type { User } from '../types';
import { colors } from '../theme';

interface Props {
  visible: boolean;
  user: User | null;
  totalTasks: number;
  completedTasks: number;
  onSignOut: () => void;
  onClose: () => void;
}

export function ProfileModal({
  visible,
  user,
  totalTasks,
  completedTasks,
  onSignOut,
  onClose,
}: Props): React.JSX.Element {
  const pendingTasks = Math.max(0, totalTasks - completedTasks);
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  const initial = user?.name ? user.name.charAt(0).toUpperCase() : 'U';

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.sheet} onPress={(e) => e.stopPropagation()}>
          {/* Header handle */}
          <View style={styles.handle} />

          {/* User info */}
          <View style={styles.userSection}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{initial}</Text>
            </View>
            <Text style={styles.userName}>{user?.name || 'Taskflow User'}</Text>
            <Text style={styles.userEmail}>{user?.email || ''}</Text>
          </View>

          {/* Quick stats grid */}
          <View style={styles.statsGrid}>
            <View style={styles.statBox}>
              <Text style={styles.statNumber}>{totalTasks}</Text>
              <Text style={styles.statLabel}>Total Tasks</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={[styles.statNumber, { color: colors.mint }]}>{completedTasks}</Text>
              <Text style={styles.statLabel}>Completed</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={[styles.statNumber, { color: colors.amber }]}>{pendingTasks}</Text>
              <Text style={styles.statLabel}>Pending</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={[styles.statNumber, { color: colors.violet }]}>{completionRate}%</Text>
              <Text style={styles.statLabel}>Rate</Text>
            </View>
          </View>

          {/* Actions */}
          <View style={styles.actionSection}>
            <Pressable
              onPress={() => {
                onClose();
                onSignOut();
              }}
              style={styles.signOutBtn}
              accessibilityRole="button"
              accessibilityLabel="Sign out of account"
            >
              <Text style={styles.signOutText}>Sign Out</Text>
            </Pressable>

            <Pressable onPress={onClose} style={styles.closeBtn}>
              <Text style={styles.closeText}>Close</Text>
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
    backgroundColor: 'rgba(5, 8, 14, 0.78)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#121826',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    padding: 24,
    paddingBottom: 36,
  },
  handle: {
    width: 44,
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 20,
  },
  userSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  avatar: {
    width: 68,
    height: 68,
    borderRadius: 24,
    backgroundColor: 'rgba(124, 92, 255, 0.22)',
    borderWidth: 2,
    borderColor: colors.violet,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  avatarText: {
    color: '#fff',
    fontSize: 28,
    fontWeight: '800',
  },
  userName: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  userEmail: {
    color: colors.muted,
    fontSize: 13,
    marginTop: 4,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 24,
  },
  statBox: {
    flex: 1,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    paddingVertical: 12,
    alignItems: 'center',
  },
  statNumber: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '800',
  },
  statLabel: {
    color: colors.muted,
    fontSize: 10,
    fontWeight: '600',
    marginTop: 2,
    textTransform: 'uppercase',
  },
  actionSection: {
    gap: 10,
  },
  signOutBtn: {
    backgroundColor: 'rgba(255, 99, 132, 0.16)',
    borderWidth: 1,
    borderColor: 'rgba(255, 99, 132, 0.45)',
    borderRadius: 16,
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  signOutText: {
    color: colors.coral,
    fontSize: 15,
    fontWeight: '700',
  },
  closeBtn: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeText: {
    color: colors.muted,
    fontSize: 14,
    fontWeight: '600',
  },
});
