-- PROBE 5: Does [dbo].[Field] exist with expected columns?
-- Create source: WizardBuilder_Probe5
-- Method: GET, Parameters: (none)
-- Tests the Content DB field table used by Source 3

SELECT TOP 5 FieldID AS id, [Name] AS name, DataTypeID AS dataTypeId FROM [dbo].[Field] ORDER BY [Name]
