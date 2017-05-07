<?php
session_start();
$host = '127.0.0.1';
$db   = 'dest_eve';
$user = 'dest_eve';
$pass = 'SuperStrong!';
$charset = 'utf8';

$dsn = "mysql:host=$host;dbname=$db;charset=$charset";
$opt = [
    PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    PDO::ATTR_EMULATE_PREPARES   => false,
];
$db = new PDO($dsn, $user, $pass, $opt);
if(!array_key_exists("lastRow",$_SESSION)){
   $_SESSION['lastRow'] = 0; 	
}

$killsQuery = $db->query("SELECT rowID, killID, systemID, systemName, attackers, ship, UNIX_TIMESTAMP(time) as time FROM `me_kills` WHERE rowID between ".$_SESSION['lastRow']." and 4294967295 order by rowID;");
$outArray = array();
while($row = $killsQuery->fetch()){
	$outArray[] = $row;
	$_SESSION['lastRow'] = $row['rowID']+1;
}

echo json_encode($outArray);


?>   
