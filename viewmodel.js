/* builder viewmodel.js (v2.0) — COD Softdocs Dashboard
   - Field Catalog with search (fieldListIntegration)
   - Autopopulate keyfields by ID or Name
   - Preserves areas, doc types, party discovery, SQL builder, preview
*/

console.log('builder viewmodel.js loaded (v2.0)');

// ---------- GLOBAL STATE / SOURCE NAMES ---------- //
var integration;

// These must match Source names in Softdocs Central → Admin Settings → Sources
var areaIntegrationName        = 'metadataIntegration';
var docTypesIntegrationName    = 'docTypesIntegration';
var partyFieldsIntegrationName = 'partyFieldsIntegration';
var fieldMetaIntegrationName   = 'fieldMetaIntegration'; // single-ID resolver (fallback)
var fieldsListIntegrationName  = 'fieldListIntegration'; // NEW: full catalog (FieldID, Name, Code, DataTypeName)

// Selections / caches
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

var allFieldsCatalog = []; // [{FieldID, Name, Code, DataTypeName}]
var fieldCatalogLoaded = false;

// ---------- AMD ENTRYPOINT ---------- //
require(['integration'], function (integrationModule) {
  integration = integrationModule;
  $(initializeUserInterface);
});

// ---------- INIT & UI BINDINGS ---------- //
function initializeUserInterface() {
  // Primary actions
  $('#loadAreasBtn').click(loadAvailableAreas);
  $('#buildSqlBtn').click(buildSqlQuery);
  $('#addSwimlaneBtn').click(addSwimlaneDefinition);
  $('#addKeyfieldBtn').click(addKeyFieldManually);

  // Date filters
  $('#startDateInput').change(function(){ documentStartDate = $(this).val() || null; updateDashboardPreview(); });
  $('#dateRangeSelect').change(function(){ relativeMonthRange = $(this).val() ? parseInt($(this).val(),10) : null; updateDashboardPreview(); });

  // Exit status controls
  $('#exitStatusFieldSelect').change(function(){ exitStatusField = $(this).val(); });
  $('#exitStatusValueInput').on('input', function(){ exitStatusValue = $(this).val(); });

  // Field Catalog controls
  $('#loadAllFieldsBtn').click(function(){ loadAllFieldsCatalog(true); });
  $('#fieldSearchInput').on('input', function(){
    renderAllFieldsNested(($(this).val() || '').toLowerCase());
  });

  // Autopopulate events — ID or Name
  const debouncedId = debounce(autoResolveIdOrName, 200);
  const debouncedName = debounce(onKeyfieldNameTyping, 200);

  $('#keyfieldIdInput').on('input', debouncedId).on('blur', autoResolveIdOrName);
  $('#keyfieldNameInput').on('input', debouncedName).on('blur', function(){
    hideNameSuggestions();
    autoResolveIdOrName();
  });
  $('#keyfieldTypeInput').on('change', function(){
    if ($(this).val() === '') autoResolveIdOrName(); // back to Auto
  });

  // Dock controls
  $('#dashboardPreviewDock .min-btn').on('click', function(){
    $('#dashboardPreviewDock').toggleClass('minimized');
    $(this).html($('#dashboardPreviewDock').hasClass('minimized') ? '&#x25B2;' : '&#x2212;');
  });
  $('#dashboardPreviewDock .dock-header').on('dblclick', function(){
    $('#dashboardPreviewDock .min-btn').click();
  });

  // Initial render
  updateDashboardPreview();
  renderKeyFieldList();
}

// ---------- HELPERS ---------- //
function debounce(fn, ms) {
  var t; return function(){ var ctx=this, args=arguments; clearTimeout(t); t=setTimeout(function(){ fn.apply(ctx,args); }, ms); };
}
function toArray(res) {
  if (!res) return [];
  if (Array.isArray(res)) return res;
  if (Array.isArray(res.Results)) return res.Results;
  if (Array.isArray(res.rows)) return res.rows;
  if (Array.isArray(res.recordset)) return res.recordset;
  if (Array.isArray(res.data)) return res.data;
  return [];
}
function mapSoftdocsType(t) {
  if (t == null) return 'text';
  var lower = String(t).trim().toLowerCase();
  if (lower === 'text')    return 'text';
  if (lower === 'number')  return 'number';
  if (lower === 'date')    return 'date';
  if (lower === 'money')   return 'money';
  if (lower === 'decimal') return 'decimal';
  if (lower === 'lookup')  return 'lookup';
  // numeric fallbacks (if ever used)
  if (lower === '0') return 'text';
  if (lower === '1') return 'number';
  if (lower === '2') return 'date';
  if (lower === '3') return 'money';
  if (lower === '4') return 'decimal';
  if (lower === '5') return 'lookup';
  console.log('Unknown DataType:', t, '- defaulting to text');
  return 'text';
}
function firstRow(res) {
  var arr = toArray(res);
  return arr.length ? arr[0] : null;
}

// ---------- FIELD CATALOG (full list) ---------- //
function loadAllFieldsCatalog(showLoader) {
  if (showLoader) $('.loading').show();
  return integration.all(fieldsListIntegrationName)
    .then(function (rows) {
      allFieldsCatalog = toArray(rows).map(function (r) {
        return {
          FieldID: Number(r.FieldID),
          Name: r.Name || r.FieldName || '',
          Code: r.Code || '',
          DataTypeName: r.DataTypeName || r.DataType || ''
        };
      });
      allFieldsCatalog.sort(function(a,b){ return (a.Name||'').localeCompare(b.Name||''); });
      fieldCatalogLoaded = true;
      renderAllFieldsNested(($('#fieldSearchInput').val()||'').toLowerCase());
    })
    .catch(function (e) {
      console.error('Error loading field catalog:', e);
      $('#allFieldsNestedList').empty().append(
        $('<div>').addClass('list-group-item text-muted')
                  .text('Could not load field catalog (check Source name and SQL).')
      );
    })
    .finally(function(){ if (showLoader) $('.loading').hide(); });
}

