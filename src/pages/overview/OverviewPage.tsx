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
    Store,
    Wallet,
    TrendingUp,
    Clock,
    CheckCircle,
    Truck,
    CreditCard,
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
import { KPICard } from '../../components/common/KPICard';
import { LiveQueueWidget } from '../../components/common/LiveQueueWidget';
import { formatRelativeTime } from '../../utils/formatters';

export const OverviewPage: React.FC = () => {
    // Fetch dashboard stats
    const { data: statsData, isLoading: statsLoading } = useQuery({
        queryKey: ['dashboardStats'],
        queryFn: () => adminApi.getDashboardStats('7d'),
    });

    // Fetch orders
    const { data: ordersData, isLoading: ordersLoading } = useQuery({
        queryKey: ['allOrders'],
        queryFn: () => ordersApi.getAllOrders(),
    });

    // Fetch vendor stats
    const { data: vendorStatsData, isLoading: vendorStatsLoading } = useQuery({
        queryKey: ['vendorStats'],
        queryFn: () => adminApi.getVendorStats(),
    });

    // Fetch order graph data
    const { data: orderGraphData, isLoading: graphLoading } = useQuery({
        queryKey: ['orderGraph', new Date().getFullYear()],
        queryFn: () => adminApi.getOrderGraph(new Date().getFullYear()),
    });

    const stats = statsData?.data;
    const orders = ordersData?.data || [];
    const graphData = orderGraphData?.data || [];

    // Calculate order stats from real data
    const totalOrders = orders.length;
    const pendingOrders = orders.filter(o =>
        o.orderTracking?.some(t => String(t.status).toUpperCase() === 'PENDING')
    ).length;
    const completedOrders = orders.filter(o =>
        o.orderTracking?.some(t => String(t.status).toUpperCase() === 'DELIVERED')
    ).length;
    const totalRevenue = orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);

    // Calculate category breakdown from real orders
    const categoryData = orders.reduce((acc, order) => {
        const category = order.store?.category || 'other';
        const existing = acc.find(c => c.category === category);
        if (existing) {
            existing.orders += 1;
        } else {
            acc.push({ category: category.replace('_', ' '), orders: 1 });
        }
        return acc;
    }, [] as { category: string; orders: number }[]);

    // Recent orders for queue
    const recentOrders = orders.slice(0, 5).map(order => ({
        id: order.id,
        title: `Order ${order.id?.slice(-8) || 'Unknown'}`,
        subtitle: order.store?.name || 'Unknown Store',
        status: String(order.orderTracking?.[0]?.status).toUpperCase() === 'PENDING' ? 'pending' as const : 'completed' as const,
        time: formatRelativeTime(order.createdAt),
    }));

    // Pending orders for queue
    const pendingOrdersList = orders
        .filter(o => o.orderTracking?.some(t => {
            const status = String(t.status).toUpperCase();
            return status === 'PENDING' || status === 'ACKNOWLEDGED';
        }))
        .slice(0, 5)
        .map(order => ({
            id: order.id,
            title: `Order ${order.id?.slice(-8) || 'Unknown'}`,
            subtitle: order.store?.name || 'Unknown Store',
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
                    value={stats?.usersCount || 0}
                    icon={Users}
                    iconColor="blue.400"
                    subtitle="Registered users"
                    isLoading={statsLoading}
                />
                <KPICard
                    title="Platform Balance"
                    value={stats?.totalBalanceResult?.totalBalance || 0}
                    isCurrency
                    icon={CreditCard}
                    iconColor="purple.400"
                    subtitle="Total wallet balance"
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
                    title="Active Vendors"
                    value={vendorStatsData?.data?.totalVendors || 0}
                    icon={Store}
                    iconColor="brand.primary.500"
                    subtitle="Verified vendors"
                    isLoading={vendorStatsLoading}
                />
                <KPICard
                    title="Active Riders"
                    value={(stats as any)?.ridersCount || 0}
                    icon={Truck}
                    iconColor="cyan.400"
                    subtitle="Delivery partners"
                    isLoading={statsLoading}
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
                                        Orders Trend
                                    </Text>
                                    <Text fontSize="sm" color="gray.500">
                                        Monthly order volume
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
                                                dataKey="count"
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
                        />

                        <LiveQueueWidget
                            title="Pending Orders"
                            items={pendingOrdersList}
                            icon={Clock}
                            isLoading={ordersLoading}
                        />
                    </VStack>
                </GridItem>
            </Grid>
        </Box>
    );
};

export default OverviewPage;
