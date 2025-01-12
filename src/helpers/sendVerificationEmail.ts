import { resend } from "@/lib/resend";
import VerificationEmail from "../../emails/VerificationEmail";
import { ApiResponse } from "@/types/ApiResponse";

export async function sendVerificationEmail(
  email: string,
  username: string,
  verifycode: string
): Promise<ApiResponse> {
  try {
    const response = await resend.emails.send({
      from: "onboarding@resend.dev",
      to: process.env.TEST_MAIL!,
      subject: "Mystery message | Verification code ",
      react: VerificationEmail({ username, otp: verifycode }),
    });
    console.log("email sent successfully \n", response);
    return { success: true, message: "Verification email sent successfully" };
  } catch (emailError) {
    console.log("Error sending verification email ", emailError);
    return { success: false, message: "Failed to send verification email" };
  }
}
