import { Box, Button, Flex, FormControl, FormLabel, HStack, Icon, IconButton, Input, Modal, ModalBody, ModalContent, ModalOverlay, Text, useToast } from "@chakra-ui/react"
import { PlusIcon, XIcon } from "@heroicons/react/outline"
import { useEffect, useState } from "react"
import { unstable_batchedUpdates } from "react-dom"
import { apiClient, sleep } from "src/client/lib"
import RolePicker from "./role-picker"

const InviteUsersModal = ({
  isOpen,
  onClose,
}) => {
  const toast = useToast({ position: "top", variant: "top-accent", duration: 3000 })
  const [isLoading, setIsLoading] = useState(false)
  const [role, setRole] = useState(null)
  const [email, setEmail] = useState("")
  const [emails, setEmails] = useState([])

  const handleRoleChange = (name, newRole) => {
    setRole(newRole)
  }

  const handleEmailChange = (e) => {
    setEmail(e.target.value)
  }

  const handlePushEmails = () => {
    setEmail("")
    setEmails(emails => [email, ...emails])
  }

  const handleEmailKeyboardChange = (e) => {
    if (e.key === "Enter") {
      handlePushEmails()
    }
  }

  const handleItemDelete = (email) => {
    setEmails(emails => emails.filter(e => e !== email))
  }

  const handleInvite = async () => {
    setIsLoading(true)
    await sleep(500)
    const data = { role_id: role.id, emails }

    try {
      await apiClient.post("/invite", data)
    } catch (error) {
      return console.log(error)
    }

    unstable_batchedUpdates(() => {
      onClose()
      toast({
        title: "Users have been invited",
        description: "They would receive the invitation in their email inbox.",
        status: "success",
      })
    })
  }

  useEffect(() => {
    if (!isOpen) {
      unstable_batchedUpdates(() => {
        setRole(null)
        setEmail("")
        setEmails([])
        setIsLoading(false)
      })
    }
  }, [isOpen])

  return (
    <Modal size="sm" isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalBody>
          <Box h="3" />
          <Text fontSize="xl" fontWeight="extrabold" textAlign="center">
            Invite users
          </Text>
          <Box h="5" />
          <Box>
            <FormControl isRequired>
              <FormLabel>
                Role
              </FormLabel>
              <RolePicker
                name="role"
                value={role}
                onChange={handleRoleChange}
              />
            </FormControl>
            <Box h="5" />
            <FormControl isRequired>
              <FormLabel>
                Emails
              </FormLabel>
              <HStack>
                <Input
                  value={email}
                  onChange={handleEmailChange}
                  placeholder="Enter a valid email"
                  onKeyUp={handleEmailKeyboardChange}
                />
                <IconButton
                  onClick={handlePushEmails}
                  icon={<Icon as={PlusIcon} w="5" h="5" />}
                  isDisabled={!email}
                  variant="solid"
                />
              </HStack>
            </FormControl>
          </Box>
          <Box h="5" />
          <Box>
            {emails.length === 0 && (
              <HStack h="12" justifyContent="center">
                <Text color="gray.500" fontSize="sm" textAlign="center">
                  Invited users' email will be shown here.
                </Text>
              </HStack>
            )}
            {emails.map((email, i) => (
              <Item key={i} email={email} onDelete={handleItemDelete} />
            ))}
          </Box>
          <Box h="6" />
          <Button
            isFullWidth
            isDisabled={!role || emails.length === 0}
            onClick={handleInvite}
            isLoading={isLoading}
          >
            Invite
          </Button>
          <Box h="4" />
        </ModalBody>
      </ModalContent>
    </Modal>
  )
}

const Item = ({ email, onDelete }) => {
  return (
    <Flex
      h="12"
      px="3.5"
      rounded="lg"
      alignItems="center"
      justifyContent="flex-start"
      fontWeight="semibold"
      _hover={{
        bg: "gray.50",
        color: "gray.700",
      }}
    >
      <Text flex="1" textAlign="left">
        {email}
      </Text>
      <IconButton
        px="2"
        py="2"
        mr="-3"
        variant="link"
        icon={<Icon as={XIcon} w="5" h="5" />}
        onClick={() => onDelete(email)}
      />
    </Flex>
  )
}

export default InviteUsersModal
