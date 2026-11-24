import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Switch, ScrollView, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ArrowLeft, Lock, Users, Clock, Plus, ChevronRight, Trash2 } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { useAuthStore } from '@/store/authStore';
import { useFamilyStore } from '@/store/familyStore';
import Button from '@/components/Button';
import { PrivacySettings, SharingSchedule } from '@/types';

export default function PrivacySettingsScreen() {
  const router = useRouter();
  const { user, privacySettings, fetchPrivacySettings, updatePrivacySettings } = useAuthStore();
  const { family } = useFamilyStore();

  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [settings, setSettings] = useState<PrivacySettings | null>(null);

  // Fetch privacy settings on mount
  useEffect(() => {
    const loadSettings = async () => {
      if (!privacySettings) {
        setIsLoading(true);
        try {
          await fetchPrivacySettings();
        } catch (error) {
          console.error('Error loading privacy settings:', error);
        } finally {
          setIsLoading(false);
        }
      }
    };

    loadSettings();
  }, [fetchPrivacySettings, privacySettings]);

  // Update local state when privacySettings changes
  useEffect(() => {
    if (privacySettings) {
      setSettings(privacySettings);
    }
  }, [privacySettings]);

  const handleToggleLocationSharing = (value: boolean) => {
    if (!settings) return;

    setSettings({
      ...settings,
      locationSharing: {
        ...settings.locationSharing,
        enabled: value,
      }
    });
  };

  const handleChangeVisibility = (visibility: 'all' | 'selected' | 'none') => {
    if (!settings) return;

    setSettings({
      ...settings,
      locationSharing: {
        ...settings.locationSharing,
        visibleTo: visibility,
      }
    });
  };

  const handleToggleNotification = (type: 'enabled' | 'lowBattery' | 'zoneEntry' | 'zoneExit', value: boolean) => {
    if (!settings) return;

    setSettings({
      ...settings,
      notificationSettings: {
        ...settings.notificationSettings,
        [type]: value,
      }
    });
  };

  const handleSaveSettings = async () => {
    if (!settings) return;

    setIsSaving(true);
    try {
      await updatePrivacySettings(settings);
    } catch (error) {
      console.error('Error saving privacy settings:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddSchedule = () => {
    router.push('/schedule/create');
  };

  const handleEditSchedule = (scheduleId: string) => {
    router.push(`/schedule/edit?id=${scheduleId}`);
  };

  const handleDeleteSchedule = (scheduleId: string) => {
    if (!settings || !settings.locationSharing.schedules) return;

    setSettings({
      ...settings,
      locationSharing: {
        ...settings.locationSharing,
        schedules: settings.locationSharing.schedules.filter(s => s.id !== scheduleId)
      }
    });
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  if (!settings) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Failed to load privacy settings</Text>
        <Button
          title="Go Back"
          onPress={() => router.back()}
          style={styles.errorButton}
        />
      </View>
    );
  }

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
        <Text style={styles.title}>Privacy Settings</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Lock size={20} color={Colors.primary} />
            <Text style={styles.sectionTitle}>Location Sharing</Text>
          </View>

          <View style={styles.settingItem}>
            <Text style={styles.settingLabel}>Share My Location</Text>
            <Switch
              value={settings.locationSharing.enabled}
              onValueChange={handleToggleLocationSharing}
              trackColor={{ false: Colors.light.border, true: `${Colors.primary}80` }}
              thumbColor={settings.locationSharing.enabled ? Colors.primary : Colors.light.icon}
              ios_backgroundColor={Colors.light.border}
            />
          </View>

          {settings.locationSharing.enabled && (
            <>
              <Text style={styles.settingGroupLabel}>Who can see my location?</Text>

              <TouchableOpacity
                style={[
                  styles.visibilityOption,
                  settings.locationSharing.visibleTo === 'all' && styles.visibilityOptionSelected
                ]}
                onPress={() => handleChangeVisibility('all')}
              >
                <View style={styles.radioButton}>
                  {settings.locationSharing.visibleTo === 'all' && (
                    <View style={styles.radioButtonSelected} />
                  )}
                </View>
                <Text style={styles.visibilityOptionText}>All family members</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.visibilityOption,
                  settings.locationSharing.visibleTo === 'selected' && styles.visibilityOptionSelected
                ]}
                onPress={() => handleChangeVisibility('selected')}
              >
                <View style={styles.radioButton}>
                  {settings.locationSharing.visibleTo === 'selected' && (
                    <View style={styles.radioButtonSelected} />
                  )}
                </View>
                <Text style={styles.visibilityOptionText}>Selected members only</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.visibilityOption,
                  settings.locationSharing.visibleTo === 'none' && styles.visibilityOptionSelected
                ]}
                onPress={() => handleChangeVisibility('none')}
              >
                <View style={styles.radioButton}>
                  {settings.locationSharing.visibleTo === 'none' && (
                    <View style={styles.radioButtonSelected} />
                  )}
                </View>
                <Text style={styles.visibilityOptionText}>Nobody</Text>
              </TouchableOpacity>

              {settings.locationSharing.visibleTo === 'selected' && family && (
                <View style={styles.memberSelectionContainer}>
                  <Text style={styles.memberSelectionTitle}>Select Members</Text>
                  {family.members.filter(m => m.id !== user?.id).map(member => (
                    <View key={member.id} style={styles.memberItem}>
                      <Text style={styles.memberName}>{member.name}</Text>
                      <Switch
                        value={settings.locationSharing.selectedMembers.includes(member.id)}
                        onValueChange={(value) => {
                          const selectedMembers = value
                            ? [...settings.locationSharing.selectedMembers, member.id]
                            : settings.locationSharing.selectedMembers.filter(id => id !== member.id);

                          setSettings({
                            ...settings,
                            locationSharing: {
                              ...settings.locationSharing,
                              selectedMembers
                            }
                          });
                        }}
                        trackColor={{ false: Colors.light.border, true: `${Colors.primary}80` }}
                        thumbColor={
                          settings.locationSharing.selectedMembers.includes(member.id)
                            ? Colors.primary
                            : Colors.light.icon
                        }
                        ios_backgroundColor={Colors.light.border}
                      />
                    </View>
                  ))}
                </View>
              )}
            </>
          )}
        </View>

        {user?.isPremium && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Clock size={20} color={Colors.primary} />
              <Text style={styles.sectionTitle}>Sharing Schedules</Text>
            </View>

            <Text style={styles.scheduleDescription}>
              Set up specific times when your location is shared automatically.
            </Text>

            {settings.locationSharing.schedules && settings.locationSharing.schedules.length > 0 ? (
              settings.locationSharing.schedules.map(schedule => (
                <View key={schedule.id} style={styles.scheduleItem}>
                  <View style={styles.scheduleInfo}>
                    <Text style={styles.scheduleName}>{schedule.name}</Text>
                    <Text style={styles.scheduleTime}>
                      {schedule.startTime} - {schedule.endTime}
                    </Text>
                    <Text style={styles.scheduleDays}>
                      {schedule.days.map(day => day.charAt(0).toUpperCase() + day.slice(1, 3)).join(', ')}
                    </Text>
                  </View>
                  <View style={styles.scheduleActions}>
                    <Switch
                      value={schedule.enabled}
                      onValueChange={(value) => {
                        const updatedSchedules = settings.locationSharing.schedules?.map(s =>
                          s.id === schedule.id ? { ...s, enabled: value } : s
                        );

                        setSettings({
                          ...settings,
                          locationSharing: {
                            ...settings.locationSharing,
                            schedules: updatedSchedules
                          }
                        });
                      }}
                      trackColor={{ false: Colors.light.border, true: `${Colors.primary}80` }}
                      thumbColor={schedule.enabled ? Colors.primary : Colors.light.icon}
                      ios_backgroundColor={Colors.light.border}
                    />
                    <TouchableOpacity
                      style={styles.scheduleEditButton}
                      onPress={() => handleEditSchedule(schedule.id)}
                    >
                      <ChevronRight size={20} color={Colors.light.icon} />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.scheduleDeleteButton}
                      onPress={() => handleDeleteSchedule(schedule.id)}
                    >
                      <Trash2 size={20} color={Colors.danger} />
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            ) : (
              <View style={styles.emptyScheduleContainer}>
                <Text style={styles.emptyScheduleText}>No schedules set up yet</Text>
              </View>
            )}

            <Button
              title="Add Schedule"
              onPress={handleAddSchedule}
              icon={<Plus size={18} color="#FFFFFF" />}
              fullWidth
              style={styles.addScheduleButton}
            />
          </View>
        )}

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Users size={20} color={Colors.primary} />
            <Text style={styles.sectionTitle}>Notifications</Text>
          </View>

          <View style={styles.settingItem}>
            <Text style={styles.settingLabel}>Enable Notifications</Text>
            <Switch
              value={settings.notificationSettings.enabled}
              onValueChange={(value) => handleToggleNotification('enabled', value)}
              trackColor={{ false: Colors.light.border, true: `${Colors.primary}80` }}
              thumbColor={settings.notificationSettings.enabled ? Colors.primary : Colors.light.icon}
              ios_backgroundColor={Colors.light.border}
            />
          </View>

          {settings.notificationSettings.enabled && (
            <>
              <View style={styles.settingItem}>
                <Text style={styles.settingLabel}>Low Battery Alerts</Text>
                <Switch
                  value={settings.notificationSettings.lowBattery}
                  onValueChange={(value) => handleToggleNotification('lowBattery', value)}
                  trackColor={{ false: Colors.light.border, true: `${Colors.primary}80` }}
                  thumbColor={settings.notificationSettings.lowBattery ? Colors.primary : Colors.light.icon}
                  ios_backgroundColor={Colors.light.border}
                />
              </View>

              <View style={styles.settingItem}>
                <Text style={styles.settingLabel}>Zone Entry Alerts</Text>
                <Switch
                  value={settings.notificationSettings.zoneEntry}
                  onValueChange={(value) => handleToggleNotification('zoneEntry', value)}
                  trackColor={{ false: Colors.light.border, true: `${Colors.primary}80` }}
                  thumbColor={settings.notificationSettings.zoneEntry ? Colors.primary : Colors.light.icon}
                  ios_backgroundColor={Colors.light.border}
                />
              </View>

              <View style={styles.settingItem}>
                <Text style={styles.settingLabel}>Zone Exit Alerts</Text>
                <Switch
                  value={settings.notificationSettings.zoneExit}
                  onValueChange={(value) => handleToggleNotification('zoneExit', value)}
                  trackColor={{ false: Colors.light.border, true: `${Colors.primary}80` }}
                  thumbColor={settings.notificationSettings.zoneExit ? Colors.primary : Colors.light.icon}
                  ios_backgroundColor={Colors.light.border}
                />
              </View>
            </>
          )}
        </View>

        <View style={styles.contentWrapper}>
          <Button
            title={isSaving ? "Saving..." : "Save Settings"}
            onPress={handleSaveSettings}
            disabled={isSaving}
            fullWidth
            style={styles.saveButton}
          />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.light.background,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.light.background,
    padding: 24,
  },
  errorText: {
    fontSize: 18,
    color: Colors.light.text,
    marginBottom: 16,
    textAlign: 'center',
  },
  errorButton: {
    width: 200,
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
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.light.text,
    marginLeft: 12,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  settingLabel: {
    fontSize: 16,
    color: Colors.light.text,
  },
  settingGroupLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.light.text,
    marginTop: 16,
    marginBottom: 12,
  },
  visibilityOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  visibilityOptionSelected: {
    backgroundColor: `${Colors.primary}10`,
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  radioButtonSelected: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.primary,
  },
  visibilityOptionText: {
    fontSize: 16,
    color: Colors.light.text,
  },
  memberSelectionContainer: {
    marginTop: 16,
    padding: 16,
    backgroundColor: Colors.light.background,
    borderRadius: 12,
  },
  memberSelectionTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.light.text,
    marginBottom: 12,
  },
  memberItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  memberName: {
    fontSize: 16,
    color: Colors.light.text,
  },
  scheduleDescription: {
    fontSize: 14,
    color: Colors.light.subtext,
    marginBottom: 16,
  },
  scheduleItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  scheduleInfo: {
    flex: 1,
  },
  scheduleName: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.light.text,
    marginBottom: 4,
  },
  scheduleTime: {
    fontSize: 14,
    color: Colors.light.text,
    marginBottom: 2,
  },
  scheduleDays: {
    fontSize: 12,
    color: Colors.light.subtext,
  },
  scheduleActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  scheduleEditButton: {
    padding: 8,
    marginLeft: 8,
  },
  scheduleDeleteButton: {
    padding: 8,
  },
  emptyScheduleContainer: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  emptyScheduleText: {
    fontSize: 16,
    color: Colors.light.subtext,
  },
  addScheduleButton: {
    marginTop: 16,
  },
  saveButton: {
    marginHorizontal: 24,
    marginTop: 8,
  },
  contentWrapper: {
    width: '100%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
});
