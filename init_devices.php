<?php

require 'inc/config.php';
require 'inc/class.db.php';
require 'nest-api-master/nest.class.php';

define('USERNAME', $config['nest_user']);
define('PASSWORD', $config['nest_pass']);
date_default_timezone_set($config['local_tz']);

$nest = new Nest();
try {
$db = new DB($config);
$devices= $nest->getDevices();
if ($stmt = $db->res->prepare("INSERT INTO devices (serial,name) VALUES (?,?) ON DUPLICATE KEY UPDATE name=?")) {
    foreach($devices as $serial) {
        $name = $nest->getDeviceFriendlyName($serial);
        $stmt->bind_param("sss", $serial, $name, $name);
        $stmt->execute();
    }
    $stmt->close();
}
$db->close();
} catch (Exception $e) {
  $errors[] = ("DB connection error! <code>" . $e->getMessage() . "</code>.");
}
?>
