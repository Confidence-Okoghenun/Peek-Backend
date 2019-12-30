import { jwt_key } from './keys'

export const config = {
  secrets: {
    jwt: jwt_key
  },
  dbUrl:
    'mongodb+srv://cloud:cloud@cloud-r4vra.mongodb.net/test?retryWrites=true&w=majority'
}
