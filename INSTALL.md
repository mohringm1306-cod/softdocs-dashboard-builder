# How to Set Up the Dashboard Builder

Three things to do: create the data sources, upload the files, and connect them. Takes about 15 minutes.

---

## Step 1: Create 6 Data Sources

Open **Etrieve Central**, go to **Admin > Sources**, and click **Add New Source**.

You'll create 6 sources. For each one:
1. Type the **Name** exactly as shown
2. Open the matching file from the `Sources` folder and **copy/paste the SQL** into the query box
3. If a **Parameter** is listed, add it
4. Click on the **Permissions** tab and give your users **Get** access

| # | Name | SQL File to Paste | Parameter to Add |
|---|------|-------------------|-----------------|
| 1 | `WizardBuilder_GetAreas` | `Sources/1_WizardBuilder_GetAreas.sql` | — |
| 2 | `WizardBuilder_GetDocTypes` | `Sources/2_WizardBuilder_GetDocTypes.sql` | `@CatalogID` (Integer) |
| 3 | `WizardBuilder_GetKeyFields` | `Sources/3_WizardBuilder_GetKeyFields.sql` | `@CatalogID` (Integer) |
| 4 | `WizardBuilder_GetFormTemplates` | `Sources/4_WizardBuilder_GetFormTemplates.sql` | — |
| 5 | `WizardBuilder_GetFormInputs` | `Sources/5_WizardBuilder_GetFormInputs.sql` | `@TemplateVersionID` (Integer) |
| 6 | `WizardBuilder_GetWorkflowSteps` | `Sources/6_WizardBuilder_GetWorkflowSteps.sql` | `@TemplateID` (Integer) |

> **Don't skip permissions!** If your users don't have **Get** access on each source, the wizard won't be able to load any data.

---

## Step 2: Upload the Wizard Files

1. Go to **Admin > Forms** and create a new form
2. Name it anything you want (e.g., "Dashboard Builder")
3. Upload all 6 of these files:
   - `index.html`
   - `wizard.css`
   - `wizard-demo.js`
   - `wizard-generators.js`
   - `viewmodel.js`
   - `configuration.js`

---

## Step 3: Connect the Sources to the Form

1. Open the form you just created
2. Go to **Connect**
3. Search for and add each of the 6 sources from Step 1
4. Make sure **Get** is checked for all of them

---

## Done!

Open the form in Etrieve and you'll see three options:

- **Document Lookup** — dashboards for scanned documents
- **Form Tracker** — dashboards for form submissions
- **Combined View** — both together

Pick one, walk through the wizard, and download your finished dashboard. Upload those generated files as a new form and you're live.

---

## Something Not Working?

| What's Happening | How to Fix It |
|-----------------|---------------|
| No areas or templates show up | Check that all 6 sources are connected and **Get** is checked |
| "Forbidden" errors | Open each source > **Permissions** > grant **Get** to your users |
| Spinner won't stop | Press F12, check the Console tab for red error messages |
| Blank page | Make sure all 6 files got uploaded to the form |

---

## Using Different Source Names?

If you named your sources something other than `WizardBuilder_GetAreas`, etc., open `configuration.js` and change the names to match what you used.
