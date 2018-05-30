requirejs.config({
  baseUrl: '/static',
  paths: {
    jquery:           'js/jquery.min',
    pace:             'js/pace.min',
    socket:           'js/socket.io-1.4.5',
    switchery:        'js/switchery.min',
    bootstrap:        'js/bootstrap.min',
    updater_main:     'updater_main',
    noty:             'js/noty.min',
    bootstrap_select: 'js/bootstrap_select.min',
    uniform:          'js/uniform.min',
    bootstrap_app:    'js/app.min',
    ionslider:        'js/ion_rangeslider.min',
    // test_module:      'test_module'
  },
  shim: {
    'bootstrap':{
      deps: ['jquery']
    },
    'bootstrap_select':{
      deps: ['bootstrap']
    },
    'ionslider':{
      deps: ['jquery']
    },
  	'socket':{
  		deps: ['jquery'],
        export: 'io'
  	},
    'updater_main': {
    	deps: ['jquery', 'socket'],
    },  
    'switchery':{
      deps: ['events']
    }, 
    'uniform':{
      deps: ['jquery']
    },
    'bootstrap_app':{
        deps: ['jquery', 'bootstrap']
    }
  },
  urlArgs: "bust=" + (new Date()).getTime()
});

requirejs(['jquery', 'bootstrap', 'updater_main', 'noty', 'bootstrap_select', 'uniform', 'bootstrap_app', 'ionslider']);
// requirejs(['jquery', 'bootstrap', 'updater_main', 'test_module', 'noty', 'bootstrap_select', 'uniform', 'bootstrap_app', 'ionslider']);