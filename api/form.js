import nodemailer from "nodemailer";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ status: "error", message: "Only POST allowed" });
  }

  const { name, email, subject, message } = req.body;

  if (!name || !email || !subject || !message) {
    return res.status(400).json({ status: "error", message: "All fields are required" });
  }

  try {
    let transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    let mailOptions = {
      from: `"${name}" <${email}>`,
      to: "contact@bac-story.com",
      subject,
      text: `الاسم: ${name}\nالبريد الإلكتروني: ${email}\nالموضوع: ${subject}\n\n${message}`,
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({ status: "success" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: "error", message: "Failed to send email" });
  }
}
