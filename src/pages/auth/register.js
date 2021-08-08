import { Box, Button, FormControl, FormHelperText, Input, useToast } from "@chakra-ui/react"
import { useFormik } from "formik"
import { useRouter } from "next/router"
import { AuthLayout } from "src/client/components"
import { apiClient, sleep } from "src/client/lib"
import * as yup from "yup"

const validationSchema = yup.object().shape({
  name: yup.string().required("This field is required"),
  email: yup.string().email("This field must be a valid email").required("This field is required"),
  password: yup.string().required("This field is required"),
  password_repeat: yup.string().required("This field is required"),
})

const Register = () => {
  const router = useRouter()
  const toast = useToast({ position: "top", variant: "top-accent", duration: 2500 })
  const formik = useFormik({
    initialValues: { name: "", email: "", password: "", password_repeat: "" },
    validationSchema,
    onSubmit: async (values) => {
      const data = { ...values, role_id: router.query.role_id }
      await sleep(500)

      try {
        await apiClient.post("/auth/register", data)
      } catch (error) {
        return toast({
          title: "Failed to register",
          description: "You can't proceed if the role does not open registration.",
          status: "error",
        })
      }

      router.push("/info/verify-your-email")
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
          placeholder="Name"
        />
        {formik.touched.name && formik.errors.name && (
          <FormHelperText color="red.600">{formik.errors.name}</FormHelperText>
        )}
        <Box h="5" />
      </FormControl>
      <FormControl id="email">
        <Input
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
      <FormControl id="password_repeat">
        <Input
          name="password_repeat"
          isInvalid={formik.touched.password_repeat && formik.errors.password_repeat}
          value={formik.values.password_repeat}
          onBlur={formik.handleBlur}
          onChange={formik.handleChange}
          placeholder="Repeat password"
          type="password"
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
        Register
      </Button>
      <Box h="2.5" />
    </Box>
  )
}

const getLayout = (page) => (
  <AuthLayout
    title="Register to 1Akun"
    description="You're going to create a new account"
  >
    {page}
  </AuthLayout>
)

Register.getLayout = getLayout

export default Register