function renderAllFieldsNested(queryText) {
  var q = (queryText || '').toLowerCase();
  var rows = (q
    ? allFieldsCatalog.filter(function (r) {
        var hay = (r.Name||'') + ' ' + (r.Code||'') + ' ' + (r.DataTypeName||'') + ' ' + String(r.FieldID);
        return hay.toLowerCase().indexOf(q) !== -1;
      })
    : allFieldsCatalog);

  var groups = {};
  rows.forEach(function (r) {
    var ch = (r.Name || '#').charAt(0).toUpperCase();
    if (ch < 'A' || ch > 'Z') ch = '#';
    (groups[ch] = groups[ch] || []).push(r);
  });

  var $out = $('#allFieldsNestedList').empty();
  var letters = Object.keys(groups).sort();

  if (!rows.length) {
    $out.append($('<div>').addClass('list-group-item text-muted').text('No matches.'));
    return;
  }

  letters.forEach(function (letter) {
    var list = groups[letter];
    var $hdr = $('<div>')
      .addClass('list-group-item active')
      .css({ cursor: 'pointer' })
      .text(letter + ' (' + list.length + ')');

    var $ul = $('<ul>').addClass('list-group mb-2').hide();

    list.forEach(function (r) {
      var type = mapSoftdocsType(r.DataTypeName);
      var label = r.Name || ('Field ' + r.FieldID);
      var metaLine = 'ID: ' + r.FieldID + (r.Code ? (' | Code: ' + r.Code) : '') + ' | Type: ' + type;

      var $li = $('<li>')
        .addClass('list-group-item d-flex justify-content-between align-items-center')
        .append(
          $('<div>')
            .append($('<div>').html('<b>' + escapeHtml(label) + '</b>'))
            .append($('<div>').addClass('text-muted small').text(metaLine))
        )
        .append(
          $('<button>')
            .addClass('btn btn-sm btn-outline-success')
            .text('Add')
            .click(function (e) { e.stopPropagation(); addFieldFromCatalog(r); })
        );

      $ul.append($li);
    });

    $hdr.click(function () { $ul.slideToggle(100); });
    $out.append($hdr).append($ul);
  });
}

function addFieldFromCatalog(r) {
  var finalName = r.Name || ('Field_' + r.FieldID);
  var finalType = mapSoftdocsType(r.DataTypeName);

  // de-dupe by FieldID OR name
  if (selectedKeyFields.some(function (k) { return String(k.FieldID) === String(r.FieldID) || k.FieldName === finalName; })) {
    alert('Field already added.');
    return;
  }

  selectedKeyFields.push({ FieldID: r.FieldID, FieldName: finalName, FieldType: finalType });
  renderKeyFieldList();
  updateSwimlaneFieldOptions();
  updateAvailableColumnOptions();
  updateExitStatusFieldOptions();
  updateDashboardPreview();

  // Fill the add form for visibility
  $('#keyfieldIdInput').val(r.FieldID);
  $('#keyfieldNameInput').val(finalName);
  $('#keyfieldTypeInput').val(finalType);
}

// ---------- AUTOPOPULATE (ID or Name) ---------- //
function onKeyfieldNameTyping() {
  var name = ($('#keyfieldNameInput').val() || '').trim();
  if (!name) { hideNameSuggestions(); return; }

  if (!fieldCatalogLoaded && !allFieldsCatalog.length) {
    // lazy-load then try again
    loadAllFieldsCatalog(false).then(showNameSuggestions);
  } else {
    showNameSuggestions();
  }
}

function showNameSuggestions() {
  var $box = $('#keyfieldNameSuggest');
  var name = ($('#keyfieldNameInput').val() || '').trim().toLowerCase();
  if (!name) { hideNameSuggestions(); return; }
  var matches = allFieldsCatalog
    .filter(function (r) {
      var nm = (r.Name || '').toLowerCase();
      var cd = (r.Code || '').toLowerCase();
      return nm.includes(name) || cd.includes(name);
    })
    .slice(0, 12);

  if (!matches.length) { hideNameSuggestions(); return; }

  $box.empty();
  matches.forEach(function (r, idx) {
    var label = r.Name || ('Field ' + r.FieldID);
    $('<div>')
      .addClass('autocomplete-item')
      .html('<b>' + escapeHtml(label) + '</b> &nbsp; <span class="text-muted small">ID: '
            + r.FieldID + (r.Code ? (' | Code: ' + escapeHtml(r.Code)) : '')
            + ' | ' + mapSoftdocsType(r.DataTypeName) + '</span>')
      .appendTo($box)
      .on('click', function(){
        $('#keyfieldIdInput').val(r.FieldID);
        $('#keyfieldNameInput').val(r.Name || '');
        $('#keyfieldTypeInput').val(mapSoftdocsType(r.DataTypeName));
        hideNameSuggestions();
      });
  });

  // position under the input
  var $inp = $('#keyfieldNameInput');
  var off = $inp.position();
  $box.css({ display:'block', top: (off.top + $inp.outerHeight())+'px', left: off.left+'px', width: $inp.outerWidth()+'px' });
}
function hideNameSuggestions(){ $('#keyfieldNameSuggest').hide().empty(); }

