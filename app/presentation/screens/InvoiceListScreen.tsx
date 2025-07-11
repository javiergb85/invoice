import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Button, FlatList, RefreshControl, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
 

// ---------------------------------------------
// VALORES DE PRUEBA Y DATOS MOCK
// ---------------------------------------------

export type InvoiceStatus = 'CREATED' | 'PENDING' | 'COMPLETED' | 'EXPIRED';
export type CryptoType = 'USDT-TRX' | 'USDT-ETH' | 'ETH' | 'TRX';

export interface InvoiceEntity {
  id: string;
  amount: number;
  status: InvoiceStatus;
  cryptoType: CryptoType;
  createdAt: string;
  expiresAt: string;
}

export interface InvoiceFilter {
  statuses: InvoiceStatus[];
  cryptoTypes: CryptoType[];
}

const STATUSES: InvoiceStatus[] = ['CREATED', 'PENDING', 'COMPLETED', 'EXPIRED'];
const CRYPTO_TYPES: CryptoType[] = ['USDT-TRX', 'USDT-ETH', 'ETH', 'TRX'];
const POLLING_INTERVAL = 5000;

const createMockInvoices = (count: number, startId: number): InvoiceEntity[] => {
  const mockInvoices: InvoiceEntity[] = [];
  for (let i = 0; i < count; i++) {
    const id = startId + i;
    const status = STATUSES[Math.floor(Math.random() * STATUSES.length)];
    const cryptoType = CRYPTO_TYPES[Math.floor(Math.random() * CRYPTO_TYPES.length)];
    
    mockInvoices.push({
      id: `INV-${id.toString().padStart(5, '0')}`,
      amount: Math.random() * 1000 + 50,
      status: status,
      cryptoType: cryptoType,
      createdAt: new Date().toISOString(),
      expiresAt: ''
    });
  }
  return mockInvoices;
};

// ---------------------------------------------
// COMPONENTE INVOICELISTSCREEN
// ---------------------------------------------

const InvoiceListScreen = () => {
  const [invoices, setInvoices] = useState<InvoiceEntity[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [filters, setFilters] = useState<InvoiceFilter>({ statuses: [], cryptoTypes: [] });
  const [searchQuery, setSearchQuery] = useState('');

  const mockFetchData = async (limit: number, skip: number, currentFilters: InvoiceFilter) => {
    await new Promise(resolve => setTimeout(resolve, 500)); 
    let mockData = createMockInvoices(limit, skip);
    
    if (currentFilters.statuses.length > 0) {
      mockData = mockData.filter(inv => currentFilters.statuses.includes(inv.status));
    }
    if (currentFilters.cryptoTypes.length > 0) {
      mockData = mockData.filter(inv => currentFilters.cryptoTypes.includes(inv.cryptoType));
    }
    if (searchQuery) {
      mockData = mockData.filter(inv => inv.id.includes(searchQuery));
    }
    const mockHasMore = currentPage < 3; 
    return { data: mockData, hasMore: mockHasMore };
  };

  const fetchInvoices = async (reset = false) => {
    if (!reset && (loading || loadingMore || !hasMore)) {
      return;
    }
    const limit = 20;
    const skip = reset ? 0 : currentPage * limit;
    if (reset) {
      setLoading(true);
      setError(null);
    } else {
      setLoadingMore(true);
    }
    try {
      const result = await mockFetchData(limit, skip, filters);
      setInvoices(prevInvoices => reset ? result.data : [...prevInvoices, ...result.data]);
      setCurrentPage(prevPage => prevPage + 1);
      setHasMore(result.hasMore);
      setError(null);
    } catch (err: any) {
      setError(err);
      setHasMore(false);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const applyFilters = (newFilters: InvoiceFilter) => {
    setFilters(newFilters);
    setCurrentPage(0);
    setInvoices([]); 
    fetchInvoices(true);
  };

  useEffect(() => {
    if (invoices.length === 0 && !loading && !loadingMore && !error) {
      fetchInvoices(true);
    }
    const pollingInterval = setInterval(() => {
      fetchInvoices(true); 
    }, POLLING_INTERVAL);
    return () => clearInterval(pollingInterval);
  }, [fetchInvoices, invoices.length, loading, loadingMore, error]);

  const loadMore = () => {
    if (!loading && !loadingMore && hasMore) {
      fetchInvoices(false);
    }
  };
  
  // --- Renderización del Item de la Lista ---
  const renderItem = ({ item }: { item: InvoiceEntity }) => (
    <View style={styles.invoiceItem}>
      <View style={styles.itemRow}>
        <Text style={styles.itemTitle}>Order Id</Text>
        <Text style={styles.itemValue}>{item.id}</Text>
      </View>
      <View style={styles.itemRow}>
        <Text style={styles.itemTitle}>Amount</Text>
        <Text style={styles.itemValue}>${item.amount.toFixed(2)} {item.cryptoType}</Text>
      </View>
      <View style={styles.itemRow}>
        <Text style={styles.itemTitle}>Creation & Expiration</Text>
        <View style={{ alignItems: 'flex-end' }}>
          <Text style={styles.itemValue}>{new Date(item.createdAt).toLocaleDateString()}</Text>
          {item.expiresAt && <Text style={styles.itemValue}>{new Date(item.expiresAt).toLocaleDateString()}</Text>}
        </View>
      </View>
      <View style={styles.itemRow}>
        <Text style={styles.itemTitle}>Customer</Text>
        <Text style={styles.itemValue}>{'N/A'}</Text>
      </View>
      <View style={styles.itemRow}>
        <Text style={styles.itemTitle}>Status</Text>
        <Text style={styles.itemValue}>{item.status}</Text>
      </View>
    </View>
  );

  const renderFooter = () => {
    if (!loadingMore) return null;
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" />
      </View>
    );
  };

  if (loading && invoices.length === 0) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
        <Text>Cargando facturas...</Text>
      </View>
    );
  }

  if (error && invoices.length === 0) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Error al cargar: {error.message}</Text>
        <Button title="Reintentar" onPress={() => fetchInvoices(true)} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      
      {/* Sección de Cabecera y Búsqueda */}
      <View style={styles.headerContainer}>
        <Text style={styles.headerTitle}>Invoices</Text>
        
        <View style={styles.filterSearchRow}>
          {/* Botón Filters */}
          <TouchableOpacity 
            style={styles.filterButton} 
            onPress={() => alert('Abrir filtros avanzados')}
          >
            <Ionicons name="filter-outline" size={24} color="teal" style={styles.filterIcon} />
            <Text style={styles.filterButtonText}>Filters</Text>
          </TouchableOpacity>
          
          {/* Barra de Búsqueda */}
          <View style={styles.searchContainer}>
            <Ionicons name="search-outline" size={20} color="#888" style={styles.searchIcon} />
            <TextInput
              style={styles.searchBar}
              placeholder="Search"
              placeholderTextColor="#888"
              value={searchQuery}
              onChangeText={setSearchQuery}
              onSubmitEditing={() => fetchInvoices(true)}
            />
          </View>
        </View>
      </View>

      {/* Sección de Acciones (Exportar y Crear) */}
      <View style={styles.actionRow}>
        {/* Botón Export */}
        <TouchableOpacity 
          style={styles.exportButton} 
          onPress={() => alert('Exportar facturas')}
        >
          <Text style={styles.filterButtonText}>Export</Text>
        </TouchableOpacity>

        {/* Botón Create Invoice */}
        <TouchableOpacity 
          style={styles.createButton} 
          onPress={() => alert('Crear nueva factura')}
        >
          <Text style={styles.createButtonText}>Create Invoice</Text>
        </TouchableOpacity>
      </View>

      {/* Lista de Facturas */}
      <FlatList
        data={invoices}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={renderFooter}
        refreshControl={
          <RefreshControl 
            refreshing={loading} 
            onRefresh={() => fetchInvoices(true)} 
          />
        }
        ListEmptyComponent={
          !loading && !error && invoices.length === 0 
            ? (
                <Text style={styles.emptyList}>No se encontraron facturas.</Text>
              )
            : null
        }
      />
    </View>
  );
};



