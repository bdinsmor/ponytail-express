
angular.module('app.services.lineups', []).factory('LineupFactory', ['$http', function($http) {
  return {
      getLineups: function() {
        return $http.get('/lineups');
      },
      getLineup: function(id) {
        return $http.get('/lineup/' + id);
      },
      getStats: function() {
        return $http.get('/stats');
      },
      deleteLineup: function(id) {
        return $http.delete('/lineup/' + id);
      },
      saveLineup: function(id, year, season, game, confirmed, opponentName, title, date, players, notPlaying) {
      	var data = {
          id: id,
          year: year, 
          season: season,
          game: game,
          confirmed: confirmed,
          opponentName: opponentName,
          title: title,
      		date: date,
      		players: players,
      		notPlaying: notPlaying
      	};
      	return $http.post('/lineup', data);
      }
    };

}])
