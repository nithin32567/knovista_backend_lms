import { describe, it, expect, vi } from 'vitest';
import { TopicAssessment } from '../../modules/assessment/domain/entities/TopicAssessment';
import { StudentAssessmentAnswer } from '../../modules/assessment/domain/entities/StudentAssessmentAnswer';
import { IAssessmentRepository, SaveAssessmentAnswerInput } from '../../modules/assessment/domain/repositories/IAssessmentRepository';
import { SaveAssessmentAnswersUseCase } from '../../modules/assessment/application/use-cases/SaveAssessmentAnswersUseCase';
import { GetStudentAssessmentAnswersUseCase } from '../../modules/assessment/application/use-cases/GetStudentAssessmentAnswersUseCase';
import { GetTopicAssessmentsUseCase } from '../../modules/assessment/application/use-cases/GetTopicAssessmentsUseCase';

describe('Assessment Module Unit Tests', () => {
  const dummyAssessment = new TopicAssessment({
    id: 1,
    topicId: 10,
    question: 'What is TypeScript?',
    options: ['Typed JS', 'CSS framework', 'Database', 'Operating System'],
    answer: 'Typed JS',
    correctAnswer: 'Typed JS',
    marks: 1,
    priority: 1,
    status: 'Active',
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  const dummyStudentAnswer = new StudentAssessmentAnswer({
    id: 1,
    studentId: 5,
    studentTopicId: 12,
    topicId: 10,
    topicAssessmentId: 1,
    answer: 'Typed JS',
    marks: true,
    question: 'What is TypeScript?',
    options: ['Typed JS', 'CSS framework', 'Database', 'Operating System'],
    correctAnswer: 'Typed JS',
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  describe('TopicAssessment Entity', () => {
    it('should format student response without revealing answer', () => {
      const res = dummyAssessment.toResponseObject(false);
      expect(res['id']).toBe(1);
      expect(res['question']).toBe('What is TypeScript?');
      expect(res['answer']).toBeUndefined();
      expect(res['correct_answer']).toBeUndefined();
    });

    it('should format staff response revealing answer and marks', () => {
      const res = dummyAssessment.toResponseObject(true);
      expect(res['id']).toBe(1);
      expect(res['answer']).toBe('Typed JS');
      expect(res['correct_answer']).toBe('Typed JS');
      expect(res['marks']).toBe(1);
    });
  });

  describe('StudentAssessmentAnswer Entity', () => {
    it('should format student review response object', () => {
      const res = dummyStudentAnswer.toResponseObject();
      expect(res.assessment_id).toBe(1);
      expect(res.marks).toBe(true);
      expect(res.answer).toBe('Typed JS');
      expect(res.correct_answer).toBe('Typed JS');
    });

    it('should format raw response object', () => {
      const res = dummyStudentAnswer.toRawResponseObject();
      expect(res.student_id).toBe(5);
      expect(res.student_topic_id).toBe(12);
      expect(res.marks).toBe(true);
    });
  });

  describe('GetTopicAssessmentsUseCase', () => {
    it('should return assessments for given topic id', async () => {
      const mockRepo: IAssessmentRepository = {
        findAssessmentsByTopicId: vi.fn().mockResolvedValue([dummyAssessment]),
        findAssessmentById: vi.fn(),
        saveAssessmentAnswers: vi.fn(),
        getStudentAssessmentAnswers: vi.fn(),
      };

      const useCase = new GetTopicAssessmentsUseCase(mockRepo);
      const result = await useCase.execute(10);

      expect(result).toHaveLength(1);
      expect(result[0]?.question).toBe('What is TypeScript?');
      expect(mockRepo.findAssessmentsByTopicId).toHaveBeenCalledWith(10);
    });
  });

  describe('GetStudentAssessmentAnswersUseCase', () => {
    it('should return student answers for given student and topic', async () => {
      const mockRepo: IAssessmentRepository = {
        findAssessmentsByTopicId: vi.fn(),
        findAssessmentById: vi.fn(),
        saveAssessmentAnswers: vi.fn(),
        getStudentAssessmentAnswers: vi.fn().mockResolvedValue([dummyStudentAnswer]),
      };

      const useCase = new GetStudentAssessmentAnswersUseCase(mockRepo);
      const result = await useCase.execute(5, 10);

      expect(result).toHaveLength(1);
      expect(result[0]?.marks).toBe(true);
      expect(mockRepo.getStudentAssessmentAnswers).toHaveBeenCalledWith(5, 10);
    });
  });

  describe('SaveAssessmentAnswersUseCase', () => {
    it('should auto-evaluate marks and complete topics', async () => {
      const mockRepo: IAssessmentRepository = {
        findAssessmentsByTopicId: vi.fn(),
        findAssessmentById: vi.fn().mockResolvedValue(dummyAssessment),
        saveAssessmentAnswers: vi.fn().mockImplementation(async (answers: SaveAssessmentAnswerInput[]) => {
          return answers.map((a: SaveAssessmentAnswerInput, idx: number) => new StudentAssessmentAnswer({
            id: idx + 1,
            studentId: a.studentId,
            studentTopicId: a.studentTopicId,
            topicId: a.topicId,
            topicAssessmentId: a.assessmentId,
            answer: a.answer,
            marks: a.marks ?? false,
            createdAt: new Date(),
            updatedAt: new Date(),
          }));
        }),
        getStudentAssessmentAnswers: vi.fn(),
      };

      const useCase = new SaveAssessmentAnswersUseCase(mockRepo);
      const result = await useCase.execute({
        answers: [
          {
            student_id: 5,
            student_topic_id: 12,
            topic_id: 10,
            assessment_id: 1,
            answer: 'Typed JS',
          },
        ],
      });

      expect(result).toHaveLength(1);
      expect(result[0]?.marks).toBe(true);
    });

    it('should reject forged marks when assessment does not exist', async () => {
      const mockRepo: IAssessmentRepository = {
        findAssessmentsByTopicId: vi.fn(),
        findAssessmentById: vi.fn(),
        saveAssessmentAnswers: vi.fn().mockImplementation(async (answers: SaveAssessmentAnswerInput[]) => {
          return answers.map((a: SaveAssessmentAnswerInput, idx: number) => new StudentAssessmentAnswer({
            id: idx + 1,
            studentId: a.studentId,
            studentTopicId: a.studentTopicId,
            topicId: a.topicId,
            topicAssessmentId: a.assessmentId,
            answer: a.answer,
            marks: a.marks ?? false,
            createdAt: new Date(),
            updatedAt: new Date(),
          }));
        }),
        getStudentAssessmentAnswers: vi.fn(),
      };

      const useCase = new SaveAssessmentAnswersUseCase(mockRepo);
      await expect(useCase.execute({
        answers: [
          {
            student_id: 5,
            student_topic_id: 12,
            topic_id: 10,
            assessment_id: 1,
            answer: 'Typed JS',
            marks: false,
          },
        ],
      })).rejects.toThrow('Assessment does not belong to the active topic');
      expect(mockRepo.saveAssessmentAnswers).not.toHaveBeenCalled();
    });
  });
});
