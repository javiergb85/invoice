import { create } from "zustand";
import { Failure } from "../../core/failures/failures";
import { Either, fold } from "../../core/utils/either";
import { InvoiceRemoteDataSourceImpl } from "../../data/datasources/invoice_remote_datasource";
import {
    InvoiceEntity,
    InvoiceFilter,
} from "../../domain/entities/invoice_entity";

const dataSource = new InvoiceRemoteDataSourceImpl();

interface InvoiceState {
  invoices: InvoiceEntity[];
  loading: boolean;
  loadingMore: boolean;
  error: Failure | null;
  hasMore: boolean;
  currentPage: number;
  filters: InvoiceFilter;
  searchQuery: string;

  setSearchQuery: (query: string) => void;
  fetchInvoices: (reset: boolean) => Promise<void>;
  applyFilters: (newFilters: InvoiceFilter) => void;
}

export const useInvoiceStore = create<InvoiceState>((set, get) => ({
  invoices: [],
  loading: false,
  loadingMore: false,
  error: null,
  hasMore: true,
  currentPage: 0,
  filters: { statuses: [], cryptoTypes: [] },
  searchQuery: "",

  setSearchQuery: (query) => set({ searchQuery: query }),

  applyFilters: (newFilters) => {
    set({
      filters: newFilters,
      currentPage: 0,
      invoices: [],
    });

    get().fetchInvoices(true);
  },

  fetchInvoices: async (reset = false) => {
    const state = get();

    if (!reset && (state.loading || state.loadingMore || !state.hasMore)) {
      return;
    }

    const limit = 20;
    const skip = reset ? 0 : state.currentPage * limit;

    if (reset) {
      set({ loading: true, error: null });
    } else {
      set({ loadingMore: true });
    }

    try {
      const result: Either<Failure, InvoiceEntity[]> =
        await dataSource.fetchInvoices(limit, skip, state.filters);

      fold(
        result,

        (failure) => {
          set({ error: failure, hasMore: false });
        },

        (data) => {
          set((state) => ({
            invoices: reset ? data : [...state.invoices, ...data],
            currentPage: state.currentPage + 1,
            hasMore: data.length === limit,
            error: null,
          }));
        }
      );
    } catch (err: any) {
     
      set({
        error: new Failure(err.message || "Error inesperado"),
        hasMore: false,
      });
    } finally {
      set({ loading: false, loadingMore: false });
    }
  },
}));
