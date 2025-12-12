
import React, { useState, useEffect, useRef, FC, useCallback, useMemo } from 'react';
import { AnalyticsIcon, CalendarIcon, ClientsIcon, DashboardIcon, LogoIcon, OrdersIcon, ProfileIcon, SettingsIcon, NotificationIcon, DeleteIcon, InquiryIcon, UsersIcon } from './components/icons';
import Dashboard from './components/Dashboard';
import ClientsPage from './components/ClientsPage'; // Renamed in UI to Inquiry Management
import CustomersPage from './components/CustomersPage';
import AnalyticsPage from './components/AnalyticsPage';
import CalendarPage from './components/CalendarPage';
import OrdersPage from './components/OrdersPage';
import ProfilePage from './components/ProfilePage';
import SettingsPage from './components/SettingsPage';
import NotificationsPage from './components/NotificationsPage';
import Header from './components/Header';
import AuthPage from './components/AuthPage';
import { useCrmData } from './hooks/useCrmData';
import { useTranslation, Locale } from './hooks/useTranslation';
import { GlobalSearchResult, CrmData, User, Notification, Client, Order, NotificationBadgeType, FollowUpRecord, Currency, DateFormat } from './types';
import { FollowUpForm, ClientDetailView, OrderDetailView } from './components/ActionViews';

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


// --- Toast Notification Components ---
const Toast: FC<{ notification: Notification; onRemove: (id: string) => void; onClick: (notification: Notification) => void; t: ReturnType<typeof useTranslation>['t']; }> = ({ notification, onRemove, onClick, t }) => {
    const [isVisible, setIsVisible] = useState(false);
    const timerRef = useRef<number | undefined>(undefined);

    useEffect(() => {
        setIsVisible(true);
        timerRef.current = window.setTimeout(() => {
            setIsVisible(false);
        }, 4000);
        return () => clearTimeout(timerRef.current);
    }, []);

    const handleTransitionEnd = () => {
        if (!isVisible) onRemove(notification.id);
    };
    
    const handleToastClick = () => {
        clearTimeout(timerRef.current);
        setIsVisible(false);
        onClick(notification);
    };

    return (
        <div
            id={`toast-${notification.id}`}
            onClick={handleToastClick}
            onTransitionEnd={handleTransitionEnd}
            className={`w-80 bg-white dark:bg-dark-card rounded-lg shadow-2xl p-4 border-l-4 border-primary transform transition-all duration-500 ease-in-out cursor-pointer hover:shadow-primary/20 hover:shadow-lg ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}`}
        >
            <div className="flex items-start gap-3">
                <NotificationIcon className="w-6 h-6 text-primary mt-1 flex-shrink-0" />
                <div>
                    <p className="font-bold text-heading dark:text-dark-heading">{t('notifications')}</p>
                    <p className="text-sm text-subtext dark:text-dark-subtext mt-1">{t(notification.messageKey, t.getTranslatedParams(notification.messageParams))}</p>
                </div>
            </div>
        </div>
    );
};

const ToastContainer: FC<{ toasts: Notification[]; onRemove: (id: string) => void; onClick: (notification: Notification) => void; t: ReturnType<typeof useTranslation>['t']; }> = ({ toasts, onRemove, onClick, t }) => {
    return (
        <div className="fixed top-24 right-8 z-[100] space-y-4">
            {toasts.map(toast => (
                <Toast key={toast.id} notification={toast} onRemove={onRemove} onClick={onClick} t={t} />
            ))}
        </div>
    );
};


