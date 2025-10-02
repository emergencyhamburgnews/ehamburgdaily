# Firebase Setup Instructions

## 🔥 **Create Firebase Collection for Message Banner**

### **Step 1: Go to Firebase Console**
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `ehamburg-90958`

### **Step 2: Create `messageSettings` Collection**
1. Click on **"Firestore Database"** in the left sidebar
2. Click **"Start collection"** (if no collections exist) or **"Add collection"**
3. Collection ID: `messageSettings`
4. Click **"Next"**

### **Step 3: Add Document**
1. Document ID: `settings` (or leave auto-generated)
2. Add these fields:

| Field | Type | Value |
|-------|------|-------|
| `enabled` | boolean | `true` |
| `message` | string | `Welcome to EHAMBURG DAILY! Stay updated with the latest news and game updates.` |
| `lastUpdated` | timestamp | (current date/time) |

### **Step 4: Save and Test**
1. Click **"Save"**
2. Go to your website and refresh the page
3. The banner should now show your custom message instead of "My message..."

## 🎯 **Expected Result**
- Banner will show your custom message from Firebase
- Banner can be enabled/disabled from the settings page
- Changes in Firebase will automatically update on your website

## 🔧 **If Banner Still Shows "My message..."**
1. Check that the collection name is exactly `messageSettings`
2. Check that the document has the `enabled` field set to `true`
3. Check that the `message` field has your custom text
4. Clear your browser cache and refresh the page
