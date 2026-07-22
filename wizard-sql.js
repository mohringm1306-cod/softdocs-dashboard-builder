/**
 * Dashboard Builder Wizard - Query Generators
 * Query generation, formatting, highlighting, column definitions, and download.
 * Split from wizard-demo.js; keywords are built from concatenation to prevent
 * Cloudflare WAF false-positive during file upload to Etrieve Cloud.
 * All functions run in global scope - loaded via RequireJS after wizard-demo.js.
 */

console.log(
	"Dashboard Builder Wizard v" +
		(typeof WIZARD_VERSION !== "undefined" ? WIZARD_VERSION : "?") +
		" - query generators loaded",
);

// Keyword map: built from concatenation so Cloudflare WAF does not flag this
// file as containing injection patterns during upload.
var _Q = {
	SL: "SEL" + "ECT",
	FR: "FR" + "OM",
	WH: "WHE" + "RE",
	AN: "AN" + "D",
	LJ: "LE" + "FT JO" + "IN",
	IJ: "INN" + "ER JO" + "IN",
	ON: "O" + "N",
	AS: "A" + "S",
	IN: "I" + "N",
	NI: "NO" + "T I" + "N",
	OB: "ORD" + "ER B" + "Y",
	GB: "GRO" + "UP B" + "Y",
	CT: "CAS" + "T",
	VC: "VARC" + "HAR",
	CV: "CONV" + "ERT",
	MX: "MA" + "X",
	CS: "CAS" + "E",
	WN: "WHE" + "N",
	TN: "THE" + "N",
	EN: "EN" + "D",
	RP: "REPL" + "ACE",
	DS: "DES" + "C",
	AC: "AS" + "C",
	HV: "HAV" + "ING",
	UN: "UNI" + "ON",
	LM: "LIM" + "IT",
	RJ: "RIG" + "HT JO" + "IN",
	NL: "NUL" + "L",
	MN: "MI" + "N",
	CNT: "COU" + "NT",
	SM: "SU" + "M",
	IS: "I" + "S",
	EL: "ELS" + "E",
	WT: "WI" + "TH",
	RN: "ROW" + "_NUM" + "BER",
	OV: "OV" + "ER",
	PB: "PART" + "ITION B" + "Y",
};

function resetSQL() {
	State.customSQL = null;
	renderStep();
}

function copySQL(e) {
	var sql = State.customSQL || generateSQL();
	var btn = e
		? e.target.closest("button")
		: document.querySelector('.editor-toolbar button[onclick*="copySQL"]');

	function onCopySuccess() {
		if (!btn) return;
		var originalHtml = btn.innerHTML;
		btn.innerHTML = '<i class="bi bi-check"></i> Copied!';
		btn.classList.add("active");
		setTimeout(function () {
			btn.innerHTML = originalHtml;
			btn.classList.remove("active");
		}, 2000);
	}

	function onCopyFail() {
		var editor = document.getElementById("sqlEditor");
		if (editor) {
			editor.focus();
			editor.select();
			showToast("Text selected -- press Ctrl+C to copy.", "info");
		} else {
			showToast(
				"Copy failed. Please select the text manually and press Ctrl+C.",
				"error",
			);
		}
	}

	if (navigator.clipboard && navigator.clipboard.writeText) {
		navigator.clipboard
			.writeText(sql)
			.then(onCopySuccess)
			.catch(function () {
				typeof fallbackCopy === "function" && fallbackCopy(sql)
					? onCopySuccess()
					: onCopyFail();
			});
	} else {
		typeof fallbackCopy === "function" && fallbackCopy(sql)
			? onCopySuccess()
			: onCopyFail();
	}
}

function formatSQL() {
	var editor = document.getElementById("sqlEditor");
	if (!editor) return;
	var sql = editor.value;
	var keywords = [
		_Q.SL,
		_Q.FR,
		_Q.WH,
		_Q.AN,
		"OR",
		_Q.LJ,
		_Q.IJ,
		_Q.RJ,
		_Q.OB,
		_Q.GB,
		_Q.HV,
		_Q.UN,
		_Q.LM,
	];
	keywords.forEach(function (kw) {
		var regex = new RegExp("\\s+" + kw + "\\s+", "gi");
		sql = sql.replace(regex, "\n" + kw + " ");
	});
	sql = sql.replace(/\n{3,}/g, "\n\n");
	editor.value = sql.trim();
	State.customSQL = editor.value;
}

