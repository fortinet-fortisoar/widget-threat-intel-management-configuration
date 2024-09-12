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

  threatIntelManagementConfiguration100Ctrl.$inject = ['$scope', 'threatIntelManagementConfigurationService', 'WizardHandler', '$controller', '$state', 'connectorService', 'currentPermissionsService', 'CommonUtils', '$window', 'API', '_', '$filter', '$q', 'dataIngestionService', 'PagedCollection', '$resource', 'FIXED_MODULE', 'Entity', 'playbookService', 'translationService', 'toaster', 'appModulesService', 'widgetBasePath'];

  function threatIntelManagementConfiguration100Ctrl($scope, threatIntelManagementConfigurationService, WizardHandler, $controller, $state, connectorService, currentPermissionsService, CommonUtils, $window, API, _, $filter, $q, dataIngestionService, PagedCollection, $resource, FIXED_MODULE, Entity, playbookService, translationService, toaster, appModulesService, widgetBasePath) {
    $controller('BaseConnectorCtrl', {
      $scope: $scope
    });
    $scope.backToStartPage = backToStartPage;
    $scope.moveToConfigureConnector = moveToConfigureConnector;
    $scope.backToinstallConnector = backToinstallConnector;
    $scope.moveToSelectConnector = moveToSelectConnector;
    $scope.installConnector = installConnector;
    $scope.toggleSelectFeedsSettings = toggleSelectFeedsSettings;
    $scope.allConnectorsInstalled = false;
    $scope.feedConnectors = [];
    $scope.installedConnectors = [];
    $scope.searchQuery = '';
    $scope.widgetBasePath = widgetBasePath;
    $scope.widgetCSS = widgetBasePath + 'widgetAssets/css/wizard-style.css';

    init();

    function init() {
      $scope.isFortiGuardConectorInsttalled = true;
      appModulesService.load(true).then(function (modules) {
        modules = $filter('playbookModules')(modules);
        $scope.modules = currentPermissionsService.availablePermissions(modules, 'create');
      });
    }

    function toggleSelectFeedsSettings(event) {
      event.stopPropagation();
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
            threatIntelManagementConfigurationService.getInstallationProgress(importJobId, connector)
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

    function backToStartPage() {
      WizardHandler.wizard('timSolutionpackWizard').previous();
    }

    function backToinstallConnector() {
      $scope.feedConnectors.sort((firstItem, secondItem) => secondItem.installed - firstItem.installed);
      $scope.allConnectorsInstalled = false;
      WizardHandler.wizard('timSolutionpackWizard').previous();
    }

    function moveToSelectConnector() {
      threatIntelManagementConfigurationService.getFeedConnectors('Fortinet FortiGuard Threat Intelligence').then(function (response) {
        $scope.fortiGuardConector = response.data['hydra:member'][0];
        if ($scope.fortiGuardConector.installed === false) {
          $scope.isFortiGuardConectorInsttalled = false;
          threatIntelManagementConfigurationService.installConnector($scope.fortiGuardConector)
            .then(resp => {
              const importJobId = resp.data.importJob;
              threatIntelManagementConfigurationService.getInstallationProgress(importJobId, $scope.fortiGuardConector)
                .then(() => {
                  //$scope.fortiGuardConector.selectConnector = true;
                  threatIntelManagementConfigurationService.getFeedConnectors().then(function (response) {
                    $scope.feedConnectors = response.data['hydra:member'];
                    $scope.feedConnectors.sort((firstItem, secondItem) => secondItem.installed - firstItem.installed);
                    //$scope.installedConnectors = $scope.feedConnectors.filter(connector => connector.installed === true);
                    $scope.feedConnectors.forEach(feedConnector => {
                      //feedConnector.toggleSelectFeeds = false;
                      $scope.isFortiGuardConectorInsttalled = true;
                      feedConnector.selectConnector = feedConnector.installed ? true : false;
                      WizardHandler.wizard('timSolutionpackWizard').next();
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
          threatIntelManagementConfigurationService.getFeedConnectors().then(function (response) {
            $scope.feedConnectors = response.data['hydra:member'];
            $scope.feedConnectors.sort((firstItem, secondItem) => secondItem.installed - firstItem.installed);
            $scope.feedConnectors.forEach(feedConnector => {
              $scope.isFortiGuardConectorInsttalled = true;
              feedConnector.selectConnector = feedConnector.installed ? true : false;
              WizardHandler.wizard('timSolutionpackWizard').next();
            });
          });
        }
      });
    }

    function moveToConfigureConnector() {
      $scope.fetchingAvailableConnectors = false;
      WizardHandler.wizard('timSolutionpackWizard').next();
    }
  }
})();