function autoResolveIdOrName() {
  var idRaw = ($('#keyfieldIdInput').val() || '').trim();
  var nameRaw = ($('#keyfieldNameInput').val() || '').trim();

  function setIfEmpty(meta) {
    if (!meta) return;
    if (!$('#keyfieldNameInput').val().trim() && meta.name) $('#keyfieldNameInput').val(meta.name);
    if ($('#keyfieldTypeInput').val() === '' && meta.type) $('#keyfieldTypeInput').val(meta.type);
  }

  // Lazy-load catalog if not present
  var ensureCatalog = (fieldCatalogLoaded || allFieldsCatalog.length)
    ? Promise.resolve()
    : loadAllFieldsCatalog(false);

  return ensureCatalog.then(function () {
    // 1) If ID given, try by ID
    var idNum = Number(idRaw);
    if (idRaw && !Number.isNaN(idNum)) {
      var hit = allFieldsCatalog.find(function(x){ return x.FieldID === idNum; });
      if (hit) {
        setIfEmpty({
          name: hit.Name,
          type: mapSoftdocsType(hit.DataTypeName)
        });
        return;
      }
      // Fallback to single-ID integration (if allowed)
      return resolveFieldMetaById(idNum).then(setIfEmpty);
    }

    // 2) If Name given, try exact | startsWith | contains over Name or Code
    if (nameRaw) {
      var lower = nameRaw.toLowerCase();
      var byNameExact = allFieldsCatalog.filter(function(x){ return (x.Name||'').toLowerCase() === lower; });
      var byCodeExact = allFieldsCatalog.filter(function(x){ return (x.Code||'').toLowerCase() === lower; });
      var pick = (byNameExact[0] || byCodeExact[0]);

      if (!pick) {
        var starts = allFieldsCatalog.filter(function(x){
          return (x.Name||'').toLowerCase().startsWith(lower) || (x.Code||'').toLowerCase().startsWith(lower);
        });
        pick = starts[0];
      }
      if (!pick) {
        var contains = allFieldsCatalog.filter(function(x){
          return (x.Name||'').toLowerCase().includes(lower) || (x.Code||'').toLowerCase().includes(lower);
        });
        pick = contains[0];
      }

      if (pick) {
        if (!$('#keyfieldIdInput').val().trim()) $('#keyfieldIdInput').val(pick.FieldID);
        setIfEmpty({ name: pick.Name, type: mapSoftdocsType(pick.DataTypeName) });
        return;
      }
    }
  }).catch(function(e){
    console.warn('autoResolveIdOrName error:', e);
  });
}

function resolveFieldMetaById(fieldId) {
  if (!integration || typeof integration.all !== 'function') return Promise.resolve(null);
  return integration.all(fieldMetaIntegrationName, { FieldIds: String(fieldId) })
    .then(function (res) {
      var row = firstRow(res);
      if (!row) return null;
      return {
        id:   row.FieldID,
        name: row.DisplayName || row.FieldName || row.Name || '',
        type: mapSoftdocsType(row.DataType || row.Type || row.Data_Type || row.DataTypeName)
      };
    })
    .catch(function (e) {
      console.warn('fieldMetaIntegration error:', e);
      return null;
    });
}

// ---------- AREA / DOC TYPE / PARTY FIELD LOADING ---------- //
function loadAvailableAreas() {
  $('.loading').show();
  integration.all(areaIntegrationName)
    .then(function (areas) {
      $('.loading').hide();
      resetAllSelections();
      areas = toArray(areas);
      areas.sort((a,b)=>String(a.CatalogName).localeCompare(String(b.CatalogName)));
      renderList('#availableAreas', areas, 'CatalogID', 'CatalogName', handleSelectArea);
    })
    .catch(function (e) {
      $('.loading').hide();
      console.error('Error loading areas:', e);
    });
}

function handleSelectArea() {
  var id = String($(this).data('id'));
  if (!selectedAreaIds.includes(id)) {
    selectedAreaIds.push(id);
    $(this).addClass('active');
    updateSelectedList('#selectedAreas', selectedAreaIds, 'CatalogID', 'CatalogName', lookupAreaName, handleRemoveArea);
    loadDocumentTypesForAreas(selectedAreaIds);
    updateDashboardPreview();
  }
}

function handleRemoveArea() {
  var id = String($(this).data('id'));
  selectedAreaIds = selectedAreaIds.filter(x => x !== id);
  $('#availableAreas .list-group-item').filter((_, li) => String($(li).data('id')) === id).removeClass('active');
  updateSelectedList('#selectedAreas', selectedAreaIds, 'CatalogID', 'CatalogName', lookupAreaName, handleRemoveArea);
  loadDocumentTypesForAreas(selectedAreaIds);

  var validDocTypeIds = allDocumentTypes.map(dt => String(dt.DocumentTypeID));
  selectedDocumentTypeIds = selectedDocumentTypeIds.filter(x => validDocTypeIds.includes(x));
  updateSelectedList('#selectedDocTypes', selectedDocumentTypeIds, 'DocumentTypeID', 'DocumentTypeName', lookupDocumentTypeName, handleRemoveDocumentType);

  swimlaneDefinitions = swimlaneDefinitions.filter(function (sl) {
    sl.documentTypeIds = sl.documentTypeIds.filter(x => validDocTypeIds.includes(x));
    return sl.documentTypeIds.length > 0;
  });
  renderSwimlaneList();
  updateSwimlaneDocTypesSelect();
  updateDashboardPreview();
}

