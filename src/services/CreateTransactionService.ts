// import AppError from '../errors/AppError';
import { getRepository, getCustomRepository } from 'typeorm';

import TransactionsRepository from '../repositories/TransactionsRepository';
import Transaction from '../models/Transaction';
import Category from '../models/Category';

interface Request {
  title: string;
  value: number;
  type: 'income' | 'outcome';
  category: string;
}

class CreateTransactionService {
  public async execute({
    title,
    value,
    type,
    category,
  }: Request): Promise<Transaction> {
    const transactionsRepository = getCustomRepository(TransactionsRepository);
    const categoriesRepository = getRepository(Category);

    let checkCategoryExists = await categoriesRepository.findOne({
      where: {
        title: category,
      },
    });

    if (!checkCategoryExists) {
      checkCategoryExists = categoriesRepository.create({
        title: category,
      });

      await categoriesRepository.save(checkCategoryExists);
    }

    const transaction = transactionsRepository.create({
      title,
      type,
      category_id: checkCategoryExists.id,
      value,
    });

    await transactionsRepository.save(transaction);

    return transaction;
  }
}

export default CreateTransactionService;
