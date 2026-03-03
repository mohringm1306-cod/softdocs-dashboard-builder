# Etrieve Database Schema — Verified 2026-02-13

All columns verified via live probing through COD Central integrations.

## Content Database (`[dbo].*`)

### Catalog
| Column | Type | Notes |
|--------|------|-------|
| CatalogID | int | PK |
| Name | string | Area/folder name |

### DocumentType
| Column | Type | Notes |
|--------|------|-------|
| DocumentTypeID | int | PK |
| Name | string | |
| Code | string | May be empty |
| OCR | boolean | |
| DocumentTypeCategoryID | int | |
| OwningDepartmentId | int | |

### CatalogDocumentType (join table)
| Column | Type | Notes |
|--------|------|-------|
| CatalogDocumentTypeID | int | PK |
| CatalogID | int | FK → Catalog |
| DocumentTypeID | int | FK → DocumentType |

### Field
| Column | Type | Notes |
|--------|------|-------|
| FieldID | int | PK (can be negative for system fields) |
| DataTypeID | int | FK → DataType |
| FieldTypeID | int | |
| Name | string | |
| Code | string | |
| PartyTypeID | int/null | |
| OwningDepartmentId | int | |

### DataType (lookup — only 6 values)
| DataTypeID | Name |
|------------|------|
| 1 | Text |
| 2 | Number |
| 3 | Date |
| 4 | Money |
| 5 | Decimal |
| 6 | Lookup |

**NOTE:** No `DateTime` type exists. Only `Date`.

### Field Value Views (EAV indexed views on `FieldValue` + `DocumentFieldValue`)
| View | Filter | Value Column |
|------|--------|-------------|
| `ivDocumentTextFieldValue` | `LoweredText IS NOT NULL` | `.Text` |
| `ivDocumentDateFieldValue` | `Date IS NOT NULL` | `.Date` |
| `ivDocumentNumberFieldValue` | `Number IS NOT NULL` | `.Number` |
| `ivDocumentDecimalFieldValue` | `Decimal IS NOT NULL` | `.Decimal` |

**NOTE:** No `ivDocumentLookupFieldValue` exists. Simple Lookup fields store text in `ivDocumentTextFieldValue`.

### Party Fields (Field.PartyTypeID IS NOT NULL)
Fields like "Student Info" are **party-association** fields. They do NOT store values in `FieldValue` — they link through the Party system:
```
Document → DocumentFieldPartyVersion (DocumentID + FieldID)
         → PartyVersion (PartyVersionID) → .name = display name
         → ivPartyTextFieldValue (PartyVersionID + FieldID) = sub-fields
```
| Table | Key Columns |
|-------|-------------|
| `DocumentFieldPartyVersion` | DocumentID, FieldID, PartyVersionID |
| `PartyVersion` | PartyVersionID, name, PartyID |
| `ivPartyTextFieldValue` | PartyVersionID, FieldID, Text |

### DocumentTypeField (join table)
| Column | Type | Notes |
|--------|------|-------|
| DocumentTypeFieldID | int | PK |
| DocumentTypeID | int | FK → DocumentType |
| FieldID | int | FK → Field |
| SortID | int | Display order |

## Central Forms (`reporting.central_forms_*`)

### Template
| Column | Type | Notes |
|--------|------|-------|
| TemplateID | int | PK |
| Name | string | |

### TemplateVersion
| Column | Type | Notes |
|--------|------|-------|
| TemplateVersionID | int | PK |
| TemplateID | int | FK → Template |
| Name | string | |
| Code | string | Technical name (e.g., `zSoftdocs_Smoke_Test`) |
| **IsPublished** | boolean | **NOT `IsActive`** |
| HasFieldSecurityEnforced | boolean | |
| Description | string/null | |
| Definition | string/null | |
| VersionNumber | int | |

### Form
| Column | Type | Notes |
|--------|------|-------|
| FormID | int | PK |
| TemplateVersionID | int | FK → TemplateVersion |
| OwnerID | int | |
| Created | datetime | |
| IsDraft | boolean | |
| ParentID | int/null | |
| BroadcastRecipientPrincipalID | string/null | |

