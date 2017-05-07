function getGET(sParam) {
    var sPageURL = decodeURIComponent(window.location.search.substring(1)),
        sURLVariables = sPageURL.split('&'),
        sParameterName,
        i;

    for (i = 0; i < sURLVariables.length; i++) {
        sParameterName = sURLVariables[i].split('=');

        if (sParameterName[0] === sParam) {
            return sParameterName[1] === undefined ? true : sParameterName[1];
        }
    }
};

function getNewMap(){
     var selectedSystem = $("#mapSystem").val();
     var selectedJumps = $("#mapJumps").val();

	 if(!(selectedSystem in window.systemNames) || ! /[0-9]+/.test(selectedJumps)){
		 alert("Pick a correct system name and jump count.");
	 }else{
	 	window.location.search = "?system="+selectedSystem+"&jumps="+selectedJumps;
		getMap(); 
	 }
}

function bindZoom(){
	$('#map').bind('mousewheel DOMMouseScroll MozMousePixelScroll', function(e){
        var delta = parseInt(e.originalEvent.wheelDelta || -e.originalEvent.detail)		
		var zoomSpeed = 10;
		var compMod = 2;
		if(delta /120 > 0 && ! isNaN(delta)) {
		    var vb = mapElement.getAttribute("viewBox").split(" ");
			if(vb[2] > (blapMap.winX/2)){
				vb[0] = parseInt(vb[0]) + (zoomSpeed/compMod);
				vb[1] = parseInt(vb[1]) + (zoomSpeed/compMod);
				vb[2] = parseInt(vb[2]) - zoomSpeed;
				vb[3] = parseInt(vb[3]) - zoomSpeed
				window.mapElement.setAttribute("viewBox", vb.join(" "));				
			}
		}else if(delta/120 < 0 && ! isNaN(delta)){
		    var vb = mapElement.getAttribute("viewBox").split(" ");
			if(vb[2] < (blapMap.winX*1.25)){
				vb[0] = parseInt(vb[0]) - (zoomSpeed/compMod);
				vb[1] = parseInt(vb[1]) - (zoomSpeed/compMod);
				vb[2] = parseInt(vb[2]) + zoomSpeed;
				vb[3] = parseInt(vb[3]) + zoomSpeed;
			}
	  		window.mapElement.setAttribute("viewBox", vb.join(" "));			}
    });	
}


$.fn.attachDragger = function(){
    var attachment = false, lastPosition, position, difference;
	count = 6; 

    $( $(this).selector ).on("mousedown mouseup mousemove",function(e){
        if( e.type == "mousedown" ){
			 attachment = true;
			 lastPosition = [e.clientX, e.clientY];
		}
        if( e.type == "mouseup" ){
			attachment = false;
		}
		// calm down. I'm not sabotaging your favorite browser. There's a bug in FF that makes graphical repaints slow. It responds faster when you skip some repaints. 
        if( e.type == "mousemove" && attachment == true && count > browserHandicap ){
			count = 0;
            position = [e.clientX, e.clientY];
			var vb = mapElement.getAttribute("viewBox").split(" ");
			vb[0] -= (position[0]-lastPosition[0]);
			vb[1] -= (position[1]-lastPosition[1]);
			window.mapElement.setAttribute("viewBox", vb.join(" "));
            lastPosition = [e.clientX, e.clientY];
        }
		count ++;
    });
    $(window).on("mouseup", function(){
        attachment = false;

    });
}

function getSysOptions(){
    	$.ajaxSetup( { "async": false } );
		window.systemNames = new Array();
		var tags = new Array();
	    $("#sysList").html("");
	    $.getJSON("scripts/getSystems.php", function(result){
			$.each(result, function(k,v){
			   window.systemNames[k] = v;
               tags.push(k);
	  		});
	        $("#mapSystem").autocomplete({ 
	           source: function(request, response) {
                  var results = $.ui.autocomplete.filter(tags, request.term);
                  response(results.slice(0, 10));
    	       }
			});
		});
		$.ajaxSetup( { "async": true } );
}

function scaleMap(pixles){
    $("#map").css("height",(parseInt($("#map").css("height"))+pixles)+"px");
}

