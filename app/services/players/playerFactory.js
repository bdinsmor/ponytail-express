
angular.module('app.services.players', []).factory('PlayerFactory', ['$http', function($http) {
  return {
      getRoster: function(year, season) {
        return $http.get('/players?year=' + year +"&season=" + season);
      },
      getPlayer: function(id) {
        return $http.get('/player/' + id);
      },
      deletePlayer: function(player) {
        return $http.delete('/player/' + player._id);
      },
      savePlayer: function(player) {
      	return $http.post('/players', player);
      },
      emailPlayer: function(formData) {
        return $http.post('/players/email',formData);
      },
      getPlayerList: function(year, season) {
        return $http.get('/players/list?year=' + year +"&season=" + season);
      },
      getPlayerStats: function(playerId) {
        return $http.get('/player/stats/' + playerId);
      }
    };

}])
