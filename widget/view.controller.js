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

  threatIntelManagementConfiguration100Ctrl.$inject = ['$scope', 'threatIntelManagementConfigurationService', 'WizardHandler', '$controller', '$state', 'connectorService', 'currentPermissionsService', 'CommonUtils', '$window', 'API', '_', '$filter', '$q', 'dataIngestionService', 'PagedCollection', '$resource', 'FIXED_MODULE', 'Entity', 'playbookService', 'translationService', 'toaster', 'appModulesService', 'widgetBasePath', '$rootScope', 'marketplaceService'];

  function threatIntelManagementConfiguration100Ctrl($scope, threatIntelManagementConfigurationService, WizardHandler, $controller, $state, connectorService, currentPermissionsService, CommonUtils, $window, API, _, $filter, $q, dataIngestionService, PagedCollection, $resource, FIXED_MODULE, Entity, playbookService, translationService, toaster, appModulesService, widgetBasePath, $rootScope, marketplaceService) {
    $controller('BaseConnectorCtrl', {
      $scope: $scope
    });
    $scope.backToStartPage = backToStartPage;
    $scope.moveToConfigureConnector = moveToConfigureConnector;
    $scope.backToinstallConnector = backToinstallConnector;
    $scope.moveToSelectConnector = moveToSelectConnector;
    $scope.installConnector = installConnector;
    $scope.toggleSelectFeedsSettings = toggleSelectFeedsSettings;
    $scope.toggleConnectorConfigSettings = toggleConnectorConfigSettings;
    $scope.allConnectorsInstalled = false;
    $scope.feedConnectors = [];
    $scope.installedConnectors = [];
    $scope.searchQuery = '';
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

    function backToStartPage() {
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

    function moveToConfigureConnector() {
      $scope.fetchingAvailableConnectors = false;
      $scope.installedConnectors = $scope.feedConnectors.filter(connector => connector.installed === true && connector.selectConnector === true);
      loadActiveTab($state.params.tabIndex, $state.params.tab);
      WizardHandler.wizard('timSolutionpackWizard').next();
    }
  }
})();
