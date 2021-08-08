import { Box, Drawer, DrawerContent, DrawerOverlay, Link, Stack, Text } from "@chakra-ui/react"
import NextLink from "next/link"
import { useRouter } from "next/router"
import { useEffect } from "react"
import { useSelector } from "react-redux"

const superuserItems = [
  { to: "/", text: "Dashboard" },
  { to: "/activities", text: "Activities" },
  { to: "/roles", text: "Roles" },
  { to: "/users", text: "Users" },
  { to: "/me", text: "My Profile" },
]

const nonSuperuserItems = [
  { to: "/", text: "Dashboard" },
  { to: "/activities", text: "Activities" },
  { to: "/me", text: "My Profile" },
]

const Navbar = ({ mobileNavbar }) => {
  const router = useRouter()
  const { user } = useSelector(s => s.auth)

  useEffect(() => {
    mobileNavbar.onClose()
  }, [router.asPath])
  
  return (
    <>
      <Stack
        w="72"
        bg="gray.700"
        color="white"
        fontWeight="bold"
        letterSpacing="wider"
        px="4"
        py="5"
        flexShrink="0"
        overflow="auto"
        display={{ base: "none", lg: "flex" }}
      >
        <Text fontSize="2xl" fontWeight="black" textAlign="center">
          1Akun
        </Text>
        <Box h="3" />
        {(user.role_id === 1 ? superuserItems : nonSuperuserItems).map((link, i) => {
          const isActive = router.asPath === link.to
          return (
            <NextLink key={i} href={!isActive ? link.to : "#"} passHref>
              <Link
                px="3.5"
                py="2.5"
                rounded="lg"
                bg={isActive && "purple.600"}
                color="white"
                fontWeight="bold"
                _hover={{
                  bg: !isActive && "gray.600",
                }}
                _focus={{
                  bg: !isActive && "gray.600",
                }}
              >
                <Text>
                  {link.text}
                </Text>
              </Link>
            </NextLink>
          )
        })}
      </Stack>
      <Drawer
        isOpen={mobileNavbar.isOpen}
        onClose={mobileNavbar.onClose}
        placement="left"
      >
        <DrawerOverlay />
        <DrawerContent>
          <Stack
            w="full"
            h="full"
            bg="white"
            color="gray.800"
            fontWeight="bold"
            letterSpacing="wider"
            px="4"
            py="5"
            flexShrink="0"
            overflow="auto"
          >
            <Text fontSize="2xl" fontWeight="black" textAlign="center">
              1Akun
            </Text>
            <Box h="3" />
            {(user.role_id === 1 ? superuserItems : nonSuperuserItems).map((link, i) => {
              const isActive = router.asPath === link.to
              return (
                <NextLink key={i} href={!isActive ? link.to : "#"} passHref>
                  <Link
                    px="3.5"
                    py="2.5"
                    rounded="lg"
                    bg={isActive && "purple.100"}
                    color={isActive ? "purple.700" : "gray.800"}
                    fontWeight="bold"
                    _hover={{
                      bg: !isActive && "gray.100",
                    }}
                    _focus={{
                      bg: !isActive && "transparent",
                      _hover: {
                        bg: !isActive && "gray.100",
                      },
                    }}
                  >
                    <Text>
                      {link.text}
                    </Text>
                  </Link>
                </NextLink>
              )
            })}
          </Stack>
        </DrawerContent>
      </Drawer>
    </>
  )
}

export default Navbar
