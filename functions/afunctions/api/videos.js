export async function onRequestGet({ request, env }) {
  const key = env.YOUTUBE_API_KEY;
  const handle = env.YOUTUBE_CHANNEL_HANDLE || "deyvanta_official";
  const channelId = env.YOUTUBE_CHANNEL_ID;

  if (!key) {
    return json({ error: "YouTube API key is not configured. Add YOUTUBE_API_KEY in Cloudflare Pages settings." }, 503);
  }

  const cache = caches.default;
  const cacheKey = new Request(new URL("/api/videos", request.url).toString(), request);
  const cached = await cache.match(cacheKey);
  if (cached) return cached;

  try {
    let resolvedChannelId = channelId;
    let uploadsPlaylistId;

    if (!resolvedChannelId) {
      const channelUrl = new URL("https://www.googleapis.com/youtube/v3/channels");
      channelUrl.search = new URLSearchParams({
        part: "contentDetails",
        forHandle: handle,
        key
      }).toString();

      const channelRes = await fetch(channelUrl.toString());
      const channelData = await channelRes.json();

      if (!channelRes.ok) {
        return json({ error: "YouTube channel verification failed. Check API key and handle." }, 502);
      }

      const channel = channelData.items?.[0];
      if (!channel) return json({ error: "YouTube channel not found." }, 404);

      resolvedChannelId = channel.id;
      uploadsPlaylistId = channel.contentDetails?.relatedPlaylists?.uploads;
    } else {
      const channelUrl = new URL("https://www.googleapis.com/youtube/v3/channels");
      channelUrl.search = new URLSearchParams({
        part: "contentDetails",
        id: resolvedChannelId,
        key
      }).toString();

      const channelRes = await fetch(channelUrl.toString());
      const channelData = await channelRes.json();

      if (!channelRes.ok) {
        return json({ error: "YouTube channel lookup failed." }, 502);
      }

      uploadsPlaylistId = channelData.items?.[0]?.contentDetails?.relatedPlaylists?.uploads;
    }

    if (!uploadsPlaylistId) {
      return json({ error: "Uploads playlist not found." }, 404);
    }

    const playlistUrl = new URL("https://www.googleapis.com/youtube/v3/playlistItems");
    playlistUrl.search = new URLSearchParams({
      part: "snippet,contentDetails",
      playlistId: uploadsPlaylistId,
      maxResults: "5",
      key
    }).toString();

    const videosRes = await fetch(playlistUrl.toString());
    const videosData = await videosRes.json();

    if (!videosRes.ok) {
      return json({ error: "YouTube video request failed." }, 502);
    }

    const videos = (videosData.items || []).map(item => {
      const snippet = item.snippet || {};
      const id = item.contentDetails?.videoId || snippet.resourceId?.videoId;
      const thumbs = snippet.thumbnails || {};

      const thumbnail =
        thumbs.maxres?.url ||
        thumbs.standard?.url ||
        thumbs.high?.url ||
        thumbs.medium?.url ||
        thumbs.default?.url;

      return id ? {
        id,
        title: snippet.title || "Untitled video",
        thumbnail: thumbnail || `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
        publishedAt: item.contentDetails?.videoPublishedAt || snippet.publishedAt || "",
        url: `https://www.youtube.com/watch?v=${id}`
      } : null;
    }).filter(Boolean);

    const response = json({
      videos,
      updatedAt: new Date().toISOString()
    }, 200, {
      "Cache-Control": "public, max-age=300"
    });

    await cache.put(cacheKey, response.clone());
    return response;

  } catch (error) {
    return json({
      error: "Unable to connect to YouTube right now."
    }, 500);
  }
}

function json(data, status = 200, extraHeaders = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
      ...extraHeaders
    }
  });
}
