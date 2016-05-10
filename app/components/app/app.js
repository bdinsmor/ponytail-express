var app = angular.module('myApp', [
	'ngComponentRouter',
	'ngMaterial',
	'angular-sortable-view',
	'md.data.table',
	'app.templates',
	'app.home',
	'app.navbar',
	'app.roster',
	'ngMdIcons',
	'app.playerDetails',
	'app.login',
	'app.admin',
	'app.admin.dashboard',
	'app.404'
]);

app.value('$routerRootComponent', 'app');
app.component('app', {
	templateUrl: 'components/app/app.html',
	$routeConfig: [
		{ path: '/', component: 'home', name: 'Home' },
		{ path: '/roster/:name', component:'roster', name:'Roster'},
		{ path: '/playerDetails/:name', component: 'playerDetails', name: 'Brian'},
		{ path: '/login', component: 'login', name: 'Login' },
		{ path: '/admin/...', component: 'admin', name: 'Admin' },
		{ path: '/**', component: 'notfound', name: 'NotFound' }
	]
});
