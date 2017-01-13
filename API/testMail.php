<?php
$to      = 'adardesign@gmail.com';
$subject = 'the subject';
$message = 'hello';
$headers = 'From: webmaster@shibolet.com' . "\r\n" .
    'Reply-To: webmaster@shibolet.com' . "\r\n" .
    'X-Mailer: PHP/' . phpversion();

mail($to, $subject, $message, $headers);
?> 
