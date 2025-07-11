 
import { Failure } from '../../core/failures/failures';
import { Either } from '../../core/utils/either';
import { InvoiceEntity, InvoiceFilter } from '../entities/invoice_entity';

export interface InvoiceRepository {
  getInvoices(
    limit: number,
    skip: number,
    filter: InvoiceFilter
  ): Promise<Either<Failure, InvoiceEntity[]>>;
}