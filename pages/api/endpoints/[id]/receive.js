const { q, client } = require('../../../../lib/db')
//const runMiddleware = require('../../../lib/runMiddleware')
// Helper method to wait for a middleware to execute before continuing
// And to throw an error when an error happens in a middleware
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

async function getEndpoint(req, res, next) {
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

module.exports = async (req, res) => {
  await runMiddleware(req, res, getEndpoint)

  try {
    const dbs = await client.query(
      q.Create(
        q.Collection("payloads"),
        {
          data: {
            body: req.body,
            endpoint: req.endpoint.ref.id
          }
        }
      )
    )
    res.status(200).json(dbs.data)
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
}
