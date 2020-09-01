import { getCustomRepository } from 'typeorm';
import { Router } from 'express';
import multer from 'multer';

import uploadConfig from '../config/upload';
import TransactionRepository from '../repositories/TransactionsRepository';

import CreateTransactionService from '../services/CreateTransactionService';
import DeleteTransactionService from '../services/DeleteTransactionService';
import ImportTransactionsService from '../services/ImportTransactionsService';

const transactionsRouter = Router();
const upload = multer(uploadConfig);

transactionsRouter.get('/', async (request, response) => {
  const transactionsRepository = getCustomRepository(TransactionRepository);
  const transactions = await transactionsRepository.find({
    relations: ['category_id'],
  });

  const balance = await transactionsRepository.getBalance();

  const formattedTransactions = transactions.map(transaction => ({
    id: transaction.id,
    title: transaction.title,
    value: transaction.value,
    type: transaction.type,
    category: transaction.category_id,
    created_at: transaction.created_at,
    updated_at: transaction.updated_at,
    category_id: transaction.category_id.id,
  }));

  return response.status(200).json({
    transactions: formattedTransactions,
    balance,
  });
});

transactionsRouter.post('/', async (request, response) => {
  const { title, value, type, category } = request.body;

  const CreateTransaction = new CreateTransactionService();

  const transaction = await CreateTransaction.execute({
    title,
    value,
    type,
    category,
  });

  return response.status(200).json(transaction);
});

transactionsRouter.delete('/:id', async (request, response) => {
  const { id } = request.params;

  const deleteTransaction = new DeleteTransactionService();

  await deleteTransaction.execute(id);

  return response.status(204).send();
});

transactionsRouter.post(
  '/import',
  upload.single('file'),
  async (request, response) => {
    const importTransaction = new ImportTransactionsService();

    const transaction = await importTransaction.execute(request.file.filename);

    return response.status(200).json(transaction);
  },
);

export default transactionsRouter;
