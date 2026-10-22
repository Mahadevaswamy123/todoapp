import React from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { FilterStatus, RootStackParamList, SortMode, Task } from '../types';
import { api } from '../api/client';
import { useAuthStore } from '../stores/authStore';
import { colors, spacing } from '../theme';
import { TaskCard } from '../components/TaskCard';
import { ProfileModal } from '../components/ProfileModal';
import { DeleteConfirmModal } from '../components/DeleteConfirmModal';
import { ErrorBanner, PrimaryButton, Eyebrow } from '../components/Ui';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

// Composite urgency scoring: priority + deadline urgency + scheduled time
function calculateUrgencyScore(task: Task): number {
  let score = 0;

  // Priority weight
  if (task.priority === 'high') score += 100;
  else if (task.priority === 'medium') score += 50;
  else score += 10;

  // Deadline proximity
  const dead = task.deadline || task.dueDate;
  if (dead) {
    const hours = (new Date(dead).getTime() - Date.now()) / (1000 * 60 * 60);
    if (hours < 0) score += 150; // Overdue
    else if (hours <= 24) score += 120;
    else if (hours <= 72) score += 70;
    else if (hours <= 168) score += 30;
  }

  // Recency / scheduled date
  const timeRef = new Date(task.dateTime || task.createdAt || 0).getTime();
  score += timeRef / 1e12;

  return score;
}

