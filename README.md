# mocha-zapi-reporter
Use REST calls with mocha spec reporter to clone and set Zephyr tests via Zapi.

The intention of this package is to provide automated Webdriverio regression tests by interacting with Zapi. 
Predefined Tests Cycles with tests ``"clonedCycleId": "206"`` are cloned and executed. Results depending on the outcome are set in the corresponding test.
Tests in the Cycle need to have an identifier. In this example it is ``FCB-13``
```
    Webdriver.runTest('FCB-14: attempts to log in with wrong user data', () => {
        return this.expect(this.client.url(homeUrl)
            .then(this.Header.isLoggedIn()))
            .to.eventually.equal(false);
    });
```
Therefore, a test in Zephyr must exist within the cycle with id ``"clonedCycleId": "206"`` named ``FCB-13``

This package supports the webdriverio-mocha-helper package
https://www.npmjs.com/package/webdriverio-mocha-helper

### Install
```
npm install mocha-zapi-reporter --save-dev
```
### Usage
add -R mocha-zapi-reporter when executing tests

e.g: run_tests.bat
``` 
call set TEST_ENV=%1
call npm run-script setup-env && node_modules\.bin\mocha --recursive --require tools/babelhook -t 60000 --full-trace %2 mocha -R mocha-zapi-reporter
```

### Environment
Data is provided by JSON file.

A Zapi environment needs to be loaded to pass parameters to the REST calls
  
```
var Env = require('../../../common/env');
var zapiEnv = Env.getZapi();
```

Add this function in the common\env.json
``` 
module.exports.getZapi = function getZapi() {
    return internals.env.zapi;
};
```

Within your.environment.file.json add following:
```
"zapi":{
    "jiraBaseURL": "https://jira-playground.local.netconomy.net",
    "jiraUser": {
        "username": "user",
        "password": "password"
    },
    "data": {
        "clonedCycleId": "206",
        "name": "Nightly tests",
        "build": "",
        "environment": "",
        "description": "test results for the nightly build",
        "startDate": "",
        "endDate": "",
        "projectId": "13103",
        "versionId": "-1"
    }
}
```

for example, the URL which calls the version of the project looks like this:
```
var baseURL = zapiEnv.jiraBaseURL;
var apiURL = baseURL + '/rest/zapi/latest';
var versionOfProjectURL = apiURL + '/util/versionBoard-list?projectId=' + zapiEnv.data.projectId;
```

This approach requires the WebdriverIO Framework from Netconomy.
Anyhow, in which way the data is provided doesnt matter as long as all attributes are included.