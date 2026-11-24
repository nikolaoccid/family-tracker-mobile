import { Alert } from 'react-native';

interface ConfirmOptions {
  title: string;
  message: string;
  confirmLabel: string;
  destructive?: boolean;
}

/** Native confirmation dialog as a promise: resolves true on confirm, false on cancel. */
export function confirm({ title, message, confirmLabel, destructive = false }: ConfirmOptions): Promise<boolean> {
  return new Promise((resolve) => {
    Alert.alert(
      title,
      message,
      [
        { text: 'Cancel', style: 'cancel', onPress: () => resolve(false) },
        { text: confirmLabel, style: destructive ? 'destructive' : 'default', onPress: () => resolve(true) },
      ],
      { cancelable: true, onDismiss: () => resolve(false) },
    );
  });
}
