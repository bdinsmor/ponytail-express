angular.module('app.playerDetails', []).component('playerDetails', {
  templateUrl: 'routes/playerDetails/details.html',
  bindings: { $router: '<' },
  controllerAs: 'vm',
  controller: function() {
    var vm = this;
    vm.players = [
    {name: 'Charlotte'},
    {name: 'Leah'}
    ];

    vm.$routerOnActivate = function(toRoute, fromRoute) {
    	this.name = toRoute.params.name;
    };
  }
});
