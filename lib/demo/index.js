var { SendSmtpEmail, sendEmail } = require('../email')

const linkFactory = {
  Rdv: function({domain}, {data}) {
    return `https://${domain}/organisations/${data.organisation.id}/rdvs/${data.id}`
  },
  PlageOuverture: function({domain}, {data}) {
    return `https://${domain}/organisations/${data.organisation.id}/agents/${data.agent.id}/plage_ouvertures`
  },
  Absence: function({domain}, {data}) {
    return `https://${domain}/organisations/${data.organisation.id}/agents/${data.agent.id}/absences`
  },
  process: function(model) {
    const base = linkFactory[model]
    if (base) {
      return base
    }
    return () => `No link generator for ${model}.`
  }
}

exports.processRequest = function(req, res, next) {
  var endpoint = req.endpoint.data
  var input = req.input

  if (!endpoint.domain) {
    req.steps.push("Cannot send: missing 'domain'.")
    return next()
  }

  if (!endpoint.email && !endpoint.emails) {
    req.steps.push("Cannot send: missing 'email' and 'emails'.")
    return next()
  }

  var email = new SendSmtpEmail()
  email.to = (endpoint.email ? [endpoint.email] : endpoint.emails).map(email => { return {email} })
  email.subject = `${input.meta.model} ${input.meta.event} (id: ${input.data.id})`
  email.textContent = `
  ${linkFactory.process(input.meta.model)(endpoint, input)}

  ${JSON.stringify(input, null, 2)}
  `
  sendEmail(email).then((msg) => {
    req.steps.push(`send: ✅ ${msg.messageId}`)
    next()
  }).catch(err => {
    req.steps.push(`error: ${err}`)
    next(err)
  })
}