
import React, { useState, useMemo, FC } from 'react';
import { CrmData, Customer } from '../types';
import { SearchIcon, ViewIcon, EditIcon, DeleteIcon } from './icons';
import { useTranslation } from '../hooks/useTranslation';

// Reusable Modal Component
const Modal: FC<{ isOpen: boolean; onClose: () => void; title: string; children: React.ReactNode; size?: 'md' | 'lg' | 'xl' }> = ({ isOpen, onClose, title, children, size = 'lg' }) => {
    if (!isOpen) return null;
    const sizeClasses = { 'md': 'max-w-md', 'lg': 'max-w-lg', 'xl': 'max-w-xl' };
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

// Customer Form Component
const CustomerForm: FC<{ customer?: Customer | null; existingCustomers: Customer[]; onSave: (customer: Partial<Customer>) => void; onCancel: () => void; t: Function; }> = ({ customer, existingCustomers, onSave, onCancel, t }) => {
    const [formData, setFormData] = useState<Partial<Customer>>(customer || {});
    const [error, setError] = useState('');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setError('');
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Check for duplicates
        const duplicate = existingCustomers.find(c => 
            c.name === formData.name && 
            c.store === formData.store && 
            c.id !== customer?.id
        );

        if (duplicate) {
            setError(t('customerExists'));
            return;
        }

        onSave(formData);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {error && <div className="p-3 bg-red-100 text-red-700 rounded-lg text-sm dark:bg-red-900/50 dark:text-red-300">{error}</div>}
            <div>
                <label className="block text-sm font-medium text-subtext dark:text-dark-subtext mb-1">{t('customerName')} *</label>
                <input type="text" name="name" value={formData.name || ''} onChange={handleChange} required className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-primary" />
            </div>
            <div>
                <label className="block text-sm font-medium text-subtext dark:text-dark-subtext mb-1">{t('customerStore')} *</label>
                <input type="text" name="store" value={formData.store || ''} onChange={handleChange} required className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-primary" />
            </div>
            <div>
                <label className="block text-sm font-medium text-subtext dark:text-dark-subtext mb-1">{t('customerContact')} *</label>
                <input type="text" name="contact" value={formData.contact || ''} onChange={handleChange} required className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-primary" />
            </div>
            <div>
                <label className="block text-sm font-medium text-subtext dark:text-dark-subtext mb-1">{t('customerNotes')}</label>
                <textarea name="notes" value={formData.notes || ''} onChange={handleChange} rows={3} className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-primary"></textarea>
            </div>
            <div className="flex justify-end gap-4 pt-4">
                <button type="button" onClick={onCancel} className="px-4 py-2 bg-gray-200 rounded-lg dark:bg-gray-600">{t('cancel')}</button>
                <button type="submit" className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark">{t('saveCustomer')}</button>
            </div>
        </form>
    );
};

interface CustomersPageProps {
    data: CrmData;
    reloadData: () => void;
    t: (key: string) => string;
    formatDate: (date: string) => string;
    compactMode?: boolean;
    onSave: (customer: Customer) => void;
    onUpdate: (customer: Customer) => void;
    onDelete: (customerId: string) => void;
}

