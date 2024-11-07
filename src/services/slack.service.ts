import { WebClient } from '@slack/web-api';
import * as nodeSchedule from 'node-schedule';
import { SlackStatus, StatusConfig } from '../types/slack';

export class SlackService {
  private client: WebClient;
  private scheduleJobs: nodeSchedule.Job[] = [];

  constructor(token: string) {
    this.client = new WebClient(token);
  }

  async setPresence(presence: 'auto' | 'away'): Promise<void> {
    try {
      await this.client.users.setPresence({ presence });
      console.log(`Presence set to: ${presence}`);
    } catch (error) {
      console.error('Error setting presence:', error);
      throw error;
    }
  }

  async setStatus(
    statusConfig: SlackStatus,
    duration: number = 0
  ): Promise<void> {
    try {
      await Promise.all([
        this.client.users.profile.set({
          profile: {
            status_text: statusConfig.status_text,
            status_emoji: statusConfig.status_emoji,
            status_expiration:
              duration > 0
                ? Math.floor(Date.now() / 1000) + duration
                : 0,
          },
        }),
        this.setPresence(statusConfig.presence),
        statusConfig.dnd
          ? this.client.dnd.setSnooze({
              num_minutes: Math.floor(duration / 60),
            })
          : this.client.dnd.endDnd(),
      ]);

      console.log(`Status set to: ${statusConfig.status_text}`);
    } catch (error) {
      console.error('Error setting status:', error);
      throw error;
    }
  }

  async clearStatus(): Promise<void> {
    try {
      await Promise.all([
        this.client.users.profile.set({
          profile: {
            status_text: '',
            status_emoji: '',
          },
        }),
        this.setPresence('auto'),
        this.client.dnd.endDnd(),
      ]);
      console.log('Status cleared');
    } catch (error) {
      console.error('Error clearing status:', error);
      throw error;
    }
  }

  scheduleDay(
    scheduleConfig: StatusConfig[],
    statuses: Record<string, SlackStatus>
  ): void {
    // Clear any existing scheduled jobs
    this.clearScheduledJobs();

    this.scheduleJobs = scheduleConfig.map(
      ({ time, status, duration }) =>
        nodeSchedule.scheduleJob(time, () =>
          this.setStatus(statuses[status], duration * 60)
        )
    );

    console.log('Daily schedule configured');
  }

  private clearScheduledJobs(): void {
    this.scheduleJobs.forEach((job) => job.cancel());
    this.scheduleJobs = [];
  }

  async getCurrentStatus(): Promise<any> {
    try {
      return await this.client.users.profile.get({});
    } catch (error) {
      console.error('Error getting current status:', error);
      throw error;
    }
  }

  // Method to check if user is in focus mode
  async isInFocusMode(): Promise<boolean> {
    try {
      const currentStatus = await this.getCurrentStatus();
      return currentStatus.profile.status_text.includes('Deep Focus');
    } catch (error) {
      console.error('Error checking focus mode:', error);
      throw error;
    }
  }
}
