import { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import GradientBackground from '../../components/GradientBackground';
import LoadingSpinner from '../../components/LoadingSpinner';
import { useAuth } from '../../contexts/AuthContext';
import { alertsApi } from '../../lib/api';
import { formatLastActivity } from '../../lib/utils';
import type { Alert, Notification } from '../../lib/types';

export default function NotificationsScreen() {
  const router = useRouter();
  const { user, isAuth } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (!isAuth) {
      router.replace('/register');
      return;
    }
    fetchNotifications();
  }, [isAuth, router]);

  async function fetchNotifications() {
    try {
      setLoading(true);
      
      // Fetch alerts to create notifications
      const alertsResponse = await alertsApi.getAllAlerts();
      const notificationsList: Notification[] = [];

      if (alertsResponse.success && alertsResponse.data) {
        // Create notifications from alerts
        alertsResponse.data.forEach((alert: Alert) => {
          if (alert.responded) {
            if (alert.response === 'accept') {
              notificationsList.push({
                id: `alert-accept-${alert.id}`,
                type: 'alert',
                title: 'Donation Request Accepted',
                message: `You have accepted the donation request from ${alert.hospitalName}. The hospital will contact you shortly.`,
                timestamp: alert.timePosted,
                read: false,
                alertId: alert.id,
              });
            } else if (alert.response === 'decline') {
              notificationsList.push({
                id: `alert-decline-${alert.id}`,
                type: 'alert',
                title: 'Donation Request Declined',
                message: `You have declined the donation request from ${alert.hospitalName}.`,
                timestamp: alert.timePosted,
                read: false,
                alertId: alert.id,
              });
            }
          } else {
            // New alert notification
            notificationsList.push({
              id: `alert-new-${alert.id}`,
              type: 'alert',
              title: 'New Donation Request',
              message: `${alert.hospitalName} needs ${alert.bloodType} blood. ${alert.urgency} urgency.`,
              timestamp: alert.timePosted,
              read: false,
              alertId: alert.id,
            });
          }
        });
      }

      // Sort by timestamp (newest first)
      notificationsList.sort((a, b) => {
        const dateA = new Date(a.timestamp).getTime();
        const dateB = new Date(b.timestamp).getTime();
        return dateB - dateA;
      });

      setNotifications(notificationsList);
    } catch (error: any) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchNotifications();
  };

  const handleNotificationPress = (notification: Notification) => {
    if (notification.alertId) {
      // Navigate to dashboard to see the alert
      router.push('/(tabs)/dashboard');
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'alert':
        return 'notifications';
      case 'donation':
        return 'water';
      case 'status':
        return 'checkmark-circle';
      default:
        return 'information-circle';
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'alert':
        return '#9B2226';
      case 'donation':
        return '#005F73';
      case 'status':
        return '#10B981';
      default:
        return '#6B7280';
    }
  };

  if (loading) {
    return (
      <GradientBackground colors={['#005F73', '#9B2226']}>
        <SafeAreaView className="flex-1">
          <LoadingSpinner message="Loading notifications..." />
        </SafeAreaView>
      </GradientBackground>
    );
  }

  return (
    <GradientBackground colors={['#005F73', '#9B2226']}>
      <SafeAreaView className="flex-1">
        <View className="flex-1">
          {/* Header */}
          <View className="bg-primary px-6 py-4">
            <View className="flex-row items-center gap-3">
              <View className="w-10 h-10 rounded-full border-2 border-white items-center justify-center">
                <Ionicons name="notifications" size={20} color="#FFFFFF" />
              </View>
              <Text className="text-white text-xl font-bold">Notifications</Text>
            </View>
          </View>

          <ScrollView
            className="flex-1"
            contentContainerStyle={{ paddingBottom: 96 }}
            showsVerticalScrollIndicator={false}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#FFFFFF" />}
          >
            {notifications.length === 0 ? (
              <View className="flex-1 justify-center items-center px-6 py-12">
                <Ionicons name="notifications-outline" size={64} color="#FFFFFF" style={{ opacity: 0.5 }} />
                <Text className="text-white text-xl font-semibold mt-6 mb-2">
                  No Notifications
                </Text>
                <Text className="text-white/70 text-center text-sm">
                  You'll receive notifications about donation requests and updates here.
                </Text>
              </View>
            ) : (
              <View className="px-6 mt-4">
                {notifications.map((notification) => {
                  const iconColor = getNotificationColor(notification.type);
                  const iconName = getNotificationIcon(notification.type) as keyof typeof Ionicons.glyphMap;

                  return (
                    <TouchableOpacity
                      key={notification.id}
                      onPress={() => handleNotificationPress(notification)}
                      className="bg-white/90 rounded-2xl p-4 mb-4"
                    >
                      <View className="flex-row gap-3">
                        <View
                          className="w-12 h-12 rounded-full items-center justify-center"
                          style={{ backgroundColor: `${iconColor}20` }}
                        >
                          <Ionicons name={iconName} size={24} color={iconColor} />
                        </View>
                        <View className="flex-1">
                          <Text className="text-dark text-base font-semibold mb-1">
                            {notification.title}
                          </Text>
                          <Text className="text-gray-600 text-sm mb-2">
                            {notification.message}
                          </Text>
                          <Text className="text-gray-500 text-xs">
                            {formatLastActivity(notification.timestamp, true)}
                          </Text>
                        </View>
                        {!notification.read && (
                          <View className="w-2 h-2 rounded-full bg-primary mt-2" />
                        )}
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}
          </ScrollView>
        </View>
      </SafeAreaView>
    </GradientBackground>
  );
}
