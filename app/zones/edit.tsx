import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ArrowLeft, MapPin, Trash2 } from 'lucide-react-native';
import Colors from '@/constants/colors';
import Button from '@/components/Button';
import Input from '@/components/Input';
import { useFamilyStore } from '@/store/familyStore';
import ColorPicker from '@/components/ColorPicker';
import MemberSelector from '@/components/MemberSelector';
import Map from '@/components/Map';

export default function EditSafeZoneScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { safeZones, family, updateSafeZone, deleteSafeZone, isLoading } = useFamilyStore();

  const [name, setName] = useState('');
  const [radius, setRadius] = useState('');
  const [color, setColor] = useState('');
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [center, setCenter] = useState({
    latitude: 100,
    longitude: 200,
  });
  const [isActive, setIsActive] = useState(true);

  // Form validation errors
  const [nameError, setNameError] = useState('');
  const [radiusError, setRadiusError] = useState('');

  // Load zone data
  useEffect(() => {
    if (id) {
      const zone = safeZones.find(z => z.id === id);
      if (zone) {
        setName(zone.name);
        setRadius(zone.radius.toString());
        setColor(zone.color);
        setSelectedMembers(zone.membersToTrack);
        setCenter(zone.center);
        setIsActive(zone.isActive);
      } else {
        // Zone not found, go back
        router.navigate('/zones');
      }
    }
  }, [id]);

  const validateForm = () => {
    let isValid = true;

    // Reset errors
    setNameError('');
    setRadiusError('');

    // Validate name
    if (!name.trim()) {
      setNameError('Zone name is required');
      isValid = false;
    }

    // Validate radius
    const radiusNum = parseInt(radius, 10);
    if (isNaN(radiusNum) || radiusNum < 50 || radiusNum > 5000) {
      setRadiusError('Radius must be between 50 and 5000 meters');
      isValid = false;
    }

    return isValid;
  };

  const handleUpdateZone = async () => {
    if (validateForm() && id) {
      try {
        const zone = {
          name,
          color,
          radius: parseInt(radius, 10),
          center,
          membersToTrack: selectedMembers,
          isActive,
        }
        console.log('about to edit zone', zone)
        await updateSafeZone(id, zone );

        router.back();
      } catch (error) {
        console.error('Failed to update safe zone:', error);
      }
    }
  };

  const handleDeleteZone = () => {
    if (Platform.OS === 'web') {
      if (confirm('Are you sure you want to delete this safe zone? This action cannot be undone.')) {
        deleteZone();
      }
    } else {
      Alert.alert(
        'Delete Safe Zone',
        'Are you sure you want to delete this safe zone? This action cannot be undone.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: deleteZone
          }
        ]
      );
    }
  };

  const deleteZone = async () => {
    if (id) {
      try {
        await deleteSafeZone(id);
        router.back();
      } catch (error) {
        console.error('Failed to delete safe zone:', error);
      }
    }
  };

  // Mock function to simulate map location selection
  const handleLocationSelect = () => {
    // In a real app, this would open a map to select location
    // For now, we'll just set a random location near the current one
    setCenter({
      latitude: center.latitude + (Math.random() * 0.01 - 0.005),
      longitude: center.longitude + (Math.random() * 0.01 - 0.005),
    });
  };

  // Toggle active status
  const toggleActiveStatus = () => {
    setIsActive(!isActive);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      <StatusBar style="dark" />

      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ArrowLeft size={24} color={Colors.light.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Edit Safe Zone</Text>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={handleDeleteZone}
        >
          <Trash2 size={24} color={Colors.danger} />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Input
          label="Zone Name"
          placeholder="Enter zone name (e.g. Home, School)"
          value={name}
          onChangeText={setName}
          leftIcon={<MapPin size={20} color={Colors.light.icon} />}
          error={nameError}
        />

        <Text style={styles.sectionTitle}>Zone Color</Text>
        <ColorPicker
          selectedColor={color}
          onSelectColor={setColor}
          colors={[
            Colors.primary,
            Colors.secondary,
            Colors.success,
            Colors.danger,
            Colors.warning,
            Colors.info,
          ]}
        />

        <Text style={styles.sectionTitle}>Zone Location</Text>
        <Map
          center={center}
          radius={parseInt(radius, 10)}
          color={color}
          onPress={handleLocationSelect}
        />
        <Text style={styles.helperText}>
          Tap on the map to select a different location
        </Text>

        <Input
          label="Radius (meters)"
          placeholder="Enter radius in meters"
          value={radius}
          onChangeText={setRadius}
          keyboardType="number-pad"
          error={radiusError}
        />

        <View style={styles.statusContainer}>
          <Text style={styles.statusLabel}>Zone Status</Text>
          <TouchableOpacity
            style={[
              styles.statusButton,
              isActive ? styles.activeButton : styles.inactiveButton
            ]}
            onPress={toggleActiveStatus}
          >
            <Text style={styles.statusButtonText}>
              {isActive ? 'Active' : 'Inactive'}
            </Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionTitle}>Family Members to Track</Text>
        {family && family.members.length > 0 ? (
          <MemberSelector
            members={family.members}
            selectedMemberIds={selectedMembers}
            onSelectMember={(id) => {
              if (selectedMembers.includes(id)) {
                setSelectedMembers(selectedMembers.filter(memberId => memberId !== id));
              } else {
                setSelectedMembers([...selectedMembers, id]);
              }
            }}
          />
        ) : (
          <Text style={styles.noMembersText}>
            No family members available to track
          </Text>
        )}

        <View style={styles.buttonContainer}>
          <Button
            title="Save Changes"
            onPress={handleUpdateZone}
            loading={isLoading}
            fullWidth
          />
          <Button
            title="Cancel"
            onPress={() => router.back()}
            variant="outline"
            fullWidth
            style={styles.cancelButton}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
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
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.text,
    marginTop: 24,
    marginBottom: 12,
  },
  helperText: {
    fontSize: 12,
    color: Colors.light.subtext,
    marginTop: 8,
    marginBottom: 16,
    textAlign: 'center',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 24,
    marginBottom: 12,
  },
  statusLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.text,
  },
  statusButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  activeButton: {
    backgroundColor: Colors.success,
  },
  inactiveButton: {
    backgroundColor: Colors.light.border,
  },
  statusButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  noMembersText: {
    fontSize: 14,
    color: Colors.light.subtext,
    textAlign: 'center',
    padding: 16,
    backgroundColor: Colors.light.card,
    borderRadius: 12,
  },
  buttonContainer: {
    marginTop: 32,
  },
  cancelButton: {
    marginTop: 12,
  },
});
