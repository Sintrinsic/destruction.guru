function SystemMap(width, height){
	//Function to make a real svg element, because standard jquery methods don't work properly with SVG, because god hates me. 
	this.makeSVG = function(tag, attrs) {
       var el= document.createElementNS('http://www.w3.org/2000/svg', tag);
       for (var k in attrs)
          el.setAttribute(k, attrs[k]);
       return el;
    }

	this.setFocus = function(x,y){
		var targetX = parseInt(x) - this.width/2;
		var targetY = parseInt(y) - this.height/2;
		this.viewBox = [targetX, targetY, this.viewBox[2], this.viewBox[3]]
		this.htmlEle.setAttribute("viewBox",this.viewBox.join(" "));
	}
	
	this.updatePos = function(x,y){
		this.viewBox[0] -= (x*this.zoomRatio);
		this.viewBox[1] -= (y*this.zoomRatio);
		this.htmlEle.setAttribute("viewBox", this.viewBox.join(" "));	
	}
	
	this.zoomRatio = 1;
	
	this.zoom = function(direction){
		var zoomSpeed = 60;
		var compMod = 2;
		//.036
		if(direction == "down") {
			if(this.viewBox[2] > (width/2)){

				this.viewBox[0] = parseInt(this.viewBox[0]) + (zoomSpeed/compMod);
				this.viewBox[1] = parseInt(this.viewBox[1]) + (zoomSpeed/compMod);
				this.viewBox[2] = parseInt(this.viewBox[2]) - zoomSpeed;
				this.viewBox[3] = parseInt(this.viewBox[3]) - zoomSpeed
			}
		}else if(direction == "up"){
			if(this.viewBox[2] < (width*1.25)){
				this.viewBox[0] = parseInt(this.viewBox[0]) - (zoomSpeed/compMod);
				this.viewBox[1] = parseInt(this.viewBox[1]) - (zoomSpeed/compMod);
				this.viewBox[2] = parseInt(this.viewBox[2]) + zoomSpeed;
				this.viewBox[3] = parseInt(this.viewBox[3]) + zoomSpeed;
			}
		}
		this.zoomRatio = (this.viewBox[2]/this.width);
		if(this.zoomRatio > 1){
			//1.165
			this.zoomRatio = Math.pow(this.zoomRatio,1.69);
		}
		this.htmlEle.setAttribute("viewBox", this.viewBox.join(" "));	
	}
	
	this.zoomRate = 1;
	this.width = width;
	this.height = height;	
	this.viewBox = [0,0,width,height];
	var viewBoxString = this.viewBox.join(" ");
	var styleString = "width:"+width+";min-width:100%;min-height:100%;height:"+height+";";
	this.htmlEle = this.makeSVG("svg",{"id":"map","viewbox":viewBoxString,"style":styleString});
}

