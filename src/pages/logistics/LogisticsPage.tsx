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
    IconButton,
    Badge,
    Table,
    Thead,
    Tbody,
    Tr,
    Th,
    Td,
    Spinner,
    Card,
    CardBody,
    SimpleGrid,
    Tabs,
    TabList,
    TabPanels,
    Tab,
    TabPanel,
    Avatar,
    Link,
    useDisclosure,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalCloseButton,
    Input,
    FormControl,
    FormLabel,
    useToast,
    Divider,
} from '@chakra-ui/react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    Bike,
    Clock,
    Package,
    TrendingUp,
    Download,
    Plus,
    RefreshCw,
    Filter,
    Eye,
    MapPin,
    Truck,
    Navigation,
    Timer,
    CheckCircle,
    AlertCircle,
} from 'lucide-react';
import { adminApi } from '../../api/admin.api';
import { ordersApi } from '../../api/orders.api';
import { StatusPill } from '../../components/common/StatusPill';
import { formatCurrency, formatFullName } from '../../utils/formatters';

export const LogisticsPage: React.FC = () => {
    const [activeTab, setActiveTab] = useState(0);
    const [cityFilter, setCityFilter] = useState('all');
    const [zoneFilter, setZoneFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');
    const [verificationFilter, setVerificationFilter] = useState('all');
    const [selectedRider, setSelectedRider] = useState<any>(null);
    const [selectedOrder, setSelectedOrder] = useState<any>(null);

    const { isOpen: isAddRiderOpen, onOpen: onAddRiderOpen, onClose: onAddRiderClose } = useDisclosure();
    const { isOpen: isViewRiderOpen, onOpen: onViewRiderOpen, onClose: onViewRiderClose } = useDisclosure();
    const { isOpen: isViewOrderOpen, onOpen: onViewOrderOpen, onClose: onViewOrderClose } = useDisclosure();
    const toast = useToast();
    const queryClient = useQueryClient();

    // Fetch riders
    const { data: ridersData, isLoading: ridersLoading, error: ridersError, refetch: refetchRiders } = useQuery({
        queryKey: ['riders'],
        queryFn: () => adminApi.getAllRiders(),
        retry: false,
    });

    // Fetch all orders (for delivery jobs)
    const { data: ordersData, isLoading: ordersLoading, error: ordersError } = useQuery({
        queryKey: ['orders'],
        queryFn: () => ordersApi.getAllOrders(),
        retry: false,
    });

    // Get orders directly from API response (no enrichment to avoid re-render issues)
    const orders = ordersData?.data || [];

    // Extract riders - handle different response formats from external TrackThatRide API
    const ridersRaw = ridersData?.data as any;
    const riders = Array.isArray(ridersRaw)
        ? ridersRaw
        : (ridersRaw?.drivers || ridersRaw?.data || []);

    // Helper function to get latest order status - always returns string
    function getLatestStatus(order: any): string {
        if (!order || !order.orderTracking || order.orderTracking.length === 0) return 'PENDING';
        try {
            // Sort by createdAt descending to get the latest status
            const sorted = [...order.orderTracking].sort((a: any, b: any) =>
                new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            );
            const status = sorted[0]?.orderStatus || sorted[0]?.status || 'PENDING';
            return String(status);
        } catch {
            return 'PENDING';
        }
    }

    // Filter orders that have been assigned to riders (delivery jobs)
    // Show orders that are in progress OR have an assigned rider
    const deliveryJobs = orders.filter((order: any) => {
        if (!order) return false;
        const latestStatus = String(getLatestStatus(order) || 'PENDING').toUpperCase();
        const hasAssignedRider = order.assignedRider || order.riderId || order.ttrRideId;
        // Orders that are in progress (acknowledged, picked up, in transit) OR have assigned rider
        const inProgressStatuses = ['ACKNOWLEDGED', 'PICKED_UP', 'IN_TRANSIT', 'OUT_FOR_DELIVERY', 'RIDER_ASSIGNED'];
        return inProgressStatuses.includes(latestStatus) || hasAssignedRider;
    });

    // Stats
    const activeRiders = riders.filter((r: any) => r.status === 'active' || r.isActive || !r.status).length || riders.length;
    const activeJobs = deliveryJobs.length;

    const clearFilters = () => {
        setCityFilter('all');
        setZoneFilter('all');
        setStatusFilter('all');
        setVerificationFilter('all');
    };

    const getRiderInitials = (name: string) => {
        if (!name) return 'RD';
        const parts = name.split(' ');
        if (parts.length >= 2) {
            return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
        }
        return name.substring(0, 2).toUpperCase();
    };

    // Helper to get rider name from order's ttrRideId
    const getRiderName = (order: any): string => {
        if (!order.ttrRideId) return 'Unassigned';
        // Try to find rider from riders list by matching ride ID
        const rider = riders.find((r: any) =>
            r.id === order.ttrRideId ||
            r.rideId === order.ttrRideId ||
            r.riderId === order.ttrRideId
        );
        if (rider) {
            return rider.name || rider.riderName || rider.driverName || `Rider #${order.ttrRideId}`;
        }
        // Has ride ID but rider not found in list
        return order.ttrTrackingCode ? `Tracking: ${order.ttrTrackingCode}` : `Ride #${order.ttrRideId}`;
    };

    // Helper to calculate rider lifetime earnings from completed orders
    const getRiderLifetimeEarnings = (riderId: any): number => {
        // Filter orders assigned to this rider that are DELIVERED
        const riderOrders = orders.filter((order: any) => {
            const orderRiderId = order.ttrRideId || order.riderId;
            if (!orderRiderId) return false;

            // Match rider ID (could be string or number)
            const matches = String(orderRiderId) === String(riderId) ||
                orderRiderId === riderId;

            if (!matches) return false;

            // Check if order is delivered
            const status = String(getLatestStatus(order) || '').toUpperCase();
            return status === 'DELIVERED';
        });

        // Calculate total earnings - Rider gets 70% of delivery fee
        return riderOrders.reduce((total: number, order: any) => {
            // Get delivery fee from order charges
            const deliveryFee = order.Charges || order.deliveryFee || order.deliveryCharges || 0;
            // Rider gets 70% of the delivery fee
            const riderEarning = Number(deliveryFee) * 0.70;
            return total + (riderEarning || 0);
        }, 0);
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}, ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
    };

    return (
        <Box>
            {/* Header */}
            <Flex justify="space-between" align="center" mb={2}>
                <Box>
                    <Heading size="lg" color="gray.100">
                        Logistics
                    </Heading>
                    <Text color="gray.500" fontSize="sm">
                        Manage riders, delivery jobs, and zones
                    </Text>
                </Box>
                <HStack spacing={3}>
                    <Button
                        size="sm"
                        variant="outline"
                        borderColor="gray.600"
                        leftIcon={<Download size={14} />}
                    >
                        Export
                    </Button>
                    <Button
                        size="sm"
                        colorScheme="purple"
                        leftIcon={<Plus size={14} />}
                        onClick={onAddRiderOpen}
                    >
                        Add Rider
                    </Button>
                </HStack>
            </Flex>

            {/* Tabs */}
            <Tabs
                variant="unstyled"
                index={activeTab}
                onChange={setActiveTab}
                mb={6}
            >
                <TabList borderBottomWidth="1px" borderColor="gray.800" mb={6}>
                    <Tab
                        color="gray.500"
                        _selected={{ color: 'gray.100', borderBottomWidth: '2px', borderColor: 'purple.500' }}
                        pb={3}
                        mr={6}
                    >
                        Riders
                    </Tab>
                    <Tab
                        color="gray.500"
                        _selected={{ color: 'gray.100', borderBottomWidth: '2px', borderColor: 'purple.500' }}
                        pb={3}
                        mr={6}
                    >
                        Delivery Jobs
                    </Tab>
                    <Tab
                        color="gray.500"
                        _selected={{ color: 'gray.100', borderBottomWidth: '2px', borderColor: 'purple.500' }}
                        pb={3}
                    >
                        Zones & SLAs
                    </Tab>
                </TabList>

                {/* Stats Cards - Shared across tabs */}
                <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4} mb={6}>
                    <Card bg="gray.900" borderColor="gray.800" borderWidth="1px">
                        <CardBody py={4} px={5}>
                            <Flex justify="space-between" align="center">
                                <Box>
                                    <Text fontSize="xs" color="gray.500">Active Riders</Text>
                                    <Text fontSize="2xl" fontWeight="bold" color="gray.100">{activeRiders}</Text>
                                </Box>
                                <Box p={2} bg="rgba(34, 197, 94, 0.1)" borderRadius="lg">
                                    <Icon as={Bike} color="green.400" boxSize={5} />
                                </Box>
                            </Flex>
                        </CardBody>
                    </Card>

                    <Card bg="gray.900" borderColor="gray.800" borderWidth="1px">
                        <CardBody py={4} px={5}>
                            <Flex justify="space-between" align="center">
                                <Box>
                                    <Text fontSize="xs" color="gray.500">Avg Delivery Time</Text>
                                    <Text fontSize="2xl" fontWeight="bold" color="gray.100">0min</Text>
                                </Box>
                                <Box p={2} bg="rgba(59, 130, 246, 0.1)" borderRadius="lg">
                                    <Icon as={Clock} color="blue.400" boxSize={5} />
                                </Box>
                            </Flex>
                        </CardBody>
                    </Card>

                    <Card bg="gray.900" borderColor="gray.800" borderWidth="1px">
                        <CardBody py={4} px={5}>
                            <Flex justify="space-between" align="center">
                                <Box>
                                    <Text fontSize="xs" color="gray.500">Active Jobs</Text>
                                    <Text fontSize="2xl" fontWeight="bold" color="gray.100">{activeJobs}</Text>
                                </Box>
                                <Box p={2} bg="rgba(234, 179, 8, 0.1)" borderRadius="lg">
                                    <Icon as={Package} color="yellow.400" boxSize={5} />
                                </Box>
                            </Flex>
                        </CardBody>
                    </Card>

                    <Card bg="gray.900" borderColor="gray.800" borderWidth="1px">
                        <CardBody py={4} px={5}>
                            <Flex justify="space-between" align="center">
                                <Box>
                                    <Text fontSize="xs" color="gray.500">Success Rate</Text>
                                    <Text fontSize="2xl" fontWeight="bold" color="gray.100">0%</Text>
                                </Box>
                                <Box p={2} bg="rgba(168, 85, 247, 0.1)" borderRadius="lg">
                                    <Icon as={TrendingUp} color="purple.400" boxSize={5} />
                                </Box>
                            </Flex>
                        </CardBody>
                    </Card>
                </SimpleGrid>

                {/* Filters - Shared across tabs */}
                <HStack spacing={4} mb={6} flexWrap="wrap">
                    <Select
                        size="sm"
                        bg="gray.800"
                        borderColor="gray.700"
                        maxW="150px"
                        value={cityFilter}
                        onChange={(e) => setCityFilter(e.target.value)}
                    >
                        <option value="all">All Cities</option>
                        <option value="lagos">Lagos</option>
                        <option value="abuja">Abuja</option>
                        <option value="minna">Minna</option>
                    </Select>

                    <Select
                        size="sm"
                        bg="gray.800"
                        borderColor="gray.700"
                        maxW="150px"
                        value={zoneFilter}
                        onChange={(e) => setZoneFilter(e.target.value)}
                    >
                        <option value="all">All Zones</option>
                        <option value="zone-a">Zone A</option>
                        <option value="zone-b">Zone B</option>
                        <option value="zone-c">Zone C</option>
                    </Select>

                    <Select
                        size="sm"
                        bg="gray.800"
                        borderColor="gray.700"
                        maxW="150px"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                    >
                        <option value="all">All Status</option>
                        <option value="online">Online</option>
                        <option value="offline">Offline</option>
                        <option value="on-delivery">On Delivery</option>
                    </Select>

                    <Select
                        size="sm"
                        bg="gray.800"
                        borderColor="gray.700"
                        maxW="180px"
                        value={verificationFilter}
                        onChange={(e) => setVerificationFilter(e.target.value)}
                    >
                        <option value="all">Verification Status</option>
                        <option value="verified">Verified</option>
                        <option value="pending">Pending Verification</option>
                    </Select>

                    <Button
                        size="sm"
                        variant="outline"
                        borderColor="gray.600"
                        leftIcon={<Filter size={14} />}
                        onClick={clearFilters}
                    >
                        Clear Filters
                    </Button>
                </HStack>

                <TabPanels>
                    {/* Riders Tab */}
                    <TabPanel p={0}>
                        <Box bg="gray.900" borderRadius="xl" borderWidth="1px" borderColor="gray.800" overflow="hidden">
                            <Flex justify="space-between" align="center" p={4} borderBottomWidth="1px" borderColor="gray.800">
                                <Text fontWeight="600" color="gray.100">Riders</Text>
                                <IconButton
                                    aria-label="Refresh"
                                    icon={<RefreshCw size={14} />}
                                    size="xs"
                                    variant="ghost"
                                    onClick={() => refetchRiders()}
                                />
                            </Flex>

                            {ridersLoading ? (
                                <Flex justify="center" py={12}>
                                    <Spinner size="lg" color="purple.500" />
                                </Flex>
                            ) : ridersError ? (
                                <Box p={8} textAlign="center">
                                    <Icon as={AlertCircle} color="red.400" boxSize={8} mb={2} />
                                    <Text color="red.400" fontWeight="500">Failed to load riders</Text>
                                    <Text color="gray.500" fontSize="sm" mt={1}>
                                        {(ridersError as any)?.message || 'Unknown error occurred'}
                                    </Text>
                                    <Button
                                        mt={4}
                                        size="sm"
                                        colorScheme="purple"
                                        onClick={() => refetchRiders()}
                                    >
                                        Retry
                                    </Button>
                                </Box>
                            ) : (
                                <Box overflowX="auto">
                                    <Table variant="simple" size="sm">
                                        <Thead>
                                            <Tr>
                                                <Th borderColor="gray.800" color="gray.500" textTransform="uppercase" fontSize="xs">Rider</Th>
                                                <Th borderColor="gray.800" color="gray.500" textTransform="uppercase" fontSize="xs">Phone Number</Th>
                                                <Th borderColor="gray.800" color="gray.500" textTransform="uppercase" fontSize="xs">Status</Th>
                                                <Th borderColor="gray.800" color="gray.500" textTransform="uppercase" fontSize="xs">Email</Th>
                                                <Th borderColor="gray.800" color="gray.500" textTransform="uppercase" fontSize="xs">Vehicle Type</Th>
                                                <Th borderColor="gray.800" color="gray.500" textTransform="uppercase" fontSize="xs">Vehicle ID</Th>
                                                <Th borderColor="gray.800" color="gray.500" textTransform="uppercase" fontSize="xs">Company ID</Th>
                                                <Th borderColor="gray.800" color="gray.500" textTransform="uppercase" fontSize="xs">Actions</Th>
                                            </Tr>
                                        </Thead>
                                        <Tbody>
                                            {riders.length === 0 ? (
                                                <Tr>
                                                    <Td colSpan={8} textAlign="center" py={8} borderColor="gray.800">
                                                        <Text color="gray.500">No riders found</Text>
                                                    </Td>
                                                </Tr>
                                            ) : (
                                                riders.map((rider: any) => {
                                                    // Handle both internal and external API field names
                                                    const name = rider.name || rider.riderName || `${rider.first_name || ''} ${rider.last_name || ''}`.trim() || 'Unknown';
                                                    const phone = rider.phone || rider.riderPhone || '--';
                                                    const email = rider.email || 'N/A';
                                                    const vehicleType = rider.vehicle_type || rider.vehicleType || 'Motorcycle';
                                                    const vehicleId = rider.vehicle_id || rider.vehicleId || 'N/A';
                                                    const riderId = rider.id || rider.riderId || rider.driver_id || '--';
                                                    const status = rider.status || 'active';
                                                    const companyId = rider.provider_id || rider.providerId || '28';

                                                    return (
                                                        <Tr key={riderId} _hover={{ bg: 'gray.800' }}>
                                                            <Td borderColor="gray.800">
                                                                <HStack spacing={3}>
                                                                    <Avatar
                                                                        size="sm"
                                                                        name={name}
                                                                        bg="purple.600"
                                                                        color="white"
                                                                    />
                                                                    <Box>
                                                                        <Text fontWeight="500" color="gray.100">{name}</Text>
                                                                        <Text fontSize="xs" color="purple.400">RIDER ID{riderId}</Text>
                                                                    </Box>
                                                                </HStack>
                                                            </Td>
                                                            <Td borderColor="gray.800">
                                                                <Text fontSize="sm" color="gray.300">{phone}</Text>
                                                            </Td>
                                                            <Td borderColor="gray.800">
                                                                <Badge
                                                                    colorScheme={status === 'active' ? 'green' : status === 'busy' ? 'yellow' : 'gray'}
                                                                    variant="subtle"
                                                                >
                                                                    • {status.charAt(0).toUpperCase() + status.slice(1)}
                                                                </Badge>
                                                            </Td>
                                                            <Td borderColor="gray.800">
                                                                <Text fontSize="sm" color="purple.400">{email}</Text>
                                                            </Td>
                                                            <Td borderColor="gray.800">
                                                                <HStack spacing={1}>
                                                                    <Icon as={Bike} color="green.400" boxSize={4} />
                                                                    <Text fontSize="sm" color="gray.300">{vehicleType}</Text>
                                                                </HStack>
                                                            </Td>
                                                            <Td borderColor="gray.800">
                                                                <Text fontSize="sm" color="purple.400">{vehicleId}</Text>
                                                            </Td>
                                                            <Td borderColor="gray.800">
                                                                <Text fontSize="sm" color="gray.300">{companyId}</Text>
                                                            </Td>
                                                            <Td borderColor="gray.800">
                                                                <HStack spacing={2}>
                                                                    <Link
                                                                        color="purple.400"
                                                                        fontSize="sm"
                                                                        cursor="pointer"
                                                                        onClick={() => {
                                                                            setSelectedRider({ name, phone, email, vehicleType, vehicleId, riderId, status, companyId });
                                                                            onViewRiderOpen();
                                                                        }}
                                                                    >
                                                                        View
                                                                    </Link>
                                                                    <Text fontSize="sm" color="gray.600" cursor="not-allowed">Payout</Text>
                                                                </HStack>
                                                            </Td>
                                                        </Tr>
                                                    );
                                                })
                                            )}
                                        </Tbody>
                                    </Table>
                                </Box>
                            )}
                        </Box>
                    </TabPanel>

                    {/* Delivery Jobs Tab */}
                    <TabPanel p={0}>
                        <Box bg="gray.900" borderRadius="xl" borderWidth="1px" borderColor="gray.800" overflow="hidden">
                            <Flex justify="space-between" align="center" p={4} borderBottomWidth="1px" borderColor="gray.800">
                                <Text fontWeight="600" color="gray.100">Delivery Jobs</Text>
                                <IconButton
                                    aria-label="Refresh"
                                    icon={<RefreshCw size={14} />}
                                    size="xs"
                                    variant="ghost"
                                />
                            </Flex>

                            {ordersLoading ? (
                                <Flex justify="center" py={12}>
                                    <Spinner size="lg" color="purple.500" />
                                </Flex>
                            ) : (
                                <Box overflowX="auto">
                                    <Table variant="simple" size="sm">
                                        <Thead>
                                            <Tr>
                                                <Th borderColor="gray.800" color="gray.500" textTransform="uppercase" fontSize="xs">Order ID</Th>
                                                <Th borderColor="gray.800" color="gray.500" textTransform="uppercase" fontSize="xs">Customer</Th>
                                                <Th borderColor="gray.800" color="gray.500" textTransform="uppercase" fontSize="xs">Pickup</Th>
                                                <Th borderColor="gray.800" color="gray.500" textTransform="uppercase" fontSize="xs">Dropoff</Th>
                                                <Th borderColor="gray.800" color="gray.500" textTransform="uppercase" fontSize="xs">Status</Th>
                                                <Th borderColor="gray.800" color="gray.500" textTransform="uppercase" fontSize="xs">Rider</Th>
                                                <Th borderColor="gray.800" color="gray.500" textTransform="uppercase" fontSize="xs">Amount</Th>
                                            </Tr>
                                        </Thead>
                                        <Tbody>
                                            {deliveryJobs.length === 0 ? (
                                                <Tr>
                                                    <Td colSpan={7} textAlign="center" py={8} borderColor="gray.800">
                                                        <VStack spacing={2}>
                                                            <Icon as={Truck} color="gray.600" boxSize={8} />
                                                            <Text color="gray.500">No active delivery jobs</Text>
                                                            <Text color="gray.600" fontSize="sm">Orders assigned to riders will appear here</Text>
                                                        </VStack>
                                                    </Td>
                                                </Tr>
                                            ) : (
                                                deliveryJobs.map((order: any) => (
                                                    <Tr key={order.id} _hover={{ bg: 'gray.800' }}>
                                                        <Td borderColor="gray.800">
                                                            <Link
                                                                fontSize="sm"
                                                                color="purple.400"
                                                                fontWeight="500"
                                                                cursor="pointer"
                                                                onClick={() => {
                                                                    setSelectedOrder(order);
                                                                    onViewOrderOpen();
                                                                }}
                                                            >
                                                                #{(order.id?.toString() || '').substring(0, 8).toUpperCase()}
                                                            </Link>
                                                        </Td>
                                                        <Td borderColor="gray.800">
                                                            <Box>
                                                                <Text fontSize="sm" fontWeight="500" color="gray.100">
                                                                    {formatFullName(order.user?.firstName, order.user?.lastName)}
                                                                </Text>
                                                                <Text fontSize="xs" color="gray.500">{order.user?.mobile || '--'}</Text>
                                                            </Box>
                                                        </Td>
                                                        <Td borderColor="gray.800">
                                                            <HStack spacing={1}>
                                                                <Icon as={MapPin} color="green.400" boxSize={3} />
                                                                <Box>
                                                                    <Text fontSize="sm" color="gray.100" noOfLines={1} maxW="150px">
                                                                        {order.store?.name || 'Unknown Store'}
                                                                    </Text>
                                                                    <Text fontSize="xs" color="gray.500" noOfLines={1} maxW="150px">
                                                                        {order.store?.address || order.pickUpLocationAddress || '--'}
                                                                    </Text>
                                                                </Box>
                                                            </HStack>
                                                        </Td>
                                                        <Td borderColor="gray.800">
                                                            <HStack spacing={1}>
                                                                <Icon as={Navigation} color="red.400" boxSize={3} />
                                                                <Box>
                                                                    <Text fontSize="sm" color="gray.100" noOfLines={1} maxW="150px">
                                                                        {order.dropOffLocationAddress || '--'}
                                                                    </Text>
                                                                    <Text fontSize="xs" color="gray.500" noOfLines={1} maxW="150px">
                                                                        {order.fullHouseAddress || '--'}
                                                                    </Text>
                                                                </Box>
                                                            </HStack>
                                                        </Td>
                                                        <Td borderColor="gray.800">
                                                            <StatusPill status={getLatestStatus(order)} />
                                                        </Td>
                                                        <Td borderColor="gray.800">
                                                            <Text fontSize="sm" color="gray.400">
                                                                {getRiderName(order)}
                                                            </Text>
                                                        </Td>
                                                        <Td borderColor="gray.800">
                                                            <Text fontSize="sm" fontWeight="500" color="green.400">
                                                                {formatCurrency(order.totalAmount)}
                                                            </Text>
                                                        </Td>
                                                    </Tr>
                                                ))
                                            )}
                                        </Tbody>
                                    </Table>
                                </Box>
                            )}
                        </Box>
                    </TabPanel>

                    {/* Zones & SLAs Tab */}
                    <TabPanel p={0}>
                        <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6}>
                            {/* Zones Section */}
                            <Box bg="gray.900" borderRadius="xl" borderWidth="1px" borderColor="gray.800" overflow="hidden">
                                <Flex justify="space-between" align="center" p={4} borderBottomWidth="1px" borderColor="gray.800">
                                    <Text fontWeight="600" color="gray.100">Delivery Zones</Text>
                                    <Button size="xs" colorScheme="purple" leftIcon={<Plus size={12} />}>
                                        Add Zone
                                    </Button>
                                </Flex>
                                <Box p={4}>
                                    <VStack spacing={3} align="stretch">
                                        {/* Zone A */}
                                        <Card bg="gray.800" borderColor="gray.700" borderWidth="1px">
                                            <CardBody py={3}>
                                                <Flex justify="space-between" align="center">
                                                    <HStack spacing={3}>
                                                        <Box p={2} bg="green.500" borderRadius="md">
                                                            <Icon as={MapPin} color="white" boxSize={4} />
                                                        </Box>
                                                        <Box>
                                                            <Text fontWeight="500" color="gray.100">Zone A - Central</Text>
                                                            <Text fontSize="xs" color="gray.500">Lagos Island, Victoria Island</Text>
                                                        </Box>
                                                    </HStack>
                                                    <VStack align="end" spacing={0}>
                                                        <Text fontSize="sm" color="green.400">₦500</Text>
                                                        <Text fontSize="xs" color="gray.500">base fee</Text>
                                                    </VStack>
                                                </Flex>
                                            </CardBody>
                                        </Card>

                                        {/* Zone B */}
                                        <Card bg="gray.800" borderColor="gray.700" borderWidth="1px">
                                            <CardBody py={3}>
                                                <Flex justify="space-between" align="center">
                                                    <HStack spacing={3}>
                                                        <Box p={2} bg="blue.500" borderRadius="md">
                                                            <Icon as={MapPin} color="white" boxSize={4} />
                                                        </Box>
                                                        <Box>
                                                            <Text fontWeight="500" color="gray.100">Zone B - Mainland</Text>
                                                            <Text fontSize="xs" color="gray.500">Ikeja, Surulere, Yaba</Text>
                                                        </Box>
                                                    </HStack>
                                                    <VStack align="end" spacing={0}>
                                                        <Text fontSize="sm" color="green.400">₦700</Text>
                                                        <Text fontSize="xs" color="gray.500">base fee</Text>
                                                    </VStack>
                                                </Flex>
                                            </CardBody>
                                        </Card>

                                        {/* Zone C */}
                                        <Card bg="gray.800" borderColor="gray.700" borderWidth="1px">
                                            <CardBody py={3}>
                                                <Flex justify="space-between" align="center">
                                                    <HStack spacing={3}>
                                                        <Box p={2} bg="orange.500" borderRadius="md">
                                                            <Icon as={MapPin} color="white" boxSize={4} />
                                                        </Box>
                                                        <Box>
                                                            <Text fontWeight="500" color="gray.100">Zone C - Outskirts</Text>
                                                            <Text fontSize="xs" color="gray.500">Ajah, Lekki Phase 2</Text>
                                                        </Box>
                                                    </HStack>
                                                    <VStack align="end" spacing={0}>
                                                        <Text fontSize="sm" color="green.400">₦1,000</Text>
                                                        <Text fontSize="xs" color="gray.500">base fee</Text>
                                                    </VStack>
                                                </Flex>
                                            </CardBody>
                                        </Card>
                                    </VStack>
                                </Box>
                            </Box>

                            {/* SLAs Section */}
                            <Box bg="gray.900" borderRadius="xl" borderWidth="1px" borderColor="gray.800" overflow="hidden">
                                <Flex justify="space-between" align="center" p={4} borderBottomWidth="1px" borderColor="gray.800">
                                    <Text fontWeight="600" color="gray.100">Service Level Agreements</Text>
                                    <Button size="xs" colorScheme="purple" leftIcon={<Plus size={12} />}>
                                        Add SLA
                                    </Button>
                                </Flex>
                                <Box p={4}>
                                    <VStack spacing={3} align="stretch">
                                        {/* Standard Delivery */}
                                        <Card bg="gray.800" borderColor="gray.700" borderWidth="1px">
                                            <CardBody py={3}>
                                                <Flex justify="space-between" align="center">
                                                    <HStack spacing={3}>
                                                        <Box p={2} bg="blue.500" borderRadius="md">
                                                            <Icon as={Timer} color="white" boxSize={4} />
                                                        </Box>
                                                        <Box>
                                                            <Text fontWeight="500" color="gray.100">Standard Delivery</Text>
                                                            <Text fontSize="xs" color="gray.500">45-60 minutes</Text>
                                                        </Box>
                                                    </HStack>
                                                    <Badge colorScheme="green">Active</Badge>
                                                </Flex>
                                            </CardBody>
                                        </Card>

                                        {/* Express Delivery */}
                                        <Card bg="gray.800" borderColor="gray.700" borderWidth="1px">
                                            <CardBody py={3}>
                                                <Flex justify="space-between" align="center">
                                                    <HStack spacing={3}>
                                                        <Box p={2} bg="purple.500" borderRadius="md">
                                                            <Icon as={Timer} color="white" boxSize={4} />
                                                        </Box>
                                                        <Box>
                                                            <Text fontWeight="500" color="gray.100">Express Delivery</Text>
                                                            <Text fontSize="xs" color="gray.500">20-30 minutes (+₦300)</Text>
                                                        </Box>
                                                    </HStack>
                                                    <Badge colorScheme="green">Active</Badge>
                                                </Flex>
                                            </CardBody>
                                        </Card>

                                        {/* Scheduled Delivery */}
                                        <Card bg="gray.800" borderColor="gray.700" borderWidth="1px">
                                            <CardBody py={3}>
                                                <Flex justify="space-between" align="center">
                                                    <HStack spacing={3}>
                                                        <Box p={2} bg="gray.600" borderRadius="md">
                                                            <Icon as={Clock} color="white" boxSize={4} />
                                                        </Box>
                                                        <Box>
                                                            <Text fontWeight="500" color="gray.100">Scheduled Delivery</Text>
                                                            <Text fontSize="xs" color="gray.500">User picks time slot</Text>
                                                        </Box>
                                                    </HStack>
                                                    <Badge colorScheme="gray">Inactive</Badge>
                                                </Flex>
                                            </CardBody>
                                        </Card>
                                    </VStack>
                                </Box>
                            </Box>
                        </SimpleGrid>

                        {/* Delivery Metrics */}
                        <Box bg="gray.900" borderRadius="xl" borderWidth="1px" borderColor="gray.800" p={4} mt={6}>
                            <Text fontWeight="600" color="gray.100" mb={4}>Delivery Metrics</Text>
                            <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4}>
                                <Card bg="gray.800" borderColor="gray.700" borderWidth="1px">
                                    <CardBody py={3} textAlign="center">
                                        <Icon as={CheckCircle} color="green.400" boxSize={6} mb={2} />
                                        <Text fontSize="2xl" fontWeight="bold" color="gray.100">95%</Text>
                                        <Text fontSize="xs" color="gray.500">On-time Delivery</Text>
                                    </CardBody>
                                </Card>
                                <Card bg="gray.800" borderColor="gray.700" borderWidth="1px">
                                    <CardBody py={3} textAlign="center">
                                        <Icon as={Timer} color="blue.400" boxSize={6} mb={2} />
                                        <Text fontSize="2xl" fontWeight="bold" color="gray.100">32min</Text>
                                        <Text fontSize="xs" color="gray.500">Avg Delivery Time</Text>
                                    </CardBody>
                                </Card>
                                <Card bg="gray.800" borderColor="gray.700" borderWidth="1px">
                                    <CardBody py={3} textAlign="center">
                                        <Icon as={AlertCircle} color="yellow.400" boxSize={6} mb={2} />
                                        <Text fontSize="2xl" fontWeight="bold" color="gray.100">2%</Text>
                                        <Text fontSize="xs" color="gray.500">Failed Deliveries</Text>
                                    </CardBody>
                                </Card>
                                <Card bg="gray.800" borderColor="gray.700" borderWidth="1px">
                                    <CardBody py={3} textAlign="center">
                                        <Icon as={TrendingUp} color="purple.400" boxSize={6} mb={2} />
                                        <Text fontSize="2xl" fontWeight="bold" color="gray.100">4.8</Text>
                                        <Text fontSize="xs" color="gray.500">Avg Rating</Text>
                                    </CardBody>
                                </Card>
                            </SimpleGrid>
                        </Box>
                    </TabPanel>
                </TabPanels>
            </Tabs>

            {/* Add Rider Modal - Full Form */}
            <Modal isOpen={isAddRiderOpen} onClose={onAddRiderClose} size="6xl" scrollBehavior="inside">
                <ModalOverlay />
                <ModalContent bg="gray.900" color="gray.100" maxH="90vh">
                    <ModalHeader borderBottomWidth="1px" borderColor="gray.800">
                        <Text fontSize="xl" fontWeight="bold">Add New Rider</Text>
                        <Text fontSize="sm" color="gray.500" fontWeight="normal">Create a new rider profile and set up their delivery zone</Text>
                    </ModalHeader>
                    <ModalCloseButton />
                    <ModalBody pb={6}>
                        <Flex gap={6} flexDir={{ base: 'column', lg: 'row' }}>
                            {/* Left Column - Forms */}
                            <Box flex={2}>
                                {/* Rider Information */}
                                <Box bg="gray.800" borderRadius="lg" p={4} mb={4}>
                                    <Text fontWeight="600" color="gray.100" mb={4}>Rider Information</Text>
                                    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                                        <FormControl>
                                            <FormLabel fontSize="sm" color="gray.400">Full Name</FormLabel>
                                            <Input bg="gray.900" borderColor="gray.700" placeholder="Enter full name" />
                                        </FormControl>
                                        <FormControl>
                                            <FormLabel fontSize="sm" color="gray.400">First Name</FormLabel>
                                            <Input bg="gray.900" borderColor="gray.700" placeholder="Enter first name" />
                                        </FormControl>
                                        <FormControl>
                                            <FormLabel fontSize="sm" color="gray.400">Last Name</FormLabel>
                                            <Input bg="gray.900" borderColor="gray.700" placeholder="Enter last name" />
                                        </FormControl>
                                        <FormControl>
                                            <FormLabel fontSize="sm" color="gray.400">Phone Number</FormLabel>
                                            <Input bg="gray.900" borderColor="gray.700" placeholder="Add Number" />
                                        </FormControl>
                                        <FormControl>
                                            <FormLabel fontSize="sm" color="gray.400">Email Address</FormLabel>
                                            <Input bg="gray.900" borderColor="gray.700" placeholder="Add Email here" type="email" />
                                        </FormControl>
                                        <FormControl>
                                            <FormLabel fontSize="sm" color="gray.400">Date of Birth</FormLabel>
                                            <Input bg="gray.900" borderColor="gray.700" type="date" />
                                        </FormControl>
                                        <FormControl>
                                            <FormLabel fontSize="sm" color="gray.400">Gender</FormLabel>
                                            <Select bg="gray.900" borderColor="gray.700">
                                                <option value="">Select gender</option>
                                                <option value="male">Male</option>
                                                <option value="female">Female</option>
                                            </Select>
                                        </FormControl>
                                        <FormControl>
                                            <FormLabel fontSize="sm" color="gray.400">Vehicle Id</FormLabel>
                                            <Input bg="gray.900" borderColor="gray.700" placeholder="Enter vehicle ID" />
                                        </FormControl>
                                    </SimpleGrid>
                                </Box>

                                {/* Address Information */}
                                <Box bg="gray.800" borderRadius="lg" p={4} mb={4}>
                                    <Text fontWeight="600" color="gray.100" mb={4}>Address Information</Text>
                                    <VStack spacing={4} align="stretch">
                                        <FormControl>
                                            <FormLabel fontSize="sm" color="gray.400">Street Address</FormLabel>
                                            <Input bg="gray.900" borderColor="gray.700" placeholder="Enter street address" />
                                        </FormControl>
                                        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                                            <FormControl>
                                                <FormLabel fontSize="sm" color="gray.400">City</FormLabel>
                                                <Select bg="gray.900" borderColor="gray.700">
                                                    <option value="">Select city</option>
                                                    <option value="lagos">Lagos</option>
                                                    <option value="abuja">Abuja</option>
                                                    <option value="minna">Minna</option>
                                                </Select>
                                            </FormControl>
                                            <FormControl>
                                                <FormLabel fontSize="sm" color="gray.400">State</FormLabel>
                                                <Select bg="gray.900" borderColor="gray.700">
                                                    <option value="">Select state</option>
                                                    <option value="lagos">Lagos</option>
                                                    <option value="fct">FCT</option>
                                                    <option value="niger">Niger</option>
                                                </Select>
                                            </FormControl>
                                        </SimpleGrid>
                                    </VStack>
                                </Box>

                                {/* Vehicle Information */}
                                <Box bg="gray.800" borderRadius="lg" p={4} mb={4}>
                                    <Text fontWeight="600" color="gray.100" mb={4}>Vehicle Information</Text>
                                    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                                        <FormControl>
                                            <FormLabel fontSize="sm" color="gray.400">Vehicle Type</FormLabel>
                                            <Select bg="gray.900" borderColor="gray.700">
                                                <option value="">Select vehicle type</option>
                                                <option value="motorcycle">Motorcycle</option>
                                                <option value="bicycle">Bicycle</option>
                                                <option value="car">Car</option>
                                                <option value="van">Van</option>
                                            </Select>
                                        </FormControl>
                                        <FormControl>
                                            <FormLabel fontSize="sm" color="gray.400">Vehicle Model</FormLabel>
                                            <Input bg="gray.900" borderColor="gray.700" placeholder="e.g., Honda CB150" />
                                        </FormControl>
                                        <FormControl>
                                            <FormLabel fontSize="sm" color="gray.400">License Plate</FormLabel>
                                            <Input bg="gray.900" borderColor="gray.700" placeholder="ABC-123-XY" />
                                        </FormControl>
                                        <FormControl>
                                            <FormLabel fontSize="sm" color="gray.400">Vehicle Color</FormLabel>
                                            <Input bg="gray.900" borderColor="gray.700" placeholder="e.g., Red" />
                                        </FormControl>
                                    </SimpleGrid>
                                </Box>

                                {/* Banking Information */}
                                <Box bg="gray.800" borderRadius="lg" p={4}>
                                    <Text fontWeight="600" color="gray.100" mb={4}>Banking Information</Text>
                                    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                                        <FormControl>
                                            <FormLabel fontSize="sm" color="gray.400">Bank Name</FormLabel>
                                            <Select bg="gray.900" borderColor="gray.700">
                                                <option value="">Select bank</option>
                                                <option value="gtb">GTBank</option>
                                                <option value="access">Access Bank</option>
                                                <option value="uba">UBA</option>
                                                <option value="zenith">Zenith Bank</option>
                                                <option value="firstbank">First Bank</option>
                                            </Select>
                                        </FormControl>
                                        <FormControl>
                                            <FormLabel fontSize="sm" color="gray.400">Account Number</FormLabel>
                                            <Input bg="gray.900" borderColor="gray.700" placeholder="0123456789" />
                                        </FormControl>
                                        <FormControl gridColumn={{ md: 'span 2' }}>
                                            <FormLabel fontSize="sm" color="gray.400">Account Name</FormLabel>
                                            <Input bg="gray.900" borderColor="gray.700" placeholder="Account holder name" />
                                        </FormControl>
                                    </SimpleGrid>
                                </Box>
                            </Box>

                            {/* Right Column - Documents & Zone Assignment */}
                            <Box flex={1}>
                                {/* Required Documents */}
                                <Box bg="gray.800" borderRadius="lg" p={4} mb={4}>
                                    <Text fontWeight="600" color="gray.100" mb={4}>Required Documents</Text>
                                    <VStack spacing={3} align="stretch">
                                        {/* Profile Photo */}
                                        <Box
                                            borderWidth="2px"
                                            borderStyle="dashed"
                                            borderColor="gray.600"
                                            borderRadius="lg"
                                            p={4}
                                            textAlign="center"
                                            cursor="pointer"
                                            _hover={{ borderColor: 'purple.500' }}
                                        >
                                            <Icon as={Eye} color="gray.500" boxSize={6} mb={2} />
                                            <Text color="purple.400" fontSize="sm" fontWeight="500">Profile Photo</Text>
                                            <Text color="gray.500" fontSize="xs">Click to upload photo</Text>
                                        </Box>

                                        {/* National ID */}
                                        <Box
                                            borderWidth="2px"
                                            borderStyle="dashed"
                                            borderColor="gray.600"
                                            borderRadius="lg"
                                            p={4}
                                            textAlign="center"
                                            cursor="pointer"
                                            _hover={{ borderColor: 'purple.500' }}
                                        >
                                            <Icon as={Eye} color="gray.500" boxSize={6} mb={2} />
                                            <Text color="purple.400" fontSize="sm" fontWeight="500">National ID (NIN)</Text>
                                            <Text color="gray.500" fontSize="xs">Upload NIN document</Text>
                                        </Box>

                                        {/* Driver's License */}
                                        <Box
                                            borderWidth="2px"
                                            borderStyle="dashed"
                                            borderColor="gray.600"
                                            borderRadius="lg"
                                            p={4}
                                            textAlign="center"
                                            cursor="pointer"
                                            _hover={{ borderColor: 'purple.500' }}
                                        >
                                            <Icon as={Eye} color="gray.500" boxSize={6} mb={2} />
                                            <Text color="purple.400" fontSize="sm" fontWeight="500">Driver's License</Text>
                                            <Text color="gray.500" fontSize="xs">Upload license</Text>
                                        </Box>

                                        {/* Vehicle Papers */}
                                        <Box
                                            borderWidth="2px"
                                            borderStyle="dashed"
                                            borderColor="gray.600"
                                            borderRadius="lg"
                                            p={4}
                                            textAlign="center"
                                            cursor="pointer"
                                            _hover={{ borderColor: 'purple.500' }}
                                        >
                                            <Icon as={Truck} color="gray.500" boxSize={6} mb={2} />
                                            <Text color="purple.400" fontSize="sm" fontWeight="500">Vehicle Papers</Text>
                                            <Text color="gray.500" fontSize="xs">Upload vehicle documents</Text>
                                        </Box>
                                    </VStack>
                                </Box>

                                {/* Zone Assignment */}
                                <Box bg="gray.800" borderRadius="lg" p={4} mb={4}>
                                    <Text fontWeight="600" color="gray.100" mb={4}>Zone Assignment</Text>
                                    <VStack spacing={4} align="stretch">
                                        <FormControl>
                                            <FormLabel fontSize="sm" color="gray.400">Primary Zone</FormLabel>
                                            <Select bg="gray.900" borderColor="gray.700">
                                                <option value="">Select zone</option>
                                                <option value="zone-a">Zone A - Central</option>
                                                <option value="zone-b">Zone B - Mainland</option>
                                                <option value="zone-c">Zone C - Outskirts</option>
                                            </Select>
                                        </FormControl>

                                        <Box>
                                            <Text fontSize="sm" color="gray.400" mb={2}>Secondary Zones</Text>
                                            <VStack align="start" spacing={2}>
                                                <HStack>
                                                    <input type="checkbox" id="vi" />
                                                    <label htmlFor="vi"><Text fontSize="sm" color="gray.300">Victoria Island</Text></label>
                                                </HStack>
                                                <HStack>
                                                    <input type="checkbox" id="ikeja" />
                                                    <label htmlFor="ikeja"><Text fontSize="sm" color="gray.300">Ikeja</Text></label>
                                                </HStack>
                                                <HStack>
                                                    <input type="checkbox" id="lekki" />
                                                    <label htmlFor="lekki"><Text fontSize="sm" color="gray.300">Lekki</Text></label>
                                                </HStack>
                                            </VStack>
                                        </Box>

                                        <Box>
                                            <Text fontSize="sm" color="gray.400" mb={2}>Working Hours</Text>
                                            <HStack>
                                                <Input bg="gray.900" borderColor="gray.700" type="time" defaultValue="08:00" size="sm" />
                                                <Input bg="gray.900" borderColor="gray.700" type="time" defaultValue="18:00" size="sm" />
                                            </HStack>
                                        </Box>
                                    </VStack>
                                </Box>

                                {/* Action Buttons */}
                                <VStack spacing={3}>
                                    <Button colorScheme="purple" w="full" leftIcon={<Plus size={16} />}>
                                        Create Rider
                                    </Button>
                                    <Button variant="outline" borderColor="gray.600" w="full">
                                        Save as Draft
                                    </Button>
                                    <Button variant="ghost" w="full" onClick={onAddRiderClose}>
                                        Cancel
                                    </Button>
                                </VStack>
                            </Box>
                        </Flex>
                    </ModalBody>
                </ModalContent>
            </Modal>

            {/* View Rider Details Modal */}
            <Modal isOpen={isViewRiderOpen} onClose={onViewRiderClose} size="4xl">
                <ModalOverlay />
                <ModalContent bg="gray.900" borderColor="gray.800" borderWidth="1px">
                    <ModalHeader color="gray.100">Rider Details</ModalHeader>
                    <ModalCloseButton color="gray.400" />
                    <ModalBody pb={6}>
                        {selectedRider && (
                            <Flex gap={6}>
                                {/* Left Column */}
                                <Box flex={2}>
                                    {/* Basic Information */}
                                    <Box bg="gray.800" borderRadius="lg" p={4} mb={4}>
                                        <Flex align="center" gap={4} mb={4}>
                                            <Avatar
                                                size="lg"
                                                name={selectedRider.name}
                                                bg="purple.600"
                                                color="white"
                                            />
                                            <Box>
                                                <Text fontSize="lg" fontWeight="600" color="gray.100">
                                                    {selectedRider.name}
                                                </Text>
                                                <Text fontSize="sm" color="purple.400">
                                                    Rider ID{selectedRider.riderId}
                                                </Text>
                                                <Badge
                                                    colorScheme={
                                                        selectedRider.status === 'active' ? 'green' :
                                                            selectedRider.status === 'busy' ? 'yellow' : 'gray'
                                                    }
                                                    variant="subtle"
                                                    mt={1}
                                                >
                                                    {(selectedRider.status || 'Unknown').charAt(0).toUpperCase() + (selectedRider.status || 'unknown').slice(1)}
                                                </Badge>
                                            </Box>
                                        </Flex>

                                        <SimpleGrid columns={2} spacing={4}>
                                            <Box>
                                                <Text fontSize="xs" color="gray.500" mb={1}>Phone Number</Text>
                                                <Text fontSize="sm" color="gray.100">{selectedRider.phone}</Text>
                                            </Box>
                                            <Box>
                                                <Text fontSize="xs" color="gray.500" mb={1}>Email Address</Text>
                                                <Text fontSize="sm" color="gray.100">{selectedRider.email}</Text>
                                            </Box>
                                        </SimpleGrid>
                                    </Box>

                                    {/* Vehicle Information */}
                                    <Box bg="gray.800" borderRadius="lg" p={4} mb={4}>
                                        <Text fontWeight="600" color="gray.100" mb={4}>Vehicle Information</Text>
                                        <SimpleGrid columns={2} spacing={4}>
                                            <Box>
                                                <Text fontSize="xs" color="gray.500" mb={1}>Vehicle Type</Text>
                                                <HStack spacing={1}>
                                                    <Icon as={Bike} color="green.400" boxSize={4} />
                                                    <Text fontSize="sm" color="gray.100">{selectedRider.vehicleType}</Text>
                                                </HStack>
                                            </Box>
                                            <Box>
                                                <Text fontSize="xs" color="gray.500" mb={1}>Vehicle ID</Text>
                                                <Text fontSize="sm" color="purple.400">{selectedRider.vehicleId}</Text>
                                            </Box>
                                        </SimpleGrid>
                                    </Box>

                                    {/* Company Information */}
                                    <Box bg="gray.800" borderRadius="lg" p={4} mb={4}>
                                        <Text fontWeight="600" color="gray.100" mb={4}>Company Information</Text>
                                        <Box>
                                            <Text fontSize="xs" color="gray.500" mb={1}>Company ID</Text>
                                            <Text fontSize="sm" color="gray.100">{selectedRider.companyId}</Text>
                                        </Box>
                                    </Box>

                                    {/* Earnings Information */}
                                    <Box bg="gray.800" borderRadius="lg" p={4}>
                                        <Text fontWeight="600" color="gray.100" mb={4}>Lifetime Earnings</Text>
                                        <Box>
                                            <Text fontSize="xs" color="gray.500" mb={1}>Total Money Made</Text>
                                            <Text fontSize="2xl" fontWeight="bold" color="green.400">
                                                {formatCurrency(
                                                    selectedRider.totalEarnings ||
                                                    getRiderLifetimeEarnings(selectedRider.id || selectedRider.riderId)
                                                )}
                                            </Text>
                                            <Text fontSize="xs" color="gray.500" mt={1}>
                                                Calculated from {orders.filter((o: any) => {
                                                    const rid = o.ttrRideId || o.riderId;
                                                    const matches = rid && (String(rid) === String(selectedRider.id) || String(rid) === String(selectedRider.riderId));
                                                    const status = String(getLatestStatus(o) || '').toUpperCase();
                                                    return matches && status === 'DELIVERED';
                                                }).length} completed deliveries
                                            </Text>
                                        </Box>
                                    </Box>
                                </Box>
                            </Flex>
                        )}
                    </ModalBody>
                </ModalContent>
            </Modal>

            {/* View Order Details Modal */}
            <Modal isOpen={isViewOrderOpen} onClose={onViewOrderClose} size="xl" scrollBehavior="inside">
                <ModalOverlay />
                <ModalContent bg="gray.900" color="gray.100">
                    <ModalHeader fontSize="xl" fontWeight="bold" borderBottomWidth="1px" borderColor="gray.800">
                        Order Details
                    </ModalHeader>
                    <ModalCloseButton />
                    <ModalBody pb={6}>
                        {selectedOrder && (
                            <VStack spacing={5} align="stretch">
                                {/* Top Info Row */}
                                <Flex justify="space-between" gap={8} flexWrap="wrap">
                                    <Box flex={1}>
                                        <Text fontWeight="600" color="gray.400">Order ID: <Text as="span" fontWeight="normal" color="gray.100">{selectedOrder.id}</Text></Text>
                                        <Text fontWeight="600" color="gray.400">Total Items: <Text as="span" fontWeight="normal" color="purple.400">{selectedOrder.totalItems}</Text></Text>
                                        <Text fontWeight="600" color="gray.400">Total Amount: <Text as="span" fontWeight="normal" color="green.400">{formatCurrency(selectedOrder.totalAmount)}</Text></Text>
                                    </Box>
                                    <Box flex={1}>
                                        <Text fontWeight="600" color="gray.400">Customer: <Text as="span" fontWeight="normal" color="gray.100">{formatFullName(selectedOrder.user?.firstName, selectedOrder.user?.lastName)}</Text></Text>
                                        <Text fontWeight="600" color="gray.400">Phone: <Text as="span" fontWeight="normal" color="gray.100">{selectedOrder.user?.mobile || '--'}</Text></Text>
                                        <HStack spacing={2}>
                                            <Text fontWeight="600" color="gray.400">Status:</Text>
                                            <StatusPill status={getLatestStatus(selectedOrder)} />
                                        </HStack>
                                    </Box>
                                </Flex>

                                {/* Address Card */}
                                <Card bg="gray.800" borderColor="gray.700" borderWidth="1px">
                                    <CardBody>
                                        <Text fontWeight="600" mb={2} color="gray.100">Delivery Address</Text>
                                        <Text color="gray.400"><Text as="span" fontWeight="500" color="gray.300">Drop-off Location:</Text> {selectedOrder.dropOffLocationAddress || '--'}</Text>
                                        <Text color="gray.400"><Text as="span" fontWeight="500" color="gray.300">Full Address:</Text> {selectedOrder.fullHouseAddress || '--'}</Text>

                                        {/* Merchant Info */}
                                        <Divider my={3} borderColor="gray.700" />
                                        <Text fontWeight="600" color="purple.400">Pickup Store: <Text as="span" fontWeight="normal" color="gray.100">{selectedOrder.store?.name || '--'}</Text></Text>
                                        <Text fontWeight="600" color="purple.400">Store Phone: <Text as="span" fontWeight="normal" color="gray.100">{selectedOrder.store?.mobile || '--'}</Text></Text>
                                    </CardBody>
                                </Card>

                                {/* Items */}
                                <Box>
                                    <Text fontWeight="600" mb={2} color="gray.100">Items</Text>
                                    <Card bg="gray.800" borderColor="gray.700" borderWidth="1px">
                                        <CardBody>
                                            {selectedOrder.orderItems && selectedOrder.orderItems.length > 0 ? (
                                                selectedOrder.orderItems.map((item: any, idx: number) => (
                                                    <Flex key={idx} justify="space-between" py={1}>
                                                        <Text color="gray.300">{item.name || 'Item'} x {item.quantity}</Text>
                                                        <Text fontWeight="500" color="gray.100">{formatCurrency(item.price * item.quantity)}</Text>
                                                    </Flex>
                                                ))
                                            ) : (
                                                <Text color="gray.500">No items found</Text>
                                            )}
                                        </CardBody>
                                    </Card>
                                </Box>

                                {/* Amount Breakdown */}
                                <Card bg="gray.800" borderColor="gray.700" borderWidth="1px">
                                    <CardBody>
                                        <Text fontWeight="600" color="gray.400">Total Amount: <Text as="span" fontWeight="normal" color="gray.100">{formatCurrency(selectedOrder.totalAmount)}</Text></Text>
                                        <Text fontWeight="600" color="gray.400">Amount Before Charges: <Text as="span" fontWeight="normal" color="gray.100">{formatCurrency(selectedOrder.totalAmountBeforeCharges)}</Text></Text>
                                        <Text fontWeight="600" color="gray.400">Charges: <Text as="span" fontWeight="normal" color="gray.100">{formatCurrency(selectedOrder.Charges)}</Text></Text>
                                    </CardBody>
                                </Card>

                                {/* Rider Assignment */}
                                <Card bg="gray.800" borderColor="gray.700" borderWidth="1px">
                                    <CardBody>
                                        <Text fontWeight="600" mb={2} color="gray.100">Rider Assignment</Text>
                                        <Text color="gray.400">
                                            {getRiderName(selectedOrder)}
                                        </Text>
                                    </CardBody>
                                </Card>

                                {/* Tracking */}
                                <Box>
                                    <Text fontWeight="600" mb={2} color="gray.100">Tracking</Text>
                                    <VStack align="stretch" spacing={2}>
                                        {selectedOrder.orderTracking && selectedOrder.orderTracking.length > 0 ? (
                                            [...selectedOrder.orderTracking]
                                                .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                                                .map((tracking: any, idx: number) => (
                                                    <Card key={idx} bg="gray.800" borderColor="gray.700" borderWidth="1px">
                                                        <CardBody py={3}>
                                                            <Flex justify="space-between" align="center">
                                                                <Badge
                                                                    colorScheme={
                                                                        tracking.orderStatus === 'DELIVERED' ? 'green' :
                                                                            tracking.orderStatus === 'CANCELLED' ? 'red' : 'yellow'
                                                                    }
                                                                    variant="subtle"
                                                                >
                                                                    {tracking.orderStatus}
                                                                </Badge>
                                                                <Text fontSize="sm" color="gray.500">
                                                                    {new Date(tracking.createdAt).toLocaleString()}
                                                                </Text>
                                                            </Flex>
                                                        </CardBody>
                                                    </Card>
                                                ))
                                        ) : (
                                            <Text color="gray.500" fontSize="sm">No tracking history</Text>
                                        )}
                                    </VStack>
                                </Box>
                            </VStack>
                        )}
                    </ModalBody>
                </ModalContent>
            </Modal>
        </Box>
    );
};

export default LogisticsPage;
