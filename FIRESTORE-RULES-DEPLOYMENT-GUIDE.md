# Firestore Security Rules Deployment Guide

## URGENT: Replace Test Mode Before Expiration

Your Firestore database is currently in test mode which will expire in 1 day. Follow these steps to deploy the new security rules and keep your app functional.

## Step 1: Access Firebase Console

1. Go to https://console.firebase.google.com/
2. Sign in with your Google account
3. Select your project: `ehamburg-90958`

## Step 2: Navigate to Firestore Rules

1. In the left sidebar, click on "Firestore Database"
2. Click on the "Rules" tab at the top
3. You should see the current test mode rules that look like:
   ```
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /{document=**} {
         allow read, write: if request.time < timestamp.date(2025, XX, XX);
       }
     }
   }
   ```

## Step 3: Replace with New Secure Rules

1. Delete all the existing rules in the editor
2. Copy the entire content from `firestore-security-rules.rules` file
3. Paste it into the Firebase Console rules editor

## Step 4: Review the New Rules

The new rules provide:

### ✅ PUBLIC ACCESS (Read Only):
- `news` - News articles for your website
- `articles` - Additional articles  
- `posts` - Social media posts
- `gameUpdates` - Game update information
- `socialSettings` - Social media configuration
- `messageBanner` - Website notice settings
- `profiles` - User profiles (public view)
- `comments` - Comments on articles

### 🔐 AUTHENTICATED USER ACCESS:
- Can write to public collections (create/edit articles, posts, etc.)
- Can manage their own user data and settings

### 🛡️ PRIVATE ACCESS:
- `users/{userId}` - Only accessible by the specific user
- `userSettings/{userId}` - Private user settings
- `admin/*` - Only for admin users
- `analytics/*` - Write-only for app, read for admins

## Step 5: Deploy the Rules

1. Click the "Publish" button in the Firebase Console
2. Confirm the deployment when prompted
3. You should see "Rules published successfully"

## Step 6: Test Your Website

1. Open your website in a browser
2. Verify that:
   - ✅ News articles load correctly
   - ✅ Game updates display properly  
   - ✅ Social media posts show up
   - ✅ Message banners work
   - ✅ No permission errors in browser console

## Step 7: Monitor for Issues

1. Keep the Firebase Console open for a few minutes after deployment
2. Watch the "Usage" tab for any sudden spikes in denied requests
3. Check your website's browser console for any Firebase permission errors
4. If you see errors, you may need to adjust the rules

## Troubleshooting

### If you see "permission-denied" errors:
1. Check the browser console for the exact collection name causing issues
2. Add a rule for that collection in the format:
   ```
   match /collectionName/{document} {
     allow read: if true;
     allow write: if request.auth != null;
   }
   ```

### If authentication stops working:
1. The rules assume you're using Firebase Authentication
2. Make sure your auth system is properly configured
3. Users need to be signed in to write data

## Important Notes

- ⚠️ **DO THIS TODAY** - Test mode expires soon!
- ✅ Your website will continue to work for visitors (read access is public)
- ✅ Only writing/editing requires authentication  
- 🔐 User data is now properly protected
- 📊 The rules are production-ready and secure

## Backup Plan

If something goes wrong after deployment, you can temporarily revert to a more permissive rule set:

```
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

This allows anyone to read all data, and authenticated users to write anything. It's not ideal long-term but will keep your app working while you debug issues.

---

**Need Help?** If you encounter any issues during deployment, the key is to ensure that all the collections your app uses (`news`, `articles`, `posts`, `gameUpdates`, `socialSettings`, `messageBanner`) have read access for everyone and write access for authenticated users.