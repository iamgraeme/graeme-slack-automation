require('dotenv').config();
const { WebClient } = require('@slack/web-api');
const schedule = require('node-schedule');
const express = require('express');
const app = express();

const slack = new WebClient(process.env.SLACK_TOKEN);

const STATUSES = {
  //MISC
  MEETING: {
    status_text: 'In a Meeting - Back soon',
    status_emoji: ':spiral_calendar_pad:',
    dnd: true,
    presence: 'away',
  },
  COFFEE: {
    status_text: "Grabbing a cup o' Joe",
    status_emoji: ':coffee:',
    dnd: true,
    presence: 'away',
  },

  STANDUP_PREP: {
    status_text: 'Standup Prep',
    status_emoji: ':clipboard:',
    dnd: false,
    presence: 'auto',
  },
  STANDUP: {
    status_text: 'In Engineering Standup',
    status_emoji: ':speaking_head_in_silhouette:',
    dnd: true,
    presence: 'auto',
  },
  STAKEHOLDER: {
    status_text: 'Stakeholder Communications',
    status_emoji: ':calendar:',
    dnd: false,
    presence: 'auto',
  },
  DEEP_FOCUS: {
    status_text: 'Deep Focus Time - Available after 12:30',
    status_emoji: ':dart:',
    dnd: true,
    presence: 'away',
  },
  LUNCH: {
    status_text: 'Lunch Break',
    status_emoji: ':rice:',
    dnd: true,
    presence: 'away',
  },
  CODE_REVIEW: {
    status_text: 'Code Reviews & Team Support',
    status_emoji: ':eyes:',
    dnd: false,
    presence: 'auto',
  },
  ADMIN: {
    status_text: 'Admin & Learning Time',
    status_emoji: ':book:',
    dnd: false,
    presence: 'auto',
  },
  END_OF_DAY: {
    status_text: 'Done for the day',
    status_emoji: ':wave:',
    dnd: true,
    presence: 'away',
  },
};

async function setPresence(presence) {
  try {
    await slack.users.setPresence({ presence });
    console.log(`Presence set to: ${presence}`);
  } catch (error) {
    console.error('Error setting presence:', error);
  }
}

async function setStatus(statusConfig, duration = 0) {
  try {
    await Promise.all([
      slack.users.profile.set({
        profile: {
          status_text: statusConfig.status_text,
          status_emoji: statusConfig.status_emoji,
          status_expiration:
            duration > 0
              ? Math.floor(Date.now() / 1000) + duration
              : 0,
        },
      }),

      setPresence(statusConfig.presence),

      statusConfig.dnd
        ? slack.dnd.setSnooze({
            num_minutes: Math.floor(duration / 60),
          })
        : slack.dnd.endDnd(),
    ]);

    console.log(`Status set to: ${statusConfig.status_text}`);
  } catch (error) {
    console.error('Error setting status:', error);
  }
}

async function clearStatus() {
  try {
    await Promise.all([
      slack.users.profile.set({
        profile: {
          status_text: '',
          status_emoji: '',
        },
      }),
      setPresence('auto'),
      slack.dnd.endDnd(),
    ]);
    console.log('Status cleared');
  } catch (error) {
    console.error('Error clearing status:', error);
  }
}

const SCHEDULE = [
  { time: '0 9 * * 1-5', status: 'STANDUP_PREP', duration: 15 },
  { time: '15 9 * * 1-5', status: 'STANDUP', duration: 15 },
  { time: '30 9 * * 1-5', status: 'STAKEHOLDER', duration: 60 },
  { time: '30 10 * * 1-5', status: 'DEEP_FOCUS', duration: 120 },
  { time: '30 12 * * 1-5', status: 'LUNCH', duration: 60 },
  { time: '30 13 * * 1-5', status: 'CODE_REVIEW', duration: 120 },
  { time: '30 15 * * 1-5', status: 'ADMIN', duration: 90 },
  { time: '0 17 * * 1-5', status: 'END_OF_DAY', duration: 840 },
];

function scheduleDay() {
  SCHEDULE.forEach(({ time, status, duration }) => {
    schedule.scheduleJob(time, () =>
      setStatus(STATUSES[status], duration * 60)
    );
  });
  console.log('Daily schedule configured');
}

app.use(express.json());

app.post('/toggle-focus', async (req, res) => {
  try {
    const currentStatus = await slack.users.profile.get();
    const isInFocusMode =
      currentStatus.profile.status_text.includes('Deep Focus');

    if (
      !isInFocusMode &&
      currentStatus.profile.status_text &&
      currentStatus.profile.status_emoji
    ) {
      app.locals.previousStatus = {
        status_text: currentStatus.profile.status_text,
        status_emoji: currentStatus.profile.status_emoji,
        dnd: true,
        presence: 'away',
      };
    }

    if (isInFocusMode) {
      if (app.locals.previousStatus) {
        await setStatus(app.locals.previousStatus, 60 * 60);
        res.json({
          message: 'Focus mode disabled, returned to previous status',
          previousStatus: app.locals.previousStatus.status_text,
        });
      } else {
        await clearStatus();
        res.json({ message: 'Focus mode disabled' });
      }
    } else {
      await setStatus(STATUSES.DEEP_FOCUS, 120 * 60);
      res.json({
        message: 'Focus mode enabled',
        previousStatus: app.locals.previousStatus
          ? app.locals.previousStatus.status_text
          : 'none',
      });
    }
  } catch (error) {
    console.error('Focus mode error:', error);
    res.status(500).json({
      error: 'Failed to toggle focus mode',
      details: error.message,
    });
  }
});

app.post('/clear-status', async (req, res) => {
  try {
    await clearStatus();
    res.json({ message: 'Status cleared' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to clear status' });
  }
});

app.post('/meeting', async (req, res) => {
  try {
    const duration = req.body.duration || 30;
    await setStatus(STATUSES.MEETING, duration * 60);
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

app.post('/coffee-break', async (req, res) => {
  try {
    const duration = req.body.duration || 15;
    await setStatus(STATUSES.COFFEE, duration * 60);
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

app.post('/set-status/:type', async (req, res) => {
  try {
    const { type } = req.params;
    const { duration } = req.body;

    if (!STATUSES[type]) {
      return res.status(400).json({ error: 'Invalid status type' });
    }

    await setStatus(STATUSES[type], duration * 60);
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

app.post('/coffee/:preset', async (req, res) => {
  try {
    const presets = {
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

    const preset = presets[req.params.preset] || presets.regular;

    const coffeeStatus = {
      ...STATUSES.COFFEE,
      status_text: preset.message,
    };

    await setStatus(coffeeStatus, preset.duration * 60);

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
      details: error.message,
    });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  scheduleDay();
  console.log('Status automation running...');
});