function loadDocumentTypesForAreas(areaIds) {
  $('.loading').show();
  integration.all(docTypesIntegrationName)
    .then(function (docTypes) {
      $('.loading').hide();
      allDocumentTypes = toArray(docTypes).filter(dt => areaIds.includes(String(dt.CatalogID)));
      allDocumentTypes.sort((a,b)=>String(a.DocumentTypeName).localeCompare(String(b.DocumentTypeName)));
      renderList('#availableDocTypes', allDocumentTypes, 'DocumentTypeID', 'DocumentTypeName', handleSelectDocumentType);
      updateSwimlaneDocTypesSelect();

      var valid = allDocumentTypes.map(dt => String(dt.DocumentTypeID));
      selectedDocumentTypeIds = selectedDocumentTypeIds.filter(x => valid.includes(x));
      updateSelectedList('#selectedDocTypes', selectedDocumentTypeIds, 'DocumentTypeID', 'DocumentTypeName', lookupDocumentTypeName, handleRemoveDocumentType);

      swimlaneDefinitions = swimlaneDefinitions.filter(function (sl) {
        sl.documentTypeIds = sl.documentTypeIds.filter(x => valid.includes(x));
        return sl.documentTypeIds.length > 0;
      });

      renderSwimlaneList();
      loadDiscoveredPartyFields();
      updateDashboardPreview();
    })
    .catch(function (e) {
      $('.loading').hide();
      console.error('Error loading document types:', e);
    });
}

function handleSelectDocumentType() {
  var id = String($(this).data('id'));
  if (!selectedDocumentTypeIds.includes(id)) {
    selectedDocumentTypeIds.push(id);
    $(this).addClass('active');
    updateSelectedList('#selectedDocTypes', selectedDocumentTypeIds, 'DocumentTypeID', 'DocumentTypeName', lookupDocumentTypeName, handleRemoveDocumentType);
    updateSwimlaneDocTypesSelect();
    loadDiscoveredPartyFields();
    updateDashboardPreview();
  }
}

function handleRemoveDocumentType() {
  var id = String($(this).data('id'));
  selectedDocumentTypeIds = selectedDocumentTypeIds.filter(x => x !== id);
  $('#availableDocTypes .list-group-item').filter((_, li) => String($(li).data('id')) === id).removeClass('active');
  updateSelectedList('#selectedDocTypes', selectedDocumentTypeIds, 'DocumentTypeID', 'DocumentTypeName', lookupDocumentTypeName, handleRemoveDocumentType);
  updateSwimlaneDocTypesSelect();
  loadDiscoveredPartyFields();
  updateDashboardPreview();
}

function loadDiscoveredPartyFields() {
  if (!selectedDocumentTypeIds.length) {
    allPartyFields = [];
    renderDiscoveredPartyFields();
    return;
  }
  $('.loading').show();
  integration.all(partyFieldsIntegrationName, { docTypeIds: selectedDocumentTypeIds })
    .then(function (rows) {
      $('.loading').hide();
      allPartyFields = dedupePartyFields(toArray(rows) || []);
      renderDiscoveredPartyFields();
      updateSwimlaneFieldOptions();
      updateExitStatusFieldOptions();
      updateAvailableColumnOptions();
      updateDashboardPreview();
    })
    .catch(function (e) {
      $('.loading').hide();
      allPartyFields = [];
      renderDiscoveredPartyFields();
      updateSwimlaneFieldOptions();
      updateExitStatusFieldOptions();
      updateAvailableColumnOptions();
      updateDashboardPreview();
      console.error('Error loading party fields:', e);
    });
}

function dedupePartyFields(fields) {
  var seen = {};
  return (fields || []).filter(function (f) {
    var k = f.FieldName || f.Name;
    if (!k) return false;
    if (seen[k]) return false;
    seen[k] = true;
    return true;
  });
}

function renderDiscoveredPartyFields() {
  var $ul = $('#discoveredPartyFields').empty();
  if (!allPartyFields.length) {
    $ul.append($('<li>').addClass('list-group-item text-muted')
      .text('No linked person/entity fields found for these document types.'));
    return;
  }
  allPartyFields.forEach(function (f) {
    var key = f.FieldName || f.Name;
    var label = f.DisplayName || f.FieldName || f.Name;
    var $li = $('<li>')
      .addClass('list-group-item list-group-item-action')
      .toggleClass('active', selectedPartyFieldNames.includes(key))
      .text(label)
      .click(function () {
        var idx = selectedPartyFieldNames.indexOf(key);
        if (idx === -1) { selectedPartyFieldNames.push(key); $(this).addClass('active'); }
        else { selectedPartyFieldNames.splice(idx, 1); $(this).removeClass('active'); }
        updateSwimlaneFieldOptions();
        updateExitStatusFieldOptions();
        updateAvailableColumnOptions();
        updateDashboardPreview();
      });
    $ul.append($li);
  });
}

