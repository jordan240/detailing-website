# Eau Auto Spa Gallery

Simple gallery system that uses local thumbnail images instead of Instagram embeds.

## How to Use

### 1. Add Your Thumbnail Images
Put all your thumbnail images in the `thumbnails/` folder.

### 2. Edit gallery-data.json
Add a `localThumbnail` property to each car in your `gallery-data.json` file:

```json
{
  "id": 1,
  "year": 2022,
  "make": "Volkswagen",
  "model": "Golf R",
  "instagramReelUrl": "https://www.instagram.com/reel/DNOtzjtyipj/",
  "localThumbnail": "./thumbnails/Image-287.jpg"
}
```

### 3. Example Paths
- `./thumbnails/Image-287.jpg`
- `./thumbnails/Image-466.jpg`
- `./thumbnails/Image-516.jpg`
- etc.

### 4. View Your Gallery
Open `gallery.html` in your browser to see the gallery with local thumbnails.

## File Structure
- `gallery.html` - Main gallery page
- `gallery.js` - Gallery functionality
- `gallery.css` - Gallery styling (with responsive image sizing)
- `gallery-data.json` - Your car data (edit this file)
- `thumbnails/` - Your thumbnail images folder

## Recent Updates
- ✅ **Image Sizing Fixed**: Thumbnail containers now automatically size to fit the actual image dimensions
- ✅ **Responsive Design**: Images scale properly on mobile and desktop devices
- ✅ **Consistent Layout**: All car cards now have uniform heights and proper spacing
- ✅ **Local Thumbnails**: Gallery uses local image files instead of Instagram embeds

## Notes
- The gallery will show a placeholder if no `localThumbnail` is specified
- Make sure image paths are correct relative to the gallery files
- Supported formats: .jpg, .jpeg, .png, .webp
- Images automatically resize to maintain aspect ratio while fitting the container
