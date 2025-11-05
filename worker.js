import { getAssetFromKV, mapRequestToAsset } from '@cloudflare/kv-asset-handler'

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url)
    
    try {
      // Serve static assets from the dist folder
      const options = {
        ASSET_NAMESPACE: env.__STATIC_CONTENT,
        ASSET_MANIFEST: __STATIC_CONTENT_MANIFEST,
        mapRequestToAsset: (req) => {
          // Map requests to the correct asset path
          const url = new URL(req.url)
          // Remove leading slash if present to match asset keys
          url.pathname = url.pathname.replace(/^\/+/, '/')
          return new Request(url.toString(), req)
        },
      }

      return await getAssetFromKV(
        {
          request,
          waitUntil: ctx.waitUntil.bind(ctx),
        },
        options
      )
    } catch (e) {
      // If asset not found, serve index.html for SPA routing
      try {
        const options = {
          ASSET_NAMESPACE: env.__STATIC_CONTENT,
          ASSET_MANIFEST: __STATIC_CONTENT_MANIFEST,
        }

        const notFoundResponse = await getAssetFromKV(
          {
            request: new Request(`${url.origin}/index.html`, request),
            waitUntil: ctx.waitUntil.bind(ctx),
          },
          options
        )
        
        return new Response(notFoundResponse.body, {
          status: 200,
          headers: notFoundResponse.headers,
        })
      } catch (e) {
        return new Response(`Error: ${e.message}`, { status: 500 })
      }
    }
  },
}
