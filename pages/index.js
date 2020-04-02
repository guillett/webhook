import { useEffect, useState } from 'react'
import Head from 'next/head'
import '../styles.css'

export default () => {
  const [endpoints, setEndpoints] = useState([])
  const [payloads, setPayloads] = useState([])

  useEffect(() => {
    async function getEndpoints() {
      const res = await fetch('/api/endpoints')
      const newData = await res.json()
      setEndpoints(newData)
    }
    getEndpoints()

    async function getPayloads() {
      const res = await fetch('/api/payloads')
      const newData = await res.json()
      setPayloads(newData)
    }
    getPayloads()
  }, [])
  return (
    <main>
      <Head>
        <title>Exemple d'intégration du webhook de RDV-Solidarités</title>
      </Head>
      <h1>Exemple d'intégration du webhook de RDV-Solidarités</h1>
      <hr />
      <div>
        <div>
          <h2>Endpoints</h2>
          {endpoints.length > 0 ? (
            endpoints.map(endpoint => (
              <div>
                <h3>{endpoint.id} / {endpoint.name}</h3>
              </div>
            ))
          ) : (
            <div>
              Pas de données disponibles
            </div>
          )}
          <h2>Payloads</h2>
          {payloads.length > 0 ? (
            payloads.map(d => (
              <div>
                <h3>ID: {d.ref['@ref'].id}</h3>
                <pre>{JSON.stringify(d.data, null, 2)}</pre>
              </div>
            ))
          ) : (
            <div>
              Pas de données disponibles
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
