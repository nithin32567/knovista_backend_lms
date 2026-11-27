# Knovista Laravel → Express migration backlog

**പരിശോധന തീയതി** · 27 നവംബർ 2026  
**പരിധി** · നിലവിലെ Laravel routes, Express working tree, Prisma migrations, തിരഞ്ഞെടുത്ത frontend API callers.

| പരിശോധന | എണ്ണം |
| --- | ---: |
| Laravel-ൽ സജീവമായി നിർവചിച്ച വ്യത്യസ്ത HTTP method/path കൂട്ടുകൾ | 197 |
| അതേ method/path Express-ൽ രജിസ്റ്റർ ചെയ്തിട്ടുള്ളവ | 86 |
| അതേ method/path Express-ൽ ലഭ്യമല്ലാത്തവ | 111 |

ഒരേ method/path ആവർത്തിച്ചാൽ ഒരിക്കൽ എണ്ണി. Path parameter-ന്റെ പേരിലെ വ്യത്യാസം അവഗണിച്ചു. Laravel-ലെ `/api` mount-വും അതേ prefix-ലുള്ള Express mounts-ഉം താരതമ്യം ചെയ്തു. Express-ലെ പുതിയ routes, frontend മാത്രം പ്രതീക്ഷിക്കുന്ന routes, background jobs എന്നിവ ഈ കണക്കിന് പുറത്താണ്. Route പൊരുത്തമുള്ളിടത്തും request fields, response, permissions, database മാറ്റങ്ങൾ എന്നിവയ്ക്ക് വേറെ പരിശോധന ആവശ്യമാണ്.

പഴയ audit-ലെ 115 route-കളിൽ നാലെണ്ണം ഇപ്പോഴത്തെ Express source-ൽ രജിസ്റ്റർ ചെയ്തിട്ടുണ്ട്.

| API | നിലവിലെ സ്ഥിതി |
| --- | --- |
| `POST /api/student/logout` | Token revocation ഉണ്ട്. `revoked_sessions` migration staging-ൽ പരിശോധിക്കണം. |
| `POST /api/student/getStudentSections` | സ്വന്തം enrollment-ുകളുടെ പട്ടിക ലഭിക്കും. പഴയ data-യിലെ status/date fields-ഉം frontend response contract-ഉം പരിശോധിക്കണം. |
| `POST /api/student/getStudentSectionDetails` | സ്വന്തം enrollment-ലെ module/topic tree ലഭിക്കും. Locked content മറയ്ക്കുന്നുണ്ട്. Backfill, പഴയ status-ുകൾ, യഥാർത്ഥ ആരംഭ/അവസാന തീയതികൾ എന്നിവയ്ക്ക് പരിശോധന ബാക്കി. |
| `GET /api/student/tickets/list` | Student token ഉപയോഗിച്ച് സ്വന്തം tickets കാണാം. Admin portal-ന്റെ staff listing, filters, pagination, attachment delivery എന്നിവ ബാക്കി. |

## ഭാഗികമായി പൂർത്തിയായ APIകളും പ്രവർത്തനങ്ങളും

