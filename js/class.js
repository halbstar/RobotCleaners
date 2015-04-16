//function for simple extending classes
//taken from http://phrogz.net/JS/classes/OOPinJS2.html
Function.prototype.inheritsFrom = function( parentClassOrObject ){ 
	if ( parentClassOrObject.constructor == Function ) 
	{ 
		//Normal Inheritance 
		this.prototype = new parentClassOrObject;
		this.prototype.constructor = this;
		this.prototype.parent = parentClassOrObject.prototype;
	} 
	else 
	{ 
		//Pure Virtual Inheritance 
		this.prototype = parentClassOrObject;
		this.prototype.constructor = this;
		this.prototype.parent = parentClassOrObject;
	} 
	return this;
} 



/////////////////////
/////CLASS ROOM//////
/////////////////////
//class Room. Defines room shape on a given width and height (number of tiles)
function Room(width, height, tileWidth, tileHeight){
		//number of tile in width
		this.width = width;
		//number of tiles in height
		this.height = height;
		//tile width in pixels (default = 80px)
		this.tileWidth = tileWidth || 80;
		//tile width in pixels (default = 80px)
		this.tileHeight = tileHeight || 80;
		//offset to position div (cirlce with radis 50px) in the middle of tile
		this.offset = 15
		//array of cleaned tiles. Array adds tile postion when any robot position itself on a tile
		this.cleaned = []
		//number of tiles cleaned by each robot 
		this.whoCleanedIt = {}
		//romm width in pixels
		this.pixelRoomWidth = this.width*this.tileWidth;
		//romm height in pixels
		this.pixelRoomHeight = this.height*this.tileHeight;
	}
Room.prototype = {
	constructor : Room,
//draw room by given number of tiles and dimensions
makeRoom : function (){
		$(".room").css({"width" : this.pixelRoomWidth + "px" , "height" : this.pixelRoomHeight + "px"})
	},
//draw tiles
makeTiles : function (){
		for (var h = 0; h < this.height; h++) {
			for (var w = 0; w < this.width; w++) 
			{
				//unique id is set to tile. Model for namig is id = "Tile width position"x"Tile height position"
				$("<div class=\"tile\" id=\""+((w*this.tileWidth)+this.offset)+"x"+((h*this.tileHeight)+this.offset)+"\"></div>").appendTo(".room")

			};
			
		};
		
	},
// helper hash function for populating whoCleanedIt array
hash : function (whoCleanedIt, who){
		
		if (typeof whoCleanedIt[who]==="undefined"){
			whoCleanedIt[who] = 1
		}
		else{
		whoCleanedIt[who] += 1
		}
	},

//
isTileCleaned : function(x,y,who){
	//put the cleaned tile into cleaned array, and turn tile into white (cleaned)
		if(this.cleaned.indexOf(x+"x"+y)===-1){
			this.cleaned.push(x+"x"+y)
			//remember who cleaned the tile
			this.hash(this.whoCleanedIt, who)
			$("#"+(x+"x"+y)).css({"background-color":"white"})
		}
	}
}



/////////////////////
/////CLASS ROBOTS////
/////////////////////

//basic roboto model
function Robot(room, id) {
	//instance of Room class
	this.room = room;
	//id increment to distinguish robots of same class. Currently not implemeted so well
	this.id = id || 1;
	//position of robot in a room
	this.x = 0;
	this.y = 0;
	//initial vector movement (for preventing robot that stands still on initialization)
	this.dx = 80
	this.dy = 0
	
	
}
Robot.prototype = {
	
	constructor : Robot,


//get initial position or set random position
position : function(x,y,who){
		this.x = x || ((Math.floor(Math.random()*this.room.width))*this.room.tileWidth)+this.room.offset
		this.y = y || ((Math.floor(Math.random()*this.room.height))*this.room.tileHeight)+this.room.offset
		//clean tile at initial position
		this.room.isTileCleaned(this.x,this.y, who)
	},
//show robot div on initial position
apearRobot : function(x,y, who){
		this.position(x,y,"Robot")
		console.log(x,y)
		$("<div class='Robot' id= 'circle"+this.id+"'style = 'left:"+this.x+"px; top:"+this.y+"px; z-index:"+this.id+"'></div>").appendTo(".room")
	},
//return random vector for new robot position
dxR : function (){
			return walkArr[Math.floor(Math.random() * walkArr.length)]
		},
dyR : function (){
			return walkArr[Math.floor(Math.random() * walkArr.length)]
		},
//collection of condition to check is robot in the room
isInTheRoom : function(dx,dy){
			return (this.room.pixelRoomWidth > this.x+dx && this.x+dx > 0) && (this.room.pixelRoomHeight > this.y+dy && this.y+dy > 0) && !(dx==0 && dx+dy==0)
		},

//helper function to find discrete position. It returns position in number of tiles from left or top (approximately). Mainly for initial drop position on tile/room
whichTile :	function (realPosition){
		n = 0
		step = 0
		while(realPosition>step){
			step = this.room.tileWidth*n
			n+=1
		}
		if(step+this.room.offset-this.room.tileWidth<=0){
			return step+this.room.offset	
		}
		else {
			return step+this.room.offset-this.room.tileWidth
		}
	}
};


