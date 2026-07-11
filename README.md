# Eventify

Eventify is a React Native mobile application for discovering, booking, and managing events. It includes user authentication, event browsing, ticket booking, QR-based ticket handling, reviews, and an admin dashboard for managing events and categories.

## Features

- Browse and explore upcoming events
- Book tickets for events
- View bookings and QR-code tickets
- Add and read event reviews
- Manage user profile and authentication
- Admin panel for categories and event management
- Mock backend support using JSON Server for development

## Tech Stack

- Frontend: React Native with Expo
- State Management: Redux Toolkit and React Context
- Navigation: React Navigation
- API Layer: Axios
- Testing: Jest and React Native Testing Library

## Project Structure

- eventify/ — main Expo application source
- eventify/src/ — screens, components, navigation, services, store, and utilities
- eventify/**tests**/ — unit and integration tests
- JSON server/ — mock backend data using JSON Server

## Prerequisites

Make sure you have the following installed:

- Node.js (recommended: v18 or newer)
- npm
- Expo Go on your mobile device (optional, for testing on phone)

## Getting Started

1. Clone the repository

```bash
git clone https://github.com/Subhraneel2003/Eventify-Event-Management-Ticket-Booking-App.git
cd Eventify-Event-Management-Ticket-Booking-App
```

2. Install dependencies for the app

```bash
cd eventify
npm install
```

3. Install dependencies for the mock backend

```bash
cd ../"JSON server"
npm install
```

## Running the App

Start the Expo development server:

```bash
cd eventify
npm start
```

You can then run the app on:

- Android emulator/device
- iOS simulator/device
- Web browser

## Running the Mock Backend

Start the JSON Server to serve local mock data:

```bash
cd "JSON server"
npx json-server --watch db.json --port 3000
```

If your app is configured to use the mock API, make sure the base URL points to the local JSON Server.

## Running Tests

```bash
cd eventify
npm test
```

## Contributing

Contributions are welcome. If you want to improve the project:

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Open a pull request

## License

This project does not currently include a license file. If you plan to publish it publicly, add an appropriate license such as MIT before pushing to GitHub.
