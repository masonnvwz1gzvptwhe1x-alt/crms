

import React, { useState, useEffect, useRef, FC, useMemo } from 'react';
import { NotificationIcon, SearchIcon, ClientsIcon, OrdersIcon, StarIcon, PinIcon, CloseIcon } from './icons';
import { User, Notification, CrmData, GlobalSearchResult, NotificationBadgeType } from '../types';
import { useTranslation } from '../hooks/useTranslation';

interface HeaderProps {
    user: User;
    notifications: Notification[];
    data: CrmData;
    onSearchSelect: (item: GlobalSearchResult) => void;
    onNotificationClick: (notification: Notification) => void;
    onDeleteNotification: (notificationId: string) => void;
    onViewMoreClick: () => void;
    showNotificationBadge: boolean;
    notificationBadgeType: NotificationBadgeType;
    onLogout: () => void;
    t: ReturnType<typeof useTranslation>['t'];
}

const useDebounce = <T,>(value: T, delay: number): T => {
    const [debouncedValue, setDebouncedValue] = useState<T>(value);
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);
        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);
    return debouncedValue;
};


const Header: FC<HeaderProps> = ({ user, notifications, data, onSearchSelect, onNotificationClick, onDeleteNotification, onViewMoreClick, showNotificationBadge, notificationBadgeType, t, onLogout }) => {
    const [notificationOpen, setNotificationOpen] = useState(false);
    const [profileOpen, setProfileOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<GlobalSearchResult[]>([]);
    const [isSearchFocused, setIsSearchFocused] = useState(false);

    const notificationRef = useRef<HTMLDivElement>(null);
    const profileRef = useRef<HTMLDivElement>(null);
    const searchRef = useRef<HTMLDivElement>(null);
    
    const debouncedSearchQuery = useDebounce(searchQuery, 300);

    const badgeCount = useMemo(() => {
        if (notificationBadgeType === 'total') {
            return notifications.length;
        }
        return notifications.filter(n => !n.read).length; // unread is default
    }, [notifications, notificationBadgeType]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
                setNotificationOpen(false);
            }
            if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
                setProfileOpen(false);
            }
            if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
                setIsSearchFocused(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        if (debouncedSearchQuery.length < 2) {
            setSearchResults([]);
            return;
        }

        const lowerQuery = debouncedSearchQuery.toLowerCase();
        const clientResults: GlobalSearchResult[] = data.clients
            .filter(c => 
                c.name.toLowerCase().includes(lowerQuery) || 
                c.store.toLowerCase().includes(lowerQuery) || 
                c.contact.toLowerCase().includes(lowerQuery)
            )
            .map(c => ({
                type: 'client',
                id: c.id,
                title: c.name,
                subtitle: c.store
            }));

        const orderResults: GlobalSearchResult[] = data.orders
            .filter(o => 
                o.orderNumber.toLowerCase().includes(lowerQuery) || 
                o.routeName.toLowerCase().includes(lowerQuery) ||
                (o.clientName && o.clientName.toLowerCase().includes(lowerQuery))
            )
            .map(o => ({
                type: 'order',
                id: o.id,
                title: o.orderNumber,
                subtitle: `${o.clientName} - ${o.routeName}`
            }));

        setSearchResults([...clientResults, ...orderResults]);
    }, [debouncedSearchQuery, data]);

    const handleSelect = (item: GlobalSearchResult) => {
        onSearchSelect(item);
        setSearchQuery('');
        setSearchResults([]);
        setIsSearchFocused(false);
    };
    
    const handleNotifClick = (notif: Notification) => {
        onNotificationClick(notif);
        setNotificationOpen(false);
    }
    
    const clientResults = searchResults.filter(r => r.type === 'client');
    const orderResults = searchResults.filter(r => r.type === 'order');

    const sortedNotificationsForDropdown = useMemo(() => {
        if (!notifications) return [];
        const pinned = notifications.filter(n => n.isPinned).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        const unpinned = notifications.filter(n => !n.isPinned).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        return [...pinned, ...unpinned.slice(0, 10 - pinned.length)];
    }, [notifications]);


    return (
        <header className="h-24 bg-sidebar-bg dark:bg-dark-sidebar-bg border-b border-stroke dark:border-dark-stroke flex-shrink-0 flex items-center justify-between px-8">
            <div ref={searchRef} className="relative w-full max-w-sm">
                <input 
                    type="text" 
                    placeholder={t('search')}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => setIsSearchFocused(true)}
                    className="w-full pl-12 pr-4 py-3 bg-gray-100 dark:bg-dark-card rounded-lg text-lg text-heading dark:text-dark-heading placeholder-subtext dark:placeholder-dark-subtext focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-subtext dark:text-dark-subtext" />

                {isSearchFocused && searchQuery.length > 1 && (
                     <div className="absolute top-full mt-2 w-full bg-white dark:bg-dark-card border border-stroke dark:border-dark-stroke rounded-lg shadow-lg z-20 max-h-96 overflow-y-auto">
                        {searchResults.length === 0 && debouncedSearchQuery.length > 1 ? (
                            <p className="p-4 text-subtext dark:text-dark-subtext">{t('noResults')}</p>
                        ) : (
                            <>
                                {clientResults.length > 0 && (
                                    <div>
                                        <h4 className="p-3 text-sm font-bold text-subtext dark:text-dark-subtext border-b dark:border-dark-stroke">{t('clients')}</h4>
                                        <ul>
                                            {clientResults.map(item => (
                                                <li key={item.id}>
                                                    <button onClick={() => handleSelect(item)} className="w-full text-left flex items-center gap-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-700">
                                                        <ClientsIcon className="w-5 h-5 text-primary flex-shrink-0" />
                                                        <div>
                                                            <p className="font-semibold text-heading dark:text-dark-heading">{item.title}</p>
                                                            <p className="text-sm text-subtext dark:text-dark-subtext">{item.subtitle}</p>
                                                        </div>
                                                    </button>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                                {orderResults.length > 0 && (
                                     <div>
                                        <h4 className="p-3 text-sm font-bold text-subtext dark:text-dark-subtext border-b dark:border-dark-stroke">{t('orders')}</h4>
                                        <ul>
                                            {orderResults.map(item => (
                                                <li key={item.id}>
                                                    <button onClick={() => handleSelect(item)} className="w-full text-left flex items-center gap-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-700">
                                                        <OrdersIcon className="w-5 h-5 text-primary flex-shrink-0" />
                                                        <div>
                                                            <p className="font-semibold text-heading dark:text-dark-heading">{item.title}</p>
                                                            <p className="text-sm text-subtext dark:text-dark-subtext truncate">{item.subtitle}</p>
                                                        </div>
                                                    </button>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                )}
            </div>
            <div className="flex items-center gap-4">
                <div ref={notificationRef} className="relative">
                    <button 
                        onClick={() => setNotificationOpen(!notificationOpen)}
                        className="relative p-2 rounded-full bg-gray-100/50 dark:bg-dark-card text-subtext dark:text-dark-subtext hover:bg-gray-100 dark:hover:bg-gray-700"
                        aria-label={`${badgeCount} unread notifications`}
                    >
                        <NotificationIcon className="w-8 h-8"/>
                        {showNotificationBadge && badgeCount > 0 && (
                            <div className="absolute -top-1 -right-1 min-w-[20px] h-5 px-1 flex items-center justify-center bg-red-500 text-white text-xs font-bold rounded-full border-2 border-white dark:border-dark-sidebar-bg">
                                {badgeCount}
                            </div>
                        )}
                    </button>
                    {notificationOpen && (
                        <div className="absolute top-full right-0 mt-2 w-96 bg-white dark:bg-dark-card border border-stroke dark:border-dark-stroke rounded-lg shadow-lg z-10 flex flex-col">
                            <div className="p-4 border-b border-stroke dark:border-dark-stroke">
                                <h3 className="font-bold text-heading dark:text-dark-heading">{t('notifications')}</h3>
                            </div>
                            <ul className="max-h-96 overflow-y-auto flex-grow">
                                {sortedNotificationsForDropdown.length > 0 ? sortedNotificationsForDropdown.map(notif => (
                                    <li key={notif.id} className={`group border-b border-stroke dark:border-dark-stroke last:border-0 ${notif.read ? 'bg-gray-50 dark:bg-dark-app-bg' : 'bg-white dark:bg-dark-card'}`}>
                                        <div className="w-full text-left p-4 hover:bg-gray-100 dark:hover:bg-gray-700 flex justify-between items-start">
                                            <button onClick={() => handleNotifClick(notif)} className="flex-grow text-left">
                                                <div className="flex items-center gap-2">
                                                    {notif.isPinned && <PinIcon className="w-3 h-3 text-blue-500 flex-shrink-0" filled />}
                                                    {notif.isStarred && <StarIcon className="w-3 h-3 text-yellow-500 flex-shrink-0" filled />}
                                                    <p className={`text-sm text-heading dark:text-dark-heading ${!notif.read ? 'font-bold' : ''}`}>{t(notif.messageKey, t.getTranslatedParams(notif.messageParams))}</p>
                                                </div>
                                                <p className="text-xs text-subtext dark:text-dark-subtext mt-1" suppressHydrationWarning>{new Date(notif.date).toLocaleString()}</p>
                                            </button>
                                             <button 
                                                onClick={(e) => { e.stopPropagation(); onDeleteNotification(notif.id); }}
                                                className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 p-1 rounded-full ml-2 flex-shrink-0"
                                                aria-label={t('deleteNotification')}
                                            >
                                                <CloseIcon className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </li>
                                )) : <p className="p-4 text-center text-subtext dark:text-dark-subtext">{t('noNotifications')}</p>}
                            </ul>
                            {notifications && notifications.length > 10 && (
                                <div className="p-2 text-center border-t border-stroke dark:border-dark-stroke flex-shrink-0">
                                    <button onClick={() => { onViewMoreClick(); setNotificationOpen(false); }} className="text-sm text-primary hover:underline font-semibold">
                                        {t('viewMore')}
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
                <div ref={profileRef} className="relative">
                    <button onClick={() => setProfileOpen(!profileOpen)} className="flex items-center gap-4 cursor-pointer">
                        <div className="w-14 h-14 rounded-full bg-gray-200 overflow-hidden ring-2 ring-transparent hover:ring-primary transition-all">
                            <img src={user?.avatarUrl || "https://i.pravatar.cc/56"} alt="User Avatar" className="w-full h-full object-cover" />
                        </div>
                        <div>
                            <p className="font-bold text-heading dark:text-dark-heading">{user?.name || 'User'}</p>
                            <p className="text-sm text-subtext dark:text-dark-subtext">{user?.role || 'Role'}</p>
                        </div>
                    </button>
                    {profileOpen && (
                         <div className="absolute top-full right-0 mt-2 w-48 bg-white dark:bg-dark-card border border-stroke dark:border-dark-stroke rounded-lg shadow-lg z-10 py-1">
                            <button onClick={onLogout} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10">{t('logout')}</button>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
};

export default Header;