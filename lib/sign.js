const crypto = require('crypto')

async function checkSignaturePresence(req, res, next) {
  req.steps.push(req.headers['x-lapin-signature'] ? 'signed: ✅' : 'unsigned: ❗')
  next()
}

async function checkSignatureValidity(req, res, next) {
  if (!req.endpoint.data.secret) {
    return next()
  }

  const hmac = crypto.createHmac('sha256', req.endpoint.data.secret)
  hmac.update(req.body)
  const signature_computed = hmac.digest()

  const signature_received = Buffer.from(req.headers['x-lapin-signature'], 'hex')

  const signature_ok = crypto.timingSafeEqual(signature_received, signature_computed)
  req.steps.push(`signature valid: ${signature_ok ? '✅' : '❌'}`)
  if (signature_ok) {
    next()
  } else {
    next({error: 'Signature'})
  }
}

module.exports = {
  checkSignaturePresence,
  checkSignatureValidity
}
