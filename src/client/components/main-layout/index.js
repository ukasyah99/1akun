import { Box, Flex, useDisclosure } from "@chakra-ui/react"
import ProtectedView from "../protected-view"
import Header from "./header"
import Navbar from "./navbar"

const MainLayout = ({
  title,
  children,
}) => {
  const mobileNavbar = useDisclosure()

  return (
    <ProtectedView
      authorize={({ user }) => user}
      onUnauthorized={({ router }) => router.push("/auth/login")}
    >
      <Flex h="100vh">
        <Navbar
          mobileNavbar={mobileNavbar}
        />
        <Box flex="1" overflowY="scroll">
          <Header
            title={title}
            onMenuClick={mobileNavbar.onOpen}
          />
          <Box h="3" />
          <Box px="6" pb="16">
            {children}
          </Box>
        </Box>
      </Flex>
    </ProtectedView>
  )
}

export default MainLayout
