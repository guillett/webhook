const crypto = require('crypto')

const prefixIndex = process.argv.indexOf('--content')
if (prefixIndex == -1 || process.argv.length <= prefixIndex + 1) {
  console.log('--content [content] are mandatory')
  process.exit(1)
}

const hmac = crypto.createHmac('sha256', process.env.SHARED_SECRET)
const content = process.argv[prefixIndex+1]

console.log(content)

hmac.update(content)
console.log(hmac.digest('hex'))
