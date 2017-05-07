<?
session_start();
$_SESSION['lastRow'] = 0;

$jumps = 10;
$system = 0; 
$sec = 7; 
if (filter_var($_GET['system'], FITLTER_VALIDATE_INT) === false || filter_var($_GET['system'], FITLTER_VALIDATE_INT) === 0 ) {
    echo("sys");
    exit;
}

if (!filter_input(INPUT_GET, "jumps", FILTER_VALIDATE_INT)) {
   echo("jumps");
   exit;
}

if (!filter_input(INPUT_GET, "sec", FILTER_VALIDATE_INT) || $_GET['sec'] > 7 || $_GET['sec'] <1 ) {
  echo("sec");
  exit;
}

if($_GET['jumps'] <= 14 && $_GET['jumps'] > 0){
  $jumps = $_GET['jumps'];
}

$system = $_GET['system'];
$sec = $_GET['sec'];


#$querySum = $system."-".$jumps."-".$sec;
$querySum="30045306-14-7";
if(file_exists("../cache/".$querySum)){
        echo file_get_contents("../cache/".$querySum);
        exit;
}



$fp = fsockopen("localhost", 6969, $errno, $errstr, 30);
$returnJson = "";
if (!$fp) {
    echo "$errstr ($errno)<br />\n";
} else {
    $msg = $system." ".$jumps;
    fwrite($fp, $msg);
    while (!feof($fp)) {
        $returnJson .= fgets($fp, 128);
    }
    fclose($fp);
}

$cacheFile = fopen("../cache/".$querySum,"w");
fwrite($cacheFile,$returnJson);
fclose($cacheFile);

echo $returnJson;

?>
