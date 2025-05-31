<?php
header('Content-Type: application/json; charset=utf-8');

// Set your email address here
$to = "info@bacstory.com";

// Get form data
$name = $_POST['name'] ?? '';
$email = $_POST['email'] ?? '';
$subject = $_POST['subject'] ?? '';
$message = $_POST['message'] ?? '';

// Validate input
if (empty($name) || empty($email) || empty($subject) || empty($message)) {
    echo json_encode([
        'status' => 'error',
        'message' => 'يرجى ملء جميع الحقول المطلوبة.'
    ]);
    exit;
}

// Validate email format
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    echo json_encode([
        'status' => 'error',
        'message' => 'البريد الإلكتروني غير صحيح.'
    ]);
    exit;
}

// Prepare email content
$email_subject = "رسالة جديدة من $name: $subject";
$email_content = "الاسم: $name\n";
$email_content .= "البريد الإلكتروني: $email\n";
$email_content .= "الموضوع: $subject\n\n";
$email_content .= "الرسالة:\n$message\n";

// Set email headers
$headers = "From: $name <$email>\r\n";
$headers .= "Reply-To: $email\r\n";
$headers .= "Content-Type: text/plain; charset=UTF-8\r\n";

// Send email
if (mail($to, $email_subject, $email_content, $headers)) {
    echo json_encode([
        'status' => 'success',
        'message' => 'تم إرسال رسالتك بنجاح! سنتواصل معك قريباً.'
    ]);
} else {
    echo json_encode([
        'status' => 'error',
        'message' => 'حدث خطأ أثناء إرسال الرسالة. يرجى المحاولة مرة أخرى.'
    ]);
}
?>