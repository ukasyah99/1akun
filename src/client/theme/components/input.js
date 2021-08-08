const Input = {
  baseStyle: {
    field: {
      fontWeight: "semibold",
      letterSpacing: "wider",
    },
  },
  sizes: {
    md: {
      field: {
        px: "3.5",
      },
    },
  },
  variants: {
    outline: {
      field: {
        bg: "white",
        borderColor: "gray.400",
        _focus: {
          borderColor: "purple.600",
        },
        _hover: {
          borderColor: "gray.500",
        },
      },
    },
  },
}

export default Input