// --- Sidebar Component ---
const Sidebar: React.FC<{ activeItem: string; setActiveItem: (item: string) => void; t: (key: any) => string; }> = ({ activeItem, setActiveItem, t }) => {
  const mainMenuItems = [
    { name: 'Dashboard', translatedName: t('dashboard'), icon: DashboardIcon },
    { name: 'Customers', translatedName: t('customers'), icon: UsersIcon },
    { name: 'Inquiries', translatedName: t('clients'), icon: InquiryIcon }, // Mapped to ClientsPage internally
    { name: 'Calendar', translatedName: t('calendar'), icon: CalendarIcon },
    { name: 'Orders', translatedName: t('orders'), icon: OrdersIcon },
    { name: 'Analytics', translatedName: t('analytics'), icon: AnalyticsIcon },
  ];

  const secondaryMenuItems = [
    { name: 'Profile', translatedName: t('profile'), icon: ProfileIcon },
    { name: 'Settings', translatedName: t('settings'), icon: SettingsIcon },
  ];

  const NavItem: React.FC<{ name: string; icon: React.FC<{ className?: string }>; isActive: boolean; onClick: () => void }> = ({ name, icon: Icon, isActive, onClick }) => (
    <li className="relative px-4">
      <button
        onClick={onClick}
        className={`w-full flex items-center gap-4 px-4 py-3 rounded-lg transition-colors duration-200 ${isActive ? 'bg-primary-light text-primary dark:bg-primary dark:bg-opacity-20 dark:text-primary-light' : 'text-subtext hover:bg-gray-50 dark:text-dark-subtext dark:hover:bg-dark-card'}`}
      >
        <Icon className="w-6 h-6" />
        <span className="font-bold text-lg">{name}</span>
      </button>
      {isActive && <div className="absolute left-0 top-0 h-full w-1.5 bg-primary rounded-r-lg" />}
    </li>
  );

  return (
    <aside className="w-[270px] bg-sidebar-bg dark:bg-dark-sidebar-bg border-r border-stroke dark:border-dark-stroke flex-shrink-0 flex flex-col">
      <div className="h-24 flex items-center px-8 gap-3 border-b border-stroke dark:border-dark-stroke">
        <LogoIcon className="w-8 h-8"/>
        <h1 className="text-xl font-bold text-heading dark:text-dark-heading">
          Circle<span className="font-normal">Soft</span>
        </h1>
      </div>
      <nav className="flex-grow pt-8">
        <ul className="space-y-4">
          {mainMenuItems.map(item => (
            <NavItem
              key={item.name}
              name={item.translatedName}
              icon={item.icon}
              isActive={activeItem === item.name}
              onClick={() => setActiveItem(item.name)}
            />
          ))}
        </ul>
      </nav>
      <div className="pb-8">
          <ul className="space-y-4">
            {secondaryMenuItems.map(item => (
                <NavItem
                  key={item.name}
                  name={item.translatedName}
                  icon={item.icon}
                  isActive={activeItem === item.name}
                  onClick={() => setActiveItem(item.name)}
                />
            ))}
          </ul>
        </div>
    </aside>
  );
};


