import Cookies from "js-cookie"

const _setRefreshToken = (value) => {
  Cookies.set("URT", value, {
    expires: 30, // 1 month
    secure: process.env.NODE_ENV === "production",
  })
}

const _getRefreshToken = () => {
  return Cookies.get("URT")
}

const _removeRefreshToken = () => {
  Cookies.remove("URT")
}

export const setRefreshToken = _setRefreshToken
export const getRefreshToken = _getRefreshToken
export const removeRefreshToken = _removeRefreshToken