| മേഖലയും നിലവിലുള്ള APIകളും | ശേഷിക്കുന്ന ജോലി |
| --- | --- |
| **Authentication** — `POST /api/student/login`, `POST /api/student/register`, `POST /api/student/forgot-password`, `POST /api/student/reset-password` | Reset token hash ചെയ്ത് സൂക്ഷിക്കുകയും ഒറ്റത്തവണ ഉപയോഗിക്കുകയും ചെയ്യുന്ന code ഉണ്ട്. Email അയയ്ക്കുന്ന ഭാഗം, ഒരേ രീതിയിലുള്ള recovery response, enrollment കാലാവധി കഴിഞ്ഞുള്ള login behavior, registration communications എന്നിവ പൂർത്തിയാക്കണം. |
| **Students** — `GET /api/students`, `PUT /api/students/{id}`, profile/image, block/drop/unblock, login-status | List filters, account/enrollment state മാറ്റങ്ങൾ, staff-ന്റെ batch അടിസ്ഥാനത്തിലുള്ള access, search/details/export workflows എന്നിവ പൂർത്തിയാക്കണം. |
| **Staff/RBAC** — `GET/POST /api/institution-users`, `GET /api/institution-users/by-role`, `GET /api/institution-role/permissions` | Update/delete/reset ബാക്കി. Permission response code-ൽ നിർവചിച്ചിരിക്കുന്ന role പട്ടിക ഉപയോഗിക്കുന്നു. Laravel-ലെ role/form permissions-ഉം production role data-യും പരിശോധിച്ച് കേന്ദ്ര നയം നടപ്പാക്കണം. |
| **Curriculum** — programs, sections, modules, topics, special categories എന്നിവയുടെ list/create/update; program clone/delete | Section clone/delete, module/topic/category delete, topic priority, attachment delivery എന്നിവ ബാക്കി. നിലവിലുള്ള multipart requests, order/priority fields, clone-ന്റെ child records എന്നിവ പരിശോധിക്കണം. |
| **Batches / enrollment** — `/api/program-section-batches`, `/api/student-sections`, വിദ്യാർത്ഥിയുടെ course list/details | നിലവിലെ staff routes-ൽ batch list/create/show, enrollment CRUD എന്നിവയുണ്ട്. Legacy `/api/batches` contract, roster, assignment/removal, mentors, expected end date, onboarding notifications എന്നിവ ബാക്കി. പുതിയ enrollment-നുള്ള lesson progress initialization-ഉം നിലവിലുള്ള data-യ്ക്കുള്ള SQL backfill-ഉം staging-ൽ പരിശോധിക്കണം. |
| **Extensions** — `GET/POST /api/program-extensions`, `PUT /api/program-extensions/{id}` | ഒരേ `POST` Laravel-ൽ student-നും Express-ൽ staff-നും വേണ്ടിയാണ്. Student create/list, staff change-status contract എന്നിവ പൂർത്തിയാക്കണം. വീണ്ടും approve ചെയ്താലും end date ഒരിക്കൽ മാത്രം മാറുന്നുവെന്നും status/date മാറ്റം ഒരുമിച്ച് commit ചെയ്യുന്നതായും ഉറപ്പാക്കണം. |
| **Assessment / progress** — `POST /api/student-sections/assessment-answers`, `GET /api/student/assessment-answers`, `GET /api/topics/{id}/assessments`, topic/course completion, unlock request/approval | Student ownership, server-side marking, locked questions മറയ്ക്കൽ എന്നിവയ്ക്ക് code ഉണ്ട്. Legacy status values, ആവർത്തിച്ചുള്ള submissions/approvals, tutor/QA batch scope, grade → progress → unlock → completion flow എന്നിവ പരിശോധിക്കണം. |
| **Tickets** — `GET /api/student/tickets/list` | Staff listing-ൽ role, batch, assignee, filters, pagination എന്നിവ വേണം. Create/assign/reply/close, notifications, upload validation, അനുമതിയുള്ള attachment delivery എന്നിവ പൂർത്തിയാക്കണം. നിലവിലെ route attachment URL നിർമ്മിക്കുന്നു. Express static mounts-ൽ ആ ticket directory ഇല്ല. |
| **Finance** — എട്ട് `/api/fee-collections` routes | Schedule, collect, approve/cancel, installment update/delete എന്നിവയുടെ access scope, തുകയും history-യും reconcile ചെയ്യൽ, ആവർത്തിച്ച collect/approve requests, concurrent updates എന്നിവ DB ഉപയോഗിച്ച് പരിശോധിക്കണം. |
| **Leave / reports** — `/api/student-leaves`, proof/authorize, `/api/student-reports`, reason/report-head lookups | Role, batch, ownership checks, proof-file access, report target validation, list/filter response എന്നിവയ്ക്ക് end-to-end പരിശോധന ബാക്കി. |
| **Dashboard / notifications** — student/admin dashboard, daily quotes, mark-read/viewed | Student placement ശതമാനം നിലവിൽ സ്ഥിരമായ `0` ആണ്. Placement data ചേർത്ത് metrics, progress/date കണക്കുകൾ, ticket/enrollment/completion events-ൽ നിന്നുള്ള അറിയിപ്പുകൾ എന്നിവ പരിശോധിക്കണം. |

