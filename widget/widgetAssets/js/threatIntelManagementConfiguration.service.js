/* Copyright start
  MIT License
  Copyright (c) 2024 Fortinet Inc
  Copyright end */
'use strict';
(function () {
    angular
        .module('cybersponse')
        .factory('threatIntelManagementConfigurationService', threatIntelManagementConfigurationService);

    threatIntelManagementConfigurationService.$inject = ['marketplaceService', '$q', '$http', 'API', 'ALL_RECORDS_SIZE', '$filter', 'Modules', 'CommonUtils', '$window'];

    function threatIntelManagementConfigurationService(marketplaceService, $q, $http, API, ALL_RECORDS_SIZE, $filter, Modules, CommonUtils, $window) {

        const WAIT_IN_SEC = 5000;

        var service = {
            getFeedConnectors: getFeedConnectors,
            configFortiGuardConnector: configFortiGuardConnector,
            installConnector: installConnector,
            getConnectorInstallationProgress: getConnectorInstallationProgress,
            ingestionRecordTags: ingestionRecordTags
        };

        function installConnector(connector) {
            var defer = $q.defer();
            marketplaceService.installContent({ 'name': connector.name, 'version': connector.version }).then(function (resp) {
                defer.resolve(resp);

            }, function (error) {
                defer.reject(error);
            });
            return defer.promise
        }

        function configFortiGuardConnector(connector) {
            var defer = $q.defer();
            $http.post(API.INTEGRATIONS + 'connectors/' + connector.name + '/' + connector.version + '/?format=json', {}).then(function (response) {
                if (response.data.configuration.length === 0) {
                    var request_payload = {
                        "connector": response.data.id,
                        "connector_name": response.data.name,
                        "connector_version": response.data.version,
                        "name": "Default",
                        "config_id": $window.UUID.generate(),
                        "default": true,
                        "config": {
                            "server_url": response.data.config_schema.fields[0].value,
                            "verify_ssl": response.data.config_schema.fields[1].value
                        },
                        "teams": []
                    };
                    $http.post(API.INTEGRATIONS + 'configuration/?format=json', request_payload).then(function (resp) {
                        defer.resolve(resp);
                    }, function (error) {
                        defer.reject(error);
                    });
                }
                else {
                    defer.resolve(response);
                }
            }, function (error) {
                defer.reject(error);
            });
            return defer.promise
        }

        function getConnectorInstallationProgress(importJobId) {
            var defer = $q.defer();
            const fields = ['errorMessage', 'status', 'progressPercent', 'file', 'currentlyImporting'];
            const intervalId = setInterval(function () {

                Modules.get({
                    module: 'import_jobs',
                    id: $filter('getEndPathName')(importJobId['@id']),
                    __selectFields: fields.join(',')
                }).$promise.then(function (progress) {
                    if (progress.status === 'Import Complete') {
                        clearInterval(intervalId);
                        defer.resolve();
                    } else if (progress.status !== 'Importing connectors') {
                        // Handle other statuses if necessary
                    }
                }, function (error) {
                    clearInterval(intervalId);
                    defer.reject(error);
                });
            }, WAIT_IN_SEC);

            return defer.promise;
        }

        function getFeedConnectors(connectorLabel) {
            var defer = $q.defer();
            let appendQueryString = null;
            if (!CommonUtils.isUndefined(connectorLabel)) {
                appendQueryString = 'solutionpacks?$limit=' + ALL_RECORDS_SIZE + '&$page=1&$search=' + connectorLabel.replace(/ /g, '%20');
            }
            else {
                appendQueryString = 'solutionpacks?$limit=' + ALL_RECORDS_SIZE + '&$page=1';
            }
            var params = returnParam();
            $http.post(API.QUERY + appendQueryString, params).then(function (response) {
                defer.resolve(response);
            }, function (error) {
                defer.reject(error);
            });
            return defer.promise;
        }

        function ingestionRecordTags() {
            return {
                dataingestion: '/api/3/tags/dataingestion',
                create: '/api/3/tags/create',
                ingest: '/api/3/tags/ingest',
                fetch: '/api/3/tags/fetch',
                update: '/api/3/tags/update',
                connector: '/api/3/tags/'
            }
        }

        function returnParam() {
            return {
                "sort": [
                    {
                        "field": "featured",
                        "direction": "DESC"
                    },
                    {
                        "field": "label",
                        "direction": "ASC"
                    }
                ],
                "limit": 30,
                "logic": "AND",
                "filters": [
                    {
                        "field": "type",
                        "operator": "in",
                        "value": [
                            "connector"
                        ]
                    },
                    {
                        "field": "recordTags",
                        "operator": "in",
                        "value": [
                            "ThreatIntel"
                        ]
                    },
                    {
                        "field": "version",
                        "operator": "notlike",
                        "value": "%_dev"
                    }
                ],
                "page": 1,
                "__selectFields": [
                    "name",
                    "installed",
                    "type",
                    "display",
                    "label",
                    "version",
                    "publisher",
                    "certified",
                    "iconLarge",
                    "description",
                    "latestAvailableVersion",
                    "draft",
                    "local",
                    "status",
                    "featuredTags",
                    "featured"
                ]
            }
        }

        return service;
    }
})();
