import React, { useState } from 'react';
import {
  Text,
  TextInput,
  View,
  TouchableOpacity,
  TextInputProps,
  ViewStyle,
  NativeSyntheticEvent,
  TextInputFocusEventData,
} from 'react-native';
import { Eye, EyeOff } from 'lucide-react-native';
import { Colors } from './theme';
import { styles } from './Input.styles';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  containerStyle?: ViewStyle;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  secureTextEntry?: boolean;
}

export function Input({
  label,
  error,
  containerStyle,
  leftIcon,
  rightIcon,
  secureTextEntry,
  onFocus,
  onBlur,
  ...props
}: InputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const handleFocus = (e: NativeSyntheticEvent<TextInputFocusEventData>) => {
    setIsFocused(true);
    onFocus?.(e);
  };

  const handleBlur = (e: NativeSyntheticEvent<TextInputFocusEventData>) => {
    setIsFocused(false);
    onBlur?.(e);
  };

  const getBorderColor = () => {
    if (error) return Colors.danger;
    if (isFocused) return Colors.primary;
    return Colors.light.border;
  };

  return (
    <View style={[styles.container, containerStyle]}>
      {label ? <Text style={styles.label}>{label}</Text> : null}

      <View
        style={[styles.inputContainer, { borderColor: getBorderColor() }, isFocused && styles.inputContainerFocused]}
      >
        {leftIcon ? <View style={styles.leftIcon}>{leftIcon}</View> : null}

        <TextInput
          {...props}
          style={[
            styles.input,
            leftIcon ? styles.inputWithLeftIcon : undefined,
            rightIcon || secureTextEntry ? styles.inputWithRightIcon : undefined,
          ]}
          placeholderTextColor={Colors.light.subtext}
          onFocus={handleFocus}
          onBlur={handleBlur}
          secureTextEntry={secureTextEntry && !isPasswordVisible}
        />

        {secureTextEntry ? (
          <TouchableOpacity style={styles.rightIcon} onPress={() => setIsPasswordVisible((visible) => !visible)}>
            {isPasswordVisible ? (
              <EyeOff size={20} color={Colors.light.icon} />
            ) : (
              <Eye size={20} color={Colors.light.icon} />
            )}
          </TouchableOpacity>
        ) : null}

        {rightIcon && !secureTextEntry ? <View style={styles.rightIcon}>{rightIcon}</View> : null}
      </View>

      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}
