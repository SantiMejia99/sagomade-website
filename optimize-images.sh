#!/bin/bash

# Create optimized images directory
mkdir -p public/optimized

echo "Optimizing GIFs for web performance..."

# Optimize each GIF to much smaller size
for gif in public/gifs/*.gif; do
    if [ -f "$gif" ]; then
        filename=$(basename "$gif" .gif)
        echo "Optimizing $filename.gif..."
        
        # Convert to optimized GIF with much smaller size
        ffmpeg -i "$gif" \
            -vf "scale=400:-1,fps=15" \
            -colors 64 \
            "public/optimized/$filename.gif" \
            -y
        
        # Also create a tiny WebP version for even better performance
        ffmpeg -i "$gif" \
            -vf "scale=400:-1,fps=15" \
            -c:v libwebp \
            -quality 80 \
            -loop 0 \
            "public/optimized/$filename.webp" \
            -y
        
        echo "✓ Optimized $filename"
    fi
done

echo ""
echo "File size comparison:"
echo "===================="

for gif in public/gifs/*.gif; do
    if [ -f "$gif" ]; then
        filename=$(basename "$gif" .gif)
        original_size=$(du -h "$gif" | cut -f1)
        optimized_size=$(du -h "public/optimized/$filename.gif" 2>/dev/null | cut -f1 || echo "N/A")
        webp_size=$(du -h "public/optimized/$filename.webp" 2>/dev/null | cut -f1 || echo "N/A")

        echo "$filename:"
        echo "  Original: $original_size"
        echo "  Optimized: $optimized_size"
        echo "  WebP: $webp_size"
        echo ""
    fi
done

echo "Optimization complete! Check public/optimized/ directory."