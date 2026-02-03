#!/usr/bin/env python3
"""
PoE-A2A Presentation Video Generator
Uses OpenAI TTS for narration and FFmpeg for stitching
"""

import subprocess
import os
from pathlib import Path
from openai import OpenAI

# Configuration
OUTPUT_DIR = Path("/Users/user1000/gitprojects/pdp-protocol/presentation")
OUTPUT_DIR.mkdir(exist_ok=True)

# Narration scripts for each chunk (timed to match screen recordings)
CHUNKS = [
    {
        "id": "01_intro",
        "duration": 8,
        "narration": """
The Agent-to-Agent web is exploding. But there's a fundamental problem.
How do you trust an agent you've never met?
Today, agents rely on self-reported stats or centralized registries.
That's not verification. That's faith.
""".strip(),
        "url": "https://pdp-protocol-production.up.railway.app/health"
    },
    {
        "id": "02_agent_card",
        "duration": 10,
        "narration": """
PoE-A2A solves this by extending standard A2A AgentCards with verifiable execution claims.
Here you can see the poe_extension field, containing the agent's signing key,
claims endpoint, and authorized anchors.
Every agent becomes its own reputation authority.
""".strip(),
        "url": "https://pdp-protocol-production.up.railway.app/.well-known/agent-card.json"
    },
    {
        "id": "03_claims",
        "duration": 12,
        "narration": """
The claims endpoint serves cryptographically signed execution history.
Each claim includes a task hash, output hash, timestamp, and Ed25519 signature.
High-value work can be anchored to the Solana blockchain for immutable audit trails.
Verifiers fetch claims on-demand and validate signatures locally in under five milliseconds.
""".strip(),
        "url": "https://pdp-protocol-production.up.railway.app/.well-known/poe-claims.json"
    },
    {
        "id": "04_badge",
        "duration": 6,
        "narration": """
For human-in-the-loop discovery, agents can display a PoE Verified badge.
This badge is dynamically generated from the claims endpoint.
Your work proves itself. No gatekeepers required.
""".strip(),
        "url": "https://pdp-protocol-production.up.railway.app/.well-known/poe-badge.svg"
    },
    {
        "id": "05_outro",
        "duration": 6,
        "narration": """
PoE-A2A. Sovereign trust for the agentic web.
Built by Berlin AI Labs for the Colosseum Agent Hackathon.
Fork it. Deploy it. Verify it.
""".strip(),
        "url": "https://github.com/yogami/pdp-protocol"
    }
]

def generate_tts(text: str, output_file: Path, voice: str = "nova"):
    """Generate TTS audio using OpenAI"""
    client = OpenAI()
    response = client.audio.speech.create(
        model="tts-1-hd",
        voice=voice,  # Options: alloy, echo, fable, onyx, nova, shimmer
        input=text,
        speed=0.95  # Slightly slower for clarity
    )
    response.stream_to_file(str(output_file))
    print(f"[TTS] Generated: {output_file}")

def get_audio_duration(file_path: Path) -> float:
    """Get duration of audio file using ffprobe"""
    result = subprocess.run([
        "ffprobe", "-v", "error", "-show_entries", "format=duration",
        "-of", "default=noprint_wrappers=1:nokey=1", str(file_path)
    ], capture_output=True, text=True)
    return float(result.stdout.strip())

def create_silent_video(duration: float, output_file: Path):
    """Create a black video with specified duration"""
    subprocess.run([
        "ffmpeg", "-y", "-f", "lavfi", "-i", f"color=c=black:s=1920x1080:d={duration}",
        "-c:v", "libx264", "-pix_fmt", "yuv420p", str(output_file)
    ], check=True)

def combine_video_audio(video_file: Path, audio_file: Path, output_file: Path):
    """Combine video with audio"""
    subprocess.run([
        "ffmpeg", "-y", "-i", str(video_file), "-i", str(audio_file),
        "-c:v", "copy", "-c:a", "aac", "-shortest", str(output_file)
    ], check=True)

def add_background_music(video_file: Path, music_file: Path, output_file: Path):
    """Add background music at lower volume"""
    subprocess.run([
        "ffmpeg", "-y", "-i", str(video_file), "-i", str(music_file),
        "-filter_complex", "[1:a]volume=0.15[bg];[0:a][bg]amix=inputs=2:duration=first",
        "-c:v", "copy", str(output_file)
    ], check=True)

def concatenate_videos(input_files: list, output_file: Path):
    """Concatenate multiple videos into one"""
    concat_file = OUTPUT_DIR / "concat_list.txt"
    with open(concat_file, "w") as f:
        for file in input_files:
            f.write(f"file '{file}'\n")
    
    subprocess.run([
        "ffmpeg", "-y", "-f", "concat", "-safe", "0", "-i", str(concat_file),
        "-c:v", "libx264", "-c:a", "aac", str(output_file)
    ], check=True)
    concat_file.unlink()

def main():
    print("[PoE-A2A] Starting presentation video generation...")
    
    # Step 1: Generate TTS for each chunk
    print("\n[Step 1] Generating TTS narration...")
    for chunk in CHUNKS:
        audio_file = OUTPUT_DIR / f"{chunk['id']}_narration.mp3"
        if not audio_file.exists():
            generate_tts(chunk["narration"], audio_file)
        else:
            print(f"[TTS] Skipping existing: {audio_file}")
    
    print("\n[Step 2] TTS generation complete!")
    print(f"Audio files saved to: {OUTPUT_DIR}")
    print("\nNext steps:")
    print("1. Record screen recordings for each URL using browser_subagent")
    print("2. Combine videos with audio using ffmpeg")
    print("3. Add background music and concatenate")

if __name__ == "__main__":
    main()
