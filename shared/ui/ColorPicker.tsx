import React from 'react';
import { StyleSheet, View, TouchableOpacity } from 'react-native';
import { Check } from 'lucide-react-native';

interface ColorPickerProps {
  colors: string[];
  selectedColor: string;
  onSelectColor: (color: string) => void;
}

export default function ColorPicker({ colors, selectedColor, onSelectColor }: ColorPickerProps) {
  return (
    <View style={styles.container}>
      {colors.map((color) => (
        <TouchableOpacity
          key={color}
          style={[
            styles.colorOption,
            { backgroundColor: color },
            selectedColor === color && styles.selectedOption
          ]}
          onPress={() => onSelectColor(color)}
        >
          {selectedColor === color && (
            <Check size={20} color="#FFFFFF" />
          )}
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  colorOption: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginBottom: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedOption: {
    borderWidth: 2,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
});