function SolarSystem(id, name, sec, x, z, realX, realY, realZ, region){
	//Function to make a real svg element, because standard jquery methods don't work properly with SVG, because god hates me. 
	this.makeSVG = function(tag, attrs) {
       var el= document.createElementNS('http://www.w3.org/2000/svg', tag);
       for (var k in attrs)
          el.setAttribute(k, attrs[k]);
       return el;
    }
	//Required construction args
	this.systemID = id;
	this.region = region;
	this.name = name;
	this.sec = sec;
	this.mapCoords = [x,z];
	this.realCoords = [realX,realY,realZ]
	
	//Inits
	this.conns = Array();
	this.kills = Array();	
	this.highlight = null;
	
	this.addConn = function(conn){
		this.conns.push(conn);	
	};
	
	this.htmlEle = this.makeSVG('circle',{"cx":x,"cy":z,"fill":"black","r":"6","stroke":"#fff", "stroke-width": "2", "sysid": id, "title":name});
	
	this.updatePos = function(x,y){
		var thisParent = this; 
		this.mapCoords[0] += (x*blapMap.map.zoomRatio);
		this.mapCoords[1] += (y*blapMap.map.zoomRatio);
		this.htmlEle.setAttribute("cx", this.mapCoords[0]);	
		this.htmlEle.setAttribute("cy", this.mapCoords[1]);	
		if(this.highlight != null){
			this.highlight.setAttribute("cx", this.mapCoords[0]);	
			this.highlight.setAttribute("cy", this.mapCoords[1]);	
		}
		$.each(this.conns,function(k,v){
			v.updatePos(thisParent);
		})

	}
	
	this.setAttr = function(attribute, value){
		$(this.htmlEle).attr(attribute,value);
	}
	
	this.setColorMode = function(mode){
		switch(mode){
			case "security":
				var color = "#64CF00";
				if(this.sec<.5){
					color = "#FFF736";
				}
				if(this.sec<=0){
					color = "#AD2500";
				}
				this.setAttr("stroke",color);
				break;
			default:
				break;
		}
	}
	
	this.addKill = function(kill){
		this.kills[kill.killID] = kill;
		this.setKillColor();
	}
	
	this.removeKill = function(killID){
		delete this.kills[killID];
		this.setKillColor();
	}
	
	this.setKillColor = function(){
		var color="#000";
		var maxAttack = 0; 
		var keys = Object.keys(this.kills);
		var selfKills = this.kills;
		if(keys.length > 0){
			color="#FFED00"	
			$.each(keys,function(k,v){
				var kill = selfKills[v];
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
		this.htmlEle.setAttribute("fill",color);
	}
	
	this.setHighlight = function(color){
		if(this.highlight == null){
			this.highlight = this.makeSVG('circle',{"cx":this.mapCoords[0],"cy":this.mapCoords[1],"fill":"none","r":"9","stroke":color, "stroke-width":"2px", "sysid": id, "title":name+"-highlight"});
		}else{
			$(this.highlight).attr("stroke",color);
		}
		return this.highlight;
	}
	
	this.checkJumpRange = function(x,y,z, dist){
		var auDist = Math.sqrt(Math.pow((this.realCoords[0]-x),2)+Math.pow((this.realCoords[1]-y),2)+Math.pow((this.realCoords[2]-z),2))/9460730472580000;
		if(auDist < dist && this.sec <= .4){
			this.setAttr("stroke","#acf");
			return true;
		}else{
			return false;
		}
		
	
	}
	
	this.setColorMode("security");
}

SolarSystem.prototype = $("<circle/>")


//A Connection between 2 system objects.
function Connection(owner, sys1, sys2 ){
	Connection.done = Connection.done || Array(); 
	this.register = function( s1, s2 ){
	   	var regString = Math.max(s1.systemID,s2.systemID)+":"+Math.min(s1.systemID,s2.systemID);
		if(!(regString in Connection.done)){
		 	Connection.done[regString] = this;
				//Function to make a real svg element, because standard jquery methods don't work properly with SVG, because god hates me. 
			this.makeSVG = function(tag, attrs) {
       			var el= document.createElementNS('http://www.w3.org/2000/svg', tag);
       			for (var k in attrs)
          			el.setAttribute(k, attrs[k]);
       			return el;
    		}
			s1.addConn(this);
			s2.addConn(this);
			this.updatePos = function(system){
				var selectedIndex = 0
				if(this.systems[0]===system){
					selectedIndex = 1; 
				}else if(this.systems[1]===system){
					selectedIndex = 2; 
				}else{
					return false; 
				}	
				this.htmlEle.setAttribute("x"+selectedIndex,system.mapCoords[0]);
				this.htmlEle.setAttribute("y"+selectedIndex,system.mapCoords[1]);
			}
			this.systems = [ sys1, sys2 ];
			this.htmlEle = this.makeSVG('line',{"x1":this.systems[0].mapCoords[0],"y1":this.systems[0].mapCoords[1],"x2":this.systems[1].mapCoords[0],"y2":this.systems[1].mapCoords[1], "stroke":"#4D4D4D"});
			return this;
		}else{
		    return Connection.done[regString];
		}
	};	
	return this.register(sys1, sys2);
}

Connection.prototype = $("<line/>")

