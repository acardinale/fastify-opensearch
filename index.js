'use strict'

const fp = require('fastify-plugin')
const { Client } = require('@opensearch-project/opensearch')

async function fastifyOpensearch (fastify, options) {
  const { namespace, healthcheck } = options
  delete options.namespace
  delete options.healthcheck

  const client = options.client || new Client(options)

  if (healthcheck !== false) {
    await client.ping()
  }

  if (namespace) {
    if (!fastify.opensearch) {
      fastify.decorate('opensearch', {})
    }

    if (fastify.opensearch[namespace]) {
      throw new Error(`Opensearch namespace already used: ${namespace}`)
    }

    fastify.opensearch[namespace] = client

    fastify.addHook('onClose', (instance, done) => {
      instance.opensearch[namespace].close(done)
    })
  } else {
    fastify
      .decorate('opensearch', client)
      .addHook('onClose', (instance, done) => {
        instance.opensearch.close(done)
      })
  }
}

module.exports = fp(fastifyOpensearch, {
  fastify: '3.x || 4.x',
  name: 'fastify-opensearch'
})
