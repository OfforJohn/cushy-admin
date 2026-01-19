import React from 'react';
import {
    Box,
    Grid,
    GridItem,
    Heading,
    Text,
    VStack,
    HStack,
    SimpleGrid,
    Flex,
    Icon,
    Spinner,
} from '@chakra-ui/react';
import { useQuery } from '@tanstack/react-query';
import {
    ShoppingBag,
    Users,
    Wallet,
    TrendingUp,
    Clock,
    CheckCircle,
    Truck,
    CreditCard,
    MessageCircle,
} from 'lucide-react';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    BarChart,
    Bar,
} from 'recharts';
import { adminApi } from '../../api/admin.api';
import { ordersApi } from '../../api/orders.api';
import { storesApi } from '../../api/stores.api';
import { healthApi } from '../../api/health.api';
import { KPICard } from '../../components/common/KPICard';
import { LiveQueueWidget } from '../../components/common/LiveQueueWidget';
import { formatRelativeTime } from '../../utils/formatters';
import { useNavigate } from 'react-router-dom';

export const OverviewPage: React.FC = () => {
    // Fetch dashboard stats
    const { data: statsData, isLoading: statsLoading } = useQuery({
        queryKey: ['dashboardStats'],
        queryFn: () => adminApi.getDashboardStats('7d'),
    });

    const navigate = useNavigate();

    // Fetch orders
    const { data: ordersData, isLoading: ordersLoading } = useQuery({
        queryKey: ['allOrders'],
        queryFn: () => ordersApi.getAllOrders(),
    });

    // Fetch vendor stats (for verified vendors stat card)
    const { data: vendorStatsData, isLoading: vendorStatsLoading } = useQuery({
        queryKey: ['vendorStats'],
        queryFn: () => adminApi.getVendorStats(),
    });

    // Fetch all stores/merchants for accurate count (same as MerchantsPage)
    const { data: storesData, isLoading: storesLoading } = useQuery({
        queryKey: ['allStores'],
        queryFn: () => storesApi.getStores(),
    });

    // Fetch order graph data
    const { data: orderGraphData, isLoading: graphLoading } = useQuery({
        queryKey: ['orderGraph', new Date().getFullYear()],
        queryFn: () => adminApi.getOrderGraph(new Date().getFullYear()),
    });

    // Fetch all riders count
    const { data: ridersData, isLoading: ridersLoading } = useQuery({
        queryKey: ['allRiders'],
        queryFn: () => adminApi.getAllRiders(),
    });

    // Fetch health professionals (doctors)
    const { data: doctorsData, isLoading: doctorsLoading } = useQuery({
        queryKey: ['allDoctors'],
        queryFn: () => healthApi.getAllDoctors(),
    });

    // Fetch consultation/appointment stats
    const { data: appointmentStatsData, isLoading: appointmentStatsLoading } = useQuery({
        queryKey: ['appointmentStats'],
        queryFn: () => healthApi.getAllAppointmentsStats(),
    });

    const stats = statsData?.data;
    const orders = ordersData?.data || [];
    const graphData = orderGraphData?.data || [];
    const stores = storesData?.data || [];
    const doctors = doctorsData?.data || [];
    const appointmentStats = appointmentStatsData?.data;

    // Extract riders - handle different response formats from external TrackThatRide API (same as LogisticsPage)
    const ridersRaw = ridersData?.data as any;
    const riders = Array.isArray(ridersRaw)
        ? ridersRaw
        : (ridersRaw?.drivers || ridersRaw?.data || []);

    // Calculate user breakdown:
    // - Businesses = stores/merchants count (from storesApi, same as MerchantsPage)
    // - Health Professionals = from real API
    // - Customers = total users - businesses - health professionals
    const businessCount = stores.length;
    const healthProCount = doctors.length;
    const totalUsers = stats?.usersCount || 0;
    const customerCount = Math.max(0, totalUsers - businessCount - healthProCount);

    // Consultation stats from API
    const completedConsultations = appointmentStats?.completed || 0;

    // Platform balance - the API returns just a number directly
    const platformBalance = stats?.totalBalanceResult || 0;

    // Helper function to get latest status (same as OrdersPage)
    function getLatestStatus(order: any): string {
        if (!order.orderTracking || order.orderTracking.length === 0) return 'PENDING';
        const sorted = [...order.orderTracking].sort((a: any, b: any) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        return sorted[0]?.orderStatus || sorted[0]?.status || 'PENDING';
    }

    // Calculate order stats from real data using getLatestStatus
    const totalOrders = orders.length;
    const pendingOrders = orders.filter(o => {
        const status = getLatestStatus(o).toUpperCase();
        return status === 'PENDING' || status === 'ACKNOWLEDGED' || status === 'READY_FOR_PICKUP';
    }).length;
    const completedOrders = orders.filter(o =>
        getLatestStatus(o).toUpperCase() === 'DELIVERED'
    ).length;
    // Calculate revenue properly (ensure it's a number)
    const totalRevenue = orders.reduce((sum, o) => {
        const amount = Number(o.totalAmount) || 0;
        return sum + amount;
    }, 0);

    // Create a store lookup map for quick access
    const storesMap = new Map(stores.map((s: any) => [s.id, s]));

    // Calculate category breakdown from real orders - group by store type (division)
    const categoryData = (() => {
        const divisions = {
            'Restaurants': 0,
            'Groceries': 0,
            'Pharmacy': 0,
            'Other': 0
        };

        orders.forEach(order => {
            // Try to get category from embedded store or from storesMap using storeId or store.id
            const storeId = order.storeId || order.store?.id;
            const storeFromMap = storesMap.get(storeId) as any;
            const category = (order.store?.category || storeFromMap?.category || 'other').toLowerCase();

            if (category.includes('restaurant') || category.includes('food') || category === 'local_food') {
                divisions['Restaurants'] += 1;
            } else if (category.includes('grocery') || category.includes('super_market') || category === 'supermarket') {
                divisions['Groceries'] += 1;
            } else if (category.includes('pharm') || category.includes('med') || category === 'med_tech') {
                divisions['Pharmacy'] += 1;
            } else {
                divisions['Other'] += 1;
            }
        });

        return Object.entries(divisions)
            .filter(([_, count]) => count > 0)
            .map(([category, orders]) => ({ category, orders }));
    })();

    // Helper to get store name from order
    const getStoreName = (order: any): string => {
        // Try embedded store first
        if (order.store?.name) return order.store.name;

        // Try storesMap lookup using storeId or store.id
        const storeId = order.storeId || order.store?.id;
        const storeFromMap = storesMap.get(storeId) as any;
        if (storeFromMap?.name) return storeFromMap.name;

        // Fallback to pickup address first part
        if (order.pickUpLocationAddress) {
            const addressPart = order.pickUpLocationAddress.split(',')[0]?.trim();
            if (addressPart && addressPart.length > 2) return addressPart;
        }

        // Last resort - show partial order ID
        return `Order #${order.id?.slice(-6)?.toUpperCase() || 'N/A'}`;
    };

    // Recent orders for queue - sort by date and take latest 5
    const recentOrders = [...orders]
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 5)
        .map(order => ({
            id: order.id,
            title: `Order ${order.id?.slice(-8)?.toUpperCase() || 'Unknown'}`,
            subtitle: getStoreName(order),
            status: getLatestStatus(order).toUpperCase() === 'DELIVERED' ? 'completed' as const : 'pending' as const,
            time: formatRelativeTime(order.createdAt),
        }));

    // Pending orders for queue - use getLatestStatus for accurate filtering
    const pendingOrdersList = orders
        .filter(o => {
            const status = getLatestStatus(o).toUpperCase();
            return status === 'PENDING' || status === 'ACKNOWLEDGED' || status === 'READY_FOR_PICKUP';
        })
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 5)
        .map(order => ({
            id: order.id,
            title: `Order ${order.id?.slice(-8)?.toUpperCase() || 'Unknown'}`,
            subtitle: getStoreName(order),
            status: 'pending' as const,
            time: formatRelativeTime(order.createdAt),
        }));

    return (
        <Box>
            {/* Page Header */}
            <Flex justify="space-between" align="center" mb={6}>
                <Box>
                    <Heading size="lg" color="gray.100" mb={1}>
                        Overview
                    </Heading>
                    <Text color="gray.500">
                        Welcome back! Here's what's happening today.
                    </Text>
                </Box>
                <HStack spacing={2}>
                    <Text fontSize="sm" color="gray.500">
                        Last updated:
                    </Text>
                    <Text fontSize="sm" color="gray.400" fontWeight="500">
                        Just now
                    </Text>
                </HStack>
            </Flex>

            {/* KPI Cards */}
            <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={4} mb={6}>
                <KPICard
                    title="Total Orders"
                    value={totalOrders}
                    icon={ShoppingBag}
                    iconColor="brand.accent.500"
                    subtitle="All time"
                    isLoading={ordersLoading}
                />
                <KPICard
                    title="Total Revenue"
                    value={totalRevenue}
                    isCurrency
                    icon={Wallet}
                    iconColor="green.400"
                    subtitle="From orders"
                    isLoading={ordersLoading}
                />
                <KPICard
                    title="Total Users"
                    value={totalUsers}
                    icon={Users}
                    iconColor="blue.400"
                    subtitle={
                        <Text as="span" fontSize="xs">
                            <Text as="span" color="orange.400">{businessCount}</Text> Businesses | <Text as="span" color="blue.400">{customerCount}</Text> Customers | <Text as="span" color="green.400">{healthProCount}</Text> Health Prof.
                        </Text>
                    }
                    isLoading={statsLoading || storesLoading || doctorsLoading}
                />
                <KPICard
                    title="Platform Balance"
                    value={platformBalance}
                    isCurrency
                    icon={CreditCard}
                    iconColor="purple.400"
                    subtitle="Total Cushcoin wallets"
                    isLoading={statsLoading}
                />
            </SimpleGrid>

            {/* Secondary KPIs */}
            <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={4} mb={6}>
                <KPICard
                    title="Pending Orders"
                    value={pendingOrders}
                    icon={Clock}
                    iconColor="yellow.400"
                    subtitle="Awaiting action"
                    isLoading={ordersLoading}
                />
                <KPICard
                    title="Completed Orders"
                    value={completedOrders}
                    icon={CheckCircle}
                    iconColor="green.400"
                    subtitle="Delivered"
                    isLoading={ordersLoading}
                />
                <KPICard
                    title="Completed Consultations"
                    value={completedConsultations}
                    icon={MessageCircle}
                    iconColor="teal.400"
                    subtitle="Health consultations"
                    isLoading={appointmentStatsLoading}
                />
                <KPICard
                    title="Riders"
                    value={riders.length}
                    icon={Truck}
                    iconColor="cyan.400"
                    subtitle="Delivery partners"
                    isLoading={ridersLoading}
                />
            </SimpleGrid>

            {/* Charts and Queues */}
            <Grid templateColumns={{ base: '1fr', xl: '2fr 1fr' }} gap={6}>
                {/* Charts Column */}
                <GridItem>
                    <VStack spacing={6} align="stretch">
                        {/* Orders Chart - Real Data from API */}
                        <Box
                            bg="gray.900"
                            borderRadius="xl"
                            border="1px solid"
                            borderColor="gray.800"
                            p={5}
                        >
                            <Flex justify="space-between" align="center" mb={4}>
                                <Box>
                                    <Text fontWeight="600" color="gray.100">
                                        Revenue Trend
                                    </Text>
                                    <Text fontSize="sm" color="gray.500">
                                        Monthly revenue
                                    </Text>
                                </Box>
                                <Icon as={TrendingUp} color="green.400" boxSize={5} />
                            </Flex>

                            <Box h="300px">
                                {graphLoading ? (
                                    <Flex h="100%" align="center" justify="center">
                                        <Spinner color="brand.primary.500" />
                                    </Flex>
                                ) : graphData.length > 0 ? (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={graphData}>
                                            <defs>
                                                <linearGradient id="colorOrders" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#4E1E58" stopOpacity={0.3} />
                                                    <stop offset="95%" stopColor="#4E1E58" stopOpacity={0} />
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                                            <XAxis
                                                dataKey="month"
                                                stroke="#6b7280"
                                                fontSize={12}
                                                tickLine={false}
                                            />
                                            <YAxis
                                                stroke="#6b7280"
                                                fontSize={12}
                                                tickLine={false}
                                            />
                                            <Tooltip
                                                contentStyle={{
                                                    backgroundColor: '#1f2937',
                                                    border: '1px solid #374151',
                                                    borderRadius: '8px',
                                                }}
                                                labelStyle={{ color: '#f3f4f6' }}
                                            />
                                            <Area
                                                type="monotone"
                                                dataKey="totalRevenue"
                                                stroke="#4E1E58"
                                                strokeWidth={2}
                                                fillOpacity={1}
                                                fill="url(#colorOrders)"
                                            />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <Flex h="100%" align="center" justify="center">
                                        <Text color="gray.500">No chart data available</Text>
                                    </Flex>
                                )}
                            </Box>
                        </Box>

                        {/* Category Performance - Real Data */}
                        <Box
                            bg="gray.900"
                            borderRadius="xl"
                            border="1px solid"
                            borderColor="gray.800"
                            p={5}
                        >
                            <Flex justify="space-between" align="center" mb={4}>
                                <Box>
                                    <Text fontWeight="600" color="gray.100">
                                        Orders by Category
                                    </Text>
                                    <Text fontSize="sm" color="gray.500">
                                        Business type breakdown
                                    </Text>
                                </Box>
                            </Flex>

                            <Box h="200px">
                                {ordersLoading ? (
                                    <Flex h="100%" align="center" justify="center">
                                        <Spinner color="brand.primary.500" />
                                    </Flex>
                                ) : categoryData.length > 0 ? (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={categoryData} layout="vertical">
                                            <CartesianGrid strokeDasharray="3 3" stroke="#374151" horizontal={false} />
                                            <XAxis type="number" stroke="#6b7280" fontSize={12} />
                                            <YAxis
                                                dataKey="category"
                                                type="category"
                                                stroke="#6b7280"
                                                fontSize={12}
                                                width={100}
                                            />
                                            <Tooltip
                                                contentStyle={{
                                                    backgroundColor: '#1f2937',
                                                    border: '1px solid #374151',
                                                    borderRadius: '8px',
                                                }}
                                            />
                                            <Bar
                                                dataKey="orders"
                                                fill="#4E1E58"
                                                radius={[0, 4, 4, 0]}
                                            />
                                        </BarChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <Flex h="100%" align="center" justify="center">
                                        <Text color="gray.500">No category data available</Text>
                                    </Flex>
                                )}
                            </Box>
                        </Box>
                    </VStack>
                </GridItem>

                {/* Live Queues Column - Real Data */}
                <GridItem>
                    <VStack spacing={4} align="stretch">
                        <LiveQueueWidget
                            title="Recent Orders"
                            items={recentOrders}
                            icon={ShoppingBag}
                            isLoading={ordersLoading}
                            onViewAll={() => navigate('/merchants/orders')}
                        />

                        <LiveQueueWidget
                            title="Pending Orders"
                            items={pendingOrdersList}
                            icon={Clock}
                            isLoading={ordersLoading}
                            onViewAll={() => navigate('/merchants/orders')}
                        />
                    </VStack>
                </GridItem>
            </Grid>
        </Box>
    );
};

export default OverviewPage;
