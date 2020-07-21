import { getCustomRepository } from 'typeorm';
import AppError from '../errors/AppError';
import TransactionsRepository from '../repositories/TransactionsRepository';

interface Request {
  id: string;
}
class DeleteTransactionService {
  public async execute({ id }: Request): Promise<void> {
    try {
      const repository = getCustomRepository(TransactionsRepository);
      const transaction = await repository.findOne(id);

      if (!transaction) {
        throw new AppError('Couldnt delete transaction');
      }

      await repository.delete(id);

      return;
    } catch (error) {
      throw new AppError('Couldnt delete transaction');
    }
  }
}

export default DeleteTransactionService;
