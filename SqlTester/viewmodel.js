/* jshint maxerr: 1000 */
define([
    'jquery',
    'knockout',
    'vmBase',
    'user',
    'integration',
    'template/configuration'
], function viewmodel($, ko, vm, user, integration) {
    'use strict';

    var debugData = {
        logs: [],
        jsonData: null
    };

    // ==================== LOGGING FUNCTIONS ====================
    function addLog(message, type) {
        type = type || 'info';
        var $output = $('#outputArea');

        if ($output.find('.empty-state').length) {
            $output.empty();
        }

        var $line = $('<div>').addClass('log-line log-' + type).html(message);
        $output.append($line);

        var plainText = $('<div>').html(message).text();
        debugData.logs.push(plainText);

        $output.scrollTop($output[0].scrollHeight);
    }

    function log(msg) { addLog(msg, 'info'); }
    function logSuccess(msg) { addLog('\u2713 ' + msg, 'success'); }
    function logError(msg) { addLog('\u2717 ' + msg, 'error'); }
    function logWarn(msg) { addLog('\u26A0 ' + msg, 'warn'); }
    function logHeader(msg) { addLog(msg, 'header'); }
    function logBox(msg) { addLog(msg, 'box'); }
    function logData(data) {
        var json = JSON.stringify(data, null, 2);
        addLog('<div class="log-data">' + escapeHtml(json) + '</div>', 'data');
    }

    function escapeHtml(text) {
        var map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        };
        return text.replace(/[&<>"']/g, function(m) { return map[m]; });
    }

    // ==================== UI FUNCTIONS ====================
    function updateStats(integrationName, data) {
        $('#integrationName').text(integrationName);
        $('#lastRun').text(new Date().toLocaleTimeString());

        if (data && Array.isArray(data) && data.length > 0) {
            $('#recordCount').text(data.length);
            $('#columnCount').text(Object.keys(data[0]).length);
        } else {
            $('#recordCount').text('0');
            $('#columnCount').text('0');
        }
    }

    function setStatus(status, color) {
        $('#status').text(status).css('color', color);
    }

    function showNotification(message) {
        var $notif = $('#notification');
        $notif.text(message).addClass('show');
        setTimeout(function() {
            $notif.removeClass('show');
        }, 2000);
    }

    // ==================== MAIN TEST RUNNER ====================
    function runTest() {
        var integrationName = window.sqlTesterIntegrationName || 'SqlTester';

        // Clear previous output
        $('#outputArea').empty();
        debugData.logs = [];
        debugData.jsonData = null;

        // Show loading
        $('#loadingSpinner').addClass('active');
        setStatus('Loading...', '#f59e0b');

        log('=== SQL INTEGRATION TEST STARTED ===');
        log('Integration: ' + integrationName);
        log('Timestamp: ' + new Date().toLocaleString());
        log('');

        integration.all(integrationName).then(function(data) {
            $('#loadingSpinner').removeClass('active');

            logBox('\u2554\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2557');
            logBox('\u2551           SQL INTEGRATION RESULTS - DETAILED ANALYSIS             \u2551');
            logBox('\u255A\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u255D');
            log('');

            if (!data) {
                logError('CRITICAL: Data is null or undefined');
                log('Integration returned: ' + data);
                setStatus('Error', '#dc2626');
                updateStats(integrationName, null);
                return;
            }

            if (!Array.isArray(data)) {
                logError('CRITICAL: Data is not an array');
                log('Type received: ' + typeof data);
                log('Value: ' + data);
                setStatus('Error', '#dc2626');
                updateStats(integrationName, null);
                return;
            }

            // Store for export
            debugData.jsonData = data;
            updateStats(integrationName, data);

            logSuccess('Total Records Returned: <span class="record-count">' + data.length + '</span>');
            log('');

            if (data.length === 0) {
                logWarn('WARNING: Integration returned 0 records');
                log('Possible reasons:');
                logWarn('  - No data exists in database');
                logWarn('  - SQL query filters too restrictive');
                logWarn('  - Wrong parameters in query');
                setStatus('No Data', '#f59e0b');
                return;
            }

            // Analyze first record
            logHeader('\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550');
            logHeader('FIRST RECORD ANALYSIS:');
            logHeader('\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550');
            var firstRecord = data[0];

            log('Full First Record Object:');
            logData(firstRecord);
            log('');

            var columns = Object.keys(firstRecord);
            logSuccess('Total Columns/Fields: <span class="record-count">' + columns.length + '</span>');
            log('');
            log('Column Names:');
            columns.forEach(function(col, idx) {
                var value = firstRecord[col];
                var type = typeof value;
                var preview = value;

                if (typeof value === 'string' && value.length > 100) {
                    preview = value.substring(0, 100) + '... [truncated]';
                }

                log('  ' + (idx + 1) + '. <span class="field-name">"' + escapeHtml(col) + '"</span>');
                log('     Type: ' + type);
                log('     Value: <span class="field-value">' + escapeHtml(String(preview)) + '</span>');
                log('');
            });

            // Data completeness
            logHeader('\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550');
            logHeader('DATA COMPLETENESS ANALYSIS (First 10 Records):');
            logHeader('\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550');

            var sampleSize = Math.min(10, data.length);
            columns.forEach(function(col) {
                var nullCount = 0;
                var emptyCount = 0;
                var populatedCount = 0;

                for (var i = 0; i < sampleSize; i++) {
                    var val = data[i][col];
                    if (val === null || val === undefined) {
                        nullCount++;
                    } else if (val === '') {
                        emptyCount++;
                    } else {
                        populatedCount++;
                    }
                }

                var percent = Math.round((populatedCount / sampleSize) * 100);
                var msg = '<span class="field-name">"' + escapeHtml(col) + '"</span>: ' +
                         percent + '% populated (' + populatedCount + '/' + sampleSize + ')';

                if (percent === 100) {
                    logSuccess(msg);
                } else {
                    logWarn(msg);
                }

                if (nullCount > 0) log('    \u2514\u2500 ' + nullCount + ' null values');
                if (emptyCount > 0) log('    \u2514\u2500 ' + emptyCount + ' empty strings');
            });
            log('');

            // All records
            logHeader('\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550');
            logHeader('ALL RECORDS:');
            logHeader('\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550');

            data.forEach(function(record, idx) {
                var label = 'Record ' + (idx + 1);
                // Try to find a useful label from common ID fields
                var idFields = ['id', 'ID', 'FormID', 'ProcessStepId', 'TemplateID', 'Name', 'name'];
                for (var f = 0; f < idFields.length; f++) {
                    if (record[idFields[f]] != null) {
                        label = String(record[idFields[f]]);
                        break;
                    }
                }
                log((idx + 1) + '. ' + escapeHtml(label));
                if (data.length <= 100) {
                    log('   ' + escapeHtml(JSON.stringify(record)));
                }
                log('');
            });

            // Statistics
            logHeader('\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550');
            logHeader('SUMMARY:');
            logHeader('\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550');
            log('Total records: <span class="record-count">' + data.length + '</span>');
            log('Total columns: <span class="record-count">' + columns.length + '</span>');
            log('');

            logBox('\u2554\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2557');
            logBox('\u2551                  END OF SQL ANALYSIS                              \u2551');
            logBox('\u255A\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u255D');
            log('');
            logSuccess('Analysis complete - Use "Copy All" to export results');

            setStatus('Success', '#16a34a');

        }, function(error) {
            $('#loadingSpinner').removeClass('active');

            logBox('\u2554\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2557');
            logBox('\u2551                    INTEGRATION ERROR                              \u2551');
            logBox('\u255A\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u255D');
            if (error && error.message) {
                logError('Error: ' + error.message);
            } else {
                logError('Unknown error occurred');
                logData(error);
            }

            setStatus('Error', '#dc2626');
            updateStats(integrationName, null);
        });
    }

    // ==================== BUTTON HANDLERS ====================
    $('#runBtn').click(runTest);

    $('#copyBtn').click(function() {
        var text = debugData.logs.join('\n');
        navigator.clipboard.writeText(text).then(function() {
            showNotification('\u2713 All logs copied to clipboard!');
        }, function() {
            showNotification('\u26A0 Copy failed - please try again');
        });
    });

    $('#copyJsonBtn').click(function() {
        if (debugData.jsonData) {
            var text = JSON.stringify(debugData.jsonData, null, 2);
            navigator.clipboard.writeText(text).then(function() {
                showNotification('\u2713 JSON data copied to clipboard!');
            }, function() {
                showNotification('\u26A0 Copy failed - please try again');
            });
        } else {
            showNotification('\u26A0 No JSON data available');
        }
    });

    $('#clearBtn').click(function() {
        $('#outputArea').html(
            '<div class="empty-state">' +
            '<div class="empty-state-icon">\uD83C\uDFAF</div>' +
            '<h2>Ready to Test SQL Integration</h2>' +
            '<p>Click "Refresh Data" to run the query</p>' +
            '</div>'
        );
        debugData.logs = [];
        debugData.jsonData = null;
        $('#recordCount').text('0');
        $('#columnCount').text('0');
        setStatus('Ready', '#4ec9b0');
    });

    vm.onLoad = function onLoad(source, inputValues) {
        setTimeout(function() {
            $('#runBtn').click();
        }, 500);
    };

    vm.setDefaults = function setDefaults(source, inputValues) {
    };

    vm.afterLoad = function afterLoad() {
    };

    return vm;
});
