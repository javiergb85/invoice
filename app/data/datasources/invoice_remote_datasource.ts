import { Failure, ServerFailure } from '../../core/failures/failures';
import { Either, left, right } from '../../core/utils/either';
import { InvoiceEntity, InvoiceFilter } from '../../domain/entities/invoice_entity';

// --- Datos Simulados Estáticos ---
// Usamos una lista de facturas pre-creada para simular el origen de datos.
const MOCK_INVOICES_LIST: InvoiceEntity[] = [
  // Facturas de ejemplo para la simulación
  {
    id: 'INV-00001',
    amount: 150.75,
    status: 'COMPLETED',
    cryptoType: 'USDT-TRX',
    createdAt: '2025-07-01T10:00:00Z',
    expiresAt: '2025-07-02T10:00:00Z',
  },
  {
    id: 'INV-00002',
    amount: 220.00,
    status: 'PENDING',
    cryptoType: 'ETH',
    createdAt: '2025-07-10T14:30:00Z',
    expiresAt: '2025-07-11T14:30:00Z',
  },
  {
    id: 'INV-00003',
    amount: 50.00,
    status: 'CREATED',
    cryptoType: 'TRX',
    createdAt: '2025-07-11T09:15:00Z',
    expiresAt: '2025-07-12T09:15:00Z',
  },
  {
    id: 'INV-00004',
    amount: 800.50,
    status: 'EXPIRED',
    cryptoType: 'USDT-ETH',
    createdAt: '2025-06-25T18:00:00Z',
    expiresAt: '2025-06-26T18:00:00Z',
  },
  {
    id: 'INV-00005',
    amount: 300.00,
    status: 'COMPLETED',
    cryptoType: 'USDT-TRX',
    createdAt: '2025-07-09T11:45:00Z',
    expiresAt: '2025-07-10T11:45:00Z',
  },
  {
    id: 'INV-00006',
    amount: 300.00,
    status: 'COMPLETED',
    cryptoType: 'USDT-TRX',
    createdAt: '2025-07-09T11:45:00Z',
    expiresAt: '2025-07-10T11:45:00Z',
  },
  {
    id: 'INV-00007',
    amount: 300.00,
    status: 'COMPLETED',
    cryptoType: 'USDT-TRX',
    createdAt: '2025-07-09T11:45:00Z',
    expiresAt: '2025-07-10T11:45:00Z',
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