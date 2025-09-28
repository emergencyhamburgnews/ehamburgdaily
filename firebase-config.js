// Firebase Configuration
// Replace these values with your actual Firebase project configuration

const firebaseConfig = {
    apiKey: "AIzaSyD7I9K8ds6Px60jMm71Kt7weVAX-vhcM8w",
    authDomain: "ehamburg-90958.firebaseapp.com",
    projectId: "ehamburg-90958",
    storageBucket: "ehamburg-90958.firebasestorage.app",
    messagingSenderId: "166375320407",
    appId: "1:166375320407:web:1e3b0b85a410522bf4ec12",
    measurementId: "G-FLLYGR93PX"
};

// Firebase setup instructions:
// 1. Go to https://console.firebase.google.com/
// 2. Create a new project or select an existing one
// 3. Go to Project Settings > General > Your apps
// 4. Click "Add app" and select Web
// 5. Copy the configuration object and replace the values above
// 6. Enable Firestore Database in the Firebase Console
// 7. Set up Firestore security rules (for development, you can use test mode)

// Firestore Database Structure:
// Collection: "articles"
// Document structure:
// {
//   title: "Article Title",
//   description: "Article description...",
//   imageUrl: "https://example.com/image.jpg", // optional
//   timestamp: firebase.firestore.Timestamp.now(),
//   category: "news", // optional
//   author: "Author Name" // optional
// }

// Security Rules for Firestore (for development):
// rules_version = '2';
// service cloud.firestore {
//   match /databases/{database}/documents {
//     match /{document=**} {
//       allow read: if true;
//       allow write: if request.auth != null;
//     }
//   }
// }

// For production, you should implement proper authentication and security rules
