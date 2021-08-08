import { Badge, Box, Button, CircularProgress, FormControl, FormLabel, HStack, Icon, IconButton, Input, InputGroup, InputLeftElement, Modal, ModalBody, ModalContent, ModalOverlay, Select, SimpleGrid, Stack, Table, Tbody, Td, Text, Th, Thead, Tr, useDisclosure, useToast } from "@chakra-ui/react"
import { FilterIcon, PencilIcon, PlusIcon, SearchIcon, TrashIcon, XIcon } from "@heroicons/react/outline"
import { useFormik } from "formik"
import debounce from "lodash/debounce"
import queryString from "query-string"
import { useEffect, useState } from "react"
import { unstable_batchedUpdates } from "react-dom"
import { MainLayout, Pagination } from "src/client/components"
import { apiClient, sleep } from "src/client/lib"

const perPage = 15

const initialFilter = {
  sortBy: "name",
  sortDirection: "",
  registration: "all",
}

const initialCreate = {
  name: "",
  registration: "open",
}

const Roles = () => {
  const [page, setPage] = useState(1)
  const [data, setData] = useState([])
  const [total, setTotal] = useState(0)
  const [keyword, setKeyword] = useState("")
  const [filter, setFilter] = useState(initialFilter)
  const [isLoading, setIsLoading] = useState(true)
  const [selectedItem, setSelectedItem] = useState(null)

  const toast = useToast({ position: "top", variant: "top-accent", duration: 3000 })

  const filterModal = useDisclosure()
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

      const data = { name: values.name, is_opening_registration: values.registration === "open" }
      try {
        await apiClient.post("/roles", data)
      } catch (error) {
        return toast({ title: "Failed to create role", description: "Something went wrong. Please try again later.", status: "error" })
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

      const data = { name: values.name, is_opening_registration: values.registration === "open" }

      let result
      try {
        result = await apiClient.put(`/roles/${selectedItem.id}`, data)
      } catch (error) {
        return toast({ title: "Failed to update role", description: "Something went wrong. Please try again later.", status: "error" })
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
        await apiClient.delete(`/roles/${values.id}`)
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
        registration: selectedItem.is_opening_registration ? "open" : "closed",
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
            registration: filter.registration,
          })
          result = await apiClient.get(`/roles?${qs}`)
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
        <Box flex="1" display={{ base: "none", sm: "block" }} />
        <Box display={{ base: "block", sm: "none" }}>
          <IconButton
            icon={<Icon as={FilterIcon} w="5" h="5" />}
            variant="outline"
            isDisabled={isLoading}
            onClick={handleFilterModalOpen}
          />
        </Box>
        <Box display={{ base: "block", sm: "none" }}>
          <IconButton
            icon={<Icon as={PlusIcon} w="5" h="5" />}
            isDisabled={isLoading}
            onClick={handleCreateModalOpen}
          />
        </Box>
        <Box display={{ base: "none", sm: "block" }}>
          <Button
            w="36"
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
            w="36"
            leftIcon={<Icon as={PlusIcon} w="5" h="5" />}
            isDisabled={isLoading}
            onClick={handleCreateModalOpen}
          >
            New role
          </Button>
        </Box>
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
                  <Th w="56">Registration</Th>
                </Tr>
              </Thead>
              <Tbody>
                {data.map((item, i) => (
                  <Tr key={i} role="group">
                    <Td cursor="pointer" _groupHover={{ bg: "gray.100" }} onClick={() => handleDetailModalOpen(item)}>
                      {item.name}
                    </Td>
                    <Td cursor="pointer" _groupHover={{ bg: "gray.100" }} onClick={() => handleDetailModalOpen(item)}>
                      {item.is_opening_registration ? (
                        <Badge colorScheme="green">Open</Badge>
                      ) : (
                        <Badge colorScheme="red">Closed</Badge>
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
                <option value="name">Name</option>
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
            <FormControl id="filter-registration">
              <FormLabel>Registration</FormLabel>
              <Select name="registration" onChange={filterFormik.handleChange} value={filterFormik.values.registration}>
                <option value="all">All</option>
                <option value="open">Open</option>
                <option value="closed">Closed</option>
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
      <Modal size="sm" isOpen={createModal.isOpen} onClose={!createFormik.isSubmitting && createModal.onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalBody as="form" onSubmit={createFormik.handleSubmit}>
            <Box h="3" />
            <Text fontSize="xl" fontWeight="extrabold" textAlign="center">
              New role
            </Text>
            <Box h="5" />
            <FormControl id="create-name">
              <FormLabel>Name</FormLabel>
              <Input
                name="name"
                onChange={createFormik.handleChange}
                value={createFormik.values.name}
              />
            </FormControl>
            <Box h="5" />
            <FormControl id="create-registration">
              <FormLabel>Registration</FormLabel>
              <Select name="registration" onChange={createFormik.handleChange} value={createFormik.values.registration}>
                <option value="open">Open</option>
                <option value="closed">Closed</option>
              </Select>
            </FormControl>
            <Box h="7" />
            <HStack>
              <Button
                variant="outline"
                flex="1"
                type="button"
                onClick={createModal.onClose}
                isDisabled={createFormik.isSubmitting}
              >
                Cancel
              </Button>
              <Button
                flex="1"
                type="submit"
                isLoading={createFormik.isSubmitting}
              >
                Create new role
              </Button>
            </HStack>
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
                <Text color="gray.600" fontSize="xs" fontWeight="bold" textTransform="uppercase">Registration</Text>
                <Box h="1" />
                <Text>
                  {selectedItem && (
                    selectedItem.is_opening_registration
                      ? <Badge colorScheme="green">Open</Badge>
                      : <Badge colorScheme="red">Closed</Badge>
                  )}
                </Text>
              </Box>
            </SimpleGrid>
          </ModalBody>
        </ModalContent>
      </Modal>
      <Modal size="sm" isOpen={updateModal.isOpen} onClose={!updateFormik.isSubmitting && updateModal.onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalBody as="form" onSubmit={updateFormik.handleSubmit}>
            <Box h="3" />
            <Text fontSize="xl" fontWeight="extrabold" textAlign="center">
              Edit role
            </Text>
            <Box h="5" />
            <FormControl id="update-name">
              <FormLabel>Name</FormLabel>
              <Input
                name="name"
                onChange={updateFormik.handleChange}
                value={updateFormik.values.name}
              />
            </FormControl>
            <Box h="5" />
            <FormControl id="update-registration">
              <FormLabel>Registration</FormLabel>
              <Select name="registration" onChange={updateFormik.handleChange} value={updateFormik.values.registration}>
                <option value="open">Open</option>
                <option value="closed">Closed</option>
              </Select>
            </FormControl>
            <Box h="7" />
            <HStack>
              <Button
                variant="outline"
                flex="1"
                type="button"
                onClick={updateModal.onClose}
                isDisabled={updateFormik.isSubmitting}
              >
                Cancel
              </Button>
              <Button
                flex="1"
                type="submit"
                isLoading={updateFormik.isSubmitting}
              >
                Save changes
              </Button>
            </HStack>
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
              Delete role
            </Text>
            <Box h="5" />
            <Text textAlign="center">
              Are you sure want to delete role <b>{selectedItem && selectedItem.name}</b>?
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
  <MainLayout title="Roles">
    {page}
  </MainLayout>
)

Roles.getLayout = getLayout

export default Roles
