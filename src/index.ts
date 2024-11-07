import dotenv from 'dotenv';
import express, { Request, Response } from 'express';
import { SCHEDULE, STATUSES } from './config/statuses';
import { SlackService } from './services/slack.service';
import { SlackStatus } from './types/slack';

dotenv.config();

const app = express();
const slackService = new SlackService(process.env.SLACK_TOKEN!);

interface AppLocals extends Express.Application {
  previousStatus?: SlackStatus;
}

app.use(express.json());

app.post('/toggle-focus', async (req: Request, res: Response) => {
  try {
    const isInFocusMode = await slackService.isInFocusMode();
    const currentStatus = await slackService.getCurrentStatus();

    if (
      !isInFocusMode &&
      currentStatus.profile.status_text &&
      currentStatus.profile.status_emoji
    ) {
      (app as AppLocals).previousStatus = {
        status_text: currentStatus.profile.status_text,
        status_emoji: currentStatus.profile.status_emoji,
        dnd: true,
        presence: 'away',
      };
    }

    if (isInFocusMode) {
      if ((app as AppLocals).previousStatus) {
        await slackService.setStatus(
          (app as AppLocals).previousStatus!,
          60 * 60
        );
        res.json({
          message: 'Focus mode disabled, returned to previous status',
          previousStatus: (app as AppLocals).previousStatus!
            .status_text,
        });
      } else {
        await slackService.clearStatus();
        res.json({ message: 'Focus mode disabled' });
      }
    } else {
      await slackService.setStatus(STATUSES.DEEP_FOCUS, 120 * 60);
      res.json({
        message: 'Focus mode enabled',
        previousStatus: (app as AppLocals).previousStatus
          ? (app as AppLocals).previousStatus!.status_text
          : 'none',
      });
    }
  } catch (error) {
    console.error('Focus mode error:', error);
    res.status(500).json({
      error: 'Failed to toggle focus mode',
      details:
        error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

app.post('/clear-status', async (_req: Request, res: Response) => {
  try {
    await slackService.clearStatus();
    res.json({ message: 'Status cleared' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to clear status' });
  }
});

app.post('/meeting', async (req: Request, res: Response) => {
  try {
    const duration = req.body.duration || 30;
    await slackService.setStatus(STATUSES.MEETING, duration * 60);
    res.json({
      message: `Meeting status set for ${duration} minutes`,
      endTime: new Date(
        Date.now() + duration * 60000
      ).toLocaleTimeString(),
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to set meeting status' });
  }
});

app.post('/coffee-break', async (req: Request, res: Response) => {
  try {
    const duration = req.body.duration || 15;
    await slackService.setStatus(STATUSES.COFFEE, duration * 60);
    res.json({
      message: `Coffee break status set for ${duration} minutes`,
      endTime: new Date(
        Date.now() + duration * 60000
      ).toLocaleTimeString(),
    });
  } catch (error) {
    res
      .status(500)
      .json({ error: 'Failed to set coffee break status' });
  }
});

// @ts-ignore
app.post('/set-status/:type', async (req: Request, res: Response) => {
  try {
    const { type } = req.params;
    const { duration } = req.body;

    if (!STATUSES[type]) {
      return res.status(400).json({ error: 'Invalid status type' });
    }

    await slackService.setStatus(STATUSES[type], duration * 60);
    res.json({
      message: `Status set to ${type} for ${duration} minutes`,
      endTime: new Date(
        Date.now() + duration * 60000
      ).toLocaleTimeString(),
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to set status' });
  }
});

interface CoffeePreset {
  duration: number;
  message: string;
}

const COFFEE_PRESETS: Record<string, CoffeePreset> = {
  quick: {
    duration: 5,
    message: 'Quick coffee run',
  },
  regular: {
    duration: 15,
    message: "Grabbing a cup o' Joe",
  },
  chat: {
    duration: 30,
    message: 'Coffee & Chat',
  },
};

app.post('/coffee/:preset', async (req: Request, res: Response) => {
  try {
    const preset =
      COFFEE_PRESETS[req.params.preset] || COFFEE_PRESETS.regular;

    const coffeeStatus: SlackStatus = {
      ...STATUSES.COFFEE,
      status_text: preset.message,
    };

    await slackService.setStatus(coffeeStatus, preset.duration * 60);

    const endTime = new Date(Date.now() + preset.duration * 60000);

    res.json({
      message: `Coffee break set: ${preset.message}`,
      duration: preset.duration,
      endTime: endTime.toLocaleTimeString(),
      preset: req.params.preset,
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to set coffee break',
      details:
        error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  slackService.scheduleDay(SCHEDULE, STATUSES);
  console.log('Status automation running...');
});
