

<?php

//$orderData = '{"orderSummaryString":{"honey0":{"id":"honey0","price":"41.6","title":"honey 0","qty":"33", "comment":"eeee"},"honey1":{"id":"honey1","price":"45.9","title":"honey 1","qty":"1"},"honey2":{"id":"honey2","price":"48","title":"honey 2","qty":"1"},"honey5":{"id":"honey5","price":"64.2","title":"honey 5","qty":"1"},"nuts5":{"id":"nuts5","price":"64.2","title":"nuts 5","qty":"1"}},"orderDetailString":{"company":"American Pen, LLC","name":"Benny Farkas","email":"adardesign@gmail.com","customer-address":"1164 44th Street"}}';


$orderData = ""; 
$orderData = isset($_POST['orderData']) ? $_POST['orderData'] : '';
$orderData = !empty($_POST['orderData']) ? $_POST['orderData'] : '';


$json = json_decode($orderData, true);
//$json = json_decode($orderData, true);
//echo $json;

$message = '<html><body>';
$message .= "<h1>Shibolet New Order Submitted</h1>";

$message .= '<table cellpadding="10">';

$orderSummary = $json['orderSummaryString'];
$key =  "";
$item = "";
foreach($orderSummary as $key => $item){
   $message .= "<tr> <td> Id: " . $item['id'] ."</td><td> Qty: ". $item['qty']. "</td><td> Price: $".$item['price']."</td> <td> ". (isset($item['comment']) ? $item['comment'] :"") ."</td></tr>";
  };
$message .= '</table>';



$orderDetail = $json['orderDetailString'];

$message .= "<ul>";
foreach($orderDetail as $key => $values ){
   $message .= "<li>" . $key . " : ". $values . "</li>";
 }
$message .= "</ul>";


echo $message;

			$headers = "From: " . "webmaster@shibolet.com" . "\r\n";
			$headers .= "MIME-Version: 1.0\r\n";
			$headers .= "Content-Type: text/html; charset=ISO-8859-1\r\n";

$to      = 'adardesign@gmail.com';
$subject = 'New Order';

mail($to, $subject, $message, $headers);
?> 



