START TRANSACTION;

INSERT INTO student_section_modules (student_id, student_section_id, module_id, status, unlock_requested)
SELECT enrollment.student_id,
       enrollment.id,
       curriculum.id,
       CASE WHEN curriculum.module_rank = 1 THEN 'Unlocked' ELSE 'Locked' END,
       FALSE
FROM student_sections AS enrollment
JOIN program_section_batches AS batch ON batch.id = enrollment.batch_id
JOIN (
    SELECT id, section_id, ROW_NUMBER() OVER (PARTITION BY section_id ORDER BY `order`, id) AS module_rank
    FROM modules
    WHERE status = 'Active'
) AS curriculum ON curriculum.section_id = batch.section_id
LEFT JOIN student_section_modules AS assigned
    ON assigned.student_section_id = enrollment.id AND assigned.module_id = curriculum.id
WHERE LOWER(enrollment.status) = 'active' AND assigned.id IS NULL;

INSERT INTO student_section_module_topics
    (student_id, student_section_module_id, topic_id, status, created_by)
SELECT enrollment.student_id,
       assigned.id,
       topic.id,
       CASE
           WHEN LOWER(assigned.status) IN ('active', 'unlocked', 'completed') THEN 'active'
           WHEN LOWER(assigned.status) = 'pending' THEN 'pending'
           ELSE 'new'
       END,
       enrollment.created_by
FROM student_sections AS enrollment
JOIN student_section_modules AS assigned ON assigned.student_section_id = enrollment.id
JOIN modules AS curriculum ON curriculum.id = assigned.module_id AND curriculum.status = 'Active'
JOIN topics AS topic ON topic.module_id = assigned.module_id AND topic.status = 'Active'
LEFT JOIN student_section_module_topics AS progress
    ON progress.student_section_module_id = assigned.id
    AND progress.student_id = enrollment.student_id
    AND progress.topic_id = topic.id
WHERE LOWER(enrollment.status) = 'active'
  AND LOWER(assigned.status) <> 'deleted'
  AND progress.id IS NULL;

COMMIT;
