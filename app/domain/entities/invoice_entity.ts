export type InvoiceStatus = 'CREATED' | 'PENDING' | 'COMPLETED' | 'EXPIRED';
export type CryptoType = 'USDT-TRX' | 'USDT-ETH' | 'ETH' | 'TRX';

export interface InvoiceEntity {
  id: string;
  amount: number;
  status: InvoiceStatus;
  cryptoType: CryptoType;
  createdAt: string;
  expiresAt: string;
  customer: string;
}

export interface InvoiceFilter {
  statuses: InvoiceStatus[];
  cryptoTypes: CryptoType[];

}