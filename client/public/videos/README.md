# Video Background Setup

## Adding a Background Video

To add a slow-motion background video to the homepage:

1. Place your video file(s) in this directory (`client/public/videos/`)

2. Recommended video specifications:
   - **Format**: MP4 (H.264 codec) or WebM
   - **Resolution**: 1920x1080 (Full HD) or higher
   - **Duration**: 10-30 seconds (will loop)
   - **File size**: Under 5MB (optimize for web)
   - **Content**: Pharmacy/medical related, professional, subtle

3. Name your video file: `pharmacy-background.mp4`
   - Or provide both formats: `pharmacy-background.mp4` and `pharmacy-background.webm`

4. Video optimization tips:
   - Use tools like HandBrake or FFmpeg to compress
   - Example FFmpeg command:
     ```bash
     ffmpeg -i input.mp4 -vf "scale=1920:1080" -crf 28 -preset slow -an pharmacy-background.mp4
     ```
   - Remove audio track (`-an` flag) to reduce file size

5. The video will automatically:
   - Play in slow motion (0.5x speed)
   - Loop continuously
   - Be muted
   - Have a dark overlay for text readability

## Fallback

If no video is found, the page will automatically use a gradient background instead.

## Example Video Sources

You can find free stock videos at:
- Pexels Videos: https://www.pexels.com/videos/
- Pixabay: https://pixabay.com/videos/
- Unsplash: https://unsplash.com/

Search for: "pharmacy", "medical", "healthcare", "hospital", "medicine"