function getMap(){
	$("#mapContainer").html("")
    blapMap.systems = new Array();
	var sysID = window.systemNames[$("#mapSystem").val()];
	window.sysID = sysID;
	Cookies.set("savedSystem",$("#mapSystem").val());
	Cookies.set("savedJumps",$("#mapJumps").val());

    $.getJSON("scripts/getMap.php?system="+sysID+"&jumps="+$("#mapJumps").val()+"&sec=7", function(result){
	   //The scale by which to divide the size of the universe, to fit a damn map. 
	   var scaleMod = 130000000000000;
	   //The width and height of the returned map, from the lowest to highest.
	   var origWidth = result['dimensions']['x'][1] - result['dimensions']['x'][0];
	   var origHeight = result['dimensions']['z'][1] - result['dimensions']['z'][0];
	   //The value to subtract from system x/z to position them on a 0-based grid. 
	   var subx = result['dimensions']['x'][0] * -1
	   var subz = result['dimensions']['z'][0] * -1
	   //The X/Y size of the map, after scaling, and a padding buffer so all parts of the circles are displayed. Is this still used? 
	   var mapX = Math.round(origWidth/scaleMod)+100;
	   var mapZ = Math.round(origHeight/scaleMod)+100;
	   //The actual size of the map according to the scale of the user's window. 
	   blapMap.winX = parseInt($("#mapContainer").css("width"));
	   blapMap.winY = parseInt($("#mapContainer").css("height"));
       //The original SVG element. Not created in the HTML becasue repainting doesn't happen when scaling? 
	   blapMap.map = new SystemMap(blapMap.winX,blapMap.winY);
	   
	   //The main Mapgen Loop.
       $.each(result['systems'], function(k,v){
		  var x = Math.round((v['x'] + subx)/scaleMod)+50;
		  var z = Math.round((v['z'] + subz)/scaleMod)+50;
		  newSystem = new SolarSystem(v['id'], v['name'],roundDec(v['sec'],1),x,z,v['x'],0,v['z']);
		  if(v['id'] == sysID){
			  $(newSystem).attr('id',"home");
			  blapMap.home = newSystem;
		  }
		  blapMap.systems[v['id']] = newSystem;
		  $(blapMap.map).append(newSystem);
		  
      });
	  $.each(result['conns'], function(s,c){
		  if(c[0] in blapMap.systems && c[1] in blapMap.systems){
		     var s1 = blapMap.systems[c[0]];
		     var s2 = blapMap.systems[c[1]];
		     var newConn = new Connection($("#map"),s1,s2);
		  }
	  });

  	  $("#mapContainer").html("")
      $("#mapContainer").append(blapMap.map);
      var vb = blapMap.map[0].getAttribute("viewBox").split(" ");
	  vb[0] = parseInt(blapMap.home.mapCoords[0]) - blapMap.winX/2 
	  vb[1] = parseInt(blapMap.home.mapCoords[1]) - blapMap.winY/2
	  blapMap.map[0].setAttribute("viewBox", vb.join(" "));
	  getKills();
	  applyTips();
	  bindProps();
      bindZoom();
	  if(usingFF()){
		browserHandicap = 12;  
	  }else{
		browserHandicap = 0;  
	  }
    });
}

function stampToString(stamp){
	var date = new Date(stamp*1000);
	var hours = date.getHours();
	var minutes = "0" + date.getMinutes();
	var seconds = "0" + date.getSeconds();
	var formattedTime = hours + ':' + minutes.substr(-2) + ':' + seconds.substr(-2);
	return formattedTime;	
}

function roundDec(number, precision) {
    var factor = Math.pow(10, precision);
    var tempNumber = number * factor;
    var roundedTempNumber = Math.round(tempNumber);
    return roundedTempNumber / factor;
};

function showProperties(target){
		$("#sysInfo").html("");
		var id = $(target).attr("id"); 
		var system = blapMap.systems[id]
		$("#sysInfo").append("System Name: "+system.name+"<br>Security: "+system.sec);
		$("#killsContent tbody").html('<tr><th style="width:40px;">atk</th><th style="width:160px">ship</th><th>time</th></tr>');
		var keys = Object.keys(blapMap.systems[id].kills)
		$.each(keys,function(k,v){
			var kill = system.kills[v];
			var shipLink = "<a href='https://zkillboard.com/kill/"+kill['killID']+"/' target='_blank'>"+kill['ship']+"</a>";
			$("#killsContent tbody").append('<tr id="kill-'+kill['killID']+'"><td style="width:40px;">'+kill['attackers']+'</td><td style="width:160px">'+shipLink+'</td><td>'+stampToString(kill['time'])+'</td></tr>');
		});
}

function bindProps(){
	$("circle").click(function(){showProperties(this);});	
}

