import { CircularProgress, Stack, Text, useToast } from "@chakra-ui/react"
import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import { AuthLayout } from "src/client/components"
import { apiClient, setAccessToken, setRefreshToken, sleep } from "src/client/lib"

const VerifyEmail = () => {
  const router = useRouter()
  const toast = useToast({ position: "top", variant: "top-accent", duration: 2500 })
  const [isVerifying, setIsVerifying] = useState(true)

  useEffect(() => {
    const verify = async () => {
      await sleep(1000)

      const data = { token: router.query.token }
      let result
      try {
        result = await apiClient.post("/auth/verify-email", data)
      } catch (error) {
        setIsVerifying(false)
        return toast({
          title: "Failed to verify email",
          description: "This operation is not permitted due to invalid token.",
          status: "error",
        })
      }

      setAccessToken(result.data.acces_token)
      setRefreshToken(result.data.refresh_token)
      window.location.reload()
    }
    verify()
  }, [])

  return (
    <Stack alignItems="center" justifyContent="center" h="24" mt="5">
      {isVerifying && <CircularProgress isIndeterminate size="10" />}
      {!isVerifying && <Text textAlign="center">Verification process stopped due to an error.</Text>}
    </Stack>
  )
}

const getLayout = (page) => (
  <AuthLayout
    title="Activate Your Account"
    description="Please wait until the process is finised"
  >
    {page}
  </AuthLayout>
)

VerifyEmail.getLayout = getLayout

export default VerifyEmail
