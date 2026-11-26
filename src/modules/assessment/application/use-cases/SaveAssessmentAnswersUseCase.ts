import { ForbiddenError } from '../../../../shared/errors/ForbiddenError';
import { IAssessmentRepository } from '../../domain/repositories/IAssessmentRepository';
import { SaveAssessmentAnswersInput } from '../dto/AssessmentDTO';
import { StudentAssessmentAnswer } from '../../domain/entities/StudentAssessmentAnswer';

export class SaveAssessmentAnswersUseCase {
  constructor(private readonly assessmentRepository: IAssessmentRepository) {}

  async execute(dto: SaveAssessmentAnswersInput): Promise<StudentAssessmentAnswer[]> {
    const evaluatedAnswers = await Promise.all(
      dto.answers.map(async (item) => {
        const assessment = await this.assessmentRepository.findAssessmentById(item.assessment_id);
        if (!assessment || assessment.topicId !== item.topic_id || assessment.status !== 'Active') {
          throw new ForbiddenError('Assessment does not belong to the active topic');
        }
        const correctAnswer = assessment.correctAnswer ?? assessment.answer;
        const expected = typeof correctAnswer === 'string' ? correctAnswer : correctAnswer == null ? undefined : JSON.stringify(correctAnswer);
        const marks = Boolean(expected && expected.trim().toLowerCase() === item.answer.trim().toLowerCase());
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

    return this.assessmentRepository.saveAssessmentAnswers(evaluatedAnswers);
  }
}
