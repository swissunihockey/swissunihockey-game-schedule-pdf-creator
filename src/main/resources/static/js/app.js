angular.module('gameSchedulePDFCreatorApp', ['ionic', 'gameSchedulePDFCreatorApp.services'])
    .config(
    ['$stateProvider', '$urlRouterProvider', '$httpProvider', function ($stateProvider, $urlRouterProvider, $httpProvider) {

        $stateProvider.state('index', {
                url: '/index',
                templateUrl: 'partials/index.html',
                controller: IndexController
            }
        );

        $urlRouterProvider.otherwise('/index');

        /* Intercept http errors */
        var interceptor = function ($rootScope, $q, $location) {

            function success(response) {
                return response;
            }

            function error(response) {

                var status = response.status;
                var config = response.config;
                var method = config.method;
                var url = config.url;

                if (status == 401) {
                    $location.path("/login");
                } else {
                    $rootScope.error = method + " on " + url + " failed with status " + status;
                }

                return $q.reject(response);
            }

            return function (promise) {
                return promise.then(success, error);
            };
        };
        $httpProvider.interceptors.push(interceptor);
        $httpProvider.defaults.headers.common['Content-Type'] = 'application/json';
    }]
).run(function ($rootScope, $http, PDFCreatorService) {

        /* Reset error when a new view is loaded */
        $rootScope.$on('$viewContentLoaded', function () {
            delete $rootScope.error;
        });
    });


function IndexController($scope, $state, PDFCreatorService, SwissunihockeyAPIService) {

    $scope.clubEntries = SwissunihockeyAPIService.getClubs().entries;
    $scope.selectedClub;

    // TODO show button, if selected club & selected team defined!
    // Resource examples see here: https://github.com/mraible/boot-ionic/blob/master/src/main/resources/public/js/app.js
    //$scope.clubEntries = [{text: "hallo"}, {text: "hallo2"}, {text: "hallokljsdfl"}];
}

var services = angular.module('gameSchedulePDFCreatorApp.services', ['ngResource']);

services.factory('PDFCreatorService', function ($resource) {

    return $resource('/api/clubs/:clubId/teams/:teamId/game-schedule', {clubId: '@clubId', teamId: '@teamId'});
});

services.factory('SwissunihockeyAPIService', function ($resource) {

    return $resource(':url', {},
        {
            getClubs: {
                method: 'GET',
                params: {'url': 'https://api-v2.swissunihockey.ch/api/clubs'}
            },
            getTeamsOfClub: {
                method: 'GET',
                // TODO replace season and club_id with params
                params: {'url': 'https://api-v2.swissunihockey.ch/api/teams?club_id=441388&season=2015&mode=by_club'}
            }
        }
    );
});