// ---------- KEYFIELDS: ADD / AUTOFILL ---------- //
function addKeyFieldManually() {
  var fieldId = ($('#keyfieldIdInput').val() || '').trim();
  var fieldNameInput = ($('#keyfieldNameInput').val() || '').trim();
  var typePick = $('#keyfieldTypeInput').val(); // '' = Auto

  if (!fieldId && !fieldNameInput) { alert('Enter a Field ID or Name.'); return; }

  // If still Auto/empty, try to resolve using catalog/meta
  var resolvePromise = Promise.resolve();
  if (!typePick || !fieldNameInput) {
    resolvePromise = autoResolveIdOrName();
  }

  resolvePromise.then(function(){
    var finalName = ($('#keyfieldNameInput').val() || fieldNameInput || '').trim();
    var finalType = $('#keyfieldTypeInput').val() || '';

    var finalId = ($('#keyfieldIdInput').val() || fieldId || '').trim();
    if (!finalId) { alert('Could not resolve Field ID.'); return; }

    if (!finalType) {
      // heuristics fallback
      if (/date/i.test(finalName)) finalType = 'date';
      else if (/\$|amount|total|balance|fee|cost|price|tuition|payment/i.test(finalName)) finalType = 'money';
      else finalType = 'text';
    }

    if (selectedKeyFields.some(k => String(k.FieldID) === String(finalId) || k.FieldName === finalName)) {
      alert('Keyfield already added.');
      return;
    }

    selectedKeyFields.push({ FieldID: finalId, FieldName: finalName, FieldType: finalType });
    renderKeyFieldList();

    // reset inputs
    $('#keyfieldIdInput').val('');
    $('#keyfieldNameInput').val('');
    $('#keyfieldTypeInput').val(''); // Auto

    updateSwimlaneFieldOptions();
    updateAvailableColumnOptions();
    updateExitStatusFieldOptions();
    updateDashboardPreview();
  });
}

