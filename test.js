'use strict'

const { test } = require('tap')
const { Client } = require('@opensearch-project/opensearch')
const Fastify = require('fastify')
const fastifyOpensearch = require('./index')

test('with reachable cluster', async t => {
  const fastify = Fastify()
  fastify.register(fastifyOpensearch, { node: 'http://localhost:9200' })

  await fastify.ready()
  t.strictEqual(fastify.opensearch.name, 'opensearch-js')
  await fastify.close()
})

test('with unreachable cluster', async t => {
  const fastify = Fastify()
  fastify.register(fastifyOpensearch, { node: 'http://localhost:9201' })

  try {
    await fastify.ready()
    t.fail('should not boot successfully')
  } catch (err) {
    t.ok(err)
    await fastify.close()
  }
})

test('with unreachable cluster and healthcheck disabled', async t => {
  const fastify = Fastify()
  fastify.register(fastifyOpensearch, {
    node: 'http://localhost:9201',
    healthcheck: false
  })

  try {
    await fastify.ready()
    t.strictEqual(fastify.opensearch.name, 'opensearch-js')
  } catch (err) {
    t.fail('should not error')
  }
  await fastify.close()
})

test('namespaced', async t => {
  const fastify = Fastify()
  fastify.register(fastifyOpensearch, {
    node: 'http://localhost:9200',
    namespace: 'cluster'
  })

  await fastify.ready()
  t.strictEqual(fastify.opensearch.cluster.name, 'opensearch-js')
  await fastify.close()
})

test('namespaced (errored)', async t => {
  const fastify = Fastify()
  fastify.register(fastifyOpensearch, {
    node: 'http://localhost:9200',
    namespace: 'cluster'
  })

  fastify.register(fastifyOpensearch, {
    node: 'http://localhost:9200',
    namespace: 'cluster'
  })

  try {
    await fastify.ready()
    t.fail('should not boot successfully')
  } catch (err) {
    t.ok(err)
    await fastify.close()
  }
})

test('custom client', async t => {
  const client = new Client({
    node: 'http://localhost:9200',
    name: 'custom'
  })

  const fastify = Fastify()
  fastify.register(fastifyOpensearch, { client })

  await fastify.ready()
  t.strictEqual(fastify.opensearch.name, 'custom')
  await fastify.close()
})

test('Missing configuration', async t => {
  const fastify = Fastify()
  fastify.register(fastifyOpensearch)

  try {
    await fastify.ready()
    t.fail('should not boot successfully')
  } catch (err) {
    t.ok(err)
    await fastify.close()
  }
})
