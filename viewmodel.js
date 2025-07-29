console.log('viewmodel.js loaded');

// --- GLOBAL STATE --- //
var integration;
var areaIntegrationName = 'metadataIntegration';
var docTypesIntegrationName = 'docTypesIntegration';
var partyFieldsIntegrationName = 'partyFieldsIntegration';
var selectedAreaIds = [];
var selectedDocumentTypeIds = [];
var allDocumentTypes = [];
var allPartyFields = [];
var selectedPartyFieldNames = [];
var selectedKeyFields = [];
var swimlaneDefinitions = [];
var selectedColumnNames = [];
var documentStartDate = null;
var relativeMonthRange = null;
var exitStatusField = null;
var exitStatusValue = null;

// --- PARTY FIELD EXPANSION HELPER --- //
function expandPartyFieldToColumns(fieldName) {
  // This must match your SQL builder's partyFieldMappings
  var partyFieldMappings = {
    'Student Info': [
      { name: 'StudentID', fieldId: 25 },
      { name: 'StudentFName', fieldId: 2 },
      { name: 'StudentLName', fieldId: 4 }
    ],
    'Institutional Info': [
      { name: 'InstitutionName', fieldId: 27 }
    ]
    // Add more if needed!
  };
  var columns = [];
  columns.push(fieldName + 'Lookup');
  if (partyFieldMappings[fieldName]) {
    partyFieldMappings[fieldName].forEach(function(attr) {
      columns.push(attr.name);
    });
  }
  return columns;
}


// --- INIT ENTRYPOINT --- //
require(['integration'], function(integrationModule) {
  integration = integrationModule;
  $(function() { initializeUserInterface(); });
});

// --- INITIALIZATION & UI EVENT BINDINGS --- //
function initializeUserInterface() {
  $('#loadAreasBtn').click(loadAvailableAreas);
  $('#buildSqlBtn').click(buildSqlQuery);
  $('#addSwimlaneBtn').click(addSwimlaneDefinition);
  $('#generateFilesBtn').click(generateDashboardFiles);

  $('#addKeyfieldBtn').click(addKeyFieldManually);
  $('#generateIndexBtn').click(generateDashboardIndexFile);
  $('#generateConfigBtn').click(generateDashboardConfigFile);
  $('#generateViewModelBtn').click(generateDashboardViewModelFile);


  $('#startDateInput').change(function () {
    documentStartDate = $(this).val() || null;
  });
  $('#dateRangeSelect').change(function () {
    relativeMonthRange = $(this).val() ? parseInt($(this).val(), 10) : null;
  });
  $('#exitStatusFieldSelect').change(function() {
    exitStatusField = $(this).val();
  });
  $('#exitStatusValueInput').on('input', function() {
    exitStatusValue = $(this).val();
  });
  updateDashboardPreview();
  renderKeyFieldList();
}

// --- AREA AND DOCUMENT TYPE LOGIC --- //
function loadAvailableAreas() {
  $('.loading').show();
  integration.all(areaIntegrationName)
    .then(function(areaData) {
      $('.loading').hide();
      resetAllSelections();
      areaData.sort((a, b) => a.CatalogName.localeCompare(b.CatalogName));
      renderList('#availableAreas', areaData, 'CatalogID', 'CatalogName', handleSelectArea);
    })
    .catch(function(error) {
      $('.loading').hide();
      console.error('Error loading areas:', error);
    });
}

function handleSelectArea() {
  var areaId = String($(this).data('id'));
  if (selectedAreaIds.includes(areaId)) return;
  selectedAreaIds.push(areaId);
  $(this).addClass('active');
  updateSelectedList('#selectedAreas', selectedAreaIds, 'CatalogID', 'CatalogName', lookupAreaName, handleRemoveArea);
  loadDocumentTypesForAreas(selectedAreaIds);
  updateDashboardPreview();
}

function handleRemoveArea() {
  var areaId = String($(this).data('id'));
  selectedAreaIds = selectedAreaIds.filter(id => id !== areaId);
  $('#availableAreas .list-group-item').filter((_, li) => String($(li).data('id')) === areaId).removeClass('active');
  updateSelectedList('#selectedAreas', selectedAreaIds, 'CatalogID', 'CatalogName', lookupAreaName, handleRemoveArea);
  loadDocumentTypesForAreas(selectedAreaIds);

  var validDocTypeIds = allDocumentTypes.map(dt => String(dt.DocumentTypeID));
  selectedDocumentTypeIds = selectedDocumentTypeIds.filter(id => validDocTypeIds.includes(id));
  updateSelectedList('#selectedDocTypes', selectedDocumentTypeIds, 'DocumentTypeID', 'DocumentTypeName', lookupDocumentTypeName, handleRemoveDocumentType);

  swimlaneDefinitions = swimlaneDefinitions.filter(swimlane => {
    swimlane.documentTypeIds = swimlane.documentTypeIds.filter(id => validDocTypeIds.includes(id));
    return swimlane.documentTypeIds.length > 0;
  });
  renderSwimlaneList();
  updateSwimlaneDocTypesSelect();
  updateDashboardPreview();
}

function loadDocumentTypesForAreas(areaIds) {
  $('.loading').show();
  integration.all(docTypesIntegrationName)
    .then(function(documentTypes) {
      $('.loading').hide();
      allDocumentTypes = documentTypes.filter(dt => areaIds.includes(String(dt.CatalogID)));
      allDocumentTypes.sort((a, b) => a.DocumentTypeName.localeCompare(b.DocumentTypeName));
      renderList('#availableDocTypes', allDocumentTypes, 'DocumentTypeID', 'DocumentTypeName', handleSelectDocumentType);
      updateSwimlaneDocTypesSelect();

      var validDocTypeIds = allDocumentTypes.map(dt => String(dt.DocumentTypeID));
      selectedDocumentTypeIds = selectedDocumentTypeIds.filter(id => validDocTypeIds.includes(id));
      updateSelectedList('#selectedDocTypes', selectedDocumentTypeIds, 'DocumentTypeID', 'DocumentTypeName', lookupDocumentTypeName, handleRemoveDocumentType);

      swimlaneDefinitions = swimlaneDefinitions.filter(swimlane => {
        swimlane.documentTypeIds = swimlane.documentTypeIds.filter(id => validDocTypeIds.includes(id));
        return swimlane.documentTypeIds.length > 0;
      });
      renderSwimlaneList();
      loadDiscoveredPartyFields();
      updateDashboardPreview();
    })
    .catch(function(error) {
      $('.loading').hide();
      console.error('Error loading document types:', error);
    });
}

