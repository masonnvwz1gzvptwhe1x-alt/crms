
import React, { useState, useMemo, FC, useEffect } from 'react';
import { CrmData, Order, Client, Guide, Guest } from '../types';
import { SearchIcon, OrdersIcon, ViewIcon, EditIcon, DeleteIcon } from './icons';
import { useTranslation } from '../hooks/useTranslation';


// --- Reusable Modal Component ---
const Modal: FC<{ isOpen: boolean; onClose: () => void; title: string; children: React.ReactNode; size?: 'md' | 'lg' | 'xl' | '2xl' | '4xl' | '6xl' }> = ({ isOpen, onClose, title, children, size = '2xl' }) => {
    if (!isOpen) return null;
    const sizeClasses = {
        'md': 'max-w-md', 'lg': 'max-w-lg', 'xl': 'max-w-xl', '2xl': 'max-w-2xl', '4xl': 'max-w-4xl', '6xl': 'max-w-6xl'
    };
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4 animate-fade-in" onClick={onClose}>
            <div className={`bg-white dark:bg-dark-card rounded-lg shadow-xl w-full ${sizeClasses[size]} max-h-[90vh] flex flex-col animate-slide-in-bottom`} onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center p-4 border-b dark:border-dark-stroke flex-shrink-0">
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


// --- Order Form ---
const OrderForm: FC<{ order?: Order | null; clients: Client[]; onSave: (order: Partial<Order>) => void; onCancel: () => void; t: Function; }> = ({ order, clients, onSave, onCancel, t }) => {
    const [formData, setFormData] = useState<Partial<Order>>({});
    
    useEffect(() => {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const defaults: Partial<Order> = {
            orderStatus: '待出行',
            departureDate: new Date().toISOString().split('T')[0],
            customerSource: '同行',
            guides: [{} as Guide],
            guests: [{} as Guest],
        };
        setFormData(order || defaults);
    }, [order]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        const checked = (e.target as HTMLInputElement).checked;

        if (type === 'checkbox') {
            setFormData(prev => ({ ...prev, [name]: checked }));
        } else {
            const isNumber = type === 'number';
            setFormData(prev => ({ ...prev, [name]: isNumber ? (value === '' ? undefined : Number(value)) : value }));
        }
    };
    
    const handleDynamicListChange = <T,>(list: T[] | undefined, index: number, field: keyof T, value: any, setter: React.Dispatch<React.SetStateAction<Partial<Order>>>) => {
        const newList = [...(list || [])];
        newList[index] = { ...newList[index], [field]: value };
        setter(prev => ({...prev, [field.toString().includes('guide') ? 'guides' : 'guests']: newList}));
    };
    
    const addDynamicListItem = <T,>(list: T[] | undefined, setter: React.Dispatch<React.SetStateAction<Partial<Order>>>, key: 'guides' | 'guests') => {
        setter(prev => ({...prev, [key]: [...(list || []), {} as T]}));
    };
    
    const removeDynamicListItem = <T,>(list: T[] | undefined, index: number, setter: React.Dispatch<React.SetStateAction<Partial<Order>>>, key: 'guides' | 'guests') => {
        setter(prev => ({...prev, [key]: (list || []).filter((_, i) => i !== index)}));
    };


    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
    };

    type OrderInputKeys = Exclude<keyof Order, 'departurePending' | 'noSystemUpload' | 'contractSigned' | 'insurancePurchased' | 'confirmationSent' | 'groupNoticeSent' | 'guides' | 'guests'>;

    function InputField({ name, label, required = false, type = 'text' }: { name: OrderInputKeys; label: string; required?: boolean; type?: string; }) {
        return (
            <div>
                <label className="block text-sm font-medium text-subtext dark:text-dark-subtext mb-1">{label} {required && '*'}</label>
                <input type={type} name={name} value={String(formData[name] ?? '')} onChange={handleChange} className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600" required={required} />
            </div>
        );
    }
    
    function TextAreaField({ name, label, required = false }: { name: keyof Order; label: string; required?: boolean; }) {
        return (
            <div>
                <label className="block text-sm font-medium text-subtext dark:text-dark-subtext mb-1">{label} {required && '*'}</label>
                <textarea name={name} value={String(formData[name] || '')} onChange={handleChange} rows={3} className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600" required={required}></textarea>
            </div>
        );
    }
    
    function CheckboxField({ name, label }: { name: keyof Order; label: string; }) {
        return (
            <label className="flex items-center gap-2">
                <input type="checkbox" name={name} checked={!!formData[name]} onChange={handleChange} className="h-4 w-4 rounded text-primary focus:ring-primary" />
                <span className="text-sm">{label}</span>
            </label>
        )
    }

    function SelectField({ name, label, options, required = false, placeholder }: { name: keyof Order; label: string; options: {v: string, l: string}[], required?: boolean; placeholder?: string }) {
        return (
            <div>
                <label className="block text-sm font-medium text-subtext dark:text-dark-subtext mb-1">{label} {required && '*'}</label>
                <select name={name} value={String(formData[name] || '')} onChange={handleChange} className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600" required={required}>
                    {placeholder && <option value="">{placeholder}</option>}
                    {options.map(opt => <option key={opt.v} value={opt.v}>{opt.l}</option>)}
                </select>
            </div>
        );
    }
    
    function InputFieldDynamic<T>({list, index, field, label, required = false, type = 'text'}: {list: T[] | undefined, index: number, field: keyof T, label: string, required?: boolean, type?: string}) {
         return (
            <div>
                <label className="block text-xs font-medium text-subtext dark:text-dark-subtext mb-1">{label} {required && '*'}</label>
                <input type={type} value={String(list?.[index]?.[field] || '')} onChange={(e) => handleDynamicListChange(list, index, field, e.target.value, setFormData)} className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600" required={required} />
            </div>
        );
    }
    
    function SelectFieldDynamic<T>({list, index, field, label, options}: {list: T[] | undefined, index: number, field: keyof T, label: string, options: {v: string, l: string}[]}) {
         return (
            <div>
                <label className="block text-xs font-medium text-subtext dark:text-dark-subtext mb-1">{label}</label>
                <select value={String(list?.[index]?.[field] || '')} onChange={(e) => handleDynamicListChange(list, index, field, e.target.value, setFormData)} className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600">
                     {options.map(opt => <option key={opt.v} value={opt.v}>{opt.l}</option>)}
                </select>
            </div>
        );
    }
    
    function FormSection({title, children}: {title: string, children: React.ReactNode}) {
        return (
            <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <h3 className="text-lg font-semibold border-b pb-2 mb-4 dark:border-dark-stroke">{title}</h3>
                {children}
            </div>
        )
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* ... form sections ... */}
            <FormSection title={t('customerInformation')}>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <SelectField name="clientId" label={t('clientName')} options={clients.map(c => ({v: c.id, l: c.name}))} required placeholder={t('selectClient')} />
                    <InputField name="routeName" label={t('routeName')} required />
                 </div>
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <SelectField name="orderType" label={t('orderType')} options={[{v: "单团定制", l: "单团定制"}, {v: "散客出行", l: "散客出行"}, {v: "单订项目", l: "单订项目"}]} required />
                    <InputField name="participantCount" label={t('participantCount')} type="number" required />
                    <SelectField name="orderStatus" label={t('status')} options={[
                        {v: '待出行', l: t('status_pending_departure')}, {v: '行程中', l: t('status_in_progress_trip')}, 
                        {v: '已完成', l: t('status_completed_trip')}, {v: '已清账', l: t('status_settled_trip')}, {v: '已取消', l: t('status_cancelled_trip')}
                    ]} required />
                 </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InputField name="adultCount" label={t('adultCount')} type="number" />
                    <InputField name="childCount" label={t('childCount')} type="number" />
                 </div>
            </FormSection>

            <FormSection title={t('inquiryInformation')}>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InputField name="departureLocation" label={t('departureLocation')} />
                    <InputField name="returnLocation" label={t('returnLocation')} />
                 </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InputField name="departureDate" label={t('departureHeader')} type="date" required />
                    <InputField name="returnDate" label={t('returnDate')} type="date" />
                 </div>
                 <CheckboxField name="departurePending" label={t('departurePending')} />
            </FormSection>
            
            <FormSection title="来源与凭证">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <SelectField name="customerSource" label={t('customerSource')} options={[{v: '同行', l: t('source_agent')}, {v: '直客', l: t('source_direct')}]} required />
                 </div>
                 {formData.customerSource === '同行' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                        <InputField name="platformSystem" label={t('platformSystem')} />
                        <div className="pt-7">
                            <CheckboxField name="noSystemUpload" label={t('noSystemUpload')} />
                        </div>
                    </div>
                 )}
                  {formData.customerSource === '同行' && formData.noSystemUpload && <InputField name="paymentMethod" label={t('paymentMethod')} />}
                  {(formData.customerSource === '直客' || (formData.customerSource === '同行' && formData.noSystemUpload)) && (
                    <div className="mt-4 space-y-2">
                        <h4 className="font-semibold">{t('manualPaperwork')}</h4>
                        <CheckboxField name="contractSigned" label={t('contractSigned')} />
                        <CheckboxField name="insurancePurchased" label={t('insurancePurchased')} />
                    </div>
                  )}
            </FormSection>
            
            <FormSection title={t('transportation')}>
                <h4 className="font-semibold">{t('outboundTrip')}</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <SelectField name="outboundTransportType" label={t('transportType')} options={[{v:"飞机",l:"飞机"}, {v:"火车",l:"火车"}, {v:"高铁",l:"高铁"}, {v:"汽车",l:"汽车"}]} />
                    <div className="md:col-span-2"><InputField name="outboundTransportDetails" label={t('transportDetails')} /></div>
                </div>
                <h4 className="font-semibold mt-4">{t('returnTrip')}</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <SelectField name="returnTransportType" label={t('transportType')} options={[{v:"飞机",l:"飞机"}, {v:"火车",l:"火车"}, {v:"高铁",l:"高铁"}, {v:"汽车",l:"汽车"}]} />
                    <div className="md:col-span-2"><InputField name="returnTransportDetails" label={t('transportDetails')} /></div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <InputField name="transportCost" label={t('transportCost')} type="number" />
                    <div className="pt-7"><CheckboxField name="transportCostStatus" label={t('transportSelfHandled')} /></div>
                </div>
            </FormSection>
            
            <FormSection title={t('guides_guests')}>
                <h4 className="font-semibold">{t('guideInfo')}</h4>
                {(formData.guides || []).map((guide, index) => (
                    <div key={index} className="grid grid-cols-12 gap-2 items-end mb-2 p-2 border rounded">
                        <div className="col-span-12 md:col-span-3"><InputFieldDynamic list={formData.guides} index={index} field="prefix" label={t('guidePrefix')} /></div>
                        <div className="col-span-6 md:col-span-4"><InputFieldDynamic list={formData.guides} index={index} field="name" label={t('guideName')} required /></div>
                        <div className="col-span-6 md:col-span-4"><InputFieldDynamic list={formData.guides} index={index} field="phone" label={t('guidePhone')} required /></div>
                        <div className="col-span-12 md:col-span-1"><button type="button" onClick={() => removeDynamicListItem(formData.guides, index, setFormData, 'guides')} className="w-full text-red-500 p-2 text-sm">{t('remove')}</button></div>
                    </div>
                ))}
                <button type="button" onClick={() => addDynamicListItem(formData.guides, setFormData, 'guides')} className="text-sm text-primary">{t('addGuide')}</button>
                
                 <h4 className="font-semibold mt-4">{t('guestInfo')}</h4>
                {(formData.guests || []).map((guest, index) => (
                    <div key={index} className="grid grid-cols-12 gap-2 items-end mb-2 p-2 border rounded">
                        <div className="col-span-6 md:col-span-4"><InputFieldDynamic list={formData.guests} index={index} field="name" label={t('guestName')} required /></div>
                        <div className="col-span-6 md:col-span-4"><InputFieldDynamic list={formData.guests} index={index} field="phone" label={t('guestPhone')} required /></div>
                        <div className="col-span-12 md:col-span-3"><SelectFieldDynamic list={formData.guests} index={index} field="role" label={t('guestRole')} options={[{v:"", l:t('select_placeholder')}, {v:"游客代表", l:t('role_representative')}, {v:"领队", l:t('role_leader')}, {v:"全陪", l:t('role_escort')}]} /></div>
                        <div className="col-span-12 md:col-span-1"><button type="button" onClick={() => removeDynamicListItem(formData.guests, index, setFormData, 'guests')} className="w-full text-red-500 p-2 text-sm">{t('remove')}</button></div>
                    </div>
                ))}
                <button type="button" onClick={() => addDynamicListItem(formData.guests, setFormData, 'guests')} className="text-sm text-primary">{t('addGuest')}</button>
                <div className="mt-4"><CheckboxField name="groupNoticeSent" label={t('groupNoticeSent')} /></div>
            </FormSection>

            <FormSection title={t('groundOps_finance')}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InputField name="groundOperator" label={t('groundOperator')} />
                    <InputField name="groundContact" label={t('groundContact')} />
                </div>
                {formData.orderType === '散客出行' && <InputField name="groundRoute" label={t('groundRoute')} />}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <InputField name="storeSettlement" label={t('storeSettlement')} type="number" />
                    <InputField name="groundSettlement" label={t('groundSettlement')} type="number" />
                    {formData.orderType === '散客出行' && <InputField name="rebateAmount" label={t('rebateAmount')} type="number" />}
                </div>
                <CheckboxField name="confirmationSent" label={t('confirmationSent')} />
            </FormSection>
            
             {formData.orderStatus === '已取消' && (
                <FormSection title={t('cancellationInfo')}>
                    <TextAreaField name="cancellationReason" label={t('cancellationReason')} required />
                </FormSection>
            )}
             <FormSection title={t('notes')}>
                <TextAreaField name="notes" label={t('notes')} />
            </FormSection>
            
             <div className="flex justify-end gap-4 pt-4 border-t dark:border-dark-stroke">
                <button type="button" onClick={onCancel} className="px-4 py-2 bg-gray-200 dark:bg-gray-600 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500">{t('cancel')}</button>
                <button type="submit" className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark">{t('save')}</button>
            </div>
        </form>
    );
};

