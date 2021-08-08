import { Box, HStack, Icon, IconButton, Text } from "@chakra-ui/react"
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/outline"

const Pagination = (props) => {
  const { page, perPage, total, onChange } = props

  const lastNo = page * perPage >= total ? total : page * perPage
  const firstNo = (page - 1) * perPage + 1

  return (
    <HStack>
      <Text
        display={{ base: "none", sm: "block" }}
      >
        Showing {firstNo} - {lastNo} of {total} items
      </Text>
      <Box flex="1" />
      <IconButton
        variant="outline"
        icon={<Icon as={ChevronLeftIcon} w="5" h="5" />}
        isDisabled={page === 1}
        onClick={() => onChange(page - 1)}
      />
      <IconButton
        variant="outline"
        icon={<Icon as={ChevronRightIcon} w="5" h="5" />}
        isDisabled={page * perPage >= total}
        onClick={() => onChange(page + 1)}
      />
      <Box flex="1" display={{ base: "block", sm: "none" }} />
    </HStack>
  )
}

export default Pagination
