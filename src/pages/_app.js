import { ChakraProvider } from "@chakra-ui/react"
import "@fontsource/nunito-sans/600.css"
import "@fontsource/nunito-sans/700.css"
import "@fontsource/nunito-sans/800.css"
import { Provider } from "react-redux"
import { store } from "src/client/redux"
import "src/client/styles/globals.css"
import theme from "src/client/theme"

function MyApp({ Component, pageProps }) {
  const getLayout = Component.getLayout || (page => page)

  return (
    <Provider store={store}>
      <ChakraProvider theme={theme}>
        {getLayout(<Component {...pageProps} />)}
      </ChakraProvider>
    </Provider>
  )
}

export default MyApp
