import User from "@/models/userModel";
import nodemailer from "nodemailer";
import bcryptjs from "bcryptjs";

export const sendEmail = async({email, emailType, userId} : any) => {
  try {
    const hashedToken = await bcryptjs.hash(userId.toString(), 10)

    if(emailType === 'VERIFY'){
      await User.findByIdAndUpdate(userId,
        {verifyToken: hashedToken, verifiedTokenExpiry: Date.now() + 3600000})
    } else if(emailType === "RESET"){
      await User.findByIdAndUpdate(userId,
        {forgetPasswordToken: hashedToken, forgetPasswordTokenExpiry: Date.now() + 3600000})
    }

    var transport = nodemailer.createTransport({
      host: "sandbox.smtp.mailtrap.io",
      port: 2525,
      auth: {
        user: "643bae49ed1cf6", //😇
        pass: "f6305d9a569868" //😇
      }
    });
  
    const mailOptions = {
      from: 'neeraj.shekhawat2022@gmail.com', // sender address
      to: email, // list of receivers
      subject: emailType === 'VERIFY' ? 'Verify your email' : 'Reset your password', // Subject line
      html: `<p>Click <a href="${process.env.DOMAIN}/verifyemail?token=${hashedToken}">here</a> to ${emailType === "VERIFY" ? "verify your email" : "reset your password"}
            or copy and paste the link below in your browser. <br> ${process.env.DOMAIN}/verifyemail?token=${hashedToken}
            </p>`
    }
  
    const mailResponse = await transport.sendMail(mailOptions);
    return mailResponse

  } catch (error: any) {
    throw new Error(error.message)
  }
  
}