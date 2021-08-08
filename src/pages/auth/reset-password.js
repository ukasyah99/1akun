import { Box, Button, FormControl, FormHelperText, Input, Link, useToast } from "@chakra-ui/react"
import { useFormik } from "formik"
import NextLink from "next/link"
import { useRouter } from "next/router"
import { AuthLayout } from "src/client/components"
import { apiClient, sleep } from "src/client/lib"
import * as yup from "yup"

const validationSchema = yup.object().shape({
  password: yup.string().required("This field is required"),
  password_repeat: yup.string().required("This field is required"),
})

const ForgotPassword = () => {
  const router = useRouter()
  const toast = useToast({ position: "top", variant: "top-accent", duration: 2500 })
  const formik = useFormik({
    initialValues: { password: "", password_repeat: "" },
    validationSchema,
    onSubmit: async (values) => {
      if (values.password !== values.password_repeat) {
        return toast({
          title: "Both passwords don't match",
          description: "Check password and repeat password and try again.",
          status: "error",
        })
      }

      const data = {
        ...values,
        token: router.query.token,
      }

      await sleep(500)

      try {
        await apiClient.post("/auth/reset-password", data)
      } catch (error) {
        return toast({
          title: "Failed to reset password",
          description: "This operation is not permitted due to invalid token.",
          status: "error",
        })
      }

      router.push("/auth/login")
    }
  })

  return (
    <Box
      as="form"
      onSubmit={formik.handleSubmit}
      w="full"
    >
      <Box h="10" />
      <FormControl id="password">
        <Input
          autoFocus
          autoComplete="off"
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
        <Box h="5" />
      </FormControl>
      <FormControl id="password_repeat">
        <Input
          autoComplete="off"
          name="password_repeat"
          type="password"
          isInvalid={formik.touched.password_repeat && formik.errors.password_repeat}
          value={formik.values.password_repeat}
          onBlur={formik.handleBlur}
          onChange={formik.handleChange}
          placeholder="Repeat password"
        />
        {formik.touched.password_repeat && formik.errors.password_repeat && (
          <FormHelperText color="red.600">{formik.errors.password_repeat}</FormHelperText>
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
        <NextLink href="/auth/forgot-password" passHref>
          <Link>
            Back to forgot password
          </Link>
        </NextLink>
      </Box>
      <Box h="1.5" />
    </Box>
  )
}

const getLayout = (page) => (
  <AuthLayout
    title="Reset Password"
    description="Change your password immediately"
  >
    {page}
  </AuthLayout>
)

ForgotPassword.getLayout = getLayout

export default ForgotPassword
