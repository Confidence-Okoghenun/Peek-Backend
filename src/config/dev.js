import { jwt_key } from './keys'
export const config = {
  secrets: {
    jwt: jwt_key
  },
  dbUrl: 'mongodb://localhost:27017/peek'
}
