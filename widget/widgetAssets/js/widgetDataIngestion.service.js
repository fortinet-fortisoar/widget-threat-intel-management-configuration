/* Copyright start
  MIT License
  Copyright (c) 2024 Fortinet Inc
  Copyright end */
'use strict';
(function () {
    angular
        .module('cybersponse')
        .factory('widgetDataIngestionService', widgetDataIngestionService);

    widgetDataIngestionService.$inject = [ 'threatIntelManagementConfigurationService', 'connectorService', 'API', '_', '$filter', '$q', 'dataIngestionService', 'PagedCollection', '$resource', 'FIXED_MODULE', 'Entity', 'playbookService', 'translationService', 'toaster'];

    function widgetDataIngestionService( threatIntelManagementConfigurationService, connectorService, API, _, $filter, $q, dataIngestionService, PagedCollection, $resource, FIXED_MODULE, Entity, playbookService, translationService, toaster) {

        var service = {
            cloneIngestionPlaybookCollection: cloneIngestionPlaybookCollection,
            prepareFetchSampleConfig: prepareFetchSampleConfig,
            activateIngestionPlaybooks: activateIngestionPlaybooks,
            saveDataIngestionParams: saveDataIngestionParams
        };

        //Copy the data ingestion tags playbook from the sample playbook collection to the new data ingestion playbook collection.
        function cloneIngestionPlaybookCollection(scope, healthyConnector) {
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
                    scope.ingestMethodActions = {
                        'ingestionPlaybook': {
                            'fetchPlaybook': response.ingestPlabooks.fetch,
                            'ingestPlaybook': response.ingestPlabooks.ingest,
                            'createPlaybook': response.ingestPlabooks.create,
                            'updatePlaybook': response.ingestPlabooks.update
                        }
                    };
                    scope.ingestCollectionUUID = ingestCollectionUUID;
                    return Promise.resolve(); // Resolve promise to indicate completion
                })
                .catch(error => {
                    console.error('Error in cloneIngestionPlaybookCollection:', error);
                    return Promise.reject(error); // Handle errors
                });   
        }

        //Retrieve the sample configuration parameters from the fetch playbook.
        function prepareFetchSampleConfig(scope, tabIndex, healthyConnector) {
            let ingestionPlaybook = scope.ingestMethodActions.ingestionPlaybook;
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
                                    scope.connectorFetchIndex[healthyConnector.name] = {
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
                                    scope.connectorConfigIndex[healthyConnector.name] = {
                                        "configIndex": stepCount
                                    };
                                    ingestionPlaybook.fetchConfiguration = angular.copy(step.arguments);
                                } else if (step.name.toLowerCase() === 'start' && step.arguments.step_variables && step.arguments.step_variables._configuration_schema) {
                                    ingestionPlaybook.fetchOperation = angular.copy(JSON.parse(step.arguments.step_variables._configuration_schema));
                                }
                            }
                            if (ingestionPlaybook.fetchOperation) {
                                _populateValues(scope, ingestionPlaybook.fetchOperation);
                            }
                        }
                        scope.ingestMethodActions.ingestionPlaybook.fetchPlaybookCopy = angular.copy(ingestionPlaybook.fetchPlaybook);
                        scope.healthyConnectorsParams[tabIndex] = angular.copy(scope.ingestMethodActions);
                        scope.healthyConnectorsParams[tabIndex].ingestionPlaybook.ingestionConnector = healthyConnector;
                        scope.samplePlaybookEntity[healthyConnector.name] = angular.copy(connectorEntity);
                        return Promise.resolve(); // Resolve promise to indicate completion
                    })
                    .catch(error => {
                        console.error('Error in prepareFetchSampleConfig:', error);
                        return Promise.reject(error); // Handle errors
                    });
            }
            else{
                return new Promise((resolve, reject) => {
                    resolve();
                });
            }
        }

        function _populateValues(scope, parameters) {
            angular.forEach(parameters, function (parameter) {
                if (parameter.name in scope.ingestMethodActions.ingestionPlaybook.fetchConfiguration) {
                    parameter.value = scope.ingestMethodActions.ingestionPlaybook.fetchConfiguration[parameter.name];
                }
                if (parameter.onchange) {
                    if (parameter.type === 'multiselect' && angular.isArray(parameter.value)) {
                        parameter.value.forEach(function (selected) {
                            if (parameter.onchange[selected]) {
                                _populateValues(scope, parameter.onchange[selected]);
                            }
                        });
                    } else if (parameter.onchange[parameter.value]) {
                        _populateValues(scope, parameter.onchange[parameter.value]);
                    }
                }
            });
        }

        //Activate all the ingestion playbooks in the data ingestion playbook collection.
        function activateIngestionPlaybooks(ingestCollectionUUID) {
            let ingestionPlaybookPagedCollection = new PagedCollection('workflows', null, {
                collection: ingestCollectionUUID
            }, false);
            return ingestionPlaybookPagedCollection.load().then(function () {
                if (ingestionPlaybookPagedCollection.list) { // if ingestion playbooks are present
                    angular.forEach(ingestionPlaybookPagedCollection.list, function (playbook) {
                        playbook.isActive = true;
                    });
                }
                var apiResource = $resource(API.BASE, {}, {}, {
                    stripTrailingSlashes: false
                });
                // save ingestion playbooks
                return apiResource.save({
                    $relationships: true
                }, ingestionPlaybookPagedCollection.list).$promise.then(function () {
                    // self.moveNext();
                    // self.params.form.scheduleSaving = false;
                }, function (error) {
                    statusCodeService(error, true);
                });
            });
        }

        function saveDataIngestionParams(scope, timParamsForm, index) {
            if (timParamsForm.$invalid) {
                timParamsForm.$$parentForm.$setTouched();
                timParamsForm.$$parentForm.$focusOnFirstError();
                toaster.error({
                    body: 'Data Ingestion Parameters are not saved'
                });
                return;
            }
            scope.dataIngestionParamsUpdating = true;
            _updateConfigPrams(scope, scope.healthyConnectorsParams[index]).then(() => {
                scope.dataIngestionParamsUpdating = false;
                timParamsForm.$dirty = false;
                scope.connectorParamsStatus[index] = true;
            }).catch(error => {
                // Handle any errors if needed
                console.error('Error in _updateConfigPrams:', error);
            });
            console.log(timParamsForm);
        }

        async function _updateConfigPrams(scope, healthyConnectorsParam) {
                // Step 1: Get filtered modules
                scope.filteredModules = _getIngestionModules(scope.modules, healthyConnectorsParam);
                let moduleList = scope.filteredModules.length > 0 ? scope.filteredModules : [];
                scope.moduleType = scope.filteredModules.length > 0 ? scope.filteredModules[0].type : moduleList[0].type;
                // Step 2: Validate existing playbook
                healthyConnectorsParam.processing = false;
                let selectedPlaybook = healthyConnectorsParam.ingestionPlaybook.fetchPlaybook;
                healthyConnectorsParam.ingestionPlaybook.fetchConfigurationCopy = angular.copy(healthyConnectorsParam.ingestionPlaybook.fetchConfiguration);
                if (playbookService.isTagAvailable(selectedPlaybook, 'fetch', threatIntelManagementConfigurationService.ingestionRecordTags)) {
                    healthyConnectorsParam.processing = true;
                    // Step 3: Set fields asynchronously
                    try {
                        await _setFields(scope, moduleList);
                        // Step 4: Validate existing playbook after fields are set
                        if (_validateExistingPlaybook(healthyConnectorsParam)) {
                            let playbookId = $filter('getEndPathName')(selectedPlaybook['@id']);
                            let fetchModified = false;
                            let configModified = false;
                            scope.fieldsObj = scope.fieldsObj || {};
                            let playbookEntity = scope.samplePlaybookEntity[healthyConnectorsParam.ingestionPlaybook.ingestionConnector.name];
                            let fetchIndex = _.isEmpty(scope.connectorFetchIndex) ? -1 : scope.connectorFetchIndex[healthyConnectorsParam.ingestionPlaybook.ingestionConnector.name].fetchIndex;
                            let configIndex = _.isEmpty(scope.connectorConfigIndex) ? -1 : scope.connectorConfigIndex[healthyConnectorsParam.ingestionPlaybook.ingestionConnector.name].configIndex;
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
                            _getData(scope, playbookId, selectedPlaybook, healthyConnectorsParam);
                        }
                    } catch (error) {
                        console.error('Error processing:', error);
                        healthyConnectorsParam.processing = false;
                    }
                } else {
                    healthyConnectorsParam.processing = false;
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

        function _setFields(scope, moduleList, resetRecommendation) {
            let defer = $q.defer();
            let module = _.find(scope.filteredModules, function (module) {
                return module.type === scope.moduleType.toLowerCase();
            });
            if (angular.isUndefined(module)) {
                let foundModuleInList = _.find(moduleList, function (item) { return item.type === scope.moduleType; });
                module = resetRecommendation === true ? foundModuleInList : (scope.filteredModules.length > 0 ? scope.filteredModules[0] : foundModuleInList || moduleList[0]);
                scope.moduleType = resetRecommendation === true ? scope.moduleType : (scope.filteredModules.length > 0 ? scope.filteredModules[0].type : scope.moduleType || moduleList[0].type);
            }
            if (!module) {
                toaster.error({
                    body: translationService.instantTranslate(' is not a valid module! Please check whether module is present on the system.', { 'moduleName': scope.moduleType })
                });
                defer.reject();
            }
            if (module) {
                let entity = new Entity(module.type);
                entity.loadFields().then(function () {
                    // let fields = entity.getFormFieldsArray();
                    scope.fieldsObj = entity.getFormFields();
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

        function _getData(scope, playbookId, selectedPlaybook, healthyConnectorsParam) {
            healthyConnectorsParam.ingestionPlaybook.fetchPlaybookCopy = angular.copy(selectedPlaybook);
            _setPlaybookParams(selectedPlaybook);
            if (playbookService.isTagAvailable(selectedPlaybook, 'fetch', threatIntelManagementConfigurationService.ingestionRecordTags) && scope.configIndex > -1) {
                selectedPlaybook.steps[scope.configIndex].arguments = angular.extend(selectedPlaybook.steps[scope.configIndex].arguments, healthyConnectorsParam.ingestionPlaybook.fetchConfiguration);
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
        return service;
    }
})();
