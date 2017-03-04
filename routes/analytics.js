//https://3o1oombveh:ndrgs1qdln@sandbox-cluster-4062339680.us-east-1.bonsaisearch.net
var sequence = require('es-sequence');
var elasticsearch = require('elasticsearch');
var client = new elasticsearch.Client({
    host: 'https://3o1oombveh:ndrgs1qdln@sandbox-cluster-4062339680.us-east-1.bonsaisearch.net',
    log: 'error'
});

sequence.init(client);

module.exports = {
    insertAtBats: function (atbats) {
        /*
        playerId
        inning
        ponytailscore
        opponentscore
        date
        day of week
        numpitches
        inplay
        hit
        hittype
        strikeout
        location
        totalbases
        rbis
        scored

 

 var body = {
            atbat: {
                properties: {
                    playerId: { "type": "string", "index": "not_analyzed" },
                    playerName: { "type": "string", "index": "not_analyzed" },
                    opponentName: { "type": "string", "index": "not_analyzed" },
                    location: { "type": "string", "index": "not_analyzed" },
                    numpitches: { "type": "integer", "index": "not_analyzed" },
                    inning: { "type": "integer", "index": "not_analyzed" },
                    date: { "type": "date" },
                    rbis: { "type": "integer", "index": "not_analyzed" },
                    totalbases: { "type": "integer", "index": "not_analyzed" },
                    dayOfWeek: { "type": "integer", "index": "not_analyzed" },
                    year: { "type": "integer", "index": "not_analyzed" },
                    season: { "type": "string", "index": "not_analyzed" },
                    inplay: { "type": "boolean", "index": "not_analyzed" },
                    hit: { "type": "boolean", "index": "not_analyzed" },
                    strikeout: { "type": "boolean", "index": "not_analyzed" },
                    scored: { "type": "boolean", "index": "not_analyzed" },
                    opponentScore: { "type": "integer", "index": "not_analyzed" },
                    ponytailScore: { "type": "integer", "index": "not_analyzed" }

                }
            }
        }
*/

        /*client.indices.create({ 'index': 'atbats' }).then(function (createResponse) {
            console.log("creatd index");
            client.indices.putMapping({ index: "atbats", type: "atbat", body: body });
        });*/
    var bulkOps = [];
       for(var i = 0; i < atbats.length; i++) {
           var atbat = atbats[i];
           var doc = {

            playerId: atbat.playerId,
            playerName: atbat.playerName,
            inning: atbat.inning,
            ponytailScore: atbat.ponytailScore,
            opponentScore: atbat.opponentScore,
            opponentName: atbat.opponentName,
            numpitches: atbat.numpitches,
            inplay: atbat.inplay,
            strikeout: atbat.strikeout,
            hit: atbat.hit,
            hittype: atbat.hittype,
            location: atbat.location,
            totalbases: atbat.totalbases,
            rbis: atbat.rbis,
            scored: atbat.scored,
            date: new Date(atbat.date),
            dayOfWeek: atbat.dayOfWeek,
            year: atbat.year,
            season: atbat.season

        };
        
        bulkOps.push({ index:  { _index: 'atbats', _type: 'atbat', _id: 1 } });
        bulkOps.push({ doc: { title: 'foo' } });
       }

        
      //  console.log("insert at bat: " + JSON.stringify(doc, null, 2));
        return sequence.get('atbat_id').then(function (atBatId) {
            return client.create({
                index: 'atbats',
                type: 'atbat',
                id: atBatId,
                body: doc
            }).then(function (response) {
                console.log("response:  " + JSON.stringify(response));
                return response;
            }).catch(function (error) {
                console.log("caught error inserting document: " + JSON.stringify(error));
            });
        });
    },
    getAtBatsBreakdown: function (playerId) {
        client
            .search({
                "index": "atbats",
                "type": "atbat",
                "body": {
                    "size": 0,
                    "aggs": {
                        "playerAggs": {
                            "terms": {
                                "field": "playerId"
                            },
                            "aggs": {
                                "playerNameHit": {
                                    "top_hit": {
                                        "_source": {
                                            "include": [
                                                "playerName"
                                            ]
                                        },
                                        "size": 1
                                    }
                                },
                                "pitchesAggs": {
                                    "terms": {
                                        "field": "numpitches"
                                    }
                                },
                                "basesAggs": {
                                    "terms": {
                                        "field": "totalbases"
                                    }
                                },
                                "locationsAggs": {
                                    "terms": {
                                        "field": "location"
                                    }
                                }
                            }
                        }
                    }
                }
            }).then(function (firstResponse) {


                client
                    .search({
                        "index": "atbats",
                        "type": "atbat",
                        "body": {
                            "query": {
                                "term": {
                                    "hit": "true"
                                }
                            },
                            "size": 0,
                            "aggs": {
                                "playerAggs": {
                                    "terms": {
                                        "field": "playerId"
                                    },
                                    "aggs": {
                                        "playerNameHit": {
                                            "top_hit": {
                                                "_source": {
                                                    "include": [
                                                        "playerName"
                                                    ]
                                                },
                                                "size": 1
                                            }
                                        },
                                        "pitchesAggs": {
                                            "terms": {
                                                "field": "numpitches"
                                            }
                                        },
                                        "basesAggs": {
                                            "terms": {
                                                "field": "totalbases"
                                            }
                                        },
                                        "locationsAggs": {
                                            "terms": {
                                                "field": "location"
                                            }
                                        },
                                        "dayAgg": {
                                            "terms": {
                                                "field": "day"
                                            }
                                        }
                                    }
                                }
                            }
                        }

                    })
            }).then(function (response2) {


            }).catch(function (err) {


            });

        // terms aggs
        // avg num pitches
        // avg num pitches per hit
        // breakdown of hit locations
        // batting avg per num pitches
        // batting avg
        // total bases per ab
        // num hits for each num pitch bucket (15 hits on 3rd pitch, 3 on 4th pitch, etc)
        // breakdown of hits per which inning (always hit early, not late?)
        // hits to strikeout ratio
        // slugging pct
        //  hits per day of week
    }
};