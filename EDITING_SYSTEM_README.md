# 📝 Robust Editing System - User Guide

## 🎉 What's New

Your 3D book app now has a **complete local editing system** with these features:

### ✅ Completed Features

1. **Dynamic Page Management**
   - Add new pages to your book (button in bottom-right)
   - Pages persist during your session (stored in browser localStorage)
   - Uniform page sizes (1325x1771 pixels)

2. **Robust Fabric.js Editor**
   - Full-screen modal editor
   - Add text with Hebrew (RTL) support
   - Upload images from your computer
   - Add images from URLs (including Google Drive)
   - Add videos with thumbnail previews (Google Drive, YouTube, or direct URLs)
   - Drag, resize, rotate, and delete objects
   - Undo/Redo support (Ctrl+Z / Ctrl+Y)
   - Layering controls (bring to front, send to back)
   - High-quality export to PNG

3. **Video Support**
   - Google Drive video URLs automatically convert to thumbnails
   - YouTube video support
   - Placeholder generation for videos without thumbnails
   - Video metadata stored for future playback features

4. **Seamless Integration**
   - Edit any page by clicking "ערוך עמוד" (Edit Page) button
   - Changes immediately reflected in the 3D book
   - Navigate between pages while viewing

---

## 🚀 How to Use

### Starting the App

```bash
# Install dependencies (if not already installed)
npm install
# or
yarn install

# Start development server
npm run dev
# or
yarn dev
```

Then open `http://localhost:5173` in your browser.

---

### Adding a New Page

1. Click the **"+ הוסף עמוד"** (Add Page) button in the bottom-right corner
2. Confirm in the dialog
3. The editor will automatically open for the new page
4. Design your page (see editing instructions below)
5. Click **"שמור וסגור"** (Save and Close)
6. The new page appears in your book!

---

### Editing a Page

1. Navigate to the page you want to edit using the navigation buttons at the top
2. Click **"✏️ ערוך עמוד"** (Edit Page) button in the top-right corner
3. The full-screen editor opens

**Editor Tools:**

| Button | Function | Shortcut |
|--------|----------|----------|
| 📝 טקסט | Add text | - |
| 🖼️ העלה תמונה | Upload image from computer | - |
| 🔗 תמונה מקישור | Add image from URL | - |
| 🎬 וידאו | Add video (Google Drive/YouTube/URL) | - |
| ↶ | Undo | Ctrl+Z |
| ↷ | Redo | Ctrl+Y |
| ⬆️ | Bring selected to front | - |
| ⬇️ | Send selected to back | - |
| 🗑️ מחק | Delete selected object | Delete/Backspace |
| 🗑️ נקה הכל | Clear entire canvas | - |

**Editing Objects:**
- **Move**: Click and drag
- **Resize**: Drag corner handles
- **Rotate**: Drag rotation handle at top
- **Edit Text**: Double-click text to edit content
- **Delete**: Select object and press Delete key or click delete button

---

### Adding Videos

**Supported Video Sources:**

1. **Google Drive** (Recommended)
   - Share your video → "Anyone with the link can view"
   - Copy the sharing link
   - Paste in the editor
   - Example: `https://drive.google.com/file/d/1ABC...XYZ/view`

2. **YouTube**
   - Copy video URL
   - Paste in the editor
   - Example: `https://www.youtube.com/watch?v=dQw4w9WgXcQ`

3. **Direct Video URLs**
   - Any public .mp4, .mov, .webm URL
   - Example: `https://example.com/video.mp4`

**What Happens:**
- The system generates a thumbnail with a play icon
- Video metadata is stored (you can add playback features later)
- The thumbnail appears in your book page

---

## 🗂️ File Structure

```
src/
├── store/
│   └── atoms.js                    # Jotai state management
│                                   # - bookPagesAtom: All pages
│                                   # - currentPageAtom: Current page index
│                                   # - editModeAtom: Editor open/closed
│
├── components/
│   ├── editor/
│   │   └── EditorCanvas.jsx        # Main Fabric.js editor
│   │
│   ├── pages/
│   │   └── PageManager.jsx         # Add/remove page controls
│   │
│   ├── Book.jsx                    # 3D book (now uses dynamic pages)
│   ├── UI.jsx                      # Navigation & edit button
│   └── Experience.jsx              # 3D scene setup
│
└── utils/
    └── videoHelpers.js             # Video URL parsing & thumbnails
```

---

## 🎨 Page Data Structure

Each page is stored with this structure:

```javascript
{
  id: "page-1234567890-abc123",     // Unique ID
  pageNumber: 0,                    // Index in book
  front: {
    texture: "data:image/png;base64...",  // PNG image or URL
    fabricJSON: {...},              // Fabric.js canvas state
    type: "cover" | "page"
  },
  back: {
    texture: "data:image/png;base64...",
    fabricJSON: {...},
    type: "page"
  }
}
```