function renderKeyFieldList() {
  var $ul = $('#selectedKeyfields').empty();
  selectedKeyFields.forEach(function (kf, idx) {
    var typeLabel = kf.FieldType ? ' (' + kf.FieldType + ')' : '';
    var $li = $('<li>')
      .addClass('list-group-item list-group-item-action d-flex justify-content-between align-items-center')
      .text(kf.FieldName + ' (ID:' + kf.FieldID + typeLabel + ')')
      .append(
        $('<button>')
          .addClass('btn btn-danger btn-sm ml-2')
          .text('Remove')
          .click(function (e) {
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

// ---------- SWIMLANES ---------- //
function addSwimlaneDefinition() {
  var name = ($('#swimlaneNameInput').val() || '').trim();
  var docTypeOptions = $('#swimlaneDocTypesSelect').find('option:selected');
  var ids = $.map(docTypeOptions, function (opt) { return String($(opt).val()); });
  var field = $('#swimlaneFieldSelect').val() || null;
  var value = ($('#swimlaneValueInput').val() || '').trim() || null;

  if (!name || !ids.length) { alert('Swimlane name and at least one document type are required.'); return; }

  swimlaneDefinitions.push({ name: name, documentTypeIds: ids, keyfield: field, matchValue: value });
  renderSwimlaneList();

  $('#swimlaneNameInput,#swimlaneValueInput').val('');
  $('#swimlaneDocTypesSelect').val([]);
  $('#swimlaneFieldSelect').val('');
  updateDashboardPreview();
}

function renderSwimlaneList() {
  var $ul = $('<ul class="list-group"></ul>');
  swimlaneDefinitions.forEach(function (sl, index) {
    var docNames = sl.documentTypeIds.map(lookupDocumentTypeName).join(', ');
    var text = sl.name + ' | Docs: ' + docNames;
    if (sl.keyfield && sl.matchValue) text += ' | ' + sl.keyfield + ' = ' + sl.matchValue;
    $('<li>').addClass('list-group-item list-group-item-action')
      .text(text)
      .data('idx', index)
      .click(removeSwimlane)
      .appendTo($ul);
  });
  $('#selectedSwimlanes').empty().append($ul);
}

function removeSwimlane() {
  var idx = $(this).data('idx');
  swimlaneDefinitions.splice(idx, 1);
  renderSwimlaneList();
  updateDashboardPreview();
}

// ---------- DOC TYPES & COLUMNS ---------- //
function lookupAreaName(areaId) {
  return $('#availableAreas .list-group-item').filter((_, li) => String($(li).data('id')) === areaId).text() || areaId;
}
function lookupDocumentTypeName(documentTypeId) {
  var dt = allDocumentTypes.find(x => String(x.DocumentTypeID) === documentTypeId);
  return dt ? dt.DocumentTypeName : documentTypeId;
}

function updateSwimlaneDocTypesSelect() {
  var $sel = $('#swimlaneDocTypesSelect').empty();
  var selectedDocs = allDocumentTypes.filter(dt => selectedDocumentTypeIds.includes(String(dt.DocumentTypeID)));
  selectedDocs.forEach(function (dt) { $sel.append($('<option>').val(dt.DocumentTypeID).text(dt.DocumentTypeName)); });
}
function updateSwimlaneFieldOptions() {
  var $dd = $('#swimlaneFieldSelect').empty();
  $dd.append('<option value="">(Optional) Field</option>');
  allPartyFields.forEach(function (f) {
    $dd.append('<option value="' + (f.FieldName || f.Name) + '">' + (f.DisplayName || f.FieldName || f.Name) + '</option>');
  });
  selectedKeyFields.forEach(function (f) {
    $dd.append('<option value="' + f.FieldName + '">' + f.FieldName + '</option>');
  });
}
function updateExitStatusFieldOptions() {
  var $dd = $('#exitStatusFieldSelect').empty();
  $dd.append('<option disabled selected>Choose Field</option>');
  allPartyFields.forEach(function (f) {
    $dd.append('<option value="' + (f.FieldName || f.Name) + '">' + (f.DisplayName || f.FieldName || f.Name) + '</option>');
  });
  selectedKeyFields.forEach(function (f) {
    $dd.append('<option value="' + f.FieldName + '">' + f.FieldName + '</option>');
  });
}

function updateAvailableColumnOptions() {
  var cols = ['Document Link', 'DocumentType'];
  // Party fields as columns (add both Lookup + text if mapped)
  var partyFieldMappings = {
    'Student Info': [
      { name: 'StudentID',    fieldId: 25 },
      { name: 'StudentFName', fieldId: 2  },
      { name: 'StudentLName', fieldId: 4  }
    ],
    'Institutional Info': [
      { name: 'InstitutionName', fieldId: 27 }
    ]
  };
  selectedPartyFieldNames.forEach(function (fn) {
    var mapping = partyFieldMappings[fn];
    if (mapping) {
      cols.push(fn + 'Lookup');
      mapping.forEach(function (attr) { cols.push(attr.name); });
    } else {
      cols.push(fn + 'Lookup');
      cols.push(fn);
    }
  });

  cols = cols.concat(selectedKeyFields.map(f => f.FieldName));
  cols.push('DocumentDate');
  cols = Array.from(new Set(cols));

  var $ul = $('<ul class="list-group"></ul>');
  cols.forEach(function (name) {
    var $li = $('<li>').addClass('list-group-item list-group-item-action').text(name).click(toggleColumnSelection);
    if (selectedColumnNames.includes(name)) $li.addClass('active');
    $ul.append($li);
  });
  $('#availableColumns').empty().append($ul);
  renderSelectedColumnList();
}

function toggleColumnSelection() {
  var name = $(this).text();
  if (selectedColumnNames.includes(name)) {
    selectedColumnNames = selectedColumnNames.filter(x => x !== name);
    $(this).removeClass('active');
  } else {
    selectedColumnNames.push(name);
    $(this).addClass('active');
  }
  renderSelectedColumnList();
  updateDashboardPreview();
}

function renderSelectedColumnList() {
  var $ul = $('<ul class="list-group"></ul>');
  selectedColumnNames.forEach(function (name) {
    $('<li>').addClass('list-group-item list-group-item-action').text(name).appendTo($ul);
  });
  $('#selectedColumns').empty().append($ul);
}

// ---------- PREVIEW ---------- //
function getRandomString(n){var c="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",r="";for(var i=0;i<n;i++)r+=c.charAt(Math.floor(Math.random()*c.length));return r;}
function getRandomInt(min,max){return Math.floor(Math.random()*(max-min+1))+min;}
function getFakeRow(cols, docTypeName) {
  var row = {};
  cols.forEach(function(col){
    if (col === 'DocumentType') row[col] = docTypeName || 'DocType'+getRandomInt(1,10);
    else if (col.toLowerCase().includes('id')) row[col] = getRandomString(6);
    else if (col === 'DocumentDate') {
      var d = new Date(); d.setDate(d.getDate()-getRandomInt(0,60));
      row[col] = d.toISOString().split('T')[0];
    } else if (col === 'Document Link') row[col] = 'Link';
    else {
      var kf = selectedKeyFields.find(k => k.FieldName === col);
      if (kf && (kf.FieldType === 'money' || kf.FieldType === 'decimal' || kf.FieldType === 'number')) {
        var val = kf.FieldType === 'number' ? getRandomInt(0,9999) : (Math.random()*10000).toFixed(2);
        row[col] = kf.FieldType === 'money' ? ('$' + val) : val;
      } else {
        row[col] = getRandomString(8);
      }
    }
  });
  return row;
}
function updateDashboardPreview() {
  const $section = $('#dashboardPreviewSection').empty();

  if (!swimlaneDefinitions.length || !selectedColumnNames.length) {
    $section.append('<div class="alert alert-info mb-0">Define a swimlane and select columns to preview the layout.</div>');
    return;
  }

  var expanded = [];
  selectedColumnNames.forEach(function (c) {
    var exp = expandPartyFieldToColumns(c);
    if (exp.length > 1 || / Info$/.test(c)) expanded = expanded.concat(exp);
    else expanded.push(c);
  });
  expanded = Array.from(new Set(expanded));

  swimlaneDefinitions.forEach(function (sl) {
    var docNames = sl.documentTypeIds.map(lookupDocumentTypeName).join(', ');
    var rows = []; for (var r=0;r<3;r++) rows.push(getFakeRow(expanded, docNames.split(',')[0]));

    var tableHtml = '<table class="table table-bordered table-sm mb-2" style="background:#fcfcfc;">' +
      '<thead><tr>' + expanded.map(c => '<th>'+escapeHtml(c)+'</th>').join('') + '</tr></thead>' +
      '<tbody>' + rows.map(row => '<tr>' + expanded.map(c => '<td>'+(row[c]!==undefined?escapeHtml(String(row[c])):'')+'</td>').join('') + '</tr>').join('') + '</tbody>' +
      '</table>';

    $section.append('<div class="mb-4"><div style="font-weight:bold;">'+escapeHtml(sl.name)+' <small class="text-muted">['+escapeHtml(docNames)+']</small></div>'+tableHtml+'</div>');
  });
}

// Party field expansion used in preview & columns
function expandPartyFieldToColumns(fieldName) {
  var partyFieldMappings = {
    'Student Info': [
      { name: 'StudentID',    fieldId: 25 },
      { name: 'StudentFName', fieldId: 2  },
      { name: 'StudentLName', fieldId: 4  }
    ],
    'Institutional Info': [
      { name: 'InstitutionName', fieldId: 27 }
    ]
  };
  var cols = [ fieldName + 'Lookup' ];
  if (partyFieldMappings[fieldName]) {
    partyFieldMappings[fieldName].forEach(function (attr) { cols.push(attr.name); });
  }
  return cols;
}

// ---------- SQL BUILDER ---------- //
function buildSqlQuery() {
  $('#sqlOutput').text('');

  function pascalize(name){
    return name.replace(/[^A-Za-z0-9]+/g,' ')
      .replace(/(?:^\w|[A-Z]|\b\w)/g,function(w){return w.toUpperCase();})
      .replace(/\s+/g,'').replace(/[^A-Za-z0-9]/g,'');
  }

  var partyFieldMappings = {
    'Student Info': [
      { name: 'StudentID',    fieldId: 25 },
      { name: 'StudentFName', fieldId: 2  },
      { name: 'StudentLName', fieldId: 4  }
    ],
    'Institutional Info': [
      { name: 'InstitutionName', fieldId: 27 }
    ]
  };

  // Choose numeric view/column used in your environment
  var NUMERIC_VIEW = '[dbo].[ivDocumentNumberFieldValue]';
  var NUMERIC_COL  = 'Number';
  // Alternative:
  // var NUMERIC_VIEW = '[dbo].[ivDocumentDecimalFieldValue]';
  // var NUMERIC_COL  = 'Decimal';

  var sourceName = $('#integrationNameInput').val().trim();
  if (!sourceName) {
    sourceName = prompt('Enter your Softdocs integration name for the SQL source:', areaIntegrationName);
    if (!sourceName) return;
    $('#integrationNameInput').val(sourceName);
  }
  areaIntegrationName = sourceName;

  if (!selectedAreaIds.length)               return $('#sqlOutput').text('No Areas selected.');
  if (!selectedDocumentTypeIds.length)       return $('#sqlOutput').text('No Document Types selected.');
  if (!selectedPartyFieldNames.length && !selectedKeyFields.length) return $('#sqlOutput').text('No fields selected.');

  var selectLines = [];
  var joinLines   = [];
  var whereLines  = [];
  var addedParty  = {};
  var addedAlias  = {};

  selectLines.push('SELECT');
  selectLines.push('  dt.[Name] AS DocumentType,');

  // Party fields
  selectedPartyFieldNames.forEach(function (fn) {
    var mapping = partyFieldMappings[fn];
    if (mapping) {
      var fObj = allPartyFields.find(f => (f.FieldName||f.Name) === fn);
      var fieldID = fObj ? fObj.FieldID : null;
      var pAlias = 'baseParty_' + pascalize(fn);
      var pvAlias = 'basePartyVersion_' + pascalize(fn);
      if (!addedParty[fn]) {
        joinLines.push('INNER JOIN [dbo].[DocumentFieldPartyVersion] AS '+pAlias+' ON d.DocumentID = '+pAlias+'.DocumentID AND '+pAlias+'.FieldID = '+fieldID);
        joinLines.push('LEFT JOIN [dbo].[PartyVersion] AS '+pvAlias+' ON '+pAlias+'.PartyVersionID = '+pvAlias+'.PartyVersionID');
        selectLines.push('  '+pvAlias+'.name AS ['+fn+'Lookup],');
        addedParty[fn] = { pAlias: pAlias, pvAlias: pvAlias };
      }
      mapping.forEach(function (attr) {
        var attrAlias = 'ivParty'+attr.name;
        if (!addedAlias[attrAlias]) {
          joinLines.push('LEFT JOIN [dbo].[ivPartyTextFieldValue] AS '+attrAlias+' ON '+pAlias+'.PartyVersionID = '+attrAlias+'.PartyVersionID AND '+attrAlias+'.FieldID = '+attr.fieldId);
          selectLines.push('  '+attrAlias+'.text AS ['+attr.name+'],');
          addedAlias[attrAlias] = true;
        }
      });
    } else {
      var fObj2 = allPartyFields.find(f => (f.FieldName||f.Name) === fn);
      var fid   = fObj2 ? fObj2.FieldID : null;
      var pj    = 'pf_'+pascalize(fn);
      var pv    = 'pv_'+pascalize(fn);
      joinLines.push('LEFT JOIN [dbo].[DocumentFieldPartyVersion] AS '+pj+' ON d.DocumentID = '+pj+'.DocumentID AND '+pj+'.FieldID = '+fid);
      joinLines.push('LEFT JOIN [dbo].[PartyVersion] AS '+pv+' ON '+pj+'.PartyVersionID = '+pv+'.PartyVersionID');
      selectLines.push('  '+pv+'.name AS ['+fn+'Lookup],');
      var pt = 'ivParty'+pascalize(fn);
      joinLines.push('LEFT JOIN [dbo].[ivPartyTextFieldValue] AS '+pt+' ON '+pj+'.PartyVersionID = '+pt+'.PartyVersionID AND '+pt+'.FieldID = '+fid);
      selectLines.push('  '+pt+'.text AS ['+fn+'],');
    }
  });

  // Keyfields (text/date/numeric variants)
  selectedKeyFields.forEach(function (kf) {
    var alias = 'ivDocField'+pascalize(kf.FieldName);
    var fieldIdInt = parseInt(kf.FieldID, 10);
    if (addedAlias[alias] || isNaN(fieldIdInt)) return;

    if (kf.FieldType === 'date') {
      joinLines.push('LEFT JOIN [dbo].[ivDocumentDateFieldValue] AS '+alias+' ON d.DocumentID = '+alias+'.DocumentID AND '+alias+'.FieldID = '+fieldIdInt);
      selectLines.push('  '+alias+'.Date AS ['+kf.FieldName+'],');
    } else if (kf.FieldType === 'money' || kf.FieldType === 'decimal' || kf.FieldType === 'number') {
      joinLines.push('LEFT JOIN '+NUMERIC_VIEW+' AS '+alias+' ON d.DocumentID = '+alias+'.DocumentID AND '+alias+'.FieldID = '+fieldIdInt);
      selectLines.push('  CAST('+alias+'.'+NUMERIC_COL+' AS DECIMAL(19,4)) AS ['+kf.FieldName+'],');
    } else { // text/lookup/default
      joinLines.push('LEFT JOIN [dbo].[ivDocumentTextFieldValue] AS '+alias+' ON d.DocumentID = '+alias+'.DocumentID AND '+alias+'.FieldID = '+fieldIdInt);
      selectLines.push('  '+alias+'.text AS ['+kf.FieldName+'],');
    }
    addedAlias[alias] = true;
  });

  // Document Date (FieldID = 10 in many envs — adjust if different)
  joinLines.push('LEFT JOIN [dbo].[ivDocumentDateFieldValue] AS ivd ON d.DocumentID = ivd.DocumentID AND ivd.FieldID = 10');
  selectLines.push('  ivd.Date AS DocumentDate,');

  // Standard IDs + URL
  selectLines.push('  d.DocumentID AS DocumentID,');
  selectLines.push('  n.NodeID AS NodeID,');
  selectLines.push('  n.CatalogID AS AreaID,');
  selectLines.push("  '/#areaId=' + CAST(n.CatalogID AS VARCHAR) + '&NodeId=' + CAST(n.NodeID AS VARCHAR(11)) + '&DocumentId=' + CAST(d.DocumentID AS VARCHAR(11)) AS url");

  // Base FROM/JOINs
  joinLines.unshift('INNER JOIN [dbo].[Node] n ON d.DocumentID = n.DocumentID');
  joinLines.unshift('INNER JOIN [dbo].[Document] d ON dt.DocumentTypeID = d.DocumentTypeID');
  joinLines.unshift('FROM [dbo].[DocumentType] dt');

  // WHERE
  var areasSql = selectedAreaIds.map(id => "'"+id.replace(/'/g,"''")+"'").join(', ');
  var docsSql  = selectedDocumentTypeIds.map(id => "'"+id.replace(/'/g,"''")+"'").join(', ');
  var whereLines = [
    'WHERE n.CatalogID IN ('+areasSql+')',
    '  AND dt.DocumentTypeID IN ('+docsSql+')',
    '  AND d.DocumentID NOT IN (SELECT DocumentID FROM [dbo].[RecycleBin])'
  ];

  if (documentStartDate) {
    whereLines.push("  AND ivd.Date >= '"+documentStartDate+"'");
  } else if (relativeMonthRange) {
    var now = new Date(); now.setMonth(now.getMonth()-relativeMonthRange);
    var y = now.getFullYear(), m = ('0'+(now.getMonth()+1)).slice(-2), d = ('0'+now.getDate()).slice(-2);
    whereLines.push("  AND ivd.Date >= '"+y+'-'+m+'-'+d+"'");
  }

  if (exitStatusField && exitStatusValue) {
    var exitAlias = 'ivDocField'+pascalize(exitStatusField);
    // Only add predicate if the alias exists (i.e., that field is in selectedKeyFields or party selection)
    if (joinLines.some(function(l){ return l.indexOf(' '+exitAlias+' ')>=0; })) {
      whereLines.push("  AND "+exitAlias+".text <> '"+exitStatusValue.replace(/'/g,"''")+"'");
    }
  }

  var sql = selectLines.join('\n') + '\n' + joinLines.join('\n') + '\n' + whereLines.join('\n');
  $('#sqlOutput').text(sql);
}

// ---------- SMALL UTILS ---------- //
function renderList(container, items, idKey, textKey, click) {
  var $ul = $('<ul class="list-group"></ul>');
  (items||[]).forEach(function (it) {
    var $li = $('<li>').addClass('list-group-item list-group-item-action')
      .text(it[textKey]).data('id', it[idKey]).on('click', click);
    if ((container === '#availableAreas'    && selectedAreaIds.includes(String(it[idKey]))) ||
        (container === '#availableDocTypes' && selectedDocumentTypeIds.includes(String(it[idKey])))) {
      $li.addClass('active');
    }
    $ul.append($li);
  });
  $(container).empty().append($ul);
}

function updateSelectedList(container, selectedArray, idKey, textKey, lookupFn, removeHandler) {
  var $ul = $('<ul class="list-group"></ul>');
  selectedArray.forEach(function (id) {
    var item = {}; item[idKey]=id; item[textKey]=lookupFn(id);
    var $li = $('<li>').addClass('list-group-item list-group-item-action')
      .text(item[textKey]).data('id', item[idKey]).on('click', removeHandler);
    $ul.append($li);
  });
  $(container).empty().append($ul);
}

function resetAllSelections() {
  ['#availableAreas','#selectedAreas','#availableDocTypes','#selectedDocTypes',
   '#discoveredPartyFields','#selectedSwimlanes','#availableColumns','#selectedColumns','#selectedKeyfields']
    .forEach(function (s) { $(s).empty(); });
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

function escapeHtml(str){
  return String(str).replace(/[&<>"'`=\/]/g, function(s){
    return ({
      '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;','/':'&#47;','`':'&#96;','=':'&#61;'
    })[s];
  });
}
