
import React, { useMemo, useState } from 'react';
import { CrmData, Client } from '../types';
import { ArrowUpIcon, ArrowDownIcon } from './icons';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Sector } from 'recharts';
import { useTranslation, Locale } from '../hooks/useTranslation';

interface DashboardProps {
  data: CrmData;
  t: (key: string) => string;
  locale: Locale;
  isDarkMode?: boolean;
}

// --- Reusable Stat Card Component ---
interface StatCardProps {
  title: string;
  value: string;
  subtitle: string;
  trend: 'up' | 'down';
  trendValue: string;
  trendColor: 'green' | 'red' | 'blue';
  comparisonDetails?: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, subtitle, trend, trendValue, trendColor, comparisonDetails }) => {
    const trendClasses = {
        green: 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300',
        red: 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300',
        blue: 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300',
    };
    const Icon = trend === 'up' ? ArrowUpIcon : ArrowDownIcon;

    return (
        <div className="bg-white dark:bg-dark-card p-6 rounded-lg border border-stroke dark:border-dark-stroke flex flex-col justify-between">
            <div className="flex justify-between items-start">
                <h3 className="text-lg font-bold text-heading dark:text-dark-heading">{title}</h3>
                <div className="relative group">
                    <div className={`flex items-center gap-1 text-sm font-medium px-2 py-1 rounded-full cursor-help ${trendClasses[trendColor]}`}>
                        <Icon className="w-4 h-4" />
                        <span>{trendValue}</span>
                    </div>
                    {/* Tooltip for Comparison Details */}
                    {comparisonDetails && (
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900/95 backdrop-blur-sm text-white text-xs rounded-lg shadow-lg whitespace-nowrap z-50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none transform scale-95 group-hover:scale-100 origin-bottom">
                            {comparisonDetails}
                            <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900/95"></div>
                        </div>
                    )}
                </div>
            </div>
            <p className="text-4xl font-bold text-heading dark:text-dark-heading mt-2">{value}</p>
            <p className="text-subtext dark:text-dark-subtext mt-1">{subtitle}</p>
        </div>
    );
};

