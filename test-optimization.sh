#!/bin/bash

# Test optimization with one GIF first
echo "Testing GIF optimization with consultation-notice.gif..."

# Create videos directory
mkdir -p public/videos

# Convert consultation-notice.gif to WebM
echo "Converting to WebM..."
ffmpeg -i "public/gifs/consultation-notice.gif" \
    -c:v libvpx-vp9 \
    -crf 30 \
    -b:v 0 \
    -vf "scale=800:-1" \
    -an \
    -loop 0 \
    "public/videos/consultation-notice.webm" \
    -y

# Convert to MP4
echo "Converting to MP4..."
ffmpeg -i "public/gifs/consultation-notice.gif" \
    -c:v libx264 \
    -crf 23 \
    -preset fast \
    -vf "scale=800:-1" \
    -an \
    -loop 0 \
    "public/videos/consultation-notice.mp4" \
    -y

echo ""
echo "File size comparison:"
echo "===================="
echo "Original GIF:"
ls -lh public/gifs/consultation-notice.gif
echo ""
echo "Optimized WebM:"
ls -lh public/videos/consultation-notice.webm
echo ""
echo "Optimized MP4:"
ls -lh public/videos/consultation-notice.mp4
echo ""
echo "Size reduction:"
gif_size=$(stat -c%s public/gifs/consultation-notice.gif)
webm_size=$(stat -c%s public/videos/consultation-notice.webm)
mp4_size=$(stat -c%s public/videos/consultation-notice.mp4)

webm_reduction=$((100 - (webm_size * 100 / gif_size)))
mp4_reduction=$((100 - (mp4_size * 100 / gif_size)))

echo "WebM: ${webm_reduction}% smaller"
echo "MP4: ${mp4_reduction}% smaller"