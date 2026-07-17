import { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import GradientBackground from '../../components/GradientBackground';
import Logo from '../../components/Logo';
import { useDemoSandbox } from '../../contexts/DemoSandboxContext';

const DEMO_TIP_SEEN_KEY = 'shared_demo_entry_tip_seen_v2';

type ButtonFrame = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export default function RegisterIndex() {
  const router = useRouter();
  const window = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const { enterDemo, loading } = useDemoSandbox();
  const [enteringDemo, setEnteringDemo] = useState(false);
  const [showDemoTip, setShowDemoTip] = useState(false);
  const [demoButtonFrame, setDemoButtonFrame] = useState<ButtonFrame | null>(null);
  const demoButtonRef = useRef<React.ElementRef<typeof TouchableOpacity>>(null);

  useEffect(() => {
    let mounted = true;
    let timer: ReturnType<typeof setTimeout> | undefined;

    async function prepareDemoTip() {
      const seen = await SecureStore.getItemAsync(DEMO_TIP_SEEN_KEY);
      if (seen === 'true' || !mounted) return;

      timer = setTimeout(() => {
        demoButtonRef.current?.measureInWindow((x, y, width, height) => {
          if (!mounted || width <= 0 || height <= 0) return;
          setDemoButtonFrame({ x, y, width, height });
          setShowDemoTip(true);
        });
      }, 450);
    }

    void prepareDemoTip();
    return () => {
      mounted = false;
      if (timer) clearTimeout(timer);
    };
  }, []);

  const dismissDemoTip = async () => {
    setShowDemoTip(false);
    await SecureStore.setItemAsync(DEMO_TIP_SEEN_KEY, 'true');
  };

  const handleEnterDemo = async () => {
    setEnteringDemo(true);
    try {
      await enterDemo();
      router.replace('/(tabs)/dashboard');
    } catch (error) {
      Alert.alert('Shared Demo Unavailable', error instanceof Error ? error.message : 'Please try again.');
    } finally {
      setEnteringDemo(false);
    }
  };

  const handleHighlightedDemo = async () => {
    await dismissDemoTip();
    await handleEnterDemo();
  };

  const popupHeight = 188;
  const popupTop = demoButtonFrame
    ? demoButtonFrame.y + demoButtonFrame.height + popupHeight + 24 <= window.height
      ? demoButtonFrame.y + demoButtonFrame.height + 18
      : Math.max(24, demoButtonFrame.y - popupHeight - 18)
    : 24;

  return (
    <GradientBackground colors={['#E9D8A6', '#94D2BD']}>
      <View className="flex-1 justify-center items-center px-6">
        <TouchableOpacity
          ref={demoButtonRef}
          style={[styles.demoButton, { top: insets.top + 12 }]}
          onPress={handleEnterDemo}
          activeOpacity={0.8}
          disabled={enteringDemo || loading}
          accessibilityLabel="Open shared demo"
        >
          <Text className="text-white text-center font-semibold text-sm">Demo</Text>
        </TouchableOpacity>

        <View className="items-center mb-8">
          <Logo showLabel={true} size="medium" />

          <TouchableOpacity className="bg-primary px-6 py-2 rounded-full mt-4 mb-6">
            <Text className="text-white font-semibold text-sm">FOR DONORS</Text>
          </TouchableOpacity>
        </View>

        <View className="w-full h-px bg-gray-300 mb-8" />

        <View className="w-full gap-4">
          <TouchableOpacity
            className="bg-primary rounded-2xl p-4 w-full"
            onPress={() => router.push('/register/sign-up')}
            activeOpacity={0.8}
          >
            <Text className="text-white text-center font-semibold text-lg">
              Register as a Donor
            </Text>
          </TouchableOpacity>

          <Text className="text-gray-600 text-center text-sm mb-2">
            Already have an account?
          </Text>

          <TouchableOpacity
            className="bg-white rounded-2xl p-4 w-full border-2 border-primary"
            onPress={() => router.push('/register/sign-in')}
            activeOpacity={0.8}
          >
            <Text className="text-primary text-center font-semibold text-lg">
              Sign-In
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <Modal
        visible={showDemoTip && Boolean(demoButtonFrame)}
        transparent
        animationType="fade"
        statusBarTranslucent
        presentationStyle="overFullScreen"
        onRequestClose={() => void dismissDemoTip()}
      >
        <View style={styles.coachmarkRoot} accessibilityViewIsModal>
          <Pressable style={styles.backdrop} onPress={() => void dismissDemoTip()} />

          {demoButtonFrame && (
            <>
              <View
                pointerEvents="box-none"
                style={[
                  styles.highlight,
                  {
                    left: demoButtonFrame.x - 5,
                    top: demoButtonFrame.y - 5,
                    width: demoButtonFrame.width + 10,
                    height: demoButtonFrame.height + 10,
                  },
                ]}
              >
                <TouchableOpacity
                  style={styles.highlightedButton}
                  onPress={() => void handleHighlightedDemo()}
                  activeOpacity={0.85}
                  accessibilityLabel="Open shared demo"
                >
                  <Text className="text-white text-center font-semibold text-sm">Demo</Text>
                </TouchableOpacity>
              </View>

              <View style={[styles.tipCard, { top: popupTop }]}>
                <Text className="text-dark text-xl font-bold mb-2">
                  Explore before registering
                </Text>
                <Text className="text-gray-600 text-sm leading-5">
                  Not ready to create a donor account? Use the shared demo to explore live alerts,
                  responses, donation history, and the connected hospital workflow with safe sample data.
                </Text>
                <View className="flex-row items-center justify-between mt-4">
                  <Text className="text-secondary text-xs font-semibold">
                    Tap the highlighted button to begin
                  </Text>
                  <TouchableOpacity onPress={() => void dismissDemoTip()} className="px-3 py-2">
                    <Text className="text-primary font-semibold">Got it</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </>
          )}
        </View>
      </Modal>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  coachmarkRoot: {
    flex: 1,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(8, 15, 23, 0.76)',
  },
  demoButton: {
    position: 'absolute',
    right: 20,
    zIndex: 10,
    minWidth: 72,
    paddingHorizontal: 18,
    paddingVertical: 9,
    borderRadius: 999,
    backgroundColor: '#005F73',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.18,
    shadowRadius: 6,
    elevation: 5,
  },
  highlight: {
    position: 'absolute',
    padding: 5,
    borderRadius: 999,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    backgroundColor: '#FFFFFF',
    shadowColor: '#FFFFFF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.75,
    shadowRadius: 12,
    elevation: 18,
  },
  highlightedButton: {
    flex: 1,
    justifyContent: 'center',
    borderRadius: 999,
    paddingHorizontal: 16,
    backgroundColor: '#005F73',
  },
  tipCard: {
    position: 'absolute',
    left: 24,
    right: 24,
    minHeight: 170,
    padding: 20,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.28,
    shadowRadius: 16,
    elevation: 20,
  },
});
