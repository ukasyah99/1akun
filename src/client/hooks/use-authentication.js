import { useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import { apiClient, sleep } from "src/client/lib"
import { setAuth } from "src/client/redux"

const useAuthentication = () => {
  const dispatch = useDispatch()
  const { initiated, user } = useSelector(s => s.auth)

  useEffect(() => {
    if (!initiated) {
      const checkCurrentUser = async () => {
        await sleep(500)
        
        let user
        try {
          const _result = await apiClient.get("/auth/me")
          user = _result.data
        } catch (error) {
          dispatch(setAuth({ initiated: true, user: null }))
          return
        }

        dispatch(setAuth({ initiated: true, user, loginSince: Date.now() }))
      }

      checkCurrentUser()
    }
  }, [initiated])
  
  return { initiated, user }
}

export default useAuthentication