function applyTips(){
	$("circle").qtip({
		content: $(this).attr("id"),
		style: {
			classes: 'qtip-tipsy'
		},
		position: {
			my: 'bottom left',
        	at: 'top right' // at the bottom right of...
		}
	});
	$("#help").qtip({
		content: {
			text: "Kills from real-time ZKillboard feed.<br><br>All kills are within 20 minutes old, from the time they occurred in-game.<br><br>Map updates every 15 seconds, but ZKill sometimes posts kills several minutes after they occur.<br><br>Click a system for more info.<br>Drag background to scoll around map.<br>Change system/jumps to get new map.<br>Max jumps = 14 <br><br>Legend:<br>(Fill colors mark fleet size)<br><span style='color:red'>Red:</span> 8+<br><span style='color:orange'>Orange:</span> 4-7<br><span style='color:yellow'>Yellow:</span> 1-3<br><br>(Outer rings mark system sec)<br><span style='color:#64CF00;'>Green: </span>High<br><span style='color:#FFF736;'>Yellow: </span>Low<br><span style='color:#AD2500;'>Red: </span> Null<br><br>ISK donations provide good motivation to keep this site up and free. In-game name:<br>Reverb",
			title: {
				text: "INFO<hr>"	
			}
		},
		style: {
			classes: 'qtip-tipsy'
		},
		position: {
		   my: "top left",
		   at: "bottom right",
		   adjust: {
			   y: 10   
		   }
		}
	});
	$("#mapSystem").qtip({
		content: {
			text: "The central system of the map. <br> Must be spelled Correctly.",
		},
		style: {
			classes: 'qtip-tipsy'
		},
		position: {
		   my: "top left",
		   at: "bottom left",
		   adjust: {
			   y: 10,
			   x: -200 
		   }
		}
	});
	$("#mapJumps").qtip({
		content: {
			text: "The number of jumps from the central system that the map will display. Max: 14.",
		},
		style: {
			classes: 'qtip-tipsy'
		},
		position: {
		   my: "top left",
		   at: "bottom left",
		   adjust: {
			   y: 10   
		   }
		}
	});
}

function colorSystem(systemID){
	var color="#000";
	var maxAttack = 0; 
	var keys = Object.keys(blapMap.systems[systemID].kills);
	if(keys.length > 0){
		color="#FFED00"	
		$.each(keys,function(k,v){
		    var kill = blapMap.systems[systemID].kills[v];
			if(kill['attackers'] > maxAttack){
			   maxAttack = kill['attackers'];	
			}
		});
		if(maxAttack > 3){
			color="#FFA600";	
		}		
		if(maxAttack > 7){
			color="#F00";				
		}
	}
	$("#"+systemID).attr("style","fill:"+color);
}

function removeKill(systemID, killID){
	delete blapMap.systems[systemID].kills[killID];
	$("#killsContent tr").remove("#kill-"+killID);
	colorSystem(systemID);
	console.log("Kill removed: "+systemID+" :: "+killID);
}

function getKills(){
	var kSystems = new Array();
	$.getJSON("scripts/getKills.php", function(result){
		$.each(result, function(k,v){
			var rStamp = v['time'];
			var cStamp = Math.floor((new Date()).getTime() / 1000) - 1200; 
			if(rStamp > cStamp && v['systemID'] in blapMap.systems){
				blapMap.systems[v['systemID']].kills[v['killID']] = v;
				timeout = (rStamp - cStamp)*1000;
				console.log("Kill Added: "+v['systemID']+" : "+v['killID']+" : "+timeout);
				setTimeout(function(){ removeKill(v['systemID'],v['killID']); },timeout);
				kSystems.push(v['systemID']);
			}
		});
		$.each(kSystems,function(k,v){
			colorSystem(v);
		});
	});

}

var mapDoneEvent = new Event('mapDone');
window.addEventListener("mapDone",getKills);

function usingFF(){
    var ua= navigator.userAgent;
    if(/firefox/i.test(ua)){
		return true;
	}else{
		return false;
	}
}

$( window ).load(function() {
  blapMap = {};
  getSysOptions();
  if( getGET("system") in window.systemNames && /[0-9]+/.test(getGET("jumps"))){
	 $("#mapSystem").val(getGET("system"));
     $("#mapJumps").val(getGET("jumps"));  
  }else if(Cookies.get("savedSystem") != "" && Cookies.get("savedSystem") != null){
     $("#mapSystem").val(Cookies.get("savedSystem"));
     $("#mapJumps").val(Cookies.get("savedJumps"));
  }else{
     $("#mapSystem").val("Jita");
     $("#mapJumps").val(5);
  } 
  getMap(900); 
  setInterval(getKills, 15000);
  $(document).ready(function(){
      $("#mapContainer").attachDragger();
  });
  if(usingFF() && Cookies.get("warned") != "yep"){
	alert("Please note that there's currently a known bug in Firefox that causes it to be extremly slow with animated SVGs, which this site is based on. I've taken steps to mitigate the lag it causes, but for best results, use Chrome.");
  }
  Cookies.set("warned", "yep");
  
 });
