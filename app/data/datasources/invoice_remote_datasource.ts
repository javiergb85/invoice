import { Failure, ServerFailure } from '../../core/failures/failures';
import { Either, left, right } from '../../core/utils/either';
import { InvoiceEntity, InvoiceFilter } from '../../domain/entities/invoice_entity';

 
const MOCK_INVOICES_LIST: InvoiceEntity[] = [
 
  {
    id: '1',
    amount: 150.75,
    status: 'COMPLETED',
    cryptoType: 'USDT-TRX',
    createdAt: '2025-07-01T10:00:00Z',
    expiresAt: '2025-07-02T10:00:00Z',
    customer: 'Javier Guevara',
  },
  {
    id: '2',
    amount: 220.00,
    status: 'COMPLETED',
    cryptoType: 'ETH',
    createdAt: '2025-07-10T14:30:00Z',
    expiresAt: '2025-07-11T14:30:00Z',
    customer: 'Juan Lastra'
  },
  {
    id: '2818',
    amount: 50.00,
    status: 'COMPLETED',
    cryptoType: 'TRX',
    createdAt: '2025-07-11T09:15:00Z',
    expiresAt: '2025-07-12T09:15:00Z',
    customer: 'Juan Lastra'
  },
  {
    id: '25',
    amount: 800.50,
    status: 'EXPIRED',
    cryptoType: 'USDT-ETH',
    createdAt: '2025-06-25T18:00:00Z',
    expiresAt: '2025-06-26T18:00:00Z',
    customer: 'Juan Lastra'
  },
  {
    id: '3',
    amount: 300.00,
    status: 'COMPLETED',
    cryptoType: 'USDT-TRX',
    createdAt: '2025-07-09T11:45:00Z',
    expiresAt: '2025-07-10T11:45:00Z',
    customer: 'Dat Tran'
  },
  {
    id: '4',
    amount: 300.00,
    status: 'COMPLETED',
    cryptoType: 'USDT-TRX',
    createdAt: '2025-07-09T11:45:00Z',
    expiresAt: '2025-07-10T11:45:00Z',
    customer: 'Juan Lastra'
  },
  {
    id: '1120',
    amount: 300.00,
    status: 'COMPLETED',
    cryptoType: 'USDT-TRX',
    createdAt: '2025-07-09T11:45:00Z',
    expiresAt: '2025-07-10T11:45:00Z',
    customer: 'Javier Guevara'
  },
];

// --- Interfaz del Data Source ---
 
export interface InvoiceRemoteDataSource {
  fetchInvoices(
    limit: number,
    skip: number,
    filter: InvoiceFilter
  ): Promise<Either<Failure, InvoiceEntity[]>>;
}

// --- Implementación de Mock Data Source ---
 
export class InvoiceRemoteDataSourceImpl implements InvoiceRemoteDataSource {

  async fetchInvoices(
    limit: number,
    skip: number,
    filter: InvoiceFilter
  ): Promise<Either<Failure, InvoiceEntity[]>> {
    
 
    await new Promise(resolve => setTimeout(resolve, 500));

    try {
      let filteredData = [...MOCK_INVOICES_LIST];
 
      if (filter.statuses && filter.statuses.length > 0) {
        filteredData = filteredData.filter(inv => 
          filter.statuses!.includes(inv.status)
        );
      }

   
      if (filter.cryptoTypes && filter.cryptoTypes.length > 0) {
        filteredData = filteredData.filter(inv => 
          filter.cryptoTypes!.includes(inv.cryptoType)
        );
      }

      
      const paginatedData = filteredData.slice(skip, skip + limit);

    
      return right(paginatedData);

    } catch (error: any) {
      console.error('Error durante la obtención de datos mock:', error);
      
      
      return left(new ServerFailure('An unexpected error occurred during mock data fetch'));
    }
  }
}