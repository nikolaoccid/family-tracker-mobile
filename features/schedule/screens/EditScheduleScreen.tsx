import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, TextInput, Switch, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ArrowLeft, Clock, Calendar, Check, Trash2 } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { useAuthStore } from '@/store/authStore';
import Button from '@/components/Button';
import Input from '@/components/Input';
import { SharingSchedule } from '@/types';

const DAYS_OF_WEEK = [
  { id: 'monday', label: 'Monday' },
  { id: 'tuesday', label: 'Tuesday' },
  { id: 'wednesday', label: 'Wednesday' },
  { id: 'thursday', label: 'Thursday' },
  { id: 'friday', label: 'Friday' },
  { id: 'saturday', label: 'Saturday' },
  { id: 'sunday', label: 'Sunday' },
];

export default function EditScheduleScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { privacySettings, updatePrivacySettings } = useAuthStore();

  const [name, setName] = useState('');
  const [startTime, setStartTime] = useState('08:00');
  const [endTime, setEndTime] = useState('17:00');
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [isEnabled, setIsEnabled] = useState(true);
  const [errors, setErrors] = useState<{
    name?: string;
    days?: string;
    time?: string;
  }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Load schedule data
  useEffect(() => {
    if (privacySettings?.locationSharing.schedules && id) {
      const schedule = privacySettings.locationSharing.schedules.find(s => s.id === id);

      if (schedule) {
        setName(schedule.name);
        setStartTime(schedule.startTime);
        setEndTime(schedule.endTime);
        setSelectedDays(schedule.days);
        setIsEnabled(schedule.enabled);
      } else {
        // Schedule not found, go back
        Alert.alert('Error', 'Schedule not found');
        router.back();
      }
    }
  }, [privacySettings, id, router]);

  const toggleDay = (day: string) => {
    if (selectedDays.includes(day)) {
      setSelectedDays(selectedDays.filter(d => d !== day));
    } else {
      setSelectedDays([...selectedDays, day]);
    }
  };

  const validateForm = () => {
    const newErrors: {
      name?: string;
      days?: string;
      time?: string;
    } = {};

    if (!name.trim()) {
      newErrors.name = 'Schedule name is required';
    }

    if (selectedDays.length === 0) {
      newErrors.days = 'Select at least one day';
    }

    // Validate time format and logic
    const startTimeParts = startTime.split(':');
    const endTimeParts = endTime.split(':');

    if (
      startTimeParts.length !== 2 ||
      endTimeParts.length !== 2 ||
      isNaN(parseInt(startTimeParts[0])) ||
      isNaN(parseInt(startTimeParts[1])) ||
      isNaN(parseInt(endTimeParts[0])) ||
      isNaN(parseInt(endTimeParts[1]))
    ) {
      newErrors.time = 'Invalid time format';
    } else {
      const startHour = parseInt(startTimeParts[0]);
      const startMinute = parseInt(startTimeParts[1]);
      const endHour = parseInt(endTimeParts[0]);
      const endMinute = parseInt(endTimeParts[1]);

      if (
        startHour < 0 || startHour > 23 ||
        startMinute < 0 || startMinute > 59 ||
        endHour < 0 || endHour > 23 ||
        endMinute < 0 || endMinute > 59
      ) {
        newErrors.time = 'Invalid time values';
      } else if (
        startHour > endHour ||
        (startHour === endHour && startMinute >= endMinute)
      ) {
        newErrors.time = 'End time must be after start time';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleUpdateSchedule = async () => {
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      if (!privacySettings || !id) {
        throw new Error('Privacy settings not loaded or schedule ID missing');
      }

      // Update schedule
      const updatedSchedule: SharingSchedule = {
        id,
        name,
        days: selectedDays as ('monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday')[],
        startTime,
        endTime,
        enabled: isEnabled,
      };

      // Update privacy settings with updated schedule
      const updatedSettings = {
        ...privacySettings,
        locationSharing: {
          ...privacySettings.locationSharing,
          schedules: privacySettings.locationSharing.schedules?.map(s =>
            s.id === id ? updatedSchedule : s
          ) || []
        }
      };

      await updatePrivacySettings(updatedSettings);

      // Navigate back to privacy settings
      router.back();
    } catch (error) {
      console.error('Error updating schedule:', error);
      // Show error message
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteSchedule = () => {
    Alert.alert(
      'Delete Schedule',
      'Are you sure you want to delete this schedule?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setIsDeleting(true);

            try {
              if (!privacySettings || !id) {
                throw new Error('Privacy settings not loaded or schedule ID missing');
              }

              // Remove schedule from privacy settings
              const updatedSettings = {
                ...privacySettings,
                locationSharing: {
                  ...privacySettings.locationSharing,
                  schedules: privacySettings.locationSharing.schedules?.filter(s => s.id !== id) || []
                }
              };

              await updatePrivacySettings(updatedSettings);

              // Navigate back to privacy settings
              router.back();
            } catch (error) {
              console.error('Error deleting schedule:', error);
              // Show error message
            } finally {
              setIsDeleting(false);
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  const formatTimeInput = (input: string, field: 'start' | 'end') => {
    // Remove non-numeric characters
    let cleaned = input.replace(/[^\d]/g, '');

    // Format as HH:MM
    if (cleaned.length > 4) {
      cleaned = cleaned.slice(0, 4);
    }

    let formatted = cleaned;
    if (cleaned.length > 2) {
      formatted = `${cleaned.slice(0, 2)}:${cleaned.slice(2)}`;
    }

    // Validate hours (0-23) and minutes (0-59)
    if (formatted.includes(':')) {
      const [hours, minutes] = formatted.split(':');

      if (hours && parseInt(hours) > 23) {
        formatted = `23:${minutes || '00'}`;
      }

      if (minutes && parseInt(minutes) > 59) {
        formatted = `${hours || '00'}:59`;
      }
    }

    if (field === 'start') {
      setStartTime(formatted);
    } else {
      setEndTime(formatted);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />

      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ArrowLeft size={24} color={Colors.light.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Edit Schedule</Text>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={handleDeleteSchedule}
        >
          <Trash2 size={24} color={Colors.danger} />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.section}>
          <Input
            label="Schedule Name"
            placeholder="e.g., Work Hours, School Days"
            value={name}
            onChangeText={setName}
            error={errors.name}
          />

          <Text style={styles.sectionTitle}>Days of Week</Text>
          {errors.days && <Text style={styles.errorText}>{errors.days}</Text>}

          <View style={styles.daysContainer}>
            {DAYS_OF_WEEK.map(day => (
              <TouchableOpacity
                key={day.id}
                style={[
                  styles.dayButton,
                  selectedDays.includes(day.id) && styles.dayButtonSelected
                ]}
                onPress={() => toggleDay(day.id)}
              >
                <Text
                  style={[
                    styles.dayButtonText,
                    selectedDays.includes(day.id) && styles.dayButtonTextSelected
                  ]}
                >
                  {day.label.substring(0, 3)}
                </Text>
                {selectedDays.includes(day.id) && (
                  <View style={styles.checkIcon}>
                    <Check size={14} color="#FFFFFF" />
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.sectionTitle}>Time Range</Text>
          {errors.time && <Text style={styles.errorText}>{errors.time}</Text>}

          <View style={styles.timeContainer}>
            <View style={styles.timeInputContainer}>
              <Clock size={20} color={Colors.primary} style={styles.timeIcon} />
              <TextInput
                style={styles.timeInput}
                placeholder="08:00"
                value={startTime}
                onChangeText={(text) => formatTimeInput(text, 'start')}
                keyboardType="numeric"
              />
            </View>

            <Text style={styles.timeToText}>to</Text>

            <View style={styles.timeInputContainer}>
              <Clock size={20} color={Colors.primary} style={styles.timeIcon} />
              <TextInput
                style={styles.timeInput}
                placeholder="17:00"
                value={endTime}
                onChangeText={(text) => formatTimeInput(text, 'end')}
                keyboardType="numeric"
              />
            </View>
          </View>

          <View style={styles.enableContainer}>
            <Text style={styles.enableText}>Enable Schedule</Text>
            <Switch
              value={isEnabled}
              onValueChange={setIsEnabled}
              trackColor={{ false: Colors.light.border, true: `${Colors.primary}80` }}
              thumbColor={isEnabled ? Colors.primary : Colors.light.icon}
              ios_backgroundColor={Colors.light.border}
            />
          </View>

          <Text style={styles.helperText}>
            Your location will be shared automatically during the scheduled times on the selected days.
          </Text>
        </View>

        <Button
          title={isSubmitting ? "Saving..." : "Save Changes"}
          onPress={handleUpdateSchedule}
          disabled={isSubmitting || isDeleting}
          fullWidth
          style={styles.saveButton}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 24,
  },
  backButton: {
    padding: 8,
  },
  deleteButton: {
    padding: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.light.text,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  section: {
    backgroundColor: Colors.light.card,
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 24,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.text,
    marginTop: 16,
    marginBottom: 12,
  },
  errorText: {
    fontSize: 12,
    color: Colors.danger,
    marginBottom: 8,
  },
  daysContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
    gap: 8,
  },
  dayButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.light.border,
    backgroundColor: Colors.light.background,
    marginRight: 8,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  dayButtonSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  dayButtonText: {
    fontSize: 14,
    color: Colors.light.text,
  },
  dayButtonTextSelected: {
    color: '#FFFFFF',
  },
  checkIcon: {
    marginLeft: 4,
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  timeInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.light.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: Colors.light.background,
  },
  timeIcon: {
    marginRight: 8,
  },
  timeInput: {
    flex: 1,
    fontSize: 16,
    color: Colors.light.text,
  },
  timeToText: {
    marginHorizontal: 12,
    fontSize: 16,
    color: Colors.light.subtext,
  },
  enableContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingVertical: 8,
  },
  enableText: {
    fontSize: 16,
    color: Colors.light.text,
  },
  helperText: {
    fontSize: 14,
    color: Colors.light.subtext,
    marginTop: 8,
  },
  saveButton: {
    marginHorizontal: 24,
    marginTop: 8,
  },
});
