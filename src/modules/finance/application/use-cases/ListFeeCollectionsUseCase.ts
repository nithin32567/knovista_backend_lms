import { FeeCollectionGroup } from '../../domain/entities/FeeCollectionGroup';
import {
  IFeeCollectionRepository,
  FeeCollectionFilter,
} from '../../domain/repositories/IFeeCollectionRepository';

export class ListFeeCollectionsUseCase {
  constructor(private readonly feeCollectionRepository: IFeeCollectionRepository) {}

  async execute(filter: FeeCollectionFilter): Promise<FeeCollectionGroup[]> {
    return this.feeCollectionRepository.findGrouped(filter);
  }
}