const CustomersPage: FC<Omit<CustomersPageProps, 't' | 'formatDate'> & ReturnType<typeof useTranslation>> = ({ data, reloadData, t, formatDate, compactMode, onSave, onUpdate, onDelete }) => {
    const { customers } = data;
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [modalState, setModalState] = useState<{ type: 'add' | 'edit' | 'delete' | null; customer: Customer | null }>({ type: null, customer: null });
    
    const itemsPerPage = 10;

    const filteredCustomers = useMemo(() => {
        return customers.filter(c => 
            c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            c.store.toLowerCase().includes(searchTerm.toLowerCase()) ||
            c.contact.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [customers, searchTerm]);

    const paginatedCustomers = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return filteredCustomers.slice(startIndex, startIndex + itemsPerPage);
    }, [filteredCustomers, currentPage]);

    const totalPages = Math.ceil(filteredCustomers.length / itemsPerPage);

    const handleSaveCustomer = (customerData: Partial<Customer>) => {
        const customerToSave = {
            ...modalState.customer,
            ...customerData,
            id: modalState.customer?.id || `customer_${Date.now()}`,
            createdAt: modalState.customer?.createdAt || new Date().toISOString()
        } as Customer;

        if (modalState.type === 'add') {
            onSave(customerToSave);
        } else if (modalState.type === 'edit') {
            onUpdate(customerToSave);
        }
        setModalState({ type: null, customer: null });
    };

    const confirmDeleteCustomer = () => {
        if (!modalState.customer) return;
        onDelete(modalState.customer.id);
        setModalState({ type: null, customer: null });
    };

    const rowPadding = compactMode ? 'py-2' : 'py-4';

    return (
        <div className="space-y-6">
            <div className="bg-white dark:bg-dark-card p-6 rounded-lg border border-stroke dark:border-dark-stroke">
                <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                    <h2 className="text-xl font-bold text-heading dark:text-dark-heading">{t('customerManagement')}</h2>
                    <div className="flex items-center gap-4 w-full md:w-auto">
                        <div className="relative w-full md:w-64">
                            <input 
                                type="text" 
                                placeholder={t('searchCustomers')} 
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-stroke dark:border-dark-stroke rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-transparent dark:text-dark-heading" 
                            />
                            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-subtext dark:text-dark-subtext" />
                        </div>
                        <button onClick={() => setModalState({ type: 'add', customer: null })} className="bg-primary text-white px-4 py-2 rounded-lg font-bold hover:bg-primary-dark transition-colors whitespace-nowrap">{t('addCustomer')}</button>
                    </div>
                </div>
            </div>

            <div className="bg-white dark:bg-dark-card rounded-lg border border-stroke dark:border-dark-stroke overflow-x-auto">
                <table className="w-full min-w-[800px]">
                    <thead>
                        <tr className="border-b border-stroke dark:border-dark-stroke">
                            <th className="py-3 px-4 text-left text-subtext dark:text-dark-subtext font-semibold">{t('customerName')}</th>
                            <th className="py-3 px-4 text-left text-subtext dark:text-dark-subtext font-semibold">{t('customerStore')}</th>
                            <th className="py-3 px-4 text-left text-subtext dark:text-dark-subtext font-semibold">{t('customerContact')}</th>
                            <th className="py-3 px-4 text-left text-subtext dark:text-dark-subtext font-semibold">{t('customerNotes')}</th>
                            <th className="py-3 px-4 text-right text-subtext dark:text-dark-subtext font-semibold">{t('actionsHeader')}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {paginatedCustomers.map(customer => (
                            <tr key={customer.id} className="border-b border-stroke dark:border-dark-stroke last:border-0 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                <td className={`${rowPadding} px-4 font-medium text-heading dark:text-dark-heading`}>{customer.name}</td>
                                <td className={`${rowPadding} px-4 text-subtext dark:text-dark-subtext`}>{customer.store}</td>
                                <td className={`${rowPadding} px-4 text-subtext dark:text-dark-subtext`}>{customer.contact}</td>
                                <td className={`${rowPadding} px-4 text-subtext dark:text-dark-subtext truncate max-w-xs`}>{customer.notes}</td>
                                <td className={`${rowPadding} px-4 text-right`}>
                                    <div className="flex justify-end items-center gap-3">
                                        <button onClick={() => setModalState({ type: 'edit', customer })} className="text-subtext dark:text-dark-subtext hover:text-primary"><EditIcon className="w-5 h-5" /></button>
                                        <button onClick={() => setModalState({ type: 'delete', customer })} className="text-subtext dark:text-dark-subtext hover:text-red-500"><DeleteIcon className="w-5 h-5" /></button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {paginatedCustomers.length === 0 && (
                            <tr>
                                <td colSpan={5} className="py-8 text-center text-subtext dark:text-dark-subtext">{t('noResults')}</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            <div className="flex justify-between items-center text-sm">
                 <span className="text-subtext dark:text-dark-subtext">{t('showing')} {filteredCustomers.length > 0 ? ((currentPage - 1) * itemsPerPage) + 1 : 0}-{Math.min(currentPage * itemsPerPage, filteredCustomers.length)} {t('of')} {filteredCustomers.length}</span>
                <div className="flex items-center gap-2">
                    <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="px-3 py-1 border border-stroke dark:border-dark-stroke rounded-lg disabled:opacity-50 text-subtext dark:text-dark-subtext">{t('previous')}</button>
                    <span className="font-bold text-heading dark:text-dark-heading">{currentPage} / {totalPages > 0 ? totalPages : 1}</span>
                    <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="px-3 py-1 border border-stroke dark:border-dark-stroke rounded-lg disabled:opacity-50 text-subtext dark:text-dark-subtext">{t('next')}</button>
                </div>
            </div>

            {/* Modals */}
            <Modal isOpen={modalState.type === 'add' || modalState.type === 'edit'} onClose={() => setModalState({ type: null, customer: null })} title={modalState.type === 'edit' ? t('editCustomer') : t('addNewCustomer')}>
                <CustomerForm 
                    customer={modalState.customer} 
                    existingCustomers={customers} 
                    onSave={handleSaveCustomer} 
                    onCancel={() => setModalState({ type: null, customer: null })} 
                    t={t} 
                />
            </Modal>

            <Modal isOpen={modalState.type === 'delete'} onClose={() => setModalState({ type: null, customer: null })} title={t('confirmDeletion')} size="md">
                <p>{t('confirmDeleteCustomer').replace('{name}', modalState.customer?.name || '')}</p>
                <div className="flex justify-end gap-4 mt-6">
                    <button onClick={() => setModalState({ type: null, customer: null })} className="px-4 py-2 bg-gray-200 rounded-lg dark:bg-gray-600">{t('cancel')}</button>
                    <button onClick={confirmDeleteCustomer} className="px-4 py-2 bg-red-600 text-white rounded-lg">{t('delete')}</button>
                </div>
            </Modal>
        </div>
    );
};

export default CustomersPage;
