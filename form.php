<?php
// Required headers to return JSON
header('Content-Type: application/json; charset=UTF-8');

// Check if form data is sent
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    // Get inputs safely
    $name    = htmlspecialchars($_POST['name']);
    $email   = htmlspecialchars($_POST['email']);
    $subject = htmlspecialchars($_POST['subject']);
    $message = htmlspecialchars($_POST['message']);

    // Receiver email (put your real email here)
    $to = "m_redouane@estin.dz";  // ⚠️ استبدلها بإيميلك الحقيقي
    $headers = "From: $name <$email>\r\n";
    $headers .= "Reply-To: $email\r\n";
    $headers .= "Content-Type: text/plain; charset=UTF-8\r\n";

    $body  = "الاسم: $name\n";
    $body .= "البريد الإلكتروني: $email\n";
    $body .= "الموضوع: $subject\n\n";
    $body .= "الرسالة:\n$message\n";

    // Try sending
    if (mail($to, $subject, $body, $headers)) {
        echo json_encode(["status" => "success"]);
    } else {
        echo json_encode(["status" => "error", "message" => "تعذر إرسال الرسالة. تحقق من إعدادات السيرفر."]);
    }
} else {
    echo json_encode(["status" => "error", "message" => "طلب غير صالح"]);
}
?>

