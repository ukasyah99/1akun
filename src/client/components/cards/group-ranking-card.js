import { Box, HStack, Progress, Stack, Text } from "@chakra-ui/react"

const GroupRankingCard = ({ title, items }) => {
  return (
    <Box
      rounded="lg"
      px="4"
      py="4"
      borderWidth="1px"
      borderColor="gray.300"
      shadow="md"
      alignSelf="flex-start"
    >
      <Text color="gray.500" fontWeight="bold">
        {title}
      </Text>
      <Box h="5" />
      <Stack>
        {items.map((item, i) => (
          <Box key={i}>
            <Box h="1" />
            <HStack>
              <Text fontWeight="bold" flex="1" isTruncated>
                {item.label}
              </Text>
              <Text color="gray.500" fontWeight="bold">
                {item.value}
              </Text>
            </HStack>
            <Box h="1.5" />
            <Progress h="1" value={item.percentage} rounded="full" />
            <Box h="3" />
          </Box>
        ))}
      </Stack>
    </Box>
  )
}

export default GroupRankingCard
