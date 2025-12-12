
import { useState, useEffect, useCallback } from 'react';
import { CrmData, Client, Order, User, Notification, FollowUpRecord, Customer, FailureReason } from '../types';

// Mock data generation for a *specific* user
const getMockDataForUser = (userId: string): CrmData => {
  const today = new Date();
  const userSeed = userId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  
  // 1. Generate Mock Customers
  const customerNames = ['Justin Lipshutz', 'Marcus Culhane', 'Leo Stanton', 'Ana Krueger', 'Phillip Stanton', 'Jaydon Siphron', 'Randy Press', 'Terry Aminoff', 'Sarah Chen', 'Mike Ross', 'Harvey Specter', 'Louis Litt', 'Donna Paulsen'];
  const stores = ['Marketing', 'Finance', 'R&D', 'Sales', 'Hunan Branch', 'Shanghai Branch'];
  
  const customers: Customer[] = customerNames.map((name, i) => {
      const monthOffset = i % 4; 
      const creationDate = new Date(today.getFullYear(), today.getMonth() - monthOffset, Math.floor(Math.random() * 28) + 1);
      
      return {
          id: `${userId}_customer_${i}`,
          name: name,
          store: stores[(i + userSeed) % stores.length],
          contact: `555-010${(i + userSeed) % 100}`,
          createdAt: creationDate.toISOString(),
          notes: 'VIP Customer'
      };
  });

  // 2. Generate Inquiries (Clients)
  const clients = Array.from({ length: 95 }, (_, i) => {
    let monthOffset = 0;
    if (i < 18) monthOffset = 0;
    else if (i < 30) monthOffset = 1;
    else if (i < 45) monthOffset = 2;
    else if (i < 53) monthOffset = 3;
    else monthOffset = Math.floor((i - 53) / 10) + 4;

    const inquiryDate = new Date(today.getFullYear(), today.getMonth() - monthOffset, Math.floor(Math.random() * 28) + 1);
    const statusOptions: ('待跟进' | '跟进中' | '已成交' | '未成单' | '已失效')[] = ['待跟进', '跟进中', '已成交', '未成单', '已失效'];
    const status = statusOptions[(i + userSeed) % 5];
    let followUpDate = null;
    if (status === '待跟进' || status === '跟进中') {
        const futureDate = new Date();
        futureDate.setDate(futureDate.getDate() + Math.floor(Math.random() * 30) - 5);
        followUpDate = futureDate.toISOString().split('T')[0];
    }

    const customer = customers[i % customers.length];

    return {
      id: `${userId}_client_${i + 1}`,
      customerId: customer.id,
      name: customer.name,
      store: customer.store,
      contact: customer.contact,
      inquiryType: (['散客线路', '单团报价', '单订项目', '其他'] as const)[(i + userSeed) % 4],
      intentionLevel: (['高', '中', '低'] as const)[(i + userSeed) % 3],
      inquiryDate: inquiryDate.toISOString().split('T')[0],
      inquiryDetails: `Inquiry ${i + 1} regarding a custom package. Budget is flexible.`,
      status,
      notes: 'Follow up needed.',
      followUpDate,
      createdAt: inquiryDate.toISOString(),
      followUpCount: Math.floor(Math.random() * 5),
    };
  });
  
  const followUpHistory: FollowUpRecord[] = clients.flatMap(client => {
    if (client.followUpCount === 0) return [];
    const records: FollowUpRecord[] = [];
    for (let j = 0; j < client.followUpCount; j++) {
        const recordDate = new Date(client.inquiryDate);
        recordDate.setDate(recordDate.getDate() + (j * 7) + 2);
        let currentStatus: Client['status'] = '跟进中';
        if (j === client.followUpCount - 1) {
             currentStatus = client.status;
        }
        records.push({
            id: `fu_${client.id}_${j}`,
            clientId: client.id,
            date: recordDate.toISOString(),
            status: currentStatus,
            nextFollowUpDate: j < client.followUpCount - 1 ? new Date(recordDate.getTime() + 7 * 24*60*60*1000).toISOString().split('T')[0] : null,
            notes: `Follow up record ${j+1}. Discussed details.`,
        });
    }
    return records;
  });

  const orders: Order[] = clients.filter(c => c.status === '已成交').map((client, i) => {
    const departureDate = new Date(client.inquiryDate);
    departureDate.setDate(departureDate.getDate() + 10);
    const returnDate = new Date(departureDate);
    returnDate.setDate(returnDate.getDate() + 7);
    const orderStatusOptions: Order['orderStatus'][] = ['待出行', '行程中', '已完成', '已清账', '已取消'];
    return {
      id: `${userId}_order_${i+1}`,
      orderNumber: `ORD${new Date().getFullYear()}${String(i+1 + userSeed).padStart(4, '0')}`,
      clientId: client.id,
      clientName: client.name,
      orderType: (['单团定制', '散客出行', '单订项目'] as const)[(i + userSeed) % 3],
      routeName: 'Europe Classic 7 Days',
      participantCount: i % 5 + 2,
      adultCount: i % 5 + 1,
      childCount: 1,
      departureDate: departureDate.toISOString().split('T')[0],
      returnDate: returnDate.toISOString().split('T')[0],
      departurePending: (i + userSeed) % 10 === 0,
      orderStatus: orderStatusOptions[(i + userSeed) % 5],
      customerSource: (['同行', '直客'] as const)[(i + userSeed) % 2],
      storeSettlement: (i + 1) * 1000 + 5000,
      groundSettlement: (i + 1) * 800 + 4000,
      createdAt: client.createdAt,
      updatedAt: client.createdAt,
      guides: [{ name: 'John Doe', phone: '123-456-7890', prefix: 'Main' }],
      guests: [{ name: client.name, phone: client.contact, role: '游客代表' }],
      departureLocation: 'Beijing',
      returnLocation: 'Beijing',
      outboundTransportType: 'Plane',
      outboundTransportDetails: 'CA123 08:00',
      returnTransportType: 'Plane',
      returnTransportDetails: 'CA456 18:00',
      transportCost: 1500,
      notes: 'Window seat requested.',
      cancellationReason: i % 5 === 4 ? 'Customer cancelled' : undefined,
      confirmationSent: (i + userSeed) % 2 === 0,
      groupNoticeSent: (i + userSeed) % 3 === 0,
      rebateAmount: 50,
      groundContact: 'Operator Contact',
      groundOperator: 'Local Tours Inc.',
      insurancePurchased: (i + userSeed) % 2 === 0,
      contractSigned: (i + userSeed) % 2 === 0,
      paymentMethod: 'Bank Transfer'
    };
  });

  const allUsers: User[] = JSON.parse(localStorage.getItem('users') || '[]');
  const currentUser = allUsers.find(u => u.id === userId) || {
    id: userId, 
    name: 'Gavano', 
    role: 'Senior Agent', 
    avatarUrl: 'https://i.pravatar.cc/56?u=gavano',
    email: 'gavano@circlesoft.com', 
    about: 'Experienced travel consultant specializing in European and Asian markets. Dedicated to providing personalized travel experiences.', 
    phone: '(555) 123-4567', 
    department: 'Sales Department A',
    joinDate: '2021-03-15',
    employeeId: 'CS-8821',
    location: 'Shanghai, China'
  };
  
  const notifications: Notification[] = [
    { id: `${userId}_notif_1`, messageKey: 'notif_new_client', messageParams: { name: 'Randy Press' }, date: new Date().toISOString(), read: false, targetType: 'client', targetId: clients.find(c => c.name === 'Randy Press')?.id, isPinned: true, isStarred: true },
    { id: `${userId}_notif_2`, messageKey: 'notif_order_updated', messageParams: { orderNumber: `ORD2024${String(12 + userSeed).padStart(4, '0')}`, status: 'status_completed_trip' }, date: new Date(Date.now() - 3600000).toISOString(), read: false, targetType: 'order', targetId: `${userId}_order_12`, isPinned: false, isStarred: false },
    { id: `${userId}_notif_3`, messageKey: 'notif_follow_up_due', messageParams: { count: 3 }, date: new Date(Date.now() - 7200000).toISOString(), read: true, isPinned: false, isStarred: true },
  ];

  return { customers, clients, followUpHistory, failureReasons: {}, orders, user: currentUser, notifications };
};

