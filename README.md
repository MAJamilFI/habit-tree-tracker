# Habit Tree Tracker (React Native + Expo)

A simple habit tracker where your tree grows when you complete habits.

## Features
- Modern UI with React Native Paper
- Multiple screens with React Navigation
- Backend connection: fetch habit suggestions from a public API
- Device feature: local notifications (optional per habit)
- Local storage: AsyncStorage (habits + daily completion history)
- State management: React Context
- Stable UX: loading + error messages + empty state
- Optional features included: streak count + reset all data

## Run locally
1. Install Node.js (LTS) and npm
2. In this folder:
   ```bash
   npm install
   npx expo start
   ```
3. Open with Expo Go (phone) or an emulator

## Notes
- Reminder time format: `HH:MM` (24-hour), e.g. `08:30`
- Notifications can be turned on/off from Settings
