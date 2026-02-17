# Quick Install Checklist

Full instructions with screenshots are in the [README](README.md). This is the short version.

## Prerequisites

- [ ] Etrieve Cloud (or on-prem with Hybrid Server)
- [ ] Admin access to Etrieve Central
- [ ] A SQL connection to your Etrieve Content database already configured in Central

## Checklist

### 1. Create Integration Sources

Go to **Central > Admin > Sources** and create these 6 sources. SQL for each is in the `Sources/` folder.

- [ ] `WizardBuilder_GetAreas` (no source keys)
- [ ] `WizardBuilder_GetDocTypes` (source key: `@CatalogID`, Integer)
- [ ] `WizardBuilder_GetKeyFields` (source key: `@CatalogID`, Integer)
- [ ] `WizardBuilder_GetFormTemplates` (no source keys)
- [ ] `WizardBuilder_GetFormInputs` (source key: `@TemplateVersionID`, Integer)
- [ ] `WizardBuilder_GetWorkflowSteps` (source key: `@TemplateID`, Integer)

For each: set the Connection to your Content database, enable **Get** + **Custom Action**, paste the SQL, add source keys if listed, and give your users **Get** privileges.

### 2. Upload Files

Go to **Admin > Forms**, create a new form, and upload all 7 files:

- [ ] `index.html`
- [ ] `wizard.css`
- [ ] `wizard-demo.js`
- [ ] `wizard-templates.js`
- [ ] `wizard-generators.js`
- [ ] `viewmodel.js`
- [ ] `configuration.js`

### 3. Connect Sources to Form

Open the form's settings, go to **Sources**, and check **Get** for all 6 `WizardBuilder_*` sources.

### 4. Open and Go

Open the form in Etrieve. Pick a mode, walk through the wizard, save the generated files, and upload them as a new form.

---

**Something not working?** See [Troubleshooting](README.md#troubleshooting) in the README.
