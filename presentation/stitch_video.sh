#!/bin/bash
# PoE-A2A Presentation Video Stitcher
# Combines slides with TTS narration and background music

set -e

ARTIFACTS_DIR="/Users/user1000/.gemini/antigravity/brain/c5ed22d7-4f1c-4299-ab8d-0f6e7845eefc"
PRESENTATION_DIR="/Users/user1000/gitprojects/pdp-protocol/presentation"
OUTPUT_DIR="/Users/user1000/gitprojects/pdp-protocol/presentation/output"
mkdir -p "$OUTPUT_DIR"

# Slide files (in order)
SLIDE_1="$ARTIFACTS_DIR/poe_title_slide_1770156101734.png"
SLIDE_2="$ARTIFACTS_DIR/poe_architecture_diagram_1770156115783.png"
SLIDE_3="$ARTIFACTS_DIR/poe_verification_flow_1770156134029.png"
SLIDE_4="$ARTIFACTS_DIR/poe_solana_integration_1770156180290.png"
SLIDE_5="$ARTIFACTS_DIR/poe_closing_slide_1770156194604.png"

# Audio files (in order)
AUDIO_1="$PRESENTATION_DIR/01_intro_narration.mp3"
AUDIO_2="$PRESENTATION_DIR/02_agent_card_narration.mp3"
AUDIO_3="$PRESENTATION_DIR/03_claims_narration.mp3"
AUDIO_4="$PRESENTATION_DIR/04_badge_narration.mp3"
AUDIO_5="$PRESENTATION_DIR/05_outro_narration.mp3"

echo "[1/6] Creating individual video chunks..."

# Create video from each slide + audio
ffmpeg -y -loop 1 -i "$SLIDE_1" -i "$AUDIO_1" -c:v libx264 -tune stillimage -c:a aac -b:a 192k -pix_fmt yuv420p -shortest "$OUTPUT_DIR/chunk_01.mp4"
ffmpeg -y -loop 1 -i "$SLIDE_2" -i "$AUDIO_2" -c:v libx264 -tune stillimage -c:a aac -b:a 192k -pix_fmt yuv420p -shortest "$OUTPUT_DIR/chunk_02.mp4"
ffmpeg -y -loop 1 -i "$SLIDE_3" -i "$AUDIO_3" -c:v libx264 -tune stillimage -c:a aac -b:a 192k -pix_fmt yuv420p -shortest "$OUTPUT_DIR/chunk_03.mp4"
ffmpeg -y -loop 1 -i "$SLIDE_4" -i "$AUDIO_4" -c:v libx264 -tune stillimage -c:a aac -b:a 192k -pix_fmt yuv420p -shortest "$OUTPUT_DIR/chunk_04.mp4"
ffmpeg -y -loop 1 -i "$SLIDE_5" -i "$AUDIO_5" -c:v libx264 -tune stillimage -c:a aac -b:a 192k -pix_fmt yuv420p -shortest "$OUTPUT_DIR/chunk_05.mp4"

echo "[2/6] Creating concat list..."
cat > "$OUTPUT_DIR/concat_list.txt" << EOF
file 'chunk_01.mp4'
file 'chunk_02.mp4'
file 'chunk_03.mp4'
file 'chunk_04.mp4'
file 'chunk_05.mp4'
EOF

echo "[3/6] Concatenating chunks..."
ffmpeg -y -f concat -safe 0 -i "$OUTPUT_DIR/concat_list.txt" -c copy "$OUTPUT_DIR/combined_no_music.mp4"

echo "[4/6] Downloading royalty-free piano background music..."
# Using a simple approach: generate silent background or use existing
# For a real production, we'd download from freesound.org or similar
# Creating a simple ambient tone as placeholder
ffmpeg -y -f lavfi -i "anoisesrc=d=60:c=pink:a=0.02" -c:a aac "$OUTPUT_DIR/ambient_bg.m4a"

echo "[5/6] Mixing narration with background..."
DURATION=$(ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "$OUTPUT_DIR/combined_no_music.mp4")
ffmpeg -y -i "$OUTPUT_DIR/combined_no_music.mp4" -i "$OUTPUT_DIR/ambient_bg.m4a" \
  -filter_complex "[1:a]volume=0.1,atrim=0:$DURATION[bg];[0:a][bg]amix=inputs=2:duration=first[out]" \
  -map 0:v -map "[out]" -c:v copy -c:a aac "$OUTPUT_DIR/final_presentation.mp4"

echo "[6/6] Cleaning up..."
rm -f "$OUTPUT_DIR/chunk_0*.mp4" "$OUTPUT_DIR/concat_list.txt" "$OUTPUT_DIR/ambient_bg.m4a" "$OUTPUT_DIR/combined_no_music.mp4"

echo ""
echo "✅ Presentation video created successfully!"
echo "📁 Output: $OUTPUT_DIR/final_presentation.mp4"
echo ""
echo "Duration: ${DURATION}s"
