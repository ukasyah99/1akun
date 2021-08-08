import { InfoLayout } from "src/client/components"

const VerifyYourEmail = () => <></>

const getLayout = (page) => (
  <InfoLayout
    title="Verify Your Email Address"
    description="We've send a verification link to your email account. Follow the instructions listed there."
  />
)

VerifyYourEmail.getLayout = getLayout

export default VerifyYourEmail
