# EHAMBURG DAILY - News Website

A responsive news website with both mobile and desktop layouts, connected to Firebase as the backend.

## Features

- **Responsive Design**: Optimized for both mobile and desktop devices
- **Firebase Integration**: Real-time data from Firestore database
- **Modern UI**: Clean, minimalist design with orange and black color scheme
- **Mobile Navigation**: Hamburger menu for mobile devices
- **Dynamic Content**: Featured articles and latest news sections
- **Loading States**: Smooth loading experience with spinners

## Project Structure

```
ehamburg-daily/
├── index.html          # Main HTML file
├── styles.css          # CSS styles for responsive design
├── script.js           # JavaScript for functionality and Firebase integration
├── firebase-config.js  # Firebase configuration template
├── README.md           # This file
└── assets/             # Logo images (if any)
```

## Setup Instructions

### 1. Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or select an existing one
3. Go to **Project Settings** > **General** > **Your apps**
4. Click **"Add app"** and select **Web**
5. Copy the configuration object
6. Update the `firebaseConfig` object in `index.html` with your actual values:

```javascript
const firebaseConfig = {
    apiKey: "your-actual-api-key",
    authDomain: "your-project.firebaseapp.com",
    projectId: "your-actual-project-id",
    storageBucket: "your-project.appspot.com",
    messagingSenderId: "your-sender-id",
    appId: "your-actual-app-id"
};
```

### 2. Firestore Database Setup

1. In Firebase Console, go to **Firestore Database**
2. Click **"Create database"**
3. Choose **"Start in test mode"** for development
4. Select a location for your database

### 3. Database Structure

Create a collection called `articles` with the following document structure:

```javascript
{
    title: "Article Title",
    description: "Article description...",
    imageUrl: "https://example.com/image.jpg", // optional
    timestamp: firebase.firestore.Timestamp.now(),
    category: "news", // optional
    author: "Author Name" // optional
}
```

### 4. Security Rules (Development)

For development, use these Firestore security rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

**Note**: For production, implement proper authentication and more restrictive security rules.

### 5. Running the Website

1. Open `index.html` in a web browser
2. The website will automatically load content from Firebase
3. If Firebase is not configured, it will show placeholder content

## Responsive Design

### Desktop Layout
- Full-width header with logo and navigation buttons
- Large featured article section with image placeholder
- Grid layout for latest news articles
- Orange accent color scheme

### Mobile Layout
- Hamburger menu for navigation
- Stacked layout for better mobile experience
- Touch-friendly buttons and interactions
- Optimized image sizes and typography

## Customization

### Colors
- Primary Orange: `#ff6b35`
- Text: `#000000`
- Background: `#ffffff`
- Accent Blue: `#0066cc`

### Typography
- Font Family: Inter (Google Fonts)
- Responsive font sizes for different screen sizes

## Browser Support

- Chrome (recommended)
- Firefox
- Safari
- Edge
- Mobile browsers (iOS Safari, Chrome Mobile)

## Development

To add new features or modify the design:

1. **HTML**: Update `index.html` for structure changes
2. **CSS**: Modify `styles.css` for styling changes
3. **JavaScript**: Update `script.js` for functionality changes
4. **Firebase**: Modify the Firebase queries in `script.js` for data changes

## Troubleshooting

### Common Issues

1. **Firebase not loading**: Check your Firebase configuration in `index.html`
2. **CORS errors**: Make sure your Firebase project allows your domain
3. **Mobile menu not working**: Check JavaScript console for errors
4. **Images not displaying**: Verify image URLs in your Firestore documents

### Debug Mode

Open browser developer tools (F12) to see console logs and debug information.

## License

This project is open source and available under the MIT License.
