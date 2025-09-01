<?php
header('Content-Type: application/json; charset=UTF-8');

// Enable debugging while testing
error_reporting(E_ALL);
ini_set("display_errors", 1);

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    // Get inputs safely
    $name    = htmlspecialchars(trim($_POST['name'] ?? ''));
    $email   = filter_var($_POST['email'] ?? '', FILTER_VALIDATE_EMAIL);
    $subject = htmlspecialchars(trim($_POST['subject'] ?? ''));
    $message = htmlspecialchars(trim($_POST['message'] ?? ''));

    // Validate
    if (!$name || !$email || !$subject || !$message) {
        echo json_encode(["status" => "error", "message" => "الرجاء ملء جميع الحقول بشكل صحيح."]);
        exit;
    }

    $to = "m_redouane@estin.dz";  // ✨ استبدلها بإيميلك
    $headers = "From: noreply@estin.dz\r\n"; // safer: use your domain
    $headers .= "Reply-To: $email\r\n";
    $headers .= "Content-Type: text/plain; charset=UTF-8\r\n";

    $body  = "الاسم: $name\n";
    $body .= "البريد الإلكتروني: $email\n";
    $body .= "الموضوع: $subject\n\n";
    $body .= "الرسالة:\n$message\n";

    if (mail($to, $subject, $body, $headers)) {
        echo json_encode(["status" => "success", "message" => "تم إرسال الرسالة بنجاح ✅"]);
    } else {
        echo json_encode(["status" => "error", "message" => "فشل الإرسال. تحقق من إعدادات السيرفر أو جرب SMTP."]);
    }
} else {
    echo json_encode(["status" => "error", "message" => "طلب غير صالح"]);
}


