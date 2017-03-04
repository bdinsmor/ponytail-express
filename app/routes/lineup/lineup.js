angular.module('app.lineup', ['app.services.lineups', 'app.services.players']).component('lineup', {
    templateUrl: 'routes/lineup/lineup.html',
    bindings: {
        $router: '<',
        selectedId: '<',
        year: '<',
        season: '<',
    },
    controller: LineupController
});

LineupController.$inject = ['LineupFactory', 'PlayerFactory', '$mdToast', '$mdDialog', 'moment']

function LineupController(LineupFactory, PlayerFactory, $mdToast, $mdDialog, moment) {
    var ctrl = this;
    this.$onChanges = onChanges;
    ctrl.playersPlaying = [];
    ctrl.showDetails = true;
    ctrl.showStats = false;
    ctrl.game = { teams: [] };
    ctrl.playersNotComing = [];
    ctrl.opponentName = '';
    ctrl.loading = true;
    ctrl.lineupConfirmed = false;
    ctrl.showMobile = false;
    ctrl.mobileInning = "1";
    var todayFormatted = moment(new Date()).format('LL');
    ctrl.lineupTitle = "Lineup for " + todayFormatted;

    function onChanges(changes) {
        // console.log("inside onChanges..." + JSON.stringify(changes));
        //ctrl.lineupDate = new Date();

        ctrl.loadLineup();
    }

    ctrl.openMenu = function($mdOpenMenu, ev) {
        originatorEv = ev;
        $mdOpenMenu(ev);
    };

    this.$routerOnActivate = function(next, previous) {
        // console.log("activated: "+ next.params.lineupId);
        ctrl.year = next.params.year;
        ctrl.season = next.params.season;
        ctrl.lineupId = next.params.lineupId;
    }

    ctrl.showLoading = function() {
        ctrl.loading = true;
    }

    ctrl.hideLoading = function() {
        ctrl.loading = false;
    }

    ctrl.resetInning = function(inning) {
        inning.inplay = false;
        inning.pitches = 0;
        inning.batted = false;
        inning.struckout = false;
        inning.scored = false;
        inning.rbis = 0;
        inning.hitlocation = '';
        inning.hittype = '';
        inning.totalbases = 0;
    }

    ctrl.inningBattedChanged = function(inning) {
        if (!inning.batted) {
            inning.inplay = false;
            inning.pitches = 0;
            inning.struckout = false;
            inning.scored = false;
            inning.rbis = 0;
            inning.hitlocation = '';
            inning.hittype = '';
            inning.totalbases = 0;
        }
    }

    ctrl.toggleStats = function() {
        ctrl.showStats = !ctrl.showStats;
    }

    ctrl.loadLineup = function() {
        //console.log("selectedId: " + ctrl.selectedId);
        if (ctrl.selectedId && ctrl.selectedId != -1) {

            ctrl.showLoading();
            LineupFactory.getLineup(ctrl.selectedId).then(function(response) {
                //console.log("response: \n" + JSON.stringify(response));
                response = response.data;
                ctrl.lineupTitle = response.title;
                ctrl.playersPlaying = response.playing;
                ctrl.opponentName = response.opponentName;
                ctrl.playersNotComing = response.notAvailable;
                ctrl.lineupDate = new Date(response.date);
                ctrl.lineupConfirmed = response.confirmed;
                ctrl.year = response.year;
                ctrl.season = response.season;

                ctrl.moveUp = function(currentIndex, player) {
                    ctrl.playersPlaying = ctrl.swap(ctrl.playersPlaying, currentIndex, currentIndex - 1);
                };

                ctrl.moveDown = function(currentIndex, player) {
                    ctrl.playersPlaying = ctrl.swap(ctrl.playersPlaying, currentIndex, currentIndex + 1);
                };

                ctrl.swap = function(array, fromIndex, toIndex) {
                    array.splice(toIndex, 0, array.splice(fromIndex, 1)[0]);
                    return array;
                }


                ctrl.recalculateScore = function() {
                    for (var i = 0; i < ctrl.game.teams.length; i++) {
                        var team = ctrl.game.teams[i];
                        var teamInnings = team.innings;
                        var tmpScore = 0;
                        for (var j = 0; j < teamInnings.length; j++) {
                            var inning = teamInnings[j];
                            if (inning.score && !isNaN(inning.score)) {
                                tmpScore = tmpScore + parseInt(inning.score);
                            } else {
                                continue;
                            }
                            // console.log(team.name + " " + inning.label + " score: " + tmpScore);
                        }
                        team.score = tmpScore;
                        if (team.name == 'Ponytail Express') {
                            ctrl.game.ponytailScore = tmpScore;
                        } else {
                            ctrl.game.opponentName = team.name;
                            ctrl.game.opponentScore = tmpScore;
                        }
                    }
                    // console.log("ponytail score: " + ctrl.game.ponytailScore);
                };

                if (response.game) {
                    ctrl.game = response.game;
                    if (ctrl.game.teams && ctrl.game.teams.length == 0) {
                        var gameInnings = [
                            { score: 0, label: "1st" },
                            { score: 0, label: "2nd" },
                            { score: 0, label: "3rd" },
                            { score: 0, label: "4th" },
                            { score: 0, label: "5th" },
                            { score: 0, label: "6th" },
                        ];
                        var pontytails = {
                            innings: gameInnings,
                            score: 0,
                            name: 'Ponytail Express'
                        };
                        var opponent = {
                            innings: angular.copy(gameInnings),
                            score: 0,
                            name: ctrl.opponentName
                        };
                        ctrl.game.teams = [pontytails, opponent];
                    } else {
                        for (var i = 0; i < ctrl.game.teams.length; i++) {
                            if (ctrl.game.teams[i].name == 'Ponytail Express') {
                                continue;
                            }
                            if (!ctrl.game.teams[i].name || ctrl.game.teams[i].name == '') {
                                ctrl.game.teams[i].name = ctrl.opponentName;
                            }
                        }
                    }
                    //  console.log(JSON.stringify(response.game, null, 2));
                } else {
                    ctrl.game = {
                        ponytailScore: 0,
                        opponentScore: 0,
                        opponentName: "",
                        teams: []

                    };
                    var gameInnings = [
                        { score: 0, label: "1st" },
                        { score: 0, label: "2nd" },
                        { score: 0, label: "3rd" },
                        { score: 0, label: "4th" },
                        { score: 0, label: "5th" },
                        { score: 0, label: "6th" },
                    ];
                    var pontytails = {
                        innings: gameInnings,
                        score: 0,
                        name: 'Ponytail Express'
                    };
                    var opponent = {
                        innings: angular.copy(gameInnings),
                        score: 0,
                        name: ''
                    };
                    ctrl.game.teams = [pontytails, opponent];
                    // console.log("opponent name: " + ctrl.game.teams[1].name);
                }

                ctrl.hideLoading();
                $mdToast.show(
                    $mdToast.simple()
                    .textContent('Loaded lineup for ' + moment(ctrl.lineupDate).format("L"))
                    .position("bottom right")
                    .hideDelay(3000)
                );
            }, function(error) {
                console.log("CAUGHT ERROR: ", error);
            })
        } else {
            ctrl.lineupDate = new Date();
            ctrl.selected = [];
            ctrl.lineupTitle = "Lineup for " + todayFormatted;
            ctrl.hideLoading();
            ctrl.playersNotComing = [];
            ctrl.year = 2017;
            ctrl.season = "Spring";
            ctrl.game = {
                ponytailScore: 0,
                opponentScore: 0,
                opponentName: ""
            };
            //ctrl.lineupDate = new Date();
            PlayerFactory.getPlayerList(ctrl.year, ctrl.season).then(function(response) {
                ctrl.playersPlaying = response.data.players;
            });

        }

    }

    ctrl.toggleLastInnings = function() {
        var numPlaying = ctrl.playersPlaying.length;
        for (var i = 0; i < numPlaying; i++) {
            var player = ctrl.playersPlaying[i];
            //console.log("player: " + player.name + " has " + player.innings.length);
            var numInnings = player.innings.length;
            for (var j = 0; j < numInnings; j++) {
                //.log(player.name + "\tposition: " + player.innings[j].inning)
                if (player.innings[j].inning == 5 || player.innings[j].inning == 6) {
                    player.innings[j].batted = false;
                }
            }
        }
    };

    //console.log("inside LineupController...");
    ctrl.promise = null;

    ctrl.query = {
        order: ''
    }
    ctrl.rowSelect = true;

    ctrl.iconSrc = "signal_wifi_4_bar";

    ctrl.showDiagram = false;
    ctrl.hideToolbar = false;

    ctrl.toggleToolbar = function() {
        ctrl.hideToolbar = true;
    }

    ctrl.toggleIcon = function() {
        if (ctrl.iconSrc == "signal_wifi_4_bar") {
            ctrl.iconSrc = "list";
        } else {
            ctrl.iconSrc = "signal_wifi_4_bar";
        }
    }

    ctrl.removePlayer = function(player, index) {
        //console.log("removing " + player.name + " from index: " + index);
        ctrl.playersPlaying.splice(index, 1);
        ctrl.playersNotComing.push(angular.copy(player));
        ctrl.calculatePositionChoices();
    }

    ctrl.addPlayerToLineup = function(player, index) {
        ctrl.playersNotComing.splice(index, 1);
        ctrl.playersPlaying.push(angular.copy(player));
    }

    ctrl.togglePlayerScoring = function(player) {
        player.showScoring = !player.showScoring;
        if (player.showScoring) {
            player.scoringIcon = "done";
        } else {
            player.scoringIcon = "edit";
        }

    }

    ctrl.toggleDiagram = function() {
        ctrl.showDiagram = !ctrl.showDiagram;
        ctrl.toggleIcon();
        if (ctrl.showDiagram) {
            ctrl.generateDiagram();

        }
    }

    ctrl.checkInning = function(inning) {
        // check to make sure 2 players aren't playing the same position
        var sumTotal = 0;
        var positionMap = {};
        var numPlaying = ctrl.playersPlaying.length;
        for (var i = 0; i < numPlaying; i++) {
            var player = ctrl.playersPlaying[i];
            //console.log("player: " + player.name + " has " + player.innings.length);
            var numInnings = player.innings.length;
            for (var j = 0; j < numInnings; j++) {
                //.log(player.name + "\tposition: " + player.innings[j].inning)
                if (player.innings[j].inning == inning) {
                    var position = player.innings[j].position;
                    //if(inning == 3 && sition == 9 && player.name == "Whitney") console.log(player.name + "  " + JSON.stringify(positionMap))
                    if (!positionMap[position] && position > 0) {
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
        if (sumTotal > 55) {
            for (var position in positionMap) {
                var positionTotal = positionMap[position];
                //if (positionTotal > 1)
                //  console.log("position: " + position + " has " + positionTotal);
            }
        }
        return sumTotal;
    }

    ctrl.validateInning = function(inning) {
        var requiredPositions = ["P", "C", "1B", "2B", "3B", "SS", "LF", "LCF", "RCF", "RF"];
        var numPlayers = ctrl.playersPlaying.length;
        if (numPlayers == 9) {
            requiredPositions = ["P", "C", "1B", "2B", "3B", "SS", "LF", "CF", "RF"];;
        } else if (numPlayers == 8) {
            requiredPositions = ["P", "C", "1B", "2B", "3B", "SS", "LCF", "RCF"];
        }
        for (var i = 0; i < numPlayers; i++) {
            var player = ctrl.playersPlaying[i];
            //console.log("player: " + player.name + " has " + player.innings.length);
            var numInnings = player.innings.length;
            for (var j = 0; j < numInnings; j++) {
                //.log(player.name + "\tposition: " + player.innings[j].inning)
                if (player.innings[j].inning == inning) {
                    var position = player.innings[j];
                    //console.log("position: " + JSON.stringify(position));
                    if (position.position > 0) {
                        var abbr = ctrl.getPositionDisplay(position.position);
                        var numRequired = requiredPositions.length;
                        for (var k = 0; k < numRequired; k++) {
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
        if (requiredPositions && requiredPositions.length > 0) {
            var numRequired = requiredPositions.length;
            for (var i = 0; i < numRequired; i++) {
                if (i > 0) {
                    msg += ', ';
                }
                msg += requiredPositions[i];
            }
        }
        return msg;
    }

    ctrl.positionChoices = [
        { number: 0, abbr: 'BN', name: 'Bench', display: 'sitting' },
        { number: 1, abbr: 'P', name: 'Pitcher', display: 'pitcher' },
        { number: 2, abbr: 'C', name: 'Catcher', display: 'catcher' },
        { number: 3, abbr: '1B', name: 'First Base', display: 'first' },
        { number: 4, abbr: '2B', name: 'Second Base', display: 'second' },
        { number: 5, abbr: '3B', name: 'Third Base', display: 'third' },
        { number: 6, abbr: 'SS', name: 'Shortstop', display: 'short' },
        { number: 7, abbr: 'LF', name: 'Left Field', display: 'left' },
        { number: 8, abbr: 'LCF', name: 'Left Center Field', display: 'leftcenter' },
        { number: 9, abbr: 'RCF', name: 'Right Center Field', display: 'rightcenter' },
        { number: 10, abbr: 'RF', name: 'Right Field', display: 'right' }
    ];

    ctrl.numberChoices = [
        { number: 0 },
        { number: 1 },
        { number: 2 },
        { number: 3 },
        { number: 4 },
        { number: 5 },
        { number: 6 },
        { number: 7 },
        { number: 8 },
        { number: 9 },
        { number: 10 }
    ];

    ctrl.calculatePositionChoices = function() {
        if (ctrl.playersPlaying.length == 9) {
            ctrl.positionChoices = [
                { number: 0, abbr: 'BN', name: 'Bench', display: 'sitting' },
                { number: 1, abbr: 'P', name: 'Pitcher', display: 'pitcher' },
                { number: 2, abbr: 'C', name: 'Catcher', display: 'catcher' },
                { number: 3, abbr: '1B', name: 'First Base', display: 'first' },
                { number: 4, abbr: '2B', name: 'Second Base', display: 'second' },
                { number: 5, abbr: '3B', name: 'Third Base', display: 'third' },
                { number: 6, abbr: 'SS', name: 'Shortstop', display: 'short' },
                { number: 7, abbr: 'LF', name: 'Left Field', display: 'left' },
                { number: 8, abbr: 'CF', name: 'Center Field', display: 'center' },
                { number: 9, abbr: 'RF', name: 'Right Field', display: 'right' }
            ];
        } else if (ctrl.playersPlaying.length == 8) {
            ctrl.positionChoices = [
                { number: 0, abbr: 'BN', name: 'Bench', display: 'sitting' },
                { number: 1, abbr: 'P', name: 'Pitcher', display: 'pitcher' },
                { number: 2, abbr: 'C', name: 'Catcher', display: 'catcher' },
                { number: 3, abbr: '1B', name: 'First Base', display: 'first' },
                { number: 4, abbr: '2B', name: 'Second Base', display: 'second' },
                { number: 5, abbr: '3B', name: 'Third Base', display: 'third' },
                { number: 6, abbr: 'SS', name: 'Shortstop', display: 'short' },
                { number: 7, abbr: 'LCF', name: 'Left Center Field', display: 'leftcenter' },
                { number: 8, abbr: 'RCF', name: 'Right Center Field', display: 'rightcenter' }
            ];
        } else {
            ctrl.positionChoices = [
                { number: 0, abbr: 'BN', name: 'Bench', display: 'sitting' },
                { number: 1, abbr: 'P', name: 'Pitcher', display: 'pitcher' },
                { number: 2, abbr: 'C', name: 'Catcher', display: 'catcher' },
                { number: 3, abbr: '1B', name: 'First Base', display: 'first' },
                { number: 4, abbr: '2B', name: 'Second Base', display: 'second' },
                { number: 5, abbr: '3B', name: 'Third Base', display: 'third' },
                { number: 6, abbr: 'SS', name: 'Shortstop', display: 'short' },
                { number: 7, abbr: 'LF', name: 'Left Field', display: 'left' },
                { number: 8, abbr: 'LCF', name: 'Left Center Field', display: 'leftcenter' },
                { number: 9, abbr: 'RCF', name: 'Right Center Field', display: 'rightcenter' },
                { number: 10, abbr: 'RF', name: 'Right Field', display: 'right' }
            ];
        }
    }

    ctrl.deleteLineup = function(ev) {
        var confirm = $mdDialog.confirm()
            .textContent('Would you like to delete this lineup?')
            .ariaLabel('Lucky day')
            .targetEvent(ev)
            .ok('OK')
            .cancel("Eeek!  Don't Delete!");

        $mdDialog.show(confirm).then(function() {
            LineupFactory.deleteLineup(ctrl.selectedId).then(function(response) {
                $mdToast.show(
                    $mdToast.simple()
                    .textContent('Lineup Deleted')
                    .position("bottom right")
                    .hideDelay(3000)
                );
                ctrl.refresh();
            });
        }, function() {

        });

    };

    ctrl.clearStats = function() {
        var num = ctrl.playersPlaying.length;
        for (var i = 0; i < num; i++) {
            var player = ctrl.playersPlaying[i];
            player.hits = 0;
            player.ks = 0;
            player.rbis = 0;
            player.runs = 0;
            player.abs = 0;
        }
    }

    ctrl.showHittingStats = false;

    ctrl.save = function() {
        //console.log("inside save...")
        var lineupDate = moment(ctrl.lineupDate).format("MM/DD/YYYY");
        var playersPlaying = ctrl.playersPlaying;
        var playersNotComing = ctrl.playersNotComing;
        var lineupTitle = ctrl.lineupTitle;
        var lineupConfirmed = ctrl.lineupConfirmed;
        var opponentName = ctrl.opponentName;
        var game = ctrl.game;
        // console.log("opponentName:  " + ctrl.opponentName);

        var year = ctrl.year;
        var season = ctrl.season;
        LineupFactory.saveLineup(ctrl.selectedId, year, season, game, lineupConfirmed, opponentName, lineupTitle, lineupDate, playersPlaying, playersNotComing).then(function(response) {
            //console.log("saved!");
            $mdToast.show(
                $mdToast.simple()
                .textContent('Saved lineup for ' + moment(ctrl.lineupDate).format("MM/DD/YYYY"))
                .position("bottom right")
                .hideDelay(3000)
            );
        });
    }

    ctrl.saveCopy = function() {
        // console.log("inside save...")
        var lineupDate = moment(ctrl.lineupDate).format("MM/DD/YYYY");
        var playersPlaying = ctrl.playersPlaying;
        var playersNotComing = ctrl.playersNotComing;
        var lineupTitle = ctrl.lineupTitle;
        var opponentName = ctrl.opponentName;
        var game = {
            ponytailScore: 0,
            opponentScore: 0,
            opponentName: "",
            teams: []
        };
        var gameInnings = [
            { score: 0, label: "1st" },
            { score: 0, label: "2nd" },
            { score: 0, label: "3rd" },
            { score: 0, label: "4th" },
            { score: 0, label: "5th" },
            { score: 0, label: "6th" },
        ];
        var pontytails = {
            innings: gameInnings,
            score: 0,
            name: 'Ponytail Express'
        };
        var opponent = {
            innings: angular.copy(gameInnings),
            score: 0,
            name: ''
        };
        ctrl.game.teams = [pontytails, opponent];

        var year = ctrl.year;
        var season = ctrl.season;
        LineupFactory.saveLineup(-1, year, season, game, false, opponentName, lineupTitle, lineupDate, playersPlaying, playersNotComing).then(function(response) {
            console.log("saved!");
            $mdToast.show(
                $mdToast.simple()
                .textContent('Saved lineup copy for ' + moment(ctrl.lineupDate).format("MM/DD/YYYY"))
                .position("bottom right")
                .hideDelay(3000)
            );
        });
    }

    ctrl.innings = [
        { number: 1, playing: [], sitting: [] },
        { number: 2, playing: [], sitting: [] },
        { number: 3, playing: [], sitting: [] },
        { number: 4, playing: [], sitting: [] },
        { number: 5, playing: [], sitting: [] },
        { number: 6, playing: [], sitting: [] }
    ];

    ctrl.generateDiagram = function() {
        var num = ctrl.innings.length;
        for (var i = 0; i < num; i++) {
            var inning = ctrl.innings[i];
            var inningPlayers = ctrl.getPlayersForInning(inning.number);
            inning.playing = inningPlayers.playing;
            inning.sitting = inningPlayers.sitting;
        }
    };

    ctrl.getClass = function(p) {
        return p.player.lowercasename + " mylabel" + " " + p.position;
    }
    ctrl.getPlayersForInningCheck = function(number) {
        var playing = [];
        var sitting = [];
        var map = {};
        var msg = [];
        var numInnings = 0;
        //console.log("inning: "+ number);
        var numPlaying = ctrl.playersPlaying.length;
        for (var i = 0; i < numPlaying; i++) {
            var player = ctrl.playersPlaying[i];
            numInnings = player.innings.length;
            // console.log("player: " + player.name + " has " + player.innings.length);
            for (var j = 0; j < numInnings; j++) {
                //.log(player.name + "\tposition: " + player.innings[j].inning)
                if (player.innings[j].inning == number) {
                    var position = player.innings[j];
                    if (position.position > 0) {
                        var positionDisplay = ctrl.getPositionDisplay(position.position);
                        if (!map[positionDisplay]) {
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
            for (var i = 0; i < msg.length; i++) {
                if (i > 0) {
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
    ctrl.getPlayersForInning = function(number) {
        var playing = [];
        var sitting = [];
        var numInnings = 0;
        var player = null;
        //console.log("inning: "+ number);
        var numPlaying = ctrl.playersPlaying.length;
        //console.log("inning: "+ number);
        for (var i = 0; i < numPlaying; i++) {
            player = ctrl.playersPlaying[i];
            numInnings = player.innings.length;
            //console.log("player: " + player.name + " has " + player.innings.length);
            for (var j = 0; j < numInnings; j++) {
                //.log(player.name + "\tposition: " + player.innings[j].inning)
                if (player.innings[j].inning == number) {
                    var position = player.innings[j];
                    if (position.position > 0) {

                        player.lowercasename = player.name.toLowerCase();

                        //console.log(number + "\tadding: " + player.name);
                        playing.push({ player: player, position: ctrl.getFullPositionName(position.position) });
                    } else {
                        sitting.push(player);
                    }
                }
            }

        }
        return { playing: playing, sitting: sitting };
    }

    ctrl.getNumOutfieldInnings = function(player) {
        var positions = player.innings;
        var num = 0;
        var numOutfield = positions.length;
        for (var i = 0; i < numOutfield; i++) {
            if (positions[i].position > 6) {
                num++;
            }
        }
        return num;
    }

    ctrl.getNumBenchInnings = function(player) {
        var positions = player.innings;
        var numPositions = positions.length;
        var totalBenchInnings = 0;
        for (var i = 0; i < numPositions; i++) {

            if (positions[i].position == 0) {
                totalBenchInnings++;
            }
        }
        return totalBenchInnings;
    }

    ctrl.isOutfieldMet = function(player) {
        var positions = player.innings;
        var numPlayers = ctrl.playersPlaying.length;
        var numPositions = positions.length;
        var minInning = 3;
        if (numPlayers < 12) {
            minInning = 4;
        }
        var good = false;
        for (var i = 0; i < numPositions; i++) {

            if (parseInt(positions[i].inning) <= minInning && positions[i].position > 6) {
                good = true;
                break;
            }
        }
        return good ? "yes" : "no";
    }

    ctrl.getFullPositionName = function(number) {
        var numChoices = ctrl.positionChoices.length;
        for (var i = 0; i < numChoices; i++) {
            if (ctrl.positionChoices[i].number == number) {
                return ctrl.positionChoices[i].display;
            }
        }
    };

    ctrl.getPositionDisplay = function(number) {
        var numChoices = ctrl.positionChoices.length;
        for (var i = 0; i < numChoices; i++) {
            if (ctrl.positionChoices[i].number == number) {
                return ctrl.positionChoices[i].abbr;
            }
        }
    };

    ctrl.getInningTotal = function(inning) {
        var total = 0;
        var numInnings = 0;
        var numPlaying = ctrl.playersPlaying.length;
        for (var i = 0; i < numPlaying; i++) {
            var player = ctrl.playersPlaying[i];
            //console.log("[player]: " + JSON.stringify(player));
            if (player && player.innings) {
                var innings = player.innings;

                if (!innings) {
                    innings = [];
                }
                numInnings = innings.length;
                for (var j = 0; j < numInnings; j++) {
                    if (innings[j].inning == inning) {
                        total += innings[j].position;
                    }
                }
            }
        }
        return total;
    }


    ctrl.getRestrictedPositions = function(player) {
        var innings = player.innings;
        var pos = [];
        var numInnings = innings.length;
        for (var i = 0; i < numInnings; i++) {
            if (innings[i].position == 1 || innings[i].position == 3 || innings[i].position == 4) {
                pos.push(innings[i].position);
            }

        }
        pos = pos.sort();
        var disp = '';
        if (pos.length == 0) {
            return 'NONE';
        }
        for (var j = 0; j < pos.length; j++) {
            if (j > 0) {
                disp += ', ';
            }
            disp += ctrl.getPositionDisplay(pos[j]);
        }
        return disp;
    }


    ctrl.$routerOnActivate = function(toRoute, fromRoute) {
        this.name = toRoute.params.name;
    };
}