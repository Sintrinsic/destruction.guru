function bindZoom(){
	$('#map').bind('mousewheel DOMMouseScroll MozMousePixelScroll', function(e){
        var delta = parseInt(e.originalEvent.wheelDelta || -e.originalEvent.detail)		
		if(delta /120 > 0 && ! isNaN(delta)) {
			blapMap.map.zoom("up");
		}else if(delta/120 < 0 && ! isNaN(delta)){
			blapMap.map.zoom("down");
		}
    });	
}

function bindMapDrag(){
    var attachment = false, lastPosition, position, difference;
	count = 6; 
    attachedTo = null;
    $("#map").on("mousedown mouseup mousemove",function(e){
        if( e.type == "mousedown" ){
			 attachment = true;
			 lastPosition = [e.clientX, e.clientY];
		}
        if( e.type == "mouseup" ){
			attachment = false;
			attachedTo = null;
		}
		// calm down. I'm not sabotaging your favorite browser. There's a bug in FF that makes graphical repaints slow. It responds faster when you skip some repaints. 
        if( e.type == "mousemove" && attachment == true && count > browserHandicap  ){
			if(attachedTo == null){
				count = 0;
				position = [e.clientX, e.clientY];
				blapMap.map.updatePos((position[0]-lastPosition[0]),(position[1]-lastPosition[1]));
				lastPosition = [e.clientX, e.clientY];
			}else{
				$('.qtip').hide();
				position = [e.clientX, e.clientY];
				attachedTo.updatePos((position[0]-lastPosition[0]),(position[1]-lastPosition[1]));
				lastPosition = [e.clientX, e.clientY];
			}
        }
		count ++;
    });
	$("#map").children().on("mousedown mouseup mousemove", function(e){ 
		e.stopPropagation();
        if( e.type == "mousedown" ){
			 attachedTo = blapMap.systems[$(e.target).attr("sysid")];
			 attachment = true;
			 lastPosition = [e.clientX, e.clientY];
		}
        if( e.type == "mouseup" ){
			attachedTo = null;
			attachment = false;
		}
		// calm down. I'm not sabotaging your favorite browser. There's a bug in FF that makes graphical repaints slow. It responds faster when you skip some repaints. 
        if( e.type == "mousemove" && attachment == true && attachedTo != null){
			$('.qtip').hide();
            position = [e.clientX, e.clientY];
			attachedTo.updatePos((position[0]-lastPosition[0]),(position[1]-lastPosition[1]));
            lastPosition = [e.clientX, e.clientY];
        }		
	});
    $(window).on("mouseup", function(){
        attachment = false;
    });
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

function showProperties(target){
		$.each(Object.keys(blapMap.systems), function(k,v){
			blapMap.systems[v].setColorMode("security");
		});
		$("#sysInfo").html("");
		var id = $(target).attr("sysid"); 
		var system = blapMap.systems[id];
	    blapMap.selected = blapMap.systems[id];
		$("#sysInfo").append("System Name: "+system.name+"<br>Security: "+system.sec);
		$("#killsContent tbody").html('<tr><th style="width:40px;">atk</th><th style="width:160px">ship</th><th>time</th></tr>');
		var keys = Object.keys(blapMap.systems[id].kills)
		$.each(keys,function(k,v){
			var kill = system.kills[v];
			var shipLink = "<a href='https://zkillboard.com/kill/"+kill['killID']+"/' target='_blank'>"+kill['ship']+"</a>";
			$("#killsContent tbody").append('<tr id="kill-'+kill['killID']+'"><td style="width:40px;">'+kill['attackers']+'</td><td style="width:160px">'+shipLink+'</td><td>'+stampToString(kill['time'])+'</td></tr>');
		});
	    //$("#toolInfo").html("<button id='jumpButton' class='toolButton toolElement'>Jump Range</button><input id='jumpRange' class='toolText toolElement' value='6'>");
	    $("#jumpButton").click(function(){  
			$.each(Object.keys(blapMap.systems), function(k,v){
				blapMap.systems[v].setColorMode("security");
				blapMap.systems[v].checkJumpRange(system.realCoords[0], system.realCoords[1], system.realCoords[2],$('#jumpRange').val());
				
			});
		});
		
}

function bindProps(){
	$("circle").click(function(){showProperties(this);});	
}

function getNewMap(){
     var selectedSystem = $("#mapSystem").val();
     var selectedJumps = $("#mapJumps").val();

	 if(!(selectedSystem in blapMap.systemNames) || ! /[0-9]+/.test(selectedJumps)){
		 alert("Pick a correct system name and jump count.");
	 }else{
	 	window.history.pushState("newMap", "diediedie", "?system="+selectedSystem+"&jumps="+selectedJumps);
		getMap(); 
	 }
}

function getSysOptions(){
    	$.ajaxSetup( { "async": false } );
		blapMap.systemNames = new Array();
		var tags = new Array();
	    $("#sysList").html("");
	    $.getJSON("scripts/getSystems.php", function(result){
			$.each(result, function(k,v){
			   blapMap.systemNames[k] = v;
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

function getMap(){
	$("#mapContainer").html("")
	Connection.done = new Array();
    blapMap.systems = new Array();
    blapMap.systemNames = {}; 
    blapMap.systemNames['Jita']=123456;	
    var sysID = blapMap.systemNames[$("#mapSystem").val()];

    $.getJSON("scripts/getMap.php?system="+sysID+"&jumps="+$("#mapJumps").val()+"&sec=7", function(result){
		blapMap.sysID = sysID;
		Cookies.set("savedSystem",$("#mapSystem").val());
		Cookies.set("savedJumps",$("#mapJumps").val());
		
	   //The scale by which to divide the size of the universe, to fit a damn map. 
	   var scaleMod = 130000000000000;
	   //The width and height of the returned map, from the lowest to highest.
	   var origWidth = result['dimensions']['x'][1] - result['dimensions']['x'][0];
	   var origHeight = result['dimensions']['z'][1] - result['dimensions']['z'][0];
	   //The value to subtract from system x/z to position them on a 0-based grid. Why invert, you ask? Because I was stupid before, and lazy now. 
	   var subx = result['dimensions']['x'][0] * -1
	   var subz = result['dimensions']['z'][0] * -1
	   //The X/Y size of the map, after scaling, and a padding buffer so all parts of the circles are displayed. Is this still used? 
	   var mapX = Math.round(origWidth/scaleMod)+100;
	   var mapZ = Math.round(origHeight/scaleMod)+100;
	   //The actual size of the map according to the scale of the user's window. 
	   blapMap.winX = parseInt($("#mapContainer").css("width"));
	   blapMap.winY = parseInt($("#mapContainer").css("height"));
	   blapMap.map = new SystemMap(blapMap.winX,blapMap.winY);
       document.getElementById('mapContainer').appendChild(blapMap.map.htmlEle);		  		  
	   //The main Mapgen Loop.
       $.each(result['systems'], function(k,v){
		  var x = Math.round((v['x'] + subx)/scaleMod)+50;
		  var z = Math.round((v['z'] + subz)/scaleMod)+50;
		  newSystem = new SolarSystem(v['id'], v['name'],roundDec(v['sec'],1),x,z,v['x'],v['y'],v['z'],v['region']);
		  if(v['id'] == sysID){
			  $(newSystem).attr('id',"home");
			  newSystem.setHighlight("#fff");
			  blapMap.map.setFocus(x,z);
			  blapMap.home = newSystem;
		  }
		  blapMap.systems[v['id']] = newSystem;
      });
	  $.each(result['conns'], function(s,c){
		  if(c[0] in blapMap.systems && c[1] in blapMap.systems){
		     var s1 = blapMap.systems[c[0]];
		     var s2 = blapMap.systems[c[1]];
		     var newConn = new Connection($("#map"),s1,s2);
          	 document.getElementById('map').appendChild(newConn.htmlEle);		  
		  }
	  });
	  $.each(Object.keys(blapMap.systems), function(k,v){
            document.getElementById('map').appendChild(blapMap.systems[v].htmlEle);		  		  
	  });
      //document.getElementById('map').appendChild(blapMap.home.highlight);		  		  
	  bindMapDrag();
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
};

function getKills(){
	$.getJSON("scripts/getKills.php", function(result){
		$.each(result, function(k,v){
			var system = blapMap.systems[v['systemID']];
			var rStamp = v['time'];
			var cStamp = Math.floor((new Date()).getTime() / 1000) - 1200; 
			if(rStamp > cStamp && v['systemID'] in blapMap.systems){
				system.addKill(v);
				timeout = (rStamp - cStamp)*1000;
				setTimeout(function(){ system.removeKill(v['killID']); },timeout);
			}
		});
	});
}


$( window ).load(function(){
  blapMap = {};
  getMap(900); 
  setInterval(getKills, 15000);
  if(usingFF() && Cookies.get("warned") != "yep"){
	alert("Please note that there's currently a known bug in Firefox that causes it to be extremly slow with animated SVGs, which this site is based on. I've taken steps to mitigate the lag it causes, but for best results, use Chrome.");
  }
  Cookies.set("warned", "yep");
  
 });