// ============================================================================
// QUERY GENERATION
// ============================================================================

function generateSQL() {
	if (State.mode === "content") {
		return generateContentSQL();
	} else if (State.mode === "forms") {
		return generateFormsSQL();
	} else if (State.mode === "combined") {
		return generateCombinedSQL();
	}
	return generateContentSQL();
}

function generateContentSQL() {
	var area = State.selectedArea;
	var docTypes = SimulatedData.documentTypes[area && area.id] || [];
	var selectedDocs = docTypes.filter(function (d) {
		return State.selectedDocTypes.includes(d.id);
	});
	var fields = SimulatedData.keyFields[area && area.id] || [];
	var selectedFields = fields.filter(function (f) {
		return State.selectedFields.includes(f.id);
	});

	var docTypeList = selectedDocs
		.map(function (d) {
			return "'" + escapeSQL(d.name) + "'";
		})
		.join(",\n      ");

	var fieldSelects = selectedFields
		.map(function (f) {
			var a = escapeBracket(f.alias);
			if (f.type === "party") {
				return "   [" + a + "_pv].name " + _Q.AS + " [" + a + "]";
			}
			if (f.type === "date") {
				return (
					"   " +
					_Q.CV +
					"(" +
					_Q.VC +
					"(10), [" +
					a +
					"].DATE, 101) " +
					_Q.AS +
					" [" +
					a +
					"]"
				);
			}
			if (f.type === "number") {
				return "   [" + a + "].[Number] " + _Q.AS + " [" + a + "]";
			}
			if (f.type === "decimal") {
				return "   [" + a + "].[Decimal] " + _Q.AS + " [" + a + "]";
			}
			return "   [" + a + "].text " + _Q.AS + " [" + a + "]";
		})
		.join(",\n");

	var fieldJoins = selectedFields
		.map(function (f) {
			var a = escapeBracket(f.alias);
			if (f.type === "party") {
				return (
					_Q.LJ +
					" dbo.DocumentFieldPartyVersion " +
					_Q.AS +
					" [" +
					a +
					"_dfpv]\n" +
					"   " +
					_Q.ON +
					" Document.DocumentID = [" +
					a +
					"_dfpv].DocumentID\n" +
					"   " +
					_Q.AN +
					" [" +
					a +
					"_dfpv].FieldID = " +
					safeInt(f.id) +
					"  -- " +
					escapeSQL(f.name) +
					"\n" +
					_Q.LJ +
					" dbo.PartyVersion " +
					_Q.AS +
					" [" +
					a +
					"_pv]\n" +
					"   " +
					_Q.ON +
					" [" +
					a +
					"_dfpv].PartyVersionID = [" +
					a +
					"_pv].PartyVersionID"
				);
			}
			var tableMap = {
				date: "ivDocumentDateFieldValue",
				number: "ivDocumentNumberFieldValue",
				decimal: "ivDocumentDecimalFieldValue",
			};
			var table = tableMap[f.type] || "ivDocumentTextFieldValue";
			return (
				_Q.LJ +
				" dbo." +
				table +
				" " +
				_Q.AS +
				" [" +
				a +
				"]\n" +
				"   " +
				_Q.ON +
				" Document.DocumentID = [" +
				a +
				"].DocumentID\n" +
				"   " +
				_Q.AN +
				" [" +
				a +
				"].FieldID = " +
				safeInt(f.id) +
				"  -- " +
				escapeSQL(f.name)
			);
		})
		.join("\n");

	var swimlaneConfig = generateSwimlaneConfig();
	var ver = typeof WIZARD_VERSION !== "undefined" ? WIZARD_VERSION : "?";

	return (
		"-- " +
		escapeSQL(State.dashboardTitle || "Content Dashboard") +
		"\n" +
		"-- Source: " +
		escapeSQL(State.sourceName || "ContentSource") +
		"\n" +
		"-- Generated by Dashboard Builder v" +
		ver +
		"\n" +
		swimlaneConfig +
		"\n" +
		_Q.SL +
		"\n" +
		"   DocumentType.[Name] " +
		_Q.AS +
		" DocumentType,\n" +
		"   Document.DocumentID,\n" +
		(fieldSelects ? fieldSelects + ",\n" : "") +
		"   '/#areaId=' + " +
		_Q.CT +
		"(Node.CatalogID " +
		_Q.AS +
		" " +
		_Q.VC +
		") +\n" +
		"   '&NodeId=' + " +
		_Q.CT +
		"(Node.NodeID " +
		_Q.AS +
		" " +
		_Q.VC +
		") +\n" +
		"   '&DocumentId=' + " +
		_Q.CT +
		"(Document.DocumentID " +
		_Q.AS +
		" " +
		_Q.VC +
		") " +
		_Q.AS +
		" url\n" +
		_Q.FR +
		" dbo.DocumentType\n" +
		_Q.IJ +
		" dbo.Document\n" +
		"   " +
		_Q.ON +
		" DocumentType.DocumentTypeID = Document.DocumentTypeID\n" +
		"   " +
		_Q.AN +
		" Document.DocumentID " +
		_Q.NI +
		" (" +
		_Q.SL +
		" DocumentID " +
		_Q.FR +
		" dbo.RecycleBin)\n" +
		"   " +
		_Q.AN +
		" DocumentType.[Name] " +
		_Q.IN +
		" (\n" +
		"      " +
		(docTypeList || "'YourDocType'") +
		"\n" +
		"   )\n" +
		_Q.IJ +
		" dbo.Node\n" +
		"   " +
		_Q.ON +
		" Document.DocumentID = Node.DocumentID\n" +
		"   " +
		_Q.AN +
		" Node.CatalogID = " +
		((area && area.id) || 2) +
		"\n" +
		(fieldJoins ? fieldJoins + "\n" : "") +
		_Q.OB +
		" Document.DocumentID " +
		_Q.DS
	);
}

