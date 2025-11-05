import { getAssetFromKV } from '@cloudflare/kv-asset-handler'

export default {
  async fetch(request, env, ctx) {
    try {
      // Serve static assets from the dist folder
      return await getAssetFromKV(
        {
          request,
          waitUntil: ctx.waitUntil.bind(ctx),
        },
        {
          ASSET_NAMESPACE: env.__STATIC_CONTENT,
          ASSET_MANIFEST: __STATIC_CONTENT_MANIFEST,
        }
      )
    } catch (e) {
      // If asset not found, serve index.html for client-side routing
      try {
        const notFoundResponse = await getAssetFromKV(
          {
            request: new Request(`${new URL(request.url).origin}/index.html`, request),
            waitUntil: ctx.waitUntil.bind(ctx),
          },
          {
            ASSET_NAMESPACE: env.__STATIC_CONTENT,
            ASSET_MANIFEST: __STATIC_CONTENT_MANIFEST,
          }
        )
        return new Response(notFoundResponse.body, {
          ...notFoundResponse,
          status: 200,
        })
      } catch (e) {
        return new Response('Not Found', { status: 404 })
      }
    }
  },
}