## നടപ്പാക്കേണ്ട ക്രമം

| ഘട്ടം | ചെയ്യേണ്ടത് | പൂർത്തിയായെന്ന് ഉറപ്പാക്കാൻ |
| --- | --- | --- |
| **1. Authentication, permissions, data** | Password recovery email, staff role/action permissions, batch ownership, staging-ലെ migration/backfill rehearsal. | Reset email ലഭിച്ച് token ഒരിക്കൽ മാത്രം ഉപയോഗിക്കാം. Logout കഴിഞ്ഞ token നിരസിക്കപ്പെടുന്നു. സ്വന്തം batch-ന് പുറത്തുള്ള data access നിരസിക്കുന്നു. Staging copy-യിൽ ticket/session schema-യും enrollment row counts-ഉം ഒത്തുനോക്കി. |
| **2. Batch, enrollment, learning** | Admin portal ഉപയോഗിക്കുന്ന batch/list/roster/assign routes, student search/details, mentor/date operations, course tree, assessment, progress, unlock. | Student-നും staff-നും ആവശ്യമായ response frontend-ൽ ലഭിക്കുന്നു. പുതിയതും പഴയതുമായ enrollment-ൽ lesson IDs/ordering ശരിയാണ്. പൂർത്തിയാക്കിയ lesson അല്ലെങ്കിൽ unlock വീണ്ടും അയച്ചാലും state തെറ്റുന്നില്ല. |
| **3. Tickets, extensions, finance, welfare** | Ticket workflow, private attachments, student extension request, staff approval, fee transactions, leave/report permissions. | Student ticket create മുതൽ staff close വരെ പൂർത്തിയാകും. വീണ്ടും approve ചെയ്താലും extension ഒരിക്കൽ മാത്രം കൂട്ടും. Fee totals/history പൊരുത്തപ്പെടുന്നു. മറ്റൊരാളുടെ proof/attachment തുറക്കാനാവില്ല. |
| **4. Storage, messaging, certificates, placement** | Private file access, email/queue/retry അടിസ്ഥാനസൗകര്യം, certificate generation/dispatch, placement companies/rounds/feedback, CV, WhatsApp onboarding/milestones. | File access നിയന്ത്രിതമാണ്. Retry ആവർത്തിച്ച dispatch ഉണ്ടാക്കുന്നില്ല. Certificate PDF/download/email, placement transitions, CV permissions എന്നിവ staging-ൽ പ്രവർത്തിക്കുന്നു. |
| **5. Content, live classes, chat, cutover** | Suggestions/posters, DynTube, addon courses, Zoom, chat REST/WebSocket, frontend contract comparison. | Student/admin/chat workflows staging-ൽ കടന്നുപോകുന്നു. Video/class access enrollment അടിസ്ഥാനത്തിൽ നിയന്ത്രിക്കുന്നു. Chat token exchange, reconnect, read receipts എന്നിവ പരിശോധിച്ചു. Cutover, backup, rollback rehearsal പൂർത്തിയായി. |

### നടപ്പാക്കുന്നതിന് മുമ്പ് സ്ഥിരീകരിക്കേണ്ട കാര്യങ്ങൾ