// --- PARTY FIELD DISCOVERY (Step 4) --- //
function loadDiscoveredPartyFields() {
  if (!selectedDocumentTypeIds.length) {
    allPartyFields = [];
    renderDiscoveredPartyFields();
    return;
  }
  $('.loading').show();
  integration.all(partyFieldsIntegrationName, { docTypeIds: selectedDocumentTypeIds })
    .then(function(partyFieldData) {
      $('.loading').hide();
      allPartyFields = dedupePartyFields(partyFieldData);
      renderDiscoveredPartyFields();
      updateSwimlaneFieldOptions();
      updateExitStatusFieldOptions();
      updateAvailableColumnOptions();
      updateDashboardPreview();
    })
    .catch(function(error) {
      $('.loading').hide();
      allPartyFields = [];
      renderDiscoveredPartyFields();
      updateSwimlaneFieldOptions();
      updateExitStatusFieldOptions();
      updateAvailableColumnOptions();
      updateDashboardPreview();
      console.error('Error loading party fields:', error);
    });
}

function dedupePartyFields(fields) {
  var seen = {};
  return fields.filter(function(f) {
    if (seen[f.FieldName]) return false;
    seen[f.FieldName] = true;
    return true;
  });
}

function renderDiscoveredPartyFields() {
  var $ul = $('#discoveredPartyFields').empty();
  if (!allPartyFields.length) {
    $ul.append($('<li>').addClass('list-group-item text-muted').text('No linked person/entity fields found for these document types.'));
    return;
  }
  allPartyFields.forEach(function(field) {
    var $li = $('<li>')
      .addClass('list-group-item list-group-item-action')
      .toggleClass('active', selectedPartyFieldNames.includes(field.FieldName))
      .text(field.DisplayName || field.FieldName)
      .click(function() {
        var idx = selectedPartyFieldNames.indexOf(field.FieldName);
        if (idx === -1) {
          selectedPartyFieldNames.push(field.FieldName);
        } else {
          selectedPartyFieldNames.splice(idx, 1);
        }
        $(this).toggleClass('active');
        updateSwimlaneFieldOptions();
        updateExitStatusFieldOptions();
        updateAvailableColumnOptions();
        updateDashboardPreview();
      });
    $ul.append($li);
  });
}

// --- ADDITIONAL KEYFIELDS LOGIC (Step 4b) --- //
function addKeyFieldManually() {
  var fieldId = $('#keyfieldIdInput').val().trim();
  var fieldName = $('#keyfieldNameInput').val().trim();
  var fieldType = $('#keyfieldTypeInput').val() || 'text';

  // Auto-set type if the user didn't pick and "date" is in the field name
  if (!fieldType && /date/i.test(fieldName)) {
    fieldType = 'date';
  }

  if (!fieldId || !fieldName) {
    alert('Both Field ID and Name are required.');
    return;
  }
  if (selectedKeyFields.some(kf => kf.FieldName === fieldName)) {
    alert('Keyfield name already added.');
    return;
  }

  selectedKeyFields.push({
    FieldID: fieldId,
    FieldName: fieldName,
    FieldType: fieldType
  });

  renderKeyFieldList();
  $('#keyfieldIdInput,#keyfieldNameInput').val('');
  $('#keyfieldTypeInput').val('text'); // Reset to default

  updateSwimlaneFieldOptions();
  updateAvailableColumnOptions();
  updateExitStatusFieldOptions();
  updateDashboardPreview();
}


function renderKeyFieldList() {
  var $ul = $('#selectedKeyfields').empty();
  selectedKeyFields.forEach(function(keyField, idx) {
    var $li = $('<li>')
      .addClass('list-group-item list-group-item-action d-flex justify-content-between align-items-center')
      .text(keyField.FieldName + ' (ID:' + keyField.FieldID + ')')
      .append(
        $('<button>')
          .addClass('btn btn-danger btn-sm ml-2')
          .text('Remove')
          .click(function(e) {
            e.stopPropagation();
            selectedKeyFields.splice(idx, 1);
            renderKeyFieldList();
            updateSwimlaneFieldOptions();
            updateAvailableColumnOptions();
            updateExitStatusFieldOptions();
            updateDashboardPreview();
          })
      );
    $ul.append($li);
  });
}

// --- SWIMLANE MANAGEMENT --- //
function addSwimlaneDefinition() {
  var swimlaneName = $('#swimlaneNameInput').val().trim();
  var selectedDocTypeOptions = $('#swimlaneDocTypesSelect').find('option:selected');
  var documentTypeIds = $.map(selectedDocTypeOptions, function(opt) { return String($(opt).val()); });
  var field = $('#swimlaneFieldSelect').val() || null;
  var value = $('#swimlaneValueInput').val().trim() || null;
  if (!swimlaneName || !documentTypeIds.length) {
    alert('Swimlane name and at least one document type are required.');
    return;
  }
  swimlaneDefinitions.push({
    name: swimlaneName,
    documentTypeIds: documentTypeIds,
    keyfield: field,
    matchValue: value
  });
  renderSwimlaneList();
  $('#swimlaneNameInput,#swimlaneValueInput').val('');
  $('#swimlaneDocTypesSelect').val([]);
  $('#swimlaneFieldSelect').val('');
  updateDashboardPreview();
}

function renderSwimlaneList() {
  var $ul = $('<ul class="list-group"></ul>');
  swimlaneDefinitions.forEach((swimlane, index) => {
    var docNames = swimlane.documentTypeIds.map(id => lookupDocumentTypeName(id)).join(', ');
    var text = swimlane.name + ' | Docs: ' + docNames;
    if (swimlane.keyfield && swimlane.matchValue) {
      text += ' | ' + swimlane.keyfield + ' = ' + swimlane.matchValue;
    }
    $('<li>').addClass('list-group-item list-group-item-action')
      .text(text)
      .data('idx', index)
      .click(removeSwimlane)
      .appendTo($ul);
  });
  $('#selectedSwimlanes').empty().append($ul);
}

function removeSwimlane() {
  var swimlaneIndex = $(this).data('idx');
  swimlaneDefinitions.splice(swimlaneIndex, 1);
  renderSwimlaneList();
  updateDashboardPreview();
}

// --- DOCUMENT TYPE SELECTION --- //
function handleSelectDocumentType() {
  var documentTypeId = String($(this).data('id'));
  if (selectedDocumentTypeIds.includes(documentTypeId)) return;
  selectedDocumentTypeIds.push(documentTypeId);
  $(this).addClass('active');
  updateSelectedList('#selectedDocTypes', selectedDocumentTypeIds, 'DocumentTypeID', 'DocumentTypeName', lookupDocumentTypeName, handleRemoveDocumentType);
  updateSwimlaneDocTypesSelect();
  loadDiscoveredPartyFields();
  updateDashboardPreview();
}

