import { Box, Button, HStack, Icon, IconButton, Text } from "@chakra-ui/react"
import { LogoutIcon, MenuIcon } from "@heroicons/react/outline"
import { removeAccessToken, removeRefreshToken } from "src/client/lib"

const Header = ({ title, onMenuClick }) => {
  const handleLogout = () => {
    removeAccessToken()
    removeRefreshToken()
    window.location.reload()
  }

  return (
    <HStack
      w="full"
      px="6"
      py="5"
    >
      <IconButton
        icon={<Icon as={MenuIcon} w="5" h="5" />}
        display={{ base: "flex", lg: "none" }}
        variant="ghost"
        onClick={onMenuClick}
      />
      <Text
        fontSize="2xl"
        fontWeight="extrabold"
        isTruncated
      >
        {title}
      </Text>
      <Box flex="1" />
      <Box display={{ base: "block", sm: "none" }}>
        <IconButton
          icon={<Icon as={LogoutIcon} w="5" h="5" />}
          onClick={handleLogout}
        />
      </Box>
      <Box display={{ base: "none", sm: "block" }}>
        <Button
          leftIcon={<Icon as={LogoutIcon} w="5" h="5" />}
          onClick={handleLogout}
        >
          Logout
        </Button>
      </Box>
    </HStack>
  )
}

export default Header
