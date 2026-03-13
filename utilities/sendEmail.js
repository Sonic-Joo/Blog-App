const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

module.exports = async (userEmail, subject, htmlTemplate) => {
  try {
    const mailOption = {
      from: process.env.EMAIL_USER,
      to: userEmail,
      subject: subject,
      html: htmlTemplate,
    };

    const info = await transporter.sendMail(mailOption);
    console.log("Email Sent:", info.response);
    return info;
  } catch (error) {
    console.error("Email Service Error Details:", error);
    throw new Error(error.message || "Email Service Error");
  }
};