### InputValue
| Column | Type | Notes |
|--------|------|-------|
| InputValueID | int | PK |
| FormID | int | FK → Form |
| InputID | string | Field identifier (e.g., `lastname22`) |
| Value | string | |
| GroupID | string/null | |
| RowID | string/null | |
| TaskID | string/null | |
| UserID | int | |
| UserDisplayName | string | |
| TimeStamp | datetime | |

## Central Flow (`reporting.central_flow_*`)

### Process
| Column | Type | Notes |
|--------|------|-------|
| ProcessID | GUID | PK |
| Name | string | |
| DepartmentID | int | |
| TemplateStatus | int | |
| Description | string | |
| **NO TemplateID** | — | Process does NOT link directly to Template |

### ProcessStep
| Column | Type | Notes |
|--------|------|-------|
| **ProcessStepId** | GUID | PK — **lowercase 'd'** |
| ProcessID | GUID | FK → Process |
| Name | string | |
| Code | string | |
| ActivityCode | string | |
| IsDeleted | boolean | |
| XCoordinate | int | Visual designer position |
| YCoordinate | int | Visual designer position |
| **NO StepOrder** | — | No ordering column exists |

### Package (verified 2026-02-23)
| Column | Type | Notes |
|--------|------|-------|
| PackageId | GUID | PK |
| Name | string | |
| Status | int | 2=In Progress, 100=Complete (verified Hartford 2026-03-02) |
| CreateUserId | GUID | |
| CreateDate | datetime | |
| LastUpdateDate | datetime | |
| **ProcessID** | GUID | FK to Process -- key link for step discovery |
| LastUpdateActorID | GUID | |
| ClusterID | int | |
| ParentID | GUID/null | |
| ActorFilterID | string | |

### PackageDocument
| Column | Type | Notes |
|--------|------|-------|
| PackageDocumentID | int | PK |
| Name | string | |
| PackageID | GUID | FK to Package |
| SourceID | string | FormID as string |
| SourceName | string | |
| **SourceTypeCode** | string | Matches TemplateVersion.Code |
| Url | string | Full URL to form |
| SystemID | GUID | |
| SubmittedByID | GUID | |
| SubmissionDate | datetime | |

### TaskQueue (full schema, verified COD 2026-03-03)
| Column | Type | Notes |
|--------|------|-------|
| TaskQueueID | GUID | PK |
| **ActorId** | GUID | **Current assignee (user GUID)** |
| PackageId | GUID | FK to Package |
| CreateUserId | GUID | Who created the task |
| CreateDate | datetime | |
| LastUpdateUserId | GUID | Last modifier |
| LastUpdateDate | datetime | |
| Status | int | 3=Active, 9999=Error (package stuck/failed) |
| ProcessStepID | GUID | FK to ProcessStep (lowercase 'd') |
| LockedByUserId | GUID | User who has the task locked |
| ClusterID | int | |
| ActorFilterID | string | |
| SignerEmailAddress | string | For e-sign workflows |
| EsignEmailLastSentDate | datetime/null | |

**NOTE:** `ActorId` is a GUID, not a display name. Resolving to a username
requires a JOIN to a user/identity table (schema TBD). The wizard uses this
column for the "Current Assignee" virtual field.

## Key Relationships

```
Content DB:
  Catalog <-> CatalogDocumentType <-> DocumentType
  DocumentType <-> DocumentTypeField <-> Field -> DataType

Central Forms:
  Template -> TemplateVersion -> Form -> InputValue

Central Flow (NO direct Template link):
  TemplateVersion.Code = PackageDocument.SourceTypeCode
  PackageDocument.PackageID = Package.PackageId       (step discovery)
  Package.ProcessID = Process.ProcessID
  Process.ProcessID = ProcessStep.ProcessID

  PackageDocument.PackageID = TaskQueue.PackageId      (current step only)
  TaskQueue.ProcessStepID = ProcessStep.ProcessStepId
```
