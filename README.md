# Hommie AI

Hommie AI is a rental management platform built with **Next.js** and **Firebase Studio**. It allows landlords to publish properties and helps tenants search for rentals using an AI-powered assistant.

## Features

- User authentication with Firebase
- Property listing, search and filtering
- Admin dashboard for property management
- AI rental assistant chat powered by [Genkit](https://github.com/google-generative-ai/GenKit)

## Prerequisites

- Node.js 18 or later
- npm
- A Firebase project (Firestore, Auth and Storage)
- Google credentials for the Genkit AI flow (`GOOGLE_APPLICATION_CREDENTIALS`)

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```
2. Create a `.env.local` file with your Firebase configuration:
   ```dotenv
   NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain_here
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id_here
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket_here
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id_here
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id_here
   NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id_here
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
4. Start the Genkit AI flow in another terminal:
   ```bash
   npm run genkit:dev
   ```
   Use `npm run genkit:watch` while developing to automatically reload flows.

## Deployment

The project is configured for Firebase App Hosting. Build the project and deploy with the Firebase CLI:

```bash
npm run build
firebase deploy
```


