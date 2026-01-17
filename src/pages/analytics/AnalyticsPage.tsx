import React, { useState } from 'react';
import {
    Box,
    Flex,
    Heading,
    Text,
    Button,
    HStack,
    VStack,
    Select,
    Icon,
    Badge,
    SimpleGrid,
    Card,
    CardBody,
    Table,
    Thead,
    Tbody,
    Tr,
    Th,
    Td,
    Progress,
    Avatar,
    Spinner,
    Tabs,
    TabList,
    Tab,
    useToast,
} from '@chakra-ui/react';
import { useQuery } from '@tanstack/react-query';
import {
    TrendingUp,
    TrendingDown,
    Download,
    DollarSign,
    ShoppingCart,
    Clock,
    Percent,
    Store,
    Truck,
    Heart,
    Package,
    Users,
    ArrowUpRight,
    ArrowDownRight,
    Star,
} from 'lucide-react';
import { adminApi } from '../../api/admin.api';
import { healthApi } from '../../api/health.api';
import { formatCurrency } from '../../utils/formatters';
import { useLocationFilter } from '../../context/LocationContext';

// Types
interface KPICard {
    label: string;
    value: string | number;
    change: number;
    changeLabel: string;
    icon: React.ElementType;
    color: string;
}

interface VendorPerformance {
    id: string;
    name: string;
    category: string;
    logo?: string;
    orders: number;
    revenue: number;
    rating: number;
    avgTime: string;
}

interface RiderPerformance {
    id: string;
    name: string;
    zone: string;
    deliveries: number;
    successRate: number;
    avgTime: string;
    rating: number;
    status: 'Online' | 'Offline' | 'Busy';
}

// Mock data for charts (to be replaced with real API data)
const mockGMVData = [
    { label: 'Jan', value: 85000000 },
    { label: 'Feb', value: 92000000 },
    { label: 'Mar', value: 88000000 },
    { label: 'Apr', value: 105000000 },
    { label: 'May', value: 115000000 },
    { label: 'Jun', value: 128000000 },
];

const mockOrdersByCategory = [
    { label: 'Restaurant', value: 45, color: 'purple.500' },
    { label: 'Grocery', value: 25, color: 'green.500' },
    { label: 'Pharmacy', value: 18, color: 'blue.500' },
    { label: 'Health', value: 12, color: 'orange.500' },
];

const mockDeliveryByDay = [
    { day: 'Mon', onTime: 85, delayed: 15 },
    { day: 'Tue', onTime: 90, delayed: 10 },
    { day: 'Wed', onTime: 78, delayed: 22 },
    { day: 'Thu', onTime: 92, delayed: 8 },
    { day: 'Fri', onTime: 88, delayed: 12 },
    { day: 'Sat', onTime: 75, delayed: 25 },
    { day: 'Sun', onTime: 82, delayed: 18 },
];

const mockHealthFunnel = [
    { stage: 'Viewed', count: 1200, percentage: 100 },
    { stage: 'Booked', count: 580, percentage: 48 },
    { stage: 'Completed', count: 420, percentage: 35 },
    { stage: 'No Treated', count: 160, percentage: 13 },
    { stage: 'Purchased Rx', count: 280, percentage: 23 },
];

// Helper function to compute health funnel from real data
const computeHealthFunnel = (stats: any) => {
    if (!stats) return mockHealthFunnel;
    const total = stats.total || 1;
    return [
        { stage: 'Total Booked', count: stats.total || 0, percentage: 100 },
        { stage: 'Scheduled', count: stats.scheduled || 0, percentage: Math.round(((stats.scheduled || 0) / total) * 100) },
        { stage: 'Ongoing', count: stats.ongoing || 0, percentage: Math.round(((stats.ongoing || 0) / total) * 100) },
        { stage: 'Completed', count: stats.completed || 0, percentage: Math.round(((stats.completed || 0) / total) * 100) },
        { stage: 'Cancelled', count: stats.cancelled || 0, percentage: Math.round(((stats.cancelled || 0) / total) * 100) },
    ];
};

const mockWalletFlow = [
    { week: 'Week 1', inflow: 45000000, outflow: 38000000 },
    { week: 'Week 2', inflow: 52000000, outflow: 42000000 },
    { week: 'Week 3', inflow: 48000000, outflow: 44000000 },
    { week: 'Week 4', inflow: 58000000, outflow: 46000000 },
];

