import { Ionicons } from '@expo/vector-icons';
import React, { useEffect } from 'react';
import { ActivityIndicator, Button, FlatList, RefreshControl, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { InvoiceEntity } from '../../domain/entities/invoice_entity';
import { useInvoiceStore } from '../stores/invoice_store';


const POLLING_INTERVAL = 5000;

const InvoiceListScreen = () => {

  const invoices = useInvoiceStore(state => state.invoices);
  const loading = useInvoiceStore(state => state.loading);
  const loadingMore = useInvoiceStore(state => state.loadingMore);
  const error = useInvoiceStore(state => state.error);
  const hasMore = useInvoiceStore(state => state.hasMore);

  const fetchInvoices = useInvoiceStore(state => state.fetchInvoices);
  const searchQuery = useInvoiceStore(state => state.searchQuery);
  const setSearchQuery = useInvoiceStore(state => state.setSearchQuery);

 
  useEffect(() => {
   
    if (invoices.length === 0 && !loading && !loadingMore && !error) {
      fetchInvoices(true);
    }
    
    // Configuración del Polling
    const pollingInterval = setInterval(() => {
      fetchInvoices(true); 
    }, POLLING_INTERVAL);
    
    return () => clearInterval(pollingInterval);
    
  }, [invoices.length, loading, loadingMore, error, fetchInvoices]); 

 
  const loadMore = () => {
    if (!loading && !loadingMore && hasMore) {
      fetchInvoices(false);
    }
  };

 
  
  // --- Renderización del Ítem de la Lista ---
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
      
      {/* Sección de Estado con Ícono Condicional */}
      <View style={styles.itemRow}>
        <Text style={styles.itemTitle}>Status</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          
          {/* Ícono verde para COMPLETED */}
          {item.status === 'COMPLETED' && (
            <Ionicons 
              name="checkmark-circle-outline" 
              size={16} 
              color="green" 
              style={{ marginRight: 5 }} 
            />
          )}

          {/* Ícono rojo para EXPIRED */}
          {item.status === 'EXPIRED' && (
            <Ionicons 
              name="time-outline" 
              size={16} 
              color="red" 
              style={{ marginRight: 5 }} 
            />
          )}

          <Text style={styles.itemValue}>{item.status}</Text>
        </View>
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

  // --- Renderización Condicional de Carga y Error ---
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

  // --- Renderización Principal del Componente ---
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

// --- Estilos ---

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