const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: '#262626', 
  },
  headerContainer: {
    backgroundColor: '#262626',
    padding: 15,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 15,
    alignSelf: 'flex-start', 
  },
  filterSearchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    justifyContent: 'flex-end', 
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 15,
    backgroundColor: '#262626',
    borderColor: 'teal',
    borderWidth: 1,
    borderRadius: 4,
    marginRight: 10,
  },
  filterIcon: {
    marginRight: 5,
  },
  filterButtonText: {
    color: 'teal',
    fontWeight: 'bold',
  },

  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#383838',
    borderRadius: 8,
    height: 44,
    paddingHorizontal: 10,
    width: 180, 
  },
  searchIcon: {
    marginRight: 8,
  },
  searchBar: {
    flex: 1,
    color: '#fff',
    fontSize: 16,
    paddingVertical: 10,
  },

  actionRow: {
    flexDirection: 'row',
    backgroundColor: '#262626',
    paddingHorizontal: 10,
    paddingVertical: 10,
    alignItems: 'center',
    gap: 10, 
  },
  exportButton: {
    flex: 1, 
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    backgroundColor: '#262626',
    borderColor: 'teal',
    borderWidth: 1,
    borderRadius: 4,
  },
  createButton: {
    flex: 1, 
    backgroundColor: 'teal',
    paddingVertical: 10,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  createButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },

  invoiceList: {
    flex: 1,
    paddingHorizontal: 10,
    paddingTop: 10,
  },
  invoiceItem: {
    backgroundColor: '#131313',
    padding: 8, 
    marginVertical: 4,
    marginHorizontal: 10,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#262626',
    
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  itemTitle: {
    color: '#fff',
    fontWeight: 'bold',
  },
  itemValue: {
    color: '#fff',
    textAlign: 'right',
  },
  
  footerLoader: {
    paddingVertical: 20,
  },
  emptyList: {
    textAlign: 'center',
    marginTop: 20,
    color: '#fff',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: 'red',
    marginVertical: 10,
  },
});

export default InvoiceListScreen;