const MODULE_NAME = 'sample-project.components';

export default MODULE_NAME;


var componentsApiCheck = require('api-check')({
  output: {
    prefix: 'sample-project-components'
  },
  verbose: false
});

angular.module(MODULE_NAME, [])
  .constant('componentsApiCheck', componentsApiCheck)
  .component('helloWorld', require('../components/hello-world/hello-world.js'))
;