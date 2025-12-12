
import React, { useMemo, FC } from 'react';
import { CrmData } from '../types';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { useTranslation } from '../hooks/useTranslation';

interface AnalyticsPageProps {
  data: CrmData;
  t: (key: string) => string;
  isDarkMode?: boolean;
}

const ChartCard: FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div className="bg-white dark:bg-dark-card p-6 rounded-lg border border-stroke dark:border-dark-stroke">
        <h3 className="text-lg font-bold text-heading dark:text-dark-heading mb-4">{title}</h3>
        <div className="h-80">
            {children}
        </div>
    </div>
);

const AnalyticsPage: FC<Omit<AnalyticsPageProps, 't'> & ReturnType<typeof useTranslation>> = ({ data, t, isDarkMode }) => {
    const monthlyInquiryData = useMemo(() => {
        const counts: { [key: string]: number } = {};
        const monthOrder: string[] = [];
        const today = new Date();

        for (let i = 11; i >= 0; i--) {
            const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
            const monthKey = d.toLocaleString('default', { month: 'short', year: '2-digit' });
            counts[monthKey] = 0;
            monthOrder.push(monthKey);
        }

        data.clients.forEach(client => {
            const inquiryDate = new Date(client.inquiryDate);
            const monthKey = inquiryDate.toLocaleString('default', { month: 'short', year: '2-digit' });
            if (counts[monthKey] !== undefined) {
                counts[monthKey]++;
            }
        });

        return monthOrder.map(month => ({ name: month, inquiries: counts[month] }));
    }, [data.clients]);

    const conversionTrendData = useMemo(() => {
         const stats: { [key: string]: { total: number, deals: number } } = {};
        const monthOrder: string[] = [];
        const today = new Date();

        for (let i = 11; i >= 0; i--) {
            const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
            const monthKey = d.toLocaleString('default', { month: 'short', year: '2-digit' });
            stats[monthKey] = { total: 0, deals: 0 };
            monthOrder.push(monthKey);
        }

        data.clients.forEach(client => {
            const inquiryDate = new Date(client.inquiryDate);
            const monthKey = inquiryDate.toLocaleString('default', { month: 'short', year: '2-digit' });
            if (stats[monthKey] !== undefined) {
                stats[monthKey].total++;
                if (client.status === '已成交') {
                    stats[monthKey].deals++;
                }
            }
        });

        return monthOrder.map(month => ({
            name: month,
            rate: stats[month].total > 0 ? (stats[month].deals / stats[month].total) * 100 : 0
        }));
    }, [data.clients]);

    const inquiryTypeData = useMemo(() => {
        const counts = data.clients.reduce((acc, client) => {
            acc[client.inquiryType] = (acc[client.inquiryType] || 0) + 1;
            return acc;
        }, {} as { [key: string]: number });
        return Object.entries(counts).map(([name, value]) => ({ 
            name: t(
                name === '散客线路' ? 'inquiry_tour' :
                name === '单团报价' ? 'inquiry_group' :
                name === '单订项目' ? 'inquiry_single' :
                'inquiry_other'
            ), 
            value 
        }));
    }, [data.clients, t]);

     const intentionData = useMemo(() => {
        const counts = data.clients.reduce((acc, client) => {
            acc[client.intentionLevel] = (acc[client.intentionLevel] || 0) + 1;
            return acc;
        }, {} as { [key: string]: number });
        return Object.entries(counts).map(([name, value]) => ({ 
            name: t(
                name === '高' ? 'intention_high' :
                name === '中' ? 'intention_medium' :
                'intention_low'
            ), 
            value 
        }));
    }, [data.clients, t]);
    
    const COLORS = ['#5932EA', '#8c73f0', '#c8bdf5', '#e0dafa'];

    // Colors based on Dark Mode
    const axisColor = isDarkMode ? '#9CA3AF' : '#939393';
    const tooltipBg = isDarkMode ? '#1F2937' : '#FFFFFF';
    const tooltipBorder = isDarkMode ? '#374151' : '#ECEEF6';
    const tooltipText = isDarkMode ? '#F9FAFB' : '#232323';

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ChartCard title={t('monthlyInquiryChart')}>
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={monthlyInquiryData}>
                        <XAxis dataKey="name" stroke={axisColor} fontSize={12} tickLine={false} axisLine={false} />
                        <YAxis stroke={axisColor} fontSize={12} tickLine={false} axisLine={false} />
                        <Tooltip 
                            contentStyle={{ background: tooltipBg, border: `1px solid ${tooltipBorder}`, borderRadius: '8px', color: tooltipText }} 
                            itemStyle={{ color: tooltipText }}
                            cursor={{fill: isDarkMode ? 'rgba(255,255,255,0.1)' : '#f3f3f3'}}
                        />
                        <Bar dataKey="inquiries" fill="#5932EA" radius={[4, 4, 0, 0]} name={t('inquiries')} />
                    </BarChart>
                </ResponsiveContainer>
            </ChartCard>

            <ChartCard title={t('conversionTrendChart')}>
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={conversionTrendData}>
                        <XAxis dataKey="name" stroke={axisColor} fontSize={12} tickLine={false} axisLine={false} />
                        <YAxis stroke={axisColor} fontSize={12} domain={[0, 100]} tickLine={false} axisLine={false} />
                        <Tooltip 
                             contentStyle={{ background: tooltipBg, border: `1px solid ${tooltipBorder}`, borderRadius: '8px', color: tooltipText }} 
                             itemStyle={{ color: tooltipText }}
                        />
                        <Line type="monotone" dataKey="rate" stroke="#5932EA" strokeWidth={2} activeDot={{ r: 8 }} name={t('conversionRate')} />
                    </LineChart>
                </ResponsiveContainer>
            </ChartCard>

            <ChartCard title={t('inquiryTypeDistributionChart')}>
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie data={inquiryTypeData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} fill="#8884d8" label stroke={isDarkMode ? '#1F2937' : '#fff'}>
                            {inquiryTypeData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke={isDarkMode ? '#1F2937' : '#fff'} />)}
                        </Pie>
                        <Tooltip contentStyle={{ background: tooltipBg, border: `1px solid ${tooltipBorder}`, borderRadius: '8px', color: tooltipText }} itemStyle={{ color: tooltipText }} />
                        <Legend wrapperStyle={{ color: axisColor }} />
                    </PieChart>
                </ResponsiveContainer>
            </ChartCard>
            
            <ChartCard title={t('clientIntentionDistributionChart')}>
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie data={intentionData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} fill="#8884d8" label stroke={isDarkMode ? '#1F2937' : '#fff'}>
                             {intentionData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke={isDarkMode ? '#1F2937' : '#fff'} />)}
                        </Pie>
                        <Tooltip contentStyle={{ background: tooltipBg, border: `1px solid ${tooltipBorder}`, borderRadius: '8px', color: tooltipText }} itemStyle={{ color: tooltipText }} />
                        <Legend wrapperStyle={{ color: axisColor }} />
                    </PieChart>
                </ResponsiveContainer>
            </ChartCard>

        </div>
    );
};

export default AnalyticsPage;
