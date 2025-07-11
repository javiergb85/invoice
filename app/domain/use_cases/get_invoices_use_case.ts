import { Failure } from '../../core/failures/failures';
import { Either } from '../../core/utils/either';
import { InvoiceEntity, InvoiceFilter } from '../entities/invoice_entity';
import { InvoiceRepository } from '../repositories/invoice_repository';

export class GetInvoicesUseCase {
  constructor(private repository: InvoiceRepository) {}

  async execute(
    limit: number,
    skip: number,
    filter: InvoiceFilter = { statuses: [], cryptoTypes: [] }
  ): Promise<Either<Failure, InvoiceEntity[]>> {
    return this.repository.getInvoices(limit, skip, filter);
  }
}