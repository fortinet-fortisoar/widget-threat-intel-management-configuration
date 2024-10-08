/* Copyright start
  MIT License
  Copyright (c) 2024 Fortinet Inc
  Copyright end */
'use strict';
(function () {
    angular
        .module('cybersponse')
        .controller('editThreatIntelManagementConfiguration100Ctrl', editThreatIntelManagementConfiguration100Ctrl);

    editThreatIntelManagementConfiguration100Ctrl.$inject = ['$scope', '$uibModalInstance', 'config'];

    function editThreatIntelManagementConfiguration100Ctrl($scope, $uibModalInstance, config) {
        $scope.cancel = cancel;
        $scope.save = save;
        $scope.config = config;

        function cancel() {
            $uibModalInstance.dismiss('cancel');
        }

        function save() {
            $uibModalInstance.close($scope.config);
        }

    }
})();
