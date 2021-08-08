import { Box, Stack, Text } from "@chakra-ui/react"
import { useState } from "react"
import { sleep } from "src/client/lib"
import ProtectedView from "../protected-view"

const AuthLayout = ({
  title,
  description,
  children,
}) => {
  const [ready, setReady] = useState(false)

  const animatePage = async () => {
    await sleep(200)
    setReady(true)
  }

  return (
    <ProtectedView
      authorize={({ user }) => !user}
      onAuthorized={animatePage}
      onUnauthorized={({ router }) => router.push("/")}
    >
      <Box
        w="full"
        bgColor="purple.600"
        backgroundImage="url('/Sprinkle.svg')"
        h="100vh"
        overflow="auto"
      >
        <Stack
          minH="100vh"
          alignItems="center"
          justifyContent="center"
          transition="opacity .25s ease"
          opacity={ready ? 1 : 0}
        >
          <Box h="10" />
          <Box
            w={{ base: "full", sm: "sm" }}
            rounded="lg"
            bg="white"
            px={{ base: "7", sm: "12" }}
            py={{ base: "7", sm: "10" }}
            mx={{ base: "0", sm: "5" }}
          >
            <Text fontSize="2xl" fontWeight="extrabold" textAlign="center">
              {title}
            </Text>
            <Text color="gray.600" fontSize="lg" fontWeight="semibold" textAlign="center">
              {description}
            </Text>
            {children}
          </Box>
          <Box h="10" />
        </Stack>
      </Box>
    </ProtectedView>
  )
}

export default AuthLayout
