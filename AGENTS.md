# AGENTS.md

## Repository overview

This repository contains the Softdocs Dashboard Builder, a static Etrieve Central form that generates deployable dashboard forms. It has no package manager, build step, or automated test suite. The root HTML, CSS, and JavaScript files are uploaded directly to Etrieve; SQL integration-source definitions live in `Sources/`. `SqlTester/` is a separate diagnostic Etrieve form.

## Important files

- `index.html`: wizard shell and script loading order.
- `wizard.css`: all wizard styling.
- `wizard-demo.js`: `WIZARD_VERSION`, `WIZARD_BUILD_DATE`, simulated source data, dashboard metadata, and shared state.
- `wizard-templates.js`: wizard step markup and controls.
- `wizard-preview*.js`: preview coordinator and style-specific renderers.
- `wizard-generators.js`: generated dashboard HTML, JavaScript, configuration, and schema content.
- `wizard-sql.js`: generated SQL. SQL keywords are deliberately assembled/obfuscated to avoid Cloudflare WAF upload failures.
- `viewmodel.js`: Etrieve RequireJS bootstrap and integration-source adapters.
- `configuration.js`: the six Etrieve integration source names and their documented queries.
- `Sources/*.sql`: SQL pasted into the corresponding Etrieve integration sources.
- `Sources/SCHEMA.md`: verified Etrieve schema notes; prefer these facts over assumptions.
- `README.md` and `INSTALL.md`: user-facing setup and upload instructions.
- `SqlTester/`: standalone SQL integration diagnostic form; do not couple it to the builder.

## Editing rules

- Preserve the current plain-script architecture. Do not introduce npm dependencies, bundlers, modules, frameworks, or a server unless the task explicitly requires an architectural change.
- Code must run in Etrieve's embedded RequireJS environment. Follow the existing ES5-compatible style: `var`, function declarations/expressions, and broadly supported browser APIs. Avoid optional chaining, nullish coalescing, imports/exports, and other modern syntax that the Etrieve editor may reject.
- Preserve the dependency and script order in `index.html`. The wizard files expose globals intentionally; `viewmodel.js` loads them as `template/...` RequireJS dependencies.
- Use tabs and the existing trailing-comma/brace style in JavaScript. Make focused edits and avoid reformatting large generated-template files.
- Treat strings emitted by `wizard-generators.js` and `wizard-sql.js` as runtime code. Check both the generator syntax and the generated output affected by a change.
- Keep generated dashboard behavior, the wizard preview, style metadata, and pre-flight validation aligned. A new or changed dashboard option often touches `wizard-demo.js`, `wizard-templates.js`, one preview file, and one or both generator files.
- Do not de-obfuscate SQL keywords in `wizard-sql.js` or move raw generated SQL into another upload file. This separation exists to reduce Cloudflare WAF rejections.
- Keep upload-facing generated files ASCII-only where practical. Avoid smart quotes, em/en dashes, arrows, and decorative Unicode in generated output.
- SQL must remain compatible with the documented Etrieve SQL Server schema. Use `Sources/SCHEMA.md` and existing probes before inventing table or column names. Quote SQL identifiers where the surrounding query does.
- Keep the six copies of integration-source contracts synchronized when relevant: `Sources/*.sql`, `configuration.js` comments/names, `viewmodel.js` adapters, `README.md`, and `INSTALL.md`.
- Never add credentials, tenant URLs, connection strings, real student/employee data, or other institution-specific secrets. Demo data must remain fictional.
- Preserve CSV-injection protection and HTML escaping/sanitization when changing exports or rendering user/source-provided values.
- Update `WIZARD_VERSION`, `WIZARD_BUILD_DATE`, and the changelog in `wizard-demo.js` only for a release/version task. If the upload inventory changes, update both `README.md` and `INSTALL.md`.

## Verification

There is no repository test runner. Perform the checks appropriate to the change:

1. Syntax-check every changed JavaScript file with `node --check <file>` (Node is only a parser here; it is not the runtime).
2. For generator changes, exercise the affected generation path in the wizard and inspect/download the emitted files. Syntax-check generated JavaScript when possible and review generated SQL/HTML for broken quoting or interpolation.
3. Open `index.html` through the intended Etrieve form environment and walk through each affected data mode/style. Verify navigation, preview rendering, pre-flight warnings, save/import/export, and downloads as applicable.
4. For integration changes, verify source parameter names and returned aliases against `viewmodel.js` and the matching `Sources/*.sql` file. SQL requiring live Etrieve data must be validated through the integration source or `SqlTester/`; clearly report when that environment was unavailable.
5. Confirm documentation still names the correct files, source keys, source names, and deployment steps.

Do not claim browser, Etrieve, or live-database verification unless it was actually performed. In the handoff, distinguish automated syntax checks from manual checks that remain for the user.

## Scope and hygiene

- Check `git status` before and after editing. Preserve unrelated user changes.
- Do not edit probe SQL, schema notes, or the diagnostic form merely to make a builder change look consistent; change them only when their documented contract actually changes.
- Keep commits and patches narrowly scoped. Large files such as `wizard-generators.js` and `wizard-templates.js` are sensitive to accidental global replacements.