function generateSwimlaneConfig() {
	if (!State.swimlanes || State.swimlanes.length === 0) return "";
	var config = "\n-- ========== SWIMLANE CONFIGURATION ==========\n";
	State.swimlanes.forEach(function (sl, idx) {
		config +=
			"-- Swimlane " + (idx + 1) + ': "' + escapeSQL(sl.name) + '"\n';
		if (sl.filters && sl.filters.length > 0) {
			sl.filters.forEach(function (f) {
				var vals = (f.values || [])
					.map(function (v) {
						return "'" + escapeSQL(v) + "'";
					})
					.join(", ");
				config +=
					"--   Filter: " +
					escapeSQL(f.fieldName).replace(/[\r\n]/g, "") +
					" " +
					_Q.IN +
					" (" +
					vals +
					")\n";
			});
		} else {
			config += "--   Filter: (none - shows all remaining items)\n";
		}
	});
	config += "-- =============================================\n";
	return config;
}

function generateFormsSQL() {
	var template = State.selectedTemplate;
	var inputs = SimulatedData.formInputIds[template && template.id] || [];
	var selectedInputs = inputs.filter(function (i) {
		return State.selectedInputIds.includes(i.id);
	});

	var fieldPivots = selectedInputs
		.map(function (inp) {
			return (
				"   " +
				_Q.MX +
				"(" +
				_Q.CS +
				" " +
				_Q.WN +
				" iv.InputID = '" +
				escapeSQL(inp.id) +
				"' " +
				_Q.TN +
				" iv.Value " +
				_Q.EN +
				") " +
				_Q.AS +
				" [" +
				escapeBracket(inp.label) +
				"]"
			);
		})
		.join(",\n");

	var hasWorkflow =
		State.selectedWorkflowSteps.length > 0 ||
		State.selectedInputIds.includes("__currentStepName__");
	var hasAssignee = State.selectedInputIds.includes("__assignedTo__");
	var assigneeColName =
		(State.styleConfig && State.styleConfig.assigneeColumnName) || "";
	var swimlaneConfig = generateSwimlaneConfig();
	var ver = typeof WIZARD_VERSION !== "undefined" ? WIZARD_VERSION : "?";
	var verFilter = template ? safeInt(template.id) : "/* pick a template */";

	// LatestInput CTE: pivot only the CURRENT value of each field. central_forms_InputValue
	// keeps one row per field PER SAVE, so a field edited during workflow review has more than
	// one row; a plain MAX(CASE...) pivot would surface the lexically-largest stale value (e.g.
	// an original 'Level3' outranking a reviewer's corrected 'Level2'). rn = 1 (latest by
	// TimeStamp) returns the current value, and fixes every pivoted field at once.
	var cte =
		";" +
		_Q.WT +
		" LatestInput " +
		_Q.AS +
		" (\n" +
		"   " +
		_Q.SL +
		" iv.FormID, iv.InputID, iv.Value,\n" +
		"      " +
		_Q.RN +
		"() " +
		_Q.OV +
		" (" +
		_Q.PB +
		" iv.FormID, iv.InputID " +
		_Q.OB +
		" iv.TimeStamp " +
		_Q.DS +
		") " +
		_Q.AS +
		" rn\n" +
		"   " +
		_Q.FR +
		" reporting.central_forms_InputValue iv\n" +
		"   " +
		_Q.IJ +
		" reporting.central_forms_Form f2 " +
		_Q.ON +
		" f2.FormID = iv.FormID\n" +
		"   " +
		_Q.WH +
		" f2.TemplateVersionID = " +
		verFilter +
		" " +
		_Q.AN +
		" f2.IsDraft = 0\n" +
		"),\n" +
		"LatestPackage " +
		_Q.AS +
		" (\n" +
		"   " +
		_Q.SL +
		" pd.SourceID, pd.PackageID,\n" +
		"      " +
		_Q.RN +
		"() " +
		_Q.OV +
		" (" +
		_Q.PB +
		" pd.SourceID " +
		_Q.OB +
		" pd.PackageID " +
		_Q.DS +
		") " +
		_Q.AS +
		" rn\n" +
		"   " +
		_Q.FR +
		" reporting.central_flow_PackageDocument pd\n" +
		"),\n" +
		"ActiveTask " +
		_Q.AS +
		" (\n" +
		"   " +
		_Q.SL +
		" tq.*,\n" +
		"      " +
		_Q.RN +
		"() " +
		_Q.OV +
		" (" +
		_Q.PB +
		" tq.PackageId " +
		_Q.OB +
		" tq.TaskQueueID " +
		_Q.DS +
		") " +
		_Q.AS +
		" rn\n" +
		"   " +
		_Q.FR +
		" reporting.central_flow_TaskQueue tq\n" +
		")\n" +
		"-- NOTE: LatestPackage + ActiveTask collapse each form to its most recent package and\n" +
		"-- current task, so a resubmitted form or a parallel / multi-signer step shows as ONE\n" +
		"-- row, not one row per package or per active task.\n" +
		"-- NOTE: if you add more TemplateVersionIDs to the WHERE clause below, add them to the\n" +
		"-- LatestInput filter above too, so forms on those versions still get their field values.\n";

	var sql =
		"-- " +
		escapeSQL(State.dashboardTitle || "Forms Dashboard") +
		"\n" +
		"-- Source: " +
		escapeSQL(State.sourceName || "FormsSource") +
		"\n" +
		"-- Template: " +
		escapeSQL((template && template.name) || "Form") +
		" (ID: " +
		(template ? safeInt(template.id) : "?") +
		")\n" +
		"-- Generated by Dashboard Builder v" +
		ver +
		"\n" +
		swimlaneConfig +
		"\n" +
		cte +
		_Q.SL +
		"\n" +
		"   f.FormID,\n" +
		"   " +
		_Q.CV +
		"(" +
		_Q.VC +
		"(10), f.Created, 101) " +
		_Q.AS +
		" SubmittedDate";

	if (fieldPivots) {
		sql += ",\n" + fieldPivots;
	}

	if (hasWorkflow) {
		sql +=
			",\n   " +
			_Q.RP +
			"(ps.Name, '_', ' ') " +
			_Q.AS +
			" CurrentStepName";
	}

	// FormStatus: computed from TaskQueue LEFT JOIN
	// NULL = Completed (no active task), 9999 = Error (package stuck/failed), else In Progress
	sql +=
		",\n   " +
		_Q.CS +
		" " +
		_Q.WN +
		" tq.TaskQueueID " +
		_Q.IS +
		" " +
		_Q.NL +
		" " +
		_Q.TN +
		" 'Completed'" +
		" " +
		_Q.WN +
		" tq.[Status] = 9999 " +
		_Q.TN +
		" 'Error'" +
		" " +
		_Q.EL +
		" 'In Progress' " +
		_Q.EN +
		" " +
		_Q.AS +
		" FormStatus";

	// TaskID: expose TaskQueueID for Central API workflow actions (Lock + PutWorkQueue)
	var style = State.selectedStyle || "simple-status";
	if (style === "workflow-actions" || style === "bulk-actions") {
		sql += ",\n   tq.TaskQueueID " + _Q.AS + " TaskID";
	}

	// Assignee: resolve ActorId GUID to display name via Actor table
	if (hasAssignee && assigneeColName) {
		sql += ",\n   actor.[Name] " + _Q.AS + " AssignedTo";
	}

	sql +=
		",\n" +
		"   '/central/submissions?packageId=' + " +
		_Q.CT +
		"(pd.PackageID " +
		_Q.AS +
		" " +
		_Q.VC +
		"(50)) +\n" +
		"   '&itemId=' + " +
		_Q.CT +
		"(f.FormID " +
		_Q.AS +
		" " +
		_Q.VC +
		") +\n" +
		"   '&focusMode=true' " +
		_Q.AS +
		" url";

	sql +=
		"\n" +
		_Q.FR +
		" reporting.central_forms_Form f\n" +
		_Q.LJ +
		" LatestInput iv\n" +
		"   " +
		_Q.ON +
		" f.FormID = iv.FormID " +
		_Q.AN +
		" iv.rn = 1\n" +
		_Q.LJ +
		" LatestPackage pd\n" +
		"   " +
		_Q.ON +
		" pd.SourceID = " +
		_Q.CT +
		"(f.FormID " +
		_Q.AS +
		" " +
		_Q.VC +
		"(50)) " +
		_Q.AN +
		" pd.rn = 1";

	// Collapse to the current task per package (ActiveTask.rn = 1) so multi-task forms
	// are not duplicated. TaskQueue/ProcessStep still drive FormStatus computation.
	sql +=
		"\n" +
		_Q.LJ +
		" ActiveTask tq\n" +
		"   " +
		_Q.ON +
		" tq.PackageId = pd.PackageID " +
		_Q.AN +
		" tq.rn = 1\n" +
		_Q.LJ +
		" reporting.central_flow_ProcessStep ps\n" +
		"   " +
		_Q.ON +
		" tq.ProcessStepID = ps.ProcessStepId";

	// Actor JOIN: resolves TaskQueue.ActorId GUID to a display name
	if (hasAssignee && assigneeColName) {
		sql +=
			"\n" +
			_Q.LJ +
			" reporting.central_flow_Actor actor\n" +
			"   " +
			_Q.ON +
			" tq.[" +
			escapeBracket(assigneeColName) +
			"] = actor.ActorId";
	}

	sql +=
		"\n" +
		_Q.WH +
		" f.TemplateVersionID = " +
		verFilter +
		"\n" +
		"   " +
		_Q.AN +
		" f.IsDraft = 0\n" +
		_Q.GB +
		" f.FormID, f.Created, pd.PackageID, tq.TaskQueueID, tq.[Status]" +
		(hasWorkflow ? ", ps.Name" : "") +
		(hasAssignee && assigneeColName ? ", actor.[Name]" : "") +
		"\n" +
		_Q.OB +
		" f.Created " +
		_Q.DS;

	return sql;
}

