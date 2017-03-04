angular.module('app.roster', ['app.services.players']).component('roster', {
  templateUrl: 'routes/roster/roster.html',
  bindings: { $router: '<' },
  controller: RosterController
});

RosterController.$inject = ['PlayerFactory', '$mdDialog', '$mdToast', '$scope']

function RosterController(PlayerFactory, $mdDialog, $mdToast, $scope) {
  var ctrl = this;
  console.log("inside RosterController");
  ctrl.year = "2016";
  ctrl.season = "Fall";
  ctrl.averageAge = 0;
  ctrl.rosterOrder = "age";
  ctrl.players = [];

  ctrl.refresh = function () {
    this.$router.navigate(['Lineups']);
  }

  ctrl.applyFilters = function () {
    loadRoster();
  }

  ctrl.deletePlayer = function (player) {
    PlayerFactory.deletePlayer(player).then(function (response) {
      loadRoster();
      $mdToast.show(
        $mdToast.simple()
          .textContent("Removed " + updatedPlayer.name)
          .position("bottom right")
          .hideDelay(2000)
      );
    });
  }

  ctrl.viewStats = function(player,ev) {
    $mdDialog.show({
      controller: PlayerStatsDialogController,
      templateUrl: 'routes/players/stats.dialog.html',
      parent: angular.element(document.body),
      targetEvent: ev,
      clickOutsideToClose: true,
      locals: {
        player: player
      }

    });
  };

  ctrl.emailTeam = function (ev) {
    var emails = [];
    for (var i = 0; i < ctrl.players.length; i++) {
      emails.push(ctrl.players[i].email);
    }
    emails = _.uniq(emails);
    var player = {
      email: 'bdinsmor@gmail.com',
      bcc: emails.join(',')
    };

    $mdDialog.show({
      controller: EmailDialogController,
      templateUrl: 'routes/players/email.dialog.html',
      parent: angular.element(document.body),
      targetEvent: ev,
      clickOutsideToClose: true,
      locals: {
        player: player
      }

    })
      .then(function (emailForm) {
        PlayerFactory.emailPlayer(emailForm).then(function (response) {
          $mdToast.show(
            $mdToast.simple()
              .textContent("Email sent to team")
              .position("bottom right")
              .hideDelay(2000)
          );
        });
      }, function () {

      });
  }


  ctrl.emailPlayer = function (player, ev) {
    $mdDialog.show({
      controller: EmailDialogController,
      templateUrl: 'routes/players/email.dialog.html',
      parent: angular.element(document.body),
      targetEvent: ev,
      clickOutsideToClose: true,
      locals: {
        player: player
      }

    })
      .then(function (emailForm) {
        PlayerFactory.emailPlayer(emailForm).then(function (response) {
          $mdToast.show(
            $mdToast.simple()
              .textContent("Email sent to: " + player.name)
              .position("bottom right")
              .hideDelay(2000)
          );
        });
      }, function () {

      });
  }

  ctrl.editPlayer = function (player, ev) {
    $mdDialog.show({
      controller: PlayerDialogController,
      templateUrl: 'routes/players/player.dialog.html',
      parent: angular.element(document.body),
      targetEvent: ev,
      clickOutsideToClose: true,
      locals: {
        player: player
      }

    })
      .then(function (updatedPlayer) {
        PlayerFactory.savePlayer(updatedPlayer).then(function (response) {
          loadRoster();
          $mdToast.show(
            $mdToast.simple()
              .textContent("Saved " + updatedPlayer.name)
              .position("bottom right")
              .hideDelay(2000)
          );
        });
      }, function () {

      });
  }

  ctrl.addPlayer = function (ev) {
    $mdDialog.show({
      controller: PlayerDialogController,
      templateUrl: 'routes/players/player.dialog.html',
      parent: angular.element(document.body),
      targetEvent: ev,
      clickOutsideToClose: true,
      locals: {
        player: null
      }
    })
      .then(function (updatedPlayer) {
        PlayerFactory.savePlayer(updatedPlayer).then(function (response) {
          loadRoster();
          $mdToast.show(
            $mdToast.simple()
              .textContent("Saved " + updatedPlayer.name)
              .position("bottom right")
              .hideDelay(2000)
          );
        });
      }, function () {

      });
  }


  function loadRoster() {
    PlayerFactory.getRoster(ctrl.year, ctrl.season).then(function (playerResponse) {
      ctrl.players = playerResponse.data;
      var num = ctrl.players.length;
      var totalAge = 0;
      for (var i = 0; i < num; i++) {
        var age = ctrl.players[i].age;
        totalAge += parseInt(age);
      }
      ctrl.averageAge = (totalAge / num).toFixed(1);
      $mdToast.show(
        $mdToast.simple()
          .textContent("Loaded " + ctrl.players.length + " players")
          .position("bottom right")
          .hideDelay(2000)
      );
    })
  }

  loadRoster();


}

PlayerStatsDialogController.$inject = ['PlayerFactory', '$scope', '$mdDialog', '$mdToast', 'player']
function PlayerStatsDialogController(PlayerFactory, $scope, $mdDialog, $mdToast, player) {
  
  $scope.player = angular.copy(player);

  $scope.chartOptions = {
    legend: {
            display: true,
            
        }
  };
   
  $scope.cancel = function () {
    $mdDialog.cancel();
  };

  $scope.save = function () {
    $mdDialog.hide($scope.player);
  };
  PlayerFactory.getPlayerStats(player._id).then(function(statsResponse) {
    $scope.player.stats = statsResponse.data;
    console.log("player.stats: "+ JSON.stringify($scope.player,null,2));
  });
}

PlayerDialogController.$inject = ['PlayerFactory', '$scope', '$mdDialog', '$mdToast', 'player']
function PlayerDialogController(PlayerFactory, $scope, $mdDialog, $mdToast, player) {
  if (!player) {
    $scope.player = {
      id: '',
      name: '',
      birthDate: new Date(),
      email: '',
      bcc: '',
      year: '2016',
      season: 'Fall'
    };
  } else {
    $scope.player = angular.copy(player);
    if (!$scope.player.season) {
      $scope.player.season = "Fall";
    }
    $scope.player.birthDate = new Date(player.birthDate);
  }

  $scope.cancel = function () {
    $mdDialog.cancel();
  };

  $scope.save = function () {
    $mdDialog.hide($scope.player);
  };
}

EmailDialogController.$inject = ['PlayerFactory', '$scope', '$mdDialog', '$mdToast', 'player']
function EmailDialogController(PlayerFactory, $scope, $mdDialog, $mdToast, player, team) {
  $scope.email = {
    subject: '',
    body: '',
    to: '',
    bcc: ''
  };

  if (player) {
    $scope.player = angular.copy(player);
    $scope.email.to = player.email;
    $scope.email.bcc = player.bcc;
  }


  $scope.cancel = function () {
    $mdDialog.cancel();
  };

  $scope.save = function () {
    $mdDialog.hide($scope.email);
  };
}
