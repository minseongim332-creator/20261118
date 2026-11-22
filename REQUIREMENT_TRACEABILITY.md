# PONJALAL v3 — requirement traceability

Baseline: `feat/streamlit-migration`; Python entry `app.py`, BAZE entry `index.html` → `web/main.js`. Verified source archive, file inventory, working status and commit are in `/tmp/opencode/ponjalal-v3-baseline/`. This inventory tracks the approved specification, not just the changes in one implementation pass. **Existing** does not mean verified. **Partial** never means acceptance passed. P0 = original branding, authentic sources, sensitive-data protection and preservation; P1 = functional requirements; P2 = delivery/QA.

| ID | Original requirement | Priority | Component / source | Status | Evidence / blocker | Resolution |
|---|---|---|---|---|---|---|
| V3-00 | Modify real app; no omissions, unauthorized redesign or false completion | P0 | `app.py`, `web/main.js`, this file | In progress | Both editions and prior changes inventoried | Use per-item evidence; retain unverified work |
| V3-02 | Inspect repository, preserve framework, features and addresses, back up before editing | P0 | `app.py`, `requirements.txt`, `baze.json`, Vite, Supabase | Partial | Verified archive; BAZE responds; Streamlit redirects to sign-in | Keep deployments unchanged until approved and verifiable |
| V3-03 | Exact original logo/name, welcome/introduction/start; first-time setup and returning restoration | P0 | `guide_pages.py`, `web/onboarding.js` | Blocked / partial | Available art not established as authoritative after correction | No substitutions; preserve current design pending source provenance |
| V3-04 | Reference analysis, warm adult-friendly design system, page-specific layouts, rendered comparison | P0 | `design.py`, `web/*css` | Blocked | Duplicate attachment is not confirmed as design authority | Hold branding/layout changes; compare confirmed references later |
| V3-05 | Galaxy/iPhone/unsure, editable saved model/OS/language/accessibility, independent device sources | P1 | `guide_pages.py`, `web/onboarding.js`, `web/device.js` | Partial | Web device selection exists; coverage and restoration differ by edition | Save and validate profiles; use family+step exact matching |
| V3-06 | Authentic images only; allowed overlays/crops; metadata, licensing, documented source search for gaps | P0 | `official-lesson-assets.json`, `lesson_assets.py`, `web/official-screens.js` | Partial | 7 manufacturer original records; no confirmed inline reuse rights. Missing exact steps reported by `scripts/report_lesson_assets.mjs` | Verify rights or acquire authorized real device captures; no fictional fallback |
| V3-07 | Reusable screenshot-first steps, responsive arrows/markers/boxes, short guidance, zoom, previous/next, feedback | P1 | `guide_authentic.py`, `web/curriculum.js` | In progress | Existing web engine; Streamlit integration required | Verify image mapping, annotation position, progression and errors |
| V3-08.01–06 | Registration, login, password input, SMS, copy/paste, joint certificates | P1 | `courseware.py`, `guide_authentic.py`, `web/curriculum-data.js` | Partial | Practice exists in web edition; authentic coverage incomplete | Complete source mapping and independent practice per operation |
| V3-08.07–12 | Easy auth, QR, app install/delete, Wi-Fi and settings | P1 | `guide_lessons.py`, `guide_authentic.py`, `web/curriculum-data.js` | Partial | Legacy coverage varies; source gaps remain | Connect each module to same engine |
| V3-08.13–18 | Photo/message send, online forms, downloads, photo attachments and permissions | P1 | `guide_lessons.py`, `guide_authentic.py`, `web/curriculum-data.js` | Partial | Legacy coverage varies; source gaps remain | Connect each module; no real uploads/submissions in practice |
| V3-09 | Registration concept, ID, password/visibility, terms, phone/SMS, errors, completion, independent practice | P1 | `guide_authentic.py`, `web/curriculum-data.js` | Partial | Generic practice not identical to manufacturer registration | Verify each instruction and distinguish generic concepts from brand screens |
| V3-10 | Login vs registration, authentic controls, entry, success/failure/recovery and independent practice | P1 | `guide_authentic.py`, `web/curriculum.js` | Partial | Authentic coverage limited by device/step | Verify source and retry/session behavior |
| V3-11 | SMS purpose, real reference, fictional inbox/code, return, validation, empty/wrong/expired, resend and non-receipt | P1 | `guide_authentic.py`, `web/curriculum.js` | Partial | Browser simulation exists; matching reference not available for all actions | Validate variants; never send SMS |
| V3-12 | Device-specific selection, copy, copied state, navigate, paste, result | P1 | `guide_authentic.py`, `web/curriculum.js` | Partial | Different authentic sources needed | Verify distinct long-press/menu actions and isolated sample clipboard |
| V3-13 | Certificate concept, issuance, storage, selection, authentication, transfer, expiry/renewal and recovery | P1 | `guide_authentic.py`, `web/curriculum-data.js` | Partial | Provider-specific screenshots not established | Verify permitted sources; no bank connection or sensitive input |
| V3-14 | Clearly labeled simulation with fictional text, controls, keyboard, copy/paste, repeat and progress | P1 | `guide_authentic.py`, `web/curriculum.js`, `web/simulator-profiles.js` | Partial | Legacy simulations still present | Preserve safe exercise behavior without using it as teaching imagery |
| V3-15 | Family create/join/approve, expiring single-use invite/share/regenerate, roles/abuse controls, member dashboard, help, chat/photo/progress, translation, privacy | P1 | `guide_family.py`, `web/family-space.js`, `supabase/` | Existing / unverified | Production family connection not established; no live updates authorized here | Use isolated accounts and verify positive/negative permission paths; preserve explicit sharing and translation consent |
| V3-16 | Centralized eight-language localization of actual content; original/translated family text and honest errors | P1 | `guide_words.py`, `web/shared.js` | Partial | Eight selector options do not prove full content localization | Translate and audit each locale end to end |
| V3-17 | Large text/targets, contrast, clear nav, icons, narration/replay/speed, understandable errors and responsive layout | P1 | `guide_ui.py`, `web/shared.js`, styles | Partial | OS voices and real-device accessibility not verified | Keyboard, screen reader, sizing, contrast and voice testing |
| V3-18 | Validation, sessions, access controls and minimal data; never collect real financial/account/authentication inputs | P0 | `guide_family.py`, `supabase/`, practice engines | Partial | No production permission test in this pass | Verify untrusted input, cross-family rejection and no practice data persistence |
| V3-19 | Modular existing architecture for branding, devices, assets, lessons, practice, family, language, accessibility, persistence and tests | P1 | `app.py`, `guide_*.py`, `web/`, `scripts/` | Partial | Python and web responsibilities remain separate | Share source metadata without migrating or duplicating live services |
| V3-20 | Restore onboarding, device, language, accessibility, lesson/step/results, family and settings; validate damaged state | P1 | `app.py`, `guide_authentic.py`, `web/backup.js` | Partial | Streamlit session and web browser state have different lifetimes | Test corrupted input, reload, migration and CSV round trip |
| V3-21 | Inventory, exact blockers, no substitution or unauthorized commercial/scope changes | P0 | This file | In progress | Inventory established; source coverage report to follow | Update evidence without hiding pending items |
| V3-22 | Phased implementation from preservation/branding through QA/release | P2 | Approved plan, this file | In progress | Branding dependency pending; independent engineering can continue | Hold branding/release gates; report deviations |
| V3-24 | Functional, visual, device/locale/family and actual deployment testing | P2 | `scripts/`, this file | In progress | Existing release not changed; Streamlit sign-in prevents deployed inspection | Record what ran and distinguish local, preview and live |
| V3-25 | Final implemented/verified/blocked/pending, changes and deployment report | P2 | This file and delivery report | Pending | Full implementation not yet verified | List files, images, dependencies and changes with evidence |

