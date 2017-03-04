angular.module('app.stats', ['app.services.lineups']).component('stats', {
  templateUrl: 'routes/stats/stats.html',
  controllerAs: 'vm',
  controller: StatsController
});

StatsController.$inject = ['LineupFactory', '$mdToast','$location','$auth']

function StatsController(LineupFactory, $mdToast, $location, $auth) {
    var vm = this;
    vm.myOrder = "avg";
    

    function buildStats() {
      LineupFactory.getStats().then(function(stats) {
        vm.stats = stats.data.stats;
        vm.teamStats = stats.data.teamStats;
        //console.log("stats: "  + JSON.stringify(stats,null,2));
      }).catch(function(error) {
        $mdToast.show(
          $mdToast.simple()
            .textContent("Could not load stats")
            .position("bottom right")
            .hideDelay(3000)
        );
      });
    }

    buildStats();

  }
