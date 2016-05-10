angular.module('app.home', []).component('home', {
  templateUrl: 'routes/home/home.html',
  controllerAs: 'vm',
  controller: function() {
    var vm = this;

    
    vm.promise = null;
    vm.query = {
    	order: ''
    }
 	vm.rowSelect = true;
    vm.lineupDate = new Date();
 	vm.iconSrc = "signal_wifi_4_bar";

	vm.showDiagram = false;
    vm.hideToolbar = false;

    vm.toggleToolbar = function() {
        vm.hideToolbar = true;
    }

	vm.toggleIcon = function() {
		if (vm.iconSrc == "signal_wifi_4_bar") {
			vm.iconSrc = "list";
		} else {
			vm.iconSrc = "signal_wifi_4_bar";
		}
	}

    vm.removePlayer = function(player,index) {
        console.log("removing " + player.name + " from index: " + index);
        vm.playersPlaying.splice(index,1);
        vm.playersNotComing.push(angular.copy(player));
    }

    vm.addPlayerToLineup = function(player, index) {
        vm.playersNotComing.splice(index,1);
        vm.playersPlaying.push(angular.copy(player));
    }

  

	vm.toggleDiagram = function() {
		vm.showDiagram = !vm.showDiagram;
		vm.toggleIcon();
		if(vm.showDiagram) {
			vm.generateDiagram();
			
		}
	}

    vm.checkInning = function(inning) {
        // check to make sure 2 players aren't playing the same position
        var sumTotal = 0;
        var positionMap = {};
        for(var i = 0; i < vm.playersPlaying.length; i++) {
            var player = vm.playersPlaying[i];
            //console.log("player: " + player.name + " has " + player.positions.length);
            for(var j = 0; j < player.positions.length; j++) {
                //.log(player.name + "\tposition: " + player.positions[j].inning)
                if(player.positions[j].inning == inning) {
                    var position = player.positions[j].position;
                    //if(inning == 3 && sition == 9 && player.name == "Whitney") console.log(player.name + "  " + JSON.stringify(positionMap))
                    if(!positionMap[position] && position > 0) {
                        positionMap[position] = 1;
                       // if(inning == 3 && position == 9 && player.name == "Whitney") console.log("matched if")
                    } else {
                        //if(inning == 3 && position == 9 && player.name == "Whitney") console.log("inside else")
                        if (position > 0) {
                            var postTotal = positionMap[position]++;
                          //  console.log("postTotal: " + postTotal);
                        }
                    }
                    
                    sumTotal += position;
                }
            }
        }
        if(sumTotal > 55) {
            for (var position in positionMap) {
                var positionTotal = positionMap[position];
                //if (positionTotal > 1)
              //  console.log("position: " + position + " has " + positionTotal);
            }
        }
        return sumTotal;
    }

	vm.validateInning = function(inning) {
		var requiredPositions = ["P","C","1B","2B","3B","SS","LF","LCF","RCF","RF"];
        var numPlayers = vm.playersPlaying.length;
		for(var i = 0; i < numPlayers; i++) {
    		var player = vm.playersPlaying[i];
    		//console.log("player: " + player.name + " has " + player.positions.length);
    		for(var j = 0; j < player.positions.length; j++) {
    			//.log(player.name + "\tposition: " + player.positions[j].inning)
    			if(player.positions[j].inning == inning) {
    				var position = player.positions[j];
    				//console.log("position: " + JSON.stringify(position));
    				if(position.position > 0) {
    					var abbr = vm.getPositionDisplay(position.position);
    					for(var k = 0; k < requiredPositions.length; k++) {
    						if (abbr == requiredPositions[k]) {
    							delete requiredPositions[k];
    							requiredPositions = requiredPositions.filter(function() { return true; });
    							break;
    						}
    					}
					}
    			}
    		}

    	}
    	var msg = '';
    	requiredPositions = requiredPositions.filter(function() { return true; });
    	if(requiredPositions && requiredPositions.length > 0) {
    		for (var i = 0; i < requiredPositions.length; i++) {
    			if (i > 0) {
    				msg += ', ';
    			}
    			msg += requiredPositions[i];
    		}
    	}
    	return msg;
	}

 	vm.positionChoices = [
 	{number: 0, abbr: 'BN', name: 'Bench', display:'sitting'},
 	{number: 1, abbr: 'P', name:'Pitcher', display:'pitcher'},
 	{number: 2, abbr: 'C', name:'Catcher', display:'catcher'},
 	{number: 3, abbr: '1B', name:'First Base', display: 'first'},
 	{number: 4, abbr: '2B', name:'Second Base', display:'second'},
 	{number: 5, abbr: '3B', name:'Third Base', display:'third'},
 	{number: 6, abbr: 'SS', name:'Shortstop', display:'short'},
 	{number: 7, abbr: 'LF', name:'Left Field', display:'left'},
 	{number: 8, abbr: 'LCF', name:'Center Field', display:'leftcenter'},
 	{number: 9, abbr: 'RCF', name:'Right Field', display:'rightcenter'},
 	{number: 10, abbr: 'RF', name:'Right Field', display:'right'}
 	];
    vm.selected = [];

    vm.playersNotComing = [];

    vm.players = [
    {
    	name:'Ashley', 
    	positions: [
    		{inning: 1, position: 5},
    		{inning: 2, position: 1},
    		{inning: 3, position: 8},
    		{inning: 4, position: 9},
    		{inning: 5, position: 8},
    		{inning: 6, position: 6}
    	]
    },
       {
        name:'Brooke', 
        positions: [
            {inning: 1, position: 9},
            {inning: 2, position: 4},
            {inning: 3, position: 5},
            {inning: 4, position: 6},
            {inning: 5, position: 2},
            {inning: 6, position: 3}
        ]
    },
    {
    	name:'Claire', 
    	positions: [
    		{inning: 1, position: 3},
    		{inning: 2, position: 9},
    		{inning: 3, position: 2},
    		{inning: 4, position: 1},
    		{inning: 5, position: 6},
    		{inning: 6, position: 2}
    	]
    },
     {
        name:'Quinn', 
        positions: [
            {inning: 1, position: 1},
            {inning: 2, position: 7},
            {inning: 3, position: 3},
            {inning: 4, position: 2},
            {inning: 5, position: 7},
            {inning: 6, position: 8}
        ]
    },
    {
    	name:'Erin', 
    	positions: [
    		{inning: 1, position: 6},
    		{inning: 2, position: 3},
    		{inning: 3, position: 9},
    		{inning: 4, position: 3},
    		{inning: 5, position: 4},
    		{inning: 6, position: 9}
    	]
    },
    {
        name:'Alaina',

        positions: [
            {inning: 1, position: 8},
            {inning: 2, position: 6},
            {inning: 3, position: 3},
            {inning: 4, position: 9},
            {inning: 5, position: 5},
            {inning: 6, position: 9}
        ]
    },
       {
        name:'Sophia', 
        positions: [
            {inning: 1, position: 2},
            {inning: 2, position: 6},
            {inning: 3, position: 7},
            {inning: 4, position: 8},
            {inning: 5, position: 5},
            {inning: 6, position: 1}
        ]
    },

    {
    	name:'Elsie', 
    	positions: [
    		{inning: 1, position: 7},
    		{inning: 2, position: 5},
    		{inning: 3, position: 0},
    		{inning: 4, position: 8},
    		{inning: 5, position: 0},
    		{inning: 6, position: 2}
    	]
    },
    {
    	name:'Xaelynn', 
    	positions: [
    		{inning: 1, position: 7},
    		{inning: 2, position: 8},
    		{inning: 3, position: 4},
    		{inning: 4, position: 5},
    		{inning: 5, position: 1},
    		{inning: 6, position: 7}
    	]
    },
    
    {
    	name:'Leah', 
    	positions: [
    		{inning: 1, position: 2},
    		{inning: 2, position: 8},
    		{inning: 3, position: 5},
    		{inning: 4, position: 9},
    		{inning: 5, position: 7},
    		{inning: 6, position: 0}
    	]
    },
    {
        name:'Kylee', 
        positions: [
            {inning: 1, position: 4},
            {inning: 2, position: 2},
            {inning: 3, position: 1},
            {inning: 4, position: 7},
            {inning: 5, position: 3},
            {inning: 6, position: 4}
        ]
    },
    {
        name:'Whitney', 
        positions: [
            {inning: 1, position: 8},
            {inning: 2, position: 5},
            {inning: 3, position: 6},
            {inning: 4, position: 4},
            {inning: 5, position: 9},
            {inning: 6, position: 5}
        ]
    },
    
    ];

    vm.playersPlaying = angular.copy(vm.players);

    vm.innings = [
    	{number: 1, playing: [], sitting:[]},
    	{number: 2, playing: [], sitting:[]},
    	{number: 3, playing: [], sitting:[]},
    	{number: 4, playing: [], sitting:[]},
    	{number: 5, playing: [], sitting:[]},
    	{number: 6, playing: [], sitting:[]}
    ];

    vm.generateDiagram = function() {
    	for(var i = 0; i < vm.innings.length; i++) {
    		var inning = vm.innings[i];
    		var inningPlayers = vm.getPlayersForInning(inning.number);
    		inning.playing = inningPlayers.playing;
    		inning.sitting = inningPlayers.sitting;
    	}
    };

    vm.getClass = function(p){ 
    	return p.player.lowercasename + " mylabel" + " " + p.position;
    }
     vm.getPlayersForInningCheck = function(number) {
        var playing = [];
        var sitting = [];
        var map = {};
        var msg = [];
        //console.log("inning: "+ number);
        for(var i = 0; i < vm.playersPlaying.length; i++) {
            var player = vm.playersPlaying[i];
            //console.log("player: " + player.name + " has " + player.positions.length);
            for(var j = 0; j < player.positions.length; j++) {
                //.log(player.name + "\tposition: " + player.positions[j].inning)
                if(player.positions[j].inning == number) {
                    var position = player.positions[j];
                    if(position.position > 0) {
                        var positionDisplay = vm.getPositionDisplay(position.position);
                        if(!map[positionDisplay]) {
                            map[positionDisplay] = player.name;
                        } else {
                            msg.push(positionDisplay);
                        }
                        
                    }
                }
            }

        }
        if (msg && msg.length > 0) {
            var ret = "";
            for(var i =0; i < msg.length; i++) {
                if (i >0) {
                    ret = ret + ", ";
                }
                ret += msg[i];
            }
            return ret;
        } else {
            return "";
        }
        //return {playing: playing, sitting: sitting};
    }
    vm.getPlayersForInning = function(number) {
    	var playing = [];
    	var sitting = [];
    	//console.log("inning: "+ number);
    	for(var i = 0; i < vm.playersPlaying.length; i++) {
    		var player = vm.playersPlaying[i];
    		//console.log("player: " + player.name + " has " + player.positions.length);
    		for(var j = 0; j < player.positions.length; j++) {
    			//.log(player.name + "\tposition: " + player.positions[j].inning)
    			if(player.positions[j].inning == number) {
    				var position = player.positions[j];
    				if(position.position > 0) {

    					player.lowercasename = player.name.toLowerCase();
    					
    					//console.log(number + "\tadding: " + player.name);
    					playing.push({player: player, position: vm.getFullPositionName(position.position)});
    				} else {
    					sitting.push(player);
    				}
    			}
    		}

    	}
    	return {playing: playing, sitting: sitting};
    }

    vm.getNumOutfieldInnings = function(player) {
    	var positions = player.positions;
    	var num = 0;
    	for (var i = 0; i < positions.length; i++) {
    		if (positions[i].position > 6) {
    			num++;
			}
    	}
    	return num;
    }

      vm.isOutfieldMet = function(player) {
    	var positions = player.positions;
        var numPlayers = vm.playersPlaying.length;
        var minInning = 3;
        if(numPlayers < 12) {
            minInning = 4;
        }
    	var good = false;
    	for (var i = 0; i < positions.length; i++) {

    		if (parseInt(positions[i].inning) <=minInning && positions[i].position > 6) {
    			good = true;
    			break;
			}
    	}
    	return good? "yes":"no";
    }

    vm.getFullPositionName = function(number) {
    	for(var i = 0; i < vm.positionChoices.length; i++) {
    		if (vm.positionChoices[i].number == number) {
    			return vm.positionChoices[i].display;
    		}
    	}
    };

    vm.getPositionDisplay = function(number) {
		for(var i = 0; i < vm.positionChoices.length; i++) {
			if (vm.positionChoices[i].number == number) {
				return vm.positionChoices[i].abbr;
			}
		}
    };

    vm.getInningTotal = function(inning) {
    	var total = 0;
    	for (var i = 0; i < vm.playersPlaying.length; i++) {
    		var player = vm.playersPlaying[i];
    		//console.log("[player]: " + JSON.stringify(player));
    		if(player && player.positions) {
	    		var positions = player.positions;
	    		if(!positions) {
	    			positions = [];
	    		}
	    		for(var j= 0; j < positions.length; j++) {
	    			if (positions[j].inning == inning) {
	    				total += positions[j].position;
	    			}
	    		}
	    	}
    	}
    	return total;
    }


    vm.getRestrictedPositions = function(player) {
    	var positions = player.positions;
    	var pos = [];
    	for (var i = 0; i < positions.length; i++) {
    		if (positions[i].position == 1 || positions[i].position == 3 || positions[i].position == 5) {
    			pos.push(positions[i].position);
			}
			
    	}
    	pos = pos.sort();
    	var disp = '';
    	if (pos.length == 0) {
    		return 'NONE';
    	}
    	for(var j = 0; j < pos.length; j++) {
    		if (j > 0) {
    			disp += ', ';
    		}
    		disp += vm.getPositionDisplay(pos[j]);
    	}
    	return disp;
    }

    this.showDetails = function() {
      console.log("deatils")
      this.$router.navigate(['Brian',{name:'Brian'}]);
    };

  
    vm.$routerOnActivate = function(toRoute, fromRoute) {
    	this.name = toRoute.params.name;
    };
  }
});
