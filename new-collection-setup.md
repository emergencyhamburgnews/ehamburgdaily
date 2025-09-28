# New Firebase Collection Setup

## Create New Collection: `news`

### Step 1: Create New Collection
1. Go to Firebase Console → Firestore Database
2. Click "Start collection"
3. Collection ID: `news`
4. Click "Next"

### Step 2: Create First Document
1. Document ID: `auto` (or leave empty for auto-generated)
2. Add these fields:
   - `title` (string): "Your News Title"
   - `description` (string): "Your news description"
   - `timestamp` (timestamp): Current date/time
   - `imageUrl` (string): "news1.jpg" (just the filename)
3. Click "Save"

### Step 3: Add More News Articles
- Each new article will automatically appear at the top
- Newest articles show first (ordered by timestamp)
- Just add the image file to your website folder

## Required Fields for Each News Article:
- `title` (string) - News headline
- `description` (string) - News content
- `timestamp` (timestamp) - When the news was published
- `imageUrl` (string) - Image filename (e.g., "news1.jpg")

## How It Works:
1. Add new article to `news` collection
2. Article automatically appears at top of website
3. Older articles move down
4. No need to manage "featured" vs "latest" - it's all automatic!
