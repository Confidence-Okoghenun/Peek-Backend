export const config = {
  secrets: {
    jwt: process.env.jwt_key
  },
  dbUrl:
    'mongodb+srv://cloud:cloud@cloud-r4vra.mongodb.net/test?retryWrites=true&w=majority'
}
