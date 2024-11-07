export type SlackStatus = {
  status_text: string;
  status_emoji: string;
  dnd: boolean;
  presence: 'auto' | 'away';
};

export type StatusConfig = {
  time: string;
  status: string;
  duration: number;
};

export type CoffeePreset = {
  duration: number;
  message: string;
};

export type StatusResponse = {
  message: string;
  endTime?: string;
  duration?: number;
  preset?: string;
  previousStatus?: string;
};
