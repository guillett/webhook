const { q, client } = require('./db')
const getRawBody = require('raw-body')

function runMiddleware(req, res, fn) {
  return new Promise((resolve, reject) => {
    fn(req, res, result => {
      if (result instanceof Error) {
        return reject(result)
      }

      return resolve(result)
    })
  })
}

async function addEndpoint(req, res, next) {
  const {
    query: { id },
  } = req

  try {
    const endpoint = await client.query(
      q.Get(
        q.Ref(
          q.Collection("endpoints"),
          id
        )
      )
    )
    req.endpoint = endpoint
    next()
  } catch (e) {
    return res.status(500).json({ error: e.message })
  }
}

async function addBody(req, res, next) {
  try {
    const body = await getRawBody(req, { encoding: 'utf-8'})
    req.body = body
    next()
  } catch (e) {
    return res.status(500).json({ error: e.message })
  }
}

async function addSteps(req, res, next) {
  req.steps = []
  next()
}

module.exports = {
  addBody,
  addEndpoint,
  addSteps,
  runMiddleware
}
