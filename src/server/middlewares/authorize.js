import { verifyJWT } from "src/server/lib"

/**
 * 
 * @param {() => void} next callback
 * @param {() => boolean} [checkPermission] 
 * @returns 
 */
const authorize = (next, checkPermission) => (req, res) => {
  const authHeader = req.headers["authorization"]
  if (!authHeader) {
    return res.status(403).json({ error: "You have to be authenticated to access this." })
  }

  const accessToken = authHeader.replace("Bearer ", "")

  const payloadData = verifyJWT(accessToken, "auth")
  if (!payloadData) {
    return res.status(403).json({ error: "You are not permitted to access this." })
  }

  if (checkPermission && typeof checkPermission === "function") {
    const isPermitted = checkPermission(payloadData)
    if (!isPermitted) {
      return res.status(401).json({ error: "Your account is not allowed to access this." })
    }
  }

  req.auth = payloadData
  return next(req, res)
}

export default authorize
