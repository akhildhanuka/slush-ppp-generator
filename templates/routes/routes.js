export default function ($stateProvider, $urlRouterProvider) {
    'ngInject';
    $urlRouterProvider.otherwise('/');

    $stateProvider
        .state('default', {
            url         : '/?token',
            template    : '<hello-world author="{{launch.data.author}}"></hello-world>',
            controller  : stateController,
            controllerAs: 'launch'
        });
}

function stateController($scope, appName) {
    'ngInject';
    this.data = {
        author     : '<%= authorName %>',
        appName    : 'app',
        description: 'description is long'
    };

}