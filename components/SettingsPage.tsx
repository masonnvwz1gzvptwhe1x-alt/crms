
import React, { FC, useState } from 'react';
import { useTranslation } from '../hooks/useTranslation';
import { NotificationBadgeType, User, Currency, DateFormat } from '../types';
import { LogoIcon } from './icons';

// Reusable Modal Component
const Modal: FC<{ isOpen: boolean; onClose: () => void; title: string; children: React.ReactNode; size?: 'md' | 'lg' | 'xl' }> = ({ isOpen, onClose, title, children, size = 'md' }) => {
    if (!isOpen) return null;
    const sizeClasses = { 'md': 'max-w-md', 'lg': 'max-w-lg', 'xl': 'max-w-3xl' };
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


interface SettingsPageProps {
    user: User;
    onUserUpdate: (user: User) => void;
    isDarkMode: boolean;
    setIsDarkMode: (isDark: boolean) => void;
    showNotificationBadge: boolean;
    setShowNotificationBadge: (show: boolean) => void;
    playNotificationSound: boolean;
    setPlayNotificationSound: (play: boolean) => void;
    showNotificationBanner: boolean;
    setShowNotificationBanner: (show: boolean) => void;
    initAudioContext: () => void;
    notificationBadgeType: NotificationBadgeType;
    setNotificationBadgeType: (type: NotificationBadgeType) => void;
    currency: Currency;
    setCurrency: (currency: Currency) => void;
    dateFormat: DateFormat;
    setDateFormat: (format: DateFormat) => void;
    compactMode: boolean;
    setCompactMode: (compact: boolean) => void;
    t: (key: string) => string;
    locale: 'en' | 'zh';
    setLocale: (locale: 'en' | 'zh') => void;
}

const ToggleSwitch: FC<{ checked: boolean; onChange: (checked: boolean) => void; 'aria-label': string }> = ({ checked, onChange, 'aria-label': ariaLabel }) => (
    <button
        onClick={() => onChange(!checked)}
        role="switch"
        aria-checked={checked}
        aria-label={ariaLabel}
        className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary dark:focus:ring-offset-dark-card ${checked ? 'bg-primary' : 'bg-gray-300 dark:bg-gray-600'}`}
    >
        <span
            className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${checked ? 'translate-x-6' : 'translate-x-1'}`}
        />
    </button>
);

