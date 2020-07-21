/* eslint-disable no-param-reassign */
/* eslint-disable no-await-in-loop */
/* eslint-disable no-restricted-syntax */
import fs from 'fs';
import parse from 'csv-parse';

import Transaction from '../models/Transaction';
import AppError from '../errors/AppError';
import CreateTransactionService from './CreateTransactionService';

interface Request {
  path: string;
}

interface TransactionRequest {
  title: string;
  value: number;
  type: 'income' | 'outcome';
  category: string;
}

class ImportTransactionsService {
  async execute({ path }: Request): Promise<Transaction[]> {
    try {
      const createdTransactions: Transaction[] = [];
      const createTransaction = new CreateTransactionService();

      const parsedCSV = fs.createReadStream(path).pipe(
        parse(
          {
            delimiter: ',',
            columns: true,
            trim: true,
            cast: true,
          },
          async (_, transactions) => {
            for await (const transaction of transactions) {
              const createdTransaction = await createTransaction.execute(
                transaction,
              );
              createdTransactions.push(createdTransaction);
              if (createdTransactions.length === transactions.length) {
                parsedCSV.destroy();
              }
            }
          },
        ),
      );

      await new Promise(resolve =>
        parsedCSV.on('close', () => {
          resolve();
        }),
      );

      return createdTransactions;
    } catch (error) {
      throw new AppError(error);
    }
  }
}

export default ImportTransactionsService;