function handleRemoveDocumentType() {
  var documentTypeId = String($(this).data('id'));
  selectedDocumentTypeIds = selectedDocumentTypeIds.filter(id => id !== documentTypeId);
  $('#availableDocTypes .list-group-item').filter((_, li) => String($(li).data('id')) === documentTypeId).removeClass('active');
  updateSelectedList('#selectedDocTypes', selectedDocumentTypeIds, 'DocumentTypeID', 'DocumentTypeName', lookupDocumentTypeName, handleRemoveDocumentType);
  updateSwimlaneDocTypesSelect();
  loadDiscoveredPartyFields();
  updateDashboardPreview();
}

function lookupAreaName(areaId) {
  return $('#availableAreas .list-group-item').filter((_, li) => String($(li).data('id')) === areaId).text() || areaId;
}
function lookupDocumentTypeName(documentTypeId) {
  var docType = allDocumentTypes.find(dt => String(dt.DocumentTypeID) === documentTypeId);
  return docType ? docType.DocumentTypeName : documentTypeId;
}

// --- COLUMN MANAGEMENT --- //
function updateAvailableColumnOptions() {
  var columns = ['Document Link', 'DocumentType'];

  // --- Instead of .concat(selectedPartyFieldNames), expand mapped fields here ---
  selectedPartyFieldNames.forEach(function(fieldName) {
    var mapping = {
      'Student Info': [
        { name: 'StudentID', fieldId: 25 },
        { name: 'StudentFName', fieldId: 2 },
        { name: 'StudentLName', fieldId: 4 }
      ],
      'Institutional Info': [
        { name: 'InstitutionName', fieldId: 27 }
      ]
    }[fieldName];

    if (mapping) {
      // If you want the "Student Info Lookup" (the name, not the ID/FName/LName), include this line:
      // columns.push(fieldName + 'Lookup');
      // Add each mapped attribute as a column option
      mapping.forEach(attr => columns.push(attr.name));
    } else {
      // No mapping, just add the field itself
      columns.push(fieldName);
    }
  });

  columns = columns.concat(selectedKeyFields.map(f => f.FieldName));
  columns.push('DocumentDate');

  // De-duplicate columns (just in case)
  columns = [...new Set(columns)];

  // Render as before
  var $ul = $('<ul class="list-group"></ul>');
  columns.forEach(columnName => {
    var $li = $('<li>')
      .addClass('list-group-item list-group-item-action')
      .text(columnName)
      .click(toggleColumnSelection);
    if(selectedColumnNames.includes(columnName)){
      $li.addClass('active');
    }
    $ul.append($li);
  });
  $('#availableColumns').empty().append($ul);
  renderSelectedColumnList();
  updateDashboardPreview();
}

function toggleColumnSelection() {
  var columnName = $(this).text();
  if (selectedColumnNames.includes(columnName)) {
    selectedColumnNames = selectedColumnNames.filter(name => name !== columnName);
    $(this).removeClass('active');
  } else {
    selectedColumnNames.push(columnName);
    $(this).addClass('active');
  }
  renderSelectedColumnList();
  updateDashboardPreview();
}
function renderSelectedColumnList() {
  var $ul = $('<ul class="list-group"></ul>');
  selectedColumnNames.forEach(columnName => {
    $('<li>').addClass('list-group-item list-group-item-action')
      .text(columnName)
      .appendTo($ul);
  });
  $('#selectedColumns').empty().append($ul);
}

// --- SWIMLANE FIELD/EXIT FIELD DROPDOWNS --- //
function updateSwimlaneDocTypesSelect() {
  var $select = $('#swimlaneDocTypesSelect').empty();
  var selectedDocs = allDocumentTypes.filter(dt => selectedDocumentTypeIds.includes(String(dt.DocumentTypeID)));
  selectedDocs.forEach(dt => {
    $select.append($('<option>').val(dt.DocumentTypeID).text(dt.DocumentTypeName));
  });
}
function updateSwimlaneFieldOptions() {
  var $dropdown = $('#swimlaneFieldSelect').empty();
  $dropdown.append('<option value="">(Optional) Field</option>');
  allPartyFields.forEach(field => {
    $dropdown.append('<option value="' + field.FieldName + '">' + (field.DisplayName || field.FieldName) + '</option>');
  });
  selectedKeyFields.forEach(field => {
    $dropdown.append('<option value="' + field.FieldName + '">' + field.FieldName + '</option>');
  });
}
function updateExitStatusFieldOptions() {
  var $dropdown = $('#exitStatusFieldSelect').empty();
  $dropdown.append('<option disabled selected>Choose Field</option>');
  allPartyFields.forEach(field => {
    $dropdown.append('<option value="' + field.FieldName + '">' + (field.DisplayName || field.FieldName) + '</option>');
  });
  selectedKeyFields.forEach(field => {
    $dropdown.append('<option value="' + field.FieldName + '">' + field.FieldName + '</option>');
  });
}