- **Role inventory.** Laravel seeder-ൽ Admin, Tutor, Quality Analyst, Placement Officer എന്നിവയുണ്ട്. Express permission code-ൽ Team Lead, Sales Analyst എന്നിവയും കാണുന്നു. Production role/form records ഒത്തുനോക്കി ഓരോ action-ന്റെയും scope നിശ്ചയിക്കണം.
- **Frontend route വ്യത്യാസങ്ങൾ.** Admin API slices-ൽ `GET /api/batches/{id}` പോലുള്ള calls കാണുന്നു. ഇത്തരത്തിലുള്ള calls Laravel `routes/api.php`-യിലെ 197 entries-ൽ ഉൾപ്പെടുന്നുണ്ടോ എന്നും screen അവ ഉപയോഗിക്കുന്നുണ്ടോ എന്നും cutover-ന് മുമ്പ് പരിശോധിക്കണം.
- **പഴയ data.** Enrollment/module/topic status-ിലെ case വ്യത്യാസങ്ങളും stale dates-ഉം പരിശോധിക്കുക. Backfill കഴിഞ്ഞ് നിലവിലുള്ള progress, answer IDs, ticket attachments എന്നിവ sample records ഉപയോഗിച്ച് ഒത്തുനോക്കുക.
- **Legacy utilities.** `/api/logs/*`, video debug/cache, public video aliases, `/api/test`, `/api/user` എന്നിവയുടെ caller dependency പരിശോധിച്ച് ഏതൊക്കെ സുരക്ഷിതമായി നിലനിർത്തണമെന്നു തീരുമാനിക്കുക. Express-ൽ `GET /health` ഉണ്ട്.
- **പരിശോധനയുടെ പരിധി.** ഈ രേഖ source comparison അടിസ്ഥാനമാക്കിയുള്ളതാണ്. API tests, staging DB migration, provider credentials, production frontend cutover എന്നിവ ഈ രേഖയ്ക്കായി പ്രവർത്തിപ്പിച്ചിട്ടില്ല.

## ഒരേ method/path ലഭ്യമല്ലാത്ത Laravel APIകൾ (111)

താഴെ കൊടുത്തിരിക്കുന്നത് Laravel-ലെ യഥാർത്ഥ path ആണ്. Batch list/create പോലുള്ള ചില പ്രവർത്തനങ്ങൾക്ക് Express-ൽ മറ്റൊരു path ഉണ്ട്. Staff extension update പോലുള്ള പ്രവർത്തനങ്ങൾക്ക് method/contract വ്യത്യാസമുണ്ട്.

### ബാച്ചും എൻറോൾമെന്റും (10)

| രീതി | Laravel പാത |
| --- | --- |
| `GET` | `/api/batches` |
| `POST` | `/api/batches` |
| `PUT` | `/api/batches/{id}` |
| `DELETE` | `/api/batches/{id}` |
| `POST` | `/api/student-sections/assign` |
| `GET` | `/api/student-sections/batch-students` |
| `GET` | `/api/students/by-section` |
| `POST` | `/api/student-sections/update-expected-end-date` |
| `POST` | `/api/student-sections/mentors` |
| `DELETE` | `/api/batches/{batch_id}/students/{student_id}` |

### വിദ്യാർത്ഥി ഭരണനിർവഹണം (5)

| രീതി | Laravel പാത |
| --- | --- |
| `POST` | `/api/student/details` |
| `POST` | `/api/students/export` |
| `GET` | `/api/students/details` |
| `GET` | `/api/students/search` |
| `GET` | `/api/students/export/download` |

### സ്റ്റാഫ് അക്കൗണ്ടുകൾ (3)

| രീതി | Laravel പാത |
| --- | --- |
| `POST` | `/api/institution-users/{id}/update` |
| `POST` | `/api/institution-users/{id}/delete` |
| `POST` | `/api/institution-users/reset-password` |

### പാഠ്യപദ്ധതി (7)

| രീതി | Laravel പാത |
| --- | --- |
| `GET` | `/api/topic-files/{topic}` |
| `POST` | `/api/sections/clone` |
| `DELETE` | `/api/sections/{id}` |
| `DELETE` | `/api/modules/{id}` |
| `DELETE` | `/api/topics/{id}` |
| `POST` | `/api/topics/{id}/priority` |
| `POST` | `/api/special-categories/{id}/delete` |