const SettingsPage: FC<Omit<SettingsPageProps, 't'|'locale'|'setLocale'> & ReturnType<typeof useTranslation>> = ({ 
    user,
    onUserUpdate,
    isDarkMode, 
    setIsDarkMode, 
    showNotificationBadge,
    setShowNotificationBadge,
    playNotificationSound,
    setPlayNotificationSound,
    showNotificationBanner,
    setShowNotificationBanner,
    initAudioContext,
    notificationBadgeType,
    setNotificationBadgeType,
    currency,
    setCurrency,
    dateFormat,
    setDateFormat,
    compactMode,
    setCompactMode,
    t, 
    locale, 
    setLocale 
}) => {
    
    const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
    const [viewingDoc, setViewingDoc] = useState<'terms' | 'privacy' | 'help' | null>(null);

    const handleSoundToggleChange = (checked: boolean) => {
        if (checked) {
            initAudioContext(); // Ensure audio context is ready on first enable
        }
        setPlayNotificationSound(checked);
    };
    
    const renderDocumentContent = (docType: 'terms' | 'privacy' | 'help') => {
        const contentKey = docType === 'terms' ? 'termsContent' : docType === 'privacy' ? 'privacyContent' : 'helpContent';
        const content = t(contentKey);
        return (
            <div className="space-y-4 text-subtext dark:text-dark-subtext leading-relaxed whitespace-pre-line">
                {content}
            </div>
        );
    };

    return (
        <>
            <div className="max-w-4xl mx-auto space-y-8 pb-8">
                <h1 className="text-3xl font-bold text-heading dark:text-dark-heading">{t('settings')}</h1>

                {/* Account Settings */}
                <div className="bg-white dark:bg-dark-card border border-stroke dark:border-dark-stroke rounded-lg shadow-sm">
                    <div className="p-6 border-b border-stroke dark:border-dark-stroke">
                        <h2 className="text-xl font-bold text-heading dark:text-dark-heading">{t('account')}</h2>
                        <p className="text-sm text-subtext dark:text-dark-subtext">{t('manageAccount')}</p>
                    </div>
                    <div className="p-6 space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-heading dark:text-dark-heading mb-1">{t('emailAddress')}</label>
                            <input type="email" value={user.email} readOnly className="w-full max-w-sm px-3 py-2 border border-stroke dark:border-dark-stroke rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-gray-50 dark:bg-gray-700 dark:text-white" />
                        </div>
                         <div>
                            <label className="block text-sm font-medium text-heading dark:text-dark-heading mb-1">{t('password')}</label>
                            <button onClick={() => setIsPasswordModalOpen(true)} className="text-primary hover:underline">{t('changePassword')}</button>
                        </div>
                    </div>
                </div>

                {/* Appearance Settings */}
                <div className="bg-white dark:bg-dark-card border border-stroke dark:border-dark-stroke rounded-lg shadow-sm">
                    <div className="p-6 border-b border-stroke dark:border-dark-stroke">
                        <h2 className="text-xl font-bold text-heading dark:text-dark-heading">{t('appearance')}</h2>
                        <p className="text-sm text-subtext dark:text-dark-subtext">{t('customizeAppearance')}</p>
                    </div>
                    <div className="p-6 space-y-4">
                        <div className="flex justify-between items-center">
                            <div>
                                <h3 className="font-semibold text-heading dark:text-dark-heading">{t('darkMode')}</h3>
                                <p className="text-sm text-subtext dark:text-dark-subtext">{t('enableDarkMode')}</p>
                            </div>
                            <ToggleSwitch checked={isDarkMode} onChange={setIsDarkMode} aria-label={t('darkMode')} />
                        </div>
                         <div className="flex justify-between items-center">
                            <div>
                                <h3 className="font-semibold text-heading dark:text-dark-heading">{t('language')}</h3>
                                <p className="text-sm text-subtext dark:text-dark-subtext">{t('chooseLanguage')}</p>
                            </div>
                             <div className="flex items-center gap-2">
                                <button onClick={() => setLocale('zh')} className={`px-4 py-1.5 rounded-md text-sm font-semibold transition-colors ${locale === 'zh' ? 'bg-primary text-white' : 'bg-gray-200 dark:bg-gray-600 text-heading dark:text-dark-heading'}`}>中文</button>
                                <button onClick={() => setLocale('en')} className={`px-4 py-1.5 rounded-md text-sm font-semibold transition-colors ${locale === 'en' ? 'bg-primary text-white' : 'bg-gray-200 dark:bg-gray-600 text-heading dark:text-dark-heading'}`}>English</button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Preferences (Personalization) */}
                <div className="bg-white dark:bg-dark-card border border-stroke dark:border-dark-stroke rounded-lg shadow-sm">
                    <div className="p-6 border-b border-stroke dark:border-dark-stroke">
                        <h2 className="text-xl font-bold text-heading dark:text-dark-heading">{t('preferences')}</h2>
                        <p className="text-sm text-subtext dark:text-dark-subtext">{t('personalizeExperience')}</p>
                    </div>
                    <div className="p-6 space-y-4">
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-heading dark:text-dark-heading mb-1">{t('currency')}</label>
                                <select 
                                    value={currency} 
                                    onChange={(e) => setCurrency(e.target.value as Currency)}
                                    className="w-full p-2 border border-stroke dark:border-dark-stroke rounded-md dark:bg-dark-app-bg dark:text-white focus:ring-primary focus:border-primary"
                                >
                                    <option value="USD">USD ($)</option>
                                    <option value="CNY">CNY (¥)</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-heading dark:text-dark-heading mb-1">{t('dateFormat')}</label>
                                <select 
                                    value={dateFormat} 
                                    onChange={(e) => setDateFormat(e.target.value as DateFormat)}
                                    className="w-full p-2 border border-stroke dark:border-dark-stroke rounded-md dark:bg-dark-app-bg dark:text-white focus:ring-primary focus:border-primary"
                                >
                                    <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                                    <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                                    <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                                    <option value="zh-CN">中文 (2023年1月1日)</option>
                                </select>
                            </div>
                         </div>
                         
                         <div className="flex justify-between items-center pt-4">
                            <div>
                                <h3 className="font-semibold text-heading dark:text-dark-heading">{t('compactMode')}</h3>
                                <p className="text-sm text-subtext dark:text-dark-subtext">{t('compactModeDesc')}</p>
                            </div>
                            <ToggleSwitch checked={compactMode} onChange={setCompactMode} aria-label={t('compactMode')} />
                        </div>
                    </div>
                </div>

                {/* Notification Settings */}
                <div className="bg-white dark:bg-dark-card border border-stroke dark:border-dark-stroke rounded-lg shadow-sm">
                    <div className="p-6 border-b border-stroke dark:border-dark-stroke">
                        <h2 className="text-xl font-bold text-heading dark:text-dark-heading">{t('notifications')}</h2>
                        <p className="text-sm text-subtext dark:text-dark-subtext">{t('manageNotifications')}</p>
                    </div>
                    <div className="p-6 divide-y divide-stroke dark:divide-dark-stroke">
                        <div className="flex justify-between items-center py-4 first:pt-0 last:pb-0">
                            <div>
                                <h3 className="font-semibold text-heading dark:text-dark-heading">{t('showUnreadCount')}</h3>
                                <p className="text-sm text-subtext dark:text-dark-subtext">{t('showUnreadCountDesc')}</p>
                            </div>
                            <ToggleSwitch checked={showNotificationBadge} onChange={setShowNotificationBadge} aria-label={t('showUnreadCount')} />
                        </div>
                        {showNotificationBadge && (
                            <div className="flex justify-between items-center py-4 first:pt-0 last:pb-0">
                                <div>
                                    <h3 className="font-semibold text-heading dark:text-dark-heading">{t('badgeContent')}</h3>
                                    <p className="text-sm text-subtext dark:text-dark-subtext">{t('badgeContentDesc')}</p>
                                </div>
                                 <div className="flex items-center gap-2 p-1 bg-gray-100 dark:bg-dark-app-bg rounded-lg">
                                    <button onClick={() => setNotificationBadgeType('unread')} className={`px-3 py-1 rounded-md text-sm font-semibold transition-colors ${notificationBadgeType === 'unread' ? 'bg-white dark:bg-dark-card shadow text-heading dark:text-dark-heading' : 'text-subtext'}`}>{t('unreadCount')}</button>
                                    <button onClick={() => setNotificationBadgeType('total')} className={`px-3 py-1 rounded-md text-sm font-semibold transition-colors ${notificationBadgeType === 'total' ? 'bg-white dark:bg-dark-card shadow text-heading dark:text-dark-heading' : 'text-subtext'}`}>{t('totalCount')}</button>
                                </div>
                            </div>
                        )}
                        <div className="flex justify-between items-center py-4 first:pt-0 last:pb-0">
                            <div>
                               <h3 className="font-semibold text-heading dark:text-dark-heading">{t('playNotificationSound')}</h3>
                               <p className="text-sm text-subtext dark:text-dark-subtext">{t('playNotificationSoundDesc')}</p>
                            </div>
                            <ToggleSwitch checked={playNotificationSound} onChange={handleSoundToggleChange} aria-label={t('playNotificationSound')} />
                        </div>
                         <div className="flex justify-between items-center py-4 first:pt-0 last:pb-0">
                            <div>
                               <h3 className="font-semibold text-heading dark:text-dark-heading">{t('showBannerNotification')}</h3>
                               <p className="text-sm text-subtext dark:text-dark-subtext">{t('showBannerNotificationDesc')}</p>
                            </div>
                            <ToggleSwitch checked={showNotificationBanner} onChange={setShowNotificationBanner} aria-label={t('showBannerNotification')} />
                        </div>
                    </div>
                </div>

                {/* About Section */}
                <div className="bg-white dark:bg-dark-card border border-stroke dark:border-dark-stroke rounded-lg shadow-sm">
                     <div className="p-6 border-b border-stroke dark:border-dark-stroke">
                        <h2 className="text-xl font-bold text-heading dark:text-dark-heading">{t('aboutCircleSoft')}</h2>
                        <p className="text-sm text-subtext dark:text-dark-subtext">{t('aboutDescription')}</p>
                    </div>
                    <div className="p-8 flex flex-col items-center text-center">
                        <div className="mb-6 p-6 bg-gradient-to-br from-white to-gray-50 dark:from-dark-app-bg dark:to-dark-card rounded-3xl shadow-inner border border-stroke dark:border-dark-stroke">
                            <LogoIcon className="w-24 h-24 text-primary" />
                        </div>
                        <h3 className="text-3xl font-bold text-heading dark:text-dark-heading mb-2">CircleSoft CRM</h3>
                        <p className="text-subtext dark:text-dark-subtext max-w-md mb-8 leading-relaxed">{t('companyDescription')}</p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-lg mb-8 p-6 bg-gray-50 dark:bg-dark-app-bg rounded-2xl border border-stroke dark:border-dark-stroke">
                            <div className="text-center">
                                <p className="font-bold text-heading dark:text-dark-heading">{t('version')}</p>
                                <p className="text-xs text-subtext dark:text-dark-subtext mt-1 font-mono">v2.0.1 (Stable)</p>
                            </div>
                             <div className="text-center md:border-l md:border-r border-stroke dark:border-dark-stroke">
                                <p className="font-bold text-heading dark:text-dark-heading">{t('buildDate')}</p>
                                <p className="text-xs text-subtext dark:text-dark-subtext mt-1">2024-09-15</p>
                            </div>
                             <div className="text-center">
                                <p className="font-bold text-heading dark:text-dark-heading">{t('license')}</p>
                                <p className="text-xs text-subtext dark:text-dark-subtext mt-1">Enterprise</p>
                            </div>
                        </div>

                        <div className="flex flex-wrap justify-center gap-2 text-sm text-subtext dark:text-dark-subtext">
                             <button onClick={() => setViewingDoc('terms')} className="hover:text-primary transition-colors underline decoration-dotted underline-offset-4">{t('termsOfService')}</button>
                             <span className="opacity-50">•</span>
                             <button onClick={() => setViewingDoc('privacy')} className="hover:text-primary transition-colors underline decoration-dotted underline-offset-4">{t('privacyPolicy')}</button>
                             <span className="opacity-50">•</span>
                             <button onClick={() => setViewingDoc('help')} className="hover:text-primary transition-colors underline decoration-dotted underline-offset-4">{t('helpCenter')}</button>
                        </div>
                        <p className="mt-8 text-xs text-gray-400">
                            © {new Date().getFullYear()} CircleSoft Inc. {t('allRightsReserved')}
                        </p>
                    </div>
                </div>
            </div>
            
            <Modal isOpen={isPasswordModalOpen} onClose={() => setIsPasswordModalOpen(false)} title={t('changePasswordModalTitle')} size="md">
                <ChangePasswordForm user={user} onUserUpdate={onUserUpdate} t={t} closeModal={() => setIsPasswordModalOpen(false)} />
            </Modal>

            <Modal isOpen={!!viewingDoc} onClose={() => setViewingDoc(null)} title={viewingDoc === 'terms' ? t('termsOfServiceTitle') : viewingDoc === 'privacy' ? t('privacyPolicyTitle') : t('helpCenterTitle')} size="xl">
                {viewingDoc && renderDocumentContent(viewingDoc)}
                <div className="flex justify-end mt-6 pt-4 border-t dark:border-dark-stroke">
                    <button onClick={() => setViewingDoc(null)} className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark">{t('close')}</button>
                </div>
            </Modal>
        </>
    );
};

