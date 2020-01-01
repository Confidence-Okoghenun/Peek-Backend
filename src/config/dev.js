if (process.env.NODE_ENV !== 'production') {
  require('dotenv').load()
}

export const config = {
  secrets: {
    jwt: process.env.jwt_key
  },
  dbUrl: 'mongodb://localhost:27017/peek'
}
