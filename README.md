# Saathi — AI Agent for Indian Government Services (साथी)

Saathi is a modern, responsive web application designed to help Indian citizens discover government welfare schemes, understand eligibility criteria, identify required documents, and access official government portals directly.

The platform supports **English**, **Hindi (हिन्दी)**, and **Malayalam (മലയാളം)**, and features a resilient hybrid architecture that runs seamlessly in **Demo Mode** or with real **Firebase Authentication & Cloud Firestore**.

---

## Features

- **Tricolor & Navy Civic Design**: Clean, trustworthy UI built with Tailwind CSS v4, Lucide icons, and responsive layouts.
- **Multilingual Support**: Instant language switching between English, हिन्दी, and മലയാളം with persistent preferences.
- **Government Scheme Catalog**: Verified starter datasets for central and state schemes covering Agriculture, Healthcare, Education, Financial Inclusion, and Women & Child Welfare.
- **Intelligent Assistant**: Rule-based citizen assistant with suggested queries and direct scheme recommendations.
- **Citizen Bookmarks & Favorites**: Save schemes locally or sync them to Cloud Firestore when authenticated.
- **Firebase Authentication**: Email/password registration, login, password reset, and optional Google Sign-In.

---

## Quick Start

### 1. Install Dependencies & Run Locally
```bash
npm install
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

> **Note on Demo Mode**: If no Firebase credentials are provided, Saathi automatically runs in **Demo Mode**. All scheme browsing, filtering, chatbot queries, and local saving function completely out of the box without requiring external API keys.

---

## Firebase Setup & Configuration

To connect Saathi to a real Firebase project:

### Step 1: Create a Firebase Project
1. Go to the [Firebase Console](https://console.firebase.google.com/).
2. Click **Add project** and follow the on-screen steps.
3. In your project overview, click the **Web (</>)** icon to register a web app.

### Step 2: Configure Environment Variables
1. Copy the `.env.example` file to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```
2. Populate `.env.local` with your web app's credentials from Firebase Console:
   ```env
   VITE_FIREBASE_API_KEY=your_api_key_here
   VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_project_id.firebasestorage.app
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   ```
   *(Never commit `.env.local` to git; it is ignored by `.gitignore`)*.

### Step 3: Enable Authentication in Firebase Console
1. Navigate to **Build > Authentication > Sign-in method**.
2. Enable **Email/Password**.
3. (Optional) Enable **Google**:
   - Provide a project support email.
   - Under **Authentication > Settings > Authorized domains**, ensure `localhost` is listed.

### Step 4: Create Cloud Firestore Database
1. Navigate to **Build > Firestore Database**.
2. Click **Create database** (choose your preferred region, e.g., `asia-south1` for Mumbai).
3. Start in production mode.

### Step 5: Safely Deploy Firestore Security Rules
To deploy the security rules defined in `firestore.rules`:
1. Install Firebase CLI (if not already installed):
   ```bash
   npm install -g firebase-tools
   ```
2. Log in and initialize:
   ```bash
   firebase login
   firebase use --add your_project_id
   ```
3. Deploy rules safely without modifying existing client data:
   ```bash
   firebase deploy --only firestore:rules
   ```

---

## Firestore Data Structure & Security

- **Schemes (`/schemes/{schemeId}`)**:
  - Read: Publicly readable for all citizens without login.
  - Write: Restricted; client applications cannot modify official government records.
- **User Favorites (`/users/{userId}/favorites/{schemeId}`)**:
  - Read & Write: Strictly restricted to the authenticated document owner (`request.auth.uid == userId`).
  - Validation: Enforces that documents only contain `schemeId` and `savedAt`.

---

## Production Build & Verification

```bash
npm run build
```
Creates an optimized production bundle in the `dist/` directory ready for deployment to Firebase Hosting, Vercel, or GitHub Pages.
