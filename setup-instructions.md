# 🚀 EHAMBURG DAILY - Complete Setup Instructions

## What You Have Now:

✅ **Main Website** (`index.html`) - Your public news site  
✅ **Firebase Console Management** - Manage articles directly in Firebase  
✅ **Firebase Integration** - Real-time database connection  
✅ **Auto-Rotation System** - New articles automatically move to Latest News  

## 🎯 Quick Start (5 Minutes):

### Step 1: Set Up Firebase Database
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your `ehamburg-90958` project
3. Click **"Firestore Database"** → **"Create database"**
4. Choose **"Start in test mode"**
5. Select a location (closest to your users)

### Step 2: Add Your First Article
1. In Firebase Console, click **"Start collection"**
2. **Collection ID**: `articles`
3. **Document ID**: Leave empty (auto-generate)
4. Add these fields:
   - `title`: "Welcome to EHAMBURG DAILY"
   - `description`: "Your trusted source for local news..."
   - `author`: "EHAMBURG Team"
   - `category`: "news"
   - `imageUrl`: `https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=800`
   - `timestamp`: Click clock icon → "Now"
   - `featured`: `true`
   - `published`: `true`
5. Click **"Save"**

### Step 3: View Your Website
1. Open `index.html` in your browser
2. You should see your article in the "New" section!

## 🔄 How the Auto-Rotation Works:

1. **Featured Article**: The most recent article you add
2. **Latest News**: All other articles, ordered by date
3. **Auto-Rotation**: When you add a new featured article, the old one automatically moves to "Latest News"

## 📝 Adding More Articles:

### Using Firebase Console (Your Preferred Method)
1. Go to Firebase Console → Firestore Database
2. Click "Start collection" → Collection ID: `articles`
3. Add documents with this structure:

```javascript
{
  title: "Your Article Title",
  description: "Your article description...",
  author: "Author Name",
  category: "news",
  imageUrl: "https://example.com/image.jpg",
  timestamp: firebase.firestore.Timestamp.now(),
  featured: true, // or false
  published: true,
  createdAt: firebase.firestore.Timestamp.now(),
  updatedAt: firebase.firestore.Timestamp.now()
}
```

## 🖼️ Adding Images/Videos:

### Option 1: Use Image URLs
- **Unsplash**: `https://images.unsplash.com/photo-[ID]?w=800`
- **Your own hosting**: Upload to any image hosting service
- **Direct URLs**: Any publicly accessible image URL

### Option 2: Firebase Storage (Advanced)
- Upload images to Firebase Storage
- Get the download URL
- Use that URL in your articles

## 🎨 Customizing Your Website:

### Colors
- Primary Orange: `#ff6b35`
- Text: `#000000`
- Background: `#ffffff`

### Logo
- Replace the text logo with your actual logo images
- Update the CSS to use your logo files

### Content
- All content is managed through the admin panel
- No need to edit HTML/CSS for content changes

## 🔧 Troubleshooting:

### Website Not Loading Articles
1. Check Firebase Console for errors
2. Make sure Firestore is created and in test mode
3. Check browser console for JavaScript errors

### Admin Panel Not Working
1. Make sure you're using `admin.html` (not `index.html`)
2. Check that Firebase is properly configured
3. Try refreshing the page

### Images Not Showing
1. Make sure image URLs are publicly accessible
2. Check that URLs are complete (include `https://`)
3. Try the image URL directly in a browser

## 📱 Mobile Testing:

1. Open your website on mobile
2. Test the hamburger menu
3. Check that articles display properly
4. Test on different screen sizes

## 🚀 Going Live:

### For Development
- Just open the HTML files in your browser
- Use Firebase test mode for easy development

### For Production
1. Set up proper Firebase security rules
2. Add authentication to admin panel
3. Deploy to a web hosting service
4. Set up custom domain (optional)

## 📞 Need Help?

- Check the browser console for errors
- Make sure all files are in the same folder
- Verify Firebase configuration is correct
- Test with sample articles first

## 🎉 You're All Set!

Your news website is now fully functional with:
- ✅ Responsive design (mobile + desktop)
- ✅ Firebase backend
- ✅ Easy article management
- ✅ Auto-rotation system
- ✅ Image/video support
- ✅ Admin panel

Just add your content and you're ready to go! 🚀
