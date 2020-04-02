const { q, client } = require('../../../../lib/db')
const { addBody, addEndpoint, addSteps, runMiddleware } = require('../../../../lib/internal')
const { checkSignaturePresence, checkSignatureValidity } = require('../../../../lib/sign')

const { processRequest } = require('../../../../lib/hauts_de_seine')

export const config = {
  api: {
    bodyParser: false
  },
}

async function savePayload(req, res, next) {
  const dbs = await client.query(
    q.Create(
      q.Collection("payloads"),
      {
        data: {
          body: req.input,
          endpoint: req.endpoint.ref.id,
          secret: Boolean(req.endpoint.data.secret)
        }
      }
    )
  )

  req.payload = dbs.data
  next()
}

export default async (req, res) => {
  try {
    await runMiddleware(req, res, addEndpoint)
    await runMiddleware(req, res, addBody)
    await runMiddleware(req, res, addSteps)
    req.input = JSON.parse(req.body)
    await runMiddleware(req, res, savePayload)
    await runMiddleware(req, res, checkSignaturePresence)
    await runMiddleware(req, res, checkSignatureValidity)

    //
    //await runMiddleware(req, res, processRequest)
    //

    res.status(200).json({
      payload: req.payload,
      steps: req.steps,
      response: req.response
    })
  } catch (e) {
   vres.status(500).json({ error: e.message })
  }
}
