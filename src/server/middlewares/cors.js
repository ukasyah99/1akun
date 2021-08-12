import Cors from "cors"
import util from "util"

const promisedCors = util.promisify(Cors({}))

const cors = (next) => async (req, res) => {
  try {
    await promisedCors(req, res)
  } catch (error) {
    return res.status(500).json({ error: error.message })
  }

  return next(req, res)
}

export default cors
