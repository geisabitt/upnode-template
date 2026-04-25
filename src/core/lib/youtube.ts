const YOUTUBE_ID_PATTERN = /(?:youtu\.be\/|youtube(?:-nocookie)?\.com\/(?:watch\?v=|embed\/|v\/|shorts\/))([A-Za-z0-9_-]{11})/i

export function extractYouTubeVideoId(value: string) {
  if (!value) {
    return null
  }

  try {
    const normalized = value.trim()
    const url = new URL(normalized)

    if (url.hostname.includes('youtube.com') || url.hostname.includes('youtu.be')) {
      const idFromUrl = url.searchParams.get('v')
      if (idFromUrl && idFromUrl.length === 11) {
        return idFromUrl
      }
    }
  } catch {
    // ignore invalid URL and try regex fallback
  }

  const match = value.match(YOUTUBE_ID_PATTERN)
  return match ? match[1] : null
}

export function normalizeYouTubeUrl(value: string) {
  const videoId = extractYouTubeVideoId(value)
  return videoId ? `https://www.youtube.com/watch?v=${videoId}` : null
}
