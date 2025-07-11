import { InvoiceRemoteDataSourceImpl } from "../data/datasources/invoice_remote_datasource";
import { InvoiceRepositoryImpl } from "../data/repositories/invoice_repository_impl";
import { GetInvoicesUseCase } from "../domain/use_cases/get_invoices_use_case";

 
 
const invoiceRemoteDataSource = new InvoiceRemoteDataSourceImpl();
const invoiceRepository = new InvoiceRepositoryImpl(invoiceRemoteDataSource);

 
const getInvoicesUseCase = new GetInvoicesUseCase(invoiceRepository);

 
export {
    getInvoicesUseCase
};