const mockTopVendors: VendorPerformance[] = [
    { id: '1', name: 'Tasty Bites', category: 'Restaurant', orders: 342, revenue: 2400000, rating: 4.8, avgTime: '22 mins' },
    { id: '2', name: 'Fresh Grocery', category: 'Grocery', orders: 287, revenue: 1800000, rating: 4.6, avgTime: '35 mins' },
    { id: '3', name: 'HealthCare Plus', category: 'Pharmacy', orders: 198, revenue: 1200000, rating: 4.9, avgTime: '18 mins' },
];

const mockRiderPerformance: RiderPerformance[] = [
    { id: '1', name: 'James Okafar', zone: 'Lagos Zone A', deliveries: 247, successRate: 96.5, avgTime: '26 min', rating: 4.8, status: 'Online' },
    { id: '2', name: 'Ahmed Hassan', zone: 'Abuja Zone B', deliveries: 198, successRate: 94.8, avgTime: '27 min', rating: 4.7, status: 'Busy' },
    { id: '3', name: 'Peter Adelayo', zone: 'Lagos Zone C', deliveries: 156, successRate: 98.2, avgTime: '25 min', rating: 4.5, status: 'Offline' },
];

export const AnalyticsPage: React.FC = () => {
    const [timeRange, setTimeRange] = useState('30d');
    const [chartPeriod, setChartPeriod] = useState<'daily' | 'weekly' | 'monthly'>('daily');
    const toast = useToast();
    const { selectedLocation, locations } = useLocationFilter();

    // Fetch dashboard stats
    const { data: statsData, isLoading: statsLoading } = useQuery({
        queryKey: ['dashboardStats', timeRange],
        queryFn: () => adminApi.getDashboardStats(timeRange),
    });

    // Fetch vendors
    const { data: vendorsData } = useQuery({
        queryKey: ['vendorList'],
        queryFn: () => adminApi.getVendorList({ limit: 10 }),
    });

    // Fetch riders
    const { data: ridersData } = useQuery({
        queryKey: ['riders'],
        queryFn: () => adminApi.getAllRiders(),
    });

    // Fetch health/consultation stats
    const { data: healthStatsData, isLoading: healthStatsLoading } = useQuery({
        queryKey: ['healthStats'],
        queryFn: () => healthApi.getAllAppointmentsStats(),
    });

    // Fetch all doctors for count
    const { data: doctorsData } = useQuery({
        queryKey: ['allDoctorsAnalytics'],
        queryFn: () => healthApi.getAllDoctors(),
    });

    const stats = statsData?.data;
    const healthStats = healthStatsData?.data;
    const doctors = doctorsData?.data || [];

    // Compute health funnel from real data
    const healthFunnel = computeHealthFunnel(healthStats);
    const totalConsultations = healthStats?.total || 0;
    const completedConsultations = healthStats?.completed || 0;
    const completionRate = totalConsultations > 0 ? Math.round((completedConsultations / totalConsultations) * 100) : 0;

    // KPI Cards data
    const kpiCards: KPICard[] = [
        {
            label: 'Total GMV',
            value: formatCurrency(stats?.totalBalanceResult || 128400000),
            change: 18.2,
            changeLabel: 'vs last month',
            icon: DollarSign,
            color: 'green',
        },
        {
            label: 'Take Rate',
            value: '3.8%',
            change: 0.5,
            changeLabel: 'vs last month',
            icon: Percent,
            color: 'purple',
        },
        {
            label: 'Avg Order Value',
            value: formatCurrency(3240),
            change: 5.5,
            changeLabel: 'vs last month',
            icon: ShoppingCart,
            color: 'blue',
        },
        {
            label: 'Avg Delivery Time',
            value: '26 min',
            change: -4,
            changeLabel: 'min faster',
            icon: Clock,
            color: 'orange',
        },
    ];

    const handleExport = () => {
        toast({
            title: 'Export Started',
            description: 'Your analytics report is being generated...',
            status: 'info',
            duration: 3000,
        });
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Online': return 'green';
            case 'Busy': return 'orange';
            case 'Offline': return 'gray';
            default: return 'gray';
        }
    };

    return (
        <Box>
            {/* Header */}
            <Flex justify="space-between" align={{ base: 'start', md: 'center' }} mb={6} flexDir={{ base: 'column', md: 'row' }} gap={3}>
                <Box>
                    <Heading size="lg" color="gray.100" mb={1}>Analytics</Heading>
                    <Text color="gray.500">Comprehensive insights and performance metrics</Text>
                </Box>
                <Flex gap={2} flexWrap="wrap" align="center">
                    {/* Time Range Tabs */}
                    <Box overflowX="auto" maxW={{ base: '100%', sm: 'auto' }}>
                        <Tabs
                            variant="soft-rounded"
                            colorScheme="purple"
                            size="sm"
                            onChange={(index) => {
                                const ranges = ['1d', '7d', '30d', '90d'];
                                setTimeRange(ranges[index]);
                            }}
                            defaultIndex={2}
                        >
                            <TabList bg="gray.800" borderRadius="lg" p={1}>
                                <Tab _selected={{ bg: 'purple.500', color: 'white' }} color="gray.400" fontSize="xs" px={2}>Today</Tab>
                                <Tab _selected={{ bg: 'purple.500', color: 'white' }} color="gray.400" fontSize="xs" px={2}>7d</Tab>
                                <Tab _selected={{ bg: 'purple.500', color: 'white' }} color="gray.400" fontSize="xs" px={2}>30d</Tab>
                                <Tab _selected={{ bg: 'purple.500', color: 'white' }} color="gray.400" fontSize="xs" px={2}>90d</Tab>
                            </TabList>
                        </Tabs>
                    </Box>

                    {/* City Filter */}
                    <Select
                        size="sm"
                        w={{ base: '110px', md: '140px' }}
                        bg="gray.800"
                        borderColor="gray.700"
                        value={selectedLocation}
                    >
                        {locations.map((loc) => (
                            <option key={loc.value} value={loc.value}>{loc.label}</option>
                        ))}
                    </Select>

                    <Button
                        leftIcon={<Download size={16} />}
                        colorScheme="purple"
                        size="sm"
                        onClick={handleExport}
                    >
                        <Text display={{ base: 'none', sm: 'inline' }}>Export</Text>
                    </Button>
                </Flex>
            </Flex>

            {/* KPI Cards */}
            <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={4} mb={6}>
                {kpiCards.map((kpi, index) => (
                    <Card key={index} bg="gray.900" borderColor="gray.800" borderWidth="1px">
                        <CardBody>
                            <Flex justify="space-between" align="flex-start" mb={3}>
                                <Box
                                    p={2}
                                    borderRadius="lg"
                                    bg={`${kpi.color}.500`}
                                    opacity={0.9}
                                >
                                    <Icon as={kpi.icon} color="white" boxSize={5} />
                                </Box>
                                <Flex align="center" gap={1}>
                                    <Icon
                                        as={kpi.change >= 0 ? TrendingUp : TrendingDown}
                                        color={kpi.change >= 0 ? 'green.400' : 'red.400'}
                                        boxSize={4}
                                    />
                                    <Text
                                        fontSize="sm"
                                        fontWeight="500"
                                        color={kpi.change >= 0 ? 'green.400' : 'red.400'}
                                    >
                                        {kpi.change >= 0 ? '+' : ''}{kpi.change}%
                                    </Text>
                                </Flex>
                            </Flex>
                            <Text fontSize="2xl" fontWeight="bold" color="gray.100" mb={1}>
                                {kpi.value}
                            </Text>
                            <Text fontSize="sm" color="gray.500">
                                {kpi.label}
                            </Text>
                            <Text fontSize="xs" color="gray.600">
                                {kpi.changeLabel}
                            </Text>
                        </CardBody>
                    </Card>
                ))}
            </SimpleGrid>

            {/* Charts Row 1: GMV Trend & Orders by Category */}
            <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6} mb={6}>
                {/* GMV Trend Chart */}
                <Card bg="gray.900" borderColor="gray.800" borderWidth="1px">
                    <CardBody>
                        <Flex justify="space-between" align="center" mb={4} flexWrap="wrap" gap={2}>
                            <Text fontSize="lg" fontWeight="600" color="gray.100">GMV Trend</Text>
                            <HStack spacing={1}>
                                {(['daily', 'weekly', 'monthly'] as const).map((period) => (
                                    <Button
                                        key={period}
                                        size="xs"
                                        variant={chartPeriod === period ? 'solid' : 'ghost'}
                                        colorScheme={chartPeriod === period ? 'purple' : 'gray'}
                                        onClick={() => setChartPeriod(period)}
                                        textTransform="capitalize"
                                        px={2}
                                    >
                                        {period.charAt(0).toUpperCase()}
                                    </Button>
                                ))}
                            </HStack>
                        </Flex>

                        {/* Simple Area Chart Visualization */}
                        <Box h="200px" position="relative">
                            <Flex h="100%" align="flex-end" justify="space-between" px={2}>
                                {mockGMVData.map((item, index) => {
                                    const maxValue = Math.max(...mockGMVData.map(d => d.value));
                                    const height = (item.value / maxValue) * 100;
                                    return (
                                        <VStack key={index} spacing={2} flex={1}>
                                            <Box
                                                w="80%"
                                                h={`${height}%`}
                                                bg="linear-gradient(180deg, rgba(168, 85, 247, 0.8) 0%, rgba(168, 85, 247, 0.2) 100%)"
                                                borderRadius="md"
                                                position="relative"
                                                _before={{
                                                    content: '""',
                                                    position: 'absolute',
                                                    top: 0,
                                                    left: 0,
                                                    right: 0,
                                                    h: '3px',
                                                    bg: 'purple.500',
                                                    borderRadius: 'full',
                                                }}
                                            />
                                            <Text fontSize="xs" color="gray.500">{item.label}</Text>
                                        </VStack>
                                    );
                                })}
                            </Flex>
                        </Box>

                        <Flex justify="center" mt={4}>
                            <HStack spacing={4}>
                                <HStack spacing={2}>
                                    <Box w={3} h={3} borderRadius="sm" bg="purple.500" />
                                    <Text fontSize="xs" color="gray.400">GMV</Text>
                                </HStack>
                            </HStack>
                        </Flex>
                    </CardBody>
                </Card>

                {/* Orders by Business Type */}
                <Card bg="gray.900" borderColor="gray.800" borderWidth="1px">
                    <CardBody>
                        <Flex justify="space-between" align="center" mb={4}>
                            <Text fontSize="lg" fontWeight="600" color="gray.100">Orders by Business Type</Text>
                        </Flex>

                        {/* Donut Chart Visualization */}
                        <Flex justify="center" align="center" h="200px">
                            <Box position="relative" w="160px" h="160px">
                                {/* Outer ring segments */}
                                <Box
                                    position="absolute"
                                    w="100%"
                                    h="100%"
                                    borderRadius="full"
                                    bg={`conic-gradient(
                                        ${mockOrdersByCategory[0].color.replace('.500', '.400')} 0% 45%,
                                        ${mockOrdersByCategory[1].color.replace('.500', '.400')} 45% 70%,
                                        ${mockOrdersByCategory[2].color.replace('.500', '.400')} 70% 88%,
                                        ${mockOrdersByCategory[3].color.replace('.500', '.400')} 88% 100%
                                    )`}
                                    style={{ background: `conic-gradient(#A855F7 0% 45%, #22C55E 45% 70%, #3B82F6 70% 88%, #F97316 88% 100%)` }}
                                />
                                {/* Inner circle */}
                                <Flex
                                    position="absolute"
                                    top="20%"
                                    left="20%"
                                    w="60%"
                                    h="60%"
                                    borderRadius="full"
                                    bg="gray.900"
                                    align="center"
                                    justify="center"
                                    flexDirection="column"
                                >
                                    <Text fontSize="xl" fontWeight="bold" color="gray.100">
                                        {'1,247'}
                                    </Text>
                                    <Text fontSize="xs" color="gray.500">Orders</Text>
                                </Flex>
                            </Box>
                        </Flex>

                        {/* Legend */}
                        <SimpleGrid columns={2} spacing={2} mt={4}>
                            {mockOrdersByCategory.map((cat, index) => (
                                <HStack key={index} spacing={2}>
                                    <Box w={3} h={3} borderRadius="sm" bg={cat.color} />
                                    <Text fontSize="xs" color="gray.400">{cat.label}</Text>
                                    <Text fontSize="xs" color="gray.500" ml="auto">{cat.value}%</Text>
                                </HStack>
                            ))}
                        </SimpleGrid>
                    </CardBody>
                </Card>
            </SimpleGrid>

            {/* Charts Row 2: Delivery Performance & Health Funnel */}
            <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6} mb={6}>
                {/* Delivery Performance */}
                <Card bg="gray.900" borderColor="gray.800" borderWidth="1px">
                    <CardBody>
                        <Flex justify="space-between" align="center" mb={4}>
                            <Text fontSize="lg" fontWeight="600" color="gray.100">Delivery Performance</Text>
                            <Select size="xs" w="100px" bg="gray.800" borderColor="gray.700">
                                <option value="all">All Cities</option>
                            </Select>
                        </Flex>

                        {/* Bar Chart */}
                        <Flex h="180px" align="flex-end" justify="space-between" px={2}>
                            {mockDeliveryByDay.map((item, index) => (
                                <VStack key={index} spacing={1} flex={1}>
                                    <Flex direction="column" align="center" h="140px" justify="flex-end">
                                        <Box
                                            w="70%"
                                            h={`${item.onTime}%`}
                                            bg="orange.400"
                                            borderTopRadius="sm"
                                            mb={0.5}
                                        />
                                    </Flex>
                                    <Text fontSize="xs" color="gray.500">{item.day}</Text>
                                </VStack>
                            ))}
                        </Flex>

                        {/* Stats Summary */}
                        <SimpleGrid columns={{ base: 1, sm: 3 }} spacing={4} mt={4} pt={4} borderTopWidth="1px" borderColor="gray.700">
                            <Box>
                                <Text fontSize={{ base: 'md', md: 'lg' }} fontWeight="bold" color="gray.100">28 mins</Text>
                                <Text fontSize="xs" color="gray.500">Avg Delivery Time</Text>
                            </Box>
                            <Box>
                                <Text fontSize={{ base: 'md', md: 'lg' }} fontWeight="bold" color="green.400">87%</Text>
                                <Text fontSize="xs" color="gray.500">On-Time Delivery</Text>
                            </Box>
                            <Box>
                                <Text fontSize={{ base: 'md', md: 'lg' }} fontWeight="bold" color="gray.100">94%</Text>
                                <Text fontSize="xs" color="gray.500">Completion Rate</Text>
                            </Box>
                        </SimpleGrid>
                    </CardBody>
                </Card>

                {/* Health Consultations Funnel */}
                <Card bg="gray.900" borderColor="gray.800" borderWidth="1px">
                    <CardBody>
                        <Flex justify="space-between" align="center" mb={4}>
                            <Text fontSize="lg" fontWeight="600" color="gray.100">Health Consultations Funnel</Text>
                            {healthStatsLoading && <Spinner size="sm" color="purple.400" />}
                        </Flex>

                        <VStack spacing={3} align="stretch">
                            {healthFunnel.map((stage, index) => {
                                const colors = ['purple.500', 'purple.400', 'blue.500', 'green.500', 'orange.400'];
                                return (
                                    <Box key={index}>
                                        <Flex justify="space-between" mb={1}>
                                            <Text fontSize="sm" color="gray.300">{stage.stage}</Text>
                                            <Text fontSize="sm" fontWeight="600" color="gray.100">{stage.count.toLocaleString()}</Text>
                                        </Flex>
                                        <Progress
                                            value={stage.percentage}
                                            size="md"
                                            borderRadius="full"
                                            bg="gray.700"
                                            sx={{
                                                '& > div': {
                                                    background: colors[index],
                                                }
                                            }}
                                        />
                                    </Box>
                                );
                            })}
                        </VStack>

                        {/* Health Stats */}
                        <SimpleGrid columns={{ base: 1, sm: 3 }} spacing={4} mt={4} pt={4} borderTopWidth="1px" borderColor="gray.700">
                            <Box>
                                <HStack>
                                    <Icon as={Heart} color="red.400" boxSize={4} />
                                    <Text fontSize={{ base: 'md', md: 'lg' }} fontWeight="bold" color="gray.100">{totalConsultations}</Text>
                                </HStack>
                                <Text fontSize="xs" color="gray.500">Total Consultations</Text>
                            </Box>
                            <Box>
                                <Text fontSize={{ base: 'md', md: 'lg' }} fontWeight="bold" color="green.400">{completionRate}%</Text>
                                <Text fontSize="xs" color="gray.500">Completion Rate</Text>
                            </Box>
                            <Box>
                                <HStack>
                                    <Icon as={Users} color="purple.400" boxSize={4} />
                                    <Text fontSize={{ base: 'md', md: 'lg' }} fontWeight="bold" color="gray.100">{doctors.length}</Text>
                                </HStack>
                                <Text fontSize="xs" color="gray.500">Professionals</Text>
                            </Box>
                        </SimpleGrid>
                    </CardBody>
                </Card>
            </SimpleGrid>

            {/* Charts Row 3: Wallet Flow & Top Vendors */}
            <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6} mb={6}>
                {/* Wallet Flow */}
                <Card bg="gray.900" borderColor="gray.800" borderWidth="1px">
                    <CardBody>
                        <Flex justify="space-between" align="center" mb={4}>
                            <Text fontSize="lg" fontWeight="600" color="gray.100">Wallet Flow</Text>
                            <HStack spacing={4}>
                                <HStack spacing={2}>
                                    <Box w={3} h={3} borderRadius="sm" bg="green.500" />
                                    <Text fontSize="xs" color="gray.400">Inflow</Text>
                                </HStack>
                                <HStack spacing={2}>
                                    <Box w={3} h={3} borderRadius="sm" bg="orange.500" />
                                    <Text fontSize="xs" color="gray.400">Outflow</Text>
                                </HStack>
                            </HStack>
                        </Flex>

                        {/* Grouped Bar Chart */}
                        <Flex h="180px" align="flex-end" justify="space-around" px={4}>
                            {mockWalletFlow.map((item, index) => {
                                const maxValue = Math.max(...mockWalletFlow.flatMap(d => [d.inflow, d.outflow]));
                                const inflowHeight = (item.inflow / maxValue) * 100;
                                const outflowHeight = (item.outflow / maxValue) * 100;
                                return (
                                    <VStack key={index} spacing={1}>
                                        <HStack spacing={1} align="flex-end" h="140px">
                                            <Box
                                                w="20px"
                                                h={`${inflowHeight}%`}
                                                bg="green.500"
                                                borderTopRadius="sm"
                                            />
                                            <Box
                                                w="20px"
                                                h={`${outflowHeight}%`}
                                                bg="orange.500"
                                                borderTopRadius="sm"
                                            />
                                        </HStack>
                                        <Text fontSize="xs" color="gray.500">{item.week}</Text>
                                    </VStack>
                                );
                            })}
                        </Flex>
                    </CardBody>
                </Card>

                {/* Top Performing Vendors */}
                <Card bg="gray.900" borderColor="gray.800" borderWidth="1px">
                    <CardBody>
                        <Flex justify="space-between" align="center" mb={4}>
                            <Text fontSize="lg" fontWeight="600" color="gray.100">Top Performing Vendors</Text>
                            <Button variant="link" colorScheme="purple" size="sm">View All</Button>
                        </Flex>

                        <VStack spacing={3} align="stretch">
                            {mockTopVendors.map((vendor, index) => (
                                <Flex
                                    key={vendor.id}
                                    justify="space-between"
                                    align="center"
                                    p={3}
                                    bg="gray.800"
                                    borderRadius="lg"
                                    borderLeftWidth="3px"
                                    borderLeftColor={index === 0 ? 'purple.500' : index === 1 ? 'green.500' : 'blue.500'}
                                >
                                    <HStack spacing={3}>
                                        <Avatar
                                            size="sm"
                                            name={vendor.name}
                                            bg={index === 0 ? 'purple.500' : index === 1 ? 'green.500' : 'blue.500'}
                                        />
                                        <Box>
                                            <Text fontSize="sm" fontWeight="500" color="gray.100">{vendor.name}</Text>
                                            <Text fontSize="xs" color="gray.500">{vendor.category}</Text>
                                        </Box>
                                    </HStack>
                                    <Box textAlign="right">
                                        <Text fontSize="sm" fontWeight="600" color="green.400">
                                            {formatCurrency(vendor.revenue)}
                                        </Text>
                                        <HStack spacing={1} justify="flex-end">
                                            <Icon as={Star} color="yellow.400" boxSize={3} />
                                            <Text fontSize="xs" color="gray.400">{vendor.rating}</Text>
                                        </HStack>
                                    </Box>
                                </Flex>
                            ))}
                        </VStack>
                    </CardBody>
                </Card>
            </SimpleGrid>

            {/* Rider Performance Analytics */}
            <Card bg="gray.900" borderColor="gray.800" borderWidth="1px">
                <CardBody>
                    <Flex justify="space-between" align={{ base: 'start', md: 'center' }} mb={4} flexDir={{ base: 'column', sm: 'row' }} gap={2}>
                        <Text fontSize="lg" fontWeight="600" color="gray.100">Rider Performance Analytics</Text>
                        <HStack spacing={2} flexWrap="wrap">
                            <Select size="sm" w="120px" bg="gray.800" borderColor="gray.700">
                                <option value="all">All Zones</option>
                                <option value="lagos-a">Lagos Zone A</option>
                                <option value="lagos-b">Lagos Zone B</option>
                                <option value="abuja">Abuja</option>
                            </Select>
                            <Button
                                leftIcon={<Download size={14} />}
                                variant="outline"
                                borderColor="gray.600"
                                color="gray.300"
                                size="sm"
                            >
                                Export
                            </Button>
                        </HStack>
                    </Flex>

                    <Box overflowX="auto">
                        <Table variant="simple" size="sm">
                            <Thead>
                                <Tr>
                                    <Th borderColor="gray.700" color="gray.500" textTransform="uppercase" fontSize="xs">Rider</Th>
                                    <Th borderColor="gray.700" color="gray.500" textTransform="uppercase" fontSize="xs">Zone</Th>
                                    <Th borderColor="gray.700" color="gray.500" textTransform="uppercase" fontSize="xs" isNumeric>Deliveries</Th>
                                    <Th borderColor="gray.700" color="gray.500" textTransform="uppercase" fontSize="xs" isNumeric>Success Rate</Th>
                                    <Th borderColor="gray.700" color="gray.500" textTransform="uppercase" fontSize="xs">Avg Time</Th>
                                    <Th borderColor="gray.700" color="gray.500" textTransform="uppercase" fontSize="xs" isNumeric>Rating</Th>
                                    <Th borderColor="gray.700" color="gray.500" textTransform="uppercase" fontSize="xs">Status</Th>
                                </Tr>
                            </Thead>
                            <Tbody>
                                {mockRiderPerformance.map((rider) => (
                                    <Tr key={rider.id} _hover={{ bg: 'gray.800' }}>
                                        <Td borderColor="gray.700">
                                            <HStack spacing={3}>
                                                <Avatar size="sm" name={rider.name} bg="purple.500" />
                                                <Box>
                                                    <Text fontSize="sm" fontWeight="500" color="gray.100">{rider.name}</Text>
                                                    <Text fontSize="xs" color="gray.500">RID-{rider.id.padStart(3, '0')}</Text>
                                                </Box>
                                            </HStack>
                                        </Td>
                                        <Td borderColor="gray.700">
                                            <Text fontSize="sm" color="gray.300">{rider.zone}</Text>
                                        </Td>
                                        <Td borderColor="gray.700" isNumeric>
                                            <Text fontSize="sm" fontWeight="500" color="gray.100">{rider.deliveries}</Text>
                                        </Td>
                                        <Td borderColor="gray.700" isNumeric>
                                            <Text fontSize="sm" fontWeight="500" color="green.400">{rider.successRate}%</Text>
                                        </Td>
                                        <Td borderColor="gray.700">
                                            <Text fontSize="sm" color="gray.300">{rider.avgTime}</Text>
                                        </Td>
                                        <Td borderColor="gray.700" isNumeric>
                                            <HStack spacing={1} justify="flex-end">
                                                <Text fontSize="sm" color="gray.100">{rider.rating}</Text>
                                                <Icon as={Star} color="yellow.400" boxSize={3} />
                                            </HStack>
                                        </Td>
                                        <Td borderColor="gray.700">
                                            <Badge colorScheme={getStatusColor(rider.status)} size="sm">
                                                {rider.status}
                                            </Badge>
                                        </Td>
                                    </Tr>
                                ))}
                            </Tbody>
                        </Table>
                    </Box>
                </CardBody>
            </Card>
        </Box>
    );
};

export default AnalyticsPage;
