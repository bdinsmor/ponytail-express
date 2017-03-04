angular.module('app.lineups', ['app.services.lineups','app.services.players']).component('lineups', {
  templateUrl: 'routes/lineups/lineups.html',
  bindings: { $router: '<' },
  controllerAs: 'vm',
  controller: LineupsController
});

LineupsController.$inject = ['LineupFactory', 'PlayerFactory','$mdToast','$mdDialog','$location','$auth']

function LineupsController(LineupFactory, PlayerFactory,$mdToast, $mdDialog, $location, $auth) {
    var vm = this;
    vm.year = 2016;
    vm.season = "Fall";
    this.$routerOnActivate = function(next) {
        console.log("inside LineupsController.routerActivate");
        if(next.params.lineupId && next.params.lineupId != '') {
          vm.showList = false;
          vm.showFAB = false;
          vm.selectedId = next.params.lineupId;
        } else {
          vm.selectedId = -1;
          getLineups();
        }
       
        
    }

    vm.isOpen = false;
    vm.selectedMode = 'md-scale';
    vm.selectedDate = null;
    vm.selectedId = -1;
    vm.selectedDirection = 'up';
    vm.showFAB = true;
    vm.showList = true;
    vm.showStats = false;

    vm.viewStats = function() {
      vm.showStats = !vm.showStats;
    };

    vm.refresh = function() {
      vm.showList = true;
      vm.showFAB = true;
      vm.selectedId = -1;
      vm.showStats = false;
      this.$router.navigate(["Lineups"]);
      
    };

    vm.deleteLineup = function(ev,lineupId) {
      var confirm = $mdDialog.confirm()
          .textContent('Would you like to delete this lineup?')
          .ariaLabel('Lucky day')
          .targetEvent(ev)
          .ok('OK')
          .cancel("Eeek!  Don't Delete!");

        $mdDialog.show(confirm).then(function() {
          LineupFactory.deleteLineup(lineupId).then(function(response) {
            $mdToast.show(
              $mdToast.simple()
                .textContent('Lineup Deleted')
                .position("bottom right")
                .hideDelay(3000)
            );
            vm.refresh();
        });
        }, function() {
          
        });
        
    };

    vm.addLineup = function() {
        vm.showFAB = false;
        vm.showList = false;
        vm.selectedId = -1;
    };

    vm.editRoster = function() {
      console.log("trying to edit roster...");
      this.$router.navigate(['Roster'], {});
    };

    vm.lineupsByDate = [];

    vm.viewLineup = function(id) {
      //console.log("id to view: " + id);
      vm.selectedId = id;
      this.$router.navigate(['Lineups', {lineupId: id, year: vm.year, season: vm.season}]);
    };

    function getLineups() {
      console.log("calling LineupFactory.getLineups...");
      try {
        LineupFactory.getLineups().then(function(lineups) {
        //  console.log("lineups: " + JSON.stringify(lineups,null,2));
            vm.lineupsByDate = lineups.data;
        });
      } catch(err) {
        console.log("caught error loading lineups: " + err);
      }
    }

  }
