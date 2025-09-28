# Quick Image Setup Guide

## Step 1: Upload Image to Firebase Storage
1. Go to Firebase Console → Storage
2. Click "Files" tab
3. Click "Upload file" 
4. Select your `news1.jpg` file
5. Upload it to a folder like `news-images/`

## Step 2: Get the Firebase Storage URL
1. After upload, click on the `news1.jpg` file
2. Copy the "Download URL" (looks like: https://firebasestorage.googleapis.com/...)
3. This is your image URL

## Step 3: Add URL to Firestore
1. Go to Firebase Console → Firestore Database
2. Go to your `articles` collection
3. Edit an article document
4. Add/update the `imageUrl` field
5. Paste the Firebase Storage URL you copied
6. Save the document

## Example Firebase Storage URL:
```
https://firebasestorage.googleapis.com/v0/b/ehamburg-90958.appspot.com/o/news-images%2Fnews1.jpg?alt=media&token=abc123def456
```

## Important Notes:
- Don't just put the filename "news1.jpg" in the imageUrl field
- You need the full Firebase Storage URL
- The URL must be accessible from the internet
- Make sure the image is uploaded to Firebase Storage, not just Firestore
