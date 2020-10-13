const crypto = require('crypto')

function compute(secret, data) {
  const hmac = crypto.createHmac('sha256', secret)
  hmac.update(data)
  return hmac.digest()
}

async function checkSignaturePresence(req, res, next) {
  req.steps.push(req.headers['x-lapin-signature'] ? 'signed: ✅' : 'unsigned: ❗')
  next()
}

async function checkSignatureValidity(req, res, next) {
  if (!req.endpoint.data.secret) {
    return next()
  }

  const signature_computed = compute(req.endpoint.data.secret, req.body)
  const signature_received = Buffer.from(req.headers['x-lapin-signature'], 'hex')

  const signature_ok = crypto.timingSafeEqual(signature_received, signature_computed)
  req.steps.push(`signature valid: ${signature_ok ? '✅' : '❌'}`)
  if (signature_ok) {
    next()
  } else {
    next(new Error('Signature'))
  }
}

module.exports = {
  compute,
  checkSignaturePresence,
  checkSignatureValidity
}
