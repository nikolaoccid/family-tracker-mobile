import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import Colors from '@/constants/colors';

// Mock map component since we can't use actual maps in this environment
function MockMap({ familyLocations = [] }) {
  return (
    <View style={styles.mockMap}>
      <Text style={styles.mockMapText}>Map View</Text>
      <Text style={styles.mockMapSubtext}>
        {familyLocations.length > 0
          ? `Showing ${familyLocations.length} family members`
          : "Family members' locations would be displayed here"}
      </Text>

      {familyLocations.length > 0 && (
        <View style={styles.locationsList}>
          {familyLocations.map((location, index) => (
            <View key={index} style={styles.locationItem}>
              <View style={styles.locationDot} />
              <Text style={styles.locationName}>{(location as any)?.name || 'Unknown'}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  mockMap: {
    flex: 1,
    backgroundColor: '#E8EEF4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mockMapText: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.light.text,
    marginBottom: 8,
  },
  mockMapSubtext: {
    fontSize: 16,
    color: Colors.light.subtext,
    textAlign: 'center',
    paddingHorizontal: 40,
    marginBottom: 16,
  },
  locationsList: {
    marginTop: 16,
  },
  locationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  locationDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.primary,
    marginRight: 8,
  },
  locationName: {
    fontSize: 14,
    color: Colors.light.text,
  },
});

export default MockMap;