## Mandatory acceptance gates

Blank or partial gates are not passes. Evidence below is limited to the exact behavior stated.

| Gate | Required behavior | Status / evidence |
|---|---|---|
| PON-001 | Exact original logo | Blocked: provenance unconfirmed |
| PON-002 | Branded welcome is the first screen | Partial: web welcome exists; exact logo gate open |
| PON-003 | Start navigates | Verified: Streamlit AppTest and Chromium cover new setup and returning navigation |
| PON-004 | Rendered design matches supplied authoritative references | Blocked: reference authority unconfirmed |
| PON-005 | No unauthorized substitute logo | Blocked: audit provenance before replacing/accepting current art |
| PON-006 | Galaxy persists | Verified for same browser in BAZE and reopening the same parameterized Streamlit URL |
| PON-007 | iPhone persists | Verified for same browser in BAZE and reopening the same parameterized Streamlit URL |
| PON-008 | Authentic Galaxy renders | Partial: official links and step changes tested; inline rights and full coverage pending |
| PON-009 | Authentic iPhone renders | Partial: official links and step changes tested; inline rights and full coverage pending |
| PON-010 | Every asset has source metadata | Test schema and publication/rights coverage |
| PON-011 | Authentic screenshot integrity | Test rendering without altered pixels or fake substitute |
| PON-012 | Correct annotation targets | Compare each annotation against its own source image |
| PON-013 | Step navigation matches images | Test previous/next, mismatches and unsupported profiles |
| PON-014 | Complete registration workflow | Pending end-to-end and image coverage |
| PON-015 | Complete login workflow | Pending end-to-end and image coverage |
| PON-016 | Fictional SMS workflow | Pending both editions and all failure paths |
| PON-017 | Copy/paste interaction | Pending both devices and both editions |
| PON-018 | Complete joint certificates | Pending curriculum/source coverage |
| PON-019 | Practice input and feedback | Verified in BAZE Chromium for 25 courses × two profiles; Streamlit exercise coverage unverified |
| PON-020 | Family creation | Pending isolated authorized connection test |
| PON-021 | Invitations | Pending expiry, reuse, approval and role tests |
| PON-022 | Family communication | Pending actual connection, photo and translation tests |
| PON-023 | Real content localized to all eight languages | Incomplete, not verified |
| PON-024 | Accessibility controls affect the UI | Pending both editions and practical accessibility checks |
| PON-025 | Progress restores | Test reload/reopen, reset prevention and broken state |
| PON-026 | Real credentials not collected | Pending audit of all practice and integration paths |
| PON-027 | Mobile responsiveness | Pending desktop/mobile rendered review |
| PON-028 | Existing deployment retained where possible | BAZE URL responded at baseline; no new release. Streamlit redirected to sign-in |

