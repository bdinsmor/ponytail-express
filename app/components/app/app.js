var app = angular.module('myApp', [
	'ngComponentRouter',
	'ngMaterial',
	'angular-sortable-view',
	'md.data.table',
	'app.login',
	'app.templates',
	'app.lineup',
	'app.lineups',
	'app.navbar',
	'app.players',
	'app.roster',
	'app.stats',
	'chart.js',
	'ngMdIcons',
	'angularMoment',
	'satellizer',
	'app.404'
]);

app.value('$routerRootComponent', 'app');
app.config(['$compileProvider','$authProvider', function ($compileProvider,$authProvider) {
  $compileProvider.debugInfoEnabled(false);
  $authProvider.facebook({
      clientId: '555856974615490'
    });
    $authProvider.google({
      clientId: '835594114971-nf9h1th12usq4j5oh6h56bje08pl0di1.apps.googleusercontent.com'
    });

}]);

app.component('app', {
	templateUrl: 'components/app/app.html',
	$routeConfig: [
		//{ path: '/', component: 'login', name: 'Login', useAsDefault:true },
		{ path: '/', component: 'lineups', name: 'Lineups', useAsDefault:true },
		{ path: '/lineups/:lineupId', component: 'lineups', name: 'Lineups' },
		{ path: '/lineups', component: 'lineups', name: 'Lineups' },
		{ path: '/player', component: 'player', name: 'Player'},
		{ path: '/roster', component: 'roster', name: 'Roster'},
		{ path: '/**', component: 'notfound', name: 'NotFound' }
	]
});
