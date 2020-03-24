const { q, client } = require('../../../lib/db')

module.exports = async (req, res) => {
  try {
    const dbs = await client.query(
      q.Map(
        q.Paginate(
          q.Match(
            q.Index('all_endpoints')
          )
        ),
        ref => q.Get(ref)
      )
    )

    res.status(200).json(dbs.data.map(item => {
      return {
        id: item.ref.id,
        name: item.data.name
      }
    }))
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
}
