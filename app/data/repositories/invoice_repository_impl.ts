import { Failure } from '../../core/failures/failures';
import { Either } from '../../core/utils/either';
import { InvoiceEntity, InvoiceFilter } from '../../domain/entities/invoice_entity';
import { InvoiceRepository } from '../../domain/repositories/invoice_repository';
import { InvoiceRemoteDataSource } from '../datasources/invoice_remote_datasource';

export class InvoiceRepositoryImpl implements InvoiceRepository {
  constructor(private dataSource: InvoiceRemoteDataSource) {}

  async getInvoices(
    limit: number,
    skip: number,
    filter: InvoiceFilter
  ): Promise<Either<Failure, InvoiceEntity[]>> {
   
    return this.dataSource.fetchInvoices(limit, skip, filter);
  }
}