### കോഴ്സ് കാലാവധി നീട്ടൽ (2)

| രീതി | Laravel പാത |
| --- | --- |
| `POST` | `/api/program-extensions/{id}/change-status` |
| `GET` | `/api/student/program-extensions` |

### സപ്പോർട്ട് ടിക്കറ്റുകൾ (4)

| രീതി | Laravel പാത |
| --- | --- |
| `POST` | `/api/student/tickets` |
| `POST` | `/api/student-tickets/{id}/assign` |
| `POST` | `/api/student-tickets/{id}/reply` |
| `POST` | `/api/student-tickets/close` |

### നിർദേശങ്ങൾ (6)

| രീതി | Laravel പാത |
| --- | --- |
| `POST` | `/api/suggestions` |
| `GET` | `/api/suggestions` |
| `GET` | `/api/suggestions/{id}` |
| `DELETE` | `/api/suggestions/{id}` |
| `POST` | `/api/suggestions/change-status` |
| `GET` | `/api/student/suggessions` |

### പോസ്റ്ററുകൾ (4)

| രീതി | Laravel പാത |
| --- | --- |
| `GET` | `/api/posters` |
| `POST` | `/api/posters` |
| `POST` | `/api/posters/{id}` |
| `DELETE` | `/api/posters/{id}` |

### സർട്ടിഫിക്കറ്റുകൾ (6)

| രീതി | Laravel പാത |
| --- | --- |
| `GET` | `/api/certificate-files/{id}` |
| `GET` | `/api/certificate-types` |
| `GET` | `/api/student-section-certificates` |
| `POST` | `/api/student-section-certificates` |
| `POST` | `/api/student-section-certificates/{id}/generate` |
| `POST` | `/api/student-section-certificates/send-email` |

### പ്ലേസ്മെന്റ് (16)

| രീതി | Laravel പാത |
| --- | --- |
| `POST` | `/api/student-sections/mark-self-placed` |
| `GET` | `/api/placement-types` |
| `POST` | `/api/placements/feedback` |
| `GET` | `/api/placements/feedbacks` |
| `GET` | `/api/placements/feedbacks/{student_section_id}` |
| `DELETE` | `/api/placements/feedbacks/{id}` |
| `POST` | `/api/placements/send-email` |
| `GET` | `/api/placement-officer/students` |
| `GET` | `/api/placement-companies` |
| `POST` | `/api/placement-companies` |
| `POST` | `/api/placement-companies/approve-auth-status` |
| `POST` | `/api/placement-companies/assign-student` |
| `POST` | `/api/placement-companies/update` |
| `POST` | `/api/placement-companies/soft-delete` |
| `POST` | `/api/placement-details/change-status` |
| `POST` | `/api/placement-details/fetch` |

### വിദ്യാർത്ഥികളുടെ CV (4)

| രീതി | Laravel പാത |
| --- | --- |
| `POST` | `/api/student-cv/{id}/cv` |
| `GET` | `/api/student-cv/{id}/cv` |
| `DELETE` | `/api/student-cv/{id}/cv` |
| `GET` | `/api/student-cv/details` |

### S3 സ്റ്റോറേജ് (2)

| രീതി | Laravel പാത |
| --- | --- |
| `POST` | `/api/s3/presigned-upload-url` |
| `POST` | `/api/s3/presigned-download-url` |

### DynTube വീഡിയോ (8)

| രീതി | Laravel പാത |
| --- | --- |
| `GET` | `/api/videos/{videoId}` |
| `GET` | `/api/videos/{videoId}/play-url` |
| `GET` | `/api/videos/{videoId}/debug` |
| `POST` | `/api/videos/batch` |
| `DELETE` | `/api/videos/{videoId}/cache` |
| `GET` | `/api/public/videos/{videoId}` |
| `GET` | `/api/public/videos/{videoId}/play-url` |
| `POST` | `/api/public/videos/batch` |

