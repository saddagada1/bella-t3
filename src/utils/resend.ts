import { Resend } from "resend";
import AccountVerification, {
  accountVerificationPlainText,
} from "~/components/emails/accountVerification";
import ForgotPassword, {
  forgotPasswordPlainText,
} from "~/components/emails/forgotPassword";
import { env } from "~/env.mjs";

export const resend = new Resend(env.RESEND_API_KEY);

export const sendAccountVerificationEmail = async (
  name: string,
  email: string,
  token: string,
) => {
  try {
    await resend.sendEmail({
      from: "Bella <accounts@bella.saivamsi.ca>",
      to: email,
      subject: "Bella - Account Verification",
      react: AccountVerification({
        name: name,
        token: token,
      }),
      text: accountVerificationPlainText(name, token),
    });
    return true;
  } catch (error) {
    return false;
  }
};

export const sendForgotPasswordEmail = async (
  name: string,
  email: string,
  token: string,
) => {
  try {
    await resend.sendEmail({
      from: "Bella <accounts@bella.saivamsi.ca>",
      to: email,
      subject: "Bella - Forgot Password",
      react: ForgotPassword({
        name: name,
        token: token,
      }),
      text: forgotPasswordPlainText(name, token),
    });
    return true;
  } catch (error) {
    return false;
  }
};