## This implementation pass

- Existing Python edition: `app.py` starts at a text welcome without adding an unverified logo. `guide_authentic.py` handles first-run device selection and manufacturer references; `guide_pages.py` connects references before instructions and uses the same device selection in settings. `lesson_assets.py` resolves semantic step IDs rather than guessing from titles. Reopening with a saved device URL bypasses device setup; Streamlit learning progress across a new unauthenticated session is **not** verified.
- Existing BAZE edition: `web/official-screens.js` uses the same source metadata and keeps pending images link-only. `web/main.js` stops showing legacy synthetic lesson screenshots. `web/curriculum.js` no longer requests generated screenshot files or makes practice results depend on them. The new course practice controls no longer draw a phone status bar or dock. Legacy simulation features and old source files were preserved, not silently removed.
- `web/curriculum-data.js` adds BAZE exercises for deleting apps, sending photos and messages, downloading files and managing app permissions. These are fictional exercises, not complete screenshot-based modules in either edition. Do not mark equivalent Streamlit modules or authentic image coverage done.
- `scripts/test_streamlit_v3.py`, `scripts/test-device-entry.mjs` and `scripts/test-curriculum.mjs` cover the respective user paths. An initial Chromium suite run timed out; the full later run on the updated code completed 50/50. No dependency, live database or deployment configuration changed; no third-party image file was copied into source. No release attempted because complete screenshot/branding and production verification gates remain open.
- All seven manufacturer originals decoded successfully from their source URLs with the dimensions in the registry. The BAZE coverage report has 80 device/step combinations: 7 with linked originals and 73 without a confirmed matching image. Streamlit welcome, setup and registration reference navigation rendered at 390px and 1028px; this did not verify the missing brand design or all acceptance screenshots.
