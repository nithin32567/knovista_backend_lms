# Knovista backend migration — ചെയ്തതും ബാക്കിയുള്ളതും

**പരിശോധന തീയതി: 26 നവംബർ 2026** · Laravel → Express / TypeScript

ഈ റിപ്പോർട്ട് മൂന്ന് ചോദ്യങ്ങൾക്ക് ഉത്തരം നൽകുന്നു: **എന്തൊക്കെ ചെയ്തിട്ടുണ്ട്? എന്തൊക്കെ ബാക്കിയുണ്ട്? ആദ്യം എന്ത് ശരിയാക്കണം?**

ആദ്യം സംഗ്രഹവും module പട്ടികയും വായിക്കുക. ഒരു കാര്യത്തിന്റെ സാങ്കേതിക വിശദാംശങ്ങൾ ആവശ്യമുള്ളപ്പോൾ അതിന്റെ **ശീർഷകത്തിൽ അമർത്തി തുറക്കാം**. API പേരുകളും field പേരുകളും code-ൽ ഉപയോഗിക്കുന്നതുപോലെ ഇംഗ്ലീഷിൽ നിലനിർത്തിയിട്ടുണ്ട്.

## ഉള്ളടക്കം

1. [ഒറ്റനോട്ടത്തിൽ: migration എവിടെ എത്തി?](#overview)
2. [ഓരോ module-ലും ചെയ്തതും ബാക്കിയുള്ളതും](#modules)
3. [ആദ്യം ശ്രദ്ധിക്കേണ്ട പ്രശ്നങ്ങൾ](#priorities)
4. [സുരക്ഷാ പ്രശ്നങ്ങൾ — 16 കണ്ടെത്തലുകൾ](#security)
5. [പ്രവർത്തനത്തിലും code ഘടനയിലുമുള്ള പ്രശ്നങ്ങൾ — 19 കണ്ടെത്തലുകൾ](#functional)
6. [ജോലികൾ ഏത് ക്രമത്തിൽ പൂർത്തിയാക്കണം?](#roadmap)
7. [ഡെവലപ്പർമാർക്കുള്ള വിശദാംശങ്ങൾ: fields, keys, database](#technical)
8. [മുഴുവൻ API പട്ടിക: ബാക്കിയുള്ള 115 + matching ഉള്ള 82](#api-inventory)
9. [പരിശോധനയുടെ പരിധി, തെളിവുകൾ, ശേഷിക്കുന്ന tests](#verification)അനുമതി

<a id="overview"></a>

## 1. ഒറ്റനോട്ടത്തിൽ: migration എവിടെ എത്തി?

**Migration ഭാഗികമായി മാത്രമാണ് പൂർത്തിയായത്. Laravel backend-നെ പൂർണ്ണമായി മാറ്റിസ്ഥാപിക്കാൻ Express തയ്യാറായതായി ഈ പരിശോധന സ്ഥിരീകരിക്കുന്നില്ല.**

| അറിയേണ്ട കാര്യം | നിലവിലെ സ്ഥിതി |
|---|---|
| പഴയ Laravel API പട്ടിക | **197** വ്യത്യസ്ത method/path കൂട്ടുകൾ |
| അതേ method/path രൂപം Express-ൽ കണ്ടെത്തിയത് | **82** |
| അതേ method/path രൂപം Express-ൽ കണ്ടെത്താത്തത് | **115** |
| മുഴുവൻ പ്രവർത്തനവും പരീക്ഷിച്ച് പൂർത്തിയായെന്ന് ഉറപ്പാക്കിയ modules | **ഈ audit-ൽ ഒന്നും സ്ഥിരീകരിച്ചിട്ടില്ല** |

**82 APIs കണ്ടെത്തി എന്നത് 82 APIs പൂർണ്ണമായി പ്രവർത്തിക്കുന്നു എന്നല്ല.** ഉദാഹരണത്തിന്, password recovery-യുടെ code ഉണ്ട്; പക്ഷേ reset email അയയ്ക്കുന്ന ഭാഗം ഇല്ല. ചില features മറ്റൊരു URL-ൽ ഭാഗികമായി നടപ്പാക്കിയിട്ടുമുണ്ട്. അതിനാൽ ഈ കണക്കിൽ നിന്ന് migration completion ശതമാനം കണക്കാക്കരുത്.

ഇപ്പോൾ നില ഇങ്ങനെയാണ്:

- **അടിസ്ഥാന code ഉണ്ട്:** Login, students, curriculum, batch/enrollment, progress, assessment, finance, leave, reports, notifications, dashboard.
- **വലിയ ജോലികൾ ബാക്കിയുണ്ട്:** Certificates, placement, CV, tickets, suggestions, posters, live classes, chat, addon courses, video/storage integrations, email/WhatsApp automation.
- **ആദ്യം ശരിയാക്കേണ്ടത്:** Password reset സുരക്ഷ, ആരുടെ data ആര് മാറ്റാം എന്ന നിയന്ത്രണം, database migration, learning workflow, request/response field വ്യത്യാസങ്ങൾ.

### ഇവിടെ ഉപയോഗിക്കുന്ന വാക്കുകൾ

| വാക്ക് | ലളിതമായ അർത്ഥം |
|---|---|
| Module | ഒരു ജോലി കൈകാര്യം ചെയ്യുന്ന ഭാഗം; ഉദാ: fees, students |
| API / endpoint | Frontend backend-ലേക്ക് request അയയ്ക്കുന്ന വിലാസവും രീതിയും |
| Required key | Request-ൽ നിർബന്ധമായി അയയ്ക്കേണ്ട field |
| Optional key | ചില സാഹചര്യങ്ങളിൽ മാത്രം ആവശ്യമായതോ ഒഴിവാക്കാവുന്നതോ ആയ field |
| Authentication | Request അയച്ചത് ആരാണെന്ന് token ഉപയോഗിച്ച് തിരിച്ചറിയൽ |
| Authorization / ownership | ആ വ്യക്തിക്ക് ആ ജോലി ചെയ്യാനോ ആ record കാണാനോ അവകാശമുണ്ടോ എന്ന പരിശോധന |
| RBAC | Admin, Tutor തുടങ്ങിയ role അനുസരിച്ച് അനുവാദം നൽകൽ |
| Contract / parity | പഴയതും പുതിയതുമായ API-കളുടെ input, output, പ്രവർത്തനം തമ്മിലുള്ള പൊരുത്തം |
| Placeholder | യഥാർത്ഥ data-യ്ക്ക് പകരം താൽക്കാലികമായി നൽകിയ `null`, `0`, `[]` പോലുള്ള value |
| Runtime test | Application പ്രവർത്തിപ്പിച്ച് ഫലം പരിശോധിക്കൽ |

<a id="modules"></a>

## 2. ഓരോ module-ലും ചെയ്തതും ബാക്കിയുള്ളതും

**“Code ഉണ്ട്” എന്നതും “മുഴുവൻ ജോലി പൂർത്തിയായി” എന്നതും വ്യത്യസ്തമാണ്.** താഴെ ഓരോ module-ന്റെയും നിലവിലുള്ള ഭാഗവും ശേഷിക്കുന്ന ജോലിയും പ്രത്യേകം നൽകിയിരിക്കുന്നു.

### 2.1 Code ഉള്ള modules — പൂർത്തിയാക്കലും പരിശോധനയും ബാക്കി

താഴെയുള്ള 19 module/feature വിഭാഗങ്ങളിൽ implementation ഉണ്ട്. ഇവയിൽ പലതിനും field പൊരുത്തം, permissions, ബന്ധപ്പെട്ട workflows, tests എന്നിവ പൂർത്തിയാക്കാനുണ്ട്.

<details>
<summary>Foundation — Backend-ന്റെ അടിത്തറ · ഭാഗികം</summary>

**ഇപ്പോൾ ഉള്ളത്:** Express, strict TypeScript, Prisma connection, Zod middleware, error handler, Pino, Helmet, CORS, health endpoint

**ബാക്കിയുള്ള ജോലി:** Migration completeness, lint setup, എല്ലാ inputs-നും validation, deployment verification

</details>

<details>
<summary>Authentication — Login, profile, password · ഭാഗികം</summary>

**ഇപ്പോൾ ഉള്ളത്:** Student/staff login, student registration/profile, staff profile, password change, reset-token storage/consumption

**ബാക്കിയുള്ള ജോലി:** Logout/revocation, reset email, registration communications, enrollment-expiry check, contract parity

</details>

<details>
<summary>Students — വിദ്യാർത്ഥികളുടെ വിവരങ്ങളും account നിയന്ത്രണവും · ഭാഗികം</summary>

**ഇപ്പോൾ ഉള്ളത്:** List/create/update/delete, own profile/image, block/unblock/drop/undrop, login status, module unblock

**ബാക്കിയുള്ള ജോലി:** Search/details/export, batch-scoped access, reset endpoint security, filter parity

</details>

<details>
<summary>Staff/users — ജീവനക്കാരും അവരുടെ permissions-ഉം · ഭാഗികം</summary>

**ഇപ്പോൾ ഉള്ളത്:** List/create, role list, by-role lookup, permission response

**ബാക്കിയുള്ള ജോലി:** Update/delete/reset, stored permission matrix, centralized enforcement

</details>

<details>
<summary>Programs — പഠന പരിപാടികൾ · Code ഉണ്ട്; പരിശോധന ശേഷിക്കുന്നു</summary>

**ഇപ്പോൾ ഉള്ളത്:** List/create/show/update/delete/clone

**ബാക്കിയുള്ള ജോലി:** RBAC, validation/schema limits, clone/data parity verification

</details>

<details>
<summary>Sections — പഠന വിഭാഗങ്ങൾ · ഭാഗികം</summary>

**ഇപ്പോൾ ഉള്ളത്:** List/create/show/update, images

**ബാക്കിയുള്ള ജോലി:** Clone/delete, `position`, duration contract, RBAC

</details>

<details>
<summary>Curriculum modules — പാഠഭാഗങ്ങൾ · ഭാഗികം</summary>

**ഇപ്പോൾ ഉള്ളത്:** List/create/show/update

**ബാക്കിയുള്ള ജോലി:** Delete, `priority` compatibility, status/parent update contract

</details>

<details>
<summary>Topics — പാഠങ്ങളും assessment ഉള്ളടക്കവും · ഭാഗികം</summary>

**ഇപ്പോൾ ഉള്ളത്:** List/create/show/update, uploads, assessment persistence

**ബാക്കിയുള്ള ജോലി:** Delete, priority API, file-serving API, nested MCQ validation

</details>

<details>
<summary>Special categories — പ്രത്യേക വിഭാഗങ്ങൾ · ഭാഗികം</summary>

**ഇപ്പോൾ ഉള്ളത്:** List/create/show/update

**ബാക്കിയുള്ള ജോലി:** Delete endpoint, filter/response parity

</details>

<details>
<summary>Batches — ബാച്ചുകൾ · ഭാഗികം</summary>

**ഇപ്പോൾ ഉള്ളത്:** `/program-section-batches` list/create/show

**ബാക്കിയുള്ള ജോലി:** Legacy `/batches`, update/delete, capacity/type/program/date fields

</details>

<details>
<summary>Enrollment — വിദ്യാർത്ഥിയെ ബാച്ചിൽ ചേർക്കൽ · ഭാഗികം</summary>

**ഇപ്പോൾ ഉള്ളത്:** `/student-sections` CRUD, student batch/module views

**ബാക്കിയുള്ള ജോലി:** Legacy endpoints, student-topic initialization, full curriculum tree, mentors, date/self-placement flows, onboarding side effects

</details>

<details>
<summary>Extensions — പഠനകാലാവധി നീട്ടൽ · ഭാഗികം</summary>

**ഇപ്പോൾ ഉള്ളത്:** Staff create/list/show/update; approved extension date change

**ബാക്കിയുള്ള ജോലി:** Student create/list, legacy batch/status model, repeated-approval safety

</details>

<details>
<summary>Progress/performance — പഠന പുരോഗതിയും വിലയിരുത്തലും · ഭാഗികം</summary>

**ഇപ്പോൾ ഉള്ളത്:** Complete topic/course; unlock request/list/approve; performance CRUD/completed modules

**ബാക്കിയുള്ള ജോലി:** Ownership, staff scope, consistent states, transaction/notification integrity

</details>

<details>
<summary>Assessments — ചോദ്യങ്ങളും ഉത്തരങ്ങളും marks-ഉം · ഭാഗികം</summary>

**ഇപ്പോൾ ഉള്ളത്:** Submit/read answers, evaluate answers, questions endpoint, progress update

**ബാക്കിയുള്ള ജോലി:** Trusted student identity, server-controlled marks, eligibility checks, student route accessibility

</details>

<details>
<summary>Finance — ഫീസും പണമിടപാടുകളും · Code ഉണ്ട്; verification ശേഷിക്കുന്നു</summary>

**ഇപ്പോൾ ഉള്ളത്:** എല്ലാ 8 legacy fee routes-നും handlers/use cases

**ബാക്കിയുള്ള ജോലി:** Dedicated tests, access scope, financial state/transaction parity

</details>

<details>
<summary>Leaves — അവധി അപേക്ഷകൾ · Code ഉണ്ട്; verification ശേഷിക്കുന്നു</summary>

**ഇപ്പോൾ ഉള്ളത്:** Reasons, create/list/authorize/proof

**ബാക്കിയുള്ള ജോലി:** Ownership/scope acceptance tests, private proof storage, response parity

</details>

<details>
<summary>Student reports — വിദ്യാർത്ഥി റിപ്പോർട്ടുകൾ · Code ഉണ്ട്; verification ശേഷിക്കുന്നു</summary>

**ഇപ്പോൾ ഉള്ളത്:** Heads, create/list/delete

**ബാക്കിയുള്ള ജോലി:** Permission/relationship validation, database migration and parity tests

</details>

<details>
<summary>In-app notifications — Application-ലെ അറിയിപ്പുകൾ · ഭാഗികം</summary>

**ഇപ്പോൾ ഉള്ളത്:** Admin/student list and mark-read/viewed

**ബാക്കിയുള്ള ജോലി:** Missing modules-ൽ നിന്നുള്ള event producers; workflow parity

</details>

<details>
<summary>Dashboard/quotes — Dashboard വിവരങ്ങൾ · ഭാഗികം</summary>

**ഇപ്പോൾ ഉള്ളത്:** Admin/student dashboard and daily quotes

**ബാക്കിയുള്ള ജോലി:** Real placement metrics, dependent features, progress/date calculations

</details>


### 2.2 പ്രധാന implementation ബാക്കിയുള്ള modules / services

ചിലതിൽ package, configuration, database field എന്നിവ മാത്രം ഉണ്ട്. അവ ഉണ്ടെന്നത് feature പ്രവർത്തിക്കുന്നു എന്നതിന് തെളിവല്ല.

<details>
<summary>Certificates — സർട്ടിഫിക്കറ്റുകൾ · ശേഷിക്കുന്നു</summary>

**ഇപ്പോൾ ഉള്ളത്:** Dedicated router/module ഇല്ല

**ബാക്കിയുള്ള ജോലി:** Types, issuance, number generation, PDF, download, email

</details>

<details>
<summary>Placement — ജോലി ലഭിക്കുന്നതുമായി ബന്ധപ്പെട്ട നടപടികൾ · ശേഷിക്കുന്നു</summary>

**ഇപ്പോൾ ഉള്ളത്:** Dedicated router/module ഇല്ല

**ബാക്കിയുള്ള ജോലി:** Companies, approvals, assignment, 3 rounds, feedback, emails, officer views

</details>

<details>
<summary>Student CV — CV കൈകാര്യം ചെയ്യൽ · ശേഷിക്കുന്നു</summary>

**ഇപ്പോൾ ഉള്ളത്:** `students.cv_file_path` schema field ഉണ്ട്

**ബാക്കിയുള്ള ജോലി:** Upload/download/delete/list APIs and ownership

</details>

<details>
<summary>Tickets — സഹായ അഭ്യർത്ഥനകൾ · ശേഷിക്കുന്നു</summary>

**ഇപ്പോൾ ഉള്ളത്:** Dedicated implementation ഇല്ല

**ബാക്കിയുള്ള ജോലി:** Create/list, attachments, assign/forward/reply/close, notifications

</details>

<details>
<summary>Suggestions — നിർദ്ദേശങ്ങൾ · ശേഷിക്കുന്നു</summary>

**ഇപ്പോൾ ഉള്ളത്:** Dedicated implementation ഇല്ല

**ബാക്കിയുള്ള ജോലി:** Submit/list/detail/delete/status/student history

</details>

<details>
<summary>Posters — അറിയിപ്പ് ചിത്രങ്ങൾ · ശേഷിക്കുന്നു</summary>

**ഇപ്പോൾ ഉള്ളത്:** Dedicated implementation ഇല്ല

**ബാക്കിയുള്ള ജോലി:** Upload/list/update/delete, date-window display

</details>

<details>
<summary>Live classes/Zoom — Online classes · ശേഷിക്കുന്നു</summary>

**ഇപ്പോൾ ഉള്ളത്:** Packages/config entries മാത്രം

**ബാക്കിയുള്ള ജോലി:** OAuth, schedule/conflicts, meeting lifecycle, signatures, attendance

</details>

<details>
<summary>Chat — തത്സമയ സന്ദേശങ്ങൾ · ശേഷിക്കുന്നു</summary>

**ഇപ്പോൾ ഉള്ളത്:** Socket.IO dependency മാത്രം; server gateway ഇല്ല

**ബാക്കിയുള്ള ജോലി:** Token handoff, REST APIs, websocket protocol, recipients, presence, unread state

</details>

<details>
<summary>Addon courses — അധിക കോഴ്സുകൾ · ശേഷിക്കുന്നു</summary>

**ഇപ്പോൾ ഉള്ളത്:** Dedicated implementation ഇല്ല

**ബാക്കിയുള്ള ജോലി:** Courses/videos, enrollment, completion tracking

</details>

<details>
<summary>DynTube — Video സേവനം · ശേഷിക്കുന്നു</summary>

**ഇപ്പോൾ ഉള്ളത്:** Dependency/config മാത്രം

**ബാക്കിയുള്ള ജോലി:** Metadata/playback/batch/cache/quality APIs

</details>

<details>
<summary>S3 — Cloud file storage · ശേഷിക്കുന്നു</summary>

**ഇപ്പോൾ ഉള്ളത്:** SDK/config മാത്രം

**ബാക്കിയുള്ള ജോലി:** Presigned upload/download, object access policy

</details>

<details>
<summary>Email/PDF — Email-കളും PDF രേഖകളും · ശേഷിക്കുന്നു</summary>

**ഇപ്പോൾ ഉള്ളത്:** Mail dependency/config മാത്രം

**ബാക്കിയുള്ള ജോലി:** SMTP adapter/templates, attachments, certificates/offer letters

</details>

<details>
<summary>WhatsApp/queues — സന്ദേശങ്ങളും പിന്നണിയിൽ നടക്കുന്ന ജോലികളും · ശേഷിക്കുന്നു</summary>

**ഇപ്പോൾ ഉള്ളത്:** BullMQ/Redis dependencies/config മാത്രം

**ബാക്കിയുള്ള ജോലി:** Workers, dispatch, retries, message logs, milestone/date automation

</details>


### 2.3 തുടരണമോ ഒഴിവാക്കണമോ തീരുമാനിക്കേണ്ട APIs

<details>
<summary>Logs/legacy utilities — പഴയ utility APIs · തീരുമാനം ശേഷിക്കുന്നു</summary>

**ഇപ്പോൾ ഉള്ളത്:** `/health` ഉണ്ട്

**ബാക്കിയുള്ള ജോലി:** Legacy logs/test/user APIs migrate ചെയ്യണോ retire ചെയ്യണോ തീരുമാനിക്കുക

</details>

യഥാർത്ഥ roles: Student; staff-ൽ Admin, Team Lead, Tutor, Quality Analyst, Placement Officer, Sales Analyst. Role-specific access migration ആവശ്യമാണ്; പുതിയ Teacher/Parent roles സൃഷ്ടിക്കേണ്ട തെളിവില്ല.

<a id="priorities"></a>

## 3. ആദ്യം ശ്രദ്ധിക്കേണ്ട പ്രശ്നങ്ങൾ

ഈ ഭാഗം വായിച്ചാൽ migration-ലെ പ്രധാന തടസ്സങ്ങൾ മനസ്സിലാകും. ഓരോന്നിന്റെയും പൂർണ്ണ വിശദാംശങ്ങൾ അടുത്ത ഭാഗങ്ങളിലുണ്ട്.

1. **Login ഇല്ലാതെ password മാറ്റാവുന്ന API ഉണ്ട് — SEC-01.** `/students/reset-password`-ൽ authentication ഇല്ല. Target student-നെ മാറ്റാൻ caller-ന് അനുവാദമുണ്ടോ എന്നും പരിശോധിക്കുന്നില്ല. ഇത് ഏറ്റവും ആദ്യം ശരിയാക്കണം.
2. **ചില API-കൾ request-ൽ അയയ്ക്കുന്ന student ID വിശ്വസിക്കുന്നു — SEC-02 മുതൽ SEC-06 വരെ.** സ്വന്തം record ആണോ എന്ന് ഉറപ്പാക്കാതെ progress, completion, assessment വിവരങ്ങൾ കൈകാര്യം ചെയ്യുന്നു. Assessment-ൽ അയയ്ക്കുന്ന `marks` server calculation ഒഴിവാക്കുകയും ചെയ്യാം.
3. **Role permissions കാണിക്കുന്നതും അവ നടപ്പാക്കുന്നതും തമ്മിൽ വിടവുണ്ട് — SEC-07, FUN-09.** ആരെ login ചെയ്യാൻ അനുവദിക്കുന്നു എന്നതിനു പുറമേ, ഓരോ ജീവനക്കാരനും ഏത് batch/student data കാണാനും മാറ്റാനും കഴിയണം എന്ന് backend പരിശോധിക്കണം.
4. **പുതിയ database തയ്യാറാക്കാനുള്ള SQL അപൂർണ്ണമാണ്.** Prisma schema-യിൽ ഉള്ള 9 tables baseline SQL-ൽ ഇല്ല; ചില columns-ഉം ഇല്ല. Live database പരിശോധിച്ചിട്ടില്ല. പുതിയ installation-ൽ schema പൊരുത്തം ഉറപ്പാക്കണം.
5. **Student-നെ batch-ൽ ചേർത്താൽ മുഴുവൻ പഠന ഘടന തയ്യാറാകുന്നില്ല — FUN-04.** Modules create ചെയ്യുന്നു; student-topic records create ചെയ്യുന്നില്ല. Enrollment മുതൽ assessment, completion വരെ ഒരുമിച്ച് പരിശോധിക്കണം.
6. **Password recovery-യിൽ email delivery ഇല്ല — FUN-01.** Token save ചെയ്ത ശേഷം email അയച്ചെന്ന message നൽകുന്നു; mail അയയ്ക്കുന്ന code ഇല്ല.
7. **പഴയ frontend അയയ്ക്കുന്ന ചില fields മാറിയിട്ടുണ്ട് അല്ലെങ്കിൽ സ്വീകരിക്കുന്നില്ല.** ഉദാഹരണം: batch `name` → `batch_name`, module `priority` → `order`. ചില keys validation സമയത്ത് ഒഴിവാക്കപ്പെടാം; success response വന്നാലും data save ആയെന്ന് ഉറപ്പില്ല.
8. **Dashboard/login response-ൽ ചിലത് യഥാർത്ഥ data അല്ല — FUN-03, FUN-10.** Placement percentage `0`, posters `[]`, ചില profile fields `null` എന്നിങ്ങനെ സ്ഥിരമായ values ഉണ്ട്.

മറ്റ് പ്രധാന കാര്യങ്ങൾ: private leave proofs public storage-ൽ വരുന്നു; extension വീണ്ടും approve ചെയ്താൽ date വീണ്ടും നീളാവുന്ന logic ഉണ്ട്; fee collection-ലെ audit actor payload ഉപയോഗിച്ച് മാറ്റാനാകുന്നു. ഇവയുടെ വിശദാംശങ്ങൾ താഴെ നൽകിയിരിക്കുന്നു.

<a id="security"></a>

## 4. സുരക്ഷാ പ്രശ്നങ്ങൾ — 16 കണ്ടെത്തലുകൾ

P0 = production cutover-ന് മുമ്പ് ഉടൻ തടയേണ്ടത്; P1 = ഉയർന്ന മുൻഗണന; P2 = correctness/quality hardening. താഴെയുള്ള severity ഈ audit-ന്റെ വിലയിരുത്തലാണ്.

<details>
<summary>SEC-01 · P0 — Login ഇല്ലാതെ student password മാറ്റാം</summary>

**പ്രശ്നം:** `/students/reset-password`-ൽ authentication ഇല്ല; target ID നൽകി password മാറ്റുന്ന use case-ൽ authorization ഇല്ല

**പരിഹരിക്കേണ്ട വിധം:** Staff authentication, reset permission, target scope, authenticated audit actor

</details>

<details>
<summary>SEC-02 · P1 — Module unlock request-ൽ student identity ഉറപ്പാക്കുന്നില്ല</summary>

**പ്രശ്നം:** Unlock request endpoint public ആണ്; body `student_id` വിശ്വസിക്കുന്നു

**പരിഹരിക്കേണ്ട വിധം:** Student token identity, enrollment ownership, valid next-module transition

</details>

<details>
<summary>SEC-03 · P1 — Student performance API പൊതുവായി ലഭ്യമാണ്</summary>

**പ്രശ്നം:** `/students/:student_id/module-performance` public ആണ്

**പരിഹരിക്കേണ്ട വിധം:** Student-own/staff-assigned scope പരിശോധന

</details>

<details>
<summary>SEC-04 · P1 — Assessment-ൽ സ്വന്തം student record ആണെന്ന് പരിശോധിക്കുന്നില്ല</summary>

**പ്രശ്നം:** Assessment save/read-ൽ token user-നെ supplied `student_id`-യുമായി ബന്ധിപ്പിക്കുന്ന പരിശോധന controller/use case-ൽ ഇല്ല

**പരിഹരിക്കേണ്ട വിധം:** Ownership, enrollment/topic/question ബന്ധം പരിശോധിക്കുക

</details>

<details>
<summary>SEC-05 · P1 — Request-ലെ marks server evaluation ഒഴിവാക്കുന്നു</summary>

**പ്രശ്നം:** Assessment payload-ലെ `marks` ഉണ്ടായാൽ server evaluation ഒഴിവാക്കുന്നു

**പരിഹരിക്കേണ്ട വിധം:** Student grading പൂർണ്ണമായി server-ൽ നടത്തുക; staff override വേണമെങ്കിൽ പ്രത്യേക permission

</details>

<details>
<summary>SEC-06 · P1 — Topic completion-ൽ ownership പരിശോധന ഇല്ല</summary>

**പ്രശ്നം:** Topic completion use case ownership പരിശോധിക്കുന്നില്ല; repository-യിലെ `_studentId` ഉപയോഗിക്കുന്നില്ല

**പരിഹരിക്കേണ്ട വിധം:** Update condition-ൽ authenticated student + topic ബന്ധം നിർബന്ധമാക്കുക

</details>

<details>
<summary>SEC-07 · P1 — Role permissions എല്ലാ ജോലികളിലും നടപ്പാക്കുന്നില്ല</summary>

**പ്രശ്നം:** Permission response hardcoded ആണ്; പല staff mutations-നും generic authentication മാത്രം

**പരിഹരിക്കേണ്ട വിധം:** Central permission policy, role/action/resource-level checks

</details>

<details>
<summary>SEC-08 · P1 — Blocked / inactive account-ന്റെ നിലവിലുള്ള token തടയുന്നില്ല</summary>

**പ്രശ്നം:** Authenticate middleware `Deleted` മാത്രം തടയുന്നു; നിലവിലുള്ള token-ന് Blocked/Dropped/Inactive status പരിശോധിക്കുന്നില്ല

**പരിഹരിക്കേണ്ട വിധം:** Active account policy ഓരോ protected request-ലും enforce ചെയ്യുക

</details>

<details>
<summary>SEC-09 · P1 — Reset token സുരക്ഷയും ഒറ്റത്തവണ ഉപയോഗവും ഉറപ്പാക്കണം</summary>

**പ്രശ്നം:** Password reset token DB-യിൽ raw ആയി store ചെയ്യുന്നു; issuance/consumption പല writes ആണ്

**പരിഹരിക്കേണ്ട വിധം:** Token hash, atomic one-time consumption, expiry/replay/race tests

</details>

<details>
<summary>SEC-10 · P1 — Private leave proofs public storage-ലാണ്</summary>

**പ്രശ്നം:** `/storage` മുഴുവൻ `uploads` folder public ആയി serve ചെയ്യുന്നു; leave proofs അതിനകത്താണ്

**പരിഹരിക്കേണ്ട വിധം:** Private documents public root-ൽ നിന്ന് വേർതിരിക്കുക; authorized streaming

</details>

<details>
<summary>SEC-11 · P1 — Upload file type / content പരിശോധന അപൂർണ്ണമാണ്</summary>

**പ്രശ്നം:** Program/section/topic upload middleware-ൽ size limit ഉണ്ട്; file-type allowlist/content verification ഇല്ല

**പരിഹരിക്കേണ്ട വിധം:** Type/signature checks, safe filenames, failed-request cleanup

</details>

<details>
<summary>SEC-12 · P2 — CORS origin നിയന്ത്രണം deployment-ൽ ഉറപ്പാക്കണം</summary>

**പ്രശ്നം:** CORS default `*`; credentials enabled

**പരിഹരിക്കേണ്ട വിധം:** Deployment origin allowlist, credential behavior verification

</details>

<details>
<summary>SEC-13 · P1 — Reset-password API-ൽ rate limit ഇല്ല</summary>

**പ്രശ്നം:** Login/register/forgot-password rate limiter ഉണ്ട്; reset-password endpoint-ൽ അതില്ല

**പരിഹരിക്കേണ്ട വിധം:** Sensitive routes-ക്കുള്ള consistent throttling; multi-instance store policy

</details>

<details>
<summary>SEC-14 · P1 — Logout / token റദ്ദാക്കൽ സംവിധാനം ഇല്ല</summary>

**പ്രശ്നം:** Logout route/revocation store ഇല്ല; password reset-നുശേഷമുള്ള token invalidation കാണുന്നില്ല

**പരിഹരിക്കേണ്ട വിധം:** Logout/password-change/reset token lifecycle നിർവചിക്കുക

</details>

<details>
<summary>SEC-15 · P1 — Password reset ചെയ്ത വ്യക്തിയുടെ ID client-ന് മാറ്റാം</summary>

**പ്രശ്നം:** Admin reset-ലെ optional `reseted_by` authenticated actor-നെ override ചെയ്യാം

**പരിഹരിക്കേണ്ട വിധം:** Audit identity client payload-ൽ നിന്ന് എടുക്കരുത്

</details>

<details>
<summary>SEC-16 · P1 — Fee സ്വീകരിച്ച / അംഗീകരിച്ച വ്യക്തിയുടെ ID client-ന് മാറ്റാം</summary>

**പ്രശ്നം:** Fee collection/approval use cases `collected_by` / `auth_by` payload values-ന് token actor-നെക്കാൾ മുൻഗണന നൽകുന്നു

**പരിഹരിക്കേണ്ട വിധം:** Collector/approver audit identity token-ൽ നിന്ന് derive ചെയ്യുക; delegated action വേണമെങ്കിൽ explicit policy

</details>

SEC-10-ൽ public static mapping സ്ഥിരീകരിച്ചതാണ്; production-ൽ ഒരു particular proof URL download ചെയ്ത് പരീക്ഷിച്ചിട്ടില്ല. SEC-11 arbitrary code execution സ്ഥിരീകരിച്ച കണ്ടെത്തൽ അല്ല; upload validation gap ആണ്.

തെളിവുകൾ: [student routes](src/modules/students/presentation/routes/studentRoutes.ts), [reset use case](src/modules/students/application/use-cases/ResetStudentPasswordUseCase.ts), [progress routes](src/modules/progress/presentation/routes/progressRoutes.ts), [progress repository](src/modules/progress/infrastructure/persistence/PrismaProgressRepository.ts), [assessment controller](src/modules/assessment/presentation/controllers/AssessmentController.ts), [assessment save](src/modules/assessment/application/use-cases/SaveAssessmentAnswersUseCase.ts), [authenticate](src/shared/middleware/authenticate.ts), [reset repository](src/modules/auth/infrastructure/persistence/PrismaPasswordResetRepository.ts), [fee collection](src/modules/finance/application/use-cases/CollectFeeUseCase.ts), [fee approval](src/modules/finance/application/use-cases/ApproveFeeCollectionUseCase.ts), [uploads](src/shared/middleware/uploadMiddleware.ts), [app](src/app.ts).

<a id="functional"></a>

## 5. പ്രവർത്തനത്തിലും code ഘടനയിലുമുള്ള പ്രശ്നങ്ങൾ — 19 കണ്ടെത്തലുകൾ

<details>
<summary>FUN-01 — Email അയയ്ക്കാതെ അയച്ചെന്ന് message നൽകുന്നു</summary>

**വിഭാഗം:** Password recovery

**കണ്ടെത്തിയത് / ബാക്കിയുള്ള ജോലി:** Token save ചെയ്തശേഷം email അയച്ചെന്ന് message നൽകുന്നു; mail call ഇല്ല

**തെളിവിന്റെ നില:** സ്ഥിരീകരിച്ചത്

</details>

<details>
<summary>FUN-02 — Registration-ൽ രണ്ട് വ്യത്യസ്ത രീതികളും missing messages-ഉം</summary>

**വിഭാഗം:** Registration

**കണ്ടെത്തിയത് / ബാക്കിയുള്ള ജോലി:** Welcome email/WhatsApp workflow ഇല്ല; രണ്ട് വ്യത്യസ്ത registration contracts ഉണ്ട്

**തെളിവിന്റെ നില:** സ്ഥിരീകരിച്ചത്

</details>

<details>
<summary>FUN-03 — Login-ൽ expiry check ഇല്ല; ചില response values താൽക്കാലികമാണ്</summary>

**വിഭാഗം:** Login

**കണ്ടെത്തിയത് / ബാക്കിയുള്ള ജോലി:** Expired enrollments check ഇല്ല; posters `[]`, intern type `null`, ചില profile values `null`

**തെളിവിന്റെ നില:** സ്ഥിരീകരിച്ചത്

</details>

<details>
<summary>FUN-04 — Enrollment student-topic records തയ്യാറാക്കുന്നില്ല</summary>

**വിഭാഗം:** Enrollment

**കണ്ടെത്തിയത് / ബാക്കിയുള്ള ജോലി:** Modules create ചെയ്യുന്നു; student-topic rows create ചെയ്യുന്നില്ല; module `student_id` നിറയ്ക്കുന്നില്ല

**തെളിവിന്റെ നില:** സ്ഥിരീകരിച്ചത്

</details>

<details>
<summary>FUN-05 — ബന്ധപ്പെട്ട database മാറ്റങ്ങൾ ഒറ്റ transaction-ൽ പൂർത്തിയാകുന്നില്ല</summary>

**വിഭാഗം:** Transactions

**കണ്ടെത്തിയത് / ബാക്കിയുള്ള ജോലി:** Enrollment create/delete, unlock approval തുടങ്ങിയ multi-write operations-ൽ transaction boundary അപൂർണ്ണം

**തെളിവിന്റെ നില:** സ്ഥിരീകരിച്ചത്; failure effect runtime test വേണം

</details>

<details>
<summary>FUN-06 — Enrollment delete പഴയ backend-ൽ നിന്ന് വ്യത്യസ്തമാണ്</summary>

**വിഭാഗം:** Enrollment deletion

**കണ്ടെത്തിയത് / ബാക്കിയുള്ള ജോലി:** Express hard delete; Laravel batch removal soft-delete flow-യുമായി വ്യത്യാസം

**തെളിവിന്റെ നില:** വൈരുദ്ധ്യം

</details>

<details>
<summary>FUN-07 — വീണ്ടും approval നൽകിയാൽ extension date വീണ്ടും നീളാം</summary>

**വിഭാഗം:** Extensions

**കണ്ടെത്തിയത് / ബാക്കിയുള്ള ജോലി:** Approval വീണ്ടും അയച്ചാൽ date വീണ്ടും extend ചെയ്യാവുന്ന logic; prior-state guard ഇല്ല

**തെളിവിന്റെ നില:** Code path സ്ഥിരീകരിച്ചു; runtime test വേണം

</details>

<details>
<summary>FUN-08 — സ്വീകരിക്കുന്ന ചില student filters ഉപയോഗിക്കുന്നില്ല</summary>

**വിഭാഗം:** Student filters

**കണ്ടെത്തിയത് / ബാക്കിയുള്ള ജോലി:** `batch_name`, `program_name`, `completion_start`, `completion_end` schema-യിൽ ഉണ്ട്; list use case/repository-യിൽ ഉപയോഗിക്കുന്നില്ല

**തെളിവിന്റെ നില:** സ്ഥിരീകരിച്ചത്

</details>

<details>
<summary>FUN-09 — Staff-ന് കാണാവുന്ന students-ന്റെ scope അപൂർണ്ണമാണ്</summary>

**വിഭാഗം:** Student visibility

**കണ്ടെത്തിയത് / ബാക്കിയുള്ള ജോലി:** Express sales user-നെ creator അടിസ്ഥാനത്തിൽ restrict ചെയ്യുന്നു; Tutor/QA/Placement batch scope ഇല്ല. Laravel sales branch documentation-നേക്കാൾ വ്യത്യസ്തമാണ്

**തെളിവിന്റെ നില:** Source വ്യത്യാസം സ്ഥിരീകരിച്ചു

</details>

<details>
<summary>FUN-10 — Dashboard യഥാർത്ഥ placement / date വിവരങ്ങൾ നൽകുന്നില്ല</summary>

**വിഭാഗം:** Dashboard

**കണ്ടെത്തിയത് / ബാക്കിയുള്ള ജോലി:** `placement_percentage: 0`, `information_message: ''`; actual/expected dates ഒരേ source date-ൽ നിന്ന്

**തെളിവിന്റെ നില:** സ്ഥിരീകരിച്ചത്

</details>

<details>
<summary>FUN-11 — Progress status പേരുകളും മാറ്റുന്നതിനുള്ള നിയമങ്ങളും ഏകീകൃതമല്ല</summary>

**വിഭാഗം:** Progress

**കണ്ടെത്തിയത് / ബാക്കിയുള്ള ജോലി:** Enrollment `Locked/Unlocked`, unlock `pending/active/completed`; ഏകീകൃത transition policy ഇല്ല

**തെളിവിന്റെ നില:** സ്ഥിരീകരിച്ചത്

</details>

<details>
<summary>FUN-12 — Course completion മുഴുവൻ അനുബന്ധ ജോലികളും ചെയ്യുന്നില്ല</summary>

**വിഭാഗം:** Course completion

**കണ്ടെത്തിയത് / ബാക്കിയുള്ള ജോലി:** Section status/percentage മാത്രം update ചെയ്യുന്നു; legacy modules/topics/dates/automation parity ഇല്ല

**തെളിവിന്റെ നില:** സ്ഥിരീകരിച്ചത്

</details>

<details>
<summary>FUN-13 — Unlock filters ഒരുമിച്ച് നൽകിയാൽ ചിലത് നഷ്ടപ്പെടാം</summary>

**വിഭാഗം:** Unlock filters

**കണ്ടെത്തിയത് / ബാക്കിയുള്ള ജോലി:** `batchId`/`sectionId` relation filter assignments പരസ്പരം overwrite ചെയ്യുന്നു; deleted-exclusion filter നഷ്ടപ്പെടാം

**തെളിവിന്റെ നില:** Source സ്ഥിരീകരിച്ചു; combined-filter test വേണം

</details>

<details>
<summary>FUN-14 — MCQ-യിലെ questions / answers ഘടന validate ചെയ്യുന്നില്ല</summary>

**വിഭാഗം:** MCQ authoring

**കണ്ടെത്തിയത് / ബാക്കിയുള്ള ജോലി:** `assessments: z.unknown()`; controller type assertion; nested `AssessmentItemSchema` parse ചെയ്യുന്നില്ല

**തെളിവിന്റെ നില:** സ്ഥിരീകരിച്ചത്

</details>

<details>
<summary>FUN-15 — Student assessment route-നെ staff middleware തടയാം</summary>

**വിഭാഗം:** Route ordering

**കണ്ടെത്തിയത് / ബാക്കിയുള്ള ജോലി:** Curriculum router `/topics` prefix-ൽ staff auth സ്ഥാപിക്കുന്നു; പിന്നാലെയുള്ള `authenticate('any')` assessment route-ലേക്ക് student എത്തുന്നതിന് മുമ്പ് reject ചെയ്യാം

**തെളിവിന്റെ നില:** Mount order സ്ഥിരീകരിച്ചു; HTTP regression test വേണം

</details>

<details>
<summary>FUN-16 — ചില query values ശരിയായി validate ചെയ്യുന്നില്ല</summary>

**വിഭാഗം:** Query validation

**കണ്ടെത്തിയത് / ബാക്കിയുള്ള ജോലി:** Progress list controllers schema parse ചെയ്യാതെ casts ഉപയോഗിക്കുന്നു; മറ്റു controllers-ൽ `parseInt`-ശേഷം strict integer checks അസമമാണ്

**തെളിവിന്റെ നില:** സ്ഥിരീകരിച്ചത്

</details>

<details>
<summary>FUN-17 — Architecture-ൽ layer separation പൂർത്തിയായിട്ടില്ല</summary>

**വിഭാഗം:** Architecture

**കണ്ടെത്തിയത് / ബാക്കിയുള്ള ജോലി:** ചില application use cases നേരിട്ട് Prisma സ്വീകരിക്കുന്നു; permission logic hardcoded; auth/students repositories-ൽ duplicated concepts

**തെളിവിന്റെ നില:** സ്ഥിരീകരിച്ചത്; inward dependencies പുനഃക്രമീകരിക്കുക

</details>

<details>
<summary>FUN-18 — Request fail ആയാൽ uploaded file ശേഷിക്കാം</summary>

**വിഭാഗം:** File lifecycle

**കണ്ടെത്തിയത് / ബാക്കിയുള്ള ജോലി:** Disk upload validation-ന് മുമ്പ് നടക്കുന്നു; failed request-ന്റെ orphan file cleanup ഉറപ്പില്ല

**തെളിവിന്റെ നില:** Middleware order സ്ഥിരീകരിച്ചു; cleanup behavior പരിശോധിക്കുക

</details>

<details>
<summary>FUN-19 — Finance-ന്റെ പ്രത്യേക tests കണ്ടെത്തിയില്ല</summary>

**വിഭാഗം:** Financial verification

**കണ്ടെത്തിയത് / ബാക്കിയുള്ള ജോലി:** 8 routes ഉണ്ട്; finance-specific test file കണ്ടെത്തിയില്ല

**തെളിവിന്റെ നില:** സ്ഥിരീകരിച്ചത്; money/state/concurrency tests ശേഷിക്കുന്നു

</details>

തെളിവുകൾ: [forgot password](src/modules/auth/application/use-cases/ForgotPasswordUseCase.ts), [login](src/modules/auth/application/use-cases/StudentLoginUseCase.ts), [enrollment repository](src/modules/batch/infrastructure/persistence/PrismaStudentSectionRepository.ts), [extension update](src/modules/batch/application/use-cases/extensions/UpdateExtensionUseCase.ts), [student list](src/modules/students/application/use-cases/ListStudentsUseCase.ts), [dashboard](src/modules/dashboard/application/use-cases/GetStudentDashboardUseCase.ts), [topic controller](src/modules/curriculum/presentation/controllers/TopicController.ts), [progress controller](src/modules/progress/presentation/controllers/ProgressController.ts), [permissions](src/modules/users/application/use-cases/GetRolePermissionsUseCase.ts).

<a id="roadmap"></a>

## 6. ജോലികൾ ഏത് ക്രമത്തിൽ പൂർത്തിയാക്കണം?

#### 1

**ചെയ്യേണ്ട ജോലി:** SEC-01 മുതൽ identity/ownership/RBAC gaps പരിഹരിക്കുക

**പൂർത്തിയായെന്ന് ഉറപ്പാക്കാനുള്ള തെളിവ്:** Negative authorization tests; sensitive routes protected

#### 2

**ചെയ്യേണ്ട ജോലി:** Schema/SQL migration/data mapping ഒത്താക്കുക

**പൂർത്തിയായെന്ന് ഉറപ്പാക്കാനുള്ള തെളിവ്:** Clean migration + imported-data verification

#### 3

**ചെയ്യേണ്ട ജോലി:** Auth/students/curriculum/batch/enrollment/progress/assessment contracts complete ചെയ്യുക

**പൂർത്തിയായെന്ന് ഉറപ്പാക്കാനുള്ള തെളിവ്:** Existing learning journey end-to-end pass

#### 4

**ചെയ്യേണ്ട ജോലി:** Storage/email/PDF/queue/WhatsApp shared adapters

**പൂർത്തിയായെന്ന് ഉറപ്പാക്കാനുള്ള തെളിവ്:** Provider sandbox tests, retries/idempotency

#### 5

**ചെയ്യേണ്ട ജോലി:** Finance verification, certificates, placement, CV

**പൂർത്തിയായെന്ന് ഉറപ്പാക്കാനുള്ള തെളിവ്:** Domain workflows and ownership tests

#### 6

**ചെയ്യേണ്ട ജോലി:** Tickets/suggestions/posters, full notifications/dashboard

**പൂർത്തിയായെന്ന് ഉറപ്പാക്കാനുള്ള തെളിവ്:** Portal workflows pass

#### 7

**ചെയ്യേണ്ട ജോലി:** DynTube/addon courses, Zoom/live classes, chat

**പൂർത്തിയായെന്ന് ഉറപ്പാക്കാനുള്ള തെളിവ്:** Playback/meeting/realtime acceptance

#### 8

**ചെയ്യേണ്ട ജോലി:** Full parity, performance, staging cutover/rollback

**പൂർത്തിയായെന്ന് ഉറപ്പാക്കാനുള്ള തെളിവ്:** Signed-off regression matrix


ഒരു missing endpoint implement ചെയ്യുന്നതിന് മുമ്പ് അതിന്റെ Laravel controller, request keys, response, tables, role scope, side effects എന്നിവ ഒറ്റ workflow ആയി പരിശോധിക്കണം. Route count ഉയരുന്നത് മാത്രം migration complete ആകുന്നതല്ല.

<a id="technical"></a>

## 7. ഡെവലപ്പർമാർക്കുള്ള വിശദാംശങ്ങൾ

ഈ ഭാഗം implementation ചെയ്യുന്ന ഡെവലപ്പർക്കുള്ളതാണ്. **ഒരു API-ക്ക് എന്ത് അയയ്ക്കണം**, **ഏത് field മാറി**, **database-ൽ എന്ത് കുറവുണ്ട്** എന്നീ കാര്യങ്ങൾ ഇവിടെ നോക്കാം.

- [പഴയതും പുതിയതുമായ API fields-ന്റെ വ്യത്യാസങ്ങൾ](#contracts)
- [ഇപ്പോഴത്തെ Express APIs-ക്കുള്ള required keys](#express-keys)
- [ബാക്കിയുള്ള modules-ന്റെ Laravel request keys](#legacy-keys)
- [Database tables, columns, data mapping](#database)
- [Response-ൽ കാണാത്തതും താൽക്കാലികവുമായ values](#responses)
- [File uploads, environment variables, integrations](#configuration)

<a id="contracts"></a>

### 7.1 പഴയതും പുതിയതുമായ request / response വ്യത്യാസങ്ങൾ

Frontend-ൽ പഴയ key അയച്ചുകൊണ്ടിരുന്നാൽ പുതിയ API അത് നിരസിക്കുകയോ ഒഴിവാക്കുകയോ ചെയ്യാം. താഴെ ഓരോ മാറ്റവും Laravel → Express എന്ന ക്രമത്തിലാണ്.

<details>
<summary>Field മാറ്റങ്ങളും compatibility കുറിപ്പുകളും തുറക്കുക</summary>

#### Student login identifier

**Laravel-ൽ:** `login`, `password`

**Express-ൽ:** `login` alias അല്ലെങ്കിൽ `email_or_username_or_mobile`, `password`

**ചെയ്യേണ്ടത്:** `login` ഇതിനകം compatible; alias ഇല്ലെന്ന issue രേഖപ്പെടുത്തരുത്

#### Staff login identifier

**Laravel-ൽ:** `login`, `password`

**Express-ൽ:** `login` alias അല്ലെങ്കിൽ `email_or_username`, `password`

**ചെയ്യേണ്ടത്:** പഴയ documentation-യിലെ `email`-only claim തെറ്റാണ്; current source authoritative

#### Student registration

**Laravel-ൽ:** Required `first_name`, `email`, `username`, `password`; last name/mobile/gender nullable

**Express-ൽ:** Auth registration-ൽ `last_name`, `mobile_no`, `gender` required; username generate ചെയ്യുന്നു

**ചെയ്യേണ്ടത്:** ഒരേ `/student/register`-ൽ പഴയ onboarding payload fail/alter ആകാം

#### Extended registration fields

**Laravel-ൽ:** Address/parent/sales/special-category/paid fields Laravel സ്വീകരിക്കുന്നു

**Express-ൽ:** Auth registration schema-യിൽ ഇവ ഇല്ല; student-management create വേറൊരു contract

**ചെയ്യേണ്ടത്:** Unified registration policy അല്ലെങ്കിൽ explicit adapter

#### Reset password

**Laravel-ൽ:** `email`, `otp`, `password`, `password_confirmation`

**Express-ൽ:** `token`, `password`, `password_confirmation`

**ചെയ്യേണ്ടത്:** Frontend flow മാറ്റുക അല്ലെങ്കിൽ compatible secure flow നൽകുക; OTP leak പകർത്തരുത്

#### Change password

**Laravel-ൽ:** Routed StudentController: `student_id`, `current_password`, `new_password`, `new_password_confirmation`

**Express-ൽ:** Token identity + `current_password`, `password`, `password_confirmation`

**ചെയ്യേണ്ടത്:** Field mapping/identity policy document ചെയ്യുക

#### Profile image

**Laravel-ൽ:** `student_id` + multipart `image`

**Express-ൽ:** Body `student_id` + multipart `image` required; token ID-യുമായി equality check ഉണ്ട്

**ചെയ്യേണ്ടത്:** `profile_pic` എന്ന് തെറ്റായി request file key ഉപയോഗിക്കരുത്

#### Batch create

**Laravel-ൽ:** `program_id`, `section_id`, `name`, `no_of_interns`, `batch_type`, dates, status

**Express-ൽ:** `section_id`, `batch_name`; dates/mentors optional

**ചെയ്യേണ്ടത്:** Missing fields preserve ചെയ്യുക; renamed keys map ചെയ്യുക

#### Batch QA/date keys

**Laravel-ൽ:** `quality_analyst_id`, `batch_start_date`, `batch_end_date`

**Express-ൽ:** `qa_id`, `start_date`, `end_date`

**ചെയ്യേണ്ടത്:** Request/response/data migration mapping

#### Enrollment assignment

**Laravel-ൽ:** `student_id`, `section_id`, `batch_id`, `status`, expected dates

**Express-ൽ:** `student_id`, `batch_id`, generic dates

**ചെയ്യേണ്ടത്:** Section/status/date semantics preserve ചെയ്യുക

#### Extension submission

**Laravel-ൽ:** Student auth; `batch_id`

**Express-ൽ:** Staff auth; `student_section_id`, `reason`, `extension_months`

**ചെയ്യേണ്ടത്:** യഥാർത്ഥ student workflow restore ചെയ്യുക

#### Extension status

**Laravel-ൽ:** `new/accepted/rejected/completed`

**Express-ൽ:** `Pending/Approved/Rejected`

**ചെയ്യേണ്ടത്:** State mapping + frontend agreement

#### Module ordering

**Laravel-ൽ:** `priority`

**Express-ൽ:** `order`

**ചെയ്യേണ്ടത്:** DTO/DB/response mapping; old key strip ചെയ്യപ്പെടാം

#### Module update

**Laravel-ൽ:** `section_id` accepts reassignment

**Express-ൽ:** Update schema-യിൽ `section_id` ഇല്ല

**ചെയ്യേണ്ടത്:** Reassignment supported ആണോ എന്ന് തീരുമാനിക്കുക

#### Student staff update

**Laravel-ൽ:** Laravel accepts `username`, `status` updates

**Express-ൽ:** Express UpdateStudentSchema-ൽ രണ്ടും ഇല്ല

**ചെയ്യേണ്ടത്:** Intentional lifecycle separation ആണോ migration omission ആണോ തീരുമാനിക്കുക; silently dropped fields document ചെയ്യുക

#### Topic MCQ

**Laravel-ൽ:** `type=mcq` എങ്കിൽ questions/options/answers required

**Express-ൽ:** Conditional nested validation ഇല്ല

**ചെയ്യേണ്ടത്:** MCQ structure, allowed type, correct-answer membership validate ചെയ്യുക

#### Complete course

**Laravel-ൽ:** `section_id`, `student_id`

**Express-ൽ:** `student_section_id`

**ചെയ്യേണ്ടത്:** Resolve/migrate request contract

#### Student login response

**Laravel-ൽ:** `data.token_type`, `data.expires_in`, full student, posters, intern type

**Express-ൽ:** `data.tokenType`, `data.expiresIn`, limited student, empty posters/null intern type

**ചെയ്യേണ്ടത്:** Snake-case aliases/full payload parity

#### Staff login response

**Laravel-ൽ:** Current source പരിശോധിച്ച് compare ചെയ്യണം

**Express-ൽ:** Snake-case aliases ചിലത് ഇതിനകം ഉണ്ട്

**ചെയ്യേണ്ടത്:** Student response issue staff-ലേക്ക് തെളിവില്ലാതെ പൊതുവാക്കരുത്

#### Daily quotes/dashboard

**Laravel-ൽ:** Auth/data shape legacy-നോട് വ്യത്യാസമുണ്ടാകാം

**Express-ൽ:** Protected routes; token student fallback

**ചെയ്യേണ്ടത്:** Intentional access changes frontend-ൽ verify ചെയ്യുക


Zod objects default ആയി unknown keys strip ചെയ്യാം. അതിനാൽ HTTP 200 കിട്ടിയാലും അയച്ച field persist ആയി എന്ന് കരുതരുത്. DTO → use case → repository → response മുഴുവൻ പരിശോധിക്കണം.

</details>

<a id="express-keys"></a>

### 7.2 നിലവിലെ Express APIs — നിർബന്ധമായും അയയ്ക്കേണ്ട keys

**B (Body)** = request-നൊപ്പം അയയ്ക്കുന്ന JSON/form data. **Q (Query)** = URL-ൽ `?`-നു ശേഷം വരുന്ന values. **P (Parameter)** = URL path-ലെ `:id` പോലുള്ള ഭാഗം.

ഇത് **ഇപ്പോഴത്തെ implementation സ്വീകരിക്കുന്ന contract** ആണ്; സുരക്ഷിതമായ അന്തിമ design എന്ന അർത്ഥമില്ല. `B` = JSON/form body, `Q` = query, `P` = route parameter. Route prefix സാധാരണ `/api` അല്ലെങ്കിൽ `/api/v1`; auth routes-ന് `/api/v1/auth` alias ഉണ്ട്. അക്കങ്ങൾ `z.number()` ഉള്ളിടത്ത് JSON number ആയി നൽകണം; quoted string എല്ലായിടത്തും coercion ചെയ്യില്ല.

<details>
<summary>Login, students, staff — required keys</summary>

#### POST `/student/login`

**നിർബന്ധമായത്:** B: `password`, `login` അല്ലെങ്കിൽ `email_or_username_or_mobile`

**Optional / default / ശ്രദ്ധിക്കേണ്ടത്:** `rememberMe`; token behavior വേറിട്ട് verify ചെയ്യുക

#### POST `/student/register` — auth router

**നിർബന്ധമായത്:** B: `first_name`, `last_name`, `email`, `mobile_no`, `password`, `gender`

**Optional / default / ശ്രദ്ധിക്കേണ്ടത്:** Password ≥6; gender `Male/Female/Other`; username generated

#### POST `/student/forgot-password`

**നിർബന്ധമായത്:** B: `email`

**Optional / default / ശ്രദ്ധിക്കേണ്ടത്:** Email delivery implementation ഇല്ല

#### POST `/student/reset-password` — auth router

**നിർബന്ധമായത്:** B: `token`, `password`, `password_confirmation`

**Optional / default / ശ്രദ്ധിക്കേണ്ടത്:** Password ≥8, equality required

#### POST `/student/change-password`

**നിർബന്ധമായത്:** B: `current_password`, `password`, `password_confirmation`; student token

**Optional / default / ശ്രദ്ധിക്കേണ്ടത്:** Password ≥8, equality required

#### POST `/staff/login`, `/institution-user/login`

**നിർബന്ധമായത്:** B: `password`, `login` അല്ലെങ്കിൽ `email_or_username`

**Optional / default / ശ്രദ്ധിക്കേണ്ടത്:** `rememberMe` optional

#### GET `/student/profile`, `/staff/profile`, `/institution-user/profile`

**നിർബന്ധമായത്:** Appropriate bearer token

**Optional / default / ശ്രദ്ധിക്കേണ്ടത്:** Body keys ഇല്ല

#### POST `/students`, `/students/register`

**നിർബന്ധമായത്:** B: `first_name`, `last_name`, `email`, `username`, `password`

**Optional / default / ശ്രദ്ധിക്കേണ്ടത്:** Gender default `Male`; mobile default `0000000000`; confirmation optional, equality rule ഇല്ല

#### PUT `/students/:id`

**നിർബന്ധമായത്:** P: `id`; staff token

**Optional / default / ശ്രദ്ധിക്കേണ്ടത്:** Profile fields optional; `email`, `paid_amount`, `special_category_id`, sales fields supported

#### POST `/student/update-profile`

**നിർബന്ധമായത്:** B: `student_id`; student token

**Optional / default / ശ്രദ്ധിക്കേണ്ടത്:** Own identity check + optional profile fields

#### POST `/student/update-profile-image`

**നിർബന്ധമായത്:** B: `student_id`; multipart file `image`; student token

**Optional / default / ശ്രദ്ധിക്കേണ്ടത്:** Body ID token student ID-യുമായി match ചെയ്യണം

#### POST `/students/reset-password`

**നിർബന്ധമായത്:** B: `student_id`, `new_password`, `confirm_password`

**Optional / default / ശ്രദ്ധിക്കേണ്ടത്:** `reseted_by` optional; **SEC-01/15**

#### POST `/students/block`

**നിർബന്ധമായത്:** B: `student_id`, `reason_id`

**Optional / default / ശ്രദ്ധിക്കേണ്ടത്:** `description` optional

#### POST `/students/unblock`, `/students/undrop`

**നിർബന്ധമായത്:** B: `student_id`

**Optional / default / ശ്രദ്ധിക്കേണ്ടത്:** Staff token

#### POST `/students/drop`

**നിർബന്ധമായത്:** B: `student_id`

**Optional / default / ശ്രദ്ധിക്കേണ്ടത്:** `reason` optional

#### POST `/students/unblock-modules`

**നിർബന്ധമായത്:** B: `student_id`, `student_section_id`

**Optional / default / ശ്രദ്ധിക്കേണ്ടത്:** Staff scope validation വേണം

#### POST `/students/login-status`

**നിർബന്ധമായത്:** B: `student_id`; authenticated user

**Optional / default / ശ്രദ്ധിക്കേണ്ടത്:** `login_type=login/logout`, `login_status=active/inactive` optional; require-at-least-one schema rule ഇല്ല

#### DELETE `/student/:id`, `/students/:id`

**നിർബന്ധമായത്:** P: `id`; staff token

**Optional / default / ശ്രദ്ധിക്കേണ്ടത്:** Same router aliases

#### GET `/students`

**നിർബന്ധമായത്:** Staff token

**Optional / default / ശ്രദ്ധിക്കേണ്ടത്:** Q: `page` default1, `per_page` default15/max100, keyword/status/location/login_status; മറ്റു accepted filters FUN-08

#### POST `/institution-users`

**നിർബന്ധമായത്:** B: `role_id`, `first_name`, `last_name`, `email`, `username`, `password`; staff token

**Optional / default / ശ്രദ്ധിക്കേണ്ടത്:** Gender default; profile/contact fields optional; file `profile_pic` optional

#### GET `/institution-users/by-role`

**നിർബന്ധമായത്:** Q: `role`; staff token

**Optional / default / ശ്രദ്ധിക്കേണ്ടത്:** Role name string; arbitrary role-ID contract assume ചെയ്യരുത്

#### GET `/institution-users`

**നിർബന്ധമായത്:** Staff token

**Optional / default / ശ്രദ്ധിക്കേണ്ടത്:** Q: `role_id`, `status` optional

#### GET `/institution-roles/active`, `/institution-role/permissions`

**നിർബന്ധമായത്:** Staff token

**Optional / default / ശ്രദ്ധിക്കേണ്ടത്:** Permission response enforcement-ന്റെ പകരമല്ല


Optional student profile fields: `first_name`, `last_name`, `gender`, `date_of_birth`, `mobile_no`, `alternate_mobile_no`, `parent_mobile_no`, `parent_name`, `address`, `location`, `pincode`, `state`, `email`, `qualification`. Staff-managed create/update-ൽ `special_category_id`, `sales_person_name`, `sales_person_phone`, `paid_amount` കൂടി ഉണ്ട്. Date/length/nonnegative validation ചില fields-ൽ അപൂർണ്ണമാണ്.

തെളിവുകൾ: [auth DTO](src/modules/auth/application/dto/StudentAuthDTO.ts), [staff DTO](src/modules/auth/application/dto/StaffAuthDTO.ts), [student DTO](src/modules/students/application/dto/StudentDTO.ts), [user DTO](src/modules/users/application/dto/InstitutionUserDTO.ts).

</details>


<details>
<summary>Curriculum, batch, enrollment, extension — required keys</summary>

#### POST `/programs`

**നിർബന്ധമായത്:** B: `name`

**Optional / default / ശ്രദ്ധിക്കേണ്ടത്:** `code`, language, description, status; files `icon`, `cover_image`

#### POST `/programs/clone`

**നിർബന്ധമായത്:** B: `program_id`

**Optional / default / ശ്രദ്ധിക്കേണ്ടത്:** Staff token

#### PUT/POST `/programs/:id`

**നിർബന്ധമായത്:** P: `id`

**Optional / default / ശ്രദ്ധിക്കേണ്ടത്:** Name/code/language/description/status and files optional

#### POST `/sections`

**നിർബന്ധമായത്:** B: `program_id`, `name`

**Optional / default / ശ്രദ്ധിക്കേണ്ടത്:** Code, duration, duration_in_months, amount, priority, is_demo, status, description; image files

#### PUT `/sections/:id`, POST `/sections/:id/update`

**നിർബന്ധമായത്:** P: `id`

**Optional / default / ശ്രദ്ധിക്കേണ്ടത്:** Create fields optional; `position` ഇല്ല

#### POST `/modules`

**നിർബന്ധമായത്:** B: numeric `section_id`, `name`

**Optional / default / ശ്രദ്ധിക്കേണ്ടത്:** `description`, `order`; create schema-യിൽ `status` ഇല്ല

#### PUT `/modules/:id`

**നിർബന്ധമായത്:** P: `id`

**Optional / default / ശ്രദ്ധിക്കേണ്ടത്:** `name`, `description`, `order`, `status=Active/Inactive`; `priority` ഇല്ല

#### POST `/topics`

**നിർബന്ധമായത്:** B: `module_id`, `name`, `type`

**Optional / default / ശ്രദ്ധിക്കേണ്ടത്:** file_url/content_url, day_count, priority/order, status, assessments, cover image

#### PUT `/topics/:id`, POST `/topics/:id/update`

**നിർബന്ധമായത്:** P: `id`

**Optional / default / ശ്രദ്ധിക്കേണ്ടത്:** Topic fields optional; nested assessments validation strengthen ചെയ്യണം

#### POST `/special-categories`

**നിർബന്ധമായത്:** B: `name`

**Optional / default / ശ്രദ്ധിക്കേണ്ടത്:** Description optional

#### PUT `/special-categories/:id`, POST `/special-categories/:id/update`

**നിർബന്ധമായത്:** P: `id`

**Optional / default / ശ്രദ്ധിക്കേണ്ടത്:** Name/description/status optional

#### POST `/program-section-batches`

**നിർബന്ധമായത്:** B: numeric `section_id`, `batch_name`

**Optional / default / ശ്രദ്ധിക്കേണ്ടത്:** tutor_id, qa_id, placement_officer_id, start_date, end_date

#### POST `/student-sections`

**നിർബന്ധമായത്:** B: numeric `student_id`, `batch_id`

**Optional / default / ശ്രദ്ധിക്കേണ്ടത്:** start_date, end_date

#### PUT `/student-sections/:id`

**നിർബന്ധമായത്:** P: `id`

**Optional / default / ശ്രദ്ധിക്കേണ്ടത്:** start_date, end_date, status, progress_percent 0–100

#### POST `/program-extensions`

**നിർബന്ധമായത്:** B: numeric `student_section_id`, `reason`, `extension_months`

**Optional / default / ശ്രദ്ധിക്കേണ്ടത്:** Reason 5–2000 chars; months integer1–12; നിലവിൽ staff-only

#### PUT `/program-extensions/:id`

**നിർബന്ധമായത്:** P: `id`; B: `status`

**Optional / default / ശ്രദ്ധിക്കേണ്ടത്:** `Approved` അല്ലെങ്കിൽ `Rejected`

#### GET `/student/my-batch/:batchId/modules`

**നിർബന്ധമായത്:** P: `batchId`; student token

**Optional / default / ശ്രദ്ധിക്കേണ്ടത്:** Student batch association verify ചെയ്യണം


List query keys: programs `status/language/code/name`; sections `program_id/status`; modules `section_id/status`; topics `module_id/type/status`; categories `status`; batches `section_id/status`; enrollments `batch_id/student_id/status`; extensions `student_section_id/status`. Schema definition ഉണ്ട് എന്നത് query എല്ലാ നിലയിലും സുരക്ഷിതമാണെന്നല്ല.

തെളിവുകൾ: [curriculum DTO directory](src/modules/curriculum/application/dto), [batch DTO directory](src/modules/batch/application/dto), [batch routes](src/modules/batch/presentation/routes/batchRoutes.ts).

</details>


<details>
<summary>Progress, assessment, fees, leaves, notifications — required keys</summary>

#### POST `/student-section-topics/complete`

**നിർബന്ധമായത്:** B: `student_topic_id`; student token

**Optional / default / ശ്രദ്ധിക്കേണ്ടത്:** Ownership gap SEC-06

#### POST `/student-sections/request-unlock-next-module`

**നിർബന്ധമായത്:** B: `student_id`, `section_id`, `next_module_id`

**Optional / default / ശ്രദ്ധിക്കേണ്ടത്:** നിലവിൽ public; SEC-02

#### POST `/student-sections/approve-module-unlock`

**നിർബന്ധമായത്:** B: `student_id`, `section_id`, `student_section_id`, `module_id`

**Optional / default / ശ്രദ്ധിക്കേണ്ടത്:** Staff token; IDs തമ്മിലുള്ള ബന്ധം enforce ചെയ്യണം

#### POST `/student-sections/complete-course`

**നിർബന്ധമായത്:** B: `student_section_id`

**Optional / default / ശ്രദ്ധിക്കേണ്ടത്:** Staff token; legacy keys വ്യത്യസ്തം

#### POST `/performances`

**നിർബന്ധമായത്:** B: `student_section_module_id`, `performance`

**Optional / default / ശ്രദ്ധിക്കേണ്ടത്:** Rating `excellent/good/average/needs_improvement`; description optional

#### GET `/students/completed-modules`

**നിർബന്ധമായത്:** Q: controller ഉപയോഗിക്കുന്ന `student_id`

**Optional / default / ശ്രദ്ധിക്കേണ്ടത്:** `student_section_id` optional; strict schema wiring അപൂർണ്ണം

#### POST `/student-sections/assessment-answers`

**നിർബന്ധമായത്:** B: nonempty `answers[]`; each: numeric `student_id`, `student_topic_id`, `topic_id`, `assessment_id`, `answer` string

**Optional / default / ശ്രദ്ധിക്കേണ്ടത്:** `marks` boolean optional; student-ൽ നിന്ന് വിശ്വസിക്കരുത്

#### GET `/student/assessment-answers`

**നിർബന്ധമായത്:** Q: `student_id`, `topic_id`

**Optional / default / ശ്രദ്ധിക്കേണ്ടത്:** Student-own/staff scope വേണം

#### GET `/topics/:id/assessments`

**നിർബന്ധമായത്:** P: positive `id`; authenticated user

**Optional / default / ശ്രദ്ധിക്കേണ്ടത്:** Curriculum middleware shadowing FUN-15

#### POST `/fee-collections`

**നിർബന്ധമായത്:** B: numeric `student_id`, nonempty `installments[]`; each: `installment_no`, `fee_amount`, `due_date`

**Optional / default / ശ്രദ്ധിക്കേണ്ടത്:** student_section_id, total_fee_amount, created_by optional

#### POST `/fee-collections/collect`

**നിർബന്ധമായത്:** B: `fee_id` അല്ലെങ്കിൽ `fee_collection_id`; `collected_amount` അല്ലെങ്കിൽ `paid_amount`

**Optional / default / ശ്രദ്ധിക്കേണ്ടത്:** Positive numeric values; collected_by optional

#### POST `/fee-collections/approve`

**നിർബന്ധമായത്:** B: fee ID alias; `auth_status` അല്ലെങ്കിൽ `approval_status`

**Optional / default / ശ്രദ്ധിക്കേണ്ടത്:** `approved/rejected`; auth_remark optional; Admin/Team Lead gate ഉണ്ട്

#### POST `/fee-collections/update-installment`

**നിർബന്ധമായത്:** B: fee ID alias + `fee_amount` അല്ലെങ്കിൽ `due_date`

**Optional / default / ശ്രദ്ധിക്കേണ്ടത്:** installment_no, updated_by optional

#### POST `/fee-collections/delete-installment`, `/fee-collections/cancel`

**നിർബന്ധമായത്:** B: fee ID alias

**Optional / default / ശ്രദ്ധിക്കേണ്ടത്:** Audit-related optional fields ഉണ്ട്; actor token-ൽ നിന്ന് derive ചെയ്യുക

#### POST `/student-leaves`

**നിർബന്ധമായത്:** B: `start_date`, `end_date`, `reason_id`; student token

**Optional / default / ശ്രദ്ധിക്കേണ്ടത്:** student_id/no_of_days/description optional; file `proof` optional

#### POST `/student-leaves/:id/authorize`

**നിർബന്ധമായത്:** P: `id`; B: `status=approved/rejected`

**Optional / default / ശ്രദ്ധിക്കേണ്ടത്:** authorization_remark optional

#### POST `/student-reports`

**നിർബന്ധമായത്:** B: `student_id`, `report_head_id`; staff token

**Optional / default / ശ്രദ്ധിക്കേണ്ടത്:** description optional

#### GET `/student/dashboard`, `/dashboard/student`

**നിർബന്ധമായത്:** Authenticated user

**Optional / default / ശ്രദ്ധിക്കേണ്ടത്:** Q student_id optional for student; staff target required by controller

#### GET `/student/notifications`

**നിർബന്ധമായത്:** Authenticated user

**Optional / default / ശ്രദ്ധിക്കേണ്ടത്:** Q student_id optional for student; target authorization policy വേണം

#### POST `/student/notifications/mark-viewed`

**നിർബന്ധമായത്:** Authenticated user

**Optional / default / ശ്രദ്ധിക്കേണ്ടത്:** B student_id optional for student

#### GET `/admin-notifications`, POST `/admin-notifications/mark-read`

**നിർബന്ധമായത്:** Staff token

**Optional / default / ശ്രദ്ധിക്കേണ്ടത്:** User-targeted list/mark behavior


Progress list filters: student_id, batch_id, section_id, login_status, keyword, page, per_page. Performance list filters: student_id, student_section_id, batch_id, section_id, module_id, performance, only_with_performance. ഇവയുടെ DTOs ഉണ്ടെങ്കിലും controllers എല്ലാം parse ചെയ്യുന്നില്ല. Finance date regex format മാത്രം പരിശോധിക്കുന്നു; impossible calendar dates-ക്കുള്ള check leaves DTO-ൽ ഉള്ളത്ര ശക്തമല്ല.

തെളിവുകൾ: [progress DTO](src/modules/progress/application/dto/ProgressDTO.ts), [assessment DTO](src/modules/assessment/application/dto/AssessmentDTO.ts), [finance DTO](src/modules/finance/application/dto/FeeCollectionDTO.ts), [welfare DTOs](src/modules/welfare/application/dto), [notification DTO](src/modules/notification/application/dto/NotificationDTO.ts).

</details>


<a id="legacy-keys"></a>

### 7.3 ബാക്കിയുള്ള modules — Laravel സ്വീകരിച്ചിരുന്ന keys

ഈ പട്ടിക **ഇപ്പോൾ Express-ൽ ലഭ്യമായ APIs-ന്റെ പട്ടികയല്ല**. ശേഷിക്കുന്ന ജോലികൾ ചെയ്യുമ്പോൾ പഴയ frontend/data ആവശ്യങ്ങൾ മനസ്സിലാക്കാനുള്ള reference ആണ്.

<details>
<summary>ബാക്കിയുള്ള features-ന്റെ required / optional keys തുറക്കുക</summary>

ഇവ Laravel source-ൽ കണ്ട keys ആണ്; Express-ൽ ഇതിനകം supported എന്ന് അർത്ഥമില്ല. Audit actor keys (`created_by`, `updated_by`, `auth_by`, `assigned_by`, `replied_by`, `closed_by`) legacy-ൽ required ആണെങ്കിലും പുതിയ backend authenticated identity/time ഉപയോഗിക്കണം. താഴെ primary required fields-ഉം പ്രധാന optional fields-ഉം നൽകിയിരിക്കുന്നു; dynamic validation/business checks implementation സമയത്ത് വീണ്ടും പരിശോധിക്കണം.

#### Staff update/delete

**Laravel-ൽ നിർബന്ധമായത്:** P staff `id`

**Optional / പ്രത്യേക സാഹചര്യങ്ങളിൽ വേണ്ടത്:** Update: role_id, names, contact/profile, username/email/password/status; deletion requires authorization

#### Staff password reset

**Laravel-ൽ നിർബന്ധമായത്:** Registered target method `InstitutionUserController.resetPassword` source-ൽ ഇല്ല

**Optional / പ്രത്യേക സാഹചര്യങ്ങളിൽ വേണ്ടത്:** Working request contract സ്ഥിരീകരിക്കാനാവില്ല; വേറൊരു controller-ലെ helper signature copy ചെയ്യരുത്

#### Section clone

**Laravel-ൽ നിർബന്ധമായത്:** `section_id`

**Optional / പ്രത്യേക സാഹചര്യങ്ങളിൽ വേണ്ടത്:** Section/module/topic deep-copy rules

#### Topic reorder

**Laravel-ൽ നിർബന്ധമായത്:** P topic `id`; `priority` integer≥1

**Optional / പ്രത്യേക സാഹചര്യങ്ങളിൽ വേണ്ടത്:** Same-module ordering policy

#### Student export

**Laravel-ൽ നിർബന്ധമായത്:** Required body filter ഇല്ല

**Optional / പ്രത്യേക സാഹചര്യങ്ങളിൽ വേണ്ടത്:** `filters` object അല്ലെങ്കിൽ flat status/batch_name/program_name/login_status/completion_start/completion_end/keyword/location

#### Export download

**Laravel-ൽ നിർബന്ധമായത്:** Q `file_name`; valid temporary signed URL

**Optional / പ്രത്യേക സാഹചര്യങ്ങളിൽ വേണ്ടത്:** Generated `expires`/`signature`; filename pattern validation

#### Student details / section list

**Laravel-ൽ നിർബന്ധമായത്:** `student_id`

**Optional / പ്രത്യേക സാഹചര്യങ്ങളിൽ വേണ്ടത്:** Authorized actor scope

#### Student section details

**Laravel-ൽ നിർബന്ധമായത്:** `student_id`, `section_id`

**Optional / പ്രത്യേക സാഹചര്യങ്ങളിൽ വേണ്ടത്:** Full curriculum/progress response ആവശ്യമാണ്

#### Assign section

**Laravel-ൽ നിർബന്ധമായത്:** `student_id`, `section_id`, `batch_id`, `status`

**Optional / പ്രത്യേക സാഹചര്യങ്ങളിൽ വേണ്ടത്:** expected_start_date, expected_end_date

#### Batch students / section students

**Laravel-ൽ നിർബന്ധമായത്:** `batch_id` / `section_id`

**Optional / പ്രത്യേക സാഹചര്യങ്ങളിൽ വേണ്ടത്:** Pagination/filter contract verify ചെയ്യുക

#### Expected-end-date update

**Laravel-ൽ നിർബന്ധമായത്:** `student_section_id`, `expected_end_date`

**Optional / പ്രത്യേക സാഹചര്യങ്ങളിൽ വേണ്ടത്:** Date/ownership policy

#### Self placement

**Laravel-ൽ നിർബന്ധമായത്:** `student_id`, `self_placed=yes/no`, legacy `updated_by`, `updated_at`

**Optional / പ്രത്യേക സാഹചര്യങ്ങളിൽ വേണ്ടത്:** Server-generated audit fields ആക്കണം

#### Mentors

**Laravel-ൽ നിർബന്ധമായത്:** `student_id`

**Optional / പ്രത്യേക സാഹചര്യങ്ങളിൽ വേണ്ടത്:** Assigned mentor scope

#### CV upload

**Laravel-ൽ നിർബന്ധമായത്:** P student `id`; multipart `file`

**Optional / പ്രത്യേക സാഹചര്യങ്ങളിൽ വേണ്ടത്:** pdf/doc/docx; legacy max5MB; `cv_file` അല്ല

#### Ticket create

**Laravel-ൽ നിർബന്ധമായത്:** `student_id`, `title`, `description`

**Optional / പ്രത്യേക സാഹചര്യങ്ങളിൽ വേണ്ടത്:** `attachments[]`, max5

#### Ticket assign

**Laravel-ൽ നിർബന്ധമായത്:** P ticket `id`; `forwarded_to`, legacy `assigned_by`

**Optional / പ്രത്യേക സാഹചര്യങ്ങളിൽ വേണ്ടത്:** Target staff validity

#### Ticket reply

**Laravel-ൽ നിർബന്ധമായത്:** P ticket `id`; `replied_comment`, legacy `replied_by`

**Optional / പ്രത്യേക സാഹചര്യങ്ങളിൽ വേണ്ടത്:** reply_attachment1/2/3

#### Ticket close

**Laravel-ൽ നിർബന്ധമായത്:** `ticket_id`, legacy `closed_by`

**Optional / പ്രത്യേക സാഹചര്യങ്ങളിൽ വേണ്ടത്:** Valid transition

#### Extension create

**Laravel-ൽ നിർബന്ധമായത്:** `batch_id`; student token

**Optional / പ്രത്യേക സാഹചര്യങ്ങളിൽ വേണ്ടത്:** Student ID token-ൽ നിന്ന്

#### Extension status

**Laravel-ൽ നിർബന്ധമായത്:** P `id`; `status=accepted/rejected/completed`

**Optional / പ്രത്യേക സാഹചര്യങ്ങളിൽ വേണ്ടത്:** Staff authorization

#### Certificate create

**Laravel-ൽ നിർബന്ധമായത്:** `student_section_id`, `certificate_type_id`

**Optional / പ്രത്യേക സാഹചര്യങ്ങളിൽ വേണ്ടത്:** start_date, end_date, is_placement_needed

#### Certificate generate/file

**Laravel-ൽ നിർബന്ധമായത്:** P certificate `id`

**Optional / പ്രത്യേക സാഹചര്യങ്ങളിൽ വേണ്ടത്:** PDF/assets availability

#### Certificate email

**Laravel-ൽ നിർബന്ധമായത്:** `certificate_id`

**Optional / പ്രത്യേക സാഹചര്യങ്ങളിൽ വേണ്ടത്:** `message` optional

#### Placement feedback

**Laravel-ൽ നിർബന്ധമായത്:** `student_id`, `student_section_id`, `placement_type_id`

**Optional / പ്രത്യേക സാഹചര്യങ്ങളിൽ വേണ്ടത്:** `feedback` optional max5000

#### Placement feedback list

**Laravel-ൽ നിർബന്ധമായത്:** `student_section_id` via route/query as supported

**Optional / പ്രത്യേക സാഹചര്യങ്ങളിൽ വേണ്ടത്:** Group by placement type

#### Placement email

**Laravel-ൽ നിർബന്ധമായത്:** `placement_id`

**Optional / പ്രത്യേക സാഹചര്യങ്ങളിൽ വേണ്ടത്:** Email template and timestamps

#### Company create

**Laravel-ൽ നിർബന്ധമായത്:** `name`

**Optional / പ്രത്യേക സാഹചര്യങ്ങളിൽ വേണ്ടത്:** `no_of_vaccancies`, `intership_program`, date/contact/email/location/salary/job description/status

#### Company approval

**Laravel-ൽ നിർബന്ധമായത്:** `record_id`, `auth_status`, legacy `auth_by`, `auth_at`

**Optional / പ്രത്യേക സാഹചര്യങ്ങളിൽ വേണ്ടത്:** pending/approved/rejected

#### Assign student to company

**Laravel-ൽ നിർബന്ധമായത്:** `record_id`, `student_id`

**Optional / പ്രത്യേക സാഹചര്യങ്ങളിൽ വേണ്ടത്:** `remark`, status

#### Interview status

**Laravel-ൽ നിർബന്ധമായത്:** `record_id`, `status`, legacy `updated_by`

**Optional / പ്രത്യേക സാഹചര്യങ്ങളിൽ വേണ്ടത്:** `order=first/second/third`, interview_date, remarks

#### Company update/delete

**Laravel-ൽ നിർബന്ധമായത്:** `record_id`; delete also legacy updated_by

**Optional / പ്രത്യേക സാഹചര്യങ്ങളിൽ വേണ്ടത്:** Update company fields optional

#### Placement detail fetch

**Laravel-ൽ നിർബന്ധമായത്:** `placement_company_id`

**Optional / പ്രത്യേക സാഹചര്യങ്ങളിൽ വേണ്ടത്:** Scope checks

#### Placement officer students

**Laravel-ൽ നിർബന്ധമായത്:** `placement_officer_id`

**Optional / പ്രത്യേക സാഹചര്യങ്ങളിൽ വേണ്ടത്:** quality_analyst_id, batch_id

#### Live class create

**Laravel-ൽ നിർബന്ധമായത്:** `topic`, `start_datetime`, `end_datetime`, `duration`

**Optional / പ്രത്യേക സാഹചര്യങ്ങളിൽ വേണ്ടത്:** section_id, zoom_account_id, student_ids[]

#### Staff live-class list

**Laravel-ൽ നിർബന്ധമായത്:** `type=day/month`

**Optional / പ്രത്യേക സാഹചര്യങ്ങളിൽ വേണ്ടത്:** day mode: `day`; month mode: `month`, `year` required

#### Student live-class list

**Laravel-ൽ നിർബന്ധമായത്:** Student token

**Optional / പ്രത്യേക സാഹചര്യങ്ങളിൽ വേണ്ടത്:** type optional; selected mode's date fields conditional

#### Zoom signature

**Laravel-ൽ നിർബന്ധമായത്:** `meetingNumber`

**Optional / പ്രത്യേക സാഹചര്യങ്ങളിൽ വേണ്ടത്:** Staff request role0/1; student attendee only policy

#### Addon course create

**Laravel-ൽ നിർബന്ധമായത്:** `name`

**Optional / പ്രത്യേക സാഹചര്യങ്ങളിൽ വേണ്ടത്:** description, icon, cover_image, status

#### Addon add videos

**Laravel-ൽ നിർബന്ധമായത്:** `videos[]`; each `title`, `dyntube_video_id`

**Optional / പ്രത്യേക സാഹചര്യങ്ങളിൽ വേണ്ടത്:** description, thumbnail, duration, priority, status

#### Addon sync update

**Laravel-ൽ നിർബന്ധമായത്:** P course id; videos optional

**Optional / പ്രത്യേക സാഹചര്യങ്ങളിൽ വേണ്ടത്:** Supplied video items require title/dyntube_video_id; removed-video behavior verify ചെയ്യുക

#### Addon completion

**Laravel-ൽ നിർബന്ധമായത്:** `student_id`, `addon_course_id`, `addon_course_video_id`

**Optional / പ്രത്യേക സാഹചര്യങ്ങളിൽ വേണ്ടത്:** Ownership and enrollment

#### DynTube batch

**Laravel-ൽ നിർബന്ധമായത്:** `video_ids[]` length1–50

**Optional / പ്രത്യേക സാഹചര്യങ്ങളിൽ വേണ്ടത്:** Each ID string1–100 chars

#### DynTube details/play

**Laravel-ൽ നിർബന്ധമായത്:** P `videoId`

**Optional / പ്രത്യേക സാഹചര്യങ്ങളിൽ വേണ്ടത്:** quality auto/360p/480p/720p/1080p/1440p/2160p

#### Chat exchange

**Laravel-ൽ നിർബന്ധമായത്:** `accessToken`

**Optional / പ്രത്യേക സാഹചര്യങ്ങളിൽ വേണ്ടത്:** Single-use, expiry

#### Chat read messages

**Laravel-ൽ നിർബന്ധമായത്:** Q `conversationId`

**Optional / പ്രത്യേക സാഹചര്യങ്ങളിൽ വേണ്ടത്:** `limit`1–100, `beforeId`

#### Chat send

**Laravel-ൽ നിർബന്ധമായത്:** `conversationId`, `body` max5000

**Optional / പ്രത്യേക സാഹചര്യങ്ങളിൽ വേണ്ടത്:** `clientMessageId`; idempotency

#### Chat mark read

**Laravel-ൽ നിർബന്ധമായത്:** P `conversationId`; token

**Optional / പ്രത്യേക സാഹചര്യങ്ങളിൽ വേണ്ടത്:** Conversation participation

#### S3 upload URL

**Laravel-ൽ നിർബന്ധമായത്:** `file_name`

**Optional / പ്രത്യേക സാഹചര്യങ്ങളിൽ വേണ്ടത്:** `folder`, `content_type`

#### S3 download URL

**Laravel-ൽ നിർബന്ധമായത്:** `key`

**Optional / പ്രത്യേക സാഹചര്യങ്ങളിൽ വേണ്ടത്:** Object ownership/existence

#### Poster create

**Laravel-ൽ നിർബന്ധമായത്:** `title`

**Optional / പ്രത്യേക സാഹചര്യങ്ങളിൽ വേണ്ടത്:** start_date, end_date, image, status

#### Suggestion create

**Laravel-ൽ നിർബന്ധമായത്:** `suggesstion`

**Optional / പ്രത്യേക സാഹചര്യങ്ങളിൽ വേണ്ടത്:** Legacy spelling preserve/map; authenticated student

#### Suggestion status

**Laravel-ൽ നിർബന്ധമായത്:** `suggestion_id`, legacy `user_id`, `status`

**Optional / പ്രത്യേക സാഹചര്യങ്ങളിൽ വേണ്ടത്:** new/accepted/rejected/completed

#### Custom email

**Laravel-ൽ നിർബന്ധമായത്:** `subject`, `body`; recipient `to` അല്ലെങ്കിൽ `student_id` workflow-ൽ വേണം

**Optional / പ്രത്യേക സാഹചര്യങ്ങളിൽ വേണ്ടത്:** `attachments[]`, ഓരോ file legacy10MB

#### Log view

**Laravel-ൽ നിർബന്ധമായത്:** Q `filename`

**Optional / പ്രത്യേക സാഹചര്യങ്ങളിൽ വേണ്ടത്:** New implementation-ൽ strict allowlist + admin authorization; legacy traversal behavior ഒഴിവാക്കുക


Source: [Laravel API controllers](../knovista-web-api/app/Http/Controllers/Api). `no_of_vaccancies`, `intership_program`, `suggesstion`, `reseted_by` എന്നിവ source-ലുള്ള spelling ആണ്; silently rename ചെയ്യുന്നത് compatibility തകർക്കാം.

</details>

<a id="database"></a>

### 7.4 Database — ഇല്ലാത്ത tables, columns, മാറിയ fields

**Prisma schema** application പ്രതീക്ഷിക്കുന്ന database ഘടനയാണ്. **SQL baseline** ആ ഘടന സൃഷ്ടിക്കാനുള്ള checked-in SQL ആണ്. രണ്ടും തമ്മിൽ പൊരുത്തപ്പെടാത്ത ഭാഗങ്ങളാണ് ആദ്യം കൊടുത്തിരിക്കുന്നത്.

<details>
<summary>SQL baseline-ൽ ഇല്ലാത്ത 9 Prisma tables</summary>

`daily_quotes`, `leave_reasons`, `student_block_histories`, `student_block_reasons`, `student_drop_histories`, `student_leaves`, `student_notifications`, `student_report_heads`, `student_reports`.

ഇവയ്ക്ക് schema-യിൽ models ഉണ്ട്; checked-in baseline-ൽ CREATE TABLE ഇല്ല. Production-ൽ manual/db-push changes ഉണ്ടായിട്ടുണ്ടോ എന്നത് പരിശോധിച്ചിട്ടില്ല.

</details>


<details>
<summary>നിലവിലെ baseline tables-ൽ കാണാത്ത columns</summary>

#### programs

**Baseline-ൽ കാണാത്ത columns:** `code`, `cover_image`, `icon`, `language`

#### sections

**Baseline-ൽ കാണാത്ത columns:** `amount`, `code`, `cover_image`, `duration`, `icon`, `is_demo`, `priority`

#### topics

**Baseline-ൽ കാണാത്ത columns:** `cover_image`, `day_count`, `file_url`, `priority`


അതിനാൽ clean database-ൽ checked-in migrations മാത്രം apply ചെയ്താൽ current Prisma code പ്രവർത്തിക്കുമെന്ന് കരുതാനാവില്ല. Table/column presence comparison മാത്രമാണ് ഇവിടെ ചെയ്തത്; types/indexes/constraints-ന്റെ സമ്പൂർണ്ണ runtime parity ഇനിയും പരിശോധിക്കണം.

</details>


<details>
<summary>Laravel business tables — Prisma model ഇല്ലാത്തവ</summary>

#### RBAC

**Tables:** `app_forms`, `institution_role_permissions`

#### Certificates

**Tables:** `certificate_types`, `student_section_certificates`

#### Placement

**Tables:** `placement_types`, `student_section_placements`, `student_section_placement_feedbacks`, `placement_company`, `placement_details`

#### Welfare/feed

**Tables:** `student_tickets`, `suggessions`, `posters`

#### Extension

**Tables:** `student_extension_requests`; Express-ൽ വേറിട്ട `program_extensions`

#### Zoom/classes

**Tables:** `zoom_accounts`, `live_classes`, `live_class_details`

#### Chat

**Tables:** `chat_access_tokens`, `chat_conversations`, `chat_messages`

#### Addon

**Tables:** `addon_courses`, `addon_course_videos`, `student_addon_courses`, `student_addon_course_videos`

#### WhatsApp

**Tables:** `whatsapp_messages`


Framework-related tables: `users`, `password_reset_tokens`-ന്റെ പഴയ structure, `sessions`, `cache`, `cache_locks`, `jobs`, `job_batches`, `failed_jobs`, `personal_access_tokens`. `password_reset_tokens` Express-ൽ ഉണ്ട് പക്ഷേ structure മാറിയിരിക്കുന്നു. മറ്റു framework tables എല്ലാം Node-ലേക്ക് അതേപടി copy ചെയ്യേണ്ടതില്ല; queue/cache/auth replacement, പഴയ foreign-key references എന്നിവയ്ക്കുള്ള പദ്ധതി വേണം.

</details>


<details>
<summary>നിലവിലെ models-ൽ നഷ്ടപ്പെട്ടതും പേര് മാറിയതുമായ fields</summary>

#### sections

**Laravel field / semantics:** `position`

**Express സ്ഥിതി / ആവശ്യമായ mapping:** Missing; certificate/offer-letter role text preserve ചെയ്യണം

#### sections

**Laravel field / semantics:** Integer `duration`; mandatory amount/code semantics

**Express സ്ഥിതി / ആവശ്യമായ mapping:** String duration + optional duration_in_months/amount/code; authoritative representation തീരുമാനിക്കുക

#### modules

**Laravel field / semantics:** `priority`

**Express സ്ഥിതി / ആവശ്യമായ mapping:** `order`; explicit column/data mapping ഇല്ല

#### program_section_batches

**Laravel field / semantics:** `program_id`, `no_of_interns`, `batch_type`

**Express സ്ഥിതി / ആവശ്യമായ mapping:** Missing

#### program_section_batches

**Laravel field / semantics:** `name`, `quality_analyst_id`, `batch_start_date`, `batch_end_date`

**Express സ്ഥിതി / ആവശ്യമായ mapping:** `batch_name`, `qa_id`, `start_date`, `end_date`

#### student_sections

**Laravel field / semantics:** Direct `section_id`

**Express സ്ഥിതി / ആവശ്യമായ mapping:** Missing; batch relation വഴി മാത്രം section resolve ചെയ്യുന്നു; nullable/unbatched legacy data ശ്രദ്ധിക്കുക

#### student_sections

**Laravel field / semantics:** `expected_start_date`, `expected_end_date`, `actual_start_date`, `actual_end_date`

**Express സ്ഥിതി / ആവശ്യമായ mapping:** `start_date`, `end_date` മാത്രം; നാലു meanings നഷ്ടപ്പെടരുത്

#### student_sections

**Laravel field / semantics:** `update_by`

**Express സ്ഥിതി / ആവശ്യമായ mapping:** `updated_by`; data mapping വേണം

#### student_sections

**Laravel field / semantics:** Boolean `self_placed`

**Express സ്ഥിതി / ആവശ്യമായ mapping:** Nullable string; boolean ↔ yes/no mapping വേണം

#### student_sections

**Laravel field / semantics:** WhatsApp automation flags

**Express സ്ഥിതി / ആവശ്യമായ mapping:** താഴെ പറയുന്ന 11 fields missing

#### student_section_modules

**Laravel field / semantics:** `created_by`

**Express സ്ഥിതി / ആവശ്യമായ mapping:** Missing

#### student_section_modules

**Laravel field / semantics:** Required `student_id`, old state enum

**Express സ്ഥിതി / ആവശ്യമായ mapping:** Nullable student_id; new states/score fields; initialization/mapping വേണം

#### student_block_histories

**Laravel field / semantics:** `block_reason_id`

**Express സ്ഥിതി / ആവശ്യമായ mapping:** `reason_id`; rename mapping വേണം

#### student_block_histories

**Laravel field / semantics:** `blocked_at`, `unblocked_at`

**Express സ്ഥിതി / ആവശ്യമായ mapping:** Missing; created_at/updated_at ഒരേ audit meaning അല്ല

#### student_drop_histories

**Laravel field / semantics:** `droped_by`, `droped_at`, `undroped_by`, `undroped_at`, `status`

**Express സ്ഥിതി / ആവശ്യമായ mapping:** Only `dropped_by` + generic timestamps; restore/history information നഷ്ടപ്പെടാം

#### student_extension_requests

**Laravel field / semantics:** student_id, batch_id, status, updated_by

**Express സ്ഥിതി / ആവശ്യമായ mapping:** New table: student_section_id, requested_by, reason, extension_months, reviewed_by/at; migration transformation വേണം

#### topic_assessments

**Laravel field / semantics:** `answer` JSON, legacy status representation

**Express സ്ഥിതി / ആവശ്യമായ mapping:** answer + correct_answer string + marks; canonical answer/status mapping വേണം

#### password_reset_tokens

**Laravel field / semantics:** Laravel email PK, token, created_at

**Express സ്ഥിതി / ആവശ്യമായ mapping:** Express id PK, email, unique token, guard, expires_at; incompatible baseline

#### student_topic_assessment_answers

**Laravel field / semantics:** Student/topic/student-topic foreign keys

**Express സ്ഥിതി / ആവശ്യമായ mapping:** Prisma-യിൽ explicit relation topic_assessment-ന് മാത്രം; മറ്റു FK parity പരിശോധിക്കുക

#### fee_collections

**Laravel field / semantics:** Student/section/staff foreign keys

**Express സ്ഥിതി / ആവശ്യമായ mapping:** Scalar IDs ഉണ്ട്; corresponding Prisma relations ഇല്ല; integrity constraints verify ചെയ്യണം


Missing WhatsApp flags:

```text
term_condition_fun_sent
internship_60_percent_resume_update_sent
internship_90_percent_communication_training_sent
internship_100_percent_completion_sent
placement_journey_welcome_sent
placement_terms_confirmation_sent
internship_switching_check_new_sent
placement_team_followup_day_45_sent
internship_50_percent_sent
internship_70_percent_sent
internship_85_percent_communication_training_sent
```

Additional schema risks: enum → unrestricted string changes; deleted/status casing; required → nullable changes; new composite uniqueness `[student_id,batch_id]`; BIGINT → JS Number safe-integer limits; date/timezone preservation; old public-file paths; omitted indexes/foreign keys. Data profiling ഇല്ലാതെ safe migration എന്നു പറയാനാവില്ല.

Sources: [Laravel models](../knovista-web-api/app/Models), [Laravel migrations](../knovista-web-api/database/migrations), [Prisma schema](prisma/schema.prisma). `topic_files` Express-ൽ പുതിയ table ആണ്; Laravel `Topic.file_url`-നെ അതേ table ഉണ്ടായിരുന്നെന്നു കരുതരുത്.

</details>


<a id="responses"></a>

### 7.5 API response — frontend-ന് ലഭിക്കാത്ത വിവരങ്ങൾ

<details>
<summary>Missing fields / placeholder values തുറക്കുക</summary>

#### Student login

**കണ്ടെത്തിയത്:** tokenType/expiresIn മാത്രം; Laravel token_type/expires_in പ്രതീക്ഷിക്കുന്നു

**ചെയ്യേണ്ടത്:** Aliases/contract migration

#### Student login profile

**കണ്ടെത്തിയത്:** profile_pic/date_of_birth/created_at/last_login_on hardcoded null

**ചെയ്യേണ്ടത്:** Actual stored data map ചെയ്യുക

#### Student login posters

**കണ്ടെത്തിയത്:** Empty array

**ചെയ്യേണ്ടത്:** Active date-window posters query

#### Student login intern_type

**കണ്ടെത്തിയത്:** null

**ചെയ്യേണ്ടത്:** Demo/normal enrollment classification

#### Student dashboard

**കണ്ടെത്തിയത്:** Placement percentage0, empty information_message

**ചെയ്യേണ്ടത്:** Placement/workflow-backed values

#### Student dashboard dates

**കണ്ടെത്തിയത്:** actual and expected dates ഒരേ pair-ൽ നിന്ന്

**ചെയ്യേണ്ടത്:** Separate dates preserve ചെയ്യുക

#### Student listing

**കണ്ടെത്തിയത്:** Lightweight student model; legacy detailed enrollment/performance/placement tree ഇല്ല

**ചെയ്യേണ്ടത്:** Client-used nested keys compare ചെയ്ത് mapper complete ചെയ്യുക

#### Enrollment module view

**കണ്ടെത്തിയത്:** Module view ഉണ്ട്; full student topic/files/assessment tree legacy API ഇല്ല

**ചെയ്യേണ്ടത്:** Learning page contract implement ചെയ്യുക

#### Welfare batch payload

**കണ്ടെത്തിയത്:** DTO-യിൽ batch_type ഉണ്ട്; Prisma batch-ൽ field ഇല്ല

**ചെയ്യേണ്ടത്:** Source field/data migration; null placeholder acceptance പരിശോധിക്കുക

#### Permissions

**കണ്ടെത്തിയത്:** Hardcoded strings

**ചെയ്യേണ്ടത്:** Stored permission rules and backend enforcement


Frontend screenshots/production responses ഇല്ലാതെ ഓരോ page-ക്കും ആവശ്യമായ എല്ലാ nested keys-ഉം സ്ഥിരീകരിച്ചിട്ടില്ല. ഈ പട്ടിക source-ൽ സ്ഥിരീകരിച്ച പ്രധാന gaps ആണ്; acceptance സമയത്ത് actual client calls-നോടുള്ള contract tests വേണം.

</details>

<a id="configuration"></a>

### 7.6 File uploads, environment variables, integrations

<details>
<summary>Upload file keys, limits, ശേഷിക്കുന്ന പരിശോധനകൾ</summary>

#### Student profile

**File key / പരിധി:** `image`, 2MB

**ശ്രദ്ധിക്കേണ്ടത്:** MIME allowlist ഉണ്ട്; content verification പരിശോധിക്കുക

#### Staff profile

**File key / പരിധി:** `profile_pic`, memory upload5MB

**ശ്രദ്ധിക്കേണ്ടത്:** Persistence path/controller flow verify ചെയ്യണം

#### Program

**File key / പരിധി:** `icon`, `cover_image`, ഓരോ file10MB

**ശ്രദ്ധിക്കേണ്ടത്:** Type validation gap

#### Section

**File key / പരിധി:** `icon`, `cover_image`, ഓരോ file10MB

**ശ്രദ്ധിക്കേണ്ടത്:** Type validation gap

#### Topic

**File key / പരിധി:** `cover_image`, `file_upload` അല്ലെങ്കിൽ `file`, ഓരോ file50MB

**ശ്രദ്ധിക്കേണ്ടത്:** Legacy limits വ്യത്യസ്തം; MCQ/file validation വേണം

#### Leave

**File key / പരിധി:** `proof`, 10MB

**ശ്രദ്ധിക്കേണ്ടത്:** MIME allowlist ഉണ്ട്; public storage issue

#### CV/tickets/posters/addon

**File key / പരിധി:** Express endpoints ഇല്ല

**ശ്രദ്ധിക്കേണ്ടത്:** Legacy keys [ഭാഗം 7.3-ൽ](#legacy-keys)

</details>

<details>
<summary>Environment variable പേരുകളും validation-ഉം</summary>

Actual secret values ഈ റിപ്പോർട്ടിൽ വായിച്ചോ പകർത്തിയോിട്ടില്ല. താഴെ variable names മാത്രം.

#### Startup-required

**Variable പേരുകൾ:** `DATABASE_URL`, `JWT_SECRET`

**നിലവിലെ validation / ബാക്കിയുള്ളത്:** URL nonempty; secret length≥32; connectivity/URL format separately verify

#### Runtime defaults

**Variable പേരുകൾ:** `NODE_ENV`, `PORT`, `API_PREFIX`, `TZ`, `APP_URL`, `CORS_ORIGIN`

**നിലവിലെ validation / ബാക്കിയുള്ളത്:** Numeric bounds, URL/TZ/origin validation ശക്തിപ്പെടുത്തുക

#### Token

**Variable പേരുകൾ:** `JWT_TTL`

**നിലവിലെ validation / ബാക്കിയുള്ളത്:** Express seconds; Laravel default configuration minutes; value copy ചെയ്യുമ്പോൾ conversion വേണം

#### Redis

**Variable പേരുകൾ:** `REDIS_HOST`, `REDIS_PORT`, `REDIS_PASSWORD`

**നിലവിലെ validation / ബാക്കിയുള്ളത്:** Workers/cache wiring ഇല്ല; optional password; numeric validation

#### AWS

**Variable പേരുകൾ:** `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_DEFAULT_REGION`, `AWS_BUCKET`

**നിലവിലെ validation / ബാക്കിയുള്ളത്:** Optional schema; feature enabled എങ്കിൽ credentials/bucket/runtime policy validate ചെയ്യുക

#### DynTube

**Variable പേരുകൾ:** `DYNTUBE_API_KEY`, `DYNTUBE_PROJECT_ID`

**നിലവിലെ validation / ബാക്കിയുള്ളത്:** Adapter ഇല്ല; Laravel base URL/caching configuration mapping വേണം

#### Zoom

**Variable പേരുകൾ:** `ZOOM_ACCOUNT_ID`, `ZOOM_CLIENT_ID`, `ZOOM_CLIENT_SECRET`, `ZOOM_SDK_KEY`, `ZOOM_SDK_SECRET`

**നിലവിലെ validation / ബാക്കിയുള്ളത്:** Multi-account DB model/secure storage/refresh integration ഇല്ല

#### WhatsApp

**Variable പേരുകൾ:** `WHATSAPP_API_URL`, `WHATSAPP_API_TOKEN`

**നിലവിലെ validation / ബാക്കിയുള്ളത്:** Adapter, feature-enable policy, templates, response validation ഇല്ല

#### Email

**Variable പേരുകൾ:** `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM_EMAIL`, `SMTP_FROM_NAME`

**നിലവിലെ validation / ബാക്കിയുള്ളത്:** Optional schema; transport/template/delivery implementation ഇല്ല


എല്ലാ optional integration keys-ഉം ഇപ്പോൾ നിർബന്ധമാക്കണം എന്നല്ല. Feature enabled ആകുമ്പോൾ ആവശ്യമായ set validate ചെയ്യുന്ന policy വേണം. Source: [env schema](src/config/env.ts).

</details>

<a id="api-inventory"></a>

## 8. മുഴുവൻ API പട്ടിക

അടുത്ത രണ്ട് പട്ടികകളിൽ **197 legacy API method/path pairs** രണ്ടായി തിരിച്ചിട്ടുണ്ട്: **115 unmatched**, **82 textual matches**. Path-കളിൽ `/api` prefix ഉൾപ്പെടുത്തിയിട്ടുണ്ട്. Laravel `{id}`-യും Express `:id`-യും ഒരേ parameter shape ആയി normalize ചെയ്തിരിക്കുന്നു.

Matching appendix-ൽ entry ഉണ്ടെങ്കിലും മുകളിലെ security/contract gaps ബാധകമാണ്. Utilities/logs/debug APIs-ക്ക് compatibility ആവശ്യകതയും intentional retirement-ഉം പ്രത്യേകം തീരുമാനിക്കണം; unsafe legacy behavior സംരക്ഷിക്കരുത്.

ഓരോ module-ന്റെ പേരിൽ അമർത്തിയാൽ അതിലെ routes കാണാം. Source link ഉപയോഗിച്ച് ബന്ധപ്പെട്ട code തുറക്കാം. **GET/POST പോലുള്ള method-ഉം path-ഉം ചേർന്നതാണ് ഓരോ entry.**

<a id="missing-apis"></a>

### 8.1 Matching Express route കണ്ടെത്താത്ത 115 APIs

<details>
<summary>Addon courses — അധിക കോഴ്സുകൾ (14)</summary>

| HTTP method | Laravel path | Laravel controller action |
|---|---|---|
| `GET` | `/api/addon-courses` | [AddonCourseController.index](../knovista-web-api/app/Http/Controllers/Api/AddonCourseController.php) |
| `POST` | `/api/addon-courses` | [AddonCourseController.store](../knovista-web-api/app/Http/Controllers/Api/AddonCourseController.php) |
| `POST` | `/api/addon-courses/videos/complete` | [AddonCourseController.completeVideo](../knovista-web-api/app/Http/Controllers/Api/AddonCourseController.php) |
| `DELETE` | `/api/addon-courses/{id}` | [AddonCourseController.destroy](../knovista-web-api/app/Http/Controllers/Api/AddonCourseController.php) |
| `GET` | `/api/addon-courses/{id}` | [AddonCourseController.show](../knovista-web-api/app/Http/Controllers/Api/AddonCourseController.php) |
| `GET` | `/api/addon-courses/{id}/students` | [AddonCourseController.students](../knovista-web-api/app/Http/Controllers/Api/AddonCourseController.php) |
| `POST` | `/api/addon-courses/{id}/update` | [AddonCourseController.update](../knovista-web-api/app/Http/Controllers/Api/AddonCourseController.php) |
| `GET` | `/api/addon-courses/{id}/videos` | [AddonCourseController.listVideos](../knovista-web-api/app/Http/Controllers/Api/AddonCourseController.php) |
| `POST` | `/api/addon-courses/{id}/videos` | [AddonCourseController.addVideos](../knovista-web-api/app/Http/Controllers/Api/AddonCourseController.php) |
| `DELETE` | `/api/addon-courses/{id}/videos/{videoId}` | [AddonCourseController.destroyVideo](../knovista-web-api/app/Http/Controllers/Api/AddonCourseController.php) |
| `PUT` | `/api/addon-courses/{id}/videos/{videoId}` | [AddonCourseController.updateVideo](../knovista-web-api/app/Http/Controllers/Api/AddonCourseController.php) |
| `GET` | `/api/student/addon-courses` | [AddonCourseController.studentIndex](../knovista-web-api/app/Http/Controllers/Api/AddonCourseController.php) |
| `POST` | `/api/student/addon-courses/{id}/start` | [AddonCourseController.studentStart](../knovista-web-api/app/Http/Controllers/Api/AddonCourseController.php) |
| `GET` | `/api/student/addon-courses/{id}/videos` | [AddonCourseController.studentVideos](../knovista-web-api/app/Http/Controllers/Api/AddonCourseController.php) |

</details>

<details>
<summary>Authentication — പ്രവേശന സുരക്ഷ (1)</summary>

| HTTP method | Laravel path | Laravel controller action |
|---|---|---|
| `POST` | `/api/student/logout` | [StudentAuthController.logout](../knovista-web-api/app/Http/Controllers/Api/StudentAuthController.php) |

</details>

<details>
<summary>Batches / enrollment — ബാച്ചും പ്രവേശനവും (13)</summary>

| HTTP method | Laravel path | Laravel controller action |
|---|---|---|
| `GET` | `/api/batches` | [ProgramSectionBatchController.index](../knovista-web-api/app/Http/Controllers/Api/ProgramSectionBatchController.php) |
| `POST` | `/api/batches` | [ProgramSectionBatchController.store](../knovista-web-api/app/Http/Controllers/Api/ProgramSectionBatchController.php) |
| `DELETE` | `/api/batches/{batch_id}/students/{student_id}` | [StudentSectionController.removeStudentFromBatch](../knovista-web-api/app/Http/Controllers/Api/StudentSectionController.php) |
| `DELETE` | `/api/batches/{id}` | [ManageController.deleteBatch](../knovista-web-api/app/Http/Controllers/Api/ManageController.php) |
| `PUT` | `/api/batches/{id}` | [ProgramSectionBatchController.update](../knovista-web-api/app/Http/Controllers/Api/ProgramSectionBatchController.php) |
| `POST` | `/api/student-sections/assign` | [StudentSectionController.assign](../knovista-web-api/app/Http/Controllers/Api/StudentSectionController.php) |
| `GET` | `/api/student-sections/batch-students` | [StudentSectionController.getBatchStudents](../knovista-web-api/app/Http/Controllers/Api/StudentSectionController.php) |
| `POST` | `/api/student-sections/mark-self-placed` | [StudentSectionController.markSelfPlaced](../knovista-web-api/app/Http/Controllers/Api/StudentSectionController.php) |
| `POST` | `/api/student-sections/mentors` | [StudentSectionController.getStudentMentors](../knovista-web-api/app/Http/Controllers/Api/StudentSectionController.php) |
| `POST` | `/api/student-sections/update-expected-end-date` | [StudentSectionController.updateExpectedEndDate](../knovista-web-api/app/Http/Controllers/Api/StudentSectionController.php) |
| `POST` | `/api/student/getStudentSectionDetails` | [StudentSectionController.getStudentSectionDetails](../knovista-web-api/app/Http/Controllers/Api/StudentSectionController.php) |
| `POST` | `/api/student/getStudentSections` | [StudentSectionController.getStudentSections](../knovista-web-api/app/Http/Controllers/Api/StudentSectionController.php) |
| `GET` | `/api/students/by-section` | [StudentSectionController.getStudentsBySection](../knovista-web-api/app/Http/Controllers/Api/StudentSectionController.php) |

</details>

<details>
<summary>CV — വിദ്യാർത്ഥികളുടെ CV (4)</summary>

| HTTP method | Laravel path | Laravel controller action |
|---|---|---|
| `GET` | `/api/student-cv/details` | [StudentDetailsController.index](../knovista-web-api/app/Http/Controllers/Api/StudentDetailsController.php) |
| `DELETE` | `/api/student-cv/{id}/cv` | [StudentCvController.delete](../knovista-web-api/app/Http/Controllers/Api/StudentCvController.php) |
| `GET` | `/api/student-cv/{id}/cv` | [StudentCvController.download](../knovista-web-api/app/Http/Controllers/Api/StudentCvController.php) |
| `POST` | `/api/student-cv/{id}/cv` | [StudentCvController.upload](../knovista-web-api/app/Http/Controllers/Api/StudentCvController.php) |

</details>

<details>
<summary>Certificates — സർട്ടിഫിക്കറ്റുകൾ (6)</summary>

| HTTP method | Laravel path | Laravel controller action |
|---|---|---|
| `GET` | `/api/certificate-files/{id}` | [CertificateController.publicFile](../knovista-web-api/app/Http/Controllers/Api/CertificateController.php) |
| `GET` | `/api/certificate-types` | [CertificateController.types](../knovista-web-api/app/Http/Controllers/Api/CertificateController.php) |
| `GET` | `/api/student-section-certificates` | [CertificateController.index](../knovista-web-api/app/Http/Controllers/Api/CertificateController.php) |
| `POST` | `/api/student-section-certificates` | [CertificateController.store](../knovista-web-api/app/Http/Controllers/Api/CertificateController.php) |
| `POST` | `/api/student-section-certificates/send-email` | [CertificateController.sendCertificateEmail](../knovista-web-api/app/Http/Controllers/Api/CertificateController.php) |
| `POST` | `/api/student-section-certificates/{id}/generate` | [CertificateController.generatePdf](../knovista-web-api/app/Http/Controllers/Api/CertificateController.php) |

</details>

<details>
<summary>Chat — ചാറ്റ് (7)</summary>

| HTTP method | Laravel path | Laravel controller action |
|---|---|---|
| `POST` | `/api/chat/auth/exchange` | [ChatAuthController.exchange](../knovista-web-api/app/Http/Controllers/Api/ChatAuthController.php) |
| `GET` | `/api/chat/conversations` | [ChatController.conversations](../knovista-web-api/app/Http/Controllers/Api/ChatController.php) |
| `POST` | `/api/chat/conversations/{conversationId}/read` | [ChatController.markConversationRead](../knovista-web-api/app/Http/Controllers/Api/ChatController.php) |
| `GET` | `/api/chat/messages` | [ChatController.messages](../knovista-web-api/app/Http/Controllers/Api/ChatController.php) |
| `POST` | `/api/chat/messages` | [ChatController.sendMessage](../knovista-web-api/app/Http/Controllers/Api/ChatController.php) |
| `GET` | `/api/chat/recipients` | [ChatController.recipients](../knovista-web-api/app/Http/Controllers/Api/ChatController.php) |
| `POST` | `/api/chat/token` | [ChatAuthController.mintAccessToken](../knovista-web-api/app/Http/Controllers/Api/ChatAuthController.php) |

</details>

<details>
<summary>Curriculum — പഠന ഘടന (7)</summary>

| HTTP method | Laravel path | Laravel controller action |
|---|---|---|
| `DELETE` | `/api/modules/{id}` | [ManageController.deleteModule](../knovista-web-api/app/Http/Controllers/Api/ManageController.php) |
| `POST` | `/api/sections/clone` | [SectionController.cloneSection](../knovista-web-api/app/Http/Controllers/Api/SectionController.php) |
| `DELETE` | `/api/sections/{id}` | [ManageController.deleteSection](../knovista-web-api/app/Http/Controllers/Api/ManageController.php) |
| `POST` | `/api/special-categories/{id}/delete` | [SpecialCategoryController.delete](../knovista-web-api/app/Http/Controllers/Api/SpecialCategoryController.php) |
| `GET` | `/api/topic-files/{topic}` | [TopicFileController.show](../knovista-web-api/app/Http/Controllers/Api/TopicFileController.php) |
| `DELETE` | `/api/topics/{id}` | [ManageController.deleteTopic](../knovista-web-api/app/Http/Controllers/Api/ManageController.php) |
| `POST` | `/api/topics/{id}/priority` | [TopicController.updatePriority](../knovista-web-api/app/Http/Controllers/Api/TopicController.php) |

</details>

<details>
<summary>DynTube — വീഡിയോ സേവനം (8)</summary>

| HTTP method | Laravel path | Laravel controller action |
|---|---|---|
| `POST` | `/api/public/videos/batch` | [DynTubeVideoController.getMultipleVideos](../knovista-web-api/app/Http/Controllers/Api/DynTubeVideoController.php) |
| `GET` | `/api/public/videos/{videoId}` | [DynTubeVideoController.getVideoDetails](../knovista-web-api/app/Http/Controllers/Api/DynTubeVideoController.php) |
| `GET` | `/api/public/videos/{videoId}/play-url` | [DynTubeVideoController.getPlayUrl](../knovista-web-api/app/Http/Controllers/Api/DynTubeVideoController.php) |
| `POST` | `/api/videos/batch` | [DynTubeVideoController.getMultipleVideos](../knovista-web-api/app/Http/Controllers/Api/DynTubeVideoController.php) |
| `GET` | `/api/videos/{videoId}` | [DynTubeVideoController.getVideoDetails](../knovista-web-api/app/Http/Controllers/Api/DynTubeVideoController.php) |
| `DELETE` | `/api/videos/{videoId}/cache` | [DynTubeVideoController.clearCache](../knovista-web-api/app/Http/Controllers/Api/DynTubeVideoController.php) |
| `GET` | `/api/videos/{videoId}/debug` | [DynTubeVideoController.debugVideo](../knovista-web-api/app/Http/Controllers/Api/DynTubeVideoController.php) |
| `GET` | `/api/videos/{videoId}/play-url` | [DynTubeVideoController.getPlayUrl](../knovista-web-api/app/Http/Controllers/Api/DynTubeVideoController.php) |

</details>

<details>
<summary>Email — ഇമെയിൽ (1)</summary>

| HTTP method | Laravel path | Laravel controller action |
|---|---|---|
| `POST` | `/api/send-email` | [ManageController.sendEmail](../knovista-web-api/app/Http/Controllers/Api/ManageController.php) |

</details>

<details>
<summary>Extensions — കാലാവധി നീട്ടൽ (2)</summary>

| HTTP method | Laravel path | Laravel controller action |
|---|---|---|
| `POST` | `/api/program-extensions/{id}/change-status` | [ProgramExtensionController.changeStatus](../knovista-web-api/app/Http/Controllers/Api/ProgramExtensionController.php) |
| `GET` | `/api/student/program-extensions` | [ProgramExtensionController.studentIndex](../knovista-web-api/app/Http/Controllers/Api/ProgramExtensionController.php) |

</details>

<details>
<summary>Live classes / Zoom — തത്സമയ ക്ലാസുകൾ (8)</summary>

| HTTP method | Laravel path | Laravel controller action |
|---|---|---|
| `GET` | `/api/live-classes` | [LiveClassController.index](../knovista-web-api/app/Http/Controllers/Api/LiveClassController.php) |
| `POST` | `/api/live-classes` | [LiveClassController.store](../knovista-web-api/app/Http/Controllers/Api/LiveClassController.php) |
| `DELETE` | `/api/live-classes/{id}` | [LiveClassController.destroy](../knovista-web-api/app/Http/Controllers/Api/LiveClassController.php) |
| `PUT` | `/api/live-classes/{id}` | [LiveClassController.update](../knovista-web-api/app/Http/Controllers/Api/LiveClassController.php) |
| `GET` | `/api/student/live-classes` | [LiveClassController.studentIndex](../knovista-web-api/app/Http/Controllers/Api/LiveClassController.php) |
| `POST` | `/api/student/zoom/meeting-signature` | [LiveClassController.studentMeetingSignature](../knovista-web-api/app/Http/Controllers/Api/LiveClassController.php) |
| `GET` | `/api/zoom-accounts` | [ZoomAccountController.index](../knovista-web-api/app/Http/Controllers/Api/ZoomAccountController.php) |
| `POST` | `/api/zoom/meeting-signature` | [LiveClassController.meetingSignature](../knovista-web-api/app/Http/Controllers/Api/LiveClassController.php) |

</details>

<details>
<summary>Logs — പ്രവർത്തന രേഖകൾ (2)</summary>

| HTTP method | Laravel path | Laravel controller action |
|---|---|---|
| `GET` | `/api/logs/list` | [LogViewerController.listLogs](../knovista-web-api/app/Http/Controllers/Api/LogViewerController.php) |
| `GET` | `/api/logs/view` | [LogViewerController.viewLog](../knovista-web-api/app/Http/Controllers/Api/LogViewerController.php) |

</details>

<details>
<summary>Placement — പ്ലേസ്മെന്റ് (15)</summary>

| HTTP method | Laravel path | Laravel controller action |
|---|---|---|
| `GET` | `/api/placement-companies` | [PlacementCompanyController.index](../knovista-web-api/app/Http/Controllers/Api/PlacementCompanyController.php) |
| `POST` | `/api/placement-companies` | [PlacementCompanyController.store](../knovista-web-api/app/Http/Controllers/Api/PlacementCompanyController.php) |
| `POST` | `/api/placement-companies/approve-auth-status` | [PlacementCompanyController.approveAuthStatus](../knovista-web-api/app/Http/Controllers/Api/PlacementCompanyController.php) |
| `POST` | `/api/placement-companies/assign-student` | [PlacementCompanyController.assignStudent](../knovista-web-api/app/Http/Controllers/Api/PlacementCompanyController.php) |
| `POST` | `/api/placement-companies/soft-delete` | [PlacementCompanyController.softDelete](../knovista-web-api/app/Http/Controllers/Api/PlacementCompanyController.php) |
| `POST` | `/api/placement-companies/update` | [PlacementCompanyController.update](../knovista-web-api/app/Http/Controllers/Api/PlacementCompanyController.php) |
| `POST` | `/api/placement-details/change-status` | [PlacementCompanyController.changePlacementDetailStatus](../knovista-web-api/app/Http/Controllers/Api/PlacementCompanyController.php) |
| `POST` | `/api/placement-details/fetch` | [PlacementCompanyController.fetchPlacementDetails](../knovista-web-api/app/Http/Controllers/Api/PlacementCompanyController.php) |
| `GET` | `/api/placement-officer/students` | [StudentSectionController.getPlacementOfficerStudents](../knovista-web-api/app/Http/Controllers/Api/StudentSectionController.php) |
| `GET` | `/api/placement-types` | [PlacementController.index](../knovista-web-api/app/Http/Controllers/Api/PlacementController.php) |
| `POST` | `/api/placements/feedback` | [PlacementController.saveFeedback](../knovista-web-api/app/Http/Controllers/Api/PlacementController.php) |
| `GET` | `/api/placements/feedbacks` | [PlacementController.listFeedbacks](../knovista-web-api/app/Http/Controllers/Api/PlacementController.php) |
| `DELETE` | `/api/placements/feedbacks/{id}` | [PlacementController.deleteFeedback](../knovista-web-api/app/Http/Controllers/Api/PlacementController.php) |
| `GET` | `/api/placements/feedbacks/{student_section_id}` | [PlacementController.listFeedbacks](../knovista-web-api/app/Http/Controllers/Api/PlacementController.php) |
| `POST` | `/api/placements/send-email` | [PlacementController.sendEmail](../knovista-web-api/app/Http/Controllers/Api/PlacementController.php) |

</details>

<details>
<summary>Posters — അറിയിപ്പ് ചിത്രങ്ങൾ (4)</summary>

| HTTP method | Laravel path | Laravel controller action |
|---|---|---|
| `GET` | `/api/posters` | [PosterController.index](../knovista-web-api/app/Http/Controllers/Api/PosterController.php) |
| `POST` | `/api/posters` | [PosterController.store](../knovista-web-api/app/Http/Controllers/Api/PosterController.php) |
| `DELETE` | `/api/posters/{id}` | [PosterController.destroy](../knovista-web-api/app/Http/Controllers/Api/PosterController.php) |
| `POST` | `/api/posters/{id}` | [PosterController.update](../knovista-web-api/app/Http/Controllers/Api/PosterController.php) |

</details>

<details>
<summary>S3 — ഫയൽ സ്റ്റോറേജ് (2)</summary>

| HTTP method | Laravel path | Laravel controller action |
|---|---|---|
| `POST` | `/api/s3/presigned-download-url` | Closure |
| `POST` | `/api/s3/presigned-upload-url` | Closure |

</details>

<details>
<summary>Students — വിദ്യാർത്ഥികൾ (5)</summary>

| HTTP method | Laravel path | Laravel controller action |
|---|---|---|
| `POST` | `/api/student/details` | [StudentAuthController.getStudentDetails](../knovista-web-api/app/Http/Controllers/Api/StudentAuthController.php) |
| `GET` | `/api/students/details` | [StudentController.getStudentDetails](../knovista-web-api/app/Http/Controllers/Api/StudentController.php) |
| `POST` | `/api/students/export` | [StudentController.export](../knovista-web-api/app/Http/Controllers/Api/StudentController.php) |
| `GET` | `/api/students/export/download` | [StudentController.downloadExport](../knovista-web-api/app/Http/Controllers/Api/StudentController.php) |
| `GET` | `/api/students/search` | [StudentDetailsController.search](../knovista-web-api/app/Http/Controllers/Api/StudentDetailsController.php) |

</details>

<details>
<summary>Suggestions — നിർദ്ദേശങ്ങൾ (6)</summary>

| HTTP method | Laravel path | Laravel controller action |
|---|---|---|
| `GET` | `/api/student/suggessions` | [SuggessionController.listForStudent](../knovista-web-api/app/Http/Controllers/Api/SuggessionController.php) |
| `GET` | `/api/suggestions` | [SuggessionController.index](../knovista-web-api/app/Http/Controllers/Api/SuggessionController.php) |
| `POST` | `/api/suggestions` | [SuggessionController.store](../knovista-web-api/app/Http/Controllers/Api/SuggessionController.php) |
| `POST` | `/api/suggestions/change-status` | [SuggessionController.changeStatus](../knovista-web-api/app/Http/Controllers/Api/SuggessionController.php) |
| `DELETE` | `/api/suggestions/{id}` | [SuggessionController.destroy](../knovista-web-api/app/Http/Controllers/Api/SuggessionController.php) |
| `GET` | `/api/suggestions/{id}` | [SuggessionController.show](../knovista-web-api/app/Http/Controllers/Api/SuggessionController.php) |

</details>

<details>
<summary>Tickets — സഹായ അഭ്യർത്ഥനകൾ (5)</summary>

| HTTP method | Laravel path | Laravel controller action |
|---|---|---|
| `POST` | `/api/student-tickets/close` | [StudentTicketController.closeTicket](../knovista-web-api/app/Http/Controllers/Api/StudentTicketController.php) |
| `POST` | `/api/student-tickets/{id}/assign` | [StudentTicketController.assignTicket](../knovista-web-api/app/Http/Controllers/Api/StudentTicketController.php) |
| `POST` | `/api/student-tickets/{id}/reply` | [StudentTicketController.replyTicket](../knovista-web-api/app/Http/Controllers/Api/StudentTicketController.php) |
| `POST` | `/api/student/tickets` | [StudentTicketController.store](../knovista-web-api/app/Http/Controllers/Api/StudentTicketController.php) |
| `GET` | `/api/student/tickets/list` | [StudentTicketController.index](../knovista-web-api/app/Http/Controllers/Api/StudentTicketController.php) |

</details>

<details>
<summary>Users / roles — ജീവനക്കാർ (3)</summary>

| HTTP method | Laravel path | Laravel controller action |
|---|---|---|
| `POST` | `/api/institution-users/reset-password` | [InstitutionUserController.resetPassword](../knovista-web-api/app/Http/Controllers/Api/InstitutionUserController.php) |
| `POST` | `/api/institution-users/{id}/delete` | [InstitutionUserController.delete](../knovista-web-api/app/Http/Controllers/Api/InstitutionUserController.php) |
| `POST` | `/api/institution-users/{id}/update` | [InstitutionUserController.update](../knovista-web-api/app/Http/Controllers/Api/InstitutionUserController.php) |

</details>

<details>
<summary>Utilities — legacy utility endpoints (2)</summary>

| HTTP method | Laravel path | Laravel controller action |
|---|---|---|
| `GET` | `/api/test` | Closure |
| `GET` | `/api/user` | Closure |

</details>

<a id="matching-apis"></a>

### 8.2 Matching Express route ഉള്ള 82 APIs

**ഈ പട്ടികയിലെ route-കൾക്ക് security / validation / workflow പ്രശ്നങ്ങൾ ഇപ്പോഴും ബാധകമായിരിക്കാം.**

<details>
<summary>Assessments — മൂല്യനിർണ്ണയം (2)</summary>

| HTTP method | Laravel path | Express route source |
|---|---|---|
| `POST` | `/api/student-sections/assessment-answers` | [assessmentRoutes.ts](src/modules/assessment/presentation/routes/assessmentRoutes.ts) |
| `GET` | `/api/student/assessment-answers` | [assessmentRoutes.ts](src/modules/assessment/presentation/routes/assessmentRoutes.ts) |

</details>

<details>
<summary>Authentication — പ്രവേശന സുരക്ഷ (7)</summary>

| HTTP method | Laravel path | Express route source |
|---|---|---|
| `POST` | `/api/institution-user/login` | [authRoutes.ts](src/modules/auth/presentation/routes/authRoutes.ts) |
| `POST` | `/api/student/change-password` | [authRoutes.ts](src/modules/auth/presentation/routes/authRoutes.ts) |
| `POST` | `/api/student/forgot-password` | [authRoutes.ts](src/modules/auth/presentation/routes/authRoutes.ts) |
| `POST` | `/api/student/login` | [authRoutes.ts](src/modules/auth/presentation/routes/authRoutes.ts) |
| `GET` | `/api/student/profile` | [authRoutes.ts](src/modules/auth/presentation/routes/authRoutes.ts) |
| `POST` | `/api/student/register` | [studentRoutes.ts](src/modules/students/presentation/routes/studentRoutes.ts); [authRoutes.ts](src/modules/auth/presentation/routes/authRoutes.ts) |
| `POST` | `/api/student/reset-password` | [studentRoutes.ts](src/modules/students/presentation/routes/studentRoutes.ts); [authRoutes.ts](src/modules/auth/presentation/routes/authRoutes.ts) |

</details>

<details>
<summary>Curriculum — പഠന ഘടന (18)</summary>

| HTTP method | Laravel path | Express route source |
|---|---|---|
| `GET` | `/api/modules` | [curriculumRoutes.ts](src/modules/curriculum/presentation/routes/curriculumRoutes.ts) |
| `POST` | `/api/modules` | [curriculumRoutes.ts](src/modules/curriculum/presentation/routes/curriculumRoutes.ts) |
| `PUT` | `/api/modules/{id}` | [curriculumRoutes.ts](src/modules/curriculum/presentation/routes/curriculumRoutes.ts) |
| `GET` | `/api/programs` | [curriculumRoutes.ts](src/modules/curriculum/presentation/routes/curriculumRoutes.ts) |
| `POST` | `/api/programs` | [curriculumRoutes.ts](src/modules/curriculum/presentation/routes/curriculumRoutes.ts) |
| `POST` | `/api/programs/clone` | [curriculumRoutes.ts](src/modules/curriculum/presentation/routes/curriculumRoutes.ts) |
| `DELETE` | `/api/programs/{id}` | [curriculumRoutes.ts](src/modules/curriculum/presentation/routes/curriculumRoutes.ts) |
| `POST` | `/api/programs/{id}` | [curriculumRoutes.ts](src/modules/curriculum/presentation/routes/curriculumRoutes.ts) |
| `GET` | `/api/sections` | [curriculumRoutes.ts](src/modules/curriculum/presentation/routes/curriculumRoutes.ts) |
| `POST` | `/api/sections` | [curriculumRoutes.ts](src/modules/curriculum/presentation/routes/curriculumRoutes.ts) |
| `POST` | `/api/sections/{id}/update` | [curriculumRoutes.ts](src/modules/curriculum/presentation/routes/curriculumRoutes.ts) |
| `GET` | `/api/special-categories` | [curriculumRoutes.ts](src/modules/curriculum/presentation/routes/curriculumRoutes.ts) |
| `POST` | `/api/special-categories` | [curriculumRoutes.ts](src/modules/curriculum/presentation/routes/curriculumRoutes.ts) |
| `POST` | `/api/special-categories/{id}/update` | [curriculumRoutes.ts](src/modules/curriculum/presentation/routes/curriculumRoutes.ts) |
| `GET` | `/api/topics` | [curriculumRoutes.ts](src/modules/curriculum/presentation/routes/curriculumRoutes.ts) |
| `POST` | `/api/topics` | [curriculumRoutes.ts](src/modules/curriculum/presentation/routes/curriculumRoutes.ts) |
| `PUT` | `/api/topics/{id}` | [curriculumRoutes.ts](src/modules/curriculum/presentation/routes/curriculumRoutes.ts) |
| `POST` | `/api/topics/{id}/update` | [curriculumRoutes.ts](src/modules/curriculum/presentation/routes/curriculumRoutes.ts) |

</details>

<details>
<summary>Dashboard — സംഗ്രഹം (3)</summary>

| HTTP method | Laravel path | Express route source |
|---|---|---|
| `GET` | `/api/daily-quotes` | [dashboardRoutes.ts](src/modules/dashboard/presentation/routes/dashboardRoutes.ts) |
| `GET` | `/api/dashboard/admin` | [dashboardRoutes.ts](src/modules/dashboard/presentation/routes/dashboardRoutes.ts) |
| `GET` | `/api/student/dashboard` | [dashboardRoutes.ts](src/modules/dashboard/presentation/routes/dashboardRoutes.ts) |

</details>

<details>
<summary>Extensions — കാലാവധി നീട്ടൽ (2)</summary>

| HTTP method | Laravel path | Express route source |
|---|---|---|
| `GET` | `/api/program-extensions` | [batchRoutes.ts](src/modules/batch/presentation/routes/batchRoutes.ts) |
| `POST` | `/api/program-extensions` | [batchRoutes.ts](src/modules/batch/presentation/routes/batchRoutes.ts) |

</details>

<details>
<summary>Finance — ഫീസ് (8)</summary>

| HTTP method | Laravel path | Express route source |
|---|---|---|
| `GET` | `/api/fee-collections` | [financeRoutes.ts](src/modules/finance/presentation/routes/financeRoutes.ts) |
| `POST` | `/api/fee-collections` | [financeRoutes.ts](src/modules/finance/presentation/routes/financeRoutes.ts) |
| `POST` | `/api/fee-collections/approve` | [financeRoutes.ts](src/modules/finance/presentation/routes/financeRoutes.ts) |
| `POST` | `/api/fee-collections/cancel` | [financeRoutes.ts](src/modules/finance/presentation/routes/financeRoutes.ts) |
| `POST` | `/api/fee-collections/collect` | [financeRoutes.ts](src/modules/finance/presentation/routes/financeRoutes.ts) |
| `POST` | `/api/fee-collections/delete-installment` | [financeRoutes.ts](src/modules/finance/presentation/routes/financeRoutes.ts) |
| `POST` | `/api/fee-collections/update-installment` | [financeRoutes.ts](src/modules/finance/presentation/routes/financeRoutes.ts) |
| `GET` | `/api/fee-collections/{id}` | [financeRoutes.ts](src/modules/finance/presentation/routes/financeRoutes.ts) |

</details>

<details>
<summary>Notifications — അറിയിപ്പുകൾ (4)</summary>

| HTTP method | Laravel path | Express route source |
|---|---|---|
| `GET` | `/api/admin-notifications` | [notificationRoutes.ts](src/modules/notification/presentation/routes/notificationRoutes.ts) |
| `POST` | `/api/admin-notifications/mark-read` | [notificationRoutes.ts](src/modules/notification/presentation/routes/notificationRoutes.ts) |
| `GET` | `/api/student/notifications` | [notificationRoutes.ts](src/modules/notification/presentation/routes/notificationRoutes.ts) |
| `POST` | `/api/student/notifications/mark-viewed` | [notificationRoutes.ts](src/modules/notification/presentation/routes/notificationRoutes.ts) |

</details>

<details>
<summary>Progress — പഠന പുരോഗതി (11)</summary>

| HTTP method | Laravel path | Express route source |
|---|---|---|
| `GET` | `/api/performances` | [progressRoutes.ts](src/modules/progress/presentation/routes/progressRoutes.ts) |
| `POST` | `/api/performances` | [progressRoutes.ts](src/modules/progress/presentation/routes/progressRoutes.ts) |
| `DELETE` | `/api/performances/{id}` | [progressRoutes.ts](src/modules/progress/presentation/routes/progressRoutes.ts) |
| `GET` | `/api/performances/{id}` | [progressRoutes.ts](src/modules/progress/presentation/routes/progressRoutes.ts) |
| `POST` | `/api/student-section-topics/complete` | [progressRoutes.ts](src/modules/progress/presentation/routes/progressRoutes.ts) |
| `POST` | `/api/student-sections/approve-module-unlock` | [progressRoutes.ts](src/modules/progress/presentation/routes/progressRoutes.ts) |
| `POST` | `/api/student-sections/complete-course` | [progressRoutes.ts](src/modules/progress/presentation/routes/progressRoutes.ts) |
| `GET` | `/api/student-sections/module-unlock-requests` | [progressRoutes.ts](src/modules/progress/presentation/routes/progressRoutes.ts) |
| `POST` | `/api/student-sections/request-unlock-next-module` | [progressRoutes.ts](src/modules/progress/presentation/routes/progressRoutes.ts) |
| `GET` | `/api/students/completed-modules` | [progressRoutes.ts](src/modules/progress/presentation/routes/progressRoutes.ts) |
| `GET` | `/api/students/{student_id}/module-performance` | [progressRoutes.ts](src/modules/progress/presentation/routes/progressRoutes.ts) |

</details>

<details>
<summary>Students — വിദ്യാർത്ഥികൾ (13)</summary>

| HTTP method | Laravel path | Express route source |
|---|---|---|
| `POST` | `/api/student/update-profile` | [studentRoutes.ts](src/modules/students/presentation/routes/studentRoutes.ts) |
| `POST` | `/api/student/update-profile-image` | [studentRoutes.ts](src/modules/students/presentation/routes/studentRoutes.ts) |
| `DELETE` | `/api/student/{id}` | [studentRoutes.ts](src/modules/students/presentation/routes/studentRoutes.ts) |
| `GET` | `/api/students` | [studentRoutes.ts](src/modules/students/presentation/routes/studentRoutes.ts) |
| `POST` | `/api/students/block` | [studentRoutes.ts](src/modules/students/presentation/routes/studentRoutes.ts) |
| `GET` | `/api/students/block-reasons` | [studentRoutes.ts](src/modules/students/presentation/routes/studentRoutes.ts) |
| `POST` | `/api/students/drop` | [studentRoutes.ts](src/modules/students/presentation/routes/studentRoutes.ts) |
| `POST` | `/api/students/login-status` | [studentRoutes.ts](src/modules/students/presentation/routes/studentRoutes.ts) |
| `POST` | `/api/students/reset-password` | [studentRoutes.ts](src/modules/students/presentation/routes/studentRoutes.ts) |
| `POST` | `/api/students/unblock` | [studentRoutes.ts](src/modules/students/presentation/routes/studentRoutes.ts) |
| `POST` | `/api/students/unblock-modules` | [studentRoutes.ts](src/modules/students/presentation/routes/studentRoutes.ts) |
| `POST` | `/api/students/undrop` | [studentRoutes.ts](src/modules/students/presentation/routes/studentRoutes.ts) |
| `PUT` | `/api/students/{id}` | [studentRoutes.ts](src/modules/students/presentation/routes/studentRoutes.ts) |

</details>

<details>
<summary>Users / roles — ജീവനക്കാർ (5)</summary>

| HTTP method | Laravel path | Express route source |
|---|---|---|
| `GET` | `/api/institution-role/permissions` | [institutionUserRoutes.ts](src/modules/users/presentation/routes/institutionUserRoutes.ts) |
| `GET` | `/api/institution-roles/active` | [institutionUserRoutes.ts](src/modules/users/presentation/routes/institutionUserRoutes.ts) |
| `GET` | `/api/institution-users` | [institutionUserRoutes.ts](src/modules/users/presentation/routes/institutionUserRoutes.ts) |
| `POST` | `/api/institution-users` | [institutionUserRoutes.ts](src/modules/users/presentation/routes/institutionUserRoutes.ts) |
| `GET` | `/api/institution-users/by-role` | [institutionUserRoutes.ts](src/modules/users/presentation/routes/institutionUserRoutes.ts) |

</details>

<details>
<summary>Welfare — അവധി / റിപ്പോർട്ടുകൾ (9)</summary>

| HTTP method | Laravel path | Express route source |
|---|---|---|
| `GET` | `/api/leave-reasons` | [welfareRoutes.ts](src/modules/welfare/presentation/routes/welfareRoutes.ts) |
| `GET` | `/api/student-leaves` | [welfareRoutes.ts](src/modules/welfare/presentation/routes/welfareRoutes.ts) |
| `POST` | `/api/student-leaves` | [welfareRoutes.ts](src/modules/welfare/presentation/routes/welfareRoutes.ts) |
| `POST` | `/api/student-leaves/{id}/authorize` | [welfareRoutes.ts](src/modules/welfare/presentation/routes/welfareRoutes.ts) |
| `GET` | `/api/student-leaves/{id}/proof` | [welfareRoutes.ts](src/modules/welfare/presentation/routes/welfareRoutes.ts) |
| `GET` | `/api/student-report-heads` | [welfareRoutes.ts](src/modules/welfare/presentation/routes/welfareRoutes.ts) |
| `POST` | `/api/student-reports` | [welfareRoutes.ts](src/modules/welfare/presentation/routes/welfareRoutes.ts) |
| `GET` | `/api/student-reports/list` | [welfareRoutes.ts](src/modules/welfare/presentation/routes/welfareRoutes.ts) |
| `DELETE` | `/api/student-reports/{id}` | [welfareRoutes.ts](src/modules/welfare/presentation/routes/welfareRoutes.ts) |

</details>

<a id="verification"></a>

## 9. പരിശോധനയുടെ പരിധിയും തെളിവുകളും

ഇവിടെ രേഖപ്പെടുത്തിയിരിക്കുന്നത് source code വായിച്ചുള്ള കണ്ടെത്തലുകളാണ്. Live application-ന്റെ മുഴുവൻ പ്രവർത്തനവും വിജയകരമായി പരിശോധിച്ചു എന്ന അർത്ഥമില്ല.

<details>
<summary>ഈ audit-ൽ ഉപയോഗിക്കുന്ന status-കളുടെ അർത്ഥം</summary>

**Migration ഭാഗികമാണ്. Laravel-നെ production-ൽ പൂർണ്ണമായി മാറ്റിസ്ഥാപിക്കാൻ ഇപ്പോൾ തയ്യാറായതായി സ്ഥിരീകരിക്കാൻ കഴിയില്ല.**

| അടയാളം | അർത്ഥം |
|---|---|
| നടപ്പാക്കിയിട്ടുണ്ട് | Route/handler/use case/repository code ഉണ്ട്; production correctness ഉറപ്പായെന്നല്ല |
| ഭാഗികം | ആവശ്യമായ workflow-യുടെ ചില ഭാഗങ്ങൾ മാത്രം ഉണ്ട് |
| ശേഷിക്കുന്നു | Express route അല്ലെങ്കിൽ feature implementation കണ്ടെത്തിയില്ല |
| സ്ഥിരീകരിച്ചത് — Verified | ഇപ്പോഴത്തെ source-ൽ നേരിട്ട് തെളിവുണ്ട് |
| അനുമാനം — Inferred | Source-ൽ നിന്ന് പ്രതീക്ഷിക്കുന്ന ഫലം; runtime-ൽ സ്ഥിരീകരിച്ചിട്ടില്ല |
| അപൂർണ്ണം — Incomplete | Feature, contract, validation അല്ലെങ്കിൽ തെളിവ് പൂർത്തിയായിട്ടില്ല |
| വൈരുദ്ധ്യം — Contradictory | Documentation/implementation അല്ലെങ്കിൽ രണ്ട് implementations തമ്മിൽ വ്യത്യാസമുണ്ട് |
| Runtime പരിശോധന ആവശ്യമാണ് | Database/API/frontend/integration പരിശോധന നടത്തിയിട്ടില്ല |

ഈ റിപ്പോർട്ടിൽ ഒരു business module-നും **പൂർണ്ണ end-to-end migration പൂർത്തിയായി** എന്ന സർട്ടിഫിക്കേഷൻ നൽകിയിട്ടില്ല. നിലവിലുള്ള code-ഉം അതിൽ ശേഷിക്കുന്ന ജോലിയും വേർതിരിച്ചാണ് രേഖപ്പെടുത്തിയിരിക്കുന്നത്.

</details>

<details>
<summary>പരിശോധനയുടെ രീതി, കണക്കുകൾ, source documents</summary>

പരിശോധന തീയതി: **2026-11-26**  
ലക്ഷ്യ backend: `express-knovista-api/`  
മൂല backend: `../knovista-web-api/`  
രീതി: source code, routes, Zod DTOs, Prisma schema, SQL migration, Laravel models/validators എന്നിവയുടെ static പരിശോധന.

ഈ റിപ്പോർട്ട് തയ്യാറാക്കുന്നതിനായി application code, database, Laravel documentation, frontend എന്നിവ മാറ്റിയിട്ടില്ല. ഇത് implementation approval അല്ല; ശേഷിക്കുന്ന ജോലികളുടെ സാങ്കേതിക പട്ടികയാണ്.

| ഇനം | ഫലം |
|---|---:|
| Laravel `routes/api.php`-യിലെ unique HTTP method + path pairs | 197 |
| അതേ method/path shape ഉള്ള Express routes | 82 |
| അതേ method/path shape ഇല്ലാത്ത Laravel APIs | 115 |
| Express-ൽ router ഉള്ള module directories | 11 |
| Express router declarations, mounting aliases ആവർത്തിക്കാതെ | 114 |
| Prisma models | 29 |
| Laravel migrations സൃഷ്ടിക്കുന്ന table names | 59 |
| നിലവിലെ SQL baseline സൃഷ്ടിക്കുന്ന tables | 20 |
| കണ്ടെത്തിയ test files | 18 |

`{id}` / `:id` പോലുള്ള parameter syntax വ്യത്യാസങ്ങൾ route comparison-ൽ normalize ചെയ്തു. ഒരേ router `/api`, `/api/v1`, root എന്നിവയിൽ mount ചെയ്തിരിക്കുന്നത് വേറിട്ട business APIs ആയി എണ്ണിയിട്ടില്ല. Laravel-യിലെ ആവർത്തിച്ച video-cache route ഒരിക്കൽ മാത്രം എണ്ണി. `HEAD`, implicit `OPTIONS`, framework/web routes ഈ 197-ൽ ഉൾപ്പെടുന്നില്ല.

**82/197 എന്നത് feature completion ശതമാനമല്ല.** Matching route-ൽ auth/body/response മാറിയിരിക്കാം; unmatched route-ന്റെ ചില behavior മറ്റൊരു URL-ൽ ഉണ്ടാകാം. Middleware തടയുന്ന routes-ഉം textual match-ൽ ഉൾപ്പെടാം.

പരിശോധിച്ച പ്രധാന references:

- [Laravel architecture/API documentation](../knovista-web-api/docs/01-COMPLETE-BACKEND-ARCHITECTURE-AND-API-DOCUMENTATION.md)
- [Laravel technical/security audit](../knovista-web-api/docs/02-BACKEND-TECHNICAL-AUDIT-SECURITY-AND-ISSUES.md)
- [Migration guide](../knovista-web-api/docs/03-LARAVEL-TO-EXPRESS-TYPESCRIPT-MIGRATION-AND-IMPLEMENTATION-GUIDE.md)
- [Laravel routes](../knovista-web-api/routes/api.php)
- [Express router mounting](src/app.ts)
- [Prisma schema](prisma/schema.prisma)
- [SQL baseline](prisma/migrations/0_init/migration.sql)

Live database schema, production data, external credentials, running queue workers, frontend acceptance എന്നിവ ഈ static audit-ൽ പരിശോധിച്ചിട്ടില്ല. Missing Prisma model എന്നത് live database-ൽ table ഇല്ലെന്ന തെളിവല്ല.

</details>

<details>
<summary>മുൻ Laravel audit-ലെ 10 issues — Express-ൽ ഇപ്പോഴത്തെ നില</summary>

#### ISSUE-001

**Laravel-ലെ കണ്ടെത്തൽ:** Public log file traversal

**Express-ൽ ഇപ്പോഴത്തെ നില:** Log API migrate ചെയ്തിട്ടില്ല; unsafe behavior പകർത്തരുത്

#### ISSUE-002

**Laravel-ലെ കണ്ടെത്തൽ:** Forgot-password response OTP leak

**Express-ൽ ഇപ്പോഴത്തെ നില:** Express OTP return ചെയ്യുന്നില്ല; email delivery ഇല്ല; raw reset-token storage വേറൊരു gap

#### ISSUE-003

**Laravel-ലെ കണ്ടെത്തൽ:** Public student admin password reset

**Express-ൽ ഇപ്പോഴത്തെ നില:** Express-ലും തുടരുന്നു — SEC-01

#### ISSUE-004

**Laravel-ലെ കണ്ടെത്തൽ:** Public block/drop/unblock

**Express-ൽ ഇപ്പോഴത്തെ നില:** Express routes-ൽ staff auth ചേർത്തിട്ടുണ്ട്; finer permission/scope ശേഷിക്കുന്നു

#### ISSUE-005

**Laravel-ലെ കണ്ടെത്തൽ:** Granular RBAC ഇല്ല

**Express-ൽ ഇപ്പോഴത്തെ നില:** Hardcoded permission display ഉണ്ട്; enforcement അപൂർണ്ണം

#### ISSUE-006

**Laravel-ലെ കണ്ടെത്തൽ:** Plaintext Zoom secrets

**Express-ൽ ഇപ്പോഴത്തെ നില:** Zoom implementation pending; encryption/redaction design വേണം

#### ISSUE-007

**Laravel-ലെ കണ്ടെത്തൽ:** Inline/scattered validation

**Express-ൽ ഇപ്പോഴത്തെ നില:** Zod foundation ഉണ്ട്; എല്ലാ fields/queries/nested objects-ലും പൂർത്തിയല്ല

#### ISSUE-008

**Laravel-ലെ കണ്ടെത്തൽ:** N+1/performance

**Express-ൽ ഇപ്പോഴത്തെ നില:** Full migrated query benchmark ഇല്ല; regression/performance verification ശേഷിക്കുന്നു

#### ISSUE-009

**Laravel-ലെ കണ്ടെത്തൽ:** Auth rate limiting ഇല്ല

**Express-ൽ ഇപ്പോഴത്തെ നില:** Login/register/forgot-ൽ limiter ഉണ്ട്; sensitive-route coverage/store strategy ശേഷിക്കുന്നു

#### ISSUE-010

**Laravel-ലെ കണ്ടെത്തൽ:** Wildcard CORS

**Express-ൽ ഇപ്പോഴത്തെ നില:** Express default-ലും wildcard allowed; deployment config verify ചെയ്യണം


Original findings preserve ചെയ്തിരിക്കുന്നു. Finding old backend-ൽ ഉണ്ടെന്ന alone കാരണം Express-ൽ അതേ defect ഉണ്ടെന്നു കരുതിയിട്ടില്ല.

</details>

<details>
<summary>പഴയ documentation-ൽ തിരുത്തി മനസ്സിലാക്കേണ്ട കാര്യങ്ങൾ</summary>

1. `203 routes` എന്ന documentation heading business API count ആയി ഉപയോഗിക്കരുത്; current API inventory197 ആണ്. Web/framework routes വേറെയാണ്.
2. `/performance/module/unlock`, `/certificates/generate`, `/chat/auth/token` എന്ന guide examples current registered Laravel paths അല്ല. Actual routes appendix-ൽ ഉണ്ട്.
3. Student/staff login source `login` സ്വീകരിക്കുന്നു; documentation-യിലെ identifier claims എല്ലാം കൃത്യമല്ല. Express-ലും `login` alias ഉണ്ട്.
4. Laravel forgot-password OTP student fields-ൽ സൂക്ഷിക്കുന്നു; generic `password_resets` description current source-നോട് പൊരുത്തപ്പെടുന്നില്ല.
5. `TopicFile`, `StudentCv`, `StudentModuleUnlockRequest` എന്ന documentation references-നെ actual separate models/tables ആയി കരുതരുത്; source ownership/storage വ്യത്യസ്തമാണ്.
6. Offer letter enrollment workflow-ൽ ഉണ്ട്; placement-only event ആയി തെറ്റായി migrate ചെയ്യരുത്.
7. Laravel source ചില endpoints-ൽ role filtering നടത്തുന്നു; global granular RBAC ഇല്ല എന്ന കണ്ടെത്തൽ, എല്ലാ controller-ലും filtering ഇല്ല എന്നല്ല.
8. Guide code samples-ൽ `any`, comments, framework coupling ഉണ്ട്; നിലവിലെ AGENTS rules-ന് അനുയോജ്യമായ final implementation ആയി copy ചെയ്യരുത്.
9. `ProductController` പോലുള്ള unrouted examples migration scope-യിൽ സ്വയമേവ ചേർക്കരുത്.
10. Student refresh method source-ൽ ഉണ്ടായാലും active routes-ൽ registered അല്ല. പുതിയ refresh API വേണമോ എന്നത് design തീരുമാനം; 115 missing legacy APIs-ൽ ചേർത്തിട്ടില്ല.
11. `POST /institution-users/reset-password` route `InstitutionUserController.resetPassword`-നെ ചൂണ്ടുന്നു; ആ class-ൽ method ഇല്ല. ഇത് original backend-ലെ source-level defect ആണ്. Route197 എന്നത് registration inventory മാത്രം;197 working APIs എന്ന അവകാശവാദമല്ല. Target contract പ്രത്യേകം തീരുമാനിക്കണം.

</details>

<details>
<summary>നടത്തിയ പരിശോധനകളും release-ന് മുമ്പ് വേണ്ട acceptance checks-ഉം</summary>

| പരിശോധന | യഥാർത്ഥ ഫലം |
|---|---|
| മുൻ audit-ൽ `npm run typecheck` | Exit0 — passed |
| നിലവിലെ report-നായി code execution tests | നടത്തിയിട്ടില്ല; documentation മാത്രം എഴുതുന്നു |
| Lint | package.json-ൽ lint script ഇല്ല; lint passed എന്നു പറയുന്നില്ല |
| Unit/integration suite | 18 test files കണ്ടെത്തി; ഈ audit-ൽ run ചെയ്തിട്ടില്ല |
| src TypeScript file size | മുൻ audit scan-ൽ 600 lines-നു മുകളിലുള്ള file കണ്ടെത്തിയില്ല |
| Live DB / migration execution | നടത്തിയിട്ടില്ല |
| Production API / provider calls | നടത്തിയിട്ടില്ല |
| Frontend acceptance / response parity | നടത്തിയിട്ടില്ല |
| Markdown report verification | UTF-8, local source links, code-fence balance, 115+82=197 unique API rows പരിശോധിച്ചു |

Cutover acceptance:

- Clean database-ൽ എല്ലാ migrations apply ചെയ്ത് current Prisma schema-യുമായി match ചെയ്യുക.
- Production copy-ൽ row counts, foreign keys, statuses, dates, money, audit histories, file paths validate ചെയ്യുക.
- ഓരോ protected API-ക്കും anonymous, wrong role, wrong student, wrong batch, blocked account tests.
- Reset replay, logout invalidation, stale-token access tests.
- Enrollment → topics → assessment → unlock → completion → certificate full workflow.
- Fee partial payment, overpayment rejection, approval/rejection/cancellation, duplicate/concurrent request tests.
- Email/PDF/WhatsApp/Zoom/DynTube/S3 sandbox integration tests.
- Student/admin/chat frontends-ൽ contract and realtime acceptance.
- Backups, reversible cutover, queue ownership, monitoring, rollback rehearsal.

</details>

[ഉള്ളടക്കത്തിലേക്ക് മടങ്ങുക](#overview)
