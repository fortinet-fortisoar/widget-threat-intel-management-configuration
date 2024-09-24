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

  threatIntelManagementConfiguration100Ctrl.$inject = ['$scope', 'threatIntelManagementConfigurationService', 'WizardHandler', '$controller', '$state', 'connectorService', 'currentPermissionsService', 'CommonUtils', 'API', '_', '$filter', '$q', 'dataIngestionService', 'PagedCollection', '$resource', 'FIXED_MODULE', 'Entity', 'playbookService', 'translationService', 'toaster', 'appModulesService', 'widgetBasePath', '$rootScope'];

  function threatIntelManagementConfiguration100Ctrl($scope, threatIntelManagementConfigurationService, WizardHandler, $controller, $state, connectorService, currentPermissionsService, CommonUtils, API, _, $filter, $q, dataIngestionService, PagedCollection, $resource, FIXED_MODULE, Entity, playbookService, translationService, toaster, appModulesService, widgetBasePath, $rootScope) {
    $controller('BaseConnectorCtrl', {
      $scope: $scope
    });
    $scope.backToStartPage = backToStartPage;
    $scope.moveVersionControlNext = moveVersionControlNext;
    $scope.backToConfigConnector = backToConfigConnector;
    $scope.moveToConfigureConnector = moveToConfigureConnector;
    $scope.backToinstallConnector = backToinstallConnector;
    $scope.moveToSelectConnector = moveToSelectConnector;
    $scope.backToSelectConnector = backToSelectConnector;
    $scope.moveToFeedRules = moveToFeedRules;
    $scope.backFeedRules = backFeedRules;
    $scope.configFieldChanged = configFieldChanged;
    $scope.moveToFinish = moveToFinish;
    $scope.installConnector = installConnector;
    $scope.toggleSelectFeedsSettings = toggleSelectFeedsSettings;
    $scope.toggleConnectorConfigSettings = toggleConnectorConfigSettings;
    $scope.paramsUpdating = false;
    $scope.feedConfigured = false;
    $scope.toggleConnectorConfig = [];
    $scope.toggleParametersConfig = [];
    $scope.toggleScheduleConfig = [];
    $scope.toggleParametersSettings = toggleParametersSettings;
    $scope.toggleScheduleSettings = toggleScheduleSettings;
    $scope.toggleScheduleConfigSettings = toggleScheduleConfigSettings;
    $scope.saveParams = saveParams;
    $scope.allConnectorsInstalled = false;
    $scope.loadActiveTab = loadActiveTab;
    $scope.feedConnectors = [];
    $scope.isConnectorHealthy = [];
    $scope.installedConnectors = [];
    $scope.samplePlaybookEntity = {};
    $scope.ingestMethodActions = {};
    $scope.searchQuery = '';
    $scope.availableConnectors = [];
    $scope.healthyConnectorsParams = [];
    $scope.connectorHealthStatus = [];
    $scope.connectorParamsStatus = [];
    $scope.scheduleJsonData = undefined;
    $scope.params = { activeTab: 0 };
    $scope.connectorFetchIndex = {};
    $scope.connectorConfigIndex = {};
    $scope.isLightTheme = $rootScope.theme.id === 'light';
    $scope.widgetBasePath = widgetBasePath;
    $scope.startInfoGraphics = $scope.isLightTheme ? widgetBasePath + 'images/start-light.svg' : widgetBasePath + 'images/start-dark.svg';
    $scope.feedSources = $scope.isLightTheme ? widgetBasePath + 'images/feed-sources-light.svg' : widgetBasePath + 'images/feed-sources-dark.svg';
    $scope.installFeeds = $scope.isLightTheme ? widgetBasePath + 'images/install-feeds-light.svg' : widgetBasePath + 'images/install-feeds-dark.svg';
    $scope.configFeeds = $scope.isLightTheme ? widgetBasePath + 'images/config-feeds-light.svg' : widgetBasePath + 'images/config-feeds-dark.svg';
    $scope.feedRules = $scope.isLightTheme ? widgetBasePath + 'images/feed-rules-light.svg' : widgetBasePath + 'images/feed-rules-dark.svg';
    $scope.finishInfoGraphics = widgetBasePath + 'images/finish.png';
    $scope.widgetCSS = widgetBasePath + 'widgetAssets/css/wizard-style.css';
    $scope.widgetScript = widgetBasePath + 'widgetAssets/js/threatIntelManagementConfiguration.service.js'
    $scope.ingestionRecordTags = {
      dataingestion: '/api/3/tags/dataingestion',
      create: '/api/3/tags/create',
      ingest: '/api/3/tags/ingest',
      fetch: '/api/3/tags/fetch',
      update: '/api/3/tags/update',
      connector: '/api/3/tags/'
    };
    const fortiGuardConnectorName = 'Fortinet FortiGuard Threat Intelligence';

    init();

    function init() {
      $scope.isFortiGuardConectorInstalled = true;

      appModulesService.load(true).then(function (modules) {
        modules = $filter('playbookModules')(modules);
        $scope.modules = currentPermissionsService.availablePermissions(modules, 'create');
      });
      $scope.allowPlaybookEdit = currentPermissionsService.availablePermission('workflows', 'create') || currentPermissionsService.availablePermission('workflows', 'update');
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

    function toggleScheduleSettings(connector, minimizeOthers) {
      if (minimizeOthers && $scope.jsonData && $scope.jsonData.length > 0) {
        $scope.jsonData.forEach(pack => {
          pack.ingestionPlaybook.ingestionConnector.toggleAccordion = (pack.ingestionPlaybook.ingestionConnector.label === connector.label) ? true : false;
        });
      }
      connector.toggleAccordion = !connector.toggleAccordion;
    }

    function installConnector() {
      WizardHandler.wizard('timSolutionpackWizard').next();
      $scope.getSelectedConnectorsCount = function () {
        var feedConnectors = Array.isArray($scope.feedConnectors) ? $scope.feedConnectors : [];
        var installedConnectors = Array.isArray($scope.installedConnectors) ? $scope.installedConnectors : [];

        return feedConnectors.filter(function (connector) {
          return connector.selectConnector;
        }).length + installedConnectors.length;
      };
      const selectedConnectors = $scope.feedConnectors.filter(pack => pack.selectConnector === true && pack.installed === false);

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
      $scope.isConnectorHealthy[tabIndex] = false;
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
      $scope.activeTabIndex = tabIndex;
      $scope.connectorProcessing = true;
      connectorService.getConnector(installedConnector.name, installedConnector.version).then(function (connector) {
        installedConnector.connectorInfo = angular.copy(connector);
        installedConnector.connectorInfo.baseId = angular.copy(connector.id);
        $scope.connectorProcessing = false;
        if (connector.configuration.length > 0) {
          const defaultConfiguredConnector = _.find(connector.configuration, { default: true });
          if (!CommonUtils.isUndefined(defaultConfiguredConnector)) {
            connectorService.getConnectorHealth(installedConnector, defaultConfiguredConnector.config_id, defaultConfiguredConnector.agent).then(function (data) {
              if (data.status === "Available") {
                var connectorInfo = {
                  "connector": {
                    "name": 'dataingestion',
                    "label": installedConnector.label,
                    "version": installedConnector.version,
                    "uuid": installedConnector.uuid,
                  },
                  "config": {
                    "name": defaultConfiguredConnector.name,
                    "config_id": defaultConfiguredConnector.config_id,
                    "sample_collections_iri": $filter('getEndPathName')(connector.playbook_collections[0]['@id'])
                  }
                };
                $scope.availableConnectors.push(connectorInfo);
                _.assign(connector, { "configuration": defaultConfiguredConnector });
                _.assign(connector, { "playbook_collections": connector.playbook_collections[0] });
                _.assign(connector, { "uuid": installedConnector.uuid });
                _processHealthyConnectors(tabIndex, [connector]);
              }
            });
          }
          else {
            toaster.error({
              body: 'The connector "' + installedConnector.name + '" does not have a default configuration. At least one configuration  must be set as default.'
            });
            return;
          }
        }
        else {
          console.log('Connector is not configured:', installedConnector.name);
        }
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

    function backToStartPage() {
      WizardHandler.wizard('timSolutionpackWizard').previous();
    }

    function backToSelectConnector() {
      $scope.feedConfigured = false;
      WizardHandler.wizard('timSolutionpackWizard').previous();
    }

    function backFeedRules(){
      WizardHandler.wizard('timSolutionpackWizard').previous();
    }

    function moveToFinish(){
      WizardHandler.wizard('timSolutionpackWizard').next();
    }

    function backToConfigConnector() {
      $scope.feedConfigured = false;
      WizardHandler.wizard('timSolutionpackWizard').previous();
    }

    function backToinstallConnector() {
      $scope.feedConnectors.sort((firstItem, secondItem) => secondItem.installed - firstItem.installed);
      $scope.allConnectorsInstalled = false;
      WizardHandler.wizard('timSolutionpackWizard').previous();
    }

    function moveToSelectConnector() {
      threatIntelManagementConfigurationService.getFeedConnectors(fortiGuardConnectorName).then(function (response) {
        var fortiGuardConnector = response.data['hydra:member'][0];
        if (fortiGuardConnector.installed === false) {
          $scope.isFortiGuardConectorInstalled = false;
          threatIntelManagementConfigurationService.installConnector(fortiGuardConnector)
            .then(resp => {
              const importJobId = resp.data.importJob;
              threatIntelManagementConfigurationService.getConnectorInstallationProgress(importJobId, fortiGuardConnector)
                .then(() => {
                  threatIntelManagementConfigurationService.getFeedConnectors().then(function (response) {
                    $scope.feedConnectors = response.data['hydra:member'];
                    $scope.feedConnectors.sort((firstItem, secondItem) => secondItem.installed - firstItem.installed);
                    $scope.feedConnectors.forEach(feedConnector => {
                      $scope.isFortiGuardConectorInstalled = true;
                      feedConnector.selectConnector = feedConnector.installed ? true : false;
                    });
                    WizardHandler.wizard('timSolutionpackWizard').next();
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
          threatIntelManagementConfigurationService.getFeedConnectors().then(function (response) {
            $scope.feedConnectors = response.data['hydra:member'];
            $scope.feedConnectors.sort((firstItem, secondItem) => secondItem.installed - firstItem.installed);
            $scope.feedConnectors.forEach(feedConnector => {
              $scope.isFortiGuardConectorInstalled = true;
              feedConnector.selectConnector = feedConnector.installed ? true : false;
            });
            WizardHandler.wizard('timSolutionpackWizard').next();
          });
        }
      });
    }

    function moveVersionControlNext() {
      WizardHandler.wizard('timSolutionpackWizard').next();
    }

    function _processHealthyConnectors(tabIndex, healthyConnectors) {
      // Return a promise to initiate the chain
      return new Promise((resolve, reject) => {
        // Chain the promises sequentially
        healthyConnectors.reduce((chain, healthyConnector) => {
          return chain
            .then(() => _cloneIngestionPlaybookCollection(healthyConnector))
            .then(() => _prepareFetchSampleConfig(tabIndex, healthyConnector))
            .then(() => _createSchedule($scope.healthyConnectorsParams[tabIndex]))
            .then(() => {
              // Execute the additional statements here
              activateIngestionPlaybooks();
              $scope.scheduleJsonData = angular.copy($scope.healthyConnectorsParams[tabIndex]);
              $scope.isConnectorHealthy[tabIndex] = true;
            });
        }, Promise.resolve())
          .then(() => {
            console.log('All healthyConnectors processed successfully.');
            resolve(); // Resolve the main promise chain
          })
          .catch(error => {
            console.error('Error processing healthyConnectors:', error);
            reject(error); // Reject if there's an error
          });
      });
    }

    function _createSchedule(ingestionConnectorDetails) {
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
          "wf_iri": API.API_3_BASE + "workflows/" + ingestionConnectorDetails.ingestionPlaybook.ingestPlaybook['@id'],
          "timezone": "UTC",
          "utcOffset": "UTC",
          "createUser": "/api/3/people/3451141c-bac6-467c-8d72-85e0fab569ce"
        },
        "enabled": true
      }
      var url = API.WORKFLOW + 'api/scheduled/?depth=2&format=json&limit=30&ordering=-modified&search=' + ingestionConnectorDetails.ingestionPlaybook.ingestionConnector.configuration.config_id + '&task=workflow.tasks.periodic_task'
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

    function _cloneIngestionPlaybookCollection(healthyConnector) {
      var connector = {
        "name": 'dataingestion',
        "label": healthyConnector.label,
        "version": healthyConnector.version,
        "uuid": healthyConnector.uuid,
      };
      var config = {
        "name": healthyConnector.configuration.name,
        "config_id": healthyConnector.configuration.config_id,
        "sample_collections_iri": $filter('getEndPathName')(healthyConnector.playbook_collections['@id'])
      };
      // Initialize ingestCollectionUUID as undefined initially
      let ingestCollectionUUID;
      // Return the promise chain for _cloneIngestionPlaybookCollection
      return connectorService.getIngestionPlaybookCollectionUUID({ config: config, connector: connector, label: 'Ingestion' })
        .then(response => {
          ingestCollectionUUID = response; // Capture ingestCollectionUUID from response
          let _preparePlaybooksParams = {
            config: config,
            connector: connector,
            ingestionCollectionUUID: ingestCollectionUUID,
            selectedCollectionId: config.sample_collections_iri,
            isIngestionCollection: true,
            ingestionProcessing: true,
            collectionChanged: false
          };
          return dataIngestionService.preparePlaybooksForIngestion(_preparePlaybooksParams);
        })
        .then(prepareResponse => {
          var ingestSupportedPlaybooks = prepareResponse.ingestionSupportedPlaybooks;
          var _saveIngestionParams = {
            playbooks: ingestSupportedPlaybooks,
            connector: connector,
            ingestionCollectionUUID: ingestCollectionUUID, // Pass ingestCollectionUUID to _saveIngestionParams
            isCollectionChanged: false,
            isIngestionCollection: false
          };
          return dataIngestionService.saveIngestionPlaybooks(_saveIngestionParams);
        })
        .then(response => {
          $scope.ingestMethodActions = {
            'ingestionPlaybook': {
              'fetchPlaybook': response.ingestPlabooks.fetch,
              'ingestPlaybook': response.ingestPlabooks.ingest,
              'createPlaybook': response.ingestPlabooks.create,
              'updatePlaybook': response.ingestPlabooks.update
            }
          };
          return Promise.resolve(); // Resolve promise to indicate completion
        })
        .catch(error => {
          console.error('Error in _cloneIngestionPlaybookCollection:', error);
          return Promise.reject(error); // Handle errors
        });
    }

    function _prepareFetchSampleConfig(tabIndex, healthyConnector) {
      let ingestionPlaybook = $scope.ingestMethodActions.ingestionPlaybook;
      let connectorEntity = new Entity(FIXED_MODULE.PLAYBOOK);
      ingestionPlaybook.fetchConfiguration = {};
      ingestionPlaybook.fetchConfigurationCopy = {};
      ingestionPlaybook.fetchOperation = null;
      if (ingestionPlaybook.fetchPlaybook && ingestionPlaybook.fetchPlaybook['@id']) {
        var playbookId = $filter('getEndPathName')(ingestionPlaybook.fetchPlaybook['@id']);
        return connectorEntity.get(playbookId, { $relationships: true })
          .then(() => {
            ingestionPlaybook.fetchPlaybook = angular.extend(ingestionPlaybook.fetchPlaybook, connectorEntity.originalData);
            let samplePlaybook = ingestionPlaybook.fetchPlaybook;

            if (samplePlaybook && samplePlaybook.steps) {
              let stepCount;
              for (stepCount = 0; stepCount < samplePlaybook.steps.length; stepCount++) {
                let step = samplePlaybook.steps[stepCount];
                if (step.name.toLowerCase() === 'fetch') {
                  $scope.connectorFetchIndex[healthyConnector.name] = {
                    "fetchIndex": stepCount
                  }
                  ingestionPlaybook.fetchConfiguration = angular.copy(step.arguments.params);
                  var opCount = 0;
                  for (opCount = 0; opCount < healthyConnector.operations.length; opCount++) {
                    if (healthyConnector.operations[opCount].operation === step.arguments.operation) {
                      ingestionPlaybook.fetchOperation = angular.copy(healthyConnector.operations[opCount].parameters);
                      break;
                    }
                  }
                  break;
                }
                if (step.name.toLowerCase() === 'configuration') {
                  $scope.connectorConfigIndex[healthyConnector.name] = {
                    "configIndex": stepCount
                  };
                  ingestionPlaybook.fetchConfiguration = angular.copy(step.arguments);
                } else if (step.name.toLowerCase() === 'start' && step.arguments.step_variables && step.arguments.step_variables._configuration_schema) {
                  ingestionPlaybook.fetchOperation = angular.copy(JSON.parse(step.arguments.step_variables._configuration_schema));
                }
              }
              if (ingestionPlaybook.fetchOperation) {
                _populateValues(ingestionPlaybook.fetchOperation);
              }
            }
            $scope.ingestMethodActions.ingestionPlaybook.fetchPlaybookCopy = angular.copy(ingestionPlaybook.fetchPlaybook);
            $scope.healthyConnectorsParams[tabIndex] = angular.copy($scope.ingestMethodActions);
            $scope.healthyConnectorsParams[tabIndex].ingestionPlaybook.ingestionConnector = healthyConnector;
            $scope.samplePlaybookEntity[healthyConnector.name] = angular.copy(connectorEntity);
            return Promise.resolve(); // Resolve promise to indicate completion
          })
          .catch(error => {
            console.error('Error in prepareFetchSampleConfig:', error);
            return Promise.reject(error); // Handle errors
          });
      }
    }

    function _populateValues(parameters) {
      angular.forEach(parameters, function (parameter) {
        if (parameter.name in $scope.ingestMethodActions.ingestionPlaybook.fetchConfiguration) {
          parameter.value = $scope.ingestMethodActions.ingestionPlaybook.fetchConfiguration[parameter.name];
        }
        if (parameter.onchange) {
          if (parameter.type === 'multiselect' && angular.isArray(parameter.value)) {
            parameter.value.forEach(function (selected) {
              if (parameter.onchange[selected]) {
                _populateValues(parameter.onchange[selected]);
              }
            });
          } else if (parameter.onchange[parameter.value]) {
            _populateValues(parameter.onchange[parameter.value]);
          }
        }
      });
    }

    function moveToFeedRules() {
      _checkConnectorHealth();
    }

    function saveParams(timParamsForm, index) {
      if (timParamsForm.$invalid) {
        timParamsForm.$$parentForm.$setTouched();
        timParamsForm.$$parentForm.$focusOnFirstError();
        toaster.error({
          body: 'Data Ingestion Parameters are not saved'
        });
        return;
      }
      $scope.paramsUpdating = true;
      _updateConfigPrams([$scope.healthyConnectorsParams[index]]).then(() => {
        $scope.paramsUpdating = false;
        timParamsForm.$dirty = false;
        $scope.connectorParamsStatus[index] = true;
      }).catch(error => {
        // Handle any errors if needed
        console.error('Error in _updateConfigPrams:', error);
      });
      console.log(timParamsForm);
    }

    function _checkConnectorHealth() {
      $scope.feedConfigured = true;
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
            WizardHandler.wizard('timSolutionpackWizard').next();
          } else {
            var feedToolIndex = $scope.installedConnectors.indexOf(notConfigConnectors[0]);
            let notConfigConnectorsLabel = notConfigConnectors.map(connectorLabel => connectorLabel.label);
            if (!CommonUtils.isUndefined(toasterMessage)) {
              toasterMessage = 'Connector ' + notConfigConnectorsLabel.join(', ') + ' is not configured';
            }
            $scope.params.activeTab = feedToolIndex;
            loadActiveTab(feedToolIndex);
            var connectorConfig = document.getElementById('accordion-connector-config-' + feedToolIndex);
            if (!_.includes(connectorConfig.childNodes[2].classList, "in")) {
              connectorConfig.childNodes[2].classList.add('in');
              toggleConnectorConfigSettings(feedToolIndex);
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
          $scope.feedConfigured = false;
        });
    }

    async function _updateConfigPrams() {
      for (let healthyConnectorsParam of _.filter($scope.healthyConnectorsParams, obj => !_.isEmpty(obj))) {
        //let healthyConnectorsParam = $scope.healthyConnectorsParams;
        // Step 1: Get filtered modules
        $scope.filteredModules = _getIngestionModules($scope.modules, healthyConnectorsParam);
        let moduleList = $scope.filteredModules.length > 0 ? $scope.filteredModules : [];
        $scope.moduleType = $scope.filteredModules.length > 0 ? $scope.filteredModules[0].type : moduleList[0].type;
        // Step 2: Validate existing playbook
        healthyConnectorsParam.processing = false;
        let selectedPlaybook = healthyConnectorsParam.ingestionPlaybook.fetchPlaybook;
        healthyConnectorsParam.ingestionPlaybook.fetchConfigurationCopy = angular.copy(healthyConnectorsParam.ingestionPlaybook.fetchConfiguration);
        if (playbookService.isTagAvailable(selectedPlaybook, 'fetch', $scope.ingestionRecordTags)) {
          healthyConnectorsParam.processing = true;
          // Step 3: Set fields asynchronously
          try {
            await setFields(moduleList);
            // Step 4: Validate existing playbook after fields are set
            if (_validateExistingPlaybook(healthyConnectorsParam)) {
              let playbookId = $filter('getEndPathName')(selectedPlaybook['@id']);
              let fetchModified = false;
              let configModified = false;
              $scope.fieldsObj = $scope.fieldsObj || {};
              let playbookEntity = $scope.samplePlaybookEntity[healthyConnectorsParam.ingestionPlaybook.ingestionConnector.name];
              let fetchIndex = _.isEmpty($scope.connectorFetchIndex) ? -1 : $scope.connectorFetchIndex[healthyConnectorsParam.ingestionPlaybook.ingestionConnector.name].fetchIndex;
              let configIndex = _.isEmpty($scope.connectorConfigIndex) ? -1 : $scope.connectorConfigIndex[healthyConnectorsParam.ingestionPlaybook.ingestionConnector.name].configIndex;
              // Step 5: Modify sample playbook data if needed
              if (playbookEntity) {
                var samplePlaybookData = playbookEntity.getData();
                samplePlaybookData['@id'] = playbookEntity.originalData['@id'];
                if (fetchIndex > -1 && (!angular.equals(samplePlaybookData.steps[fetchIndex].arguments.params, healthyConnectorsParam.ingestionPlaybook.fetchConfiguration))) {
                  fetchModified = true;
                  samplePlaybookData.steps[fetchIndex].arguments.params = angular.extend(samplePlaybookData.steps[fetchIndex].arguments.params, healthyConnectorsParam.ingestionPlaybook.fetchConfiguration);
                } else if (configIndex > -1 && (!angular.equals(selectedPlaybook.steps[configIndex].arguments, healthyConnectorsParam.ingestionPlaybook.fetchConfiguration))) {
                  configModified = true;
                  selectedPlaybook.steps[configIndex].arguments = angular.extend(selectedPlaybook.steps[configIndex].arguments, healthyConnectorsParam.ingestionPlaybook.fetchConfiguration);
                  samplePlaybookData.steps[configIndex].arguments = angular.copy(selectedPlaybook.steps[configIndex].arguments);
                }
                // Step 6: Save sample playbook entity if modified
                if (fetchModified || configModified) {
                  let samplePlaybook = playbookService.preparePlaybookForSave(samplePlaybookData);
                  await playbookEntity.save(samplePlaybook, { $relationships: true });
                }
              }
              // Step 7: Get data after modifying or if not modified
              _getData(playbookId, selectedPlaybook, healthyConnectorsParam);
            }
          } catch (error) {
            console.error('Error processing:', error);
            healthyConnectorsParam.processing = false;
          }
        } else {
          healthyConnectorsParam.processing = false;
        }
      }
    }

    function _getIngestionModules(modules, healthyConnectorsParam) {
      let modulesList = [];
      angular.forEach(modules, function (module) {
        if (_.indexOf(healthyConnectorsParam.ingestionPlaybook.ingestionConnector.ingestion_preferences.modules, module.type) > -1) {
          modulesList.push(module);
        }
      });
      return modulesList;
    }

    function setFields(moduleList, resetRecommendation) {
      let defer = $q.defer();
      let module = _.find($scope.filteredModules, function (module) {
        return module.type === $scope.moduleType.toLowerCase();
      });
      if (angular.isUndefined(module)) {
        let foundModuleInList = _.find(moduleList, function (item) { return item.type === $scope.moduleType; });
        module = resetRecommendation === true ? foundModuleInList : ($scope.filteredModules.length > 0 ? $scope.filteredModules[0] : foundModuleInList || moduleList[0]);
        $scope.moduleType = resetRecommendation === true ? $scope.moduleType : ($scope.filteredModules.length > 0 ? $scope.filteredModules[0].type : $scope.moduleType || moduleList[0].type);
      }
      if (!module) {
        toaster.error({
          body: translationService.instantTranslate(' is not a valid module! Please check whether module is present on the system.', { 'moduleName': $scope.moduleType })
        });
        defer.reject();
      }
      if (module) {
        let entity = new Entity(module.type);
        entity.loadFields().then(function () {
          // let fields = entity.getFormFieldsArray();
          $scope.fieldsObj = entity.getFormFields();
          //setRecommendationFields(fields, resetRecommendation);
          if (entity.uniqueConstraint && entity.uniqueConstraint.length > 0) {
            uniqueConstraintFields = angular.copy(entity.uniqueConstraint[0][entity.module + '_unique'].columns);
            //self.mapConstraintMsgToField(module.name);
          } else {
            uniqueConstraintFields = [];
            constraintMessage = null;
          }
          //clearSearchText();
        }).finally(function () {
          defer.resolve({});
        });
      }
      return defer.promise;
    }

    function _validateExistingPlaybook(healthyConnectorsParam) {
      let ingestTag = '#Ingest';
      if (!healthyConnectorsParam.ingestionPlaybook.ingestPlaybook) {
        toaster.error({
          body: 'Playbook not available by tag name "' + ingestTag + '"'
        });
      }
      return healthyConnectorsParam.ingestionPlaybook.ingestPlaybook;
    }

    function _getData(playbookId, selectedPlaybook, healthyConnectorsParam) {
      healthyConnectorsParam.ingestionPlaybook.fetchPlaybookCopy = angular.copy(selectedPlaybook);
      _setPlaybookParams(selectedPlaybook);
      if (playbookService.isTagAvailable(selectedPlaybook, 'fetch', $scope.ingestionRecordTags) && $scope.configIndex > -1) {
        selectedPlaybook.steps[$scope.configIndex].arguments = angular.extend(selectedPlaybook.steps[$scope.configIndex].arguments, healthyConnectorsParam.ingestionPlaybook.fetchConfiguration);
      }

    }

    function _setPlaybookParams(selectedPlaybook) {
      selectedPlaybook.allow_reference_inactive = true;
      selectedPlaybook.priority = { itemValue: 'High' };
      _addPayloadInStartStep(selectedPlaybook);
    }

    function _addPayloadInStartStep(selectedPlaybook) {
      let triggerStep = _.find(selectedPlaybook.steps, function (step) {
        return step['@id'] === selectedPlaybook.triggerStep;
      });
      triggerStep.arguments.request = triggerStep.arguments.request || {};
      triggerStep.arguments.request.env_setup = true;
    }

    function activateIngestionPlaybooks(ingestCollectionUUID) {
      let ingestionPlaybookPagedCollection = new PagedCollection('workflows', null, {
        collection: ingestCollectionUUID
      }, false);
      ingestionPlaybookPagedCollection.load().then(function () {
        if (ingestionPlaybookPagedCollection.list) { // if ingestion playbooks are present
          angular.forEach(ingestionPlaybookPagedCollection.list, function (playbook) {
            playbook.isActive = true;
          });
        }
        var apiResource = $resource(API.BASE, {}, {}, {
          stripTrailingSlashes: false
        });
        // save ingestion playbooks
        apiResource.save({
          $relationships: true
        }, ingestionPlaybookPagedCollection.list).$promise.then(function () {
          // self.moveNext();
          // self.params.form.scheduleSaving = false;
        }, function (error) {
          statusCodeService(error, true);
        });
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
      $scope.connectorHealthStatus = [];
      $scope.connectorParamsStatus = [];
      for (let index = 0; index < $scope.installedConnectors.length; index++) {
        $scope.toggleConnectorConfig[index] = true;
        $scope.toggleParametersConfig[index] = false;
        $scope.toggleScheduleConfig[index] = false;
        $scope.isConnectorHealthy[index] = false;
        $scope.connectorHealthStatus[index] = false;
        $scope.connectorParamsStatus[index] = false;
      }
      loadActiveTab($state.params.tabIndex, $state.params.tab);
      WizardHandler.wizard('timSolutionpackWizard').next();
    }
  }
})();
