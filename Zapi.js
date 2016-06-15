/**
 * Created by mschroeck on 02.06.2016.
 */
var Env = require('../../../common/env');
var RESTClient = require('node-rest-client').Client;
var _ = require('underscore');
var zapiEnv = Env.getZapi();
var baseURL = zapiEnv.jiraBaseURL;
var apiURL = baseURL + '/rest/zapi/latest';
var getLatestIssuesURL = apiURL + '/issues';
var cycleURL = apiURL + '/cycle';
var cycleProjectIdURL = cycleURL + '?projectId=';
var executionsURL = apiURL + '/execution';
var allProjectsURL = apiURL + '/util/project-list';
var versionOfProjectURL = apiURL + '/util/versionBoard-list?projectId=' + zapiEnv.data.projectId;
var allTestExecutionStatesURL = apiURL + '/util/testExecutionStatus';
var executionListByCycle = executionsURL + '?action=expand&cycleId=';
var options_auth = { user: zapiEnv.jiraUser.username, password: zapiEnv.jiraUser.password };
var client = new RESTClient(options_auth);

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

function isNumeric(n) {
    return !isNaN(parseFloat(n)) && isFinite(n);
}

function getDate() {
    var date = new Date();
    var month = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][date.getMonth()];
    return date.getDate() + "/" + month + "/" + (new Date().getFullYear() + "").substr(2);
}

function getAllTestExecutionStates() {
    client.get(allTestExecutionStatesURL, function (data, response) {
        console.log(data);
    });
}

function getAllCyclesByProject(projectId) {
    client.get(cycleProjectIdURL + projectId, function (data, response) {
        console.log(data);
    });
}

function getExecutionListByCycle(cycleId, done) {
    client.get(executionListByCycle + cycleId, function (data) {
        done(data.executions);
    });
}

function cloneCycle(done) {
    client.get(cycleProjectIdURL + zapiEnv.data.projectId, function (cycles) {
        var hasId = false;
        _.each(cycles["-1"][0], function (existingCycle, id) {
            // ignores the id:  recordsCount entry
            if (isNumeric(id) && id === zapiEnv.data.clonedCycleId) {
                hasId = true;
                return done(id, existingCycle);
            }
        });
        if (!hasId) console.log("ID " + zapiEnv.data.clonedCycleId + " does not match with any Cycles");
    });
}

function postCycle(id, cycle, done) {
    if (!_.isUndefined(id)) {
        client.post(cycleURL, {
            headers: { 'content-type': 'application/json' },
            data: {
                "clonedCycleId": id,
                "name": cycle.name + "(Automated)",
                "build": Env.getVersion(),
                "environment": process.env.TEST_ENV,
                "description": "Version: " + Env.getVersionUrl(),
                "startDate": getDate(),
                "endDate": getDate(),
                "projectId": cycle.projectId,
                "versionId": cycle.versionId || -1
            }
        }, function (data) {
            console.log(data);
            done(data.id);
        });
    }
}

function executeTest(executionId, status) {
    return new Promise(function (resolve, reject) {
        client.put(apiURL + '/execution/' + executionId + '/execute', {
            headers: { 'content-type': 'application/json' },
            data: { status: status }
        }, function (data) {
            //console.log(data)
            resolve(data);
        });
    });
}

module.exports = {
    getExecutionListByCycle: getExecutionListByCycle,
    postCycle: postCycle,
    cloneCycle: cloneCycle,
    executeTest: executeTest
};