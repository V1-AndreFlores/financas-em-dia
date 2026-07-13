import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

import type { AppSettings } from '../../domain/entities/Settings';
import type { FinancialTransaction } from '../../domain/entities/Transaction';
import { parseIsoDate, todayIsoDate } from '../../shared/utils/date';

const CHANNEL_ID = 'financial-reminders';
const MAX_SCHEDULED_NOTIFICATIONS = 64;

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

async function configureAndroidChannel(): Promise<void> {
  if (Platform.OS !== 'android') {
    return;
  }

  await Notifications.setNotificationChannelAsync(CHANNEL_ID, {
    name: 'Lembretes financeiros',
    importance: Notifications.AndroidImportance.HIGH,
    vibrationPattern: [0, 250, 180, 250],
  });
}

export const notificationService = {
  async requestPermission(): Promise<boolean> {
    await configureAndroidChannel();
    const current = await Notifications.getPermissionsAsync();

    if (current.granted) {
      return true;
    }

    const requested = await Notifications.requestPermissionsAsync();
    return requested.granted;
  },

  async sync(
    transactions: FinancialTransaction[],
    settings: AppSettings,
  ): Promise<void> {
    await Notifications.cancelAllScheduledNotificationsAsync();

    if (!settings.notificationsEnabled) {
      return;
    }

    const permission = await Notifications.getPermissionsAsync();

    if (!permission.granted) {
      return;
    }

    await configureAndroidChannel();

    const now = new Date();
    const today = todayIsoDate();
    const candidates = transactions
      .filter(
        (transaction) =>
          transaction.type === 'expense' &&
          transaction.status === 'pending' &&
          transaction.date >= today,
      )
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(0, MAX_SCHEDULED_NOTIFICATIONS);

    for (const transaction of candidates) {
      const dueDate = parseIsoDate(transaction.date);

      if (!dueDate) {
        continue;
      }

      dueDate.setDate(dueDate.getDate() - settings.notificationDaysBefore);
      dueDate.setHours(settings.notificationHour, 0, 0, 0);

      if (dueDate.getTime() <= now.getTime()) {
        continue;
      }

      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Lembrete financeiro',
          body: `${transaction.description} vence em ${settings.notificationDaysBefore === 0 ? 'hoje' : `${settings.notificationDaysBefore} dia(s)`}.`,
          sound: true,
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DATE,
          date: dueDate,
          ...(Platform.OS === 'android' ? { channelId: CHANNEL_ID } : {}),
        },
      });
    }
  },

  async clear(): Promise<void> {
    await Notifications.cancelAllScheduledNotificationsAsync();
  },
};
