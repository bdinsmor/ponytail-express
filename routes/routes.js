var moment = require('moment');
var path = require("path");
var nodemailer = require('nodemailer');
var mongodb = require("mongodb");
var _ = require("underscore");
var ObjectID = mongodb.ObjectID;
var Q = require('q');
//var a = require('./analytics');
var PLAYERS_COLLECTION = "players";
var LINEUP_COLLECTION = "lineups";


function createPlayerInnings() {
  return [
    { inning: 1, position: 1, struckout: false, },
    { inning: 2, position: 2 },
    { inning: 3, position: 3 },
    { inning: 4, position: 4 },
    { inning: 5, position: 5 },
    { inning: 6, position: 6 }
  ];
}

var positionChoices = [
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

function getPositionDisplay(number) {
  if (isNaN(number)) {
    return number;
  }
  for (var i = 0; i < positionChoices.length; i++) {
    if (positionChoices[i].number == number) {
      return positionChoices[i].abbr;
    }
  }
};

function getPosition(number) {
  var label = '';
  //console.log("number: " + number);
  switch (parseInt(number)) {
    case 0:
      label = "bench";
      break;
    case 1:
      label = "pitcher";
      break;
    case 2:
      label = "catcher";
      break;
    case 3:
      label = "first";
      break;
    case 4:
      label = "second";
      break;
    case 5:
      label = "third";
      break;
    case 6:
      label = "shortstop";
      break;
    case 7:
      label = "left";
      break;
    case 8:
      label = "leftcenter";
      break;
    case 9:
      label = "rightcenter";
      break;
    case 10:
      label = "right";
      break;
  };
  return label;
}

var appRouter = function (app, db) {

  app.get("/", function (req, res) {
    var fileName = path.join(__dirname + '/../dist/index.html');
    console.log("inside root get request: " + fileName);
    res.sendFile(fileName);
  })

  // Generic error handler used by all endpoints.
  function handleError(res, reason, message, code) {
    console.log("ERROR: " + reason);
    res.status(code || 500).json({ "error": message });
  }

  app.get('/lineups', function (req, res) {
    db.collection(LINEUP_COLLECTION).find({}).toArray(function (err, docs) {
      if (err) {
        console.log("caught error getting lineups: " + err);
        handleError(res, err.message, "Failed to get lineups.");
      } else {
        var len = docs.length;
        var lineupsByDate = {};
        var lineups = [];
        for (var i = 0; i < len; i++) {
          var doc = docs[i];
          var date = doc.date;
          var mth = moment(new Date(date)).month();
          var month = moment(new Date(date)).format('MMMM');
          if (!lineupsByDate[mth]) {
            lineupsByDate[mth] = { month: month, lineups: [doc] };
          } else {
            lineupsByDate[mth].lineups.push(doc);
          }
        }
        Object.keys(lineupsByDate).forEach(function (key, index) {
          // key: the name of the object key
          var monthLineups = lineupsByDate[key].lineups;
          monthLineups = _.sortBy(monthLineups, function (o) { return new Date(o.date) }).reverse();
          lineups.push({ mth: key, month: lineupsByDate[key].month, lineups: monthLineups });
          // index: the ordinal position of the key within the object 
        });
        lineups = _.sortBy(lineups, function (o) { return o.mth; }).reverse();
        res.status(200).json(lineups);
      }
    });
  });

  app.get('/player/stats/:id', function (req, res) {
    var id = req.params.id;
    db.collection(LINEUP_COLLECTION).find({ confirmed: true }).toArray(function (err, lineups) {
      var num = lineups.length;
      // console.log('num lineups: ' + num);
      var pitchMap = {};
      var hitMap = {};
      var outMap = {};
      var inplayMap = {};
      var stats = {
        hits: {
          data: [],
          labels: [1, 2, 3, 4, 5]
        },
        outs: {
          data: [],
          labels: [1, 2, 3, 4, 5]
        },
        inplay: {
          data: [],
          labels: [1, 2, 3, 4, 5]
        },
        pitches: {
          data: [],
          labels: []
        }
      };

      for (var i = 0; i < num; i++) {
        var lineup = lineups[i];
        //console.log("lineup: " + JSON.stringify(lineup,null,2));
        var players = lineup.playing;
        for (var j = 0; j < players.length; j++) {
          var player = players[j];
          // console.log(lineup.title + "\t" + player.name + "\tplayerId: " + id + " == " + player._id);
          if (player._id == id || player.id == id) {
            //  console.log("found player: " + player.name);
            if (!player.innings)
              player.innings = player.positions;
            var numInnings = player.innings.length;
            for (var k = 0; k < numInnings; k++) {
              var inning = player.innings[k];
              if (!inning.batted || inning.pitches == 0) {
                continue;
              }
              var pitches = inning.pitches;
              var hitlocation = getPositionDisplay(inning.hitlocation);
              var hittype = inning.hittype;
              // console.log("hitlocation:  " + hitlocation);
              // console.log("hittype: " + hittype);
              if (pitchMap[pitches]) {
                pitchMap[pitches] = parseInt(pitchMap[pitches]) + 1;
              } else {
                pitchMap[pitches] = 1;
              }
              if (inning.struckout) {
                if (outMap['K']) {
                  outMap['K'] = parseInt(outMap['K']) + 1;
                } else {
                  outMap['K'] = 1;
                }
                continue;
              }
              if (inning.inplay) {
                if (inplayMap[hitlocation]) {
                  inplayMap[hitlocation] = parseInt(inplayMap[hitlocation]) + 1;
                } else {
                  inplayMap[hitlocation] = 1;
                }
                if (hittype && hittype == 'OUT') {
                  if (outMap[hitlocation]) {
                    outMap[hitlocation] = parseInt(outMap[hitlocation]) + 1;
                  } else {
                    outMap[hitlocation] = 1;
                  }
                } else {
                  if (hitMap[hitlocation]) {
                    // console.log("has hitlocation: " + hitlocation);
                    hitMap[hitlocation] = parseInt(hitMap[hitlocation]) + 1;
                  } else {
                    hitMap[hitlocation] = 1;
                    // console.log(hitlocation + " hit map");
                  }
                }
              } else {
                // console.log(hitlocation + " not in play");
              }

            }
            break;
          }

        }

      }
     //  console.log("hitmap: " + JSON.stringify(outMap, null, 2));
      stats.hits.data = _.values(hitMap);
      stats.hits.labels = _.keys(hitMap);
      stats.outs.data = _.values(outMap);
      stats.outs.labels = _.keys(outMap);
      stats.inplay.data = _.values(inplayMap);
      stats.inplay.labels = _.keys(inplayMap);
      stats.pitches.data = _.values(pitchMap);
      stats.pitches.labels = _.keys(pitchMap);
      // console.log("stats: " + JSON.stringify(stats,null,2));

      res.json(stats);
    });
  });

  app.get('/stats', function (req, res) {
    var inningsToCheck = 4;
    var stats = {

    };
    var teamStats = {
      abs: 0,
      hits: 0,
      runs: 0,
      rbis: 0,
      totalbases: 0,
      mostRecentAbs: 0,
      mostRecentGames: 0,
      mostRecentHits: 0,
      ks: 0
    };
    var mostRecent = {

    };
    // get each lineup, iterate over it and total up the number of innings in the first 4 innings at each position
    db.collection(LINEUP_COLLECTION).find({}).toArray(function (err, lineups) {
      // console.log("number of lineups:  "+ lineups.length);
      lineups = _.sortBy(lineups, function (o) { return o.date }).reverse();
      var numLineups = lineups.length;
      for (var i = 0; i < numLineups; i++) {
        var lineup = lineups[i];
        //console.log("lineup date: " + moment(lineup.date).format("MM-DD-YYYY"));
        if (!lineup.confirmed) {
          continue;
        }
        //console.log("players: " + JSON.stringify(lineup,null,2));
        var players = lineup.playing;
        for (var j = 0; j < players.length; j++) {
          var player = players[j];
          var name = player.name;
          //  console.log("player: " + JSON.stringify(player,null,2));
          if (!stats[name]) {
            stats[name] = {
              abs: 0,
              hits: 0,
              totalbases: 0,
              mostRecentHits: 0,
              mostRecentAbs: 0,
              mostRecentGames: 0,
              ks: 0,
              rbis: 0,
              runs: 0,
              pitcher: 0,
              catcher: 0,
              first: 0,
              second: 0,
              third: 0,
              shortstop: 0,
              left: 0,
              leftcenter: 0,
              rightcenter: 0,
              right: 0,
              restricted: 0,
              outfield: 0,
              bench: 0
            };

          }
          if (!player.innings) {
            player.innings = player.positions;
          }
          var innings = player.innings;
          for (var k = 0; k < inningsToCheck; k++) {
            var position = innings[k].position;

            var label = getPosition(position);
            // console.log("position: " + position + "\tlabel: " + label);
            stats[name][getPosition(position)] = stats[name][getPosition(position)] + 1;
            if (position == 1 || position == 3 || position == 5) {
              stats[name].restricted = parseInt(stats[name].restricted) + 1;
            } else if (position >= 7) {
              stats[name].outfield = parseInt(stats[name].outfield) + 1;
            }

          }
          if (!stats[name].mostRecentGames || stats[name].mostRecentGames < 3) {
            stats[name].mostRecentGames = stats[name].mostRecentGames + 1;
            //if (stats[name].mostRecentHits) {
            stats[name].mostRecentHits = stats[name].mostRecentHits + player.hits;
            //console.log(name + " " + lineup.date + " most recent hits: " + stats[name].mostRecentHits);
            //}
            //if (player.abs && stats[name].mostRecentAbs) {
            stats[name].mostRecentAbs = stats[name].mostRecentAbs + player.abs;
            //console.log(name + " " + lineup.date + " most recent at bats: " + stats[name].mostRecentAbs);
            //}
          }
          if (!teamStats.mostRecentGames || teamStats.mostRecentGames < 3) {
            teamStats.mostRecentGames = teamStats.mostRecentGames + 1;
            //if (stats[name].mostRecentHits) {
            teamStats.mostRecentHits = teamStats.mostRecentHits + player.hits;
            //console.log(name + " " + lineup.date + " most recent hits: " + stats[name].mostRecentHits);
            //}
            //if (player.abs && stats[name].mostRecentAbs) {
            teamStats.mostRecentAbs = teamStats.mostRecentAbs + player.abs;
            //console.log(name + " " + lineup.date + " most recent at bats: " + stats[name].mostRecentAbs);
            //}
          }
          if (player.totalbases) {
            teamStats.totalbases = teamStats.totalbases + player.totalbases;
            stats[name].totalbases = stats[name].totalbases + player.totalbases;
          }
          if (player.hits) {
            teamStats.hits = teamStats.hits + player.hits;
            stats[name].hits = stats[name].hits + player.hits;
            //console.log(name + ": " + stats[name].mostRecentGames);

          }
          //  console.log(name + "hits: " + stats[name].hits);
          if (player.ks) {
            teamStats.ks = teamStats.ks + player.ks;
            stats[name].ks = stats[name].ks + player.ks;

          }

          if (player.abs) {
            teamStats.abs = teamStats.abs + player.abs;
            stats[name].abs = stats[name].abs + player.abs;
          }

          if (player.runs) {
            teamStats.runs = teamStats.runs + player.runs;
            stats[name].runs = stats[name].runs + player.runs;
          }
          if (player.rbis) {
            teamStats.rbis = teamStats.rbis + player.rbis;
            stats[name].rbis = stats[name].rbis + player.rbis;

          }

          stats[name].name = name;
        }
      }
      var finalStats = [];
      Object.keys(stats).forEach(function (key, index) {
        // key: the name of the object key
        var stat = stats[key];
        if (!stat.abs) {
          stat.abs = 0;
        }
        if (!stat.hits) {
          stat.hits = 0;
        }
        if (!stat.ks) {
          stat.ks = 0;
        }
        if (!stat.runs) {
          stat.runs = 0;
        }
        if (!stat.rbis) {
          stat.rbis = 0;
        }
        if (!stat.avg) {
          stat.avg = (stat.hits / stat.abs).toFixed(3);
        }
        if (!stat.recentAvg) {
          stat.recentAvg = (stat.mostRecentHits / stat.mostRecentAbs).toFixed(3);
        }
        //  console.log("stat: " + JSON.stringify(stat,null,2));
        finalStats.push(stat);
        finalStats = _.sortBy(finalStats, function (o) { return o.hits }).reverse();

      });
      teamStats.avg = (teamStats.hits / teamStats.abs).toFixed(3);
      teamStats.recentAvg = (teamStats.mostRecentHits / teamStats.mostRecentAbs).toFixed(3);
      //  console.log("team stats: " + JSON.stringify(teamStats,null,2));
      res.status(200).json({ stats: finalStats, teamStats: teamStats });
    });

  })

  app.get('/lineup/:id', function (req, res) {
    var id = req.params.id;

    // console.log("retrieving lineup for id: " + id);
    db.collection(LINEUP_COLLECTION).findOne({ _id: new ObjectID(id) }, function (err, doc) {
      if (err) {
        handleError(res, err.message, "Failed to get lineup.");
      } else {
        var players = [];
        _.each(doc.playing, function (player) {
          player.scoringIcon = "done";
          player.showScoring = true;
          //   console.log("player: " + JSON.stringify(player,null,2));
          if (!player.hits) {
            player.hits = 0;
          }
          if (!player.ks) {
            player.ks = 0;
          }
          if (!player.runs) {
            player.runs = 0;
          }
          if (!player.rbis) {
            player.rbis = 0;
          }
          if (!player.innings)
            player.innings = player.positions;
          var numInnings = player.innings.length;
          for (var i = 0; i < numInnings; i++) {
            if (!player.innings[i].batted) {
              //player.innings[i].batted = true;
              //console.log("could not find batting for:  "+ player.name);
            } else {
              // console.log("FOUND batting for:  "+ player.name);
            }
            if (!player.innings[i].struckout) {
              player.innings[i].struckout = false;
            }
            if (!player.innings[i].hit) {
              player.innings[i].hit = false;
            }
            if (!player.innings[i].pitches) {
              player.innings[i].pitches = 0;
            }
            if (!player.innings[i].inplay) {
              player.innings[i].inplay = false;
            }
            if (!player.innings[i].hitlocation) {
              player.innings[i].hitlocation = 'P';
            }
            if (!player.innings[i].scored) {
              player.innings[i].scored = false;
            }
            if (!player.innings[i].rbis) {
              player.innings[i].rbis = 0;
            }
            if (!player.innings[i].totalbases) {
              player.innings[i].totalbases = 0;
            }


          }
          players.push(player);
        });
        doc.playing = players;
        //  console.log("lineup: " + JSON.stringify(doc,null,2));
        res.status(200).json(doc);
      }
    });
  })

  app.delete('/lineup/:id', function (req, res) {
    var id = req.params.id;
    db.collection(LINEUP_COLLECTION).removeOne({ "_id": ObjectID(id) }, function (err, results) {
      if (err) {
        handleError(res, err.message, "Failed to delete lineup.");
      } else {
        res.status(200).json({ status: "ok" });
      }
    });
  });

  app.post("/lineup", function (req, res) {
    var data = req.body;
    var date = data.date;
    var opponentName = data.opponentName;
    var title = data.title;
    var confirmed = data.confirmed;
    var game = data.game;

    if (parseInt(game.ponytailScore) > parseInt(game.opponentScore)) {
      game.result = 'W';
    } else if (parseInt(game.ponytailScore) < parseInt(game.opponentScore)) {
      game.result = 'L';
    } else {
      game.result = 'T';
    }


    //console.log("game: " + JSON.stringify(game, null, 2));
    var year = data.year;
    var season = data.season;

    var id = data.id;
    date = moment(new Date(date)).format("MM/DD/YYYY");
    var playersPlaying = data.players;
    var innings = [];
    //var atbats = [];
    var numInnings = 0;
    var numPlayers = playersPlaying.length;
    for (var i = 0; i < numPlayers; i++) {
      var player = playersPlaying[i];
      player.abs = 0;
      player.hits = 0;
      player.rbis = 0;
      player.totalbases = 0;
      player.runs = 0;
      player.ks = 0;
      innings = player.innings;
      numInnings = innings.length;
      for (var j = 0; j < numInnings; j++) {
        var inning = innings[j];
        // console.log("inning: " + JSON.stringify(inning,null,2));
        if (inning.batted) {
          player.abs = player.abs + 1;
          //console.log(player.name + " now has " + player.abs + " at bats");
        } else {
          continue;
        }
        // console.log(player.name + " " + inning.inning);
        /* var atbat = {
          inning: inning.inning,
          playerId: player.id,
          playerName: player.name,
          ponytailScore: game.ponytailScore,
          opponentName: game.opponentName,
          opponentScore: game.opponentScore,
          inplay: inning.inplay,
          scored: inning.scored,
          totalbases: inning.totalbases,
          rbis: inning.rbis,
          hit: inning.hittype != "OUT",
          hittype: inning.hittype,
          location: inning.hitlocation,
          numpitches: inning.pitches,
          date: date, 
          dayOfWeek: moment(new Date(date)).day(),
          year: year,
          season: season
        };
        atBats.push(atbat);*/

        if (inning.scored) {
          player.runs = player.runs + 1;
        }
        if (inning.struckout) {
          player.ks = player.ks + 1;
        } else if (inning.batted && inning.inplay && inning.hittype != "OUT") {
          player.hits = parseInt(player.hits) + 1;
        }
        player.pitches = parseInt(player.pitches) + parseInt(inning.pitches);
        player.totalbases = parseInt(player.totalbases) + parseInt(inning.totalbases);
        player.rbis = parseInt(player.rbis) + parseInt(inning.rbis);

      }
      //console.log("player: " + JSON.stringify(player,null,2));
    }
    var notPlaying = data.notPlaying;
    var lineup = {
      year: year,
      season: season,
      game: game,
      opponentName: opponentName,
      title: title,
      date: date,
      playing: playersPlaying,
      notAvailable: notPlaying,
      confirmed: confirmed
    };
    Promise.all(_.map(playersPlaying, function (player) {
      return getPlayerId(player);
    })).then(function (done) {
      //console.log("done: " + JSON.stringify(playersPlaying,null,2));
      // a.insertAtBats(atbat).then(function(allDone) {
      db.collection(LINEUP_COLLECTION).updateOne({ _id: new ObjectID(id) }, lineup, { upsert: true }, function (err, r) {
        if (err) {
          handleError(res, err.message, "Failed to create new lineup.");
        } else {
          res.status(201).json(r.upsertedCount);
        }
      });
      // });
      //console.log("playersPlaying:  " + JSON.stringify(playersPlaying, null, 2));

    });
    //console.log("inside lineup POST request: " + JSON.stringify(lineup));


  });

  function getPlayerId(player) {
    var deferred = Q.defer();
    // if (player._id && player._id == '') {
    //   deferred.resolve({ status: 'ok' });
    // } else {
    db.collection(PLAYERS_COLLECTION).findOne({ name: player.name, "year": "2016", "season": "Fall" }, function (err, doc) {
      if (err || !doc) {
        deferred.reject({});
      }
      player._id = doc._id;
      player.id = doc._id;
      player.name = doc.name;
      // console.log("player: " + JSON.stringify(player,null,2));
      deferred.resolve({ status: 'ok' });
    });
    // }
    return deferred.promise;
  }

  app.get("/players/list", function (req, res) {
    var yr = req.query.year;
    var ss = req.query.season;
    var query = {
      "year": yr,
      "season": ss
    };
    var list = {
      players: []
    };

    db.collection(PLAYERS_COLLECTION).find(query).toArray(function (err, docs) {
      if (err) {
        handleError(res, err.message, "Failed to get players.");
      } else {
        // console.log("returning players: " + docs.length);
        var num = docs.length;
        for (var i = 0; i < num; i++) {
          var bd = moment(docs[i].birthDate);
          var age = moment().diff(bd, 'years');
          var daysUntilBday = moment().diff(bd, 'days');
          docs[i].age = age;
          docs[i].daysUntilBday = daysUntilBday;
          // console.log("docs[" + i + "]: " + JSON.stringify(docs[i].daysUntilBday, null, 2));
        }
        docs = _.sortBy(docs, function (o) {
          return new Date(o.birthDate);
        });
        for (var i = 0; i < num; i++) {
          docs[i].hits = 0;
          docs[i].ks = 0;
          docs[i].abs = 0;
          docs[i].rbis = 0;
          docs[i].runs = 0;
          docs[i].innings = createPlayerInnings();
        }
        res.status(200).json({ players: docs });
      }
    });



  });

  app.get("/players", function (req, res) {
    //	console.log("inside GET request to /players...")
    var yr = req.query.year;
    var ss = req.query.season;
    var query = {
      "year": yr,
      "season": ss
    };
    //console.log("query: " + JSON.stringify(query, null, 2));
    db.collection(PLAYERS_COLLECTION).find(query).toArray(function (err, docs) {
      if (err) {
        handleError(res, err.message, "Failed to get players.");
      } else {
        // console.log("returning players: " + docs.length);
        var num = docs.length;
        for (var i = 0; i < num; i++) {
          var bd = moment(docs[i].birthDate);
          var thisYear = moment().year();
          var nextBd = moment(docs[i].birthDate).year(thisYear);
          // console.log("this year:  "+ nextBd.format('MM DD YYYY'));
          var age = moment().diff(bd, 'years');
          if (moment().isAfter(nextBd)) {
            nextBd.year((thisYear + 1));
            // console.log(docs[i].name + " already had birthday this year");
          } else {
            //console.log(docs[i].name + " did NOT have bday yet");
          }

          docs[i].daysUntilBday = nextBd.diff(moment(), "days");
          //console.log(docs[i].name + " days until bday: " + docs[i].daysUntilBday);

          docs[i].age = age;

        }
        res.status(200).json(docs);
      }
    });
  });

  app.post('/players/email', function (req, res) {
    var email = req.body;
    var transporter = nodemailer.createTransport('smtps://bdinsmor%40gmail.com:Calvin8er!@smtp.gmail.com');

    // setup e-mail data with unicode symbols
    var mailOptions = {
      from: '"Coach Brian" <bdinsmor@gmail.com>', // sender address
      to: email.to,
      bcc: email.bcc, // list of receivers
      subject: email.subject, // Subject line
      text: email.body // plaintext bod
    };
    //console.log("email: " + JSON.stringify(mailOptions,null,2));
    //  res.json({ status: 'sent' });
    // send mail with defined transport object
    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        return console.log(error);
      }
      console.log('Message sent: ' + info.response);
      res.json({ status: 'sent' });
    });
  })

  app.post("/players", function (req, res) {
    var newplayer = req.body;
    //console.log("newplayer: " + JSON.stringify(newplayer, null, 2));
    var season = req.body.season;
    var year = req.body.year;
    newplayer.createDate = new Date();

    if (!(req.body.name)) {
      handleError(res, "Invalid user input", "Must provide a name.", 400);
    }
    var query = {};
    if (newplayer._id) {
      query = {
        _id: new ObjectID(newplayer._id)
      };
      newplayer._id = new ObjectID(query._id);
      //console.log("trying to update: " + JSON.stringify(query, null, 2));
      db.collection(PLAYERS_COLLECTION).update(query, newplayer, { upsert: true }, function (err, doc) {
        if (err) {
          handleError(res, err.message, "Failed to create new player.");
        } else {
          res.status(201).json(doc);
        }
      });
    } else {
      db.collection(PLAYERS_COLLECTION).insert(newplayer, function (err, doc) {
        if (err) {
          handleError(res, err.message, "Failed to create new player.");
        } else {
          res.status(201).json(doc);
        }
      });
    }

  });

  /*  "/players/:id"
   *    GET: find player by id
   *    PUT: update player by id
   *    DELETE: deletes player by id
   */

  app.get("/players/:id", function (req, res) {
    db.collection(PLAYERS_COLLECTION).findOne({ _id: new ObjectID(req.params.id) }, function (err, doc) {
      if (err) {
        handleError(res, err.message, "Failed to get player");
      } else {
        res.status(200).json(doc);
      }
    });
  });

  app.put("/players/:id", function (req, res) {
    var updateDoc = req.body;
    delete updateDoc._id;

    db.collection(PLAYERS_COLLECTION).updateOne({ _id: new ObjectID(req.params.id) }, updateDoc, function (err, doc) {
      if (err) {
        handleError(res, err.message, "Failed to update player");
      } else {
        res.status(204).end();
      }
    });
  });

  app.delete("/player/:id", function (req, res) {
    db.collection(PLAYERS_COLLECTION).deleteOne({ _id: new ObjectID(req.params.id) }, function (err, result) {
      if (err) {
        handleError(res, err.message, "Failed to delete player");
      } else {
        res.status(204).end();
      }
    });
  });
}

module.exports = appRouter;