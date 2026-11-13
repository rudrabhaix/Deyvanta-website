DEYVANTA TECHNOLOGIES — WEBSITE UPDATE
=======================================

NEW PAGES
- /videos         Latest 5 public YouTube uploads
- /privacy-policy Privacy policy page

YOUTUBE API SETUP (REQUIRED FOR THE VIDEOS PAGE)
1. Open https://console.cloud.google.com/
2. Create/select a Google Cloud project.
3. Open APIs & Services > Library.
4. Search for "YouTube Data API v3" and click Enable.
5. Open APIs & Services > Credentials > Create Credentials > API key.
6. Copy the API key. Do not paste it into any HTML or JavaScript file.
7. In Cloudflare Dashboard, open Workers & Pages > your DEYVANTA Pages project.
8. Open Settings > Variables and Secrets (or Functions > Environment variables, depending on dashboard layout).
9. Add a secret named YOUTUBE_API_KEY and paste the API key as its value.
10. Optional: add a variable YOUTUBE_CHANNEL_HANDLE with value deyvanta_official.
    The code already uses this handle by default, so this is not normally needed.
11. Save and redeploy the latest website ZIP.

IMPORTANT SECURITY:
- Keep YOUTUBE_API_KEY as a Cloudflare secret. Never add it to public HTML/JS.
- If you restrict the key in Google Cloud, restrict it to YouTube Data API v3.
- Do not set an HTTP referrer restriction for this server-side Pages Function key.
- YouTube API quota applies. This function caches the latest five uploads for 5 minutes.

HOW THE VIDEOS PAGE WORKS
- The /videos page calls /api/videos.
- Cloudflare Pages Function calls YouTube Data API v3 on the server.
- It resolves the channel handle and retrieves the channel's uploads playlist.
- It returns up to five newest public uploads.
- Results are cached for 5 minutes. A new upload will normally appear after the cache expires and the page is refreshed.
- This first version connects YouTube only. Instagram will be added later.

CLOUDFLARE DEPLOYMENT
1. Extract this ZIP.
2. IMPORTANT: this website now contains a Cloudflare Pages Function. Dashboard drag-and-drop ZIP upload does NOT deploy the functions/ folder.
3. Deploy the extracted project folder with Wrangler CLI (or connect the project to Git). For Wrangler, run from the project folder: npx wrangler pages deploy . --project-name YOUR_PAGES_PROJECT_NAME
4. Add YOUTUBE_API_KEY as a secret in the Pages project settings (Settings > Variables and Secrets) for Production. Add it to Preview too if you test preview deployments.
5. Open /videos and confirm the latest uploads appear.

PAGES INCLUDED
- Home, About, Digital Products, Videos, Other, Contact, Privacy Policy.

PRIVACY POLICY NOTE
The policy page is a general notice based on the current website features. If you later add analytics, forms, payments, accounts, advertising or other tracking, update the policy accordingly.


DEPLOYMENT NOTE
Cloudflare's current documentation states that dashboard drag-and-drop Direct Upload does not compile Pages Functions. Use Wrangler CLI or Git integration to deploy the server-side API route. See https://developers.cloudflare.com/pages/functions/get-started/ and https://developers.cloudflare.com/pages/get-started/direct-upload/.
