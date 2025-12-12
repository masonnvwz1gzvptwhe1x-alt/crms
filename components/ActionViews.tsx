
import React, { FC, useState } from 'react';
import { Client, Order, FollowUpRecord } from '../types';
import { DeleteIcon } from './icons';
import { useTranslation } from '../hooks/useTranslation';

// --- Follow Up Form ---
export const FollowUpForm: FC<{ onSave: (data: Partial<FollowUpRecord>) => void, onCancel: () => void, t: ReturnType<typeof useTranslation>['t'] }> = ({ onSave, onCancel, t }) => {
    const [status, setStatus] = useState<Client['status']>('跟进中');
    const [nextFollowUpDate, setNextFollowUpDate] = useState(() => {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        return tomorrow.toISOString().split('T')[0];
    });
    const [notes, setNotes] = useState('');
    const [failureReason, setFailureReason] = useState<'价格原因' | '产品不符' | '竞争对手' | '客户计划变更' | '客户预算不足' | '沟通不畅' | '其他'>('价格原因');
    const [failureReasonDetail, setFailureReasonDetail] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        let data: Partial<FollowUpRecord> = { status, nextFollowUpDate: (status === '已成交' || status === '未成单' || status === '已失效') ? null : nextFollowUpDate, notes };
        if (status === '未成单') {
            if (!failureReasonDetail) {
                alert(t('failureReasonDetail') + ' ' + t('isRequired'));
                return;
            }
            data.failureReason = failureReason;
            data.failureReasonDetail = failureReasonDetail;
        }
        onSave(data);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-subtext dark:text-dark-subtext mb-1">{t('updateStatus')}</label>
                 <select value={status} onChange={(e) => setStatus(e.target.value as Client['status'])} className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 focus:ring-primary focus:border-primary">
                    <option value="待跟进">{t('status_pending')}</option>
                    <option value="跟进中">{t('status_in_progress')}</option>
                    <option value="已成交">{t('status_completed')}</option>
                    <option value="未成单">{t('status_failed')}</option>
                 </select>
            </div>
            {status === '未成单' && (
                <div className="p-4 border border-red-200 rounded-lg bg-red-50 dark:bg-red-900/20 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-subtext dark:text-dark-subtext mb-1">{t('reasonForFailure')} *</label>
                        <select value={failureReason} onChange={e => setFailureReason(e.target.value as any)} className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200">
                            <option value="价格原因">{t('reason_price')}</option>
                            <option value="产品不符">{t('reason_product')}</option>
                            <option value="竞争对手">{t('reason_competitor')}</option>
                            <option value="客户计划变更">{t('reason_plan_change')}</option>
                            <option value="客户预算不足">{t('reason_budget')}</option>
                            <option value="沟通不畅">{t('reason_communication')}</option>
                            <option value="其他">{t('reason_other')}</option>
                        </select>
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-subtext dark:text-dark-subtext mb-1">{t('failureReasonDetail')} *</label>
                        <textarea value={failureReasonDetail} onChange={e => setFailureReasonDetail(e.target.value)} rows={2} className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200" required></textarea>
                    </div>
                </div>
            )}
            {(status === '待跟进' || status === '跟进中') && (
                <div>
                    <label className="block text-sm font-medium text-subtext dark:text-dark-subtext mb-1">{t('nextFollowUpDate')}</label>
                    <input type="date" value={nextFollowUpDate} onChange={(e) => setNextFollowUpDate(e.target.value)} className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200" />
                </div>
            )}
            <div>
                <label className="block text-sm font-medium text-subtext dark:text-dark-subtext mb-1">{t('followUpNotes')}</label>
                <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={4} className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200" required></textarea>
            </div>
             <div className="flex justify-end gap-4 pt-4">
                <button type="button" onClick={onCancel} className="px-4 py-2 bg-gray-200 rounded-lg dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 text-heading dark:text-dark-heading">{t('cancel')}</button>
                <button type="submit" className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark">{t('addRecord')}</button>
            </div>
        </form>
    );
};

