# Firebase Storage Setup Guide

## How to Upload Images to Firebase Storage

### Step 1: Enable Firebase Storage
1. Go to your Firebase Console
2. Click on "Storage" in the left menu
3. Click "Get started"
4. Choose "Start in test mode" (for now)
5. Select your Firebase project location
6. Click "Done"

### Step 2: Upload Images
1. In Firebase Storage, click "Files" tab
2. Click the "Upload file" button
3. Select your image files (PNG, JPG, etc.)
4. Upload them to a folder like "news-images/"

### Step 3: Get Image URLs
1. After uploading, click on an image
2. Copy the "Download URL" (it will look like: https://firebasestorage.googleapis.com/...)
3. Use this URL in your Firebase Firestore `imageUrl` field

### Step 4: Update Your Articles
In Firebase Firestore:
1. Go to your "articles" collection
2. Edit an article
3. Add/update the `imageUrl` field with the Firebase Storage URL
4. Save the document

## Example Firebase Storage URL:
```
https://firebasestorage.googleapis.com/v0/b/ehamburg-90958.appspot.com/o/news-images%2Fyour-image.jpg?alt=media&token=abc123
```

## File Structure in Firebase Storage:
```
news-images/
├── image1.jpg
├── image2.png
├── image3.jpg
└── ...
```

## Important Notes:
- Images are stored in Firebase Storage (not just URLs)
- You get a permanent download URL for each image
- The URL includes authentication tokens
- Images are optimized and served by Google's CDN
