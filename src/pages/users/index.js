import { Badge, Box, Button, CircularProgress, Flex, FormControl, FormHelperText, FormLabel, HStack, Icon, IconButton, Input, InputGroup, InputLeftElement, Menu, MenuButton, MenuItem, MenuList, Modal, ModalBody, ModalContent, ModalOverlay, Select, SimpleGrid, Stack, Table, Tbody, Td, Text, Th, Thead, Tr, useDisclosure, useToast } from "@chakra-ui/react"
import { DotsHorizontalIcon, FilterIcon, MailIcon, PencilIcon, PlusIcon, SearchIcon, TrashIcon, XIcon } from "@heroicons/react/outline"
import { useFormik } from "formik"
import debounce from "lodash/debounce"
import queryString from "query-string"
import { useEffect, useState } from "react"
import { unstable_batchedUpdates } from "react-dom"
import { InviteUsersModal, MainLayout, Pagination, RolePicker } from "src/client/components"
import { apiClient, sleep } from "src/client/lib"

const perPage = 15

const initialFilter = {
  sortBy: "users.name",
  sortDirection: "",
  status: "all",
}

const initialCreate = {
  name: "",
  email: "",
  password: "",
  password_repeat: "",
  role: null,
  status: "active",
}

const Users = () => {
  const [page, setPage] = useState(1)
  const [data, setData] = useState([])
  const [total, setTotal] = useState(0)
  const [keyword, setKeyword] = useState("")
  const [filter, setFilter] = useState(initialFilter)
  const [isLoading, setIsLoading] = useState(true)
  const [selectedItem, setSelectedItem] = useState(null)

  const toast = useToast({ position: "top", variant: "top-accent", duration: 3000 })

  const filterModal = useDisclosure()
  const inviteModal = useDisclosure()
  const createModal = useDisclosure()
  const detailModal = useDisclosure()
  const updateModal = useDisclosure()
  const deleteModal = useDisclosure()

  const filterFormik = useFormik({
    initialValues: initialFilter,
    onSubmit: (values) => {
      unstable_batchedUpdates(() => {
        setIsLoading(true)
        setFilter(values)
        filterModal.onClose()
      })
    },
  })

  const createFormik = useFormik({
    initialValues: initialCreate,
    onSubmit: async (values) => {
      await sleep(500)

      if (values.password !== values.password_repeat) {
        return toast({ title: "Password and repeat password don't match", description: "Check your submitted form and try again.", status: "error" })
      }

      const data = {
        name: values.name,
        email: values.email,
        password: values.password,
        role_id: values.role ? values.role.id : null,
        is_active: values.status === "active",
      }

      try {
        await apiClient.post("/users", data)
      } catch (error) {
        return toast({ title: "Failed to create user", description: "Something went wrong. Please try again later.", status: "error" })
      }

      unstable_batchedUpdates(() => {
        setIsLoading(true)
        setPage(1)
        createModal.onClose()
      })
    },
  })

  const updateFormik = useFormik({
    initialValues: initialCreate,
    onSubmit: async (values) => {
      await sleep(500)

      if (values.password !== values.password_repeat) {
        return toast({ title: "Password and repeat password don't match", description: "Check your submitted form and try again.", status: "error" })
      }

      const data = {
        name: values.name,
        email: values.email,
        role_id: values.role ? values.role.id : null,
        is_active: values.status === "active",
      }

      if (values.password) data.password = values.password

      let result
      try {
        result = await apiClient.put(`/users/${selectedItem.id}`, data)
      } catch (error) {
        return toast({ title: "Failed to update user", description: "Something went wrong. Please try again later.", status: "error" })
      }

      unstable_batchedUpdates(() => {
        setIsLoading(true)
        setPage(1)
        setSelectedItem(result.data)
        updateModal.onClose()
      })
    },
  })

  const deleteFormik = useFormik({
    initialValues: { id: "" },
    onSubmit: async (values) => {
      await sleep(500)

      try {
        await apiClient.delete(`/users/${values.id}`)
      } catch (error) {
        return console.log(error)
      }

      detailModal.onClose()
      await sleep(500)
      unstable_batchedUpdates(() => {
        setIsLoading(true)
        setPage(1)
        deleteModal.onClose()
      })
    },
  })

  const handlePageChange = (page) => {
    unstable_batchedUpdates(() => {
      setIsLoading(true)
      setPage(page)
    })
  }

  const handleSearch = debounce((e) => {
    unstable_batchedUpdates(() => {
      setIsLoading(true)
      setKeyword(e.target.value)
      setPage(1)
    })
  }, 750)

  const handleFilterModalOpen = () => {
    unstable_batchedUpdates(() => {
      filterFormik.setValues(filter)
      filterModal.onOpen()
    })
  }

  const handleFilterModalReset = () => {
    unstable_batchedUpdates(() => {
      setIsLoading(true)
      setFilter(initialFilter)
      filterModal.onClose()
    })
  }

  const handleCreateModalOpen = () => {
    unstable_batchedUpdates(() => {
      createFormik.setValues(initialCreate)
      createModal.onOpen()
    })
  }

  const handleDetailModalOpen = (item) => {
    unstable_batchedUpdates(() => {
      setSelectedItem(item)
      detailModal.onOpen()
    })
  }

  const handleUpdateModalOpen = () => {
    unstable_batchedUpdates(() => {
      updateFormik.setValues({
        name: selectedItem.name,
        email: selectedItem.email,
        password: "",
        password_repeat: "",
        role: { id: selectedItem.role_id, name: selectedItem.role_name },
        status: selectedItem.is_active ? "active" : "inactive",
      })
      updateModal.onOpen()
    })
  }

  const handleDeleteModalOpen = () => {
    unstable_batchedUpdates(() => {
      deleteFormik.setValues({ id: selectedItem.id })
      deleteModal.onOpen()
    })
  }

  useEffect(() => {
    if (isLoading) {
      const fetchData = async () => {
        await sleep(500)

        let result
        try {
          const qs = queryString.stringify({
            page,
            perPage,
            search: keyword,
            sort: `${filter.sortDirection}${filter.sortBy}`,
            status: filter.status,
          })
          result = await apiClient.get(`/users?${qs}`)
        } catch (error) {
          return console.log(error)
        }

        unstable_batchedUpdates(() => {
          setData(result.data.data)
          setTotal(result.data.total)
          setIsLoading(false)
        })
      }

      fetchData()
    }
  }, [isLoading, page, keyword, filter])

  return (
    <>
      <HStack
        bg="white"
        py="5"
        position="sticky"
        top="0"
      >
        <InputGroup w="64">
          <InputLeftElement pointerEvents="none">
            <Icon as={SearchIcon} w="5" h="5" color="gray.500" />
          </InputLeftElement>
          <Input
            placeholder="Search here..."
            onChange={handleSearch}
          />
        </InputGroup>
        <Box flex="1" />
        <Box display={{ base: "block", sm: "none" }}>
          <IconButton
            icon={<Icon as={PlusIcon} w="5" h="5" />}
            isDisabled={isLoading}
            onClick={handleCreateModalOpen}
          />
        </Box>
        <Box display={{ base: "none", sm: "block" }}>
          <Button
            px="5"
            leftIcon={<Icon as={FilterIcon} w="5" h="5" />}
            variant="outline"
            isDisabled={isLoading}
            onClick={handleFilterModalOpen}
          >
            Filter
          </Button>
        </Box>
        <Box display={{ base: "none", sm: "block" }}>
          <Button
            px="5"
            leftIcon={<Icon as={PlusIcon} w="5" h="5" />}
            isDisabled={isLoading}
            onClick={handleCreateModalOpen}
          >
            New
          </Button>
        </Box>
        <Menu placement="bottom-end">
          <MenuButton
            as={IconButton}
            icon={<Icon as={DotsHorizontalIcon} w="5" h="5" />}
            variant="outline"
            isDisabled={isLoading}
          />
          <MenuList>
            <MenuItem
              icon={<Icon as={FilterIcon} w="5" h="5" className="icon_stroke_1.75" />}
              isDisabled={isLoading}
              onClick={handleFilterModalOpen}
              display={{ base: "block", sm: "none" }}
            >
              Filter
            </MenuItem>
            <MenuItem
              icon={<Icon as={MailIcon} w="5" h="5" className="icon_stroke_1.75" />}
              onClick={inviteModal.onOpen}
            >
              Invite via email
            </MenuItem>
          </MenuList>
        </Menu>
      </HStack>
      <Box h="3" />
      {isLoading && (
        <Stack alignItems="center" my="12">
          <CircularProgress isIndeterminate size="10" />
        </Stack>
      )}
      {!isLoading && data.length === 0 && (
        <Stack alignItems="center" my="12">
          <Text color="gray.600" fontWeight="semibold" textAlign="center">
            No data found.
          </Text>
        </Stack>
      )}
      {!isLoading && data.length > 0 && (
        <>
          <Box overflowX="auto">
            <Table>
              <Thead>
                <Tr>
                  <Th minW="64">Name</Th>
                  <Th minW="48">Role</Th>
                  <Th w="32">Status</Th>
                </Tr>
              </Thead>
              <Tbody>
                {data.map((item, i) => (
                  <Tr key={i} role="group">
                    <Td cursor="pointer" _groupHover={{ bg: "gray.100" }} onClick={() => handleDetailModalOpen(item)}>
                      {item.name}
                    </Td>
                    <Td cursor="pointer" _groupHover={{ bg: "gray.100" }} onClick={() => handleDetailModalOpen(item)}>
                      {item.role_name}
                    </Td>
                    <Td cursor="pointer" _groupHover={{ bg: "gray.100" }} onClick={() => handleDetailModalOpen(item)}>
                      {item.is_active ? (
                        <Badge colorScheme="green">Active</Badge>
                      ) : (
                        <Badge colorScheme="red">Inactive</Badge>
                      )}
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </Box>
          <Box h="7" />
          <Pagination
            page={page}
            perPage={perPage}
            total={total}
            onChange={handlePageChange}
          />
        </>
      )}
      <InviteUsersModal
        isOpen={inviteModal.isOpen}
        onClose={inviteModal.onClose}
      />
      <Modal size="sm" isOpen={filterModal.isOpen} onClose={filterModal.onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalBody as="form" onSubmit={filterFormik.handleSubmit}>
            <Box h="3" />
            <Text fontSize="xl" fontWeight="extrabold" textAlign="center">
              Filter
            </Text>
            <Box h="5" />
            <FormControl id="filter-sort-by">
              <FormLabel>Sort by</FormLabel>
              <Select name="sortBy" onChange={filterFormik.handleChange} value={filterFormik.values.sortBy}>
                <option value="users.name">Name</option>
              </Select>
            </FormControl>
            <Box h="5" />
            <FormControl id="filter-sort-direction">
              <FormLabel>Sort direction</FormLabel>
              <Select name="sortDirection" onChange={filterFormik.handleChange} value={filterFormik.values.sortDirection}>
                <option value="">Ascending</option>
                <option value="-">Descending</option>
              </Select>
            </FormControl>
            <Box h="5" />
            <FormControl id="filter-status">
              <FormLabel>Status</FormLabel>
              <Select name="status" onChange={filterFormik.handleChange} value={filterFormik.values.status}>
                <option value="all">All</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </Select>
            </FormControl>
            <Box h="7" />
            <HStack>
              <Button
                variant="outline"
                flex="1"
                type="button"
                onClick={handleFilterModalReset}
              >
                Reset
              </Button>
              <Button
                flex="1"
                type="submit"
              >
                Apply
              </Button>
            </HStack>
            <Box h="5" />
          </ModalBody>
        </ModalContent>
      </Modal>
      <Modal size="2xl" isOpen={createModal.isOpen} onClose={!createFormik.isSubmitting && createModal.onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalBody as="form" onSubmit={createFormik.handleSubmit}>
            <Box h="3" />
            <Text fontSize="xl" fontWeight="extrabold" textAlign="center">
              New user
            </Text>
            <Box h="7" />
            <SimpleGrid columns={{ base: "1", sm: "2" }} gap="6">
              <FormControl isRequired id="create-name">
                <FormLabel>Name</FormLabel>
                <Input
                  name="name"
                  onChange={createFormik.handleChange}
                  value={createFormik.values.name}
                  placeholder="User's name"
                />
              </FormControl>
              <FormControl isRequired id="create-email">
                <FormLabel>Email</FormLabel>
                <Input
                  name="email"
                  onChange={createFormik.handleChange}
                  value={createFormik.values.email}
                  placeholder="User's email"
                />
              </FormControl>
              <FormControl isRequired id="create-password">
                <FormLabel>Password</FormLabel>
                <Input
                  name="password"
                  type="password"
                  onChange={createFormik.handleChange}
                  value={createFormik.values.password}
                  placeholder="User's password"
                />
              </FormControl>
              <FormControl isRequired id="create-password-repeat">
                <FormLabel>Repeat password</FormLabel>
                <Input
                  name="password_repeat"
                  type="password"
                  onChange={createFormik.handleChange}
                  value={createFormik.values.password_repeat}
                  placeholder="User's password"
                />
              </FormControl>
              <FormControl isRequired id="create-role-id">
                <FormLabel>Role</FormLabel>
                <RolePicker
                  name="role"
                  value={createFormik.values.role}
                  onChange={createFormik.setFieldValue}
                />
              </FormControl>
              <FormControl isRequired id="create-status">
                <FormLabel>Status</FormLabel>
                <Select name="status" onChange={createFormik.handleChange} value={createFormik.values.status}>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </Select>
              </FormControl>
            </SimpleGrid>
            <Box h="10" />
            <Flex justifyContent="flex-end">
              <Button
                variant="outline"
                minW="28"
                type="button"
                onClick={createModal.onClose}
                isDisabled={createFormik.isSubmitting}
              >
                Cancel
              </Button>
              <Box w="3" />
              <Button
                minW="28"
                type="submit"
                isLoading={createFormik.isSubmitting}
              >
                Save
              </Button>
            </Flex>
            <Box h="5" />
          </ModalBody>
        </ModalContent>
      </Modal>
      <Modal size="full" isOpen={detailModal.isOpen} onClose={detailModal.onClose} scrollBehavior="inside">
        <ModalOverlay />
        <ModalContent m="0" rounded="none">
          <ModalBody>
            <HStack my="3" w="full" maxW="2xl" mx="auto">
              <IconButton
                icon={<Icon as={XIcon} w="5" h="5" />}
                variant="ghost"
                onClick={detailModal.onClose}
              />
              <Box flex="1" />
              <Button
                leftIcon={<Icon as={PencilIcon} w="5" h="5" />}
                variant="outline"
                onClick={handleUpdateModalOpen}
              >
                Edit
              </Button>
              <Button
                leftIcon={<Icon as={TrashIcon} w="5" h="5" />}
                variant="outline"
                onClick={handleDeleteModalOpen}
              >
                Delete
              </Button>
            </HStack>
            <Box h="5" />
            <SimpleGrid columns={{ base: "1", sm: "2" }} gap="7" my="3" w="full" maxW="2xl" mx="auto">
              <Box>
                <Text color="gray.600" fontSize="xs" fontWeight="bold" textTransform="uppercase">Name</Text>
                <Box h="1" />
                <Text>{selectedItem && selectedItem.name}</Text>
              </Box>
              <Box>
                <Text color="gray.600" fontSize="xs" fontWeight="bold" textTransform="uppercase">Email</Text>
                <Box h="1" />
                <Text>{selectedItem && selectedItem.email}</Text>
              </Box>
              <Box>
                <Text color="gray.600" fontSize="xs" fontWeight="bold" textTransform="uppercase">Role</Text>
                <Box h="1" />
                <Text>{selectedItem && selectedItem.role_name}</Text>
              </Box>
              <Box>
                <Text color="gray.600" fontSize="xs" fontWeight="bold" textTransform="uppercase">Status</Text>
                <Box h="1" />
                <Text>
                  {selectedItem && selectedItem.is_active ? (
                    <Badge colorScheme="green">Active</Badge>
                  ) : (
                    <Badge colorScheme="red">Inactive</Badge>
                  )}
                </Text>
              </Box>
              <Box>
                <Text color="gray.600" fontSize="xs" fontWeight="bold" textTransform="uppercase">Joined at</Text>
                <Box h="1" />
                <Text>{selectedItem && selectedItem.created_at}</Text>
              </Box>
              <Box>
                <Text color="gray.600" fontSize="xs" fontWeight="bold" textTransform="uppercase">Updated at</Text>
                <Box h="1" />
                <Text>{selectedItem && selectedItem.updated_at}</Text>
              </Box>
            </SimpleGrid>
          </ModalBody>
        </ModalContent>
      </Modal>
      <Modal size="2xl" isOpen={updateModal.isOpen} onClose={!updateFormik.isSubmitting && updateModal.onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalBody as="form" onSubmit={updateFormik.handleSubmit}>
            <Box h="3" />
            <Text fontSize="xl" fontWeight="extrabold" textAlign="center">
              Edit user
            </Text>
            <Box h="7" />
            <SimpleGrid columns={{ base: "1", sm: "2" }} gap="6">
              <FormControl isRequired id="update-name">
                <FormLabel>Name</FormLabel>
                <Input
                  name="name"
                  onChange={updateFormik.handleChange}
                  value={updateFormik.values.name}
                  placeholder="User's name"
                />
              </FormControl>
              <FormControl isRequired id="update-email">
                <FormLabel>Email</FormLabel>
                <Input
                  name="email"
                  onChange={updateFormik.handleChange}
                  value={updateFormik.values.email}
                  placeholder="User's email"
                />
              </FormControl>
              <FormControl id="update-password">
                <FormLabel>Password</FormLabel>
                <Input
                  name="password"
                  type="password"
                  onChange={updateFormik.handleChange}
                  value={updateFormik.values.password}
                  placeholder="User's password"
                />
                <FormHelperText>Fill this out if you want to change password.</FormHelperText>
              </FormControl>
              <FormControl id="update-password-repeat">
                <FormLabel>Repeat password</FormLabel>
                <Input
                  name="password_repeat"
                  type="password"
                  onChange={updateFormik.handleChange}
                  value={updateFormik.values.password_repeat}
                  placeholder="User's password"
                />
                <FormHelperText>Fill this out if you want to change password.</FormHelperText>
              </FormControl>
              <FormControl isRequired id="update-role-id">
                <FormLabel>Role</FormLabel>
                <RolePicker
                  name="role"
                  value={updateFormik.values.role}
                  onChange={updateFormik.setFieldValue}
                />
              </FormControl>
              <FormControl isRequired id="update-status">
                <FormLabel>Status</FormLabel>
                <Select name="status" onChange={updateFormik.handleChange} value={updateFormik.values.status}>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </Select>
              </FormControl>
            </SimpleGrid>
            <Box h="10" />
            <Flex justifyContent="flex-end">
              <Button
                variant="outline"
                minW="28"
                type="button"
                onClick={updateModal.onClose}
                isDisabled={updateFormik.isSubmitting}
              >
                Cancel
              </Button>
              <Box w="3" />
              <Button
                minW="28"
                type="submit"
                isLoading={updateFormik.isSubmitting}
              >
                Save changes
              </Button>
            </Flex>
            <Box h="5" />
          </ModalBody>
        </ModalContent>
      </Modal>
      <Modal isOpen={deleteModal.isOpen} onClose={deleteModal.onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalBody as="form" onSubmit={deleteFormik.handleSubmit}>
            <Box h="3" />
            <Text fontSize="xl" fontWeight="extrabold" textAlign="center">
              Delete user
            </Text>
            <Box h="5" />
            <Text textAlign="center">
              Are you sure want to delete user <b>{selectedItem && selectedItem.name}</b>?
            </Text>
            <Box h="10" />
            <input type="hidden" name="id" value={deleteFormik.values.id} />
            <HStack>
              <Button
                variant="outline"
                flex="1"
                type="button"
                onClick={deleteModal.onClose}
                isDisabled={deleteFormik.isSubmitting}
              >
                No
              </Button>
              <Button
                flex="1"
                type="submit"
                isLoading={deleteFormik.isSubmitting}
              >
                Yes
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
  <MainLayout title="Users">
    {page}
  </MainLayout>
)

Users.getLayout = getLayout

export default Users
