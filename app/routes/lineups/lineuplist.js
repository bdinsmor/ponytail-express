angular.module('app.lineups').component('lineupList', {
  templateUrl: 'routes/lineups/lineuplist.html',
  require: {lineupsCtrl: '^lineups'},
  bindings: { $router: '<' },
  controllerAs: 'vm',
  controller: LineupListController,
});

LineupListController.$inject = ['LineupFactory', '$mdToast']

function LineupListController(LineupFactory, $mdToast) {
    var vm = this;
    console.log("lineup list controller");
    vm.$routerOnActivate = function(toRoute, fromRoute) {
        getLineups();
    };

    vm.lineups = [];

    vm.viewLineup = function(date) {
      this.lineupsCtrl.showList = false;
      this.lineupsCtrl.selectedDate = date;
    }

    function getLineups() {
      console.log("calling LineupFactory.getLineups...");
        LineupFactory.getLineups().then(function(lineups) {
         // console.log("lineups: " + JSON.stringify(lineups));
            vm.lineups = lineups.data;
        })
    }

  }