export function HomeScreen({ navigation }: Props): React.JSX.Element {
  const user = useAuthStore((state) => state.user);
  const signOut = useAuthStore((state) => state.signOut);

  const [tasks, setTasks] = React.useState<Task[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [refreshing, setRefreshing] = React.useState(false);
  const [error, setError] = React.useState('');

  const [filter, setFilter] = React.useState<FilterStatus>('all');
  const [sortMode, setSortMode] = React.useState<SortMode>('smart');

  // Custom UI Modals
  const [profileVisible, setProfileVisible] = React.useState(false);
  const [taskToDelete, setTaskToDelete] = React.useState<Task | null>(null);
  const [deleting, setDeleting] = React.useState(false);

  const loadTasks = React.useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError('');

    try {
      const data = await api.getTasks();
      setTasks(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not load tasks.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  React.useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      void loadTasks();
    });
    void loadTasks();
    return unsubscribe;
  }, [navigation, loadTasks]);

  // Optimistic status toggle
  const toggleTask = async (task: Task) => {
    const previous = tasks;
    const nextCompleted = !task.completed;

    setTasks((current) =>
      current.map((item) => (item.id === task.id ? { ...item, completed: nextCompleted } : item))
    );

    try {
      await api.updateTask(task.id, { completed: nextCompleted });
    } catch (e) {
      setTasks(previous);
      setError(e instanceof Error ? e.message : 'Could not update task.');
    }
  };

  const handleConfirmDelete = async () => {
    if (!taskToDelete) return;
    setDeleting(true);
    try {
      await api.deleteTask(taskToDelete.id);
      setTasks((current) => current.filter((item) => item.id !== taskToDelete.id));
      setTaskToDelete(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not delete task.');
    } finally {
      setDeleting(false);
    }
  };

  const filteredTasks = React.useMemo(() => {
    return tasks.filter((t) => {
      if (filter === 'active') return !t.completed;
      if (filter === 'completed') return t.completed;
      if (filter === 'high_priority') return t.priority === 'high' && !t.completed;
      return true;
    });
  }, [tasks, filter]);

  const sortedTasks = React.useMemo(() => {
    const list = [...filteredTasks];
    const priorityWeight = { high: 3, medium: 2, low: 1 };

    list.sort((a, b) => {
      if (a.completed !== b.completed) return a.completed ? 1 : -1;

      if (sortMode === 'smart') {
        return calculateUrgencyScore(b) - calculateUrgencyScore(a);
      }
      if (sortMode === 'deadline') {
        const da = a.deadline || a.dueDate ? new Date(a.deadline || a.dueDate!).getTime() : Infinity;
        const db = b.deadline || b.dueDate ? new Date(b.deadline || b.dueDate!).getTime() : Infinity;
        return da - db;
      }
      if (sortMode === 'priority') {
        return priorityWeight[b.priority] - priorityWeight[a.priority];
      }
      // 'newest'
      const ca = new Date(a.createdAt || 0).getTime();
      const cb = new Date(b.createdAt || 0).getTime();
      return cb - ca;
    });

    return list;
  }, [filteredTasks, sortMode]);

  const completedCount = tasks.filter((task) => task.completed).length;
  const progressPercent = tasks.length ? Math.round((completedCount / tasks.length) * 100) : 0;

  return (
    <View style={styles.root}>
      <FlatList
        data={sortedTasks}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TaskCard
            task={item}
            onToggle={() => void toggleTask(item)}
            onDelete={() => setTaskToDelete(item)}
          />
        )}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <View>
            <View style={styles.topRow}>
              <View style={styles.brandRow}>
                <View style={styles.logo}><Text style={styles.logoText}>✦</Text></View>
                <Text style={styles.brand}>taskflow</Text>
              </View>
              <Pressable
                onPress={() => setProfileVisible(true)}
                style={styles.avatar}
                accessibilityRole="button"
                accessibilityLabel="Open profile"
              >
                <Text style={styles.avatarText}>{user?.name?.charAt(0).toUpperCase() || 'U'}</Text>
              </Pressable>
            </View>

            <View style={styles.greeting}>
              <Eyebrow>YOUR PERSONAL SPACE</Eyebrow>
              <Text style={styles.heading}>Hey, {user?.name?.split(' ')[0] || 'there'}.</Text>
              <Text style={styles.subheading}>Let's make today count.</Text>
            </View>

            {/* Progress stats */}
            <View style={styles.statsCard}>
              <View style={styles.statCopy}>
                <Text style={styles.statLabel}>YOUR PROGRESS</Text>
                <Text style={styles.statTitle}>
                  {completedCount} of {tasks.length} tasks done
                </Text>
                <Text style={styles.statSub}>
                  {tasks.length === 0
                    ? 'A little progress starts with one task.'
                    : completedCount === tasks.length
                    ? 'Everything is wrapped up. Amazing!'
                    : 'Keep going — you’re doing great.'}
                </Text>
              </View>
              <View style={styles.progressRing}>
                <Text style={styles.progressText}>{progressPercent}%</Text>
              </View>
            </View>

            {/* Filter tabs */}
            <View style={styles.filterBar}>
              {(
                [
                  { key: 'all', label: 'All' },
                  { key: 'active', label: 'Active' },
                  { key: 'high_priority', label: '🔥 High' },
                  { key: 'completed', label: 'Done' },
                ] as { key: FilterStatus; label: string }[]
              ).map((tab) => {
                const active = filter === tab.key;
                return (
                  <Pressable
                    key={tab.key}
                    onPress={() => setFilter(tab.key)}
                    style={[styles.filterChip, active && styles.filterChipActive]}
                  >
                    <Text style={[styles.filterText, active && styles.filterTextActive]}>
                      {tab.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            {/* Sorting controls */}
            <View style={styles.sectionRow}>
              <Text style={styles.sectionTitle}>Your tasks</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.sortBar}>
                {(
                  [
                    { key: 'smart', label: '⚡ Smart Mix' },
                    { key: 'deadline', label: '⏰ Deadline' },
                    { key: 'priority', label: '🎯 Priority' },
                    { key: 'newest', label: '✦ Newest' },
                  ] as { key: SortMode; label: string }[]
                ).map((mode) => {
                  const active = sortMode === mode.key;
                  return (
                    <Pressable
                      key={mode.key}
                      onPress={() => setSortMode(mode.key)}
                      style={[styles.sortPill, active && styles.sortPillActive]}
                    >
                      <Text style={[styles.sortText, active && styles.sortTextActive]}>
                        {mode.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </ScrollView>
            </View>

            {error ? <ErrorBanner message={error} /> : null}

            {loading ? (
              <ActivityIndicator color={colors.violet} size="large" style={{ marginVertical: 32 }} />
            ) : null}

            {!loading && sortedTasks.length === 0 ? (
              <View style={styles.empty}>
                <Text style={styles.emptyIcon}>✧</Text>
                <Text style={styles.emptyTitle}>A clear page.</Text>
                <Text style={styles.emptyCopy}>
                  {tasks.length === 0
                    ? 'Add your first task and turn plans into progress.'
                    : 'No tasks match the selected filter.'}
                </Text>
              </View>
            ) : null}
          </View>
        }
        ListFooterComponent={
          <View style={styles.footer}>
            <PrimaryButton title="+  Create a new task" onPress={() => navigation.navigate('CreateTask')} />
            <Text style={styles.footerNote}>Small steps still move you forward.</Text>
          </View>
        }
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => void loadTasks(true)}
            tintColor={colors.violet}
          />
        }
      />

      {/* Profile & Account Sheet */}
      <ProfileModal
        visible={profileVisible}
        user={user}
        totalTasks={tasks.length}
        completedTasks={completedCount}
        onSignOut={() => void signOut()}
        onClose={() => setProfileVisible(false)}
      />

      {/* Custom Delete Confirmation Dialog */}
      <DeleteConfirmModal
        visible={taskToDelete !== null}
        task={taskToDelete}
        loading={deleting}
        onConfirm={() => void handleConfirmDelete()}
        onCancel={() => setTaskToDelete(null)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  list: { paddingHorizontal: 20, paddingTop: 18, paddingBottom: 28 },
  topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: 9 },
  logo: { width: 32, height: 32, borderRadius: 11, backgroundColor: colors.violet, alignItems: 'center', justifyContent: 'center' },
  logoText: { color: colors.white, fontSize: 19, fontWeight: '900' },
  brand: { color: colors.text, fontSize: 19, fontWeight: '800', letterSpacing: -0.5 },
  avatar: { width: 38, height: 38, borderRadius: 14, backgroundColor: '#26304B', borderColor: colors.border, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: colors.mint, fontSize: 15, fontWeight: '800' },
  greeting: { marginTop: 34, gap: 8 },
  heading: { color: colors.text, fontSize: 34, fontWeight: '800', letterSpacing: -1.1 },
  subheading: { color: colors.muted, fontSize: 14 },
  statsCard: { marginTop: 22, backgroundColor: '#201C45', borderColor: '#3A326E', borderWidth: 1, borderRadius: 22, padding: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  statCopy: { flex: 1, paddingRight: 12, gap: 7 },
  statLabel: { color: '#B9B1FF', fontSize: 9, fontWeight: '900', letterSpacing: 1.5 },
  statTitle: { color: colors.text, fontSize: 17, fontWeight: '800' },
  statSub: { color: '#B7B3D9', fontSize: 11, lineHeight: 16 },
  progressRing: { width: 66, height: 66, borderRadius: 33, borderWidth: 4, borderColor: colors.violet, alignItems: 'center', justifyContent: 'center', backgroundColor: '#2B2658' },
  progressText: { color: colors.text, fontWeight: '800', fontSize: 15 },
  filterBar: { flexDirection: 'row', gap: 8, marginTop: 20, backgroundColor: colors.surface, padding: 4, borderRadius: 14, borderWidth: 1, borderColor: colors.border },
  filterChip: { flex: 1, paddingVertical: 8, borderRadius: 10, alignItems: 'center' },
  filterChipActive: { backgroundColor: colors.surfaceRaised },
  filterText: { color: colors.muted, fontSize: 12, fontWeight: '600' },
  filterTextActive: { color: colors.text, fontWeight: '800' },
  sectionRow: { marginTop: 24, marginBottom: 14, gap: 10 },
  sectionTitle: { color: colors.text, fontSize: 20, fontWeight: '800' },
  sortBar: { flexDirection: 'row', gap: 6 },
  sortPill: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 9, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  sortPillActive: { borderColor: colors.violet, backgroundColor: '#201A4A' },
  sortText: { color: colors.muted, fontSize: 11, fontWeight: '600' },
  sortTextActive: { color: colors.violet, fontWeight: '800' },
  empty: { borderColor: colors.border, borderWidth: 1, borderStyle: 'dashed', borderRadius: 20, padding: 25, alignItems: 'center', marginTop: 10 },
  emptyIcon: { color: colors.violet, fontSize: 30 },
  emptyTitle: { color: colors.text, fontSize: 16, fontWeight: '800', marginTop: 8 },
  emptyCopy: { color: colors.muted, textAlign: 'center', fontSize: 12, lineHeight: 18, marginTop: 5, maxWidth: 230 },
  footer: { marginTop: 14 },
  footerNote: { color: colors.muted, textAlign: 'center', fontSize: 11, marginTop: 18 },
});
