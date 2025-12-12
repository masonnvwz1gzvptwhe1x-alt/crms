
import React, { useState, FC, useEffect, useMemo } from 'react';
import { User } from '../types';
import { useTranslation } from '../hooks/useTranslation';
import { LogoIcon } from './icons';

interface AuthPageProps {
    onLoginSuccess: (user: User) => void;
    t: ReturnType<typeof useTranslation>['t'];
}

// Reusable Modal Component for Terms of Service
const Modal: FC<{ isOpen: boolean; onClose: () => void; title: string; children: React.ReactNode; }> = ({ isOpen, onClose, title, children }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4" onClick={onClose}>
            <div className="bg-white dark:bg-dark-card rounded-lg shadow-xl w-full max-w-lg max-h-[80vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center p-4 border-b dark:border-dark-stroke">
                    <h2 className="text-lg font-bold text-gray-800 dark:text-gray-200">{title}</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white text-2xl font-bold">&times;</button>
                </div>
                <div className="p-6 overflow-y-auto text-gray-600 dark:text-gray-300 space-y-4">
                    {children}
                </div>
            </div>
        </div>
    );
};

// --- SVG Icons for Theme Toggle ---
const SunIcon: FC<{ className?: string }> = ({ className }) => (
    <svg className={className || "w-6 h-6 text-white"} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <circle cx="12" cy="12" r="5" />
        <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
    </svg>
);
const MoonIcon: FC<{ className?: string }> = ({ className }) => (
    <svg className={className || "w-6 h-6 text-white"} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
    </svg>
);


