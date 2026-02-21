# Anonylist

Anonymous YouTube Playlist Creator - Create and share YouTube playlists without an account.

## Features

- **Add Videos**: Paste YouTube URLs or drag & drop multiple URLs
- **Reorder**: Drag videos to reorder your playlist
- **Share**: Generate a compressed URL to share your playlist
- **No Account Required**: Completely anonymous - no login, no tracking
- **URL Compression**: Playlists are compressed using LZ-string to minimize URL length

## Supported URL Formats

- `https://www.youtube.com/watch?v=VIDEO_ID`
- `https://youtu.be/VIDEO_ID`
- `https://www.youtube.com/embed/VIDEO_ID`
- `https://www.youtube.com/shorts/VIDEO_ID`

## Usage

1. Open `index.html` in a web browser
2. Add YouTube videos by:
   - Pasting URLs into the input field
   - Dragging and dropping text containing URLs
3. Reorder videos by dragging them
4. Enter a playlist name
5. Click "Generate Share Link" to create a shareable URL

## Files

- `index.html` - Main HTML file
- `style.css` - Styles
- `script.js` - Functionality

## Browser Support

Works in all modern browsers. URL length warning appears for URLs exceeding 4000 characters.

## License

MIT
