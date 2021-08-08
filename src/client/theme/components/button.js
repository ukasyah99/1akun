const Button = {
  baseStyle: {
    fontWeight: "bold",
    letterSpacing: "inherit",
    _focus: {
      boxShadow: "none",
    },
  },
  variants: {
    solid: {
      bg: "purple.600",
      color: "white",
      _focus: {
        bg: "purple.700",
      },
      _hover: {
        bg: "purple.700",
        _disabled: {
          bg: "purple.700",
        }
      },
      _active: {
        bg: "purple.600",
      },
    },
    outline: {
      color: "gray.600",
      borderColor: "gray.400",
    },
  }
}

export default Button
