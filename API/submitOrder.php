

<?php

$orderData = ""; 
$orderData = isset($_POST['orderData']) ? $_POST['orderData'] : '';
$orderData = !empty($_POST['orderData']) ? $_POST['orderData'] : '';

echo $orderData;
// $prettyOrderData = json_encode($orderData, JSON_PRETTY_PRINT);
// echo "==================================================";
// echo $prettyOrderData;

$json = json_decode($orderData, true);
//$json = json_decode($orderData, true);

$orderSummary = $json['orderSummaryString'];
$orderSummaryString = "Shibolet New Order Submitted:\n";
foreach($orderSummary as $line){
   $orderSummaryString .= "\n Id: " . $line['id']."\t\t Qty: ".$line['qty']. "\tPrice: $".$line['price']."\t\t ". $line['comment'];
  }

$orderDetailString = "";
foreach($orderDetail as $detailLine){
   $orderDetailString .= "\n " . $detailLine[];
  }

//$orderDetailStr = var_dump($orderDetail);



$to      = 'adardesign@gmail.com';
$subject = 'New Order';
$message = $orderSummaryString . "\n" .$orderDetailStr;
$headers = 'From: webmaster@shibolet.com' . "\r\n" .
    'Reply-To: webmaster@shibolet.com' . "\r\n" .
    'X-Mailer: PHP/' . phpversion();

mail($to, $subject, $message, $headers);
?> 


