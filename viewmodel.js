/**
 * Dashboard Builder Wizard - Etrieve Viewmodel Wrapper
 * Deploys the wizard as a viewmodel form inside Etrieve Central.
 *
 * Instead of SimulatedData, this module calls real integration sources
 * to fetch areas, doc types, form templates, and input fields.
 *
 * REQUIRED INTEGRATION SOURCES (see configuration.js for names):
 *   - wizardGetAreas          (GET) → Returns Catalog areas
 *   - wizardGetDocTypes       (GET) → Returns doc types for a CatalogID
 *   - wizardGetKeyFields      (GET) → Returns key fields for a CatalogID
 *   - wizardGetFormTemplates  (GET) → Returns form templates
 *   - wizardGetFormInputs     (GET) → Returns input fields for a TemplateVersionID
 *   - wizardGetWorkflowSteps  (GET) → Returns workflow steps for a TemplateID
 */

define([
    'jquery',
    'knockout',
    'vmBase',
    'user',
    'integration',
    'template/configuration',
    'template/wizard-demo',
    'template/wizard-templates',
    'template/wizard-generators'
], function viewmodel($, ko, vm, user, integration) {

    // wizard-demo.js, wizard-templates.js, and wizard-generators.js are loaded
    // as RequireJS dependencies above. Their code runs in global scope (all
    // function/var declarations become window.*), so showToast, selectArea,
    // checkForDraft, renderStep, etc. are all available by the time this
    // module executes.

    console.log('[WizardBuilder] All scripts loaded via RequireJS');

    // ========================================================================
    // SAFE TOAST — fallback in case showToast somehow isn't available
    // ========================================================================
    function safeToast(msg, type) {
        if (typeof showToast === 'function') {
            showToast(msg, type);
        } else {
            console.error('[WizardBuilder] ' + msg);
        }
    }

    // ========================================================================
    // DATA ADAPTER — Bridges Etrieve integration.all() → SimulatedData shape
    // ========================================================================

    // Cache for loaded data so we don't re-fetch
    var _cache = {
        areas: null,
        documentTypes: {},
        keyFields: {},
        formTemplates: null,
        formInputIds: {},
        workflowSteps: {}
    };

    /**
     * Load areas/catalogs from Etrieve
     * Expected SQL: SELECT CatalogID AS id, [Name] AS name FROM [dbo].[Catalog] ORDER BY [Name]
     */
    function loadAreas() {
        if (_cache.areas) return $.Deferred().resolve(_cache.areas).promise();
        return integration.all(areasIntegrationName).then(function(data) {
            _cache.areas = data.map(function(row) {
                return { id: row.id || row.CatalogID, name: row.name || row.Name, description: row.description || row.Description || '' };
            });
            return _cache.areas;
        });
    }

    /**
     * Load document types for a given area
     * Expected SQL: SELECT DocumentTypeID AS id, d.Name AS name, d.Name AS code FROM [dbo].[DocumentType] d JOIN [dbo].[CatalogDocumentType] cd ON d.DocumentTypeID = cd.DocumentTypeID WHERE cd.CatalogID = @CatalogID ORDER BY d.Name
     */
    function loadDocTypes(areaId) {
        if (_cache.documentTypes[areaId]) return $.Deferred().resolve(_cache.documentTypes[areaId]).promise();
        return integration.all(docTypesIntegrationName, { CatalogID: areaId }).then(function(data) {
            _cache.documentTypes[areaId] = data.map(function(row) {
                return { id: row.id || row.DocumentTypeID, name: row.name || row.Name, code: row.code || row.Code || '' };
            });
            return _cache.documentTypes[areaId];
        });
    }

    /**
     * Load key fields for a given area
     * Expected SQL: SELECT DISTINCT f.FieldID AS id, f.Name AS name, CASE WHEN dt.Name='Date' THEN 'date' ELSE 'text' END AS type, f.Name AS alias FROM Field f JOIN DataType dt ON f.DataTypeID=dt.DataTypeID JOIN DocumentTypeField dtf ON f.FieldID=dtf.FieldID JOIN CatalogDocumentType cdt ON dtf.DocumentTypeID=cdt.DocumentTypeID WHERE cdt.CatalogID=@CatalogID
     */
    function loadKeyFields(areaId) {
        if (_cache.keyFields[areaId]) return $.Deferred().resolve(_cache.keyFields[areaId]).promise();
        return integration.all(keyFieldsIntegrationName, { CatalogID: areaId }).then(function(data) {
            _cache.keyFields[areaId] = data.map(function(row) {
                return { id: row.id || row.FieldID, name: row.name || row.Name, type: row.type || 'text', alias: row.alias || row.Name || '' };
            });
            return _cache.keyFields[areaId];
        });
    }

    /**
     * Load form templates
     * Expected SQL: SELECT tv.TemplateVersionID AS id, t.Name AS name, t.TemplateID AS templateId FROM reporting.central_forms_Template t JOIN reporting.central_forms_TemplateVersion tv ON t.TemplateID = tv.TemplateID WHERE tv.IsPublished = 1 ORDER BY t.Name
     */
    function loadFormTemplates() {
        if (_cache.formTemplates) return $.Deferred().resolve(_cache.formTemplates).promise();
        return integration.all(formTemplatesIntegrationName).then(function(data) {
            _cache.formTemplates = data.map(function(row) {
                return { id: row.id || row.TemplateVersionID, name: row.name || row.Name, templateId: row.templateId || row.TemplateID };
            });
            return _cache.formTemplates;
        });
    }

    /**
     * Load form input IDs for a given template
     * Expected SQL: SELECT DISTINCT iv.InputID AS id, iv.InputID AS label FROM reporting.central_forms_InputValue iv JOIN reporting.central_forms_Form f ON iv.FormID = f.FormID JOIN reporting.central_forms_TemplateVersion tv ON f.TemplateVersionID = tv.TemplateVersionID WHERE tv.TemplateVersionID = @TemplateVersionID ORDER BY iv.InputID
     */
    function loadFormInputs(templateVersionId) {
        if (_cache.formInputIds[templateVersionId]) return $.Deferred().resolve(_cache.formInputIds[templateVersionId]).promise();
        return integration.all(formInputsIntegrationName, { TemplateVersionID: templateVersionId }).then(function(data) {
            _cache.formInputIds[templateVersionId] = data.map(function(row) {
                return { id: row.id || row.InputID, label: row.label || row.InputID };
            });
            return _cache.formInputIds[templateVersionId];
        });
    }

    /**
     * Load workflow steps for a given template
     * Chain: Template → TemplateVersion.Code → PackageDocument.SourceTypeCode → TaskQueue → ProcessStep
     * Expected SQL returns: id, name, displayName
     * NOTE: ProcessStepId (lowercase 'd'), no StepOrder column exists
     */
    function loadWorkflowSteps(templateId) {
        if (_cache.workflowSteps[templateId]) return $.Deferred().resolve(_cache.workflowSteps[templateId]).promise();
        return integration.all(workflowStepsIntegrationName, { TemplateID: templateId }).then(function(data) {
            _cache.workflowSteps[templateId] = data.map(function(row, idx) {
                return {
                    id: row.id || row.ProcessStepId,
                    name: row.name || row.Name,
                    displayName: row.displayName || (row.name || row.Name || '').replace(/_/g, ' '),
                    order: idx,
                    activeCount: 0
                };
            });
            return _cache.workflowSteps[templateId];
        });
    }

    // ========================================================================
    // SIMULATED DATA REPLACEMENT
    // ========================================================================

    /**
     * Build a SimulatedData-compatible object from cached integration data.
     * The wizard code references SimulatedData.areas, .documentTypes, etc.
     * We replace it with a live proxy that triggers integration loads.
     */
    function buildLiveDataProxy() {
        return {
            areas: _cache.areas || [],
            documentTypes: _cache.documentTypes || {},
            keyFields: _cache.keyFields || {},
            formTemplates: _cache.formTemplates || [],
            formInputIds: _cache.formInputIds || {},
            workflowSteps: _cache.workflowSteps || {}
        };
    }

    // ========================================================================
    // ETRIEVE LIFECYCLE — Scripts loaded via RequireJS (no $.getScript needed)
    // ========================================================================

    vm.onLoad = function(source, inputValues) {
        // Hide the Etrieve parent frame panels to give wizard full screen
        try {
            window.parent.$('.hsplitter, .bottom_panel').hide();
            window.parent.$('.top_panel').css('height', '100%');
        } catch (e) { /* cross-origin or no parent frame */ }

        // Store current user info for the wizard
        window._etrieveUser = {
            username: user.userName || '',
            displayName: (user.FirstName || '') + ' ' + (user.LastName || ''),
            firstName: user.FirstName || '',
            lastName: user.LastName || ''
        };

        // Fetch each integration source independently so we can diagnose which ones fail
        var loading = $('.loading');
        if (loading.length) loading.show();

        var results = { areas: false, templates: false };

        var areasPromise = loadAreas().then(function(data) {
            results.areas = true;
            console.log('[WizardBuilder] ✓ GetAreas returned ' + data.length + ' areas');
        }).fail(function(err) {
            console.error('[WizardBuilder] ✗ GetAreas FAILED:', areasIntegrationName, err);
        });

        var templatesPromise = loadFormTemplates().then(function(data) {
            results.templates = true;
            console.log('[WizardBuilder] ✓ GetFormTemplates returned ' + data.length + ' templates');
        }).fail(function(err) {
            console.error('[WizardBuilder] ✗ GetFormTemplates FAILED:', formTemplatesIntegrationName, err);
        });

        // Wait for both to settle (regardless of success/failure), then initialize
        $.when(areasPromise, templatesPromise).always(function() {
            // Replace SimulatedData with whatever we got
            window.SimulatedData = buildLiveDataProxy();

            // Remove demo mode banner if present
            var demoBanner = document.getElementById('demoBanner');
            if (demoBanner) demoBanner.style.display = 'none';

            // Mark that we're running in Etrieve (not standalone demo)
            window._isEtrieveDeployed = true;

            // Log diagnostic summary
            console.log('[WizardBuilder] Source results:', results);
            if (!results.areas && !results.templates) {
                safeToast('Unable to connect to Softdocs. Please refresh and try again.', 'error');
            } else if (!results.areas) {
                safeToast('Unable to load document folders. Form Tracker mode still works.', 'error');
            } else if (!results.templates) {
                safeToast('Form templates not available. Document Lookup mode still works.', 'error');
            }

            // Trigger wizard initialization — DOMContentLoaded has already fired
            // by the time RequireJS runs, so call checkForDraft manually
            if (typeof checkForDraft === 'function') {
                checkForDraft();
            }

            if (loading.length) loading.hide();
            console.log('[WizardBuilder] Initialization complete');
        });
    };

    vm.setDefaults = function(source, inputValues) {
        // No form defaults needed for the wizard
    };

    vm.afterLoad = function() {
        // Wire up dynamic data loading for wizard steps that need on-demand data
        // When the wizard navigates to a step that needs doc types or key fields,
        // we intercept and load the data from Etrieve first.

        // Override the area selection to load doc types + key fields on demand
        var _origSelectArea = window.selectArea;
        if (typeof _origSelectArea === 'function') {
            window.selectArea = function(areaId, keepSelections) {
                var loading = $('.loading');
                if (loading.length) loading.show();

                $.when(loadDocTypes(areaId), loadKeyFields(areaId)).then(function() {
                    // Update SimulatedData with newly loaded data
                    window.SimulatedData.documentTypes[areaId] = _cache.documentTypes[areaId];
                    window.SimulatedData.keyFields[areaId] = _cache.keyFields[areaId];

                    // Call original function
                    _origSelectArea(areaId, keepSelections);
                    if (loading.length) loading.hide();
                }).fail(function() {
                    safeToast('Unable to load document types for this folder. Try a different folder.', 'error');
                    if (loading.length) loading.hide();
                });
            };
        }

        // Override template selection to load form inputs + workflow steps on demand
        var _origSelectTemplate = window.selectTemplate;
        if (typeof _origSelectTemplate === 'function') {
            window.selectTemplate = function(templateId, keepSelections) {
                var template = (_cache.formTemplates || []).find(function(t) { return t.id === templateId; });
                var tvId = templateId;
                var tId = template ? template.templateId : templateId;
                var loading = $('.loading');
                if (loading.length) loading.show();

                $.when(loadFormInputs(tvId), loadWorkflowSteps(tId)).then(function() {
                    console.log('[VM selectTemplate] Loaded formInputIds for', tvId, ':', (_cache.formInputIds[tvId] || []).length, 'inputs');
                    console.log('[VM selectTemplate] keepSelections:', keepSelections, 'current selectedInputIds:', window.State ? window.State.selectedInputIds.length : 'N/A');
                    window.SimulatedData.formInputIds[tvId] = _cache.formInputIds[tvId];
                    window.SimulatedData.workflowSteps[tId] = _cache.workflowSteps[tId];

                    _origSelectTemplate(templateId, keepSelections);
                    if (loading.length) loading.hide();
                }).fail(function(err) {
                    console.error('[VM selectTemplate] FAILED for tvId:', tvId, 'tId:', tId, err);
                    safeToast('Unable to load form fields. Try selecting a different form.', 'error');
                    if (loading.length) loading.hide();
                });
            };
        }
    };

    return vm;
});