// --- Main App Component ---
const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  
  // App Settings State
  const [currency, setCurrency] = useState<Currency>(() => {
      return (localStorage.getItem('currency') as Currency) || 'USD';
  });
  const [dateFormat, setDateFormat] = useState<DateFormat>(() => {
      return (localStorage.getItem('dateFormat') as DateFormat) || 'YYYY-MM-DD';
  });
  const [compactMode, setCompactMode] = useState<boolean>(() => {
      return localStorage.getItem('compactMode') === 'true';
  });

  // Persist App Settings
  useEffect(() => { localStorage.setItem('currency', currency); }, [currency]);
  useEffect(() => { localStorage.setItem('dateFormat', dateFormat); }, [dateFormat]);
  useEffect(() => { localStorage.setItem('compactMode', String(compactMode)); }, [compactMode]);

  const { t, locale, setLocale, formatDate, formatCurrency } = useTranslation({ currency, dateFormat });

  useEffect(() => {
    // One-time setup for demo user
    const usersExist = localStorage.getItem('users');
    if (!usersExist) {
        const demoUser: User = {
            id: 'user_demo_123',
            name: 'Demo User',
            email: 'user@example.com',
            password: 'password123',
            role: 'HR Manager',
            avatarUrl: 'https://i.pravatar.cc/56?u=user@example.com',
            department: 'Sales',
            phone: '(555) 123-4567',
            about: 'This is a pre-populated demo account for testing purposes.',
            joinDate: '2023-01-15',
            employeeId: 'CS-1001',
            location: 'New York, USA'
        };
        localStorage.setItem('users', JSON.stringify([demoUser]));
    }

    const currentUserId = localStorage.getItem('currentUserId');
    if (currentUserId) {
        const users: User[] = JSON.parse(localStorage.getItem('users') || '[]');
        const user = users.find(u => u.id === currentUserId);
        if (user) {
            setCurrentUser(user);
            setIsLoggedIn(true);
        }
    }
    
    const savedDarkMode = localStorage.getItem('darkMode');
    const isDark = savedDarkMode ? savedDarkMode === 'true' : window.matchMedia('(prefers-color-scheme: dark)').matches;
    document.documentElement.classList.toggle('dark', isDark);
  }, []);

  const [activePage, setActivePage] = useState('Dashboard');
  const { data, loading, error, reloadData, actions } = useCrmData(currentUser?.id || null);
  const [internalData, setInternalData] = useState<CrmData>(data);
  
  const [viewingEntity, setViewingEntity] = useState<(Client & { type?: 'client' }) | (Order & { type?: 'order' }) | null>(null);
  const [notificationToDelete, setNotificationToDelete] = useState<string | null>(null);
  const [toasts, setToasts] = useState<Notification[]>([]);
  const prevDataRef = useRef<CrmData>(undefined);
  
  const [followUpModalState, setFollowUpModalState] = useState<{ type: 'followup' | 'deleteFollowUp' | null; client: Client | null; recordId?: string; }>({ type: null, client: null });
  
  // --- Global Settings State ---
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    if (saved) return saved === 'true';
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  });
  
  const [showNotificationBadge, setShowNotificationBadge] = useState(() => {
    const saved = localStorage.getItem('showNotificationBadge');
    return saved ? saved === 'true' : true;
  });

  const [notificationBadgeType, setNotificationBadgeType] = useState<NotificationBadgeType>(() => {
    const saved = localStorage.getItem('notificationBadgeType');
    return (saved === 'unread' || saved === 'total') ? saved : 'unread';
  });

  const [playNotificationSound, setPlayNotificationSound] = useState(() => {
    const saved = localStorage.getItem('playNotificationSound');
    return saved ? saved === 'true' : false;
  });

  const [showNotificationBanner, setShowNotificationBanner] = useState(() => {
    const saved = localStorage.getItem('showNotificationBanner');
    return saved ? saved === 'true' : false; // Default off
  });

  const audioContextRef = useRef<AudioContext | null>(null);

  const initAudioContext = useCallback(() => { if (!audioContextRef.current && (window.AudioContext || (window as any).webkitAudioContext)) { audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({}); } }, []);
  const playSound = useCallback(() => { if (!audioContextRef.current) return; const oscillator = audioContextRef.current.createOscillator(); const gainNode = audioContextRef.current.createGain(); oscillator.connect(gainNode); gainNode.connect(audioContextRef.current.destination); oscillator.type = 'sine'; oscillator.frequency.setValueAtTime(600, audioContextRef.current.currentTime); gainNode.gain.setValueAtTime(0.1, audioContextRef.current.currentTime); gainNode.gain.exponentialRampToValueAtTime(0.0001, audioContextRef.current.currentTime + 0.5);
oscillator.start(0); oscillator.stop(audioContextRef.current.currentTime + 0.5); }, []);

  useEffect(() => { document.documentElement.classList.toggle('dark', isDarkMode); localStorage.setItem('darkMode', String(isDarkMode)); }, [isDarkMode]);
  useEffect(() => { localStorage.setItem('showNotificationBadge', String(showNotificationBadge)); }, [showNotificationBadge]);
  useEffect(() => { localStorage.setItem('notificationBadgeType', notificationBadgeType); }, [notificationBadgeType]);
  useEffect(() => { localStorage.setItem('playNotificationSound', String(playNotificationSound)); }, [playNotificationSound]);
  useEffect(() => { localStorage.setItem('showNotificationBanner', String(showNotificationBanner)); }, [showNotificationBanner]);
  
  useEffect(() => {
    if (!data.notifications) return;
    const previousNotifications = prevDataRef.current?.notifications || [];
    const newNotifications = data.notifications.filter(
        n => !previousNotifications.some(pn => pn.id === n.id)
    );

    if (newNotifications.length > 0) {
        if (playNotificationSound) { initAudioContext(); playSound(); }
        if (showNotificationBanner) {
            setToasts(currentToasts => [...newNotifications.slice(0, 3), ...currentToasts]);
        }
    }

    setInternalData(data);
    prevDataRef.current = data;
  }, [data, playNotificationSound, showNotificationBanner, initAudioContext, playSound]);


  const handleRemoveToast = useCallback((id: string) => { setToasts(prev => prev.filter(t => t.id !== id)); }, []);

  // --- Auth Handlers ---
  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user);
    setTimeout(() => setIsLoggedIn(true), 100);
    // Refresh dark mode preference if user has custom settings (future-proofing) or just ensure sync
    const savedDarkMode = localStorage.getItem('darkMode');
    if (savedDarkMode) setIsDarkMode(savedDarkMode === 'true');
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setTimeout(() => {
        localStorage.removeItem('currentUserId');
        setCurrentUser(null);
        setActivePage('Dashboard'); 
    }, 500);
  };

  // --- Data and Navigation Handlers ---
  const handleUserUpdate = (updatedUser: User) => { 
      const allUsers: User[] = JSON.parse(localStorage.getItem('users') || '[]');
      const userIndex = allUsers.findIndex(u => u.id === updatedUser.id);
      if (userIndex > -1) {
          allUsers[userIndex] = { ...allUsers[userIndex], ...updatedUser };
          localStorage.setItem('users', JSON.stringify(allUsers));
          setCurrentUser(updatedUser); 
      }
      setInternalData(prev => ({ ...prev, user: updatedUser })); 
  };
  
  const handleViewClient = (client: Client) => {
    setViewingEntity({ ...client, type: 'client' });
  };
  
  const handleViewOrder = (order: Order) => {
    setViewingEntity({ ...order, type: 'order' });
  };

  const handleGlobalSearchSelect = (item: GlobalSearchResult) => {
    if (item.type === 'client') {
        const client = internalData.clients.find(c => c.id === item.id);
        if (client) handleViewClient(client);
    } else {
        const order = internalData.orders.find(o => o.id === item.id);
        if (order) handleViewOrder(order);
    }
  };
  
  const handleNotificationClick = (notification: Notification) => {
    handleRemoveToast(notification.id);
    const updatedNotifications = internalData.notifications.map(n => n.id === notification.id ? { ...n, read: true } : n);
    setInternalData(prev => ({ ...prev, notifications: updatedNotifications }));
    actions.updateNotifications(updatedNotifications); // Persist
    
    if (notification.targetType && notification.targetId) {
        if (notification.targetType === 'client') {
            const client = internalData.clients.find(c => c.id === notification.targetId);
            if (client) handleViewClient(client);
        } else {
            const order = internalData.orders.find(o => o.id === notification.targetId);
            if (order) handleViewOrder(order);
        }
    }
  };
  
  const handleEventClick = (eventData: Client | Order) => { 
    if ('inquiryType' in eventData) {
        handleViewClient(eventData);
    } else {
        handleViewOrder(eventData);
    }
  };

  // --- Notification Management Handlers ---
  const handleToggleStar = (notificationId: string) => { 
      const updated = internalData.notifications.map(n => n.id === notificationId ? { ...n, isStarred: !n.isStarred } : n);
      setInternalData(prev => ({ ...prev, notifications: updated })); 
      actions.updateNotifications(updated);
  };
  const handleTogglePin = (notificationId: string) => { 
      const updated = internalData.notifications.map(n => n.id === notificationId ? { ...n, isPinned: !n.isPinned } : n);
      setInternalData(prev => ({ ...prev, notifications: updated })); 
      actions.updateNotifications(updated);
  };
  const handleDeleteNotificationRequest = (notificationId: string) => { setNotificationToDelete(notificationId); };
  const confirmDeleteNotification = () => { 
      if (!notificationToDelete) return; 
      const updated = internalData.notifications.filter(n => n.id !== notificationToDelete);
      setInternalData(prev => ({ ...prev, notifications: updated })); 
      actions.updateNotifications(updated);
      setNotificationToDelete(null); 
  };
  const handleClearAllNotifications = () => { 
      setInternalData(prev => ({ ...prev, notifications: [] })); 
      actions.updateNotifications([]);
  };
  
  // --- Follow-up Handlers ---
  const handleSaveFollowUp = (recordData: Partial<FollowUpRecord>) => {
     if (!followUpModalState.client) return;
     const recordToSave = {
        ...recordData,
        id: `fu_${Date.now()}`,
        clientId: followUpModalState.client.id,
        date: new Date().toISOString(),
     };
     
     // Call the action from useCrmData
     let failureDetails = undefined;
     if (recordData.status === '未成单') {
        failureDetails = {
            reason: recordData.failureReason || '其他',
            detail: recordData.failureReasonDetail || ''
        };
     }
     
     actions.addFollowUp(recordToSave as FollowUpRecord, failureDetails);
     setFollowUpModalState({ type: null, client: null });
  };
  
  const confirmDeleteFollowUp = () => {
    if (!followUpModalState.recordId || !followUpModalState.client) return;
    actions.deleteFollowUp(followUpModalState.recordId);
    setFollowUpModalState({ type: null, client: null });
  };


  const translationProps = { t, locale, setLocale, formatDate, formatCurrency };

  const renderContent = () => {
    if (loading && !internalData.user?.id) return <div className="flex items-center justify-center h-full text-xl text-subtext dark:text-dark-subtext">{t('loading')}</div>;
    if (error) return <div className="flex items-center justify-center h-full text-xl text-red-500">{t('error')}: {error}</div>;
    switch (activePage) {
      case 'Dashboard': return <Dashboard data={internalData} {...translationProps} locale={locale} isDarkMode={isDarkMode} />;
      case 'Customers': return <CustomersPage data={internalData} reloadData={() => reloadData()} onSave={actions.addCustomer} onUpdate={actions.updateCustomer} onDelete={actions.deleteCustomer} {...translationProps} compactMode={compactMode} />;
      case 'Inquiries': return <ClientsPage data={internalData} reloadData={() => reloadData()} onViewClient={handleViewClient} onSave={actions.addClient} onUpdate={actions.updateClient} onDelete={actions.deleteClient} {...translationProps} compactMode={compactMode} />; 
      case 'Calendar': return <CalendarPage data={internalData} onEventClick={handleEventClick} {...translationProps} />;
      case 'Orders': return <OrdersPage data={internalData} reloadData={() => reloadData()} onViewOrder={handleViewOrder} onSave={actions.addOrder} onUpdate={actions.updateOrder} onDelete={actions.deleteOrder} {...translationProps} compactMode={compactMode} />;
      case 'Analytics': return <AnalyticsPage data={internalData} {...translationProps} isDarkMode={isDarkMode} />;
      case 'Profile': return <ProfilePage user={internalData.user} data={internalData} onUserUpdate={handleUserUpdate} {...translationProps} />;
      case 'Notifications': return <NotificationsPage notifications={internalData.notifications} onNotificationClick={handleNotificationClick} onToggleStar={handleToggleStar} onTogglePin={handleTogglePin} onDelete={handleDeleteNotificationRequest} onClearAll={handleClearAllNotifications} {...translationProps} />;
      case 'Settings': return <SettingsPage 
            user={currentUser!} 
            onUserUpdate={handleUserUpdate} 
            isDarkMode={isDarkMode} 
            setIsDarkMode={setIsDarkMode} 
            showNotificationBadge={showNotificationBadge} 
            setShowNotificationBadge={setShowNotificationBadge} 
            playNotificationSound={playNotificationSound} 
            setPlayNotificationSound={setPlayNotificationSound} 
            showNotificationBanner={showNotificationBanner} 
            setShowNotificationBanner={setShowNotificationBanner} 
            initAudioContext={initAudioContext} 
            notificationBadgeType={notificationBadgeType} 
            setNotificationBadgeType={setNotificationBadgeType} 
            currency={currency}
            setCurrency={setCurrency}
            dateFormat={dateFormat}
            setDateFormat={setDateFormat}
            compactMode={compactMode}
            setCompactMode={setCompactMode}
            {...translationProps} 
        />;
      default: return <div className="text-center p-8">{activePage} Page (Not Implemented)</div>
    }
  };

  if (!currentUser) {
    return <AuthPage onLoginSuccess={handleLoginSuccess} t={t} />;
  }

  return (
    <div className={`h-screen w-screen bg-app-bg dark:bg-dark-app-bg flex font-sans transition-opacity duration-500 ${isLoggedIn ? 'opacity-100' : 'opacity-0'}`}>
        <div className={`flex w-full h-full ${isLoggedIn ? 'animate-app-entry' : ''}`}>
          <Sidebar activeItem={activePage} setActiveItem={setActivePage} t={t} />
          <div className="flex-1 flex flex-col overflow-hidden">
            <Header user={internalData.user} notifications={internalData.notifications || []} data={internalData} onSearchSelect={handleGlobalSearchSelect} onNotificationClick={handleNotificationClick} onDeleteNotification={handleDeleteNotificationRequest} onViewMoreClick={() => setActivePage('Notifications')} showNotificationBadge={showNotificationBadge} notificationBadgeType={notificationBadgeType} onLogout={handleLogout} t={t} />
            {/* 这里的 no-drag 是关键，它恢复了鼠标滚轮和文字选择功能 */}
            <main className="flex-1 p-8 overflow-y-auto no-drag">
              {renderContent()}
            </main>
          </div>

           <ToastContainer toasts={toasts} onRemove={handleRemoveToast} onClick={handleNotificationClick} t={t} />

           <Modal isOpen={!!notificationToDelete} onClose={() => setNotificationToDelete(null)} title={t('confirmDeletion')} size="md">
                <p className="dark:text-gray-200">{t('confirmDeleteNotification')}</p>
                <div className="flex justify-end gap-4 mt-6"> <button onClick={() => setNotificationToDelete(null)} className="px-4 py-2 bg-gray-200 rounded-lg dark:bg-gray-600">{t('cancel')}</button> <button onClick={confirmDeleteNotification} className="px-4 py-2 bg-red-600 text-white rounded-lg">{t('delete')}</button> </div>
           </Modal>
           
           {viewingEntity && viewingEntity.type === 'client' && (
               <Modal isOpen={true} onClose={() => setViewingEntity(null)} title={t('clientDetails')} size="4xl">
                   <ClientDetailView 
                    client={viewingEntity} 
                    followUpHistory={internalData.followUpHistory.filter(f => f.clientId === viewingEntity?.id).sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime())} 
                    t={t} 
                    formatDate={formatDate} 
                    onAddFollowUp={() => setFollowUpModalState({ type: 'followup', client: viewingEntity, recordId: undefined })} 
                    onDeleteFollowUp={(recordId) => setFollowUpModalState({ type: 'deleteFollowUp', client: viewingEntity, recordId: recordId })} />
               </Modal>
           )}
           {viewingEntity && viewingEntity.type === 'order' && (
                <Modal isOpen={true} onClose={() => setViewingEntity(null)} title={t('orderDetails')} size="4xl">
                   <OrderDetailView order={viewingEntity} t={t} formatDate={formatDate} />
                </Modal>
           )}

            {/* Follow-up Modals */}
            <Modal isOpen={followUpModalState.type === 'deleteFollowUp'} onClose={() => setFollowUpModalState({type: null, client: null})} title={t('deleteFollowUpConfirmation')} size="md">
                <p className="dark:text-gray-200">{t('deleteFollowUpMessage')}</p>
                <div className="flex justify-end gap-4 mt-6">
                    <button onClick={() => setFollowUpModalState({type: null, client: null})} className="px-4 py-2 bg-gray-200 rounded-lg dark:bg-gray-600">{t('cancel')}</button>
                    <button onClick={confirmDeleteFollowUp} className="px-4 py-2 bg-red-600 text-white rounded-lg">{t('confirmDelete')}</button>
                </div>
            </Modal>

            <Modal isOpen={followUpModalState.type === 'followup'} onClose={() => setFollowUpModalState({type: null, client: null})} title={t('addFollowUp')} size="lg">
                {followUpModalState.client && <FollowUpForm onSave={handleSaveFollowUp} onCancel={() => setFollowUpModalState({type: null, client: null})} t={t} />}
            </Modal>
       </div>
    </div>
  );
};

export default App;