const AuthPage: FC<AuthPageProps> = ({ onLoginSuccess, t }) => {
    const [view, setView] = useState<'login' | 'register' | 'forgotPassword'>('login');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [termsAccepted, setTermsAccepted] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);
    const [isTermsModalOpen, setIsTermsModalOpen] = useState(false);
    
    // Initialize from localStorage if available, otherwise check system preference
    const [isDay, setIsDay] = useState(() => {
        const savedDarkMode = localStorage.getItem('darkMode');
        if (savedDarkMode !== null) return savedDarkMode === 'false';
        return !(window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches);
    });

    // Sync local state with DOM and localStorage immediately
    const toggleTheme = () => {
        const newIsDay = !isDay;
        setIsDay(newIsDay);
        
        // If it's day, dark mode is false
        const isDark = !newIsDay;
        localStorage.setItem('darkMode', String(isDark));
        document.documentElement.classList.toggle('dark', isDark);
    };
    
    // Ensure DOM matches state on mount
    useEffect(() => {
        const isDark = !isDay;
        document.documentElement.classList.toggle('dark', isDark);
        localStorage.setItem('darkMode', String(isDark));
    }, [isDay]);

    const stars = useMemo(() => Array.from({ length: 50 }).map((_, i) => ({
        id: i,
        top: `${Math.random() * 100}%`,
        left: `${Math.random() * 100}%`,
        width: `${Math.random() * 2 + 1}px`,
        height: `${Math.random() * 2 + 1}px`,
        animationDelay: `${Math.random() * 3}s`,
    })), []);

    useEffect(() => {
        const rememberedCreds = localStorage.getItem('rememberedCredentials');
        if (rememberedCreds) {
            const { email, password } = JSON.parse(rememberedCreds);
            setFormData(prev => ({ ...prev, email, password }));
            setRememberMe(true);
        }
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setError('');
        setSuccess('');
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        const users: User[] = JSON.parse(localStorage.getItem('users') || '[]');
        const user = users.find(u => u.email === formData.email && u.password === formData.password);
        if (user) {
            if (rememberMe) {
                localStorage.setItem('rememberedCredentials', JSON.stringify({ email: formData.email, password: formData.password }));
            } else {
                localStorage.removeItem('rememberedCredentials');
            }
            localStorage.setItem('currentUserId', user.id);
            onLoginSuccess(user);
        } else {
            setError(t('invalidCredentials'));
        }
    };

    const handleRegister = (e: React.FormEvent) => {
        e.preventDefault();
        if (!termsAccepted) {
            setError(t('mustAcceptTerms'));
            return;
        }
        if (formData.password !== formData.confirmPassword) {
            setError(t('passwordMismatch'));
            return;
        }
        const users: User[] = JSON.parse(localStorage.getItem('users') || '[]');
        if (users.some(u => u.email === formData.email)) {
            setError(t('emailInUse'));
            return;
        }
        
        const newUser: User = {
            id: `user_${Date.now()}`,
            name: formData.name,
            email: formData.email,
            password: formData.password,
            role: 'Agent',
            avatarUrl: `https://i.pravatar.cc/56?u=${formData.email}`,
            department: 'Sales',
            phone: '',
            about: `New user profile for ${formData.name}.`
        };

        users.push(newUser);
        localStorage.setItem('users', JSON.stringify(users));
        localStorage.setItem('currentUserId', newUser.id);
        
        const allCrmData = JSON.parse(localStorage.getItem('crmData') || '{}');
        allCrmData[newUser.id] = {
            clients: [], followUpHistory: [], failureReasons: {}, orders: [],
            user: newUser, notifications: []
        };
        localStorage.setItem('crmData', JSON.stringify(allCrmData));

        onLoginSuccess(newUser);
    };
    
    const handlePasswordReset = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        
        if (formData.password !== formData.confirmPassword) {
            setError(t('passwordMismatch'));
            return;
        }

        const users: User[] = JSON.parse(localStorage.getItem('users') || '[]');
        const userIndex = users.findIndex(u => u.email === formData.email);
        
        if (userIndex > -1) {
            users[userIndex].password = formData.password;
            localStorage.setItem('users', JSON.stringify(users));
            setSuccess(t('passwordResetSuccess'));
            setTimeout(() => {
                switchView('login');
            }, 2000);
        } else {
            setError(t('userNotFound'));
        }
    };

    const resetForm = () => {
         setError('');
         setSuccess('');
         setFormData({ name: '', email: '', password: '', confirmPassword: '' });
         setTermsAccepted(false);
    }

    const switchView = (newView: 'login' | 'register' | 'forgotPassword') => {
        resetForm();
        setView(newView);
    };

    const renderContent = () => {
        switch(view) {
            case 'register':
                return (
                    <>
                        <form onSubmit={handleRegister} className="space-y-4">
                            <InputField name="name" type="text" placeholder={t('fullName')} value={formData.name} onChange={handleChange} />
                            <InputField name="email" type="email" placeholder={t('email')} value={formData.email} onChange={handleChange} />
                            <InputField name="password" type="password" placeholder={t('password')} value={formData.password} onChange={handleChange} />
                            <InputField name="confirmPassword" type="password" placeholder={t('confirmPassword')} value={formData.confirmPassword} onChange={handleChange} />

                            <div className="flex items-center gap-2">
                               <input id="terms" type="checkbox" checked={termsAccepted} onChange={(e) => setTermsAccepted(e.target.checked)} className="h-4 w-4 bg-transparent rounded border-white/50 text-primary focus:ring-primary" />
                               <label htmlFor="terms" className="text-xs text-white/80">
                                   {t('agreeToTerms')}{' '}
                                   <button type="button" onClick={() => setIsTermsModalOpen(true)} className="underline hover:text-white">{t('termsOfService')}</button>
                                </label>
                            </div>

                            <button type="submit" className="w-full bg-white text-primary font-bold py-3 rounded-lg hover:bg-white/90 transition-all duration-300 shadow-lg transform hover:scale-105">
                                {t('register')}
                            </button>
                        </form>
                        <p className="text-center text-sm mt-4 text-white/80">
                            {t('registerPrompt')}{' '}
                            <button onClick={() => switchView('login')} className="font-bold hover:text-white transition-colors">{t('login')}</button>
                        </p>
                    </>
                );
            case 'forgotPassword':
                 return (
                    <>
                        <form onSubmit={handlePasswordReset} className="space-y-4">
                            <InputField name="email" type="email" placeholder={t('email')} value={formData.email} onChange={handleChange} />
                            <InputField name="password" type="password" placeholder={t('newPassword')} value={formData.password} onChange={handleChange} />
                            <InputField name="confirmPassword" type="password" placeholder={t('confirmPassword')} value={formData.confirmPassword} onChange={handleChange} />

                            <button type="submit" className="w-full bg-white text-primary font-bold py-3 rounded-lg hover:bg-white/90 transition-all">
                                {t('findAccount')}
                            </button>
                        </form>
                         <p className="text-center text-sm mt-6 text-white/80">
                            <button onClick={() => switchView('login')} className="font-bold hover:text-white transition-colors">{t('backToLogin')}</button>
                        </p>
                    </>
                );
            case 'login':
            default:
                 return (
                    <>
                        <form onSubmit={handleLogin} className="space-y-4">
                            <InputField name="email" type="email" placeholder={t('email')} value={formData.email} onChange={handleChange} />
                            <InputField name="password" type="password" placeholder={t('password')} value={formData.password} onChange={handleChange} />
                            
                            <div className="flex justify-between items-center text-sm">
                                <label className="flex items-center gap-2 text-white/80">
                                    <input type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} className="h-4 w-4 bg-transparent rounded border-white/50 text-primary focus:ring-primary" />
                                    {t('rememberMe')}
                                </label>
                                <button type="button" onClick={() => switchView('forgotPassword')} className="text-white/80 hover:text-white transition-colors">{t('forgotPassword')}</button>
                            </div>
                            <button type="submit" className="w-full bg-white text-primary font-bold py-3 rounded-lg hover:bg-white/90 transition-all duration-300 shadow-lg transform hover:scale-105">
                                {t('login')}
                            </button>
                        </form>
                         <p className="text-center text-sm mt-6 text-white/80">
                            {t('loginPrompt')}{' '}
                            <button onClick={() => switchView('register')} className="font-bold hover:text-white transition-colors">{t('register')}</button>
                        </p>
                    </>
                 );
        }
    };

    const getTitle = () => {
        switch(view) {
            case 'register': return t('register');
            case 'forgotPassword': return t('recoverPassword');
            case 'login': default: return t('login');
        }
    };

    return (
        <>
            <div className="h-screen w-screen flex items-center justify-center auth-container">
                {/* --- Dynamic Background --- */}
                <div className={`sky ${isDay ? 'sky-day' : 'sky-night'}`}></div>
                <div className={`stars ${!isDay ? 'opacity-100' : 'opacity-0'}`}>
                    {stars.map(star => (
                        <div key={star.id} className="star" style={{ top: star.top, left: star.left, width: star.width, height: star.height, animationDelay: star.animationDelay }}></div>
                    ))}
                </div>

                <button onClick={toggleTheme} className="theme-toggle" aria-label="Toggle Day/Night Theme">
                    {isDay ? <MoonIcon /> : <SunIcon />}
                </button>
                {/* --- End Dynamic Background --- */}
                
                <div className="auth-card w-full max-w-md bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl p-8 border border-white/20 animate-fade-in text-white z-10 flex flex-col justify-center">
                    <div className="text-center mb-8">
                        <div className="flex justify-center items-center gap-3">
                             <LogoIcon />
                             <h1 className="text-2xl font-bold">CircleSoft</h1>
                        </div>
                        <p className="text-white/70 mt-2">{getTitle()}</p>
                    </div>

                    {error && <p className="bg-red-500/50 text-white text-center p-2 rounded-lg mb-4 text-sm">{error}</p>}
                    {success && <p className="bg-green-500/50 text-white text-center p-2 rounded-lg mb-4 text-sm">{success}</p>}
                    
                    {renderContent()}
                </div>
            </div>
            <Modal isOpen={isTermsModalOpen} onClose={() => setIsTermsModalOpen(false)} title={t('termsModalTitle')}>
                <p>{t('termsModalContentP1')}</p>
                <p>{t('termsModalContentP2')}</p>
                <div className="text-right mt-4">
                    <button onClick={() => setIsTermsModalOpen(false)} className="px-4 py-2 bg-primary text-white rounded-lg">{t('close')}</button>
                </div>
            </Modal>
        </>
    );
};

const InputField: FC<React.InputHTMLAttributes<HTMLInputElement>> = (props) => (
    <input 
        {...props}
        required
        className="w-full bg-white/20 border border-white/30 rounded-lg px-4 py-3 placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/80 transition-all"
    />
);

export default AuthPage;