// --- PREVIEW (Fake Data) --- //
function getRandomString(length) {
  var chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  var result = "";
  for (var i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}
function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
function getFakeRow(columns, docTypeName) {
  var row = {};
  columns.forEach(function(col) {
    if (col === "DocumentType") {
      row[col] = docTypeName || "DocumentType" + getRandomInt(1, 10);
    } else if (col.toLowerCase().includes("id")) {
      row[col] = getRandomString(6);
    } else if (col === "DocumentDate") {
      var now = new Date();
      now.setDate(now.getDate() - getRandomInt(0, 60));
      row[col] = now.toISOString().split("T")[0];
    } else if (col === "Document Link") {
      row[col] = "Link";
    } else {
      row[col] = getRandomString(8);
    }
  });
  return row;
}
function updateDashboardPreview() {
  // Ensure the docked preview and minimize button exist
  const $dock = ensureDockedDashboardPreview();
  const $previewSection = $("#dashboardPreviewSection");
  $previewSection.empty();

  // If no swimlanes or no columns are selected, show a friendly message
  if (!swimlaneDefinitions.length || !selectedColumnNames.length) {
    $previewSection.append(
      '<div class="alert alert-info mb-0">Define at least one swimlane and select columns to preview the dashboard layout.</div>'
    );
    return;
  }

  // Expand all columns for display (using your party field mapping logic)
  let expandedColumns = [];
  selectedColumnNames.forEach(function(col) {
    var expanded = expandPartyFieldToColumns(col);
    if (expanded.length > 1 || col.endsWith(' Info')) {
      expandedColumns = expandedColumns.concat(expanded);
    } else {
      expandedColumns.push(col);
    }
  });
  expandedColumns = [...new Set(expandedColumns)];

  // For each swimlane, build a mini preview table with fake data
  swimlaneDefinitions.forEach(function(swimlane, idx) {
    const docTypeNames = swimlane.documentTypeIds.map(lookupDocumentTypeName).join(', ');
    const previewId = "preview_swimlane_" + idx;

    // Generate 3 fake rows for preview
    let fakeRows = [];
    for (let r = 0; r < 3; r++) {
      fakeRows.push(getFakeRow(expandedColumns, docTypeNames.split(',')[0]));
    }

    // Build table HTML
    let tableHtml = `<table class="table table-bordered table-sm mb-2" style="background:#fcfcfc;">
      <thead>
        <tr>
          ${expandedColumns.map(col => `<th>${col}</th>`).join('')}
        </tr>
      </thead>
      <tbody>
        ${fakeRows.map(row => '<tr>' +
          expandedColumns.map(col => `<td>${row[col] !== undefined ? row[col] : ''}</td>`).join('')
        + '</tr>').join('')}
      </tbody>
    </table>`;

    // Add section for this swimlane
    $previewSection.append(
      `<div class="mb-4">
        <div style="font-weight:bold;">${swimlane.name} <small class="text-muted">[${docTypeNames}]</small></div>
        ${tableHtml}
      </div>`
    );
  });
}


// --- SQL BUILDER --- //
function buildSqlQuery() {
  $('#sqlOutput').text('');

  function pascalize(name) {
    return name
      .replace(/[^A-Za-z0-9]+/g, ' ')
      .replace(/(?:^\w|[A-Z]|\b\w)/g, function(word) {
        return word.toUpperCase();
      })
      .replace(/\s+/g, '')
      .replace(/[^A-Za-z0-9]/g, '');
  }

  // --- Composite party field mappings --- //
  var partyFieldMappings = {
    'Student Info': [
      { name: 'StudentID', fieldId: 25 },
      { name: 'StudentFName', fieldId: 2 },
      { name: 'StudentLName', fieldId: 4 }
    ],
    'Institutional Info': [
      { name: 'InstitutionName', fieldId: 27 }
    ]
    // Add other mappings as needed
  };

  var sourceName = $('#integrationNameInput').val().trim();
  if (!sourceName) {
    sourceName = prompt('Enter your SoftDocs integration name for the SQL source:', areaIntegrationName);
    if (!sourceName) return;
    $('#integrationNameInput').val(sourceName);
  }
  areaIntegrationName = sourceName;

  if (!selectedAreaIds.length) return $('#sqlOutput').text('No Areas selected.');
  if (!selectedDocumentTypeIds.length) return $('#sqlOutput').text('No Document Types selected.');
  if (!selectedPartyFieldNames.length && !selectedKeyFields.length) return $('#sqlOutput').text('No fields selected for columns/person lookup.');

  var selectLines = [];
  var joinLines = [];
  var whereLines = [];
  var addedPartyEntities = {};
  var addedFieldAliases = {};

  // ---- SELECT clause ----
  selectLines.push("SELECT");
  selectLines.push("  dt.[Name] AS DocumentType,");

  // ---- Party fields with mapping ----
  selectedPartyFieldNames.forEach(function(fieldName) {
    var mapping = partyFieldMappings[fieldName];
    if (mapping) {
      // One join for this entity
      var fieldObj = allPartyFields.find(f => f.FieldName === fieldName);
      var fieldID = fieldObj ? fieldObj.FieldID : null;
      var partyAlias = 'baseParty_' + pascalize(fieldName);
      var partyVersionAlias = 'basePartyVersion_' + pascalize(fieldName);
      if (!addedPartyEntities[fieldName]) {
        joinLines.push("INNER JOIN [dbo].[DocumentFieldPartyVersion] AS " + partyAlias + " ON d.DocumentID = " + partyAlias + ".DocumentID AND " + partyAlias + ".FieldID = " + fieldID);
        joinLines.push("LEFT JOIN [dbo].[PartyVersion] AS " + partyVersionAlias + " ON " + partyAlias + ".PartyVersionID = " + partyVersionAlias + ".PartyVersionID");
        selectLines.push("  " + partyVersionAlias + ".name AS [" + fieldName + "Lookup],");
        addedPartyEntities[fieldName] = { partyAlias: partyAlias, partyVersionAlias: partyVersionAlias };
      }
      // Now add all mapped attributes (fields)
      mapping.forEach(function(attr) {
        var attrAlias = "ivParty" + attr.name;
        if (!addedFieldAliases[attrAlias]) {
          joinLines.push("LEFT JOIN [dbo].[ivPartyTextFieldValue] AS " + attrAlias +
            " ON " + partyAlias + ".PartyVersionID = " + attrAlias + ".PartyVersionID AND " + attrAlias + ".FieldID = " + attr.fieldId);
          selectLines.push("  " + attrAlias + ".text AS [" + attr.name + "],");
          addedFieldAliases[attrAlias] = true;
        }
      });
    } else {
      // Fallback for unmapped party fields
      var fieldObj = allPartyFields.find(f => f.FieldName === fieldName);
      var fieldID = fieldObj ? fieldObj.FieldID : null;
      var partyJoinAlias = "pf_" + pascalize(fieldName);
      var partyVersionAlias = "pv_" + pascalize(fieldName);
      joinLines.push("LEFT JOIN [dbo].[DocumentFieldPartyVersion] AS " + partyJoinAlias +
        " ON d.DocumentID = " + partyJoinAlias + ".DocumentID AND " + partyJoinAlias + ".FieldID = " + fieldID);
      joinLines.push("LEFT JOIN [dbo].[PartyVersion] AS " + partyVersionAlias +
        " ON " + partyJoinAlias + ".PartyVersionID = " + partyVersionAlias + ".PartyVersionID");
      selectLines.push("  " + partyVersionAlias + ".name AS [" + fieldName + "Lookup],");
      var partyTextAlias = "ivParty" + pascalize(fieldName);
      joinLines.push("LEFT JOIN [dbo].[ivPartyTextFieldValue] AS " + partyTextAlias +
        " ON " + partyJoinAlias + ".PartyVersionID = " + partyTextAlias + ".PartyVersionID AND " + partyTextAlias + ".FieldID = " + fieldID);
      selectLines.push("  " + partyTextAlias + ".text AS [" + fieldName + "],");
    }
  });

  // ---- Key fields ----
selectedKeyFields.forEach(function(kf) {
  var alias = "ivDocField" + pascalize(kf.FieldName);
  var fieldIdInt = parseInt(kf.FieldID, 10);
  if (!addedFieldAliases[alias]) {
    if (!isNaN(fieldIdInt)) {
      if (kf.FieldType === 'date') {
        joinLines.push("LEFT JOIN [dbo].[ivDocumentDateFieldValue] AS " + alias +
          " ON d.DocumentID = " + alias + ".DocumentID AND " + alias + ".FieldID = " + fieldIdInt);
        selectLines.push("  " + alias + ".Date AS [" + kf.FieldName + "],");
      } else {
        joinLines.push("LEFT JOIN [dbo].[ivDocumentTextFieldValue] AS " + alias +
          " ON d.DocumentID = " + alias + ".DocumentID AND " + alias + ".FieldID = " + fieldIdInt);
        selectLines.push("  " + alias + ".text AS [" + kf.FieldName + "],");
      }
    }
    addedFieldAliases[alias] = true;
  }
});



  // ---- Document date ----
  joinLines.push("LEFT JOIN [dbo].[ivDocumentDateFieldValue] AS ivd ON d.DocumentID = ivd.DocumentID AND ivd.FieldID = 10");
  selectLines.push("  ivd.Date AS DocumentDate,");

  // ---- Standard IDs, URL ----
  selectLines.push("  d.DocumentID AS DocumentID,");
  selectLines.push("  n.NodeID AS NodeID,");
  selectLines.push("  n.CatalogID AS AreaID,");
  selectLines.push("  '/#areaId=' + CAST(n.CatalogID AS VARCHAR) + '&NodeId=' + CAST(n.NodeID AS VARCHAR(11)) + '&DocumentId=' + CAST(d.DocumentID AS VARCHAR(11)) AS url");

  // ---- FROM and base joins ----
  joinLines.unshift("INNER JOIN [dbo].[Node] n ON d.DocumentID = n.DocumentID");
  joinLines.unshift("INNER JOIN [dbo].[Document] d ON dt.DocumentTypeID = d.DocumentTypeID");
  joinLines.unshift("FROM [dbo].[DocumentType] dt");

  // ---- WHERE ----
  var areaListSql = selectedAreaIds.map(id => "'" + id + "'").join(', ');
  var docTypeListSql = selectedDocumentTypeIds.map(id => "'" + id + "'").join(', ');
  whereLines.push("WHERE n.CatalogID IN (" + areaListSql + ")");
  whereLines.push("  AND dt.DocumentTypeID IN (" + docTypeListSql + ")");
  whereLines.push("  AND d.DocumentID NOT IN (SELECT DocumentID FROM [dbo].[RecycleBin])");

  // Date filter
  if (documentStartDate) {
    whereLines.push("  AND ivd.Date >= '" + documentStartDate + "'");
  } else if (relativeMonthRange) {
    var now = new Date();
    now.setMonth(now.getMonth() - relativeMonthRange);
    var y = now.getFullYear(), m = ('0' + (now.getMonth() + 1)).slice(-2), d = ('0' + now.getDate()).slice(-2);
    whereLines.push("  AND ivd.Date >= '" + y + '-' + m + '-' + d + "'");
  }

  // Exit status filter
  if (exitStatusField && exitStatusValue) {
    var exitAlias = "ivDocField" + pascalize(exitStatusField);
    if (addedFieldAliases[exitAlias]) {
      whereLines.push("  AND " + exitAlias + ".text <> '" + exitStatusValue.replace(/'/g, "''") + "'");
    }
  }

  // ---- Assemble ----
  var cleanedSelect = selectLines.join('\n');
  var sql = cleanedSelect + '\n' +
            joinLines.join('\n') + '\n' +
            whereLines.join('\n');
  $('#sqlOutput').text(sql);
}

// --- GENERATE OUTPUT FILES --- //
function generateDashboardFiles() {
  const contentURL = window.location.origin;
  const integrationName = $('#integrationNameInput').val().trim() || 'myDashboardIntegration';
  const partyFields = allPartyFields.filter(f => selectedPartyFieldNames.includes(f.FieldName));
  const keyFields = selectedKeyFields;
// --- EXPAND COLUMNS FOR PARTY FIELD MAPPINGS --- //
let expandedColumns = [];
selectedColumnNames.forEach(function(col) {
  var expanded = expandPartyFieldToColumns(col);
  if (expanded.length > 1 || col.endsWith(' Info')) {
    expandedColumns = expandedColumns.concat(expanded);
  } else {
    expandedColumns.push(col);
  }
});
expandedColumns = [...new Set(expandedColumns)];
const columnDefs = expandedColumns.map(col => {
  if (col === 'Document Link') {
    return `{
      name: 'Document Link',
      formatOutput: function(document) {
        var btn = $('<button>').addClass('btn btn-sm btn-success').text('View Document');
        btn.click(function() { window.open('${contentURL}' + document.url); });
        return $('<div>').append(btn);
      }
    }`;
  }
  if (col === 'DocumentType') {
    return `{ name: 'DocumentType', formatOutput: function(document) { return document.DocumentType || ''; } }`;
  }
  if (col === 'DocumentDate') {
    return `{ name: 'DocumentDate', formatOutput: function(document) { return document.DocumentDate ? new Date(document.DocumentDate).toLocaleDateString() : ''; } }`;
  }
  return `{ name: '${col}', formatOutput: function(document) { return document['${col}'] || ''; } }`;
});

  const swimlanes = swimlaneDefinitions.map(sl => `  {
    title: '${sl.name}',
    docTypeArray: [${sl.documentTypeIds.map(id => `'${id}'`).join(', ')}],
    documents: [],
    exportable: true,
    columns: firstOpColumns
  }`).join(',\n');
  const configJs = `// configuration.js (generated)\n` +
    `var contentURL = '${contentURL}';\n` +
    `var integrationName = '${integrationName}';\n\n` +
    `var firstOpColumns = [\n${columnDefs.join(',\n')}\n];\n\n` +
    `var documentConfig = [\n${swimlanes}\n];`;
  const viewmodelJs = `define(['jquery','knockout','vmBase','user','integration','notify','template/configuration','jquery-ui','jquery.tablesorter.min.js'],function($,ko,vm,user,integration,notify){$('#refreshBtn').click(function(){integration.all('${integrationName}').then(splitAndDraw);});});`;
  downloadFile('configuration.js', configJs);
  downloadFile('viewmodel.js', viewmodelJs);
}

// --- LIST/SELECTION HELPERS --- //
function renderList(containerSelector, items, idKey, textKey, clickHandler){
  var $ul = $('<ul class="list-group"></ul>');
  items.forEach(item => {
    var $li = $('<li>').addClass('list-group-item list-group-item-action')
      .text(item[textKey])
      .data('id', item[idKey])
      .on('click', clickHandler);
    if (
      (containerSelector === '#availableAreas' && selectedAreaIds.includes(String(item[idKey]))) ||
      (containerSelector === '#availableDocTypes' && selectedDocumentTypeIds.includes(String(item[idKey])))
    ) {
      $li.addClass('active');
    }
    $ul.append($li);
  });
  $(containerSelector).empty().append($ul);
}
function updateSelectedList(containerSelector, selectedArray, idKey, textKey, nameLookupFn, removeHandler){
  var $ul = $('<ul class="list-group"></ul>');
  selectedArray.forEach(id => {
    var item = {};
    item[idKey] = id;
    item[textKey] = nameLookupFn(id);
    var $li = $('<li>')
      .addClass('list-group-item list-group-item-action')
      .text(item[textKey])
      .data('id', item[idKey])
      .on('click', removeHandler);
    $ul.append($li);
  });
  $(containerSelector).empty().append($ul);
}

// --- RESET ALL --- //
function resetAllSelections() {
  [
    '#availableAreas', '#selectedAreas',
    '#availableDocTypes', '#selectedDocTypes',
    '#discoveredPartyFields', '#selectedSwimlanes',
    '#availableColumns', '#selectedColumns',
    '#selectedKeyfields'
  ].forEach(selector => $(selector).empty());
  selectedAreaIds = [];
  selectedDocumentTypeIds = [];
  allPartyFields = [];
  selectedPartyFieldNames = [];
  selectedKeyFields = [];
  swimlaneDefinitions = [];
  selectedColumnNames = [];
  exitStatusField = null;
  exitStatusValue = null;
  updateSwimlaneDocTypesSelect();
  updateSwimlaneFieldOptions();
  updateExitStatusFieldOptions();
  renderKeyFieldList();
  updateDashboardPreview();
}
// --- DASHBOARD FILE GENERATORS --- //

function generateDashboardIndexFile() {
  var dashboardTitle = $('#dashboardTitleInput').val().trim() || "My Dashboard";
  var dashboardSubtitle = $('#dashboardSubtitleInput').val().trim() || "";

  // 1. Main HTML file, linking to external css.css
var html = `<!DOCTYPE html>
<html>
<head>
  <title>${dashboardTitle}</title>
  <link href="jquery-ui.min.css" rel="stylesheet" />
  <link href="bootstrap.min.css" rel="stylesheet"/>
  <link href="theme.default.css" rel="stylesheet" />
  <link href="css.css" rel="stylesheet" />
  <link href="loading.css" rel="stylesheet" />
</head>
<body class="container-fluid">
  <div class="page">
    <div id="loading" class="loading"></div>
    <div class="row header">
      <h3 class="col-xs-4 col-xs-offset-4 text-center">
        <b>${dashboardTitle}</b>
        <br/>
        <small>${dashboardSubtitle}</small>
      </h3>
      <button type="button" id="refreshBtn" class="col-xs-2 col-xs-offset-2 btn btn-success btn-lg">
        Refresh <strong>&#10227;</strong>
      </button>
    </div>
    <div class="row">
      <div id="tableCanvas"></div>
    </div>
    <div id="fullStats"></div>
    <div class="loading"></div>
  </div>
  <!-- ONLY include your custom scripts, nothing from a CDN -->
  <script src="configuration.js"></script>
  <script src="viewmodel.js"></script>
</body>
</html>
`;


  // 2. CSS content - copy/paste your full CSS string here:
  var css = `
.container-fluid{
    background-color: white;
}
.page {
    margin: 10px auto;
    /*border: 1px solid #ddd; box-shadow: 0 0 30px grey;*/
    padding: 10px 40px;
    background-color: white;
}
.section{
    cursor: pointer;
}
.header{
    margin: 20px; /* space out the header row */
}
.required {
    color: red;
    padding-left: 2px;
}
.note {
    font-weight: bold;
    font-size: 18px;
}
img.logo {
    margin: -10px auto;
    width: 250px;
}
#fullStats {
    margin-top: 36px;
}
#refreshBtn {
    margin-top: 30px;
}
h3 {
    padding: 12px;
}
.stats {
    text-align: right;
}
/*customize colorscheme of table */
.tablesorter-headerRow>th {
    background-color: #00477F;
    color: gainsboro;
}
.tablesorter-default .tablesorter-filter-row td{
    background-color: #dee2e6;
}
.tablesorter-default td {
   background-color: #dee2e6;
}
/* end color customizations */
.priorityDocRow>td {
    font-weight: bold;
    background-color: #ADAFB2;
}
.img-fluid {
    max-width: 100%;
    height: auto;
}
/* Absolute Center Spinner */
.loading, .processing {
    position: fixed;
    z-index: 999;
    height: 2em;
    width: 2em;
    overflow: show;
    margin: auto;
    top: 0;
    left: 0;
    bottom: 0;
    right: 0;
}
.processingText, .successText {
    position: fixed;
    z-index: 900;
    height: 4em;
    width: 20em;
    border-radius: 10px;
    overflow: show;
    margin: auto;
    top: 0;
    left: 0;
    bottom: 0;
    right: 0;
    font-size: 30px;
    color: white;
    text-align: center;
    background-color: rgba(0, 0, 0, 0.5);
}
/* Transparent Overlay */
.loading:before, .processing:before {
    content: '';
    display: block;
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.3);
}
/* :not(:required) hides these rules from IE9 and below */
.loading:not(:required), .processing:not(:required) {
    font: 0/0 a;
    color: transparent;
    text-shadow: none;
    background-color: transparent;
    border: 0;
}
.loading:not(:required):after, .processing:not(:required):after {
    content: '';
    display: block;
    font-size: 10px;
    width: 1em;
    height: 1em;
    margin-top: -2.5em;
    -webkit-animation: spinner 1500ms infinite linear;
    -moz-animation: spinner 1500ms infinite linear;
    -ms-animation: spinner 1500ms infinite linear;
    -o-animation: spinner 1500ms infinite linear;
    animation: spinner 1500ms infinite linear;
    border-radius: 0.5em;
    -webkit-box-shadow: rgba(0, 0, 0, 0.75) 1.5em 0 0 0, rgba(0, 0, 0, 0.75) 1.1em 1.1em 0 0, rgba(0, 0, 0, 0.75) 0 1.5em 0 0, rgba(0, 0, 0, 0.75) -1.1em 1.1em 0 0, rgba(0, 0, 0, 0.5) -1.5em 0 0 0, rgba(0, 0, 0, 0.5) -1.1em -1.1em 0 0, rgba(0, 0, 0, 0.75) 0 -1.5em 0 0, rgba(0, 0, 0, 0.75) 1.1em -1.1em 0 0;
    box-shadow: rgba(0, 0, 0, 0.75) 1.5em 0 0 0, rgba(0, 0, 0, 0.75) 1.1em 1.1em 0 0, rgba(0, 0, 0, 0.75) 0 1.5em 0 0, rgba(0, 0, 0, 0.75) -1.1em 1.1em 0 0, rgba(0, 0, 0, 0.75) -1.5em 0 0 0, rgba(0, 0, 0, 0.75) -1.1em -1.1em 0 0, rgba(0, 0, 0, 0.75) 0 -1.5em 0 0, rgba(0, 0, 0, 0.75) 1.1em -1.1em 0 0;
}
/* Animation */
@-webkit-keyframes spinner {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
}
@-moz-keyframes spinner {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
}
@-o-keyframes spinner {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
}
@keyframes spinner {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
}
/* Absolute Center Spinner */
.successOverlay {
    position: fixed;
    z-index: 999;
    height: 2em;
    width: 2em;
    overflow: show;
    margin: auto;
    top: 0;
    left: 0;
    bottom: 0;
    right: 0;
}
/* Transparent Overlay */
.successOverlay:before {
    content: '';
    display: block;
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.3);
}
.successOverlay:not(:required) {
    font: 0/0 a;
    color: transparent;
    text-shadow: none;
    background-color: transparent;
    border: 0;
}
.successOverlay:not(:required):after {
    content: '';
    display: block;
    font-size: 10px;
    width: 1em;
    height: 1em;
    border-radius: 0.5em;
}
.ui-autocomplete-loading {
    background: white url('data:image/gif;base64,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') right center no-repeat;
}
`;

  // 3. Download both files
  downloadFile('index.html', html);
  downloadFile('css.css', css);
}
// STEP 11: Generate config.js
function generateDashboardConfigFile() {
  // Get config values
  var contentURL = $('#contentUrlInput').val().trim();
  var integrationName = areaIntegrationName || $('#integrationNameInput').val().trim() || 'myDashboardIntegration';

  // 1. Expand columns for all selected columns (includes mapping for party fields)
  let expandedColumns = [];
  selectedColumnNames.forEach(function(col) {
    var expanded = expandPartyFieldToColumns(col);
    if (expanded.length > 1 || col.endsWith(' Info')) {
      expandedColumns = expandedColumns.concat(expanded);
    } else {
      expandedColumns.push(col);
    }
  });
  expandedColumns = [...new Set(expandedColumns)];

  // 2. Build columnDefs array with correct formatters (text vs date vs default)
  const columnDefs = expandedColumns.map(col => {
    if (col === 'Document Link') {
      return `{
        name: 'Document Link',
        formatOutput: function(document) {
          var btn = $('<button>').addClass('btn btn-sm btn-success').text('View Document');
          btn.click(function() { window.open('${contentURL}' + document.url); });
          return $('<div>').append(btn);
        }
      }`;
    }
    if (col === 'DocumentType') {
      return `{ name: 'DocumentType', formatOutput: function(document) { return document.DocumentType || ''; } }`;
    }
    if (col === 'DocumentDate') {
      // Always format the built-in document date as a JS date
      return `{ name: 'DocumentDate', formatOutput: function(document) { return document.DocumentDate ? new Date(document.DocumentDate).toLocaleDateString() : ''; } }`;
    }
    // Handle user-added keyfields with date type
    var kf = selectedKeyFields.find(k => k.FieldName === col);
    if (kf && kf.FieldType === 'date') {
      return `{ name: '${col}', formatOutput: function(document) { return document['${col}'] ? new Date(document['${col}']).toLocaleDateString() : ''; } }`;
    }
    // Fallback: default text render
    return `{ name: '${col}', formatOutput: function(document) { return document['${col}'] || ''; } }`;
  });

  // 3. Build swimlane configs
  const swimlanes = swimlaneDefinitions.map(sl => `  {
    title: '${sl.name.replace(/'/g, "\\'")}',
    docTypeArray: [${sl.documentTypeIds.map(id => `'${lookupDocumentTypeName(id)}'`).join(', ')}],
    documents: [],
    exportable: true,
    columns: firstOpColumns
  }`).join(',\n');

  // 4. Compose AMD config file
  const configJs =
`// configuration.js (generated)
define([], function() {
  var contentURL = '${contentURL}';
  var integrationName = '${integrationName}';
  var firstOpColumns = [
${columnDefs.join(',\n')}
  ];
  var documentConfig = [
${swimlanes}
  ];
  return {
    contentURL: contentURL,
    integrationName: integrationName,
    documentConfig: documentConfig
  };
});
`;

  // 5. Download the file
  downloadFile('configuration.js', configJs);
}

// STEP 12: Generate viewmodel.js
// STEP 12: Generate viewmodel.js
function generateDashboardViewModelFile() {
  // Just generate a standard, fully functional file. This works even if you change columns, swimlanes, etc.
  var viewmodelJs = `
/* Autogenerated by dashboard builder */
define([
  'jquery',
  'knockout',
  'vmBase',
  'user',
  'integration',
  'template/dynamicSort',
  'template/configuration',
  'jquery-ui',
  'jquery.tablesorter.min.js'
], function($, ko, vm, user, integration, dynamicSort, configuration) {
  require(['jquery.tablesorter.widgets.js']);
  window.parent.$('.hsplitter, .bottom_panel').hide();
  window.parent.$('.top_panel').height('100%');

  var swimlaneConfig = configuration.documentConfig;
  var tableShow = [];

  // Refresh Button - fetch and redraw
  $('#refreshBtn').click(function () {
    clearTable();
    $('.loading').show();
    integration.all(configuration.integrationName).then(function(contentData) {
      splitAndDraw(contentData);
    });
  });

  function clearTable() {
    $('#tableCanvas').empty();
    $('#fullStats').empty();
    swimlaneConfig.forEach(function(cfg){ cfg.documents = []; });
  }

  function pushDocument(config, doc) {
    config.documents = config.documents || [];
    config.documents.push(doc);
  }

  function splitAndDraw(documents) {
    clearTable();
    // For each document, assign to swimlane if docTypeArray matches
    documents.forEach(function (doc) {
      swimlaneConfig.forEach(function(configObj) {
        if(configObj.docTypeArray.includes(doc.DocumentType)) {
          pushDocument(configObj, doc);
        }
      });
    });

    swimlaneConfig.forEach(function (configObj, index) {
      drawTable(configObj, index);
    });
    buildFullStats(documents);
    $('.loading').hide();
  }

  function drawTable(config, index) {
    var note = config.title || '';
    var $table = $('#tableCanvas');
    var stats = {
      tableName: note.replace(/ /g, ''),
      rowCount: config.documents.length
    };

    // Stat row
    var $statRow = $('<div class="row">')
      .data('statNote', note)
      .addClass('section');
    $statRow.append(
      $('<div class="col-xs-8 note">')
        .text(note)
        .click(function () {
          $(this).parent().next('table').toggle(0, function () {
            if (tableShow.indexOf(note) >= 0) {
              tableShow = $.grep(tableShow, function (value) { return value != note; });
            } else {
              tableShow.push(note);
            }
          });
        })
    );
    $statRow.append(
      $('<div class="col-xs-4 stats">')
        .html('Documents: <strong>' + stats.rowCount + '</strong>')
        .click(function () {
          $(this).parent().next('table').toggle(0, function () {
            if (tableShow.indexOf(note) >= 0) {
              tableShow = $.grep(tableShow, function (value) { return value != note; });
            } else {
              tableShow.push(note);
            }
          });
        })
    );
    $table.append($statRow);

    // Table header
    var $theader = $('<thead>');
    var $theaderRow = $('<tr>');
    config.columns.forEach(function (col) {
      $theaderRow.append($('<th>').text(col.name));
    });
    $theader.append($theaderRow);

    // Table body
    var $tbody = $('<tbody>');
    config.documents.forEach(function (doc) {
      var $tbodyRow = $('<tr>');
      config.columns.forEach(function (column) {
        $tbodyRow.append(
          $('<td>').html(
            typeof column.formatOutput === 'function'
              ? column.formatOutput(doc)
              : doc[column.name] || ''
          )
        );
      });
      $tbody.append($tbodyRow);
    });

    // Build table
    var showTable = ((tableShow.indexOf(note) >= 0) ? true : false);
    $table.append($('<table>', {
      id: 'dataTable_' + index,
      style: 'margin-bottom:30px;',
      'data-note': note,
      class: 'tablesorter'
    }).append($theader).append($tbody));

    // Enable tablesorter
    $('#dataTable_' + index).tablesorter({
      widgets: ['filter', 'stickyHeaders'],
      widgetOptions: { filter_childRows: true },
      theme: 'default'
    });

    // Show/hide according to tableShow
    $('[data-note="' + note + '"]').toggle(showTable);

    // Export button
    if (config.exportable) {
      generateCSVButton($statRow, note, index);
    }
  }

  function generateCSVButton(parent, note, index) {
    var filename = note.replace(/ /g, '');
    parent.append(
      $('<div class="col-xs-1">').html(
        '<a id="' + filename + 'TBL">' +
        '<button type="button" class="btn btn-sm btn-warning">Export</button>' +
        '</a>'
      )
    );
    $('#' + filename + 'TBL').hover(function () {
      var dataString = '';
      $('#dataTable_' + index + ' tr').not('.filtered, .tablesorter-headerRow, .tablesorter-ignoreRow').each(function () {
        $(this).find('td').each(function () {
          dataString += $(this).text() + '\\t';
        });
        dataString += '\\r\\n';
      });
      $(this).attr('href', 'data:application/octet-stream,' + encodeURIComponent(dataString))
             .attr('download', filename + 'TXT.txt');
    });
  }

  function buildFullStats(data) {
    var stats = {
      rowCount: data.length
    };
    $('#fullStats').css('font-weight', 'bold').text(
      'Total: Documents: ' + stats.rowCount
    );
  }

  // ViewModel API hooks (optional)
  vm.onLoad = function onLoad(source, inputValues) { $('#refreshBtn').click(); };
  vm.setDefaults = function setDefaults(source, inputValues) {};
  vm.afterLoad = function afterLoad() {};

  return vm;
});
`;

  // Download the viewmodel.js file
  downloadFile('viewmodel.js', viewmodelJs);
}

function downloadFile(filename, content) {
  const blob = new Blob([content], { type: 'text/plain' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
  URL.revokeObjectURL(link.href);
}


// --- INIT ON READY --- //
$(document).ready(function(){
  resetAllSelections();
  updateDashboardPreview();  // <-- force the dock to appear on load
});


function ensureDockedDashboardPreview() {
  if ($('#dashboardPreviewDock').length === 0) {
    // Add CSS if not already present
    if ($('#dashboardPreviewDockCSS').length === 0) {
      $('head').append(`
        <style id="dashboardPreviewDockCSS">
        #dashboardPreviewDock {
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          z-index: 9999;
          background: #fff;
          border-top: 2px solid #007bff;
          box-shadow: 0 -2px 14px rgba(0,0,0,0.18);
          max-height: 50vh;
          overflow-y: auto;
          transition: max-height 0.3s;
        }
        #dashboardPreviewDock.minimized {
          max-height: 36px;
          overflow: hidden;
        }
        #dashboardPreviewDock .dock-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 4px 16px;
          background: #f8f9fa;
          border-bottom: 1px solid #dee2e6;
          cursor: pointer;
          user-select: none;
        }
        #dashboardPreviewDock .dock-header strong {
          font-size: 1.15em;
        }
        #dashboardPreviewDock .dock-content {
          padding: 12px 16px;
        }
        #dashboardPreviewDock .min-btn {
          background: none;
          border: none;
          font-size: 1.4em;
          color: #555;
          outline: none;
          cursor: pointer;
        }
        </style>
      `);
    }

    // Add the docked preview HTML
    $('body').append(`
      <div id="dashboardPreviewDock">
        <div class="dock-header">
          <strong>Dashboard Preview</strong>
          <button class="min-btn" title="Minimize Preview">&#x2212;</button>
        </div>
        <div class="dock-content">
          <div id="dashboardPreviewSection"></div>
        </div>
      </div>
    `);

    // Minimize/restore logic
    $('#dashboardPreviewDock .min-btn').on('click', function(e){
      $('#dashboardPreviewDock').toggleClass('minimized');
      $(this).html($('#dashboardPreviewDock').hasClass('minimized') ? '&#x25B2;' : '&#x2212;');
    });

    // Double click header to minimize/restore
    $('#dashboardPreviewDock .dock-header').on('dblclick', function(){
      $('#dashboardPreviewDock .min-btn').click();
    });
  }
  return $('#dashboardPreviewDock');
}

