import { Box, Button, CircularProgress, Flex, Icon, IconButton, Input, Modal, ModalBody, ModalContent, ModalOverlay, SimpleGrid, Stack, Text, useDisclosure } from "@chakra-ui/react"
import { CheckIcon, ChevronDownIcon, ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/outline"
import debounce from "lodash/debounce"
import queryString from "query-string"
import { useEffect, useState } from "react"
import { unstable_batchedUpdates } from "react-dom"
import { apiClient, sleep } from "src/client/lib"

const perPage = 10

const RolePicker = ({
  name,
  value: selectedItem,
  onChange = () => { },
}) => {
  const modal = useDisclosure()
  const [isLoading, setIsLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [defaultData, setDefaultData] = useState([])
  const [defaultTotal, setDefaultTotal] = useState(0)
  const [data, setData] = useState([])
  const [total, setTotal] = useState(0)
  const [keyword, setKeyword] = useState("")

  const handleSearch = debounce((e) => {
    unstable_batchedUpdates(() => {
      setIsLoading(true)
      setKeyword(e.target.value)
      setPage(1)
    })
  }, 750)

  const handleItemClick = (data) => {
    unstable_batchedUpdates(() => {
      const newValue = selectedItem && data.id === selectedItem.id ? null : data
      onChange(name, newValue)
      modal.onClose()
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
            sort: "name",
          })
          result = await apiClient.get(`/roles?${qs}`)
        } catch (error) {
          return console.log(error)
        }

        unstable_batchedUpdates(() => {
          if (defaultData.length === 0) {
            setDefaultData(result.data.data)
            setDefaultTotal(result.data.total)
          }
          setData(result.data.data)
          setTotal(result.data.total)
          setIsLoading(false)
        })
      }

      fetchData()
    }
  }, [isLoading, page, keyword])

  useEffect(() => {
    if (!modal.isOpen) {
      unstable_batchedUpdates(() => {
        setData(defaultData)
        setTotal(defaultTotal)
      })
    }
  }, [modal.isOpen])

  return (
    <>
      <Button
        variant="outline"
        w="full"
        justifyContent="space-between"
        px="3.5"
        fontWeight="semibold"
        cursor="default"
        onClick={modal.onOpen}
        _active={{
          bg: "white",
        }}
        _hover={{
          bg: "white",
          borderColor: "gray.500",
        }}
        _focus={{
          borderColor: "purple.600",
          ring: "1px",
          ringColor: "purple.600",
        }}
        rightIcon={<Icon as={ChevronDownIcon} w="4" h="4" mr="-0.5" />}
      >
        {selectedItem ? (
          <Text>{selectedItem.name}</Text>
        ) : (
          <Text color="gray.400">Choose a role</Text>
        )}
      </Button>
      <Modal isOpen={modal.isOpen} onClose={modal.onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalBody>
            <Box h="3" />
            <Text fontSize="xl" fontWeight="extrabold" textAlign="center">
              Pick a role
            </Text>
            <Box h="7" />
            <Flex>
              <Input
                placeholder="Search for roles..."
                onChange={handleSearch}
              />
              <Box w="3" />
              <IconButton
                variant="outline"
                icon={<Icon as={ChevronLeftIcon} className="icon_stroke_1.75" w="5" h="5" />}
                isDisabled={page === 1}
              />
              <Box w="3" />
              <IconButton
                variant="outline"
                icon={<Icon as={ChevronRightIcon} className="icon_stroke_1.75" w="5" h="5" />}
                isDisabled={page * perPage >= total}
              />
            </Flex>
            {isLoading && (
              <Stack alignItems="center" justifyContent="center" h="16" mt="7">
                <CircularProgress isIndeterminate size="9" />
              </Stack>
            )}
            {!isLoading && data.length === 0 && (
              <Stack alignItems="center" justifyContent="center" h="16" mt="7">
                <Text color="gray.500" textAlign="center">No data found.</Text>
              </Stack>
            )}
            {!isLoading && data.length > 0 && (
              <>
                <Box h="7" />
                <SimpleGrid columns="1" gap="0">
                  {data.map(item => (
                    <Item key={item.id} data={item} selectedData={selectedItem} onClick={handleItemClick} />
                  ))}
                </SimpleGrid>
              </>
            )}
            <Box h="5" />
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  )
}

const Item = ({ data, selectedData, onClick }) => {
  return (
    <Button
      h="12"
      variant="ghost"
      justifyContent="flex-start"
      rightIcon={selectedData && data.id === selectedData.id ? <Icon as={CheckIcon} w="5" h="5" /> : null}
      color={selectedData && data.id === selectedData.id ? "purple.700" : "gray.700"}
      isFullWidth
      fontWeight="semibold"
      _hover={{
        bg: "gray.50",
        color: "gray.700",
      }}
      onClick={() => onClick(data)}
    >
      <Text flex="1" textAlign="left">
        {data.name}
      </Text>
    </Button>
  )
}

export default RolePicker