//CrazyRobot inherits Robot class
function CrazyRobot(room, id){
	this.room = room
};

CrazyRobot.inheritsFrom(Robot)

CrazyRobot.prototype.apearRobot = function (x,y){
	this.position(x,y, "Crazy Robot")
	$("<div class='CrazyRobot' id= 'CrazyRobot"+this.id+"'style = 'left:"+this.x+"px; top:"+this.y+"px; z-index:"+this.id+"'>Crazy Robot</div>").appendTo(".room")
	
}

//new method for walk
CrazyRobot.prototype.newPosition = function (){
		//array with 4 possible choices for walk, which combined with two dimensions gives 4 degrees of freedom
		walkArr = [this.room.tileHeight, -this.room.tileWidth,0,0]
		
		//random choice of direction, every new position of robot is random
		this.dx = this.dxR()
		this.dy = this.dyR()
		//check if new position is in the room
		this.x  = this.isInTheRoom(this.dx,this.dy) ? this.x+this.dx : this.x
		this.y  = this.isInTheRoom(this.dx,this.dy) ? this.y+this.dy : this.y
		
		//move robot to that tile
		$("#CrazyRobot"+this.id).animate({"left":this.x,"top":this.y})
		//clean tile at that position
		this.room.isTileCleaned(this.x,this.y, "Crazy Robot")

		
		
	}

//DrunkRobot inherits Robot class
function DrunkRobot(room, id){
	this.room = room
	
};

DrunkRobot.inheritsFrom(Robot)

DrunkRobot.prototype.apearRobot = function (x,y){
	this.position(x,y, "Drunk Robot")
		$("<div class='DrunkRobot' id= 'DrunkRobot"+this.id+"'style = 'left:"+this.x+"px; top:"+this.y+"px; z-index:"+this.id+"'>Drunk Robot</div>").appendTo(".room")
}

//new method for walk
DrunkRobot.prototype.newPosition = function (){
		//array with 4 possible choices for walk, which combined with two dimensions gives 4 degrees of freedom
		walkArr = [this.room.tileHeight, -this.room.tileWidth,0,0]
		
		
		//robot keeps direction than chooses new direction		
		if(this.isInTheRoom(this.dx,this.dy)){
			this.x = this.x + this.dx
			this.y = this.y + this.dy
			
		} else{
			do{
			this.dx = this.dxR()
			this.dy = this.dyR()
			
		}while(!this.isInTheRoom(this.dx,this.dy))
			
		}

		
		//move robot to that tile
		$("#DrunkRobot"+this.id).animate({"left":this.x,"top":this.y})
		//clean tile at that position
		this.room.isTileCleaned(this.x,this.y, "Drunk Robot")

		}
		
//MagicRobot inherits Robot class	
function MagicRobot(room, id){
	this.room = room
	
};

MagicRobot.inheritsFrom(Robot)

MagicRobot.prototype.apearRobot = function (x,y){
	this.position(x,y, "Magic Robot")
		$("<div class='MagicRobot' id= 'MagicRobot"+this.id+"'style = 'left:"+this.x+"px; top:"+this.y+"px; z-index:"+this.id+"'>Magic Robot</div>").appendTo(".room")
	
}

//new method for walk
MagicRobot.prototype.newPosition = function (){
				
		//random choice of position, every time robots moves to random position
		this.x = this.whichTile(Math.random()*this.room.pixelRoomWidth)
		this.y = this.whichTile(Math.random()*this.room.pixelRoomHeight)
				
		//move robot to that tile
		$("#MagicRobot"+this.id).animate({"left":this.x,"top":this.y})
		this.room.isTileCleaned(this.x,this.y, "Magic Robot")
		

}

//URobot inherits Robot class

function URobot(room, id){
	this.room = room
	
};

URobot.inheritsFrom(Robot)

URobot.prototype.apearRobot = function (x,y){
	this.position(x,y, "U Robot")
	console.log(x,y)
		$("<div class='URobot' id= 'URobot"+this.id+"'style = 'left:"+this.x+"px; top:"+this.y+"px; z-index:"+this.id+"'>U Robot</div>").appendTo(".room")
	
}

//user controled movements, using up, down, left, right arrows
URobot.prototype.newPosition = function (key){
				switch(parseInt(key.which,10)) {
		        	//check which arrow is pressed and moves robot in that side
					// Left arrow pressed
					case 37:
						//checks is position in the room. 1 is value to initiate dy and to still be in the room
						this.x = this.isInTheRoom(-this.room.tileWidth,1) ? this.x - this.room.tileWidth : this.x;
						break;
					// Up Arrow Pressed
					case 38:
						this.y = this.isInTheRoom(1,-this.room.tileHeight) ? this.y - this.room.tileHeight : this.y;
						break;
					// Right Arrow Pressed
					case 39:
						this.x = this.isInTheRoom(this.room.tileWidth,1) ? this.x + this.room.tileWidth : this.x;
						break;
					// Down Arrow Pressed
					case 40:
						this.y = this.isInTheRoom(1,this.room.tileHeight) ? this.y + this.room.tileHeight : this.y;
						break;
				}
				
		
		//move robot to that tile
		$("#URobot"+this.id).animate({"left":this.x,"top":this.y})
		this.room.isTileCleaned(this.x,this.y, "U Robot")
		
};