# Slack Status Automation

Automate your Slack status updates based on your daily schedule. This tool helps manage your availability, focus time, and communication with your team through automated status updates and Do Not Disturb (DND) settings.

## Features

- 🕒 Automated daily schedule for status updates
- 🎯 Quick toggles for focus mode
- ☕ Preset coffee breaks
- 🤝 Meeting status updates
- 🔕 Automatic DND management
- 🔄 Status preservation and restoration
- 📅 Configurable work hours

## Prerequisites

- Node.js (v14 or higher)
- npm
- A Slack workspace where you have permissions to create apps

## Slack App Setup

1. Create a new Slack App:
   - Go to [api.slack.com/apps](https://api.slack.com/apps)
   - Click "Create New App"
   - Choose "From scratch"
   - Name your app (e.g., "Status Automation")
   - Select your workspace

2. Add Required Scopes:
   - Navigate to "OAuth & Permissions"
   - Under "Scopes", add these Bot Token Scopes:
     * `dnd:write` - Edit Do Not Disturb settings
     * `users.profile:read` - View profile details in workspace
     * `users.profile:write` - Edit profile information and status
     * `users:write` - Set user presence (away/active)

These permissions are required because the app needs to:
- Toggle Do Not Disturb mode during focus time and meetings
- Read current status before making changes
- Update your status message and emoji
- Change your presence between active and away states

3. Install App to Workspace:
   - Click "Install to Workspace"
   - Authorize the app
   - Copy the "Bot User OAuth Token" (starts with `xoxb-`)

## Installation

1. Clone the repository:
```bash
git clone git@github.com:iamgraeme/graeme-slack-automation.git
cd graeme-slack-automation
```

2. Install dependencies:
```bash
npm install
```

3. Create environment file:
```bash
cp .env.example .env
```

4. Add your Slack token to `.env`:
```
SLACK_TOKEN=xoxb-your-token-here
PORT=3000
```

## Configuration

The default schedule is:
```
09:00 - Standup Prep
09:15 - Engineering Standup
09:30 - Stakeholder Communications
10:30 - Deep Focus Time
12:30 - Lunch Break
13:30 - Code Reviews & Team Support
15:30 - Admin Time
17:00 - End of Day
```

Modify the `SCHEDULE` array in `status.js` to adjust times and durations.

## Usage

1. Running the Server

### Development Mode
```bash
# Run with hot-reload (recommended for development)
npm run dev
```

### Production Mode
```bash
# First build the TypeScript files
npm run build

# Then start the server
npm start
```

### Available Scripts
- `npm run dev` - Starts server in development mode with auto-reload
- `npm run build` - Compiles TypeScript to JavaScript
- `npm start` - Runs the compiled JavaScript (for production)
- `npm run lint` - Checks for code style issues
- `npm run lint:fix` - Automatically fixes code style issues

### Checking Server Status
When running, you should see:
```bash
Server running on port 3000
Status automation running...
Daily schedule configured
```

### Troubleshooting
If you encounter any issues:
1. Make sure your `.env` file is properly configured
2. Verify your Slack token has the required permissions
3. Check the console for any TypeScript compilation errors
4. Ensure all dependencies are installed (`npm install`)

2. Available endpoints:

### Coffee Breaks
```bash
# Quick 5-minute break
curl -X POST http://localhost:3000/coffee/quick

# Regular 15-minute break
curl -X POST http://localhost:3000/coffee/regular

# Coffee chat 30-minute break
curl -X POST http://localhost:3000/coffee/chat
```

### Focus Mode
```bash
# Toggle focus mode
curl -X POST http://localhost:3000/toggle-focus
```

### Meetings
```bash
# Start a meeting (default 30 mins)
curl -X POST http://localhost:3000/meeting

# Custom duration meeting
curl -X POST -H "Content-Type: application/json" -d '{"duration":45}' http://localhost:3000/meeting
```

### Status Management
```bash
# Clear status
curl -X POST http://localhost:3000/clear-status

# Check current status
curl http://localhost:3000/current-status
```

## Postman Collection

Import the provided `Slack_Status_Automation.postman_collection.json` for easy testing of all endpoints.

## Status Types

```javascript
const STATUSES = {
  STANDUP_PREP: {
    status_text: "Standup Prep",
    status_emoji: ":clipboard:",
    dnd: false,
    presence: 'auto'
  },
  DEEP_FOCUS: {
    status_text: "Deep Focus Time - Available after 12:30",
    status_emoji: ":dart:",
    dnd: true,
    presence: 'away'
  },
  // ... other statuses
}
```

## Error Handling

- If emoji errors occur, verify the emoji exists in your Slack workspace
- Check console logs for detailed error messages
- Server errors return 500 status with error details
- Invalid requests return 400 status with error message

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit changes
4. Push to the branch
5. Create a Pull Request

## Common Issues

1. **Invalid Emoji**: Ensure emojis exist in your Slack workspace
2. **Token Issues**: Verify token has correct scopes
3. **Schedule Conflicts**: Later status updates override earlier ones

## Customization

To add new status types:
1. Add to `STATUSES` object
2. Create corresponding endpoint if needed
3. Add to schedule if required

Example new status:
```javascript
CUSTOM_STATUS: {
  status_text: "Your Status",
  status_emoji: ":emoji:",
  dnd: boolean,
  presence: 'auto'|'away'
}
```

## Security Notes

- Keep your Slack token secure
- Add `.env` to `.gitignore`
- Don't expose the server to public internet
- Use environment variables for configuration

## License

MIT

## Acknowledgments

- Inspired by the need for better focus time management
- Built for developers by developers

# Inspiration from Atomic Habits

This project was inspired by James Clear's "Atomic Habits" and applies several of its core principles to managing your work day:

## 1. Make it Obvious
- Clear status indicators for different work modes
- Automated schedule removes decision fatigue
- Visual cues to team members about your availability

## 2. Make it Attractive
- Easy-to-use endpoints for quick status changes
- Seamless transitions between work modes
- Professional status messages that improve team communication

## 3. Make it Easy
- Automated status changes require zero effort
- Quick toggles for common situations (coffee, focus time)
- Preserve previous status to reduce friction
- Simple REST endpoints for custom integrations

## 4. Make it Satisfying
- Consistent daily routine
- Protected focus time
- Improved team awareness
- Better work-life boundaries

The goal is to create "small wins" throughout your day by:
- Protecting your focus time
- Communicating clearly with your team
- Managing interruptions effectively
- Creating predictable work patterns

Just as Atomic Habits suggests stacking small improvements, this tool helps you build better work habits through automated micro-behaviors that compound over time.