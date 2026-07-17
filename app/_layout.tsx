import { Stack } from 'expo-router';
import { AuthProvider } from '../contexts/AuthContext';
import { DemoSandboxProvider } from '../contexts/DemoSandboxContext';
import { UserProvider } from '../contexts/UserContext';
import './global.css';

export default function RootLayout() {
  return (
    <DemoSandboxProvider>
      <AuthProvider>
        <UserProvider>
          <Stack
            screenOptions={{
              headerShown: false,
              animation: 'default',
            }}
          >
            <Stack.Screen name="index" />
            <Stack.Screen name="register" />
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="donation-history" options={{ headerShown: false }} />
          </Stack>
        </UserProvider>
      </AuthProvider>
    </DemoSandboxProvider>
  );
}
