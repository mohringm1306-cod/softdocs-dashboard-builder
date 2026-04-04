#!/usr/bin/env python3
"""
Fetch tracks from a Spotify playlist using the Spotify Web API.

Usage:
    1. Create a Spotify app at https://developer.spotify.com/dashboard
    2. Set environment variables:
         export SPOTIFY_CLIENT_ID="your_client_id"
         export SPOTIFY_CLIENT_SECRET="your_client_secret"
    3. Run: python3 spotify_playlist.py

The script fetches all tracks from the playlist and outputs them as JSON
and a human-readable list.
"""

import base64
import json
import os
import sys
import urllib.request
import urllib.error
import urllib.parse

PLAYLIST_ID = "26zPUoXVy1E9sLVAgFbNg8"
SPOTIFY_API_BASE = "https://api.spotify.com/v1"


def get_access_token(client_id, client_secret):
    """Get an access token using the Client Credentials flow."""
    credentials = base64.b64encode(f"{client_id}:{client_secret}".encode()).decode()
    data = urllib.parse.urlencode({"grant_type": "client_credentials"}).encode()
    req = urllib.request.Request(
        "https://accounts.spotify.com/api/token",
        data=data,
        headers={
            "Authorization": f"Basic {credentials}",
            "Content-Type": "application/x-www-form-urlencoded",
        },
    )
    with urllib.request.urlopen(req) as resp:
        return json.loads(resp.read())["access_token"]


def fetch_playlist(token, playlist_id):
    """Fetch playlist metadata."""
    req = urllib.request.Request(
        f"{SPOTIFY_API_BASE}/playlists/{playlist_id}?fields=name,description,owner(display_name),followers(total),tracks(total)",
        headers={"Authorization": f"Bearer {token}"},
    )
    with urllib.request.urlopen(req) as resp:
        return json.loads(resp.read())


def fetch_playlist_tracks(token, playlist_id):
    """Fetch all tracks from a playlist, handling pagination."""
    tracks = []
    url = f"{SPOTIFY_API_BASE}/playlists/{playlist_id}/tracks?fields=items(track(name,artists(name),album(name,release_date),duration_ms,external_urls)),next&limit=100"

    while url:
        req = urllib.request.Request(url, headers={"Authorization": f"Bearer {token}"})
        with urllib.request.urlopen(req) as resp:
            data = json.loads(resp.read())
        tracks.extend(data.get("items", []))
        url = data.get("next")

    return tracks


def format_duration(ms):
    """Convert milliseconds to mm:ss format."""
    seconds = ms // 1000
    return f"{seconds // 60}:{seconds % 60:02d}"


def main():
    client_id = os.environ.get("SPOTIFY_CLIENT_ID")
    client_secret = os.environ.get("SPOTIFY_CLIENT_SECRET")

    if not client_id or not client_secret:
        print("Error: Set SPOTIFY_CLIENT_ID and SPOTIFY_CLIENT_SECRET environment variables.")
        print()
        print("To get credentials:")
        print("  1. Go to https://developer.spotify.com/dashboard")
        print("  2. Create an app (any name/description, no redirect URI needed)")
        print("  3. Copy the Client ID and Client Secret")
        print()
        print("Then run:")
        print('  export SPOTIFY_CLIENT_ID="your_id"')
        print('  export SPOTIFY_CLIENT_SECRET="your_secret"')
        print(f"  python3 {sys.argv[0]}")
        sys.exit(1)

    print("Authenticating with Spotify...")
    token = get_access_token(client_id, client_secret)

    print(f"Fetching playlist {PLAYLIST_ID}...")
    playlist = fetch_playlist(token, PLAYLIST_ID)

    print(f"\n{'=' * 60}")
    print(f"Playlist: {playlist['name']}")
    if playlist.get("description"):
        print(f"Description: {playlist['description']}")
    print(f"Owner: {playlist['owner']['display_name']}")
    print(f"Followers: {playlist['followers']['total']}")
    print(f"Total tracks: {playlist['tracks']['total']}")
    print(f"{'=' * 60}\n")

    items = fetch_playlist_tracks(token, PLAYLIST_ID)

    # Print human-readable list
    for i, item in enumerate(items, 1):
        track = item.get("track")
        if not track:
            continue
        artists = ", ".join(a["name"] for a in track["artists"])
        duration = format_duration(track["duration_ms"])
        print(f"{i:3d}. {track['name']} - {artists} [{duration}]")
        print(f"     Album: {track['album']['name']}")

    # Save to JSON
    output = {
        "playlist": playlist,
        "tracks": [
            {
                "name": item["track"]["name"],
                "artists": [a["name"] for a in item["track"]["artists"]],
                "album": item["track"]["album"]["name"],
                "duration_ms": item["track"]["duration_ms"],
                "url": item["track"]["external_urls"].get("spotify", ""),
            }
            for item in items
            if item.get("track")
        ],
    }

    output_file = "spotify_playlist_output.json"
    with open(output_file, "w", encoding="utf-8") as f:
        json.dump(output, f, indent=2, ensure_ascii=False)
    print(f"\nSaved {len(output['tracks'])} tracks to {output_file}")


if __name__ == "__main__":
    main()
