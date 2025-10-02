# Red Notice Banner Setup Instructions

## 🔥 **Create Firebase Collection for Red Notice Banner**

### **Step 1: Go to Firebase Console**
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `ehamburg-90958`

### **Step 2: Use Existing `notice` Collection**
You already have a `notice` collection! Just update the existing document:

1. Click on your existing `notice` collection
2. Click on the existing document (the one with the long ID)
3. Update these fields:

| Field | Type | Value |
|-------|------|-------|
| `enabled` | boolean | `true` |
| `text` | string | `🚨 IMPORTANT: New game update available! Check out the latest features and improvements.` |
| `icon` | string | (leave empty - the "!" icon is built-in) |

### **Step 4: Save and Test**
1. Click **"Save"**
2. Go to your website and refresh the page
3. The red notice banner should now appear at the top

## 🎯 **Expected Result**
- Red notice banner appears at the top of all pages
- Banner shows your custom message and icon from Firebase
- Banner can be enabled/disabled by changing the `enabled` field
- Changes in Firebase will automatically update on your website

## 🔧 **Customization Options**

### **Change the Message:**
- Edit the `text` field in Firebase
- You can use HTML in the text field for links: `<a href="https://example.com">Click here</a>`

### **Change the Icon:**
- Edit the `icon` field in Firebase
- Use any emoji: `🚨`, `⚠️`, `📢`, `🔔`, etc.

### **Enable/Disable:**
- Set `enabled` to `true` to show the banner
- Set `enabled` to `false` to hide the banner

## 🎨 **Design Features**
- **Red background** (#ff0000) for high visibility
- **White text** for contrast
- **Fixed position** at the top of the page
- **Responsive design** that works on mobile and desktop
- **Smooth transitions** when showing/hiding

## 🔧 **Troubleshooting**

### **If notice banner doesn't appear:**
1. Check that the collection name is exactly `notice`
2. Check that the `enabled` field is set to `true`
3. Check that the `text` field has content
4. Clear your browser cache and refresh the page
5. Check the browser console for any errors

### **If notice banner shows "Loading...":**
1. Check that the `text` field has content
2. Check that the `icon` field has content
3. Make sure Firebase is properly connected

## 🎊 **Result**
Your website now has a **professional red notice banner** that automatically updates when you change content in Firebase. The banner will appear on all pages and can be customized with any message and icon you want!