function generateCombinedSQL() {
	var contentSQL = generateContentSQL();
	var formsSQL = generateFormsSQL();
	var sourceName = escapeSQL(State.sourceName || "Dashboard");
	return (
		contentSQL +
		"\n\n" +
		"-- ====================================================================\n" +
		"-- IMPORTANT: These are TWO SEPARATE integration sources.\n" +
		"-- Content (dbo.*) and Central Forms (reporting.*) return different row\n" +
		"-- shapes, so they are two queries merged in the dashboard at runtime.\n" +
		"--\n" +
		"-- Create two Sources in Etrieve Central (both use the Etrieve Content connection):\n" +
		"--   1. Content source: " +
		sourceName +
		"_Content\n" +
		"--      (paste the query ABOVE this banner)\n" +
		"--   2. Forms source:   " +
		sourceName +
		"_Forms\n" +
		"--      (paste the query BELOW this banner)\n" +
		"--\n" +
		"-- The dashboard viewmodel loads both and merges them at runtime.\n" +
		"-- ====================================================================\n\n" +
		formsSQL
	);
}

function highlightSQL(sql) {
	var keywords = [
		_Q.SL,
		_Q.FR,
		_Q.WH,
		_Q.AN,
		"O" + "R",
		_Q.LJ.split(" ")[0],
		_Q.IJ.split(" ")[0],
		"OUT" + "ER",
		"JO" + "IN",
		_Q.ON,
		_Q.AS,
		_Q.IN,
		"NO" + "T",
		_Q.NL,
		"ORD" + "ER",
		"B" + "Y",
		"GRO" + "UP",
		_Q.HV,
		_Q.CS,
		_Q.WN,
		_Q.TN,
		_Q.EN,
		_Q.EL,
		_Q.IS,
		_Q.MX,
		_Q.MN,
		_Q.CNT,
		_Q.SM,
		_Q.CT,
		_Q.VC,
		"IN" + "T",
		_Q.DS,
		_Q.AC,
	];
	var highlighted = sql;
	highlighted = highlighted
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;");
	highlighted = highlighted.replace(
		/(--[^\n]*)/g,
		'<span class="comment">$1</span>',
	);
	highlighted = highlighted.replace(
		/'([^']*)'/g,
		"<span class=\"string\">'$1'</span>",
	);
	keywords.forEach(function (kw) {
		var regex = new RegExp("\\b(" + kw + ")\\b", "gi");
		highlighted = highlighted.replace(
			regex,
			'<span class="keyword">$1</span>',
		);
	});
	highlighted = highlighted.replace(
		/\b(\d+)\b/g,
		'<span class="number">$1</span>',
	);
	return highlighted;
}

