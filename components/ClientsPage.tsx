
import React, { useState, useMemo, FC, useEffect } from 'react';
import { CrmData, Client, FollowUpRecord, Customer } from '../types';
import { SearchIcon, ViewIcon, EditIcon, DeleteIcon } from './icons';
import { useTranslation } from '../hooks/useTranslation';

// --- Reusable Modal Component ---
const Modal: FC<{ isOpen: boolean; onClose: () => void; title: string; children: React.ReactNode; size?: 'md' | 'lg' | 'xl' | '2xl' | '4xl' }> = ({ isOpen, onClose, title, children, size = '2xl' }) => {
    if (!isOpen) return null;
    const sizeClasses = {
        'md': 'max-w-md', 'lg': 'max-w-lg', 'xl': 'max-w-xl', '2xl': 'max-w-2xl', '4xl': 'max-w-4xl'
    };
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4 animate-fade-in" onClick={onClose}>
            <div className={`bg-white dark:bg-dark-card rounded-lg shadow-xl w-full ${sizeClasses[size]} max-h-[90vh] flex flex-col animate-slide-in-bottom`} onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center p-4 border-b dark:border-dark-stroke">
                    <h2 className="text-lg font-bold text-heading dark:text-dark-heading">{title}</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white text-2xl font-bold">&times;</button>
                </div>
                <div className="p-6 overflow-y-auto">
                    {children}
                </div>
            </div>
        </div>
    );
};