interface OrdersPageProps {
  data: CrmData; 
  reloadData: () => void;
  onViewOrder: (order: Order) => void;
  compactMode?: boolean;
  onSave: (order: Order) => void;
  onUpdate: (order: Order) => void;
  onDelete: (orderId: string) => void;
}

const OrdersPage: FC<Omit<OrdersPageProps, 't'|'formatDate'|'locale'|'formatCurrency'> & ReturnType<typeof useTranslation>> = ({ data, reloadData, onViewOrder, t, formatDate, formatCurrency, compactMode, onSave, onUpdate, onDelete }) => {
  const { orders, clients } = data;
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [modalState, setModalState] = useState<{ type: 'add' | 'edit' | 'delete' | null; order: Order | null }>({ type: null, order: null });

  const stats = useMemo(() => {
    return {
      total: orders.length,
      pending: orders.filter(o => o.orderStatus === '待出行').length,
      inProgress: orders.filter(o => o.orderStatus === '行程中').length,
      completed: orders.filter(o => o.orderStatus === '已完成' || o.orderStatus === '已清账').length,
      settled: orders.filter(o => o.orderStatus === '已清账').length,
      cancelled: orders.filter(o => o.orderStatus === '已取消').length,
    }
  }, [orders]);

  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
        const client = clients.find(c => c.id === order.clientId);
        const clientName = client ? client.name : (order.clientName || '');
        const lowerSearch = searchTerm.toLowerCase();
        const matchesSearch = searchTerm === '' ||
            order.orderNumber.toLowerCase().includes(lowerSearch) ||
            clientName.toLowerCase().includes(lowerSearch) ||
            order.routeName.toLowerCase().includes(lowerSearch);
        
        const matchesStatus = statusFilter === 'all' || order.orderStatus === statusFilter;

        return matchesSearch && matchesStatus;
    }).map(order => ({
        ...order,
        clientName: clients.find(c => c.id === order.clientId)?.name || order.clientName ||'Unknown Client'
    }));
  }, [orders, clients, searchTerm, statusFilter]);

  const getStatusClass = (status: Order['orderStatus']) => {
    const classes = {
        '待出行': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300',
        '行程中': 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300',
        '已完成': 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300',
        '已清账': 'bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300',
        '已取消': 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300',
    };
    return classes[status] || 'bg-gray-100 text-gray-800';
  }

  const handleAction = (type: 'add' | 'edit' | 'view' | 'delete', order: Order | null = null) => {
    if (type === 'view' && order) {
        onViewOrder(order);
    } else if (type !== 'view') {
        setModalState({ type, order });
    }
  };

  const closeModal = () => {
    setModalState({ type: null, order: null });
  };
  
  const handleSaveOrder = (orderData: Partial<Order>) => {
    const orderToSave = {
        ...modalState.order, 
        ...orderData, 
        id: modalState.order?.id || `order_${Date.now()}`,
        orderNumber: modalState.order?.orderNumber || `ORD${new Date().getFullYear()}${String(orders.length + 1).padStart(4, '0')}`,
        createdAt: modalState.order?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    } as Order;
    
    if (modalState.type === 'add') {
        onSave(orderToSave);
    } else if (modalState.type === 'edit') {
        onUpdate(orderToSave);
    }
    closeModal();
  };
  
  const confirmDelete = () => {
    if (!modalState.order) return;
    onDelete(modalState.order.id);
    closeModal();
  }

  const rowPadding = compactMode ? 'py-2' : 'py-4';

  return (
    <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <StatCard title={t('totalOrders')} value={stats.total} icon={<OrdersIcon className="w-6 h-6 text-primary" />} />
            <StatCard title={t('pendingDeparture')} value={stats.pending} icon={<OrdersIcon className="w-6 h-6 text-primary" />} />
            <StatCard title={t('inProgress')} value={stats.inProgress} icon={<OrdersIcon className="w-6 h-6 text-primary" />} />
            <StatCard title={t('completed')} value={stats.completed} icon={<OrdersIcon className="w-6 h-6 text-primary" />} />
            <StatCard title={t('settled')} value={stats.settled} icon={<OrdersIcon className="w-6 h-6 text-primary" />} />
            <StatCard title={t('cancelled')} value={stats.cancelled} icon={<OrdersIcon className="w-6 h-6 text-red-500" />} />
        </div>
        
      <div className="bg-white dark:bg-dark-card p-6 rounded-lg border border-stroke dark:border-dark-stroke">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <h2 className="text-xl font-bold text-heading dark:text-dark-heading">{t('orderManagement')}</h2>
            <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
                <div className="relative w-full md:w-64">
                    <input 
                        type="text" 
                        placeholder={t('searchOrders')} 
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-stroke dark:border-dark-stroke rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-transparent"
                    />
                    <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-subtext dark:text-dark-subtext" />
                </div>
                <select 
                    value={statusFilter}
                    onChange={e => setStatusFilter(e.target.value)}
                    className="w-full md:w-auto px-4 py-2 border border-stroke dark:border-dark-stroke rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-transparent dark:bg-dark-card"
                >
                    <option value="all">{t('allOrderStatuses')}</option>
                    <option value="待出行">{t('status_pending_departure')}</option>
                    <option value="行程中">{t('status_in_progress_trip')}</option>
                    <option value="已完成">{t('status_completed_trip')}</option>
                    <option value="已清账">{t('status_settled_trip')}</option>
                    <option value="已取消">{t('status_cancelled_trip')}</option>
                </select>
                <button onClick={() => handleAction('add')} className="w-full md:w-auto bg-primary text-white px-4 py-2 rounded-lg font-bold hover:bg-primary-dark transition-colors">{t('addOrder')}</button>
            </div>
        </div>
      </div>

       <div className="bg-white dark:bg-dark-card rounded-lg border border-stroke dark:border-dark-stroke overflow-x-auto">
        <table className="w-full min-w-[1000px]">
          <thead>
            <tr className="border-b border-stroke dark:border-dark-stroke">
                <th className="py-3 px-2 text-left text-subtext dark:text-dark-subtext font-semibold">{t('orderNumberHeader')}</th>
                <th className="py-3 px-2 text-left text-subtext dark:text-dark-subtext font-semibold">{t('clientNameHeader')}</th>
                <th className="py-3 px-2 text-left text-subtext dark:text-dark-subtext font-semibold">{t('departureHeader')}</th>
                 <th className="py-3 px-2 text-left text-subtext dark:text-dark-subtext font-semibold">{t('customerSource')}</th>
                <th className="py-3 px-2 text-left text-subtext dark:text-dark-subtext font-semibold">{t('amountHeader')}</th>
                <th className="py-3 px-2 text-left text-subtext dark:text-dark-subtext font-semibold">{t('statusHeader')}</th>
                <th className="py-3 px-2 text-right text-subtext dark:text-dark-subtext font-semibold">{t('actionsHeader')}</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.map(order => (
              <tr key={order.id} className="border-b border-stroke dark:border-dark-stroke last:border-0 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                <td className={`${rowPadding} px-2 font-medium text-heading dark:text-dark-heading`}><div>{order.orderNumber}</div><div className="text-xs text-subtext">{order.routeName}</div></td>
                <td className={`${rowPadding} px-2 text-subtext dark:text-dark-subtext`}>{order.clientName}</td>
                <td className={`${rowPadding} px-2 text-subtext dark:text-dark-subtext`} suppressHydrationWarning>{order.departurePending ? t('status_pending_departure') : formatDate(order.departureDate)}</td>
                <td className={`${rowPadding} px-2 text-subtext dark:text-dark-subtext`}>{t(order.customerSource === '同行' ? 'source_agent' : 'source_direct')}</td>
                <td className={`${rowPadding} px-2 text-subtext dark:text-dark-subtext`}>{formatCurrency(order.storeSettlement)}</td>
                <td className={`${rowPadding} px-2`}>
                    <span className={`px-2 py-1 text-xs font-semibold rounded-md ${getStatusClass(order.orderStatus)}`}>
                        {t(
                            order.orderStatus === '待出行' ? 'status_pending_departure' :
                            order.orderStatus === '行程中' ? 'status_in_progress_trip' :
                            order.orderStatus === '已完成' ? 'status_completed_trip' :
                            order.orderStatus === '已清账' ? 'status_settled_trip' :
                            'status_cancelled_trip'
                        )}
                    </span>
                </td>
                <td className={`${rowPadding} px-2 text-right`}>
                  <div className="flex justify-end items-center gap-3">
                    <button onClick={() => handleAction('view', order)} className="text-subtext dark:text-dark-subtext hover:text-primary"><ViewIcon className="w-5 h-5" /></button>
                    <button onClick={() => handleAction('edit', order)} className="text-subtext dark:text-dark-subtext hover:text-primary"><EditIcon className="w-5 h-5" /></button>
                    <button onClick={() => handleAction('delete', order)} className="text-subtext dark:text-dark-subtext hover:text-red-500"><DeleteIcon className="w-5 h-5" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

       <Modal isOpen={modalState.type === 'add' || modalState.type === 'edit'} onClose={closeModal} title={modalState.type === 'edit' ? t('editOrder') : t('addNewOrder')} size="6xl">
            <OrderForm order={modalState.order} clients={clients} onSave={handleSaveOrder} onCancel={closeModal} t={t} />
       </Modal>
       
        <Modal isOpen={modalState.type === 'delete'} onClose={closeModal} title={t('confirmDeletion')} size="md">
            <p>{t('confirmDeleteOrder').replace('{orderNumber}', modalState.order?.orderNumber || '')}</p>
            <div className="flex justify-end gap-4 mt-6">
                <button onClick={closeModal} className="px-4 py-2 bg-gray-200 rounded-lg dark:bg-gray-600">{t('cancel')}</button>
                <button onClick={confirmDelete} className="px-4 py-2 bg-red-600 text-white rounded-lg">{t('delete')}</button>
            </div>
       </Modal>
    </div>
  );
};

const StatCard: FC<{ title: string, value: number, icon: React.ReactNode }> = ({ title, value, icon }) => (
    <div className="bg-white dark:bg-dark-card p-4 rounded-lg border border-stroke dark:border-dark-stroke flex items-center gap-4">
        <div className="p-3 rounded-full bg-primary-light">
            {icon}
        </div>
        <div>
            <p className="text-subtext dark:text-dark-subtext text-sm">{title}</p>
            <p className="text-2xl font-bold text-heading dark:text-dark-heading">{value}</p>
        </div>
    </div>
);


export default OrdersPage;
