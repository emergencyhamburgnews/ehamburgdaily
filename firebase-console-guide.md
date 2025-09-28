# 🔥 Firebase Console Management Guide

## How to Manage Your Articles Using Firebase Console

### Step 1: Create Your First Collection

1. **Go to Firebase Console** (as shown in your image)
2. **Click "Start collection"** (the blue plus icon)
3. **Collection ID**: Type `articles`
4. **Click "Next"**

### Step 2: Add Your First Article

1. **Document ID**: Leave empty (Firebase will auto-generate)
2. **Click "Auto-ID"** to generate a random ID
3. **Add these fields one by one**:

#### Field 1: `title`
- **Field**: `title`
- **Type**: `string`
- **Value**: `"Welcome to EHAMBURG DAILY"`

#### Field 2: `description`
- **Field**: `description`
- **Type**: `string`
- **Value**: `"Your trusted source for local news and community updates."`

#### Field 3: `author`
- **Field**: `author`
- **Type**: `string`
- **Value**: `"EHAMBURG Team"`

#### Field 4: `category`
- **Field**: `category`
- **Type**: `string`
- **Value**: `"news"`

#### Field 5: `imageUrl`
- **Field**: `imageUrl`
- **Type**: `string`
- **Value**: `"https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=800"`

#### Field 6: `timestamp`
- **Field**: `timestamp`
- **Type**: `timestamp`
- **Value**: Click the clock icon and select "Now"

#### Field 7: `featured`
- **Field**: `featured`
- **Type**: `boolean`
- **Value**: `true`

#### Field 8: `published`
- **Field**: `published`
- **Type**: `boolean`
- **Value**: `true`

4. **Click "Save"**

### Step 3: Add More Articles

Repeat the process above for each new article. For the **featured article** (the one that appears in "New" section):
- Set `featured: true`
- Set `timestamp` to the current time

For **latest news articles**:
- Set `featured: false`
- Set `timestamp` to an earlier time

### Step 4: How the Auto-Rotation Works

1. **Featured Article**: The article with the most recent `timestamp`
2. **Latest News**: All other articles, ordered by `timestamp`
3. **To make a new article featured**: 
   - Add a new article with `featured: true`
   - Set `timestamp` to current time
   - The old featured article automatically becomes "Latest News"

## 📝 Article Structure Template

When adding new articles, use this structure:

```
title: "Your Article Title"
description: "Your article description..."
author: "Author Name"
category: "news" (or "sports", "politics", "business", "events")
imageUrl: "https://example.com/image.jpg" (optional)
videoUrl: "https://example.com/video.mp4" (optional)
timestamp: [current time]
featured: true (for "New" section) or false (for "Latest News")
published: true
```

## 🖼️ Image URLs You Can Use

- **Unsplash**: `https://images.unsplash.com/photo-[ID]?w=800`
- **Pexels**: `https://images.pexels.com/photos/[ID]/pexels-photo-[ID].jpeg?w=800`
- **Your own images**: Upload to any image hosting service

## 🎯 Quick Tips

1. **Always set `timestamp` to current time** for new articles
2. **Only one article should have `featured: true`** at a time
3. **Use `published: true`** to show articles on your website
4. **Use `published: false`** to hide articles temporarily

## 🔄 Making an Article Featured

1. Find the article you want to feature
2. Click on it to edit
3. Change `featured` from `false` to `true`
4. Update `timestamp` to current time
5. Save the changes

The old featured article will automatically move to "Latest News"!

## 🗑️ Deleting Articles

1. Click on the article you want to delete
2. Click the trash icon
3. Confirm deletion

## ✏️ Editing Articles

1. Click on any article in the Firebase Console
2. Edit the fields you want to change
3. Click "Save"

Your website will automatically update with the new content!
