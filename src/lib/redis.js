import { createClient } from 'redis'

/*--------------------------------------------------------------*/

/*                     🔧 MAIN SETUP                            */

/*--------------------------------------------------------------*/

let redis

if (!global._redis) {
  redis = createClient({
    url: process.env.REDIS_URL,
  })

  redis.on('error', (err) => {
    console.error('Redis error:', err)
  })

  global._redis = redis
} else {
  redis = global._redis
}

async function ensureRedis() {
  if (!redis.isOpen) {
    await redis.connect()
  }
}

export { redis }



/*--------------------------------------------------------------*/

/*                     🔧 PRODUCTS                              */

/*--------------------------------------------------------------*/

export async function getProduct(storeId, productHandle ) {
  try {
    const key = `store:${storeId}:product:${productHandle}`
    console.log('key', key)
    await ensureRedis()

    const product = await redis.json.get(key)

    if (!product) {
      return {
        ok: false,
        error: 'PRODUCT_NOT_FOUND',
      }
    }

    return {
      ok: true,
      data: product,
    }
  } catch (err) {
    console.error('[getProduct]', err)
    return {
      ok: false,
      error: 'REDIS_ERROR',
    }
  }
}
