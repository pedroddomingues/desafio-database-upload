import { EntityRepository, Repository } from 'typeorm';

import Transaction from '../models/Transaction';

interface Balance {
  income: number;
  outcome: number;
  total: number;
}

@EntityRepository(Transaction)
class TransactionsRepository extends Repository<Transaction> {
  transactionsRepository: TransactionsRepository;

  constructor(transactionsRepository: TransactionsRepository) {
    super();
    this.transactionsRepository = transactionsRepository;
  }

  public async getBalance(): Promise<Balance> {
    const trans = await this.find();
    const income = trans.reduce((acc: number, transaction: Transaction) => {
      if (transaction.type === 'income') {
        return acc + transaction.value;
      }
      return acc;
    }, 0);

    const outcome = trans.reduce((acc: number, transaction: Transaction) => {
      if (transaction.type === 'outcome') {
        return acc + transaction.value;
      }
      return acc;
    }, 0);

    const total = income - outcome;

    return { income, outcome, total };
  }
}

export default TransactionsRepository;
