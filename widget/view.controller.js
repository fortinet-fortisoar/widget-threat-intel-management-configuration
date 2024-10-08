/* Copyright start
  Copyright (C) 2008 - 2023 Fortinet Inc.
  All rights reserved.
  FORTINET CONFIDENTIAL & FORTINET PROPRIETARY SOURCE CODE
  Copyright end */
'use strict';
(function () {
  angular
    .module('cybersponse')
    .controller('threatIntelManagementConfiguration100Ctrl', threatIntelManagementConfiguration100Ctrl);

  threatIntelManagementConfiguration100Ctrl.$inject = ['$scope', 'threatIntelManagementConfigurationService', 'widgetDataIngestionService', 'WizardHandler', '$controller', '$state', 'connectorService', 'currentPermissionsService', 'CommonUtils', 'API', '_', '$filter', '$http', 'dataIngestionService', 'PagedCollection', '$resource', 'FIXED_MODULE', 'Entity', 'playbookService', 'translationService', 'toaster', 'appModulesService', 'widgetBasePath', '$rootScope', '$timeout', 'ALL_RECORDS_SIZE'];

  function threatIntelManagementConfiguration100Ctrl($scope, threatIntelManagementConfigurationService, widgetDataIngestionService, WizardHandler, $controller, $state, connectorService, currentPermissionsService, CommonUtils, API, _, $filter, $http, dataIngestionService, PagedCollection, $resource, FIXED_MODULE, Entity, playbookService, translationService, toaster, appModulesService, widgetBasePath, $rootScope, $timeout, ALL_RECORDS_SIZE) {
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
    $scope.toggleConnectorConfigSettings = toggleConnectorConfigSettings;
    $scope.dataIngestionParamsUpdating = false;
    $scope.areFeedConnectorsConfigured = false;
    $scope.toggleConnectorConfig = [];
    $scope.toggleParametersConfig = [];
    $scope.toggleScheduleConfig = [];
    $scope.toggleParametersSettings = toggleParametersSettings;
    $scope.toggleScheduleConfigSettings = toggleScheduleConfigSettings;
    $scope.toggleFeedRules = toggleFeedRules;
    $scope.saveParams = saveParams;
    $scope.allConnectorsInstalled = false;
    $scope.loadActiveTab = loadActiveTab;
    $scope.feedConnectors = [];
    $scope.healthyConnectors = [];
    $scope.installedConnectors = [];
    $scope.samplePlaybookEntity = {};
    $scope.ingestMethodActions = {};
    $scope.searchQuery = '';
    $scope.healthyConnectorsParams = [];
    $scope.connectorHealthStatus = [];
    $scope.connectorParamsStatus = [];
    $scope.scheduleJsonData = undefined;
    $scope.params = {
      activeTab: 0
    };
    $scope.feedRules = {
      highConfidenceThreatFeeds: {
        enabled: true,
        open: true,
        name: 'High Confidence Threat Feed Block',
        feedConfidenceThreshold: 70
      },
      feedToIndicatorLinking: {
        enabled: true,
        open: true,
        name: 'Feed To Indicator Linking',
        feedConfidenceThreshold: 70
      },
      unstructuredFeedsSupport: {
        enabled: true,
        open: true,
        name: 'Unstructured Feeds Support',
        ingestFeedsFromFile: true,
        ingestFeedsFromEmail: false
      }
    };
    $scope.connectorFetchIndex = {};
    $scope.connectorConfigIndex = {};
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
      $scope.isFortiGuardConnectorInstalled = true;

      appModulesService.load(true).then(function (modules) {
        modules = $filter('playbookModules')(modules);
        $scope.modules = currentPermissionsService.availablePermissions(modules, 'create');
      });
      $scope.allowPlaybookEdit = currentPermissionsService.availablePermission('workflows', 'create') || currentPermissionsService.availablePermission('workflows', 'update');
    }

    function close() {
      $timeout(function () { $window.location.reload(); }, 3000);
      $state.go('main.modules.list', { module: 'threat_intel_feeds' }, { reload: true });
      $scope.$parent.$parent.$parent.$ctrl.handleClose();
    }

    function toggleFeedRules(feedRule, $event) {
      if ($event && $event.target.className === 'switch-slider') {
        feedRule.enabled = !feedRule.enabled;
        feedRule.open = !feedRule.open;
      }
    }

    function toggleConnectorConfigSettings(index) {
      $scope.toggleConnectorConfig[index] = !$scope.toggleConnectorConfig[index];
    }

    function toggleScheduleConfigSettings(index) {
      $scope.toggleScheduleConfig[index] = !$scope.toggleScheduleConfig[index];
    }

    function toggleSelectFeedsSettings(event) {
      event.stopPropagation();
    }

    function toggleParametersSettings(index) {
      $scope.toggleParametersConfig[index] = !$scope.toggleParametersConfig[index];
    }

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

    $scope.$on('healthCheckDetails', function (event, connectorDetails) {
      var connector = angular.copy(connectorDetails);
      const connectorConfig = _.find(connector.connectorInfo.configuration, { config_id: connector.config_id });
      if (connectorConfig.status === "Available") {
        _.assign(connector.connectorInfo, { "configuration": connectorConfig });
        _.assign(connector.connectorInfo, { "playbook_collections": connector.connectorInfo.playbook_collections[0] });
        _.assign(connector.connectorInfo, { "uuid": $scope.installedConnectors[connector.tabIndex].uuid });
        _processDataIngestion(connector.tabIndex, connector.connectorInfo);
      }
      else {
        var paramsConfig = document.getElementById('accordion-params-config-' + connector.tabIndex);
        if (_.includes(paramsConfig.childNodes[2].classList, "in")) {
          paramsConfig.childNodes[2].classList.replace('in', null);
          toggleParametersSettings(connector.tabIndex);
        }
        var schedulrConfig = document.getElementById('accordion-schedule-config-' + connector.tabIndex);
        if (_.includes(schedulrConfig.childNodes[2].classList, "in")) {
          schedulrConfig.childNodes[2].classList.replace('in', null);
          toggleScheduleConfigSettings(connector.tabIndex);
        }
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
      $scope.displayFeedIntegrations = _.map($scope.installedConnectors, "label").join(', ');
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
            widgetDataIngestionService.activateIngestionPlaybooks($scope.ingestCollectionUUID).then(function () {
              _createDefaultSchedule($scope.healthyConnectorsParams[tabIndex]);
              $scope.scheduleJsonData = angular.copy($scope.healthyConnectorsParams[tabIndex]);
              $scope.healthyConnectors[tabIndex] = true;
              resolve();
            });
          });
        }).catch(error => {
          console.error('Error processing healthyConnectors:', error);
          reject(error); // Reject if there's an error
        });
      });
    }

    function _createDefaultSchedule(ingestionConnectorDetails) {
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
          "wf_iri": API.API_3_BASE + "API.WORKFLOWS/" + ingestionConnectorDetails.ingestionPlaybook.ingestPlaybook['@id'],
          "timezone": "UTC",
          "utcOffset": "UTC",
          "createUser": "/api/3/people/3451141c-bac6-467c-8d72-85e0fab569ce"
        },
        "enabled": true
      }
      var url = API.WORKFLOW + 'api/scheduled/?depth=2&format=json&limit=' + ALL_RECORDS_SIZE + '&ordering=-modified&search=' + ingestionConnectorDetails.ingestionPlaybook.ingestionConnector.configuration.config_id + '&task=workflow.tasks.periodic_task'
      $resource(url).get({}).$promise.then(function (response) {
        if (response['hydra:member'].length === 0) {
          $resource(API.WORKFLOW + 'api/scheduled/?format').save(queryBody).$promise.then(function (postResponse) {
            console.log(postResponse);
          });
        }
        else {
          console.log(response);
        }
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
      var toasterMessage = undefined;
      $scope.installedConnectors.reduce((promise, installedConnector, index) => {
        return promise.then(() => {
          return connectorService.getConnector(installedConnector.name, installedConnector.version)
            .then(connector => {
              if (connector.configuration.length > 0) {
                const defaultConfiguredConnector = _.find(connector.configuration, { default: true });
                if (!CommonUtils.isUndefined(defaultConfiguredConnector)) {
                  return connectorService.getConnectorHealth(
                    installedConnector,
                    defaultConfiguredConnector.config_id,
                    defaultConfiguredConnector.agent
                  ).then(data => {
                    if (data.status === "Available") {
                      $scope.connectorHealthStatus[index] = true;
                    }
                  });
                }
                else {
                  toasterMessage = ' ';
                }
              }
            });
        });
      }, Promise.resolve())
        .then(() => {
          // This code will execute after all promises in the loop have resolved
          console.log('All connectors have been processed.');
          let indices = _.map(_.filter($scope.connectorHealthStatus, value => value === false), (value, index) => $scope.connectorHealthStatus.indexOf(value, index));
          const notConfigConnectors = _.uniq(indices).map(index => $scope.installedConnectors[index]);
          if (notConfigConnectors.length === 0) {
            WizardHandler.wizard('timSolutionpackConfigWizard').next();
            _getExchangeConnectorDetails();
          }
          else {
            var feedToolIndex = $scope.installedConnectors.indexOf(notConfigConnectors[0]);
            let notConfigConnectorsLabel = notConfigConnectors.map(connectorLabel => connectorLabel.label);
            if (!CommonUtils.isUndefined(toasterMessage)) {
              toasterMessage = 'Connector ' + notConfigConnectorsLabel.join(', ') + ' is not configured';
            }
            $scope.params.activeTab = feedToolIndex;
            loadActiveTab(feedToolIndex);
            var connectorConfig = document.getElementById('accordion-connector-config-' + feedToolIndex);
            if (!_.includes(connectorConfig.childNodes[2].classList, "in")) {
              toggleConnectorConfigSettings(feedToolIndex);
              $timeout(function () {
                connectorConfig.childNodes[2].classList.add('in');
              }, 100);
            }
            var paramsConfig = document.getElementById('accordion-params-config-' + feedToolIndex);
            if (_.includes(paramsConfig.childNodes[2].classList, "in")) {
              paramsConfig.childNodes[2].classList.replace('in', null);
              toggleParametersSettings(feedToolIndex);
            }
            var schedulrConfig = document.getElementById('accordion-schedule-config-' + feedToolIndex);
            if (_.includes(schedulrConfig.childNodes[2].classList, "in")) {
              schedulrConfig.childNodes[2].classList.replace('in', null);
              toggleScheduleConfigSettings(feedToolIndex);
            }
            if (CommonUtils.isUndefined(toasterMessage)) {
              toasterMessage = 'Connector ' + notConfigConnectorsLabel.join(', ') + ' is not configured';
              toaster.error({
                body: toasterMessage
              });
            }
          }
        })
        .catch(error => {
          // Handle errors if needed
          console.error('Error fetching connector health:', error);
        })
        .finally(() => {
          // This code will execute regardless of success or failure of the promises
          console.log('Finished processing all connectors.');
          $scope.areFeedConnectorsConfigured = false;
        });
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
      $scope.toggleConnectorConfig = [];
      $scope.toggleParametersConfig = [];
      $scope.toggleScheduleConfig = [];
      $scope.healthyConnectors = [];
      $scope.connectorHealthStatus = [];
      $scope.connectorParamsStatus = [];
      for (let index = 0; index < $scope.installedConnectors.length; index++) {
        $scope.toggleConnectorConfig[index] = true;
        $scope.toggleParametersConfig[index] = false;
        $scope.toggleScheduleConfig[index] = false;
        $scope.healthyConnectors[index] = false;
        $scope.connectorHealthStatus[index] = false;
        $scope.connectorParamsStatus[index] = false;
      }
      loadActiveTab($state.params.tabIndex, $state.params.tab);
      WizardHandler.wizard('timSolutionpackConfigWizard').next();
    }
  }
})();
