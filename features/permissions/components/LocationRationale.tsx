import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Colors } from '@/shared/ui/theme';

/** Why the app asks for location, shown above the system prompt. */
export function LocationRationale() {
  return (
    <View style={styles.permissionCard}>
      <Text style={styles.permissionTitle}>Why we need your location</Text>
      <Text style={styles.permissionDescription}>Family Tracker uses your location to:</Text>
      <View style={styles.bulletPoints}>
        <View style={styles.bulletPoint}>
          <View style={styles.bullet} />
          <Text style={styles.bulletText}>Share your real-time location with family members</Text>
        </View>
        <View style={styles.bulletPoint}>
          <View style={styles.bullet} />
          <Text style={styles.bulletText}>Alert you when family members enter or leave safe zones</Text>
        </View>
        <View style={styles.bulletPoint}>
          <View style={styles.bullet} />
          <Text style={styles.bulletText}>Send emergency alerts with your precise location</Text>
        </View>
      </View>
      <Text style={styles.privacyNote}>
        Your location data is only shared with your family members and is never sold to third parties.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  permissionCard: {
    width: '100%',
    backgroundColor: Colors.light.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
  },
  permissionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: 8,
  },
  permissionDescription: {
    fontSize: 14,
    color: Colors.light.subtext,
    marginBottom: 12,
  },
  bulletPoints: {
    marginBottom: 12,
  },
  bulletPoint: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  bullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.primary,
    marginTop: 6,
    marginRight: 8,
  },
  bulletText: {
    flex: 1,
    fontSize: 14,
    color: Colors.light.text,
    lineHeight: 20,
  },
  privacyNote: {
    fontSize: 12,
    color: Colors.light.subtext,
    fontStyle: 'italic',
  },
});
