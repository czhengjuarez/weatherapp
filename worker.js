import { getAssetFromKV } from '@cloudflare/kv-asset-handler'
import manifestJSON from '__STATIC_CONTENT_MANIFEST'

const assetManifest = JSON.parse(manifestJSON)

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url)
    
    try {
      // Serve static assets from the dist folder
      const options = {
        ASSET_NAMESPACE: env.__STATIC_CONTENT,
        ASSET_MANIFEST: assetManifest,
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
          ASSET_MANIFEST: assetManifest,
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
        return new Response(`Error: ${e.message}\nStack: ${e.stack}`, { 
          status: 500,
          headers: { 'Content-Type': 'text/plain' }
        })
      }
    }
  },
}
