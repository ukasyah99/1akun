import { Box, Button, FormControl, FormHelperText, Input, Link, useToast } from "@chakra-ui/react"
import { useFormik } from "formik"
import NextLink from "next/link"
import { useRouter } from "next/router"
import { AuthLayout } from "src/client/components"
import { apiClient, sleep } from "src/client/lib"
import * as yup from "yup"

const validationSchema = yup.object().shape({
  email: yup.string().email("This field must be a valid email").required("This field is required"),
})

const ForgotPassword = () => {
  const router = useRouter()
  const toast = useToast({ position: "top", variant: "top-accent", duration: 2500 })
  const formik = useFormik({
    initialValues: { email: "" },
    validationSchema,
    onSubmit: async (values) => {
      await sleep(500)

      let result
      try {
        result = await apiClient.post("/auth/forgot-password", values)
      } catch (error) {
        return toast({
          title: "Failed to submit email",
          description: "Your email might be invalid or not registered.",
          status: "error",
        })
      }

      router.push("/info/password-reset-link-sent")
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
      <Button
        type="submit"
        isFullWidth
        isLoading={formik.isSubmitting}
      >
        Send link
      </Button>
      <Box h="3" />
      <Box textAlign="center">
        <NextLink href="/auth/login" passHref>
          <Link>
            I want to login instead
          </Link>
        </NextLink>
      </Box>
      <Box h="1.5" />
    </Box>
  )
}

const getLayout = (page) => (
  <AuthLayout
  title="Forgot Password"
  description="We'll send you a link to reset your password"
  >
    {page}
  </AuthLayout>
)

ForgotPassword.getLayout = getLayout

export default ForgotPassword
