import { IDiaryRepository } from '../../data/repositories/IDiaryRepository';

/**
 * UseCase: 일기 삭제
 */
export class DeleteDiaryUseCase {
  constructor(private readonly repo: IDiaryRepository) {}

  async execute(id: string): Promise<void> {
    await this.repo.delete(id);
  }
}
