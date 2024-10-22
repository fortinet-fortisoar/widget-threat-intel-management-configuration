/* Copyright start
  MIT License
  Copyright (c) 2024 Fortinet Inc
  Copyright end */
'use strict';
(function () {
  angular
    .module('cybersponse')
    .controller('threatIntelManagementConfiguration100Ctrl', threatIntelManagementConfiguration100Ctrl);

  threatIntelManagementConfiguration100Ctrl.$inject = ['$scope', 'PagedCollection', 'Query', 'SchedulesService', 'threatIntelManagementConfigurationService', 'widgetDataIngestionService', 'WizardHandler', '$controller', '$state', 'connectorService', 'currentPermissionsService', 'CommonUtils', 'API', '_', '$filter', '$http', '$resource', 'toaster', 'appModulesService', 'widgetBasePath', '$rootScope', '$timeout', 'ALL_RECORDS_SIZE', '$q', 'Modules'];

  function threatIntelManagementConfiguration100Ctrl($scope, PagedCollection, Query, SchedulesService, threatIntelManagementConfigurationService, widgetDataIngestionService, WizardHandler, $controller, $state, connectorService, currentPermissionsService, CommonUtils, API, _, $filter, $http, $resource, toaster, appModulesService, widgetBasePath, $rootScope, $timeout, ALL_RECORDS_SIZE, $q, Modules) {
    $controller('BaseConnectorCtrl', {
      $scope: $scope
    });
    $scope.backToStartPage = backToStartPage;
    $scope.backToConfigConnector = backToConfigConnector;
    $scope.moveToConfigureConnector = moveToConfigureConnector;
    $scope.backToinstallConnector = backToinstallConnector;
    $scope.moveToSelectConnector = moveToSelectConnector;
    $scope.backToSelectConnector = backToSelectConnector;
    $scope.moveToFeedRules = moveToFeedRules;
    $scope.backToFeedRules = backToFeedRules;
    $scope.configFieldChanged = configFieldChanged;
    $scope.moveToFinish = moveToFinish;
    $scope.installConnector = installConnector;
    $scope.close = close;
    $scope.toggleSelectFeedsSettings = toggleSelectFeedsSettings;
    $scope.loadActiveTab = loadActiveTab;
    $scope.toggleFeedRules = toggleFeedRules;
    $scope.saveParams = saveParams;
    $scope.dataIngestionParamsUpdating = false;
    $scope.areFeedConnectorsConfigured = false;
    $scope.allConnectorsInstalled = false;
    $scope.connectorInstalledOnAgents = [];
    $scope.dataIngestCollectionUUIDs = [];
    $scope.saveSchedules = [];
    $scope.feedConnectors = [];
    $scope.healthyConnectors = [];
    $scope.installedConnectors = [];
    $scope.healthyConnectorsParams = [];
    $scope.connectorHealthStatus = [];
    $scope.connectorParamsStatus = [];
    $scope.samplePlaybookEntity = {};
    $scope.ingestMethodActions = {};
    $scope.connectorFetchIndex = {};
    $scope.connectorConfigIndex = {};
    $scope.toggleFeedToIndicatorLinking = { open: true };
    $scope.toggleHighConfidenceThreatFeeds = { open: false };
    $scope.toggleUnstructuredFeedsSupport = { open: false };
    $scope.toggleConnectorConfigSettings = { open: true };
    $scope.toggleParametersSettings = { open: false };
    $scope.toggleScheduleConfigSettings = { open: false };
    $scope.searchQuery = '';
    $scope.scheduleJsonData = undefined;
    $scope.params = {
      activeTab: 0
    };
    $scope.feedRules = {
      highConfidenceThreatFeeds: {
        enabled: true,
        name: 'High Confidence Threat Feed Block',
        feedConfidenceThreshold: 70,
        feedTools: []
      },
      feedToIndicatorLinking: {
        enabled: true,
        name: 'Feed To Indicator Linking',
        feedConfidenceThreshold: 70
      },
      unstructuredFeedsSupport: {
        enabled: true,
        name: 'Unstructured Feeds Support',
        ingestFeedsFromFile: true,
        ingestFeedsFromEmail: false
      }
    };
    $scope.isLightTheme = $rootScope.theme.id === 'light';
    $scope.widgetBasePath = widgetBasePath;
    $scope.startInfoGraphics = $scope.isLightTheme ? widgetBasePath + 'images/start-light.svg' : widgetBasePath + 'images/start-dark.svg';
    $scope.feedSources = $scope.isLightTheme ? widgetBasePath + 'images/feed-sources-light.svg' : widgetBasePath + 'images/feed-sources-dark.svg';
    $scope.installFeeds = $scope.isLightTheme ? widgetBasePath + 'images/install-feeds-light.svg' : widgetBasePath + 'images/install-feeds-dark.svg';
    $scope.configFeeds = $scope.isLightTheme ? widgetBasePath + 'images/config-feeds-light.svg' : widgetBasePath + 'images/config-feeds-dark.svg';
    $scope.feedRulesImg = $scope.isLightTheme ? widgetBasePath + 'images/feed-rules-light.svg' : widgetBasePath + 'images/feed-rules-dark.svg';
    $scope.finishInfoGraphics = widgetBasePath + 'images/finish.png';
    $scope.widgetCSS = widgetBasePath + 'widgetAssets/css/wizard-style.css';
    const fortiGuardConnectorName = 'Fortinet FortiGuard Threat Intelligence';
    init();

    function init() {
      _getKeyStoreRecord();
      $scope.isFortiGuardConnectorInstalled = true;
      appModulesService.load(true).then(function (modules) {
        modules = $filter('playbookModules')(modules);
        $scope.modules = currentPermissionsService.availablePermissions(modules, 'create');
      });
      $scope.allowPlaybookEdit = currentPermissionsService.availablePermission('workflows', 'create') || currentPermissionsService.availablePermission('workflows', 'update');
      Modules.get({
        module: 'teams',
        $limit: self.ALL_RECORDS_SIZE,
      }).$promise.then(function (result) {
        $scope.owners = result['hydra:member'];
      });
    }

    function _getKeyStoreRecord() {
      var pagedCollection = new PagedCollection('keys');
      var query = {
        logic: 'AND',
        limit: 1,
        filters: [{
          field: 'key',
          operator: 'eq',
          value: 'threat-intel-management-feed-rules-config'
        }
        ],
        __selectFields: ["jSONValue"]
      };
      pagedCollection.query = new Query(query);
      pagedCollection.load().then(function () {
        if (pagedCollection.data['hydra:member'].length > 0 > 0) {
          $scope.feedRules = pagedCollection.data['hydra:member'][0].jSONValue;
        }
      });
    }

    function close() {
      $timeout(function () { $window.location.reload(); }, 3000);
      $state.go('main.modules.list', { module: 'threat_intel_feeds' }, { reload: true });
      $scope.$parent.$parent.$parent.$ctrl.handleClose();
    }

    function toggleFeedRules(feedRule, $event) {
      if ($event && $event.target.className === 'switch-slider') {
        feedRule.enabled = !feedRule.enabled;
      }
    }

    function toggleSelectFeedsSettings(event) {
      event.stopPropagation();
    }

    $scope.removeTab = function (index) {
      $scope.installedConnectors.splice(index, 1);
      $scope.connectorInstalledOnAgents.splice(index, 1);
      $scope.dataIngestCollectionUUIDs.splice(index, 1);
      $scope.saveSchedules.splice(index, 1);
      if ($scope.params.activeTab === index) {
        // Set active tab to the previous tab if available
        $scope.params.activeTab = Math.max(0, index - 1);
      } else if ($scope.params.activeTab > index) {
        // If the active tab was after the removed tab, decrement the active tab index
        $scope.params.activeTab--;
      }
      loadActiveTab(0);
    };

    function installConnector() {
      WizardHandler.wizard('timSolutionpackConfigWizard').next();
      const selectedConnectors = $scope.feedConnectors.filter(pack => pack.selectConnector === true && pack.installed === false);
      $scope.getSelectedConnectorsCount = selectedConnectors.length + ($scope.feedConnectors.filter(pack => pack.selectConnector === true && pack.installed === true)).length
      function installSequentially(index) {
        if (index >= selectedConnectors.length) {
          $scope.allConnectorsInstalled = true;
          return;
        }
        const connector = selectedConnectors[index];
        threatIntelManagementConfigurationService.installConnector(connector)
          .then(resp => {
            const importJobId = resp.data.importJob;
            threatIntelManagementConfigurationService.getConnectorInstallationProgress(importJobId, connector)
              .then(() => {
                connector.installed = true;
                installSequentially(index + 1);
              })
              .catch(error => {
                console.log(error);
                installSequentially(index + 1);
              });
          })
          .catch(error => {
            console.log(error);
            installSequentially(index + 1);
          });
      }
      installSequentially(0);
    }

    function loadActiveTab(tabIndex) {
      $scope.toggleConnectorConfigSettings = { open: true };
      $scope.toggleParametersSettings = { open: false };
      $scope.toggleScheduleConfigSettings = { open: false };
      $scope.scheduleJsonData = undefined;
      $scope.healthyConnectors[tabIndex] = false;
      if (CommonUtils.isUndefined(tabIndex)) {
        if (CommonUtils.isUndefined($scope.params.activeTab)) {
          $scope.params = {
            activeTab: 0
          }
        }
        _loadConnectorDetails(0, $scope.installedConnectors[0]);
      }
      else {
        $scope.params = {
          activeTab: tabIndex
        }
        _loadConnectorDetails(tabIndex, $scope.installedConnectors[tabIndex]);
      }
    }

    function _loadConnectorDetails(tabIndex, installedConnector) {
      $scope.connectorProcessing = true;
      connectorService.getConnector(installedConnector.name, installedConnector.version).then(function (connector) {
        installedConnector.connectorInfo = angular.copy(connector);
        installedConnector.connectorInfo.baseId = angular.copy(connector.id);
        $scope.connectorProcessing = false;
        if (!connector) {
          toaster.error({
            body: 'The Connector "' + installedConnector.name + '" is not installed. Install the connector and re-run this wizard to complete the configuration'
          });
          return;
        }
      }, function () {
        $scope.connectorProcessing = false;
      });
    }

    $scope.$on('scheduleDetails', function (event, data) {
      $scope.scheduleStatus = data.status;
      $scope.scheduleID = data.scheduleId;
    });

    $scope.$on('configurationChanged', function (event, data) {
      $scope.healthyConnectors[data.tabIndex] = false;
    });

    $scope.$on('healthCheckDetails', function (event, connectorDetails) {
      var connector = angular.copy(connectorDetails);
      const connectorConfig = _.find(connector.connectorInfo.configuration, { config_id: connector.config_id });
      if (connectorConfig.status === "Available") {
        if (!$scope.healthyConnectors[connector.tabIndex]) {
          $scope.installedConnectors[connector.tabIndex].health = true;
          _.assign(connector.connectorInfo, { "configuration": connectorConfig });
          _.assign(connector.connectorInfo, { "playbook_collections": connector.connectorInfo.playbook_collections[0] });
          _.assign(connector.connectorInfo, { "uuid": $scope.installedConnectors[connector.tabIndex].uuid });
          _processDataIngestion(connector.tabIndex, connector.connectorInfo);
        }
      }
      else {
        $scope.installedConnectors[connector.tabIndex].health = false;
        $scope.toggleConnectorConfigSettings = { open: true };
        $scope.toggleParametersSettings = { open: false };
        $scope.toggleScheduleConfigSettings = { open: false };
        $scope.healthyConnectors[connector.tabIndex] = false;
      }
    });

    function backToStartPage() {
      WizardHandler.wizard('timSolutionpackConfigWizard').previous();
    }

    function backToinstallConnector() {
      $scope.areFeedConnectorsConfigured = false;
      WizardHandler.wizard('timSolutionpackConfigWizard').previous();
    }

    function backToFeedRules() {
      WizardHandler.wizard('timSolutionpackConfigWizard').previous();
    }

    function moveToFinish() {
      let feedIntegrationNames = _.map($scope.installedConnectors, 'label');
      $scope.displayFeedIntegrations = feedIntegrationNames.join(', ');
      var queryPayload =
      {
        "request": $scope.feedRules
      }
      var queryUrl = API.MANUAL_TRIGGER + '6a4c2425-d0f8-454c-aae4-9a9bf5e6c171';
      $http.post(queryUrl, queryPayload).then(function (response) {
        WizardHandler.wizard('timSolutionpackConfigWizard').next();
        console.log(response);
      });
    }

    function backToConfigConnector() {
      $scope.areFeedConnectorsConfigured = false;
      WizardHandler.wizard('timSolutionpackConfigWizard').previous();
    }

    function backToSelectConnector() {
      $scope.feedConnectors.sort((firstItem, secondItem) => secondItem.installed - firstItem.installed);
      $scope.allConnectorsInstalled = false;
      WizardHandler.wizard('timSolutionpackConfigWizard').previous();
    }

    function moveToSelectConnector() {
      threatIntelManagementConfigurationService.getFeedConnectors(fortiGuardConnectorName).then(function (response) {
        $scope.fortiGuardConnector = response.data['hydra:member'][0];
        if ($scope.fortiGuardConnector.installed === false) {
          $scope.isFortiGuardConnectorInstalled = false;
          threatIntelManagementConfigurationService.installConnector($scope.fortiGuardConnector)
            .then(resp => {
              const importJobId = resp.data.importJob;
              threatIntelManagementConfigurationService.getConnectorInstallationProgress(importJobId, $scope.fortiGuardConnector)
                .then(() => {
                  threatIntelManagementConfigurationService.configFortiGuardConnector($scope.fortiGuardConnector).then(() => {
                    threatIntelManagementConfigurationService.getFeedConnectors().then(function (response) {
                      $scope.feedConnectors = response.data['hydra:member'];
                      $scope.feedConnectors.sort((firstItem, secondItem) => secondItem.installed - firstItem.installed);
                      $scope.feedConnectors.forEach(feedConnector => {
                        $scope.isFortiGuardConnectorInstalled = true;
                        feedConnector.selectConnector = feedConnector.installed ? true : false;
                      });
                      WizardHandler.wizard('timSolutionpackConfigWizard').next();
                    });
                  });
                })
                .catch(error => {
                  console.log(error);
                  // Continue to the next connector even if there is an error
                });
            })
            .catch(error => {
              console.log(error);
              // Continue to the next connector even if there is an error
            });
        }
        else {
          threatIntelManagementConfigurationService.configFortiGuardConnector($scope.fortiGuardConnector).then(() => {
            threatIntelManagementConfigurationService.getFeedConnectors().then(function (response) {
              $scope.feedConnectors = response.data['hydra:member'];
              $scope.feedConnectors.sort((firstItem, secondItem) => secondItem.installed - firstItem.installed);
              $scope.feedConnectors.forEach(feedConnector => {
                $scope.isFortiGuardConnectorInstalled = true;
                feedConnector.selectConnector = feedConnector.installed ? true : false;
              });
              WizardHandler.wizard('timSolutionpackConfigWizard').next();
            });
          });
        }
      });
    }

    function _processDataIngestion(tabIndex, healthyConnector) {
      // Return a promise to initiate the chain
      return new Promise((resolve, reject) => {
        widgetDataIngestionService.cloneIngestionPlaybookCollection($scope, healthyConnector).then(function () {
          widgetDataIngestionService.prepareFetchSampleConfig($scope, tabIndex, healthyConnector).then(function () {
            $scope.dataIngestCollectionUUIDs[tabIndex] = $scope.ingestCollectionUUID
            _createDefaultSchedule(tabIndex, $scope.healthyConnectorsParams[tabIndex]);
            $scope.healthyConnectors[tabIndex] = true;
            toaster.success({
              body: 'Data Ingestion successfully configured for the integration ' + healthyConnector.label
            });
            resolve();
          });
        }).catch(error => {
          console.error('Error processing healthyConnectors:', error);
          reject(error); // Reject if there's an error
        });
      });
    }

    function _createDefaultSchedule(tabIndex, ingestionConnectorDetails) {
      var queryBody = {
        name: "Ingestion_" + ingestionConnectorDetails.ingestionPlaybook.ingestionConnector.name + "_" + (ingestionConnectorDetails.ingestionPlaybook.ingestionConnector.configuration.name).replace(/\s+/g, '-') + "_" + ingestionConnectorDetails.ingestionPlaybook.ingestionConnector.configuration.config_id,
        "crontab": {
          "minute": "0",
          "hour": "*/1",
          "day_of_week": "*",
          "day_of_month": "*",
          "month_of_year": "*"
        },
        "kwargs": {
          "exit_if_running": true,
          "wf_iri": API.API_3_BASE + "API.WORKFLOWS" + ingestionConnectorDetails.ingestionPlaybook.ingestPlaybook['@id'],
          "timezone": "UTC",
          "utcOffset": "UTC",
          "createUser": "/api/3/people/3451141c-bac6-467c-8d72-85e0fab569ce"
        },
        "enabled": false
      }
      var url = API.WORKFLOW + 'api/scheduled/?depth=2&format=json&limit=' + ALL_RECORDS_SIZE + '&ordering=-modified&search=' + ingestionConnectorDetails.ingestionPlaybook.ingestionConnector.configuration.config_id + '&task=workflow.tasks.periodic_task'
      $resource(url).get({}).$promise.then(function (response) {
        if (response['hydra:member'].length === 0) {
          $resource(API.WORKFLOW + 'api/scheduled/?format').save(queryBody).$promise.then(function (postResponse) {
            $scope.saveSchedules[tabIndex] = postResponse;
          });
        }
        else {
          $scope.saveSchedules[tabIndex] = response['hydra:member'][0];
          console.log(response);
        }
        $scope.scheduleJsonData = angular.copy(ingestionConnectorDetails);
      });
    }

    function moveToFeedRules() {
      _checkConnectorHealth();
    }

    function saveParams(timParamsForm, index) {
      widgetDataIngestionService.saveDataIngestionParams($scope, timParamsForm, index)
    }


    function _checkConnectorHealth() {
      $scope.areFeedConnectorsConfigured = true;
      const promises = $scope.installedConnectors.reduce((promise, installedConnector, index) => {
        return promise.then(() => {
          return connectorService.getConnector(installedConnector.name, installedConnector.version)
            .then(connector => {
              if (connector.configuration.length > 0) {
                return _getConnectorHealth(installedConnector, connector, index);
              } else {
                return connectorService.getAgents(connector).then(agents => {
                  if (agents.length > 0) {
                    return connectorService.getConnector(agents[0].conn_name, agents[0].conn_version, agents[0].agent)
                      .then(response => _getConnectorHealth(installedConnector, response, index));
                  } else {
                    toaster.error({
                      body: 'The' + installedConnector.label + ' is not configured. To proceed with the wizard, please close the ' + installedConnector.label + ' tab.'
                    });
                    loadActiveTab(index);
                    return Promise.reject(); // Resolve to continue the chain
                  }
                });
              }
            });
        });
      }, Promise.resolve()); // Start with a resolved promise
      promises
        .then(() => {
          $scope.installedConnectors.reduce((promise, configConnector, index) => {
            return promise.then(() => {
              const metaData = {
                "name": $scope.saveSchedules[index].name,
                "description": "Metadata for " + $scope.saveSchedules[index].description,
                "modified_by": "3451141c-bac6-467c-8d72-85e0fab569ce",
                "owners": [],
                "connector": {
                  "name": configConnector.name,
                  "version": configConnector.version
                },
                "configuration": configConnector.connectorInfo.configuration[0].config_id,
                "metadata": {
                  "scheduleId": $scope.saveSchedules[index].id,
                  "scheduleName": $scope.saveSchedules[index].name,
                  "scheduleStatus": true
                }
              };
              return SchedulesService.saveScheduleMetadata(metaData);
            });
          }, Promise.resolve());

          $scope.feedIntegrationTools = _.map($scope.installedConnectors, 'label');
          _getExchangeConnectorDetails();
          WizardHandler.wizard('timSolutionpackConfigWizard').next();
        })
        .catch(error => {
          console.error('Error fetching connector health:', error);
        })
        .finally(() => {
          console.log('Finished processing all connectors.');
          $scope.areFeedConnectorsConfigured = false;
        });
    }

    function _getConnectorHealth(installedConnector, connector, index) {
      const defaultConfiguredConnector = _.find(connector.configuration, { default: true });
      let toasterMessage;
      if (!CommonUtils.isUndefined(defaultConfiguredConnector)) {
        return connectorService.getConnectorHealth(
          installedConnector,
          defaultConfiguredConnector.config_id,
          defaultConfiguredConnector.agent
        ).then(data => {
          if (!CommonUtils.isUndefined(data.status) && data.status === "Available") {
            loadActiveTab(index);
            $scope.connectorHealthStatus[index] = true;
            return widgetDataIngestionService.activateIngestionPlaybooks($scope.dataIngestCollectionUUIDs[index])
              .then(() => {
                $scope.saveSchedules[index].enabled = true;
                return SchedulesService.saveSchedule($scope.saveSchedules[index]);
              });
          } else if (data.id) {
            return $resource(API.INTEGRATIONS + 'connectors/' + installedConnector.name + '/' + installedConnector.version + '/?format=json&agent=' + data.agent).save({}).$promise.then(function (response) {
              const defaultAgentConfiguredConnector = _.find(response.configuration, { default: true });
              if (!CommonUtils.isUndefined(defaultAgentConfiguredConnector)) {
                if (defaultAgentConfiguredConnector.health_status.status === "Available") {
                  loadActiveTab(index);
                  $scope.connectorHealthStatus[index] = true;
                  if (!CommonUtils.isUndefined($scope.dataIngestCollectionUUIDs[index])) {
                    $scope.connectorHealthStatus[index] = true;
                    return widgetDataIngestionService.activateIngestionPlaybooks($scope.dataIngestCollectionUUIDs[index])
                      .then(() => {
                        $scope.saveSchedules[index].enabled = true;
                        return SchedulesService.saveSchedule($scope.saveSchedules[index]);
                      });
                  }
                  else {
                    toaster.error({
                      body: 'The agent configuration found for ' + installedConnector.label + '. Check the health check to configure the data ingetion'
                    });
                    return Promise.reject();
                  }
                }
              }
            });
          }
        });
      } else {
        toasterMessage = installedConnector.label + 'connector doesn\'t have a default configuration';
        toaster.error({ body: toasterMessage });
        loadActiveTab(index);
        return Promise.reject(); // Reject to break the chain
      }
    }

    function _getExchangeConnectorDetails() {
      var queryBody = {
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
            "field": "name",
            "operator": "eq",
            "value": "exchange"
          },
          {
            "field": "version",
            "operator": "notlike",
            "value": "%_dev"
          }
        ],
        "page": 1,
        "__selectFields": [
        ]
      };
      $resource(API.QUERY + 'solutionpacks?$limit=30&$page=1').save(queryBody).$promise.then(function (response) {
        if (response['hydra:member'] && response['hydra:member'].length > 0) {
          $scope.exchangeUUID = response['hydra:member'][0].uuid;
        }
      });
    }

    function configFieldChanged(deletedParams) {
      _deleteConfigKeys(deletedParams, $scope.ingestMethodActions.ingestionPlaybook.fetchPlaybook);
    }

    function _deleteConfigKeys(deletedConfigParams, samplePlaybookData) {
      angular.forEach(deletedConfigParams, function (param) {
        delete samplePlaybookData.steps[$scope.configIndex].arguments[param];
      });
    }

    function moveToConfigureConnector() {
      $scope.fetchingAvailableConnectors = false;
      $scope.installedConnectors = $scope.feedConnectors.filter(connector => connector.installed === true && connector.selectConnector === true);
      const fortiGuardConnector = _.find($scope.installedConnectors, { label: fortiGuardConnectorName });
      const filteredConnectors = _.filter($scope.installedConnectors, connector => connector.label !== fortiGuardConnectorName);
      const sortedConnectors = _.sortBy(filteredConnectors, 'label');
      $scope.installedConnectors = [fortiGuardConnector].concat(sortedConnectors);
      $scope.healthyConnectors = [];
      $scope.connectorHealthStatus = [];
      $scope.connectorParamsStatus = [];
      $scope.installedConnectors.reduce((promise, installedConnector, index) => {
        return promise.then(() => {
          installedConnector.health = false;
          $scope.healthyConnectors[index] = false;
          $scope.connectorHealthStatus[index] = false;
          $scope.connectorParamsStatus[index] = false;
          return _loadConnectorAgents(installedConnector, index);
        });
      }, Promise.resolve()) // Start with a resolved promise
        .then(() => {
          console.log('All connectors have been processed.');
        })
        .catch(error => {
          console.error('Error processing connectors:', error);
        });
      loadActiveTab($state.params.tabIndex, $state.params.tab);
      WizardHandler.wizard('timSolutionpackConfigWizard').next();
    }

    function _loadConnectorAgents(installedConnector, index) {
      let defer = $q.defer();
      connectorService.getAgents(installedConnector).then(function (installedAgents) {
        $scope.connectorInstalledOnAgents[index] = installedAgents;
        //handle toggleAgentMode function promise
        defer.resolve(installedAgents);
      });
      return defer.promise;
    }
  }
})();