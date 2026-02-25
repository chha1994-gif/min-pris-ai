const { kv } = require('@vercel/kv')

module.exports = async (req, res) => {
  try {
    await kv.set('test_key', 'KV fungerer!', { ex: 60 })

    const value = await kv.get('test_key')

    res.status(200).json({
      success: true,
      value
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
}
