# Habit Tree Tracker

A simple habit tracker app where you check daily habits and watch a small tree grow or dry based on your progress.

## What the app does

- Create habits once and keep them in your daily list
- Mark habits done for today
- See a tree that reflects today’s completion performance
- View habit details (streak and last 14 days history)
- Turn notifications on or off
- Reset all data

## Screens

- Home (today’s habits + tree)
- Add / Edit Habit
- Habit Details
- Settings

## Tech used

- React Native + Expo
- React Native Paper (UI)
- React Navigation (Tabs + Stack)
- AsyncStorage (local storage)
- React Context (state management)
- Fetch API (backend connection)
- Expo Notifications (device feature)

## How to run

1. Install dependencies
```bash
npm install
```

2. Start the app
```bash
npx expo start --clear
```

3. Open on your phone
- Install “Expo Go”
- Scan the QR code from the terminal

## Backend / API (habit suggestions)

The “Load from API” button fetches suggestions from this file in the same GitHub repo:

`habit-suggestions.json`

Raw URL used in the app:
`https://raw.githubusercontent.com/MAJamilFI/habit-tree-tracker/main/habit-suggestions.json`

If the API is not reachable, the app still shows local suggestions.

## Requirements checklist

- Modern UI: React Native Paper components and theme
- Multiple screens: Tabs (Home, Settings) + Stack (Details, Add/Edit)
- Backend connection: Fetch suggestions from GitHub raw JSON
- Device feature: Notifications (with permission handling)
- Local storage: AsyncStorage for habits, completions, settings
- State management: React Context (HabitContext)
- Stable UX: loading states, simple error messages, scrollable screens, safe area padding

## Notes

- Expo Go has limitations for some notification features in newer SDK versions.
  The app still includes notification logic and permission handling, and it works best on a real device.

## Project structure

- `src/screens` screens (Home, Details, Form, Settings)
- `src/context` app state (HabitContext)
- `src/components` UI components (TreeCard, HabitListItem, ErrorBanner)
- `src/storage` AsyncStorage helper
- `habit-suggestions.json` suggestions list for API fetch
