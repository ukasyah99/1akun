import { Box, Button, FormControl, FormHelperText, Input, Link, useToast } from "@chakra-ui/react"
import { useFormik } from "formik"
import NextLink from "next/link"
import { AuthLayout } from "src/client/components"
import { apiClient, setAccessToken, setRefreshToken, sleep } from "src/client/lib"
import * as yup from "yup"

const validationSchema = yup.object().shape({
  email: yup.string().email("This field must be a valid email").required("This field is required"),
  password: yup.string().required("This field is required"),
})

const Login = () => {
  const toast = useToast({ position: "top", variant: "top-accent", duration: 2500 })
  const formik = useFormik({
    initialValues: { email: "", password: "" },
    validationSchema,
    onSubmit: async (values) => {
      await sleep(500)

      let result
      try {
        result = await apiClient.post("/auth/login", values)
      } catch (error) {
        return toast({
          title: "Invalid email or password",
          description: "Check your submitted form and try again.",
          status: "error",
        })
      }

      setAccessToken(result.data.acces_token)
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
      <FormControl id="email">
        <Input
          autoFocus
          autoComplete="off"
          name="email"
          isInvalid={formik.touched.email && formik.errors.email}
          value={formik.values.email}
          onBlur={formik.handleBlur}
          onChange={formik.handleChange}
          placeholder="Email"
        />
        {formik.touched.email && formik.errors.email && (
          <FormHelperText color="red.600">{formik.errors.email}</FormHelperText>
        )}
        <Box h="5" />
      </FormControl>
      <FormControl id="password">
        <Input
          name="password"
          isInvalid={formik.touched.password && formik.errors.password}
          value={formik.values.password}
          onBlur={formik.handleBlur}
          onChange={formik.handleChange}
          placeholder="Password"
          type="password"
        />
        {formik.touched.password && formik.errors.password && (
          <FormHelperText color="red.600">{formik.errors.password}</FormHelperText>
        )}
        <Box h="5" />
      </FormControl>
      <Button
        type="submit"
        isFullWidth
        isLoading={formik.isSubmitting}
      >
        Login
      </Button>
      <Box h="3" />
      <Box textAlign="center">
        <NextLink href="/auth/forgot-password" passHref>
          <Link>
            Forgot password?
          </Link>
        </NextLink>
      </Box>
      <Box h="1.5" />
    </Box>
  )
}

const getLayout = (page) => (
  <AuthLayout
    title="Login to 1Akun"
    description="You need to login to proceed"
  >
    {page}
  </AuthLayout>
)

Login.getLayout = getLayout

export default Login
