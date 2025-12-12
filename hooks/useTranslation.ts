
import { useState, useEffect, useCallback } from 'react';
import { en } from '../locales/en';
import { zh } from '../locales/zh';
import { Currency, DateFormat } from '../types';

const translations = { en, zh };

export type Locale = 'en' | 'zh';

interface UseTranslationProps {
    currency?: Currency;
    dateFormat?: DateFormat;
}

export const useTranslation = (props?: UseTranslationProps) => {
  const [locale, setLocale] = useState<Locale>(() => {
    const savedLocale = localStorage.getItem('locale');
    return (savedLocale === 'en' || savedLocale === 'zh') ? savedLocale : 'zh'; // Default to Chinese
  });

  useEffect(() => {
    localStorage.setItem('locale', locale);
  }, [locale]);

  const getTranslatedParams = useCallback((params?: Record<string, string | number>) => {
      if (!params) return undefined;
      const newParams = { ...params };
      if ('status' in newParams && typeof newParams.status === 'string') {
          // @ts-ignore
          newParams.status = translations[locale][newParams.status] || newParams.status;
      }
      return newParams;
  }, [locale]);
  
  const t = useCallback((key: string, params?: Record<string, string | number>) => {
    // @ts-ignore - Allow string keys for dynamic content like notifications
    let translation = translations[locale][key] || translations['zh'][key] || key;
    if (params) {
        Object.keys(params).forEach(paramKey => {
            translation = translation.replace(new RegExp(`{${paramKey}}`, 'g'), String(params[paramKey]));
        });
    }
    return translation;
  }, [locale]);

  const formatDate = useCallback((dateString: string | null | undefined) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '-';

    const format = props?.dateFormat || (locale === 'zh' ? 'zh-CN' : 'YYYY-MM-DD');

    if (format === 'zh-CN') {
        return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
    } else if (format === 'MM/DD/YYYY') {
        return `${String(date.getMonth() + 1).padStart(2, '0')}/${String(date.getDate()).padStart(2, '0')}/${date.getFullYear()}`;
    } else if (format === 'DD/MM/YYYY') {
        return `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()}`;
    } else {
         // Default YYYY-MM-DD
        return date.toISOString().split('T')[0];
    }
  }, [locale, props?.dateFormat]);

  const formatCurrency = useCallback((amount: number | undefined) => {
      if (amount === undefined || amount === null) return '-';
      const currency = props?.currency || 'USD';
      return amount.toLocaleString(locale === 'zh' ? 'zh-CN' : 'en-US', {
          style: 'currency',
          currency: currency,
          minimumFractionDigits: 0,
          maximumFractionDigits: 0
      });
  }, [locale, props?.currency]);

  // Attach the helper to the t function for easier prop drilling
  (t as any).getTranslatedParams = getTranslatedParams;

  return { t: t as (typeof t & { getTranslatedParams: typeof getTranslatedParams }), locale, setLocale, formatDate, formatCurrency };
};
