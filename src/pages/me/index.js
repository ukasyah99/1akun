import { Badge, Box, Button, FormControl, FormHelperText, FormLabel, HStack, Icon, Input, Modal, ModalBody, ModalContent, ModalOverlay, SimpleGrid, Text, useDisclosure, useToast } from "@chakra-ui/react"
import { PencilIcon } from "@heroicons/react/outline"
import dayjs from "dayjs"
import utc from "dayjs/plugin/utc"
import { useFormik } from "formik"
import { useEffect } from "react"
import { unstable_batchedUpdates } from "react-dom"
import { useDispatch, useSelector } from "react-redux"
import { MainLayout } from "src/client/components"
import { apiClient, sleep } from "src/client/lib"
import { setAuth } from "src/client/redux"
import * as yup from "yup"

dayjs.extend(utc)

const initialEditFormikValues = {
  name: "",
  email: "",
  password: "",
  password_repeat: "",
}

const editValidationSchema = yup.object().shape({
  name: yup.string().required("This field is required"),
  email: yup.string().email("This field must be a valid email").required("This field is required"),
})

const MyProfile = () => {
  const dispatch = useDispatch()
  const { user } = useSelector(s => s.auth)
  const toast = useToast({ position: "top", variant: "top-accent", duration: 2500 })
  const editModal = useDisclosure()

  const editFormik = useFormik({
    initialValues: initialEditFormikValues,
    validationSchema: editValidationSchema,
    onSubmit: async (values) => {
      await sleep(500)

      let result
      try {
        result = await apiClient.put(`/users/${user.id}`, values)
      } catch (error) {
        return toast({
          title: "Failed to update user data",
          description: error.response.data.error,
          status: "error",
        })
      }

      unstable_batchedUpdates(() => {
        dispatch(setAuth({ user: result.data }))
        editModal.onClose()
      })
    },
  })

  useEffect(() => {
    if (user && !editModal.isOpen) {
      editFormik.setValues({
        name: user.name,
        email: user.email,
        password: "",
        password_repeat: "",
      })
    }
  }, [user, editModal.isOpen])

  return (
    <>
      <Box h="5" />
      <HStack>
        <Text fontSize="lg" fontWeight="bold">
          Basic Information
        </Text>
        <Box flex="1" />
        <Button
          leftIcon={<Icon as={PencilIcon} w="5" h="5" />}
          variant="outline"
          onClick={editModal.onOpen}
        >
          Edit
        </Button>
      </HStack>
      <Box h="8" />
      <SimpleGrid columns={{ base: "1", sm: "2", md: "3" }} gap="7" w="full">
        <Box>
          <Text color="gray.600" fontSize="xs" fontWeight="bold" textTransform="uppercase">Name</Text>
          <Box h="1" />
          <Text>{user.name}</Text>
        </Box>
        <Box>
          <Text color="gray.600" fontSize="xs" fontWeight="bold" textTransform="uppercase">Email</Text>
          <Box h="1" />
          <Text>{user.email}</Text>
        </Box>
        <Box>
          <Text color="gray.600" fontSize="xs" fontWeight="bold" textTransform="uppercase">Role</Text>
          <Box h="1" />
          <Text>{user.role_name}</Text>
        </Box>
        <Box>
          <Text color="gray.600" fontSize="xs" fontWeight="bold" textTransform="uppercase">Status</Text>
          <Box h="1" />
          <Text><Badge colorScheme="green">{user.is_active ? "Active" : "Inactive"}</Badge></Text>
        </Box>
        <Box>
          <Text color="gray.600" fontSize="xs" fontWeight="bold" textTransform="uppercase">Joined at</Text>
          <Box h="1" />
          <Text>{dayjs.utc(user.created_at).format("MMM D, YYYY hh:mm A")}</Text>
        </Box>
        <Box>
          <Text color="gray.600" fontSize="xs" fontWeight="bold" textTransform="uppercase">Updated at</Text>
          <Box h="1" />
          <Text>{dayjs.utc(user.updated_at).format("MMM D, YYYY hh:mm A")}</Text>
        </Box>
      </SimpleGrid>
      <Modal
        size="2xl"
        isOpen={editModal.isOpen}
        onClose={editModal.onClose}
      >
        <ModalOverlay />
        <ModalContent>
          <ModalBody
            as="form"
            onSubmit={editFormik.handleSubmit}
          >
            <Box h="3" />
            <Text fontSize="xl" fontWeight="extrabold" textAlign="center">
              Edit Profile
            </Text>
            <Box h="7" />
            <SimpleGrid columns={{ base: "1", sm: "2" }} gap="6">
              <FormControl id="edit-name" isRequired>
                <FormLabel>Name</FormLabel>
                <Input
                  name="name"
                  placeholder="Your name"
                  onBlur={editFormik.handleBlur}
                  onChange={editFormik.handleChange}
                  value={editFormik.values.name}
                  isInvalid={editFormik.errors.name && editFormik.touched.name}
                />
                {editFormik.errors.name && editFormik.touched.name && (
                  <FormHelperText color="red.500">{editFormik.errors.name}</FormHelperText>
                )}
              </FormControl>
              <FormControl id="edit-email" isRequired>
                <FormLabel>Email</FormLabel>
                <Input
                  name="email"
                  placeholder="Your email address"
                  onBlur={editFormik.handleBlur}
                  onChange={editFormik.handleChange}
                  value={editFormik.values.email}
                  isInvalid={editFormik.errors.email && editFormik.touched.email}
                />
                {editFormik.errors.email && editFormik.touched.email && (
                  <FormHelperText color="red.500">{editFormik.errors.email}</FormHelperText>
                )}
              </FormControl>
              <FormControl id="edit-password">
                <FormLabel>Password</FormLabel>
                <Input
                  name="password"
                  type="password"
                  placeholder="Strong password"
                  onChange={editFormik.handleChange}
                  value={editFormik.values.password}
                />
                <FormHelperText>Fill this out if you want to change password.</FormHelperText>
              </FormControl>
              <FormControl id="edit-password_repeat">
                <FormLabel>Repeat password</FormLabel>
                <Input
                  name="password_repeat"
                  type="password"
                  placeholder="Strong password"
                  onChange={editFormik.handleChange}
                  value={editFormik.values.password_repeat}
                />
                <FormHelperText>Fill this out if you want to change password.</FormHelperText>
              </FormControl>
            </SimpleGrid>
            <Box h="10" />
            <HStack>
              <Box flex="1" />
              <Button
                type="button"
                variant="outline"
                onClick={editModal.onClose}
                isDisabled={editFormik.isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                isLoading={editFormik.isSubmitting}
              >
                Save changes
              </Button>
            </HStack>
            <Box h="5" />
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  )
}

const getLayout = (page) => (
  <MainLayout title="My Profile">
    {page}
  </MainLayout>
)

MyProfile.getLayout = getLayout

export default MyProfile
