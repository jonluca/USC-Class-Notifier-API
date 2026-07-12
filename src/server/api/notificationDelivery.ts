export type NotificationChannel = "email" | "sms";

export class NotificationChannelError extends Error {
  constructor(
    public readonly channel: NotificationChannel,
    public readonly originalError: unknown,
  ) {
    super(`Failed to send ${channel} notification`);
    this.name = "NotificationChannelError";
  }
}

export const hasRecordedEmailSinceLastNotification = ({
  latestEmailSentAt,
  lastNotified,
}: {
  latestEmailSentAt: Date | null | undefined;
  lastNotified: Date | null;
}) => Boolean(latestEmailSentAt && (!lastNotified || latestEmailSentAt.getTime() > lastNotified.getTime()));

export const sendAndRecordEmailDelivery = async ({
  sendEmail,
  recordEmail,
}: {
  sendEmail: () => Promise<void>;
  recordEmail: () => Promise<void>;
}) => {
  await sendEmail();
  await recordEmail();
};

export const deliverAvailabilityNotification = async ({
  emailAlreadySent,
  sendEmail,
  sendSms,
  markNotified,
}: {
  emailAlreadySent: boolean;
  sendEmail: () => Promise<void>;
  sendSms?: () => Promise<void>;
  markNotified: () => Promise<void>;
}) => {
  if (!emailAlreadySent) {
    try {
      await sendEmail();
    } catch (error) {
      throw new NotificationChannelError("email", error);
    }
  }

  if (sendSms) {
    try {
      await sendSms();
    } catch (error) {
      throw new NotificationChannelError("sms", error);
    }
  }

  await markNotified();
};
