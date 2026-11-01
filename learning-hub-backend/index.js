const app = require('../src/app')
const connectDatabase = require('../src/config/database')

let databaseConnection

module.exports = async function handler(req, res) {
  try {
    if (!databaseConnection) {
      databaseConnection = connectDatabase().catch(error => {
        databaseConnection = null
        throw error
      })
    }

    await databaseConnection
    return app(req, res)
  } catch (error) {
    console.error('Vercel API startup error:', error)

    return res.status(503).json({
      success: false,
      message: 'The API is temporarily unavailable. Please try again.'
    })
  }
}