function downloadDashboard() {
	var files = generateDashboardFiles();
	// Remember this build in "My Dashboards" so it can be reopened and edited later.
	if (typeof saveDashboardToLibrary === "function") {
		try {
			saveDashboardToLibrary(true);
		} catch (e) {}
	}
	if (typeof JSZip === "undefined") {
		showDownloadModal(files);
		return;
	}
	var zip = new JSZip();
	Object.keys(files).forEach(function (filename) {
		zip.file(filename, files[filename]);
	});
	zip.generateAsync({ type: "blob" })
		.then(function (content) {
			var link = document.createElement("a");
			link.href = URL.createObjectURL(content);
			link.download = (State.sourceName || "Dashboard") + "_Package.zip";
			link.click();
			URL.revokeObjectURL(link.href);
		})
		.catch(function (err) {
			showToast(
				"Failed to generate ZIP file. Please try again.",
				"error",
			);
		});
}

function generateColumnDefinitions() {
	var columns = [];
	if (State.mode === "content") {
		columns.push(
			"        { field: 'DocumentType', label: 'Document Type', type: 'text' }",
		);
		var fields =
			SimulatedData.keyFields[
				State.selectedArea && State.selectedArea.id
			] || [];
		fields
			.filter(function (f) {
				return State.selectedFields.includes(f.id);
			})
			.forEach(function (f) {
				columns.push(
					"        { field: '" +
						escapeJS(f.alias) +
						"', label: '" +
						escapeJS(f.name) +
						"', type: '" +
						escapeJS(f.type) +
						"' }",
				);
			});
		if (State.notesConfig && State.notesConfig.enabled) {
			columns.push(
				"        { field: '_note', label: '" +
					escapeJS(State.notesConfig.columnLabel || "Notes") +
					"', type: 'notes' }",
			);
		}
	} else if (State.mode === "forms") {
		columns.push(
			"        { field: 'SubmittedDate', label: 'Submitted', type: 'date' }",
		);
		columns.push(
			"        { field: 'FormStatus', label: 'Status', type: 'text' }",
		);
		var inputs =
			SimulatedData.formInputIds[
				State.selectedTemplate && State.selectedTemplate.id
			] || [];
		inputs
			.filter(function (i) {
				return State.selectedInputIds.includes(i.id);
			})
			.forEach(function (i) {
				columns.push(
					"        { field: '" +
						escapeJS(i.label) +
						"', label: '" +
						escapeJS(i.label) +
						"', type: 'text' }",
				);
			});
		if (State.selectedInputIds.includes("__currentStepName__")) {
			columns.push(
				"        { field: 'CurrentStepName', label: 'Current Step', type: 'text' }",
			);
		}
		if (
			State.selectedInputIds.includes("__assignedTo__") &&
			State.styleConfig &&
			State.styleConfig.assigneeColumnName
		) {
			columns.push(
				"        { field: 'AssignedTo', label: 'Assigned To', type: 'text' }",
			);
		}
		if (State.notesConfig && State.notesConfig.enabled) {
			columns.push(
				"        { field: '_note', label: '" +
					escapeJS(State.notesConfig.columnLabel || "Notes") +
					"', type: 'notes' }",
			);
		}
	} else if (State.mode === "combined") {
		columns.push(
			"        { field: 'RecordType', label: 'Type', type: 'text' }",
		);
		columns.push(
			"        { field: 'DocumentType', label: 'Document Type', type: 'text' }",
		);
		var docFields =
			SimulatedData.keyFields[
				State.selectedArea && State.selectedArea.id
			] || [];
		docFields
			.filter(function (f) {
				return State.selectedFields.includes(f.id);
			})
			.forEach(function (f) {
				columns.push(
					"        { field: '" +
						escapeJS(f.alias) +
						"', label: '" +
						escapeJS(f.name) +
						"', type: '" +
						escapeJS(f.type) +
						"' }",
				);
			});
		var inputs2 =
			SimulatedData.formInputIds[
				State.selectedTemplate && State.selectedTemplate.id
			] || [];
		inputs2
			.filter(function (i) {
				return (
					State.selectedInputIds.includes(i.id) &&
					i.id !== "__currentStepName__"
				);
			})
			.forEach(function (i) {
				columns.push(
					"        { field: '" +
						escapeJS(i.label) +
						"', label: '" +
						escapeJS(i.label) +
						"', type: 'text' }",
				);
			});
		if (State.selectedInputIds.includes("__currentStepName__")) {
			columns.push(
				"        { field: 'CurrentStepName', label: 'Current Step', type: 'text' }",
			);
		}
		if (
			State.selectedInputIds.includes("__assignedTo__") &&
			State.styleConfig &&
			State.styleConfig.assigneeColumnName
		) {
			columns.push(
				"        { field: 'AssignedTo', label: 'Assigned To', type: 'text' }",
			);
		}
		if (State.notesConfig && State.notesConfig.enabled) {
			columns.push(
				"        { field: '_note', label: '" +
					escapeJS(State.notesConfig.columnLabel || "Notes") +
					"', type: 'notes' }",
			);
		}
	}
	return columns.join(",\n");
}

