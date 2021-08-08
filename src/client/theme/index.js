import { extendTheme } from "@chakra-ui/react"
import components from "./components"
import fonts from "./fonts"
import styles from "./styles"

const theme = extendTheme({
  components,
  fonts,
  styles,
})

export default theme