export const useCrmData = (userId: string | null) => {
  const [data, setData] = useState<CrmData>({ customers: [], clients: [], followUpHistory: [], failureReasons: {}, orders: [], user: {} as User, notifications: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Helper to commit state to localStorage
  const persistData = (newData: CrmData) => {
    if (!userId) return;
    const allData = JSON.parse(localStorage.getItem('crmData') || '{}');
    allData[userId] = newData;
    localStorage.setItem('crmData', JSON.stringify(allData));
    setData(newData);
  };

  const loadAllData = useCallback((currentUserId: string) => {
    const allData = JSON.parse(localStorage.getItem('crmData') || '{}');
    if (allData[currentUserId]) {
        if (!allData[currentUserId].customers) {
            const newData = getMockDataForUser(currentUserId);
            allData[currentUserId].customers = newData.customers;
        }
        setData(allData[currentUserId]);
    } else {
        const newUserData = getMockDataForUser(currentUserId);
        allData[currentUserId] = newUserData;
        localStorage.setItem('crmData', JSON.stringify(allData));
        setData(newUserData);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (!userId) {
        setLoading(false);
        return;
    };
    loadAllData(userId);
  }, [userId, loadAllData]);
  
  // --- Actions (CRUD) ---

  const actions = {
    // Customers
    addCustomer: (customer: Customer) => {
        const newCustomers = [customer, ...data.customers];
        persistData({ ...data, customers: newCustomers });
    },
    updateCustomer: (customer: Customer) => {
        const newCustomers = data.customers.map(c => c.id === customer.id ? customer : c);
        // Also update linked clients if needed
        const newClients = data.clients.map(c => {
            if (c.customerId === customer.id) {
                return { ...c, name: customer.name, store: customer.store, contact: customer.contact };
            }
            return c;
        });
        persistData({ ...data, customers: newCustomers, clients: newClients });
    },
    deleteCustomer: (customerId: string) => {
        const newCustomers = data.customers.filter(c => c.id !== customerId);
        persistData({ ...data, customers: newCustomers });
    },

    // Clients (Inquiries)
    addClient: (client: Client) => {
        const newClients = [client, ...data.clients];
        persistData({ ...data, clients: newClients });
    },
    updateClient: (client: Client) => {
        const newClients = data.clients.map(c => c.id === client.id ? client : c);
        persistData({ ...data, clients: newClients });
    },
    deleteClient: (clientId: string) => {
        const newClients = data.clients.filter(c => c.id !== clientId);
        const newFollowUps = data.followUpHistory.filter(f => f.clientId !== clientId);
        const newOrders = data.orders.filter(o => o.clientId !== clientId);
        persistData({ ...data, clients: newClients, followUpHistory: newFollowUps, orders: newOrders });
    },

    // Orders
    addOrder: (order: Order) => {
        const newOrders = [order, ...data.orders];
        // If status is "completed" or "signed", update client status potentially? keeping simple for now
        persistData({ ...data, orders: newOrders });
    },
    updateOrder: (order: Order) => {
        const newOrders = data.orders.map(o => o.id === order.id ? order : o);
        persistData({ ...data, orders: newOrders });
    },
    deleteOrder: (orderId: string) => {
        const newOrders = data.orders.filter(o => o.id !== orderId);
        persistData({ ...data, orders: newOrders });
    },

    // Follow Ups
    addFollowUp: (record: FollowUpRecord, failureDetails?: { reason: string, detail: string }) => {
        const newHistory = [record, ...data.followUpHistory];
        
        // Update Client Status based on follow up
        let newClients = [...data.clients];
        const clientIndex = newClients.findIndex(c => c.id === record.clientId);
        if (clientIndex > -1) {
            const updatedClient = { 
                ...newClients[clientIndex], 
                status: record.status, 
                followUpDate: record.nextFollowUpDate,
                followUpCount: (newClients[clientIndex].followUpCount || 0) + 1
            };
            newClients[clientIndex] = updatedClient;
        }

        let newFailureReasons = { ...data.failureReasons };
        if (record.status === '未成单' && failureDetails) {
             newFailureReasons[record.clientId] = {
                 reason: failureDetails.reason,
                 detail: failureDetails.detail,
                 date: new Date().toISOString()
             };
        }

        persistData({ ...data, followUpHistory: newHistory, clients: newClients, failureReasons: newFailureReasons });
    },
    deleteFollowUp: (recordId: string) => {
        const newHistory = data.followUpHistory.filter(r => r.id !== recordId);
        // Optionally revert client status? Complicated, skipping for V1
        persistData({ ...data, followUpHistory: newHistory });
    },
    
    // Notifications
    updateNotifications: (newNotifications: Notification[]) => {
         persistData({ ...data, notifications: newNotifications });
    }
  };

  const reloadData = useCallback(() => {
    if (userId) loadAllData(userId);
  }, [userId, loadAllData]);

  return { data, loading, error, reloadData, actions };
};
