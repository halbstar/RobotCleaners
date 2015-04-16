function score(scoreJSON){
      	//text will come in form of a table
        text = "<table>"
        //helper array to sort scoreJSON
        count_arr = []
        //populate count_arr
        for (var key in scoreJSON) {
          count_arr.push(parseInt(scoreJSON[key]))
        }
        //sort desc count_arr
        count_arr.sort(function(a, b){return b-a})

        //remember key to prevent duplicates in score list
        remember_key = ""
        //loop through desc sorted count_arr and check each number (highest first)
        for(var n in count_arr){
          // compare with each key value and make table rows sorted by each robot time step          
          for (var key in scoreJSON) {
            if(scoreJSON[key]==count_arr[n] & remember_key!=key){
              text += ("<tr><td>"+key+" </td><td> : "+scoreJSON[key]+"</td><tr>");
              remember_key = key
              break;
            }
          }
        }
		return text+"</table>";
	}



	//script to make Room for cleaning
	$(document).ready(function() {
		$('.makeRoom').click(function() {
      if(typeof room != "undefined"){
        $(".room").html("")
      }
      $(".description").slideUp()
			room = new Room($('#inputWidth').val(),$('#inputHeight').val())
			room.makeRoom()
			room.makeTiles()

		})
	})


	
	//global robot obojects array. Contains all robot instances of different robot objects
	robot_object_arr = []
	//counter of robot objects
	robot_object_counter = 0

  //////
	//dragabble-droppapable segment and game functionaliti//
  //////
	$(document).ready(function() {
	//any child of .RobotChooseWrapper becomes draggable
    $( ".RobotChooseWrapper" ).children().draggable();
    $( "#droppable" ).droppable({
    	drop: function( event, ui ) {
    		if(robot_object_counter==0){
    			Timer()
    		}
        	//checking where was robot div dropped
        	var pos = ui.draggable.offset(), dPos = $(this).offset();  		
   
        	//get css class name, which is same name as object class name from dropped div and use it to instanciate new robot object
			var new_class_name = (ui.draggable.attr("class").split(" ")[0])
        	var class_name = window[new_class_name]
        	//hide initial div
        	$( ui.draggable ).hide("slow")

        	if(class_name!=URobot){
        	//push robot object into robot object array (stack)
        	robot_object_arr.push(new class_name(room, robot_object_counter))

  			//instance of robot class "robot_object_arr[robot_object_counter]" is materialized at room at dropped position
        	robot_object_arr[robot_object_counter].apearRobot(
        		robot_object_arr[robot_object_counter].whichTile(pos.left - dPos.left), 
        		robot_object_arr[robot_object_counter].whichTile(pos.top - dPos.top));
        	robot_object_counter += 1
        	}
        	else{
        	 	robot = new URobot(room)
     			robot.apearRobot(robot.whichTile(pos.left - dPos.left), robot.whichTile(pos.top - dPos.top))
     			$(document).ready(function() {
    				$(document).keydown(function(key) {
    				robot.newPosition(key)
            if(room.cleaned.length>(room.width*room.height)-1) {
              $(".gameOver").css({"display":"inline"}).slideDown()
            };
    				})
    			});	
   			}
        	
		//END ui event         	
    	}

    //END droppaple
  	});
  	//END draggable-droppable segment
  	});
		
	
	//set timer to control robots animation and movement
	function Timer(){
	Timer = setInterval(function(){
			//loop thorugh robot_object_array and set new position for each robot
    	    for (var i = robot_object_arr.length - 1; i >= 0; i--) {
    	     	robot_object_arr[i].newPosition()
    	    };
    	    //show current score of number of tiles cleaned by each robot in side div score
    	    $(".score").html("<div>"+ score(room.whoCleanedIt) +"</div>")
    	    //when room is cleaned stop timer
    	    if(room.cleaned.length>(room.width*room.height)-1) {
    	  			clearInterval(Timer)
              $(".gameOver").css({"display":"inline"}).slideDown()
    	  	};
    	}
    	  		
    	, 1000)
	}


//get width and height of onscreen room div and return value to input field  (number of tiles in width and height)

$(document).ready(function() { 
  $("#inputWidth").val( parseInt($(".room").width()/80) ); 
  $("#inputHeight").val( parseInt($(".room").height()/80) ); 
} )


  