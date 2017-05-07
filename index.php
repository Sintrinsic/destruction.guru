<?php
session_start();
$_SESSION['lastRow'] = 0;
?>
<html>
<head>
<title>Destruction.guru - A real-time EVE online tactical map</title>
<meta name="description" content="A real-time tactical map for EVE online, with system info, killmails, and fleet size data. ">
<meta name="robots" content="index,follow">
<link rel="shortcut icon" type="image/x-icon" href="favicon.png" />
<link href="https://fonts.googleapis.com/css?family=Orbitron" rel="stylesheet">
<link href="https://fonts.googleapis.com/css?family=Oswald" rel="stylesheet">
<link rel="stylesheet" type="text/css" href="scripts/3rdParty/jquery.qtip.min.css">
<script src="https://ajax.googleapis.com/ajax/libs/jquery/1.12.4/jquery.min.js"></script>
<script type="text/javascript" src="scripts/3rdParty/jquery.qtip.min.js"></script>
<link rel="stylesheet" type="text/css" href="scripts/jquery-ui-1.12.1.custom/jquery-ui.min.css">
<script type="text/javascript" src="scripts/jquery-ui-1.12.1.custom/jquery-ui.min.js"></script>
<link rel="stylesheet" type="text/css" href="scripts/jquery-ui-1.12.1.custom/jquery-ui.structure.min.css">
<link rel="stylesheet" type="text/css" href="scripts/jquery-ui-1.12.1.custom/jquery-ui.theme.min.css">
<script type="text/javascript" src="scripts/3rdParty/sumoSelect/jquery.sumoselect.min.js"></script>
<link rel="stylesheet" type="text/css" href="scripts/3rdParty/sumoSelect/sumoselect.css">
<script type="text/javascript" src="scripts/3rdParty/js.cookie.js"></script>
<script type="text/javascript" src="scripts/miscFunctions.js"></script>
<script type="text/javascript" src="scripts/classes.js"></script>
<script src="scripts/source.js"></script>
<link rel="stylesheet" type="text/css" href="style.css">
</head>
<body>
<div id="header">
   <div id="navBar">
      <span id="logo"><img src="img/blap.png" style="width:20px;height:20px;">DESTRUCTION.GURU</span>
      <span id="help"> ?</span>
      <span id="notice" style="font-size:8pt; letter-spacing:1px;"> Backend offline, and killboard feed no longer running. Frontend left online for portfolio purposes only. </span> 
      <div id="mapSelection">
        <div id="mapGenToolJumps" class="mapgenTool" style="display:none;">
			system 
			<input name="systemSelection" id="mapSystem" class="mapSystem" value="Jita">
			&nbsp; &nbsp; jumps 
			<input id="mapJumps" class="smallInput" type="text" value="5"> 
			<select id="genToolJumpsSelect" multiple="multiple">
				<option value="High">High</option>
				<option value="Low">Low</option>
				<option value="Null">Null</option> 
			</select>
			<script>	$("#genToolJumpsSelect").SumoSelect({placeholder: 'Sec', selectAll: true});</script>
			<button value="GET MAP" id="getMap" onClick="getNewMap()">
				GET MAP
			</button>
		 </div>
      </div>
   </div>
</div>
<div id="content">
    <div id="mapContainer">
    
    </div>
    <div id="properties">
        <div id="infoHeader" class="propHeader">system info</div>
        <div id="sysInfo">click a system</div>
        <div id="killHeader" class="propHeader">system kills</div>
        <div id="sysKills">
           <table id="killsContent">
              <tr><th style="width:80px;">attackers</th><th style="width:160px">ship</th><th>time</th></tr>  
           </table> 
        </div>
    </div>
</div>
</body>
</html>
