import { Stack } from 'expo-router';
import { AuthProvider } from '../contexts/AuthContext';
import { UserProvider } from '../contexts/UserContext';
import './global.css';

export default function RootLayout() {
  return (
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
  );
}
