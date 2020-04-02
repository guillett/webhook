const { q, client } = require('../../lib/db')

module.exports = async (req, res) => {
  try {
    const dbs = await client.query(
      q.Map(
        q.Paginate(
          q.Match( // Public payloads only
            q.Index('payloads_by_secret_status'),
            false
          )
        ),
        ref => q.Get(ref)
      )
    )

    res.status(200).json(dbs.data)
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
}