// --- Statistics Bar Chart ---
const JobStatisticsChart: React.FC<{ clients: Client[]; t: (key: string) => string; locale: Locale; isDarkMode?: boolean }> = ({ clients, t, locale, isDarkMode }) => {
    const chartData = useMemo(() => {
        const data: { [key: string]: { month: string; inquiries: number; deals: number } } = {};
        const today = new Date();
        const monthOrder: string[] = [];
        const localeString = locale === 'zh' ? 'zh-CN' : 'en-US';
        
        for (let i = 11; i >= 0; i--) {
            const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
            const monthName = date.toLocaleString(localeString, { month: 'short' });
            monthOrder.push(monthName);
            data[monthName] = { month: monthName, inquiries: 0, deals: 0 };
        }

        clients.forEach(client => {
            const inquiryDate = new Date(client.inquiryDate);
             if (inquiryDate >= new Date(today.getFullYear() - 1, today.getMonth(), 1)) {
              const monthName = inquiryDate.toLocaleString(localeString, { month: 'short' });
              if (data[monthName]) {
                  data[monthName].inquiries += 1;
                  if (client.status === '已成交') {
                      data[monthName].deals += 1;
                  }
              }
            }
        });
        
        return monthOrder.map(monthName => data[monthName]);
    }, [clients, locale]);

    const axisColor = isDarkMode ? '#9CA3AF' : '#939393';
    const tooltipBg = isDarkMode ? '#1F2937' : '#FFFFFF';
    const tooltipBorder = isDarkMode ? '#374151' : '#ECEEF6';
    const tooltipText = isDarkMode ? '#F9FAFB' : '#232323';
    
    return (
        <div className="bg-white dark:bg-dark-card p-6 rounded-lg border border-stroke dark:border-dark-stroke h-[362px] flex flex-col">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-heading dark:text-dark-heading">{t('inquiryStatistics')}</h2>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded-sm" style={{ backgroundColor: '#c8bdf5' }}></div>
                        <span className="text-sm font-bold text-heading dark:text-dark-heading">{t('inquiries')}</span>
                    </div>
                     <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded-sm bg-primary"></div>
                        <span className="text-sm font-bold text-heading dark:text-dark-heading">{t('deals')}</span>
                    </div>
                </div>
            </div>
            <div className="flex-grow">
                <ResponsiveContainer width="100%" height="100%" key={`${locale}-${isDarkMode}`}>
                    <BarChart data={chartData} margin={{ top: 5, right: 20, left: -20, bottom: 5 }} barGap={10} barSize={25}>
                        <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: axisColor }} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fill: axisColor }} allowDecimals={false}/>
                        <Tooltip 
                            cursor={{ fill: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(248, 250, 251, 0.7)' }} 
                            contentStyle={{ background: tooltipBg, border: `1px solid ${tooltipBorder}`, borderRadius: '8px', color: tooltipText }}
                            itemStyle={{ color: tooltipText }}
                        />
                        <Bar dataKey="inquiries" name={t('inquiries')} fill="#c8bdf5" radius={[8, 8, 0, 0]} />
                        <Bar dataKey="deals" name={t('deals')} fill="#5932EA" radius={[8, 8, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

// --- Recent Clients Table ---
const EmployeeStatusTable: React.FC<{ clients: Client[]; t: (key: string) => string; }> = ({ clients, t }) => {
    const recentClients = useMemo(() => {
        return [...clients]
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
            .slice(0, 3);
    }, [clients]);

    const statusClasses = {
        '已成交': 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300',
        '跟进中': 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300',
        '待跟进': 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/50 dark:text-yellow-300',
        '未成单': 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300',
        '已失效': 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-400'
    };
    
    return (
        <div className="lg:col-span-2 bg-white dark:bg-dark-card p-6 rounded-lg border border-stroke dark:border-dark-stroke">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-heading dark:text-dark-heading">{t('recentClients')}</h2>
            </div>
            <table className="w-full text-left">
                <thead>
                    <tr className="border-b border-stroke dark:border-dark-stroke">
                        <th className="py-3 text-subtext dark:text-dark-subtext font-normal">{t('clientName')}</th>
                        <th className="py-3 text-subtext dark:text-dark-subtext font-normal">{t('branch')}</th>
                        <th className="py-3 text-subtext dark:text-dark-subtext font-normal">{t('intention')}</th>
                        <th className="py-3 text-subtext dark:text-dark-subtext font-normal">{t('status')}</th>
                    </tr>
                </thead>
                <tbody>
                    {recentClients.map(client => (
                        <tr key={client.id} className="border-b border-stroke dark:border-dark-stroke last:border-b-0">
                            <td className="py-4 font-bold text-heading dark:text-dark-heading">{client.name}</td>
                            <td className="py-4 font-bold text-heading dark:text-dark-heading">{client.store}</td>
                            <td className="py-4 font-bold text-heading dark:text-dark-heading">{t(client.intentionLevel === '高' ? 'intention_high' : client.intentionLevel === '中' ? 'intention_medium' : 'intention_low')}</td>
                            <td className="py-4">
                                <span className={`px-3 py-1 text-sm font-bold rounded-md ${statusClasses[client.status] || 'bg-gray-100 text-gray-700'}`}>
                                    {t(client.status === '待跟进' ? 'status_pending' : client.status === '跟进中' ? 'status_in_progress' : client.status === '已成交' ? 'status_completed' : client.status === '未成单' ? 'status_failed' : 'status_expired')}
                                </span>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};


const renderActiveShape = (props: any) => {
  const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill, payload, percent } = props;
  // Use 'percent' prop provided by Recharts for the active shape calculation
  const percentage = (percent * 100).toFixed(0);

  return (
    <g>
      <text x={cx} y={cy-10} dy={8} textAnchor="middle" fill={fill} className="text-5xl font-bold">
        {`${percentage}%`}
      </text>
       <text x={cx} y={cy + 20} textAnchor="middle" fill="#939393" className="text-lg">
        {payload.name}
      </text>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
      />
      <Sector
        cx={cx}
        cy={cy}
        startAngle={startAngle}
        endAngle={endAngle}
        innerRadius={outerRadius + 6}
        outerRadius={outerRadius + 10}
        fill={fill}
      />
    </g>
  );
};

// --- Composition Pie Chart ---
const CompositionPieChart: React.FC<{ clients: Client[]; t: (key: string) => string; }> = ({ clients, t }) => {
    const [activeIndex, setActiveIndex] = useState(0);

    const onPieEnter = (_: any, index: number) => {
        setActiveIndex(index);
    };

    const data = useMemo(() => {
        const intentionCounts = { '高': 0, '中': 0, '低': 0 };
        clients.forEach(c => {
            if (intentionCounts[c.intentionLevel] !== undefined) {
                intentionCounts[c.intentionLevel]++;
            }
        });
        return [
            { name: t('intention_high'), value: intentionCounts['高'] },
            { name: t('intention_medium'), value: intentionCounts['中'] },
            { name: t('intention_low'), value: intentionCounts['低'] },
        ];
    }, [clients, t]);

    const COLORS = ['#5932EA', '#8c73f0', '#c8bdf5'];
    const totalClients = clients.length;
    
    return (
        <div className="bg-white dark:bg-dark-card p-6 rounded-lg border border-stroke dark:border-dark-stroke flex flex-col items-center justify-center relative h-[295px]">
            <h2 className="text-xl font-bold text-heading dark:text-dark-heading absolute top-6 left-6">{t('clientIntention')}</h2>
            <div className="w-full h-full">
                <ResponsiveContainer width="100%" height="100%">
                     <PieChart>
                        <Pie
                            data={data}
                            cx="50%"
                            cy="50%"
                            innerRadius={70}
                            outerRadius={90}
                            fill="#8884d8"
                            dataKey="value"
                            onMouseEnter={onPieEnter}
                            // @ts-ignore
                            activeIndex={activeIndex}
                            activeShape={renderActiveShape}
                            labelLine={false}
                        >
                             {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                    </PieChart>
                </ResponsiveContainer>
            </div>
             <div className="absolute bottom-6 text-center">
                <p className="text-subtext dark:text-dark-subtext text-lg">{totalClients} {t('clientsTotal')}</p>
            </div>
        </div>
    );
};


// --- Main Dashboard Component ---
const Dashboard: React.FC<DashboardProps> = ({ data, t, locale, isDarkMode }) => {
  const { clients, orders, customers } = data;

  const stats = useMemo(() => {
    const now = new Date();
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const currentMonthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    
    const prevMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const prevMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

    const isBetween = (dateStr: string, start: Date, end: Date) => {
        const d = new Date(dateStr);
        return d >= start && d <= end;
    };

    const calculateTrend = (curr: number, prev: number) => {
        if (prev === 0) {
            // Avoid division by zero, treat as 100% if curr > 0, else 0%
            const value = curr === 0 ? '0.0' : '100.0';
            return { value, trend: 'up' as const };
        }
        const diff = curr - prev;
        const percent = (diff / prev) * 100;
        return {
            value: Math.abs(percent).toFixed(1),
            trend: percent >= 0 ? 'up' as const : 'down' as const
        };
    };

    // 1. New Customers This Month (Using customers array)
    const newCustomersCurrent = customers.filter(c => isBetween(c.createdAt, currentMonthStart, currentMonthEnd)).length;
    const newCustomersPrev = customers.filter(c => isBetween(c.createdAt, prevMonthStart, prevMonthEnd)).length;
    const newCustomersTrend = calculateTrend(newCustomersCurrent, newCustomersPrev);

    // 2. Monthly Inquiries (Using clients array)
    const inquiriesCurrent = clients.filter(c => isBetween(c.inquiryDate, currentMonthStart, currentMonthEnd)).length;
    const inquiriesPrev = clients.filter(c => isBetween(c.inquiryDate, prevMonthStart, prevMonthEnd)).length;
    const inquiriesTrend = calculateTrend(inquiriesCurrent, inquiriesPrev);

    // 3. Deals This Month (Calculated based on Order creation date)
    const dealsCurrent = orders.filter(o => isBetween(o.createdAt, currentMonthStart, currentMonthEnd)).length;
    const dealsPrev = orders.filter(o => isBetween(o.createdAt, prevMonthStart, prevMonthEnd)).length;
    const dealsTrend = calculateTrend(dealsCurrent, dealsPrev);

    // 4. Conversion Rate (Deals This Month / Inquiries This Month)
    const conversionRateCurrent = inquiriesCurrent > 0 ? (dealsCurrent / inquiriesCurrent) * 100 : 0;
    const conversionRatePrev = inquiriesPrev > 0 ? (dealsPrev / inquiriesPrev) * 100 : 0;
    const conversionRateTrend = calculateTrend(conversionRateCurrent, conversionRatePrev);

    return {
      newCustomers: { 
          value: newCustomersCurrent, 
          trend: newCustomersTrend, 
          details: `${t('thisMonth')}: ${newCustomersCurrent} | ${t('lastMonth')}: ${newCustomersPrev}` 
      },
      monthlyInquiries: { 
          value: inquiriesCurrent, 
          trend: inquiriesTrend,
          details: `${t('thisMonth')}: ${inquiriesCurrent} | ${t('lastMonth')}: ${inquiriesPrev}`
      },
      dealsThisMonth: { 
          value: dealsCurrent, 
          trend: dealsTrend,
          details: `${t('thisMonth')}: ${dealsCurrent} | ${t('lastMonth')}: ${dealsPrev}`
      },
      conversionRate: { 
          value: conversionRateCurrent.toFixed(1), 
          trend: conversionRateTrend,
          details: `${t('thisMonth')}: ${conversionRateCurrent.toFixed(1)}% | ${t('lastMonth')}: ${conversionRatePrev.toFixed(1)}%`
      }
    };
  }, [clients, orders, customers, t]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <StatCard 
            title={t('newClientsThisMonth')} 
            value={stats.newCustomers.value.toString()}
            subtitle={t('compareLastMonth')}
            trend={stats.newCustomers.trend.trend}
            trendValue={`${stats.newCustomers.trend.value}%`}
            trendColor={stats.newCustomers.trend.trend === 'up' ? 'green' : 'red'}
            comparisonDetails={stats.newCustomers.details}
        />
        <StatCard 
            title={t('monthlyInquiries')} 
            value={stats.monthlyInquiries.value.toString()}
            subtitle={t('compareLastMonth')}
            trend={stats.monthlyInquiries.trend.trend}
            trendValue={`${stats.monthlyInquiries.trend.value}%`}
            trendColor={stats.monthlyInquiries.trend.trend === 'up' ? 'green' : 'red'}
            comparisonDetails={stats.monthlyInquiries.details}
        />
        <StatCard 
            title={t('dealsThisMonth')} 
            value={stats.dealsThisMonth.value.toString()}
            subtitle={t('compareLastMonth')}
            trend={stats.dealsThisMonth.trend.trend}
            trendValue={`${stats.dealsThisMonth.trend.value}%`}
            trendColor={stats.dealsThisMonth.trend.trend === 'up' ? 'green' : 'red'}
            comparisonDetails={stats.dealsThisMonth.details}
        />
        <StatCard 
            title={t('conversionRate')}
            value={`${stats.conversionRate.value}%`}
            subtitle={t('compareLastMonth')}
            trend={stats.conversionRate.trend.trend}
            trendValue={`${stats.conversionRate.trend.value}%`}
            trendColor={stats.conversionRate.trend.trend === 'up' ? 'green' : 'red'}
            comparisonDetails={stats.conversionRate.details}
        />
      </div>

      <JobStatisticsChart clients={clients} t={t} locale={locale} isDarkMode={isDarkMode} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <EmployeeStatusTable clients={clients} t={t} />
        <CompositionPieChart clients={clients} t={t} />
      </div>
    </div>
  );
};

export default Dashboard;
