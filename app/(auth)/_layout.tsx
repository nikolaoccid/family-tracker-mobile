import { Stack } from "expo-router";
export { RouterErrorBoundary as ErrorBoundary } from '@/shared/ui';
import Colors from '@/shared/ui/colors';

export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: Colors.light.background },
      }}
    />
  );
}