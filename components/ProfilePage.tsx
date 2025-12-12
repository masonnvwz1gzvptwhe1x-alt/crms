
import React, { FC, useState, useEffect, useMemo } from 'react';
import { User, CrmData } from '../types';
import { useTranslation } from '../hooks/useTranslation';
import { BriefcaseIcon, LocationIcon, BadgeIcon, ClientsIcon, OrdersIcon, AnalyticsIcon, UsersIcon } from './icons';

// Reusable Modal Component
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

interface ProfilePageProps {
    user: User;
    data: CrmData;
    onUserUpdate: (user: User) => void;
    t: (key: string) => string;
    formatCurrency: (amount: number) => string;
}

const StatCard: FC<{ label: string, value: string | number, icon: React.ReactNode, colorClass: string }> = ({ label, value, icon, colorClass }) => (
    <div className="bg-white dark:bg-dark-card border border-stroke dark:border-dark-stroke rounded-xl p-5 flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow">
        <div className={`p-3 rounded-lg ${colorClass}`}>
            {icon}
        </div>
        <div>
            <p className="text-sm text-subtext dark:text-dark-subtext font-medium">{label}</p>
            <p className="text-2xl font-bold text-heading dark:text-dark-heading mt-1">{value}</p>
        </div>
    </div>
);

