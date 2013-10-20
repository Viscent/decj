<?php
header("Content-Type: text/json");
header("X-Screen: UpdateRegInfo.htm");
header("X-JS: module/UpdateRegInfoStatic");
header("X-CSS: form.css;jsdp.css");
header("X-Resources: res/demo-basic;res/demo-explain");
header("X-MetaData-URL: handler.php?src=metaData.json");
$data=$_REQUEST['src'];
include dirname(__FILE__).'/'.$data;
?>