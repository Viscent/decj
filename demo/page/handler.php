<?php
header("Content-type:text/json"); 
$data=$_REQUEST['src'];
include dirname(__FILE__).'/'.$data;
?>
