import { ForbiddenError } from '../../../../shared/errors/ForbiddenError';
import { IAssessmentRepository } from '../../domain/repositories/IAssessmentRepository';
import { SaveAssessmentAnswersInput } from '../dto/AssessmentDTO';
import { StudentAssessmentAnswer } from '../../domain/entities/StudentAssessmentAnswer';

export class SaveAssessmentAnswersUseCase {
  constructor(private readonly assessmentRepository: IAssessmentRepository) {}

  async execute(dto: SaveAssessmentAnswersInput): Promise<StudentAssessmentAnswer[]> {
    const evaluatedAnswers = await Promise.all(
      dto.answers.map(async (item) => {
        let marks: boolean | undefined;
        if (marks === undefined) {
          const assessment = await this.assessmentRepository.findAssessmentById(item.assessment_id);
          if (!assessment || assessment.topicId !== item.topic_id || assessment.status !== 'Active') {
            throw new ForbiddenError('Assessment does not belong to the active topic');
          }
          if (assessment) {
            const correctAnswer = assessment.correctAnswer ?? assessment.answer;
            if (correctAnswer !== undefined && correctAnswer !== null) {
              const strCorrect = typeof correctAnswer === 'string' ? correctAnswer.trim().toLowerCase() : JSON.stringify(correctAnswer).toLowerCase();
              const strStudent = item.answer.trim().toLowerCase();
              marks = strCorrect === strStudent;
            } else {
              marks = false;
            }
          } else {
            marks = false;
          }
        }
        return {
          studentId: item.student_id,
          studentTopicId: item.student_topic_id,
          topicId: item.topic_id,
          assessmentId: item.assessment_id,
          answer: item.answer,
          marks,
        };
      })
    );

    const saved = await this.assessmentRepository.saveAssessmentAnswers(evaluatedAnswers);
    const studentTopicIds = Array.from(new Set(dto.answers.map((a) => a.student_topic_id)));

    await this.assessmentRepository.markStudentTopicsCompleted(studentTopicIds);
    await this.assessmentRepository.recalculateSectionProgressByStudentTopicIds(studentTopicIds);

    return saved;
  }
}

