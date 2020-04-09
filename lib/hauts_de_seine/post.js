require('dotenv').config()
const rp = require('request-promise')
const path = require('path')
const fs = require('fs')
const Handlebars = require('handlebars')
const parseString = require('xml2js').parseString

function book(appointment) {
  console.log('appointment', appointment)

  const templatePath = 'lib/hauts_de_seine/templates/bookRequest.xml.hbs'
  const bookRequestTemplate = Handlebars.compile(fs.readFileSync(templatePath, 'utf-8'))

  const body = bookRequestTemplate(appointment)
  const options = {
    uri: 'https://grc-dev.crm12.dynamics.com/XRMServices/2011/Organization.svc/web',
    headers: {
      'ClientAppVersion': '9.0',
      'ClientAppName': 'WebClient',
      'SOAPAction': 'http://schemas.microsoft.com/xrm/2011/Contracts/Services/IOrganizationService/Execute',
      'Accept': 'application/xml, text/xml, */*; q=0.01',
      'Content-Type': 'text/xml; charset=utf-8',
      'Cookie': process.env.HAUTS_DE_SEINE_COOKIE,
    },
    body: body
  }

  return rp(options).then(response => {
    return new Promise((resolve, reject) => {
      return parseString(response, function (err, result) {
        if (err) {
          return reject(err)
        }
        return resolve(result)  
      })
    })
  }).then(payload => {
// var p = require('./payload.json')

// const section = p["s:Envelope"]["s:Body"][0]["ExecuteResponse"][0]["ExecuteResult"][0]["a:Results"][0]["a:KeyValuePairOfstringanyType"]
// const props = section.reduce((obj, item) => {
//   obj[item['c:key']] = item['c:value']
//   return obj
// }, {})
// console.log(props.Notifications['b:BusinessNotification'])
// console.log(props.Notifications)//['b:BusinessNotification'][0])

    return payload
  })
}


module.exports = {
  book
}
