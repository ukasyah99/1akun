import { Box, CircularProgress, SimpleGrid, Stack } from "@chakra-ui/react"
import { ClockIcon, UserIcon, UsersIcon } from "@heroicons/react/outline"
import { GroupRankingCard, LatestActivitiesCard, MainLayout, StatCard } from "src/client/components"
import { apiClient, sleep } from "src/client/lib"
import dayjs from "dayjs"
import relativeTime from "dayjs/plugin/relativeTime"
import { useEffect, useState } from "react"
import { unstable_batchedUpdates } from "react-dom"
import { useSelector } from "react-redux"

dayjs.extend(relativeTime)

const generateGroupRankingData = (data) => {
  const highest = data[0].total
  return data.map((item) => ({
    label: item.name,
    percentage: item.total / highest * 100,
    value: item.total,
  }))
}

const Home = () => {
  const { user, loginSince } = useSelector(s => s.auth)
  const [data, setData] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!isLoading || !user) return

    const fetchData = async () => {
      await sleep(500)

      let result
      try {
        const path = user.role_id === 1 ? "/dashboard" : `/users/${user.id}/dashboard`
        result = await apiClient.get(path)
      } catch (error) {
        return console.log(error)
      }

      unstable_batchedUpdates(() => {
        setIsLoading(false)
        setData(result.data)
      })
    }
    fetchData()
  }, [isLoading, user])

  return (
    <>
      {isLoading && (
        <Stack alignItems="center" my="12">
          <CircularProgress isIndeterminate size="10" />
        </Stack>
      )}
      {!isLoading && data && (
        <>
          <SimpleGrid columns={{ base: "1", md: "2", xl: "4" }} gap="5">
            <StatCard icon={UsersIcon} label="Total users" value={data.total_users} />
            <StatCard icon={UsersIcon} label="Total roles" value={data.total_roles} />
            <StatCard icon={UserIcon} label="Total activities" value={data.total_activities} />
            <StatCard icon={ClockIcon} label="My login session" value={dayjs(loginSince).fromNow(true)} />
          </SimpleGrid>
          <Box h="7" />
          <SimpleGrid columns={{ base: "1", xl: "2" }} gap="5">
            <GroupRankingCard
              title="Number of users per role"
              items={generateGroupRankingData(data.total_users_per_role)}
            />
            <LatestActivitiesCard
              items={data.latest_activities}
            />
          </SimpleGrid>
        </>
      )}
    </>
  )
}

const getLayout = (page) => (
  <MainLayout title="Dashboard">
    {page}
  </MainLayout>
)

Home.getLayout = getLayout

export default Home
