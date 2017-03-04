angular.module('app.players', ['app.services.players']).component('player', {
  templateUrl: 'routes/players/player.html',
  bindings: { $router: '<', season: '<', year: '<' },
  controller: PlayerController
});

PlayerController.$inject = ['PlayerFactory', '$mdToast']

function PlayerController(PlayerFactory, $mdToast) {
    var ctrl = this;
    ctrl.player = {
      id: '',
      name: '',
      birthDate: new Date(),
      throws: false,
      bats: false,
      catchingRating: 3,
      throwsRating: 3,
      battingRating: 3,
      season: "Fall",
      year: 2016
    };

    this.$routerOnActivate = function(next,previous) {
        if(next.params.id && next.params.id != '') {
          ctrl.player.id = next.params.id;
          loadPlayer();
        } 
        
    }

    ctrl.savePlayer = function() {
      var displayName = ctrl.player.name;
      PlayerFactory.savePlayer(ctrl.player).then(function(saveResponse) {
        $mdToast.show(
          $mdToast.simple()
            .textContent(displayName + " saved!")
            .position("bottom right")
            .hideDelay(3000)
        );
      })
    }

    function loadPlayer() {
      PlayerFactory.getPlayer(ctrl.player.id).then(function(playerResponse) {
        ctrl.player = playerResponse.data;
        var displayName = ctrl.player.name;
        $mdToast.show(
          $mdToast.simple()
            .textContent("Showing " + displayName)
            .position("bottom right")
            .hideDelay(3000)
        );
      })
    }

    

  }
