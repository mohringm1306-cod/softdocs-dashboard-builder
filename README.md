# Softdocs Dashboard Builder

A hands-on toolkit and guide for creating powerful dashboards in Softdocs Etrieve—no deep coding experience required.

---

## 📌 What Is This?

This project helps College of DuPage staff and session attendees build flexible dashboards for Softdocs Etrieve Content. Dashboards let you **track, filter, and export** data from completed documents—quickly and visually—without touching in-progress forms or altering stored records.

**Dashboards provide:**

* Fast, organized views of documents (by type, status, date, etc.)
* Export to Excel or PDF
* Filters, swim lanes, and sortable trays
* Collaboration and transparency—multiple users can view at once

**Dashboards do *not*:**

* Change or update document data
* Show forms/workflows still in progress

---

## 💡 Why Build Dashboards?

* **Efficiency** – Surface key information instantly without line-by-line searches.
* **Accuracy** – Always pull real-time, consistent data.
* **Collaboration** – Multiple users can view simultaneously.
* **Flexibility** – Adapt quickly to new or changing processes.
* **Automation** – Enable reminders and notifications from key fields.

---

## ⚙️ Setting Up Your Dashboard

You’ll configure a few **database sources** in *Etrieve Central* so your dashboard can query the right data.

### 1️⃣ Create These Sources in Etrieve Central

Go to:
**Central → Admin Settings → Sources → Add New Source → Type: Database**

---

**`doctypesIntegration`**

```sql
SELECT 
    d.DocumentTypeID,
    d.Name AS DocumentTypeName,
    cd.CatalogID
FROM dbo.DocumentType AS d
LEFT JOIN dbo.CatalogDocumentType AS cd
    ON d.DocumentTypeID = cd.DocumentTypeID
ORDER BY d.Name;
```

---

**`metadataIntegration`**

```sql
SELECT 
    CatalogID,
    Name AS CatalogName
FROM dbo.Catalog
ORDER BY CatalogID;
```

---

**`partyFieldsIntegration`**

```sql
SELECT DISTINCT
    dfpv.FieldID,
    f.Name AS FieldName
FROM dbo.Document AS d
INNER JOIN dbo.DocumentType AS dt
    ON d.DocumentTypeID = dt.DocumentTypeID
INNER JOIN dbo.DocumentFieldPartyVersion AS dfpv
    ON d.DocumentID = dfpv.DocumentID
INNER JOIN dbo.Field AS f
    ON dfpv.FieldID = f.FieldID
ORDER BY f.Name;
```

---

**`fieldListIntegration`** *(NEW – full field catalog with data type)*

> Uses reporting views for read-only, cloud-safe access.

```sql
SELECT
    f.FieldID,
    f.Name AS FieldName,
    f.Code,
    dt.Name AS DataTypeName
FROM reporting.content_dbo_Field AS f
LEFT JOIN reporting.content_dbo_DataType AS dt
    ON dt.DataTypeID = f.DataTypeID
ORDER BY f.Name;
```

---

**`fieldMetaIntegration`** *(NEW – lookup by FieldID(s))*

```sql
-- Param: @FieldIds (NVARCHAR(MAX)), comma-separated list like '11,15,27'
WITH ids AS (
  SELECT TRY_CAST(value AS INT) AS FieldID
  FROM STRING_SPLIT(@FieldIds, ',')
)
SELECT
  f.FieldID,
  f.Name AS FieldName,
  dt.Name AS DataTypeName
FROM reporting.content_dbo_Field AS f
LEFT JOIN reporting.content_dbo_DataType AS dt
    ON dt.DataTypeID = f.DataTypeID
WHERE f.FieldID IN (SELECT FieldID FROM ids);
```

---

> **Permissions:** For each source, click into **Permissions** and grant your user group **Get** access. If you skip this, dashboard calls will return **403 Forbidden**.

---

### 2️⃣ Attach Sources to Your Dashboard Form

1. **Central → Admin Settings → Forms**
2. Open your dashboard form.
3. Under **Connect → Available Sources**, add each integration above.
4. Check **Get** for each.
5. (Optional) Check **Run on origination** if you want the data loaded immediately.

---

### 3️⃣ Configure Dashboard Files

* **config.js** – Match integrationName variables to the Sources you created.
* **index.html** – Optional rebranding (title, logo).
* **viewmodel.js** – Only adjust if you need custom tray names, autopopulation, or advanced logic.

---

### 4️⃣ Publish

Once all sources are in place and permissions set, publish your dashboard and load it in Etrieve Content.

---

## 🚀 Tips for Success

* Start with a flexible baseline—include key fields like Document Link, ID, Last Name, First Name, and Status.
* Use **dynamic SQL** for things like status or semester lists—avoid hardcoding.
* Rename cryptic field names to user-friendly labels.
* Get real user feedback early and adjust quickly.
* Remember: **403 errors mean missing permissions or incorrect Source names**.

---

## 📜 License

Licensed under the MIT License (LICENSE).

---

*Created by Michael Mohring, College of DuPage IT, for Bridge 2025 session attendees.*
