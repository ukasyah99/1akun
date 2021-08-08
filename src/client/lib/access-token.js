import Cookies from "js-cookie"

const _setAccessToken = (value) => {
  Cookies.set("UAT", value, {
    secure: process.env.NODE_ENV === "production",
  })
}

const _getAccessToken = () => {
  return Cookies.get("UAT")
}

const _removeAccessToken = () => {
  Cookies.remove("UAT")
}

export const setAccessToken = _setAccessToken
export const getAccessToken = _getAccessToken
export const removeAccessToken = _removeAccessToken
