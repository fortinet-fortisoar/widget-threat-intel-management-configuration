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

  threatIntelManagementConfiguration100Ctrl.$inject = ['$scope', 'threatIntelManagementConfigurationService', 'WizardHandler', '$interval', '$controller', 'connectorService', 'currentPermissionsService', 'CommonUtils', '$window'];

  function threatIntelManagementConfiguration100Ctrl($scope, threatIntelManagementConfigurationService, WizardHandler, $interval, $controller, connectorService, currentPermissionsService, CommonUtils, $window) {
    $controller('BaseConnectorCtrl', {
      $scope: $scope
    });

    $scope.moveEnvironmentNext = moveEnvironmentNext;
    $scope.movePrevious = movePrevious;
    $scope.installConnector = installConnector;
    $scope.loadConnectorDetails = loadConnectorDetails;
    $scope.toggleAdvancedSettings = toggleAdvancedSettings;
    $scope.saveConnector = saveConnector;
    $scope.feedConnectors = {};
    $scope.searchQuery = '';
    init();

    function init() {
      threatIntelManagementConfigurationService.getFeedConnectors().then(function (response) {
        $scope.feedConnectors = response.data['hydra:member'];
      });
    }

    function toggleAdvancedSettings(connector, minimizeOthers) {
      if (minimizeOthers && $scope.installedConnectors && $scope.installedConnectors.length > 0) {
        $scope.installedConnectors.forEach(pack => {
          pack.toggleAccordion = pack.name === connector.name;
        });
      }
      connector.toggleAccordion = connector.toggleAccordion === undefined ? true : !connector.toggleAccordion;
    }

    function installConnector() {
      moveEnvironmentNext();
      $scope.getSelectedConnectorsCount = function () {
        return $scope.feedConnectors.filter(function (connector) {
          return connector.selectConnector;
        }).length;
      };
      const selectedConnectors = $scope.feedConnectors.filter(pack => pack.selectConnector === true);

      function installSequentially(index) {
        if (index >= selectedConnectors.length) {
          $scope.allConnectorsInstalled = true;
          return; // All connectors have been processed
        }
        const connector = selectedConnectors[index];
        threatIntelManagementConfigurationService.installConnector(connector)
          .then(resp => {
            const importJobId = resp.data.importJob;
            threatIntelManagementConfigurationService.getInstallationProgress(importJobId, connector)
              .then(() => {
                connector.installed = true;
                installSequentially(index + 1); // Move to the next connector
              })
              .catch(error => {
                console.log(error);
                // Continue to the next connector even if there is an error
                installSequentially(index + 1);
              });
          })
          .catch(error => {
            console.log(error);
            // Continue to the next connector even if there is an error
            installSequentially(index + 1);
          });
      }
      installSequentially(0);
    }

    function loadConnectorDetails(connector) {
      _loadConnectorDetails(connector.name, connector.version);
      // _loadConnectorDetails("botvrij-misp-osint-feed", "1.0.0");
    }

    function _loadConnectorDetails(connectorName, connectorVersion, connectorDetails) {
      $scope.processingConnector = true;
      connectorService.getConnector(connectorName, connectorVersion).then(function (connector) {
        if (!connector) {
          toaster.error({
            body: 'The Connector "' + connectorName + '" is not installed. Istall the connector and re-run thiz wizard to complete the configuration'
          });
          return;
        }
        $scope.selectedConnector = connector;
        $scope.loadConnector($scope.selectedConnector, false, false);
        $scope.processingConnector = false;
      });
    }

    function saveConnector(saveFrom) {
      $scope.isConnectorConfigured = true;
      $scope.configuredConnector = false;
      var data = angular.copy($scope.connector);
      if (CommonUtils.isUndefined(data)) {
        $scope.statusChanged = false;
        return;
      }
      if (!currentPermissionsService.availablePermission('connectors', 'update')) {
        $scope.statusChanged = false;
        return;
      }
      var newConfiguration, newConfig, deleteConfig;
      newConfiguration = false;
      if (saveFrom !== 'deleteConfigAndSave') {
        if (!_.isEmpty($scope.connector.config_schema)) {
          if (!$scope.validateConfigurationForm()) {
            return;
          }
        }
        if (!$scope.input.selectedConfiguration.id) {
          newConfiguration = true;
          $scope.input.selectedConfiguration.config_id = $window.UUID.generate();
          if ($scope.input.selectedConfiguration.default) {
            angular.forEach(data.configuration, function (configuration) {
              if (configuration.config_id !== $scope.input.selectedConfiguration.config_id) {
                configuration.default = false;
              }
            });
          }
          data.configuration.push($scope.input.selectedConfiguration);
          newConfig = $scope.input.selectedConfiguration;
        }
        delete data.newConfig;
      }
      if (saveFrom === 'deleteConfigAndSave') {
        $scope.isConnectorConfigured = false;
        deleteConfig = true;
        $scope.isConnectorHealthy = false;
      }
      var updateData = {
        connector: data.id,
        name: $scope.input.selectedConfiguration.name,
        config_id: $scope.input.selectedConfiguration.config_id,
        id: $scope.input.selectedConfiguration.id,
        default: $scope.input.selectedConfiguration.default,
        config: {},
        teams: $scope.input.selectedConfiguration.teams
      };
      $scope.saveValues($scope.input.selectedConfiguration.fields, updateData.config);
      $scope.processing = true;
      connectorService.updateConnectorConfig(updateData, newConfiguration, deleteConfig).then(function (response) {
        if (newConfig) {
          $scope.connector.configuration.push(newConfig);
          if (newConfig.default) {
            $scope.removeDefaultFromOthers();
          }
        }
        $scope.formHolder.connectorForm.$setPristine();
        if (!deleteConfig) {
          $scope.input.selectedConfiguration.id = response.id;
          $scope.configuredConnector = true;
          $scope.isConnectorHealthy = true;
        }
        $scope.checkHealth();
        $scope.statusChanged = false;
      }, function (error) {
        toaster.error({
          body: error.data.message ? error.data.message : error.data['hydra:description']
        });
      }).finally(function () {
        $scope.processing = false;
      });
    }


    function movePrevious() {
      WizardHandler.wizard('solutionpackWizard').previous();
    }

    function moveEnvironmentNext(filterInstalledConnectors) {
      WizardHandler.wizard('solutionpackWizard').next();
      if (filterInstalledConnectors) {
        $scope.installedConnectors = $scope.feedConnectors.filter(connector => connector.installed === true);
      }
    }

  }
})();