// --- Client Form Component ---
const InquiryForm: FC<{ client?: Client | null; customers: Customer[]; onSave: (client: Partial<Client>) => void; onCancel: () => void; t: Function; }> = ({ client, customers, onSave, onCancel, t }) => {
    const [formData, setFormData] = useState<Partial<Client>>(
        client || { status: '待跟进', intentionLevel: '中', inquiryDate: new Date().toISOString().split('T')[0] }
    );
    const [customerSearch, setCustomerSearch] = useState('');
    const [showDropdown, setShowDropdown] = useState(false);

    useEffect(() => {
        setFormData(client || { status: '待跟进', intentionLevel: '中', inquiryDate: new Date().toISOString().split('T')[0] });
        if (client) {
             const linkedCustomer = customers.find(c => c.id === client.customerId);
             if (linkedCustomer) {
                 setCustomerSearch(`${linkedCustomer.name} - ${linkedCustomer.store}`);
             } else {
                 setCustomerSearch(client.name); // Fallback
             }
        }
    }, [client, customers]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };
    
    const handleSelectCustomer = (customer: Customer) => {
        setFormData(prev => ({
            ...prev,
            customerId: customer.id,
            name: customer.name,
            store: customer.store,
            contact: customer.contact
        }));
        setCustomerSearch(`${customer.name} - ${customer.store}`);
        setShowDropdown(false);
    }

    const filteredCustomers = useMemo(() => {
        if (!customerSearch) return [];
        const lower = customerSearch.toLowerCase();
        return customers.filter(c => 
            c.name.toLowerCase().includes(lower) || 
            c.store.toLowerCase().includes(lower) ||
            c.contact.includes(lower)
        ).slice(0, 8); // Limit results
    }, [customers, customerSearch]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
    };

    const InputField: FC<{ name: keyof Client, label: string, required?: boolean, type?: string }> = ({ name, label, required, type = 'text' }) => (
        <div>
            <label className="block text-sm font-medium text-subtext dark:text-dark-subtext mb-1">{label} {required && '*'}</label>
            <input type={type} name={name} value={String(formData[name] || '')} onChange={handleChange} className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-primary" required={required} />
        </div>
    );
    
    const SelectField: FC<{ name: keyof Client, label: string, options: {value: string, label: string}[], required?: boolean}> = ({ name, label, options, required}) => (
        <div>
            <label className="block text-sm font-medium text-subtext dark:text-dark-subtext mb-1">{label} {required && '*'}</label>
            <select name={name} value={formData[name] || ''} onChange={handleChange} className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-primary" required={required}>
                {options.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
            </select>
        </div>
    );

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <h3 className="text-lg font-semibold border-b pb-2 mb-4 dark:border-dark-stroke">{t('customerInformation')}</h3>
            
            {/* Customer Selection Dropdown */}
            <div className="relative">
                 <label className="block text-sm font-medium text-subtext dark:text-dark-subtext mb-1">{t('selectCustomer')} *</label>
                 <input 
                    type="text" 
                    value={customerSearch} 
                    onChange={e => { setCustomerSearch(e.target.value); setShowDropdown(true); }}
                    onFocus={() => setShowDropdown(true)}
                    placeholder={t('searchCustomerPlaceholder')}
                    className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                 />
                 {showDropdown && customerSearch && (
                     <div className="absolute z-10 w-full bg-white dark:bg-dark-card border border-stroke dark:border-dark-stroke mt-1 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                         {filteredCustomers.length > 0 ? filteredCustomers.map(c => (
                             <div 
                                key={c.id} 
                                onClick={() => handleSelectCustomer(c)}
                                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer border-b border-gray-100 dark:border-gray-700 last:border-0"
                             >
                                 <div className="font-bold text-heading dark:text-dark-heading">{c.name}</div>
                                 <div className="text-xs text-subtext">{c.store} - {c.contact}</div>
                             </div>
                         )) : (
                             <div className="p-2 text-sm text-subtext">{t('noResults')}</div>
                         )}
                     </div>
                 )}
                 {/* Overlay to close dropdown */}
                 {showDropdown && <div className="fixed inset-0 z-0" onClick={() => setShowDropdown(false)}></div>}
            </div>

            {/* Read-only preview of selected customer details */}
            {formData.name && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-3 bg-gray-50 dark:bg-gray-700/50 rounded">
                    <div>
                        <span className="text-xs text-subtext">{t('name')}</span>
                        <p className="font-semibold dark:text-gray-200">{formData.name}</p>
                    </div>
                    <div>
                        <span className="text-xs text-subtext">{t('store')}</span>
                        <p className="font-semibold dark:text-gray-200">{formData.store}</p>
                    </div>
                </div>
            )}
            
            <h3 className="text-lg font-semibold border-b pb-2 my-4 dark:border-dark-stroke">{t('inquiryInformation')}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <SelectField name="inquiryType" label={t('inquiryType')} required options={[
                    { value: "散客线路", label: t('inquiry_tour') }, { value: "单团报价", label: t('inquiry_group') },
                    { value: "单订项目", label: t('inquiry_single') }, { value: "其他", label: t('inquiry_other') }
                ]} />
                <SelectField name="intentionLevel" label={t('intentionLevel')} required options={[
                    { value: "高", label: t('intention_high') }, { value: "中", label: t('intention_medium') }, { value: "低", label: t('intention_low') }
                ]} />
                <InputField name="inquiryDate" label={t('inquiryDate')} type="date" required />
                 <SelectField name="status" label={t('status')} required options={[
                    { value: "待跟进", label: t('status_pending') }, { value: "跟进中", label: t('status_in_progress') },
                    { value: "已成交", label: t('status_completed') }, { value: "未成单", label: t('status_failed') }, { value: "已失效", label: t('status_expired') }
                ]} />
            </div>
             <div>
                <label className="block text-sm font-medium text-subtext dark:text-dark-subtext mb-1">{t('inquiryDetails')}</label>
                <textarea name="inquiryDetails" value={formData.inquiryDetails || ''} onChange={handleChange} rows={3} className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-primary"></textarea>
            </div>
             <div>
                <label className="block text-sm font-medium text-subtext dark:text-dark-subtext mb-1">{t('notes')}</label>
                <textarea name="notes" value={formData.notes || ''} onChange={handleChange} rows={2} className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-primary"></textarea>
            </div>
            
            <div className="flex justify-end gap-4 pt-4">
                <button type="button" onClick={onCancel} className="px-4 py-2 bg-gray-200 rounded-lg dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500">{t('cancel')}</button>
                <button type="submit" className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark">{t('saveClient')}</button>
            </div>
        </form>
    );
};