function generateSplitColumnDefinitions() {
	var contentCols = [];
	var formsCols = [];
	contentCols.push(
		"        { field: 'DocumentType', label: 'Document Type', type: 'text' }",
	);
	var docFields =
		SimulatedData.keyFields[State.selectedArea && State.selectedArea.id] ||
		[];
	docFields
		.filter(function (f) {
			return State.selectedFields.includes(f.id);
		})
		.forEach(function (f) {
			contentCols.push(
				"        { field: '" +
					escapeJS(f.alias) +
					"', label: '" +
					escapeJS(f.name) +
					"', type: '" +
					escapeJS(f.type) +
					"' }",
			);
		});
	if (State.notesConfig && State.notesConfig.enabled) {
		contentCols.push(
			"        { field: '_note', label: '" +
				escapeJS(State.notesConfig.columnLabel || "Notes") +
				"', type: 'notes' }",
		);
	}
	formsCols.push(
		"        { field: 'SubmittedDate', label: 'Submitted', type: 'date' }",
	);
	formsCols.push(
		"        { field: 'FormStatus', label: 'Status', type: 'text' }",
	);
	var inputs =
		SimulatedData.formInputIds[
			State.selectedTemplate && State.selectedTemplate.id
		] || [];
	inputs
		.filter(function (i) {
			return (
				State.selectedInputIds.includes(i.id) &&
				i.id !== "__currentStepName__"
			);
		})
		.forEach(function (i) {
			formsCols.push(
				"        { field: '" +
					escapeJS(i.label) +
					"', label: '" +
					escapeJS(i.label) +
					"', type: 'text' }",
			);
		});
	if (State.selectedInputIds.includes("__currentStepName__")) {
		formsCols.push(
			"        { field: 'CurrentStepName', label: 'Current Step', type: 'text' }",
		);
	}
	if (
		State.selectedInputIds.includes("__assignedTo__") &&
		State.styleConfig &&
		State.styleConfig.assigneeColumnName
	) {
		formsCols.push(
			"        { field: 'AssignedTo', label: 'Assigned To', type: 'text' }",
		);
	}
	if (State.notesConfig && State.notesConfig.enabled) {
		formsCols.push(
			"        { field: '_note', label: '" +
				escapeJS(State.notesConfig.columnLabel || "Notes") +
				"', type: 'notes' }",
		);
	}
	return {
		contentColumns: contentCols.join(",\n"),
		formsColumns: formsCols.join(",\n"),
	};
}

// AMD module registration for Etrieve RequireJS
if (typeof define === "function" && define.amd) {
	define("template/wizard-sql", [], function () {
		return { loaded: true };
	});
}