const ChangePasswordForm: FC<{user: User, onUserUpdate: (user: User) => void, t: Function, closeModal: () => void}> = ({ user, onUserUpdate, t, closeModal }) => {
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmNewPassword, setConfirmNewPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (user.password !== currentPassword) {
            setError(t('incorrectCurrentPassword'));
            return;
        }
        if (newPassword !== confirmNewPassword) {
            setError(t('passwordMismatch'));
            return;
        }
        if (newPassword.length < 6) {
            setError('Password must be at least 6 characters long.'); // Simple validation
            return;
        }

        onUserUpdate({ ...user, password: newPassword });
        setSuccess(t('passwordUpdatedSuccess'));
        
        // Reset form and close modal after a delay
        setTimeout(() => {
            closeModal();
            setCurrentPassword('');
            setNewPassword('');
            setConfirmNewPassword('');
        }, 1500);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {error && <p className="text-red-500 text-sm">{error}</p>}
            {success && <p className="text-green-500 text-sm">{success}</p>}
            <div>
                <label className="block text-sm font-medium text-subtext dark:text-dark-subtext mb-1">{t('currentPassword')}</label>
                <input type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} required className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
            </div>
            <div>
                <label className="block text-sm font-medium text-subtext dark:text-dark-subtext mb-1">{t('newPassword')}</label>
                <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} required className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
            </div>
            <div>
                <label className="block text-sm font-medium text-subtext dark:text-dark-subtext mb-1">{t('confirmNewPassword')}</label>
                <input type="password" value={confirmNewPassword} onChange={e => setConfirmNewPassword(e.target.value)} required className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
            </div>
            <div className="flex justify-end gap-4 pt-4">
                <button type="button" onClick={closeModal} className="px-4 py-2 bg-gray-200 rounded-lg dark:bg-gray-600 text-heading dark:text-dark-heading">{t('cancel')}</button>
                <button type="submit" className="px-4 py-2 bg-primary text-white rounded-lg">{t('save')}</button>
            </div>
        </form>
    );
};

export default SettingsPage;
