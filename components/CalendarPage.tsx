
import React, { useState, useMemo, FC } from 'react';
import { CrmData, Client, Order } from '../types';
import { ClientsIcon, OrdersIcon } from './icons';
import { useTranslation } from '../hooks/useTranslation';

interface CalendarPageProps {
  data: CrmData;
  onEventClick: (eventData: Client | Order) => void;
  t: (key: string) => string;
  formatDate: (date: string) => string;
  locale: 'en' | 'zh';
}

type CalendarEvent = {
    type: 'followup' | 'departure' | 'return';
    date: Date;
    title: string;
    data: Client | Order;
};

const CalendarPage: FC<Omit<CalendarPageProps, 't' | 'formatDate' | 'locale' | 'onEventClick'> & ReturnType<typeof useTranslation> & { onEventClick: (eventData: Client | Order) => void }> = ({ data, onEventClick, t, formatDate, locale }) => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());

    const events = useMemo((): CalendarEvent[] => {
        const allEvents: CalendarEvent[] = [];
        
        // Client Follow-ups
        data.clients.forEach(client => {
            if ((client.status === '待跟进' || client.status === '跟进中') && client.followUpDate) {
                allEvents.push({
                    type: 'followup',
                    date: new Date(client.followUpDate),
                    title: `${t('followUpPrefix')}: ${client.name}`,
                    data: client
                });
            }
        });

        // Order Departures and Returns
        data.orders.forEach(order => {
            if (!order.departurePending && order.departureDate) {
                 allEvents.push({
                    type: 'departure',
                    date: new Date(order.departureDate),
                    title: `${t('departurePrefix')}: ${order.clientName || 'N/A'}`,
                    data: order
                });
            }
            if (order.returnDate) {
                 allEvents.push({
                    type: 'return',
                    date: new Date(order.returnDate),
                    title: `${t('returnPrefix')}: ${order.clientName || 'N/A'}`,
                    data: order
                });
            }
        });

        return allEvents;
    }, [data, t]);

    const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
    const startDate = new Date(startOfMonth);
    startDate.setDate(startDate.getDate() - startOfMonth.getDay());
    const endDate = new Date(endOfMonth);
    endDate.setDate(endDate.getDate() + (6 - endOfMonth.getDay()));

    const calendarDays: { date: Date, events: CalendarEvent[], isCurrentMonth: boolean }[] = [];
    let day = new Date(startDate);
    while (day <= endDate) {
        const dayEvents = events.filter(e => 
            e.date.getFullYear() === day.getFullYear() &&
            e.date.getMonth() === day.getMonth() &&
            e.date.getDate() === day.getDate()
        );
        calendarDays.push({
            date: new Date(day),
            events: dayEvents,
            isCurrentMonth: day.getMonth() === currentDate.getMonth()
        });
        day.setDate(day.getDate() + 1);
    }
    
    const selectedDateEvents = useMemo(() => {
        if (!selectedDate) return [];
        return events.filter(e => 
            e.date.getFullYear() === selectedDate.getFullYear() &&
            e.date.getMonth() === selectedDate.getMonth() &&
            e.date.getDate() === selectedDate.getDate()
        );
    }, [events, selectedDate]);
    
    const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));

    const weekDays = locale === 'zh' ? ['日', '一', '二', '三', '四', '五', '六'] : ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    return (
        <div className="space-y-6">
            <div className="bg-white dark:bg-dark-card p-6 rounded-lg border border-stroke dark:border-dark-stroke">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-heading dark:text-dark-heading">
                        {currentDate.toLocaleString(locale === 'zh' ? 'zh-CN' : 'en-US', { month: 'long', year: 'numeric' })}
                    </h2>
                    <div className="flex items-center gap-2">
                        <button onClick={prevMonth} className="p-2 border border-stroke dark:border-dark-stroke rounded-lg hover:bg-gray-50 dark:hover:bg-dark-card">{t('previous')}</button>
                        <button onClick={() => setCurrentDate(new Date())} className="p-2 border border-stroke dark:border-dark-stroke rounded-lg hover:bg-gray-50 dark:hover:bg-dark-card">{t('today')}</button>
                        <button onClick={nextMonth} className="p-2 border border-stroke dark:border-dark-stroke rounded-lg hover:bg-gray-50 dark:hover:bg-dark-card">{t('next')}</button>
                    </div>
                </div>
                <div className="grid grid-cols-7 gap-px bg-stroke dark:bg-dark-stroke border border-stroke dark:border-dark-stroke">
                    {weekDays.map(day => (
                        <div key={day} className="py-2 text-center bg-gray-50 dark:bg-dark-card font-semibold text-subtext dark:text-dark-subtext">{day}</div>
                    ))}
                    {calendarDays.map(({ date, events, isCurrentMonth }, index) => (
                        <div 
                            key={index}
                            className={`p-2 bg-white dark:bg-dark-card min-h-[120px] cursor-pointer ${!isCurrentMonth ? 'text-subtext opacity-50' : 'text-heading dark:text-dark-heading'} ${selectedDate?.toDateString() === date.toDateString() ? 'ring-2 ring-primary' : ''}`}
                            onClick={() => setSelectedDate(date)}
                        >
                            <div className={`font-bold ${new Date().toDateString() === date.toDateString() ? 'text-primary' : ''}`}>{date.getDate()}</div>
                            <div className="mt-1 space-y-1">
                                {events.slice(0, 3).map((event, i) => (
                                    <div 
                                        key={i} 
                                        onClick={(e) => { e.stopPropagation(); onEventClick(event.data); }}
                                        className={`text-xs p-1 rounded truncate cursor-pointer hover:opacity-80 ${
                                            event.type === 'followup' ? 'bg-yellow-100 text-yellow-800' :
                                            event.type === 'departure' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                                        }`}
                                    >
                                        {event.title}
                                    </div>
                                ))}
                                {events.length > 3 && <div className="text-xs text-subtext">+{events.length - 3} more</div>}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
             {selectedDate && (
                <div className="bg-white dark:bg-dark-card p-6 rounded-lg border border-stroke dark:border-dark-stroke">
                    <h3 className="text-lg font-bold text-heading dark:text-dark-heading mb-4">
                        {t('eventsFor')} {formatDate(selectedDate.toISOString())}
                    </h3>
                    {selectedDateEvents.length > 0 ? (
                        <ul className="space-y-3">
                            {selectedDateEvents.map((event, i) => (
                                <li 
                                    key={i} 
                                    onClick={() => onEventClick(event.data)}
                                    className="flex items-center gap-4 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                                >
                                    {event.type === 'followup' && <ClientsIcon className="w-6 h-6 text-yellow-600 flex-shrink-0" />}
                                    {(event.type === 'departure' || event.type === 'return') && <OrdersIcon className="w-6 h-6 text-blue-600 flex-shrink-0" />}
                                    <div>
                                        <p className="font-semibold text-heading dark:text-dark-heading">{event.title}</p>
                                        <p className="text-sm text-subtext dark:text-dark-subtext">
                                            {event.type === 'followup' ? `${t('status')}: ${(event.data as Client).status}` : `${t('orderNumberHeader')}: ${(event.data as Order).orderNumber}`}
                                        </p>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-subtext dark:text-dark-subtext">{t('noEvents')}</p>
                    )}
                </div>
            )}
        </div>
    );
};

export default CalendarPage;
