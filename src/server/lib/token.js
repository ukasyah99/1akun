import jwt from "jsonwebtoken"
import { nanoid } from "nanoid"
import { getDatabaseConnection } from "src/server/database"
import { JWT_SECRET } from "src/config"

/**
 * Generate a random token.
 * 
 * @param {number} length default 32.
 * @returns {string} random token.
 */
export const generateRandomToken = (length = 32) => {
  return nanoid(length)
}

/**
 * Asyncronously generate a long-lived refresh token.
 * 
 * @param {number} uid user id.
 * @returns {Promise<string>} refresh token, if failed it will be an empty string.
 */
 export const generateRefreshToken = async (uid) => {
  const db = getDatabaseConnection()
  
  let refreshToken
  try {
    const refreshTokenRecord = await db("refresh_tokens").where("user_id", uid).first()
    if (refreshTokenRecord) {
      refreshToken = refreshTokenRecord.token
    } else {
      refreshToken = generateRandomToken()
      await db("refresh_tokens").insert({ token: refreshToken, user_id: uid })
    }
  } catch (error) {
    return ""
  }

  return refreshToken
}

/**
 * Syncronously generate a jwt.
 * 
 * @param {Object} data to be encrypted in this jwt.
 * @param {string} state what this jwt used for.
 * @param {number} exp in seconds, default is 15 * 60 (15 minutes).
 * @returns {string} jwt, if failed it will be an empty string.
 */
 export const generateJWT = (data, state, exp) => {
  const expiresIn = exp || 15 * 60

  let token
  try {
    token = jwt.sign({ data, state }, JWT_SECRET, { expiresIn })
  } catch (error) {
    return ""
  }

  return token
}

/**
 * Syncronously verify a jwt.
 * 
 * @param {string} token jwt.
 * @param {string} state what this jwt used for.
 * @param {number} exp in seconds, default is 15 * 60 (15 minutes).
 * @returns {Object | null} payload data, if failed it will be null.
 */
 export const verifyJWT = (token, state) => {
  try {
    const payload = jwt.verify(token, JWT_SECRET)
    if (payload.state !== state) return null
    return payload.data
  } catch (error) {
    return null
  }
}
