// Agent
// User
// Meta
require('dotenv').config()
const { fetchEntity } = require('./fetch')
const { runMiddleware } = require('../internal')

function get(attribute, query) {
  return async (req, res, next) => {
    try {
      const values = await Promise.all(req.input[attribute].map(a => fetchEntity(query(a))))
      req[attribute] = values
      req.steps.push(`${attribute} fetched: ✅`)
    } catch (e) {
      req.steps.push(`${attribute} fetch: ❌ (${e})`)
    }

    next()
  }
}

const getAgents = get('agents', entity => `systemusers?$filter=domainname eq '${entity.email}'`)
const getUsers = get('users', entity => `contacts?$filter=emailaddress1 eq '${entity.email}'`)

async function processRequest(req, res, next) {
  await runMiddleware(req, res, getAgents)
  await runMiddleware(req, res, getUsers)

  req.response = {
    agents: req.agents.map(a => a.systemuserid),
    users: req.users.map(u => u.contactid)
  }

  next()
}

module.exports = {
  processRequest
}
