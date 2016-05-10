
angular.module('app.services.players', []).factory('PlayerFactory', ['$http', function($http) {
  return {
      getPpayers: function() {
        return $http.get('/players');
      }
    };

}])
