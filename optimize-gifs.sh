#!/bin/bash

# Create optimized videos directory
mkdir -p public/videos

echo "Converting GIFs to optimized WebM videos..."

# Convert each GIF to WebM with optimization
for gif in public/gifs/*.gif; do
    if [ -f "$gif" ]; then
        filename=$(basename "$gif" .gif)
        echo "Converting $filename.gif..."
        
        # Convert to WebM with good compression
        ffmpeg -i "$gif" \
            -c:v libvpx-vp9 \
            -crf 30 \
            -b:v 0 \
            -vf "scale=800:-1" \
            -an \
            -loop 0 \
            "public/videos/$filename.webm" \
            -y
        
        # Also create MP4 fallback
        ffmpeg -i "$gif" \
            -c:v libx264 \
            -crf 23 \
            -preset fast \
            -vf "scale=800:-1" \
            -an \
            -loop 0 \
            "public/videos/$filename.mp4" \
            -y
        
        echo "✓ Converted $filename"
    fi
done

echo "Conversion complete! Check public/videos/ directory."
echo ""
echo "File size comparison:"
echo "===================="

for gif in public/gifs/*.gif; do
    if [ -f "$gif" ]; then
        filename=$(basename "$gif" .gif)
        gif_size=$(du -h "$gif" | cut -f1)
        webm_size=$(du -h "public/videos/$filename.webm" 2>/dev/null | cut -f1 || echo "N/A")
        mp4_size=$(du -h "public/videos/$filename.mp4" 2>/dev/null | cut -f1 || echo "N/A")
        
        echo "$filename:"
        echo "  GIF:  $gif_size"
        echo "  WebM: $webm_size"
        echo "  MP4:  $mp4_size"
        echo ""
    fi
done