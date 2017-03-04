angular.module('app.login', ['satellizer']).component('login', {
  templateUrl: 'routes/login/login.html',
  bindings: { 
    $router: '<'
  },
  controller: LoginController
});

LoginController.$inject = ['$mdToast','$location','$auth']

function LoginController($mdToast, $location, $auth) {
    var ctrl = this;
    ctrl.authenticate = function(provider) {
      $auth.authenticate(provider).then(function(response) {
      	if($auth.isAuthenticated()) {
      		$location.path('/lineups');
      	}
      

      });
    };

}