**Storage:**
- Pages are stored in browser localStorage with key `book-pages`
- Persists across page refreshes during your session
- To reset: Clear browser localStorage

---

## 🔧 Troubleshooting

### Editor doesn't open
- Check browser console for errors
- Ensure Fabric.js is installed: `npm install fabric`
- Try refreshing the page

### Videos don't show thumbnails
- **Google Drive**: Make sure video is shared publicly
- **YouTube**: Check if video is available in your region
- **Fallback**: System generates a placeholder with play icon

### Images from URLs fail to load
- URL must be publicly accessible
- Check CORS settings on the image host
- Try uploading the image from your computer instead

### Hebrew text appears reversed
- The editor is configured for RTL (right-to-left)
- If text appears wrong, check the `direction` property in EditorCanvas.jsx

### Page changes not saving
- Click "שמור וסגור" (Save and Close) button before closing
- Changes are only saved when you explicitly click save
- Check localStorage in browser DevTools to see saved data

### Book appears empty after refresh
- Check if localStorage has data: DevTools → Application → Local Storage
- If empty, the initial pages should load from atoms.js
- Clear localStorage and refresh to reset to defaults

---

## 🎯 Next Steps (Future Enhancements)

### Immediate (Already Implemented):
- ✅ Add pages locally
- ✅ Edit pages with text, images, videos
- ✅ Google Drive video support
- ✅ Uniform page sizes
- ✅ Session persistence

### Future Phase 1 (Optional):
- [ ] Video playback modal (click video thumbnail to play)
- [ ] Page reordering (drag & drop in page list)
- [ ] Templates (quick layouts)
- [ ] More shapes and drawing tools
- [ ] Export book as PDF

### Future Phase 2 (Backend - From IMPLEMENTATION_PLAN.md):
- [ ] Google OAuth authentication
- [ ] Cloud storage for media
- [ ] Share books with others
- [ ] Collaborative editing
- [ ] Q&A workflow

---

## 💾 Data Persistence

**Current**: LocalStorage (browser session)
- Data stored in: `localStorage.getItem('book-pages')`
- Survives page refresh
- Lost if you clear browser data

**To make permanent:**
1. Export pages as JSON
2. Save to file
3. Or implement backend (see IMPLEMENTATION_PLAN.md)

**Export Pages (Browser Console):**
```javascript
// Copy all pages as JSON
console.log(JSON.stringify(localStorage.getItem('book-pages')))
```

**Import Pages (Browser Console):**
```javascript
// Paste your JSON data
localStorage.setItem('book-pages', 'YOUR_JSON_HERE')
location.reload()
```

---

## 📞 Support

For issues or questions:
- Check EDITING_SYSTEM_PLAN.md for technical details
- Check IMPLEMENTATION_PLAN.md for future roadmap
- Email: eyalizenman@gmail.com

---

## 🎨 Customization

### Change Page Dimensions

Edit `src/components/editor/EditorCanvas.jsx`:

```javascript
const PAGE_DIMENSIONS = {
  width: 1325,   // Change width
  height: 1771,  // Change height
};
```

### Change Initial Pages

Edit `src/store/atoms.js`:

```javascript
const initialPages = [
  {
    id: generatePageId(),
    pageNumber: 0,
    front: {
      texture: '/your/image/path.png',
      fabricJSON: null,
      type: 'cover'
    },
    // ... more pages
  }
];
```

### Add More Video Services

Edit `src/utils/videoHelpers.js` and add parsers for:
- Vimeo
- Dropbox
- OneDrive
- Your custom video host

---

## 🚨 Known Limitations

1. **Session-only storage**: Pages are not saved to a database yet
2. **No collaboration**: One user at a time can edit
3. **Video thumbnails**: May not work for all private videos
4. **Large files**: Editor may slow down with many high-res images
5. **Browser compatibility**: Best in Chrome/Edge/Firefox (modern browsers)

---

## ✨ Tips & Tricks

1. **Quick text editing**: Double-click any text to edit in-place
2. **Keyboard shortcuts**: Use Ctrl+Z/Y for undo/redo
3. **Delete key**: Select object and press Delete for quick removal
4. **Scale proportionally**: Hold Shift while resizing (Fabric.js default)
5. **Multiple objects**: Shift+click to select multiple items
6. **Hebrew text**: The editor is already configured for RTL Hebrew
7. **Video quality**: Use Google Drive for best video thumbnail quality
8. **Page organization**: Pages are ordered by pageNumber in the book

---

**Enjoy creating your interactive 3D books! 📚✨**
