import csvParse from 'csv-parse';
import fs from 'fs';
import path from 'path';
import Transaction from '../models/Transaction';
import CreateTransactionService from './CreateTransactionService';

interface TransactionCSV {
  title: string;
  type: 'income' | 'outcome';
  value: number;
  category: string;
}

class ImportTransactionsService {
  async execute(filename: string): Promise<Transaction[]> {
    const csvTransactions: TransactionCSV[] = [];

    const transactionRepository = new CreateTransactionService();

    const csvFilePath = path.resolve(__dirname, '..', '..', 'tmp', filename);

    const readCSVStream = fs.createReadStream(csvFilePath);

    const parseStream = csvParse({
      from_line: 2,
      ltrim: true,
      rtrim: true,
    });

    const parseCSV = readCSVStream.pipe(parseStream);

    await parseCSV.on('data', line => {
      const [title, type, value, category] = line;

      csvTransactions.push({ title, type, value, category });
    });

    await new Promise(resolve => {
      parseCSV.on('end', resolve);
    });

    const transactions: Transaction[] = [];

    csvTransactions.forEach(async csvTransaction => {
      const transaction = await transactionRepository.execute(csvTransaction);
      transactions.push(transaction);
    });

    return transactions;
  }
}

export default ImportTransactionsService;