// --- Client Detail View ---
export const ClientDetailView: FC<{ client: Client; followUpHistory: FollowUpRecord[]; t: ReturnType<typeof useTranslation>['t']; formatDate: ReturnType<typeof useTranslation>['formatDate']; onAddFollowUp: () => void; onDeleteFollowUp: (recordId: string) => void; }> = ({ client, followUpHistory, t, formatDate, onAddFollowUp, onDeleteFollowUp }) => {
    const statusClasses: Record<Client['status'], string> = { '已成交': 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300', '跟进中': 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300', '待跟进': 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/50 dark:text-yellow-300', '未成单': 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300', '已失效': 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-400' };
    
    const DetailItem: FC<{label: string, value: React.ReactNode}> = ({label, value}) => ( 
        <div>
            <p className="text-sm text-subtext dark:text-dark-subtext">{label}</p>
            <div className="font-semibold text-heading dark:text-dark-heading">{value}</div>
        </div> 
    );

    return (
        <div className="space-y-6">
            <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <h3 className="text-lg font-semibold border-b pb-2 mb-4 dark:border-dark-stroke text-heading dark:text-dark-heading">{t('customerInformation')}</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <DetailItem label={t('name')} value={client.name} />
                    <DetailItem label={t('store')} value={client.store || '-'} />
                    <DetailItem label={t('contact')} value={client.contact} />
                    <DetailItem label={t('status')} value={<span className={`px-2 py-1 text-xs font-bold rounded-md ${statusClasses[client.status]}`}>{t(client.status === '待跟进' ? 'status_pending' : client.status === '跟进中' ? 'status_in_progress' : client.status === '已成交' ? 'status_completed' : client.status === '未成单' ? 'status_failed' : 'status_expired')}</span>} />
                </div>
            </div>

            <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <h3 className="text-lg font-semibold border-b pb-2 mb-4 dark:border-dark-stroke text-heading dark:text-dark-heading">{t('inquiryInformation')}</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <DetailItem label={t('inquiryType')} value={t(client.inquiryType === '散客线路' ? 'inquiry_tour' : client.inquiryType === '单团报价' ? 'inquiry_group' : client.inquiryType === '单订项目' ? 'inquiry_single' : 'inquiry_other')} />
                    <DetailItem label={t('intentionLevel')} value={t(client.intentionLevel === '高' ? 'intention_high' : client.intentionLevel === '中' ? 'intention_medium' : 'intention_low')} />
                    <DetailItem label={t('inquiryDate')} value={formatDate(client.inquiryDate)} />
                </div>
                <div className="mt-4">
                    <p className="text-sm text-subtext dark:text-dark-subtext">{t('inquiryDetails')}</p>
                    <p className="whitespace-pre-wrap text-heading dark:text-dark-heading mt-1">{client.inquiryDetails}</p>
                </div>
                {client.notes && (
                    <div className="mt-4">
                        <p className="text-sm text-subtext dark:text-dark-subtext">{t('notes')}</p>
                        <p className="whitespace-pre-wrap text-heading dark:text-dark-heading mt-1">{client.notes}</p>
                    </div>
                )}
            </div>

            <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <div className="flex justify-between items-center border-b pb-2 mb-4 dark:border-dark-stroke">
                    <h3 className="text-lg font-semibold text-heading dark:text-dark-heading">{t('followUpHistory')} ({followUpHistory.length})</h3>
                    <button onClick={onAddFollowUp} className="px-3 py-1 text-sm bg-primary text-white rounded-lg hover:bg-primary-dark">{t('addFollowUp')}</button>
                </div>
                <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                    {followUpHistory.length > 0 ? followUpHistory.map(record => (
                        <div key={record.id} className="p-3 bg-white dark:bg-dark-card rounded-md border-l-4 border-primary shadow-sm">
                            <div className="flex justify-between items-start text-xs text-subtext dark:text-dark-subtext mb-1">
                                <div className="flex flex-col">
                                    <span suppressHydrationWarning>{formatDate(record.date)}</span>
                                    <span className={`font-bold mt-0.5 ${statusClasses[record.status as Client['status']]}`}>{t(record.status === '待跟进' ? 'status_pending' : record.status === '跟进中' ? 'status_in_progress' : record.status === '已成交' ? 'status_completed' : record.status === '未成单' ? 'status_failed' : 'status_expired')}</span>
                                </div>
                                <button onClick={() => onDeleteFollowUp(record.id)} className="text-red-400 hover:text-red-600 p-1"><DeleteIcon className="w-4 h-4" /></button>
                            </div>
                            <p className="text-sm text-heading dark:text-dark-heading mt-1">{record.notes}</p>
                            {record.nextFollowUpDate && <p className="text-xs text-blue-600 dark:text-blue-400 mt-1 flex items-center gap-1"><span>📅</span> {t('nextFollowUpDate')}: {formatDate(record.nextFollowUpDate)}</p>}
                            {record.failureReason && <p className="text-xs text-red-500 mt-1">Reason: {t(record.failureReason === '价格原因' ? 'reason_price' : record.failureReason === '产品不符' ? 'reason_product' : 'reason_other')}</p>}
                        </div>
                    )) : <p className="text-center text-subtext py-4">{t('noFollowUpHistory')}</p>}
                </div>
            </div>
        </div>
    );
};

// --- Order Detail View ---
export const OrderDetailView: FC<{ order: Order; t: ReturnType<typeof useTranslation>['t']; formatDate: ReturnType<typeof useTranslation>['formatDate']; }> = ({ order, t, formatDate }) => {
    const DetailCard: FC<{ title: string, children: React.ReactNode }> = ({ title, children }) => ( 
        <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <h3 className="text-lg font-semibold border-b pb-2 mb-4 dark:border-dark-stroke text-heading dark:text-dark-heading">{title}</h3>
            {children}
        </div>
    );
    const DetailItem: FC<{label: string, value?: React.ReactNode}> = ({label, value}) => ( 
        <div>
            <p className="text-sm text-subtext dark:text-dark-subtext">{label}</p>
            <div className="font-semibold text-heading dark:text-dark-heading">{value || '-'}</div>
        </div>
    );
    
    return (
        <div className="space-y-4">
            <DetailCard title={t('orderDetails')}>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <DetailItem label={t('orderNumberHeader')} value={order.orderNumber} />
                    <DetailItem label={t('clientName')} value={order.clientName} />
                    <DetailItem label={t('routeHeader')} value={order.routeName} />
                    <DetailItem label={t('status')} value={<span className="px-2 py-1 rounded-md bg-gray-200 dark:bg-gray-600 text-xs">{t(order.orderStatus === '待出行' ? 'status_pending_departure' : order.orderStatus === '行程中' ? 'status_in_progress_trip' : order.orderStatus === '已完成' ? 'status_completed_trip' : order.orderStatus === '已清账' ? 'status_settled_trip' : 'status_cancelled_trip')}</span>} />
                </div>
            </DetailCard>

            <DetailCard title={t('inquiryInformation')}>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <DetailItem label={t('departureHeader')} value={order.departurePending ? t('departurePending') : formatDate(order.departureDate)} />
                    <DetailItem label={t('returnDate')} value={order.returnDate ? formatDate(order.returnDate) : '-'} />
                    <DetailItem label={t('departureLocation')} value={order.departureLocation} />
                    <DetailItem label={t('returnLocation')} value={order.returnLocation} />
                    <DetailItem label={t('participantCount')} value={order.participantCount} />
                    <DetailItem label={t('adultCount')} value={order.adultCount} />
                    <DetailItem label={t('childCount')} value={order.childCount} />
                </div>
            </DetailCard>

            <DetailCard title={t('transportation')}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <DetailItem label={t('outboundTrip')} value={`${order.outboundTransportType || ''} ${order.outboundTransportDetails || ''}`} />
                    <DetailItem label={t('returnTrip')} value={`${order.returnTransportType || ''} ${order.returnTransportDetails || ''}`} />
                    <DetailItem label={t('transportCost')} value={order.transportCostStatus === '客人自理' ? t('transportSelfHandled') : order.transportCost?.toLocaleString('en-US', {style: 'currency', currency: 'USD'}) || '-'} />
                </div>
            </DetailCard>

            <DetailCard title={t('guides_guests')}>
                <h4 className="font-semibold text-sm mb-2 text-heading dark:text-dark-heading">{t('guideInfo')}</h4>
                {order.guides?.length ? order.guides.map((g,i) => <p key={i} className="text-sm text-heading dark:text-dark-heading border-b dark:border-gray-600 last:border-0 py-1">{g.prefix} {g.name} - {g.phone}</p>) : <p className="text-sm text-subtext">{t('noData')}</p>}
                
                <h4 className="font-semibold text-sm mb-2 mt-4 text-heading dark:text-dark-heading">{t('guestInfo')}</h4>
                {order.guests?.length ? order.guests.map((g,i) => <p key={i} className="text-sm text-heading dark:text-dark-heading border-b dark:border-gray-600 last:border-0 py-1">{g.name} - {g.phone} ({g.role})</p>) : <p className="text-sm text-subtext">{t('noData')}</p>}
            </DetailCard>

            <DetailCard title={t('groundOps_finance')}>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <DetailItem label={t('groundOperator')} value={order.groundOperator} />
                    <DetailItem label={t('groundContact')} value={order.groundContact} />
                    <DetailItem label={t('storeSettlement')} value={order.storeSettlement?.toLocaleString('en-US', {style: 'currency', currency: 'USD'})} />
                    <DetailItem label={t('groundSettlement')} value={order.groundSettlement?.toLocaleString('en-US', {style: 'currency', currency: 'USD'})} />
                </div>
            </DetailCard>

            {order.notes && <DetailCard title={t('notes')}><p className="whitespace-pre-wrap text-heading dark:text-dark-heading">{order.notes}</p></DetailCard>}
            
            {order.orderStatus === '已取消' && <DetailCard title={t('cancellationInfo')}><p className="whitespace-pre-wrap text-red-500 font-medium">{order.cancellationReason}</p></DetailCard>}
        </div>
    );
};
