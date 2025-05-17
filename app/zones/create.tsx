import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ArrowLeft, MapPin } from 'lucide-react-native';
import Colors from '@/constants/colors';
import Button from '@/components/Button';
import Input from '@/components/Input';
import { useFamilyStore } from '@/store/familyStore';
import ColorPicker from '@/components/ColorPicker';
import MemberSelector from '@/components/MemberSelector';
import MockMap from '@/components/MockMap';

export default function CreateSafeZoneScreen() {
  const router = useRouter();
  const { family, addSafeZone, isLoading } = useFamilyStore();
  
  const [name, setName] = useState('');
  const [radius, setRadius] = useState('200');
  const [color, setColor] = useState(Colors.primary);
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [center, setCenter] = useState({
    latitude: 37.7749,
    longitude: -122.4194,
  });
  
  // Form validation errors
  const [nameError, setNameError] = useState('');
  const [radiusError, setRadiusError] = useState('');

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

  const handleCreateZone = async () => {
    if (validateForm()) {
      try {
        await addSafeZone({
          name,
          color,
          radius: parseInt(radius, 10),
          center,
          membersToTrack: selectedMembers,
          isActive: true,
        });
        
        router.back();
      } catch (error) {
        console.error('Failed to create safe zone:', error);
      }
    }
  };

  // Mock function to simulate map location selection
  const handleLocationSelect = () => {
    // In a real app, this would open a map to select location
    // For now, we'll just set a random location near the current one
    setCenter({
      latitude: 37.7749 + (Math.random() * 0.01 - 0.005),
      longitude: -122.4194 + (Math.random() * 0.01 - 0.005),
    });
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
        <Text style={styles.title}>Create Safe Zone</Text>
        <View style={{ width: 40 }} />
      </View>
      
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.subtitle}>
          Safe zones alert you when family members enter or leave important locations.
        </Text>
        
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
        <MockMap
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
            title="Create Safe Zone"
            onPress={handleCreateZone}
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
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.light.text,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.light.subtext,
    marginBottom: 24,
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