import { Box, Stack, Text } from "@chakra-ui/react"
import { useEffect, useState } from "react"
import { sleep } from "src/client/lib"

const InfoLayout = ({
  title,
  description,
}) => {
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const onMounted = async () => {
      await sleep(500)
      setReady(true)
    }
    onMounted()
  }, [])

  return (
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
        px="5"
      >
        <Box h="10" />
        <Box
          w={{ base: "full", sm: "sm" }}
          rounded="lg"
          bg="white"
          px={{ base: "7", sm: "12" }}
          py={{ base: "7", sm: "10" }}
        >
          <Text fontSize="2xl" fontWeight="extrabold" textAlign="center">
            {title}
          </Text>
          <Text color="gray.600" fontSize="lg" fontWeight="semibold" textAlign="center">
            {description}
          </Text>
          <Box h="2" />
        </Box>
        <Box h="10" />
      </Stack>
    </Box>
  )
}

export default InfoLayout
