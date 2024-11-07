import { SlackStatus, StatusConfig } from '../types/slack';

export const STATUSES: Record<string, SlackStatus> = {
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

export const SCHEDULE: StatusConfig[] = [
  { time: '0 9 * * 1-5', status: 'STANDUP_PREP', duration: 15 },
  { time: '15 9 * * 1-5', status: 'STANDUP', duration: 15 },
  { time: '30 9 * * 1-5', status: 'STAKEHOLDER', duration: 60 },
  { time: '30 10 * * 1-5', status: 'DEEP_FOCUS', duration: 120 },
  { time: '30 12 * * 1-5', status: 'LUNCH', duration: 60 },
  { time: '30 13 * * 1-5', status: 'CODE_REVIEW', duration: 120 },
  { time: '30 15 * * 1-5', status: 'ADMIN', duration: 90 },
  { time: '0 17 * * 1-5', status: 'END_OF_DAY', duration: 840 },
];
