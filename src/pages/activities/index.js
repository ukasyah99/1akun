import { Box, Button, CircularProgress, FormControl, FormLabel, HStack, Icon, IconButton, Input, InputGroup, InputLeftElement, Modal, ModalBody, ModalContent, ModalOverlay, Select, SimpleGrid, Stack, Table, Tbody, Td, Text, Th, Thead, Tr, useDisclosure } from "@chakra-ui/react"
import { FilterIcon, SearchIcon, XIcon } from "@heroicons/react/outline"
import { useFormik } from "formik"
import debounce from "lodash/debounce"
import queryString from "query-string"
import { useEffect, useState } from "react"
import { unstable_batchedUpdates } from "react-dom"
import { useSelector } from "react-redux"
import { MainLayout, Pagination } from "src/client/components"
import { apiClient, sleep } from "src/client/lib"

const perPage = 15

const Activities = () => {
  const [page, setPage] = useState(1)
  const [data, setData] = useState([])
  const [total, setTotal] = useState(0)
  const [keyword, setKeyword] = useState("")
  const [filter, setFilter] = useState({ sortBy: "done_at", sortDirection: "-" })
  const [isLoading, setIsLoading] = useState(true)
  const [selectedItem, setSelectedItem] = useState(null)

  const { user } = useSelector(s => s.auth)

  const filterModal = useDisclosure()
  const detailModal = useDisclosure()

  const filterFormik = useFormik({
    initialValues: { sortBy: "done_at", sortDirection: "-" },
    onSubmit: (values) => {
      unstable_batchedUpdates(() => {
        setIsLoading(true)
        setFilter(values)
        filterModal.onClose()
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
      setFilter({ sortBy: "done_at", sortDirection: "-" })
      filterModal.onClose()
    })
  }

  const handleDetailModalOpen = (item) => {
    unstable_batchedUpdates(() => {
      setSelectedItem(item)
      detailModal.onOpen()
    })
  }

  useEffect(() => {
    if (isLoading) {
      const fetchData = async () => {
        await sleep(500)

        const path = user.role_id === 1 ? "/activities" : `/users/${user.id}/activities`
        let result
        try {
          const qs = queryString.stringify({ page, perPage, search: keyword, sort: `${filter.sortDirection}${filter.sortBy}` })
          result = await apiClient.get(`${path}?${qs}`)
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
            icon={<Icon as={FilterIcon} w="5" h="5" />}
            variant="outline"
            isDisabled={isLoading}
            onClick={handleFilterModalOpen}
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
                  <Th minW="48">User</Th>
                  <Th minW="64">Description</Th>
                  <Th minW="56">Done at</Th>
                </Tr>
              </Thead>
              <Tbody>
                {data.map((item, i) => (
                  <Tr key={i} role="group">
                    <Td cursor="pointer" _groupHover={{ bg: "gray.100" }} onClick={() => handleDetailModalOpen(item)}>
                      {item.user_name}
                    </Td>
                    <Td cursor="pointer" _groupHover={{ bg: "gray.100" }} onClick={() => handleDetailModalOpen(item)}>
                      {item.description}
                    </Td>
                    <Td cursor="pointer" _groupHover={{ bg: "gray.100" }} onClick={() => handleDetailModalOpen(item)}>
                      {item.done_at}
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
                <option value="done_at">Done at</option>
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
      <Modal size="full" isOpen={detailModal.isOpen} onClose={detailModal.onClose} scrollBehavior="inside">
        <ModalOverlay />
        <ModalContent m="0" rounded="none">
          <ModalBody>
            <HStack my="3" w="full" maxW="2xl" mx="auto">
              <Text flex="1" fontSize="lg" fontWeight="extrabold">
                Activity details
              </Text>
              <IconButton
                icon={<Icon as={XIcon} w="5" h="5" />}
                variant="ghost"
                onClick={detailModal.onClose}
              />
            </HStack>
            <Box h="5" />
            <SimpleGrid columns={{ base: "1", sm: "2" }} gap="7" my="3" w="full" maxW="2xl" mx="auto">
              <Box>
                <Text color="gray.600" fontSize="xs" fontWeight="bold" textTransform="uppercase">User</Text>
                <Box h="1" />
                <Text>{selectedItem && selectedItem.user_name}</Text>
              </Box>
              <Box>
                <Text color="gray.600" fontSize="xs" fontWeight="bold" textTransform="uppercase">Description</Text>
                <Box h="1" />
                <Text>{selectedItem && selectedItem.description}</Text>
              </Box><Box>
                <Text color="gray.600" fontSize="xs" fontWeight="bold" textTransform="uppercase">Done at</Text>
                <Box h="1" />
                <Text>{selectedItem && selectedItem.done_at}</Text>
              </Box>
            </SimpleGrid>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  )
}

const getLayout = (page) => (
  <MainLayout title="Activities">
    {page}
  </MainLayout>
)

Activities.getLayout = getLayout

export default Activities
