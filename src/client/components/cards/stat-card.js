import { Box, Flex, Icon, Text } from "@chakra-ui/react"

const StatCard = ({ icon, label, value }) => {
  return (
    <Flex
      alignItems="center"
      rounded="lg"
      px="4"
      py="4"
      borderWidth="1px"
      borderColor="gray.300"
      shadow="md"
    >
      <Box p="2.5" rounded="lg" bg="gray.100" color="gray.600">
        <Icon
          as={icon}
          w="7"
          h="7"
          className="icon_stroke_1.75"
        />
      </Box>
      <Box w="3" />
      <Flex flexDirection="column" overflow="hidden">
        <Text color="gray.500" fontSize="sm" fontWeight="bold">
          {label}
        </Text>
        <Text fontSize="xl" fontWeight="bold" mt="-1" isTruncated>
          {value}
        </Text>
      </Flex>
    </Flex>
  )
}

export default StatCard
