# Firebase Database Setup Guide for EHAMBURG DAILY

## Step 1: Create Firestore Database

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your `ehamburg-90958` project
3. Click **"Firestore Database"** in the left sidebar
4. Click **"Create database"**
5. Choose **"Start in test mode"** (for development)
6. Select a location (choose closest to your users)

## Step 2: Create Articles Collection

### Collection Name: `articles`

### Document Structure:
```javascript
{
  // Required fields
  title: "Your Article Title",
  description: "Your article description...",
  timestamp: firebase.firestore.Timestamp.now(),
  
  // Optional fields
  imageUrl: "https://example.com/image.jpg", // or video URL
  videoUrl: "https://example.com/video.mp4", // for videos
  category: "news", // news, sports, politics, etc.
  author: "Author Name",
  featured: true, // true for "New" section, false for "Latest News"
  published: true, // true to show, false to hide
  
  // Auto-generated fields
  createdAt: firebase.firestore.Timestamp.now(),
  updatedAt: firebase.firestore.Timestamp.now()
}
```

## Step 3: Security Rules

In Firebase Console > Firestore Database > Rules, use these rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow read access to all articles
    match /articles/{articleId} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

## Step 4: Sample Articles to Add

### Article 1 (Featured/New):
```javascript
{
  title: "Welcome to EHAMBURG DAILY",
  description: "Your trusted source for local news and community updates. Stay informed with the latest stories from our community.",
  timestamp: firebase.firestore.Timestamp.now(),
  imageUrl: "https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=800",
  category: "news",
  author: "EHAMBURG Team",
  featured: true,
  published: true,
  createdAt: firebase.firestore.Timestamp.now(),
  updatedAt: firebase.firestore.Timestamp.now()
}
```

### Article 2 (Latest News):
```javascript
{
  title: "Community Event This Weekend",
  description: "Join us for the annual community fair this Saturday at Central Park. Food, games, and entertainment for all ages.",
  timestamp: firebase.firestore.Timestamp.fromDate(new Date(Date.now() - 86400000)), // 1 day ago
  imageUrl: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=800",
  category: "events",
  author: "Community Team",
  featured: false,
  published: true,
  createdAt: firebase.firestore.Timestamp.fromDate(new Date(Date.now() - 86400000)),
  updatedAt: firebase.firestore.Timestamp.fromDate(new Date(Date.now() - 86400000))
}
```

### Article 3 (Latest News):
```javascript
{
  title: "Local Business Spotlight",
  description: "Meet the family-owned restaurant that has been serving our community for over 30 years.",
  timestamp: firebase.firestore.Timestamp.fromDate(new Date(Date.now() - 172800000)), // 2 days ago
  imageUrl: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800",
  category: "business",
  author: "Business Reporter",
  featured: false,
  published: true,
  createdAt: firebase.firestore.Timestamp.fromDate(new Date(Date.now() - 172800000)),
  updatedAt: firebase.firestore.Timestamp.fromDate(new Date(Date.now() - 172800000))
}
```

## Step 5: How the Auto-Rotation Works

1. **Featured Article**: The most recent article with `featured: true`
2. **Latest News**: All other published articles, ordered by timestamp (newest first)
3. **Auto-Rotation**: When you add a new article with `featured: true`, the old featured article automatically becomes part of "Latest News"

## Step 6: Adding New Articles

### Method 1: Firebase Console (Manual)
1. Go to Firestore Database
2. Click "Start collection"
3. Collection ID: `articles`
4. Add documents with the structure above

### Method 2: Admin Interface (Coming Soon)
We'll create an admin interface for easy article management.

## Step 7: Image/Video URLs

You can use:
- **Image URLs**: Any public image URL (Unsplash, your own hosting, etc.)
- **Video URLs**: YouTube, Vimeo, or direct video file URLs
- **Local Images**: Upload to Firebase Storage (we'll set this up)

## Step 8: Testing

1. Add a few sample articles using the structure above
2. Open your website
3. The newest article should appear in "New" section
4. Older articles should appear in "Latest News" section
5. Test adding a new article to see the rotation in action
