# Project 8: L'Oréal Chatbot

L’Oréal is exploring the power of AI, and your job is to showcase what's possible. Your task is to build a chatbot that helps users discover and understand L’Oréal’s extensive range of products—makeup, skincare, haircare, and fragrances—as well as provide personalized routines and recommendations.

## 🚀 Launch via GitHub Codespaces

1. In the GitHub repo, click the **Code** button and select **Open with Codespaces → New codespace**.
2. Once your codespace is ready, open the `index.html` file via the live preview.

## ☁️ Cloudflare Note

When deploying through Cloudflare, make sure your API request body (in `script.js`) includes a `messages` array and handle the response by extracting `data.choices[0].message.content`.

## Cloudflare Worker Setup Checklist

Use this checklist to keep your OpenAI key out of frontend code.

1. Deploy `cloudflare-worker.js` to Cloudflare Workers.
2. In Cloudflare Worker settings, add a secret named `OPENAI_API_KEY`.
3. In `script.js`, replace `CLOUDFLARE_WORKER_URL` with your real Worker URL.
4. Confirm the frontend request body only sends a `messages` array.
5. Remove `secrets.js` from the project (done in this repo state).
6. Rotate your previously exposed OpenAI key in the OpenAI dashboard.

Enjoy building your L’Oréal beauty assistant! 💄
