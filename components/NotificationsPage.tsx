

import React, { FC, useMemo, useState } from 'react';
import { Notification } from '../types';
import { useTranslation } from '../hooks/useTranslation';
import { StarIcon, PinIcon, DeleteIcon } from './icons';

// Reusable Modal Component
const Modal: FC<{ isOpen: boolean; onClose: () => void; title: string; children: React.ReactNode; size?: 'md' | 'lg' }> = ({ isOpen, onClose, title, children, size = 'md' }) => {
    if (!isOpen) return null;
    const sizeClasses = { 'md': 'max-w-md', 'lg': 'max-w-lg' };
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

interface NotificationsPageProps {
    notifications: Notification[];
    onNotificationClick: (notification: Notification) => void;
    onToggleStar: (notificationId: string) => void;
    onTogglePin: (notificationId: string) => void;
    onDelete: (notificationId: string) => void;
    onClearAll: () => void;
    t: ReturnType<typeof useTranslation>['t'];
    formatDate: (date: string) => string;
}

const NotificationsPage: FC<Omit<NotificationsPageProps, 't' | 'formatDate'> & ReturnType<typeof useTranslation>> = ({
    notifications,
    onNotificationClick,
    onToggleStar,
    onTogglePin,
    onDelete,
    onClearAll,
    t,
    formatDate,
}) => {
    const [isClearAllConfirmOpen, setIsClearAllConfirmOpen] = useState(false);

    const sortedNotifications = useMemo(() => {
        const pinned = notifications.filter(n => n.isPinned).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        const unpinned = notifications.filter(n => !n.isPinned).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        return [...pinned, ...unpinned];
    }, [notifications]);
    
    const handleConfirmClearAll = () => {
        onClearAll();
        setIsClearAllConfirmOpen(false);
    };

    const ActionButton: FC<{ label: string, onClick: () => void, children: React.ReactNode }> = ({ label, onClick, children }) => (
         <button
            onClick={(e) => { e.stopPropagation(); onClick(); }}
            aria-label={label}
            className="p-2 rounded-full text-subtext dark:text-dark-subtext hover:bg-gray-200 dark:hover:bg-gray-700 hover:text-heading dark:hover:text-dark-heading"
        >
            {children}
        </button>
    );

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-heading dark:text-dark-heading">{t('allNotifications')}</h1>
                {notifications.length > 0 && (
                     <button onClick={() => setIsClearAllConfirmOpen(true)} className="px-4 py-2 text-sm bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300 rounded-lg hover:bg-red-200 dark:hover:bg-red-900 font-semibold">
                        {t('clearAll')}
                    </button>
                )}
            </div>
            <div className="bg-white dark:bg-dark-card border border-stroke dark:border-dark-stroke rounded-lg shadow-sm">
                {sortedNotifications.length > 0 ? (
                    <ul className="divide-y divide-stroke dark:divide-dark-stroke">
                        {sortedNotifications.map(notif => (
                            <li
                                key={notif.id}
                                className={`flex items-center gap-4 p-4 transition-colors ${notif.read ? 'bg-gray-50 dark:bg-dark-app-bg' : 'bg-white dark:bg-dark-card'} ${notif.targetId ? 'cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700/50' : ''}`}
                                onClick={() => notif.targetId && onNotificationClick(notif)}
                            >
                                <div className="flex-grow">
                                    <div className="flex items-center gap-2 mb-1">
                                         {notif.isPinned && <PinIcon className="w-4 h-4 text-blue-500 flex-shrink-0" filled />}
                                         <p className={`text-heading dark:text-dark-heading ${!notif.read ? 'font-bold' : 'font-semibold'}`}>{t(notif.messageKey, t.getTranslatedParams(notif.messageParams))}</p>
                                    </div>
                                    <p className="text-sm text-subtext dark:text-dark-subtext" suppressHydrationWarning>{formatDate(notif.date)}</p>
                                </div>
                                <div className="flex items-center gap-2 flex-shrink-0">
                                    <ActionButton 
                                        label={notif.isPinned ? t('unpin') : t('pin')} 
                                        onClick={() => onTogglePin(notif.id)}
                                    >
                                        <PinIcon className={`w-5 h-5 ${notif.isPinned ? 'text-blue-500' : ''}`} filled={notif.isPinned} />
                                    </ActionButton>
                                     <ActionButton 
                                        label={notif.isStarred ? t('unstar') : t('star')}
                                        onClick={() => onToggleStar(notif.id)}
                                    >
                                        <StarIcon className={`w-5 h-5 ${notif.isStarred ? 'text-yellow-500' : ''}`} filled={notif.isStarred} />
                                    </ActionButton>
                                     <ActionButton 
                                        label={t('delete')}
                                        onClick={() => onDelete(notif.id)}
                                    >
                                        <DeleteIcon className="w-5 h-5 hover:text-red-500" />
                                    </ActionButton>
                                </div>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <div className="p-8 text-center text-subtext dark:text-dark-subtext">
                        <p>{t('noNotifications')}</p>
                    </div>
                )}
            </div>
            
            <Modal isOpen={isClearAllConfirmOpen} onClose={() => setIsClearAllConfirmOpen(false)} title={t('confirmClearAllTitle')}>
                <p>{t('confirmClearAllMessage')}</p>
                <div className="flex justify-end gap-4 mt-6">
                    <button onClick={() => setIsClearAllConfirmOpen(false)} className="px-4 py-2 bg-gray-200 rounded-lg dark:bg-gray-600">{t('cancel')}</button>
                    <button onClick={handleConfirmClearAll} className="px-4 py-2 bg-red-600 text-white rounded-lg">{t('delete')}</button>
                </div>
            </Modal>
        </div>
    );
};

export default NotificationsPage;