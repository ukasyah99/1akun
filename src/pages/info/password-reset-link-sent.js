import { InfoLayout } from "src/client/components"

const PasswordResetLinkSent = () => {
  return (
    <></>
  )
}

const getLayout = (page) => (
  <InfoLayout
    title="Check Your Inbox"
    description="We've send a link to your email account. Follow the instructions listed there."
  />
)

PasswordResetLinkSent.getLayout = getLayout

export default PasswordResetLinkSent
