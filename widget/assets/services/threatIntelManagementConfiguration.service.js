/* Copyright start
MIT License
Copyright (c) 2024 Fortinet Inc
Copyright end */
'use strict';
(function () {
    angular
        .module('cybersponse')
        .factory('threatIntelManagementConfigurationService', threatIntelManagementConfigurationService);

    threatIntelManagementConfigurationService.$inject = ['marketplaceService', '$q', '$http', 'API', 'ALL_RECORDS_SIZE', '$filter', 'Modules'];

    function threatIntelManagementConfigurationService(marketplaceService, $q, $http, API, ALL_RECORDS_SIZE, $filter, Modules) {

        var service = {
            getFeedConnectors: getFeedConnectors,
            installConnector: installConnector,
            getInstallationProgress: getInstallationProgress
        }
        return service;

        function installConnector(connector) {
            var defer = $q.defer();
            marketplaceService.installContent({ 'name': connector.name, 'version': connector.version }).then(function (resp) {
                defer.resolve(resp);
                
            },function(error){
                defer.reject(error);
            });
            return defer.promise
        }

        // function getInstallationProgress(contentImportData) {
        //     let fields = ['errorMessage', 'status', 'progressPercent', 'file', 'currentlyImporting'];
        //     var defer = $q.defer();
        //     Modules.get({
        //         module: 'import_jobs',
        //         id: $filter('getEndPathName')(contentImportData['@id']),
        //         __selectFields: fields.join(',')
        //     }).$promise.then(function (response) {
        //         defer.resolve(response);
        //     }, function (error) {
        //         defer.reject(error);
        //     })
        //     return defer.promise;
        // }

        function getInstallationProgress(importJobId) {
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
            }, 5000);
          
            return defer.promise;
          }

        function getFeedConnectors() {
            var defer = $q.defer();
            let appendQueryString = 'solutionpacks?$limit=' + ALL_RECORDS_SIZE + '&$page=1';
            var params = returnParam();
            // params.__selectFields = ['name', 'installed', 'type', 'display', 'label', 'version', 'publisher', 'certified', 'iconLarge', 'description', 'latestAvailableVersion', 'draft', 'local', 'status', 'featuredTags', 'featured'];
            $http.post(API.QUERY + appendQueryString, params).then(function (response) {
                defer.resolve(response);
            }, function (error) {
                defer.reject(error);
            });
            return defer.promise;
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
    }
})();