const ProfilePage: FC<Omit<ProfilePageProps, 't'|'formatCurrency'> & ReturnType<typeof useTranslation>> = ({ user, data, onUserUpdate, t, formatCurrency }) => {
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [formData, setFormData] = useState<User>(user);

    useEffect(() => {
        setFormData(user);
    }, [user]);
    
    const stats = useMemo(() => {
        const totalClients = data.clients.length;
        const activeOrders = data.orders.filter(o => o.orderStatus === '行程中' || o.orderStatus === '待出行').length;
        const totalSales = data.orders.reduce((sum, order) => sum + (order.storeSettlement || 0), 0);
        const conversionRate = totalClients > 0 
            ? ((data.orders.length / data.clients.length) * 100).toFixed(1) 
            : '0.0';
            
        return { totalClients, activeOrders, totalSales, conversionRate };
    }, [data]);

    if (!user) {
        return <div className="text-center p-8">{t('loading')}...</div>;
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        onUserUpdate(formData);
        setIsEditOpen(false);
    };
    
    const teams = [
        { name: 'Sales Team Alpha', role: 'Lead', members: 8, color: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' },
        { name: 'APAC Regional Group', role: 'Member', members: 24, color: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400' },
    ];

    return (
        <div className="max-w-7xl mx-auto space-y-6">
            {/* Header Section */}
            <div className="bg-white dark:bg-dark-card border border-stroke dark:border-dark-stroke rounded-xl shadow-sm overflow-hidden">
                {/* Simple Clean Gradient Background */}
                <div className="h-32 relative overflow-hidden bg-gradient-to-r from-[#5932EA] to-[#60A5FA]"></div>
                
                <div className="px-8 pb-8 relative">
                    <div className="flex flex-col md:flex-row items-end -mt-12 mb-4 gap-6">
                        <div className="w-32 h-32 rounded-full border-4 border-white dark:border-dark-card overflow-hidden shadow-lg bg-white flex-shrink-0">
                            <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-grow pb-2 text-center md:text-left">
                            <h1 className="text-3xl font-bold text-heading dark:text-dark-heading">{user.name}</h1>
                            <div className="flex flex-wrap justify-center md:justify-start gap-4 mt-2 text-sm text-subtext dark:text-dark-subtext">
                                <div className="flex items-center gap-1">
                                    <BriefcaseIcon className="w-4 h-4" />
                                    <span>{user.role} • {user.department}</span>
                                </div>
                                {user.location && (
                                    <div className="flex items-center gap-1">
                                        <LocationIcon className="w-4 h-4" />
                                        <span>{user.location}</span>
                                    </div>
                                )}
                                <div className="flex items-center gap-1 text-primary font-semibold bg-primary/10 px-2 py-0.5 rounded-full">
                                    <BadgeIcon className="w-4 h-4" />
                                    <span>Top Performer</span>
                                </div>
                            </div>
                        </div>
                        <div className="pb-4">
                            <button onClick={() => setIsEditOpen(true)} className="bg-primary text-white px-6 py-2.5 rounded-lg font-bold hover:bg-primary-dark transition-all shadow-lg shadow-primary/30 whitespace-nowrap">
                                {t('editProfile')}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column: Stats & Info */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Performance Overview */}
                    <div>
                        <h2 className="text-xl font-bold text-heading dark:text-dark-heading mb-4">{t('performanceOverview')}</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <StatCard 
                                label={t('totalClients')} 
                                value={stats.totalClients} 
                                icon={<ClientsIcon className="w-6 h-6 text-blue-600" />} 
                                colorClass="bg-blue-100 dark:bg-blue-900/30" 
                            />
                            <StatCard 
                                label={t('activeOrders')} 
                                value={stats.activeOrders} 
                                icon={<OrdersIcon className="w-6 h-6 text-purple-600" />} 
                                colorClass="bg-purple-100 dark:bg-purple-900/30" 
                            />
                            <StatCard 
                                label={t('totalSales')} 
                                value={formatCurrency(stats.totalSales)}
                                icon={<span className="text-2xl font-bold text-green-600">#</span>} 
                                colorClass="bg-green-100 dark:bg-green-900/30" 
                            />
                            <StatCard 
                                label={t('conversionRate')} 
                                value={`${stats.conversionRate}%`} 
                                icon={<AnalyticsIcon className="w-6 h-6 text-orange-600" />} 
                                colorClass="bg-orange-100 dark:bg-orange-900/30" 
                            />
                        </div>
                    </div>
                    
                    {/* Teams Section */}
                    <div className="bg-white dark:bg-dark-card border border-stroke dark:border-dark-stroke rounded-xl p-6 shadow-sm">
                         <h2 className="text-lg font-bold text-heading dark:text-dark-heading mb-4">{t('teams')}</h2>
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {teams.map((team, i) => (
                                <div key={i} className="flex items-center justify-between p-4 border border-stroke dark:border-dark-stroke rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                                    <div className="flex items-center gap-4">
                                        <div className={`p-3 rounded-lg ${team.color}`}>
                                            <UsersIcon className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <p className="font-bold text-heading dark:text-dark-heading">{team.name}</p>
                                            <p className="text-sm text-subtext dark:text-dark-subtext">{team.members} {t('members')}</p>
                                        </div>
                                    </div>
                                    <span className="px-3 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300">
                                        {team.role}
                                    </span>
                                </div>
                            ))}
                         </div>
                    </div>

                    {/* About Section */}
                    <div className="bg-white dark:bg-dark-card border border-stroke dark:border-dark-stroke rounded-xl p-6 shadow-sm">
                        <h2 className="text-lg font-bold text-heading dark:text-dark-heading mb-4">{t('aboutMe')}</h2>
                        <p className="text-subtext dark:text-dark-subtext leading-relaxed">
                            {user.about || "No description provided."}
                        </p>
                    </div>
                </div>

                {/* Right Column: Contact & Account Details */}
                <div className="space-y-6">
                     {/* Contact Info */}
                    <div className="bg-white dark:bg-dark-card border border-stroke dark:border-dark-stroke rounded-xl shadow-sm">
                        <div className="p-6 border-b border-stroke dark:border-dark-stroke">
                            <h2 className="text-lg font-bold text-heading dark:text-dark-heading">{t('contactInformation')}</h2>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="text-xs uppercase font-semibold text-subtext dark:text-dark-subtext tracking-wider">{t('emailAddress')}</label>
                                <p className="font-medium text-heading dark:text-dark-heading mt-1">{user.email}</p>
                            </div>
                            <div>
                                <label className="text-xs uppercase font-semibold text-subtext dark:text-dark-subtext tracking-wider">{t('phone')}</label>
                                <p className="font-medium text-heading dark:text-dark-heading mt-1">{user.phone || '-'}</p>
                            </div>
                             <div>
                                <label className="text-xs uppercase font-semibold text-subtext dark:text-dark-subtext tracking-wider">{t('location')}</label>
                                <p className="font-medium text-heading dark:text-dark-heading mt-1">{user.location || '-'}</p>
                            </div>
                        </div>
                    </div>

                     {/* Account Details */}
                    <div className="bg-white dark:bg-dark-card border border-stroke dark:border-dark-stroke rounded-xl shadow-sm">
                         <div className="p-6 border-b border-stroke dark:border-dark-stroke">
                            <h2 className="text-lg font-bold text-heading dark:text-dark-heading">{t('accountDetails')}</h2>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="text-xs uppercase font-semibold text-subtext dark:text-dark-subtext tracking-wider">{t('employeeId')}</label>
                                <p className="font-mono font-medium text-heading dark:text-dark-heading mt-1">{user.employeeId || '-'}</p>
                            </div>
                             <div>
                                <label className="text-xs uppercase font-semibold text-subtext dark:text-dark-subtext tracking-wider">{t('joinDate')}</label>
                                <p className="font-medium text-heading dark:text-dark-heading mt-1">{user.joinDate || '-'}</p>
                            </div>
                             <div>
                                <label className="text-xs uppercase font-semibold text-subtext dark:text-dark-subtext tracking-wider">{t('department')}</label>
                                <p className="font-medium text-heading dark:text-dark-heading mt-1">{user.department}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <Modal isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} title={t('editProfile')} size="xl">
                <form onSubmit={handleSave} className="space-y-4">
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-subtext dark:text-dark-subtext mb-1">{t('name')}</label>
                            <input type="text" name="name" value={formData.name} onChange={handleChange} className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-primary" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-subtext dark:text-dark-subtext mb-1">{t('role')}</label>
                            <input type="text" name="role" value={formData.role} onChange={handleChange} className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-primary" />
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-subtext dark:text-dark-subtext mb-1">{t('department')}</label>
                            <input type="text" name="department" value={formData.department} onChange={handleChange} className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-primary" />
                        </div>
                         <div>
                            <label className="block text-sm font-medium text-subtext dark:text-dark-subtext mb-1">{t('phone')}</label>
                            <input type="text" name="phone" value={formData.phone} onChange={handleChange} className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-primary" />
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-subtext dark:text-dark-subtext mb-1">{t('location')}</label>
                            <input type="text" name="location" value={formData.location || ''} onChange={handleChange} className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-primary" />
                        </div>
                         <div>
                            <label className="block text-sm font-medium text-subtext dark:text-dark-subtext mb-1">{t('emailAddress')}</label>
                            <input type="email" name="email" value={formData.email} onChange={handleChange} className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-primary" />
                        </div>
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-subtext dark:text-dark-subtext mb-1">{t('aboutMe')}</label>
                        <textarea name="about" value={formData.about} onChange={handleChange} rows={4} className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-primary"></textarea>
                    </div>
                    <div className="flex justify-end gap-4 pt-4">
                        <button type="button" onClick={() => setIsEditOpen(false)} className="px-4 py-2 bg-gray-200 rounded-lg dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500">{t('cancel')}</button>
                        <button type="submit" className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark">{t('saveProfile')}</button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default ProfilePage;
