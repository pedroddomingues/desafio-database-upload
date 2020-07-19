/* eslint-disable no-param-reassign */
/* eslint-disable no-await-in-loop */
/* eslint-disable no-restricted-syntax */
import fs from 'fs';
import neatCsv from 'neat-csv';

import Transaction from '../models/Transaction';
import AppError from '../errors/AppError';
import CreateTransactionService from './CreateTransactionService';
import TransactionsRepository from '../repositories/TransactionsRepository';

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
    const createdTransactions: Transaction[] = [];

    try {
      fs.readFile(path, async (err, data) => {
        if (err) {
          throw new AppError('Could not import from csv');
        }
        const transactions = await neatCsv<TransactionRequest>(data, {
          headers: ['title', 'type', 'value', 'category'],
          skipLines: 1,
          mapValues: ({ index, value }) => {
            if (index === 2) {
              value = parseInt(value, 10);
            }
            return value;
          },
        });
        const createTransaction = new CreateTransactionService();

        async function createTransactions(): Promise<void> {
          for (const transaction of transactions) {
            const createdTransaction = await createTransaction.execute(
              transaction,
            );
            console.log(createdTransaction);
            createdTransactions.push(createdTransaction);
          }
        }
        await createTransactions();
        console.log(createdTransactions);
      });
      return createdTransactions;
    } catch (error) {
      throw new AppError('Could not import from csv');
    }
  }
}

export default ImportTransactionsService;
