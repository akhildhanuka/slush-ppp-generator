require('./hello-world.scss');

export default {
  bindings: {
    author: '@'
  },
  template: require('./hello-world.html'),
  controller: helloWorldController
};

function helloWorldController(componentsApiCheck) {
  'ngInject';

  let apiCheck = componentsApiCheck;

  const bindingsShape = {
    author: apiCheck.string

  };

  apiCheck.throw(
    apiCheck.shape(bindingsShape),
    this,
    {prefix: ' : hello-world.js : '}
  );

}