# CHATGPT Pack / Expand Notes

This ZIP is prepared for round-trip work with the SwissPinball ChatGPT workflow.

## What changed in this export

- fixed the machine lookup UI so direct matches render correctly from the current backend response shape
- fixed disambiguation selection so clicking a candidate now loads the full machine record by ID
- normalized the machine ID passed from the Machines page into the Instances page
- removed leftover debug code from `Machines.jsx`
- added a compatibility `machine` field alongside `result` in backend machine route responses
- added name-key caching for resolved machine lookups

## Re-import intent

Use your normal expand/import script against this ZIP to restore the project tree locally.

## Reminder

The ZIP contains the project folder at:

`ai-pinball-lookup/`

