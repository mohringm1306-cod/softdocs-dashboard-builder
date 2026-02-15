-- PROBE 6: Does [dbo].[DataType] exist?
-- Create source: WizardBuilder_Probe6
-- Method: GET, Parameters: (none)
-- Tests the DataType lookup table used by Source 3

SELECT DataTypeID AS id, [Name] AS name FROM [dbo].[DataType] ORDER BY [Name]
