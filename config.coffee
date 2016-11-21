utils = require './utils'

config =
  site: title: 'arusha-coders-api'
  brand: 'Arusha Coders Authentication API'
  timeout: utils.durations.seconds * 5
  verbose: process.env.DEBUG or false

  jwt:
    secret: process.env.TOKEN_SECRET || "secret",
    issuer: process.env.TOKEN_ISSUER || "accounts.nerevu.com",
    audience: process.env.TOKEN_AUDIENCE || "nerevu.com",
    duration: utils.durations.months * 3

  mongo:
    server: process.env.MONGO_ENDPOINT  or 'localhost'
    db: process.env.MONGO_DATABASE or 'api_auth'
    user: process.env.MONGO_USER
    pwd: process.env.MONGO_PWD

    # alternative to setting server, database, user and password separately
    connectionString: process.env.MONGOLAB_URI

  defaultRole: 'user'

module.exports = config
