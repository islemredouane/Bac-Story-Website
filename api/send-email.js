import nodemailer from "nodemailer";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ status: "error", message: "طلب غير صالح" });
  }

  const { name, email, subject, message } = req.body;

  try {
    // Create transporter (example: Gmail SMTP)
    let transporter = nodemailer.createTransport({
      service: "gmail", // or "outlook", "yahoo", etc.
      auth: {
        user: process.env.EMAIL_USER, // put in Vercel Environment Variables
        pass: process.env.EMAIL_PASS,
      },
    });

    // Email content
    let info = await transporter.sendMail({
      from: `"${name}" <${email}>`,
      to: "m_redouane@estin.dz", // your email
      subject: subject,
      text: `
الاسم: ${name}
البريد الإلكتروني: ${email}
الموضوع: ${subject}

الرسالة:
${message}
      `,
    });

    console.log("Message sent:", info.messageId);
    res.status(200).json({ status: "success" });
  } catch (err) {
    console.error("Error sending email:", err);
    res
      .status(500)
      .json({ status: "error", message: "تعذر إرسال الرسالة. تحقق من الإعدادات." });
  }
}
