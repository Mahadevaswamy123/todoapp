import React from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { colors } from '../theme';

export interface DateTimePickerModalProps {
  visible: boolean;
  title: string;
  initialValue?: string | null;
  onConfirm: (isoString: string) => void;
  onClear?: () => void;
  onClose: () => void;
}

const DAYS_OF_WEEK = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const MINUTES = ['00', '15', '30', '45'];
const HOURS = ['12', '01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11'];

export function DateTimePickerModal({
  visible,
  title,
  initialValue,
  onConfirm,
  onClear,
  onClose,
}: DateTimePickerModalProps): React.JSX.Element {
  const baseDate = React.useMemo(() => {
    if (initialValue) {
      const d = new Date(initialValue);
      if (!Number.isNaN(d.getTime())) return d;
    }
    return new Date();
  }, [initialValue, visible]);

  const [currentMonth, setCurrentMonth] = React.useState(baseDate.getMonth());
  const [currentYear, setCurrentYear] = React.useState(baseDate.getFullYear());
  const [selectedDay, setSelectedDay] = React.useState(baseDate.getDate());

  const [selectedHour, setSelectedHour] = React.useState(() => {
    const h = baseDate.getHours() % 12;
    return h === 0 ? '12' : String(h).padStart(2, '0');
  });
  const [selectedMinute, setSelectedMinute] = React.useState(() => {
    const m = baseDate.getMinutes();
    if (m < 15) return '00';
    if (m < 30) return '15';
    if (m < 45) return '30';
    return '45';
  });
  const [selectedPeriod, setSelectedPeriod] = React.useState<'AM' | 'PM'>(() => {
    return baseDate.getHours() >= 12 ? 'PM' : 'AM';
  });

  React.useEffect(() => {
    if (visible) {
      setCurrentMonth(baseDate.getMonth());
      setCurrentYear(baseDate.getFullYear());
      setSelectedDay(baseDate.getDate());
      const h = baseDate.getHours() % 12;
      setSelectedHour(h === 0 ? '12' : String(h).padStart(2, '0'));
      setSelectedPeriod(baseDate.getHours() >= 12 ? 'PM' : 'AM');
    }
  }, [visible, baseDate]);

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfWeek = new Date(currentYear, currentMonth, 1).getDay();

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  const handleQuickPreset = (offsetDays: number, defaultHour = 18, defaultPeriod: 'AM' | 'PM' = 'PM') => {
    const target = new Date();
    target.setDate(target.getDate() + offsetDays);
    setCurrentYear(target.getFullYear());
    setCurrentMonth(target.getMonth());
    setSelectedDay(target.getDate());

    const h = defaultHour % 12;
    setSelectedHour(h === 0 ? '12' : String(h).padStart(2, '0'));
    setSelectedMinute('00');
    setSelectedPeriod(defaultPeriod);
  };

  const handleConfirm = () => {
    let hour = parseInt(selectedHour, 10);
    if (selectedPeriod === 'PM' && hour !== 12) hour += 12;
    if (selectedPeriod === 'AM' && hour === 12) hour = 0;

    const minute = parseInt(selectedMinute, 10);
    const finalDate = new Date(currentYear, currentMonth, selectedDay, hour, minute, 0);
    onConfirm(finalDate.toISOString());
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.sheet} onPress={(e) => e.stopPropagation()}>
          <View style={styles.header}>
            <Text style={styles.sheetTitle}>{title}</Text>
            <Pressable onPress={onClose} hitSlop={10} style={styles.closeBtn}>
              <Text style={styles.closeText}>×</Text>
            </Pressable>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
            <View style={styles.presetRow}>
              <Pressable onPress={() => handleQuickPreset(0, 18, 'PM')} style={styles.presetChip}>
                <Text style={styles.presetText}>Today 6 PM</Text>
              </Pressable>
              <Pressable onPress={() => handleQuickPreset(1, 10, 'AM')} style={styles.presetChip}>
                <Text style={styles.presetText}>Tomorrow 10 AM</Text>
              </Pressable>
              <Pressable onPress={() => handleQuickPreset(3, 18, 'PM')} style={styles.presetChip}>
                <Text style={styles.presetText}>In 3 Days</Text>
              </Pressable>
              <Pressable onPress={() => handleQuickPreset(7, 18, 'PM')} style={styles.presetChip}>
                <Text style={styles.presetText}>Next Week</Text>
              </Pressable>
            </View>

            <View style={styles.monthNav}>
              <Pressable onPress={handlePrevMonth} style={styles.arrowBtn}>
                <Text style={styles.arrowText}>‹</Text>
              </Pressable>
              <Text style={styles.monthTitle}>
                {MONTH_NAMES[currentMonth]} {currentYear}
              </Text>
              <Pressable onPress={handleNextMonth} style={styles.arrowBtn}>
                <Text style={styles.arrowText}>›</Text>
              </Pressable>
            </View>

            <View style={styles.weekRow}>
              {DAYS_OF_WEEK.map((d, i) => (
                <Text key={i} style={styles.weekText}>{d}</Text>
              ))}
            </View>

            <View style={styles.daysGrid}>
              {Array.from({ length: firstDayOfWeek }).map((_, i) => (
                <View key={`empty-${i}`} style={styles.dayCell} />
              ))}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1;
                const isSelected = selectedDay === day;
                return (
                  <Pressable
                    key={`day-${day}`}
                    onPress={() => setSelectedDay(day)}
                    style={[styles.dayCell, isSelected && styles.dayCellSelected]}
                  >
                    <Text style={[styles.dayText, isSelected && styles.dayTextSelected]}>
                      {day}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            <Text style={styles.sectionHeading}>TIME</Text>
            <View style={styles.timeSection}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.timeScroll}>
                {HOURS.map((h) => {
                  const active = selectedHour === h;
                  return (
                    <Pressable
                      key={`h-${h}`}
                      onPress={() => setSelectedHour(h)}
                      style={[styles.timeChip, active && styles.timeChipActive]}
                    >
                      <Text style={[styles.timeText, active && styles.timeTextActive]}>{h}</Text>
                    </Pressable>
                  );
                })}
              </ScrollView>

              <View style={styles.minutePeriodRow}>
                <View style={styles.minuteRow}>
                  {MINUTES.map((m) => {
                    const active = selectedMinute === m;
                    return (
                      <Pressable
                        key={`m-${m}`}
                        onPress={() => setSelectedMinute(m)}
                        style={[styles.minuteChip, active && styles.minuteChipActive]}
                      >
                        <Text style={[styles.minuteText, active && styles.minuteTextActive]}>:{m}</Text>
                      </Pressable>
                    );
                  })}
                </View>

                <View style={styles.periodRow}>
                  {(['AM', 'PM'] as const).map((p) => {
                    const active = selectedPeriod === p;
                    return (
                      <Pressable
                        key={p}
                        onPress={() => setSelectedPeriod(p)}
                        style={[styles.periodChip, active && styles.periodChipActive]}
                      >
                        <Text style={[styles.periodText, active && styles.periodTextActive]}>{p}</Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>
            </View>
          </ScrollView>

          <View style={styles.actionRow}>
            {onClear ? (
              <Pressable
                onPress={() => {
                  onClear();
                  onClose();
                }}
                style={styles.clearBtn}
              >
                <Text style={styles.clearText}>Clear</Text>
              </Pressable>
            ) : null}
            <Pressable onPress={handleConfirm} style={styles.confirmBtn}>
              <Text style={styles.confirmText}>Set Date & Time</Text>
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
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#12182B',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderWidth: 1,
    borderColor: colors.border,
    maxHeight: '85%',
    paddingBottom: 24,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  sheetTitle: {
    color: colors.text,
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeText: {
    color: colors.muted,
    fontSize: 22,
    lineHeight: 24,
  },
  scroll: {
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 20,
  },
  presetRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  presetChip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 9,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  presetText: {
    color: colors.violet,
    fontSize: 11,
    fontWeight: '700',
  },
  monthNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  arrowBtn: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  arrowText: {
    color: colors.text,
    fontSize: 22,
    fontWeight: '700',
    lineHeight: 24,
  },
  monthTitle: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '800',
  },
  weekRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  weekText: {
    width: 38,
    textAlign: 'center',
    color: colors.muted,
    fontSize: 11,
    fontWeight: '700',
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 6,
  },
  dayCell: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayCellSelected: {
    backgroundColor: colors.violet,
  },
  dayText: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '600',
  },
  dayTextSelected: {
    color: colors.white,
    fontWeight: '900',
  },
  sectionHeading: {
    color: colors.muted,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.2,
    marginTop: 20,
    marginBottom: 10,
  },
  timeSection: {
    gap: 12,
  },
  timeScroll: {
    flexDirection: 'row',
    gap: 8,
  },
  timeChip: {
    width: 44,
    height: 38,
    borderRadius: 11,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timeChipActive: {
    borderColor: colors.mint,
    backgroundColor: '#162F38',
  },
  timeText: {
    color: colors.muted,
    fontSize: 13,
    fontWeight: '700',
  },
  timeTextActive: {
    color: colors.mint,
    fontWeight: '900',
  },
  minutePeriodRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  minuteRow: {
    flexDirection: 'row',
    gap: 6,
  },
  minuteChip: {
    paddingHorizontal: 11,
    paddingVertical: 7,
    borderRadius: 9,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  minuteChipActive: {
    borderColor: colors.mint,
    backgroundColor: '#162F38',
  },
  minuteText: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: '700',
  },
  minuteTextActive: {
    color: colors.mint,
    fontWeight: '900',
  },
  periodRow: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    padding: 3,
    borderRadius: 11,
    borderWidth: 1,
    borderColor: colors.border,
  },
  periodChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  periodChipActive: {
    backgroundColor: colors.violet,
  },
  periodText: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: '700',
  },
  periodTextActive: {
    color: colors.white,
    fontWeight: '900',
  },
  actionRow: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 20,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  clearBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  clearText: {
    color: colors.coral,
    fontWeight: '700',
    fontSize: 14,
  },
  confirmBtn: {
    flex: 2,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: colors.mint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmText: {
    color: colors.background,
    fontWeight: '800',
    fontSize: 14,
  },
});