interface ClientsPageProps {
  data: CrmData; 
  reloadData: () => void;
  onViewClient: (client: Client) => void;
  compactMode?: boolean;
  onSave: (client: Client) => void;
  onUpdate: (client: Client) => void;
  onDelete: (clientId: string) => void;
}

const ClientsPage: FC<Omit<ClientsPageProps, 't'|'formatDate'|'locale'> & ReturnType<typeof useTranslation>> = ({ data, reloadData, onViewClient, t, formatDate, compactMode, onSave, onUpdate, onDelete }) => {
  const { clients, customers } = data; 
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [intentionFilter, setIntentionFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState<{ key: keyof Client, direction: 'ascending' | 'descending' } | null>({ key: 'createdAt', direction: 'descending' });
  
  const [modalState, setModalState] = useState<{ type: 'add' | 'edit' | 'delete' | null; client: Client | null; }>({ type: null, client: null });
  
  const itemsPerPage = 10;
  
  const handleAction = (type: 'add' | 'edit' | 'delete' | 'view', client: Client | null = null) => {
    if (type === 'view' && client) {
      onViewClient(client);
    } else if (type !== 'view') {
      setModalState({ type, client });
    }
  };
  
  const closeModal = () => {
    setModalState({ type: null, client: null });
  };
  
  const handleSaveClient = (clientData: Partial<Client>) => {
    const clientToSave = {
        ...modalState.client, 
        ...clientData, 
        id: modalState.client?.id || `client_${Date.now()}`,
        createdAt: modalState.client?.createdAt || new Date().toISOString()
    } as Client;
    
    if (modalState.type === 'add') {
        onSave(clientToSave);
    } else if (modalState.type === 'edit') {
        onUpdate(clientToSave);
    }
    closeModal();
  };

  const confirmDeleteClient = () => {
    if (!modalState.client) return;
    onDelete(modalState.client.id);
    closeModal();
  }

  const filteredAndSortedClients = useMemo(() => {
    let sortableItems = [...clients];

    sortableItems = sortableItems.filter(client => {
      const lowerSearch = searchTerm.toLowerCase();
      const matchesSearch = searchTerm === '' || 
        client.name.toLowerCase().includes(lowerSearch) ||
        client.store.toLowerCase().includes(lowerSearch) ||
        client.contact.toLowerCase().includes(lowerSearch);
      
      const matchesStatus = statusFilter === 'all' || client.status === statusFilter;
      const matchesIntention = intentionFilter === 'all' || client.intentionLevel === intentionFilter;

      return matchesSearch && matchesStatus && matchesIntention;
    });

    if (sortConfig !== null) {
      sortableItems.sort((a, b) => {
        const valA = a[sortConfig.key];
        const valB = b[sortConfig.key];
        if (valA === null || valA === undefined) return 1;
        if (valB === null || valB === undefined) return -1;
        if (valA < valB) return sortConfig.direction === 'ascending' ? -1 : 1;
        if (valA > valB) return sortConfig.direction === 'ascending' ? 1 : -1;
        return 0;
      });
    }

    return sortableItems;
  }, [clients, searchTerm, statusFilter, intentionFilter, sortConfig]);

  const paginatedClients = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredAndSortedClients.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredAndSortedClients, currentPage]);

  const totalPages = Math.ceil(filteredAndSortedClients.length / itemsPerPage);

  const requestSort = (key: keyof Client) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };
  
  const getSortIndicator = (key: keyof Client) => {
    if (!sortConfig || sortConfig.key !== key) return null;
    return sortConfig.direction === 'ascending' ? '▲' : '▼';
  }
  
  const statusClasses: Record<Client['status'], string> = {
    '已成交': 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300', '跟进中': 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300',
    '待跟进': 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/50 dark:text-yellow-300', '未成单': 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300',
    '已失效': 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-400'
  };

  const rowPadding = compactMode ? 'py-2' : 'py-4';

  return (
    <div className="space-y-6">
        <div className="bg-white dark:bg-dark-card p-6 rounded-lg border border-stroke dark:border-dark-stroke">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <h2 className="text-xl font-bold text-heading dark:text-dark-heading">{t('clientManagement')}</h2>
                <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
                    <div className="relative w-full md:w-64">
                        <input type="text" placeholder={t('searchClients')} value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-stroke dark:border-dark-stroke rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-transparent dark:text-dark-heading" />
                        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-subtext dark:text-dark-subtext" />
                    </div>
                    <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="w-full md:w-auto px-4 py-2 border border-stroke dark:border-dark-stroke rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-transparent dark:bg-dark-card dark:text-dark-heading">
                        <option value="all">{t('allStatuses')}</option>
                        <option value="待跟进">{t('status_pending')}</option><option value="跟进中">{t('status_in_progress')}</option><option value="已成交">{t('status_completed')}</option><option value="未成单">{t('status_failed')}</option><option value="已失效">{t('status_expired')}</option>
                    </select>
                    <select value={intentionFilter} onChange={e => setIntentionFilter(e.target.value)} className="w-full md:w-auto px-4 py-2 border border-stroke dark:border-dark-stroke rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-transparent dark:bg-dark-card dark:text-dark-heading">
                        <option value="all">{t('allIntentions')}</option>
                        <option value="高">{t('intention_high')}</option><option value="中">{t('intention_medium')}</option><option value="低">{t('intention_low')}</option>
                    </select>
                    <button onClick={() => handleAction('add')} className="w-full md:w-auto bg-primary text-white px-4 py-2 rounded-lg font-bold hover:bg-primary-dark transition-colors">{t('addClient')}</button>
                </div>
            </div>
        </div>

      <div className="bg-white dark:bg-dark-card rounded-lg border border-stroke dark:border-dark-stroke overflow-x-auto">
        <table className="w-full min-w-[1000px]">
          <thead>
            <tr className="border-b border-stroke dark:border-dark-stroke">
              <th className="py-3 px-4 text-left text-subtext dark:text-dark-subtext font-semibold cursor-pointer" onClick={() => requestSort('name')}>{t('clientNameHeader')} {getSortIndicator('name')}</th>
              <th className="py-3 px-4 text-left text-subtext dark:text-dark-subtext font-semibold cursor-pointer" onClick={() => requestSort('store')}>{t('storeHeader')} {getSortIndicator('store')}</th>
              <th className="py-3 px-4 text-left text-subtext dark:text-dark-subtext font-semibold cursor-pointer" onClick={() => requestSort('inquiryType')}>{t('inquiryTypeHeader')} {getSortIndicator('inquiryType')}</th>
              <th className="py-3 px-4 text-left text-subtext dark:text-dark-subtext font-semibold cursor-pointer" onClick={() => requestSort('intentionLevel')}>{t('intentionLevelHeader')} {getSortIndicator('intentionLevel')}</th>
              <th className="py-3 px-4 text-left text-subtext dark:text-dark-subtext font-semibold cursor-pointer" onClick={() => requestSort('inquiryDate')}>{t('inquiryDateHeader')} {getSortIndicator('inquiryDate')}</th>
              <th className="py-3 px-4 text-left text-subtext dark:text-dark-subtext font-semibold cursor-pointer" onClick={() => requestSort('status')}>{t('statusHeader')} {getSortIndicator('status')}</th>
              <th className="py-3 px-4 text-right text-subtext dark:text-dark-subtext font-semibold">{t('actionsHeader')}</th>
            </tr>
          </thead>
          <tbody>
            {paginatedClients.map(client => (
              <tr key={client.id} className="border-b border-stroke dark:border-dark-stroke last:border-0 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                <td className={`${rowPadding} px-4 font-medium text-heading dark:text-dark-heading`}>{client.name}</td>
                <td className={`${rowPadding} px-4 text-subtext dark:text-dark-subtext`}>{client.store}</td>
                <td className={`${rowPadding} px-4 text-subtext dark:text-dark-subtext`}>{t(
                    client.inquiryType === '散客线路' ? 'inquiry_tour' :
                    client.inquiryType === '单团报价' ? 'inquiry_group' :
                    client.inquiryType === '单订项目' ? 'inquiry_single' :
                    'inquiry_other'
                )}</td>
                <td className={`${rowPadding} px-4 text-subtext dark:text-dark-subtext`}>{t(
                    client.intentionLevel === '高' ? 'intention_high' :
                    client.intentionLevel === '中' ? 'intention_medium' :
                    'intention_low'
                )}</td>
                <td className={`${rowPadding} px-4 text-subtext dark:text-dark-subtext`} suppressHydrationWarning>{formatDate(client.inquiryDate)}</td>
                <td className={`${rowPadding} px-4`}><span className={`px-2 py-1 text-xs font-bold rounded-md ${statusClasses[client.status]}`}>{t(
                    client.status === '待跟进' ? 'status_pending' :
                    client.status === '跟进中' ? 'status_in_progress' :
                    client.status === '已成交' ? 'status_completed' :
                    client.status === '未成单' ? 'status_failed' :
                    'status_expired'
                )}</span></td>
                <td className={`${rowPadding} px-4 text-right`}>
                  <div className="flex justify-end items-center gap-3">
                    <button onClick={() => handleAction('view', client)} className="text-subtext dark:text-dark-subtext hover:text-primary"><ViewIcon className="w-5 h-5" /></button>
                    <button onClick={() => handleAction('edit', client)} className="text-subtext dark:text-dark-subtext hover:text-primary"><EditIcon className="w-5 h-5" /></button>
                    <button onClick={() => handleAction('delete', client)} className="text-subtext dark:text-dark-subtext hover:text-red-500"><DeleteIcon className="w-5 h-5" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

       <div className="flex justify-between items-center text-sm">
        <span className="text-subtext dark:text-dark-subtext">{t('showing')} {filteredAndSortedClients.length > 0 ? ((currentPage - 1) * itemsPerPage) + 1 : 0}-{Math.min(currentPage * itemsPerPage, filteredAndSortedClients.length)} {t('of')} {filteredAndSortedClients.length}</span>
        <div className="flex items-center gap-2">
            <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="px-3 py-1 border border-stroke dark:border-dark-stroke rounded-lg disabled:opacity-50 text-subtext dark:text-dark-subtext">{t('previous')}</button>
            <span className="font-bold text-heading dark:text-dark-heading">{currentPage} / {totalPages > 0 ? totalPages : 1}</span>
            <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="px-3 py-1 border border-stroke dark:border-dark-stroke rounded-lg disabled:opacity-50 text-subtext dark:text-dark-subtext">{t('next')}</button>
        </div>
      </div>
      
       <Modal isOpen={modalState.type === 'add' || modalState.type === 'edit'} onClose={closeModal} title={modalState.type === 'edit' ? t('editClient') : t('addNewClient')} size="2xl">
           <InquiryForm client={modalState.client} customers={customers} onSave={handleSaveClient} onCancel={closeModal} t={t} />
       </Modal>
       
       <Modal isOpen={modalState.type === 'delete'} onClose={closeModal} title={t('confirmDeletion')} size="md">
            <p>{t('confirmDeleteClient').replace('{clientName}', modalState.client?.name || '')}</p>
            <div className="flex justify-end gap-4 mt-6">
                <button onClick={closeModal} className="px-4 py-2 bg-gray-200 rounded-lg dark:bg-gray-600">{t('cancel')}</button>
                <button onClick={confirmDeleteClient} className="px-4 py-2 bg-red-600 text-white rounded-lg">{t('delete')}</button>
            </div>
       </Modal>
    </div>
  );
};

export default ClientsPage;
