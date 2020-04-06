require('dotenv').config()
const moment = require('moment')
const { book } = require('./post')
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

function ensureSingle(req, type) {
  const attribute = `${type}s`
  const ok = req[attribute].length == 1
  req.steps.push(`single ${type}: ${ok ? '✅' : `❌ (count: ${attribute.length}`}`)
  if (!ok) {
    throw req.steps[req.steps.length-1]
  }
}

const getAgents = get('agents', entity => `systemusers?$filter=domainname eq '${entity.email}'`)
const getUsers = get('users', entity => `contacts?$filter=emailaddress1 eq '${entity.email}'`)

const mapping = {
  cap_motif: {
    query: name => `cap_listemotifses?$filter=cap_name eq '${name}'`,
    id: 'cap_listemotifsid',
  },
  cap_sousmotif: {
    query: name => `cap_listemotifses?$filter=cap_name eq '${name}'`,
    id: 'cap_listemotifsid', 
  },
  mas_service: {
    query: name => `services?$filter=name eq '${name}'`,
    id: 'serviceid',
  },
  cap_centreid: {
    query: name => `cap_sites?$filter=cap_name eq '${name}'`,
    id: 'cap_siteid',
  },
  equipment: {
    query: name => `equipments?$filter=name eq '${name}'`,
    id: 'equipmentid',
  },
  ownerid: {
    query: name => `teams?$filter=name eq '${name}'`,
    id: 'ownerid',
  }
}

async function getSingle(req, type, value) {
  try {
    const escapedValue = value.replace("'", "''")
    const result = await fetchEntity(mapping[type].query(escapedValue))

    const id = result[mapping[type].id]

    if (!id) {
      throw `Missing id field for ${type}`
    }

    req.steps.push(`${type} fetched: ✅`)
    return id
  } catch (e) {
    req.steps.push(`${type} fetch: ❌ (${e})`)
    throw e
  }
}

async function processRequest(req, res, next) {
  try {
    await runMiddleware(req, res, getAgents)
    ensureSingle(req, 'agent')

    await runMiddleware(req, res, getUsers)
    ensureSingle(req, 'user')

    const rdv = req.input
    let start = moment(rdv.starts_at)
    const user = req.users[0].contactid
    const agent = req.agents[0].systemuserid

    // Motif
    const cap_motif = await getSingle(req, 'cap_motif', '2. Protection de l\'enfance')
    const cap_sousmotif = await getSingle(req, 'cap_sousmotif', 'a. Information préoccupante')
    const mas_service = await getSingle(req, 'mas_service', 'Consultation médecin enfant')

    // Lieu
    const cap_centreid = await getSingle(req, 'cap_centreid', 'Bagneux PMI Naudin')

    // Métier
    const equipment = await getSingle(req, 'equipment', 'Consultation médecin enfant Beauvois Bagneux Naudin [I/E]')
    const ownerid = await getSingle(req, 'ownerid', '[E] Bagneux PMI Naudin')

    const appointment = {
      scheduledstart: start.format(),
      scheduledend: start.add(rdv.duration_in_min, 'minutes').format(),
      cap_demandeur: user,
      cap_beneficiaire: user,
      cap_professionnel: agent,
      // Motif
      cap_motif,
      cap_sousmotif,
      mas_service,
      // Lieu
      cap_centreid,
      // Métier
      equipment,
      ownerid,
    }
    const response = await book(appointment)

    req.response = response
  } catch (e) {
    req.response = {
      error: e,
    }
  }

  next()
}

module.exports = {
  processRequest
}
