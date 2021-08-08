import { Box, Button, FormControl, FormHelperText, Input, useToast } from "@chakra-ui/react"
import { useFormik } from "formik"
import { useRouter } from "next/router"
import { AuthLayout } from "src/client/components"
import { apiClient, setAccessToken, setRefreshToken, sleep } from "src/client/lib"
import * as yup from "yup"

const validationSchema = yup.object().shape({
  name: yup.string().required("This field is required"),
  password: yup.string().required("This field is required"),
})

const ConfirmInvitation = () => {
  const router = useRouter()
  const toast = useToast({ position: "top", variant: "top-accent", duration: 2500 })
  const formik = useFormik({
    initialValues: { email: "", password: "" },
    validationSchema,
    onSubmit: async (values) => {
      await sleep(500)

      const data = { ...values, token: router.query.token }

      let result
      try {
        result = await apiClient.post("/invite/confirm", data)
      } catch (error) {
        return toast({
          title: "Failed to confirm invitation",
          description: "The token might be invalid or expired.",
          status: "error",
        })
      }

      setAccessToken(result.data.access_token)
      setRefreshToken(result.data.refresh_token)
      window.location.reload()
    }
  })

  return (
    <Box
      as="form"
      onSubmit={formik.handleSubmit}
      w="full"
    >
      <Box h="10" />
      <FormControl id="name">
        <Input
          autoFocus
          autoComplete="off"
          name="name"
          isInvalid={formik.touched.name && formik.errors.name}
          value={formik.values.name}
          onBlur={formik.handleBlur}
          onChange={formik.handleChange}
          placeholder="Your name"
        />
        {formik.touched.name && formik.errors.name && (
          <FormHelperText color="red.600">{formik.errors.name}</FormHelperText>
        )}
        <Box h="5" />
      </FormControl>
      <FormControl id="password">
        <Input
          name="password"
          type="password"
          isInvalid={formik.touched.password && formik.errors.password}
          value={formik.values.password}
          onBlur={formik.handleBlur}
          onChange={formik.handleChange}
          placeholder="Password"
        />
        {formik.touched.password && formik.errors.password && (
          <FormHelperText color="red.600">{formik.errors.password}</FormHelperText>
        )}
        <Box h="7" />
      </FormControl>
      <Button
        type="submit"
        isFullWidth
        isLoading={formik.isSubmitting}
      >
        Confirm
      </Button>
      <Box h="1.5" />
    </Box>
  )
}

const getLayout = (page) => (
  <AuthLayout
  title="Confirm Invitation"
  description="We need additional information to complete this process"
  >
    {page}
  </AuthLayout>
)

ConfirmInvitation.getLayout = getLayout

export default ConfirmInvitation
