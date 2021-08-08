import { CircularProgress, Stack } from "@chakra-ui/react"
import { useRouter } from "next/router"
import { useEffect } from "react"
import { useAuthentication } from "src/client/hooks"

const ProtectedView = ({
  authorize = () => {},
  onAuthorized = () => {},
  onUnauthorized = () => {},
  children,
}) => {
  const { initiated, user } = useAuthentication()
  const router = useRouter()

  const isAuthorized = authorize({ user })

  useEffect(() => {
    if (!initiated) return

    if (!isAuthorized) {
      onUnauthorized({ router })
    } else {
      onAuthorized({ user })
    }
  }, [initiated, isAuthorized, user])

  if (!initiated) {
    return (
      <Stack h="100vh" alignItems="center" justifyContent="center">
        <CircularProgress isIndeterminate />
      </Stack>
    )
  }

  if (!isAuthorized) {
    return null
  }

  return <>{children}</>
}

export default ProtectedView