### അധിക കോഴ്സുകൾ (14)

| രീതി | Laravel പാത |
| --- | --- |
| `GET` | `/api/addon-courses` |
| `POST` | `/api/addon-courses` |
| `GET` | `/api/addon-courses/{id}` |
| `POST` | `/api/addon-courses/{id}/update` |
| `POST` | `/api/addon-courses/{id}/videos` |
| `GET` | `/api/addon-courses/{id}/videos` |
| `PUT` | `/api/addon-courses/{id}/videos/{videoId}` |
| `GET` | `/api/addon-courses/{id}/students` |
| `DELETE` | `/api/addon-courses/{id}` |
| `DELETE` | `/api/addon-courses/{id}/videos/{videoId}` |
| `GET` | `/api/student/addon-courses` |
| `POST` | `/api/student/addon-courses/{id}/start` |
| `GET` | `/api/student/addon-courses/{id}/videos` |
| `POST` | `/api/addon-courses/videos/complete` |

### ലൈവ് ക്ലാസുകളും Zoom-ഉം (8)

| രീതി | Laravel പാത |
| --- | --- |
| `GET` | `/api/live-classes` |
| `POST` | `/api/zoom/meeting-signature` |
| `GET` | `/api/zoom-accounts` |
| `POST` | `/api/live-classes` |
| `PUT` | `/api/live-classes/{id}` |
| `DELETE` | `/api/live-classes/{id}` |
| `GET` | `/api/student/live-classes` |
| `POST` | `/api/student/zoom/meeting-signature` |

### ചാറ്റ് (7)

| രീതി | Laravel പാത |
| --- | --- |
| `POST` | `/api/chat/auth/exchange` |
| `POST` | `/api/chat/token` |
| `GET` | `/api/chat/recipients` |
| `GET` | `/api/chat/conversations` |
| `GET` | `/api/chat/messages` |
| `POST` | `/api/chat/messages` |
| `POST` | `/api/chat/conversations/{conversationId}/read` |

### സിസ്റ്റം സഹായ APIകളും ഇമെയിലും (5)

| രീതി | Laravel പാത |
| --- | --- |
| `GET` | `/api/user` |
| `GET` | `/api/test` |
| `POST` | `/api/send-email` |
| `GET` | `/api/logs/list` |
| `GET` | `/api/logs/view` |

## റഫറൻസുകൾ

- [Laravel API routes](../knovista-web-api/routes/api.php) · [Express app/router mounts](src/app.ts)
- [Laravel architecture, API, database](../knovista-web-api/docs/01-COMPLETE-BACKEND-ARCHITECTURE-AND-API-DOCUMENTATION.md) · [Technical and security audit](../knovista-web-api/docs/02-BACKEND-TECHNICAL-AUDIT-SECURITY-AND-ISSUES.md) · [Express migration guide](../knovista-web-api/docs/03-LARAVEL-TO-EXPRESS-TYPESCRIPT-MIGRATION-AND-IMPLEMENTATION-GUIDE.md)
- [പഴയ മലയാളം migration audit](MIGRATION-STATUS-AND-GAP-AUDIT-ML.md) · [Laravel chat contract](../knovista-web-api/docs/CHAT_API.md)
- [Express auth routes](src/modules/auth/presentation/routes/authRoutes.ts) · [Batch/enrollment routes](src/modules/batch/presentation/routes/batchRoutes.ts) · [Ticket list route](src/modules/tickets/presentation/routes/studentTicketRoutes.ts) · [Lesson progress backfill](prisma/migrations/20261127000100_backfill_student_lesson_progress/migration.sql)
- [Admin batch API](../knovista-web-admin-app/src/store/api/batchesApiSlice.ts) · [Admin ticket API](../knovista-web-admin-app/src/store/api/ticketsApiSlice.ts)
