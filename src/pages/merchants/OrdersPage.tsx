import React, { useState } from 'react';
import {
    Box,
    Flex,
    Heading,
    Text,
    Button,
    HStack,
    Select,
    Input,
    InputGroup,
    InputLeftElement,
    Icon,
    IconButton,
    useDisclosure,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalCloseButton,
    VStack,
    Badge,
    Divider,
    useToast,
    Table,
    Thead,
    Tbody,
    Tr,
    Th,
    Td,
    Spinner,
    Card,
    CardBody,
    Tooltip,
} from '@chakra-ui/react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    Search,
    RefreshCw,
    Eye,
    Edit,
    MoreVertical,
    ShoppingCart,
    Clock,
    CheckCircle,
    TrendingUp,
    Filter,
    Download,
    ChevronLeft,
    ChevronRight,
} from 'lucide-react';
import { ordersApi } from '../../api/orders.api';
import { adminApi } from '../../api/admin.api';
import { storesApi } from '../../api/stores.api';
import { usersApi } from '../../api/users.api';
import { StatusPill } from '../../components/common/StatusPill';
import { Order, OrderStatus } from '../../types/order.types';
import { formatCurrency, formatFullName } from '../../utils/formatters';
import { useLocationFilter, matchesLocationFilter } from '../../context/LocationContext';

interface OrdersPageProps {
    categoryFilter?: string;
    title?: string;
}

export const OrdersPage: React.FC<OrdersPageProps> = ({
    categoryFilter,
    title = 'Recent Orders'
}) => {
    const [statusFilter, setStatusFilter] = useState<string>('');
    const [businessTypeFilter, setBusinessTypeFilter] = useState<string>('');
    const [deliveryFilter, setDeliveryFilter] = useState<string>('');
    const [dateFrom, setDateFrom] = useState<string>('');
    const [dateTo, setDateTo] = useState<string>('');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [editingOrder, setEditingOrder] = useState<Order | null>(null);
    const [newStatus, setNewStatus] = useState<string>('PENDING');
    const [assigningOrder, setAssigningOrder] = useState<Order | null>(null);
    const [assigningRiderId, setAssigningRiderId] = useState<number | null>(null);

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const { isOpen: isViewOpen, onOpen: onViewOpen, onClose: onViewClose } = useDisclosure();
    const { isOpen: isEditOpen, onOpen: onEditOpen, onClose: onEditClose } = useDisclosure();
    const { isOpen: isAssignOpen, onOpen: onAssignOpen, onClose: onAssignClose } = useDisclosure();

    const toast = useToast();
    const queryClient = useQueryClient();
    const { selectedLocation } = useLocationFilter();

    // Fetch all orders
    const { data: ordersData, isLoading, refetch } = useQuery({
        queryKey: ['orders', categoryFilter],
        queryFn: () => ordersApi.getAllOrders({
            storeCategory: categoryFilter,
        }),
        retry: false,
    });

    // Fetch all riders for assignment
    const { data: ridersData } = useQuery({
        queryKey: ['riders'],
        queryFn: () => adminApi.getAllRiders(),
        retry: false,
    });

    // Update order status mutation
    const updateStatusMutation = useMutation({
        mutationFn: ({ orderId, status }: { orderId: string; status: OrderStatus }) =>
            ordersApi.updateOrderStatus(orderId, { status }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['orders'] });
            toast({ title: 'Order status updated', status: 'success', duration: 2000 });
            onEditClose();
        },
        onError: () => {
            toast({ title: 'Failed to update order status', status: 'error', duration: 3000 });
        },
    });

    // Assign rider mutation
    const assignRiderMutation = useMutation({
        mutationFn: ({ orderId, riderId }: { orderId: string; riderId: number }) =>
            adminApi.assignRiderToOrder(orderId, riderId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['orders'] });
            toast({ title: 'Rider assigned successfully', status: 'success', duration: 2000 });
            setAssigningRiderId(null);
            onAssignClose();
        },
        onError: (error: any) => {
            const errorMessage = error?.response?.data?.message || error?.message || 'Failed to assign rider';
            toast({ title: errorMessage, status: 'error', duration: 4000 });
            setAssigningRiderId(null);
        },
    });

    const rawOrders = ordersData?.data || [];

    // State for enriched data cache
    const [storesCache, setStoresCache] = React.useState<Record<string, any>>({});
    const [usersCache, setUsersCache] = React.useState<Record<string, any>>({});
    const fetchedStoresRef = React.useRef<Set<string>>(new Set());
    const fetchedUsersRef = React.useRef<Set<string>>(new Set());

    // Fetch store and user details for orders
    React.useEffect(() => {
        const fetchEnrichmentData = async () => {
            if (rawOrders.length === 0) return;

            // Get unique store and user IDs that we haven't already tried to fetch
            const storeIds = [...new Set(rawOrders.map((o: any) => o.storeId).filter(Boolean))] as string[];
            const userIds = [...new Set(rawOrders.map((o: any) => o.userId).filter(Boolean))] as string[];

            const storesToFetch = storeIds.filter(id => !fetchedStoresRef.current.has(id));
            const usersToFetch = userIds.filter(id => !fetchedUsersRef.current.has(id));

            // Fetch stores
            if (storesToFetch.length > 0) {
                const newStoreData: Record<string, any> = {};
                for (const storeId of storesToFetch) {
                    fetchedStoresRef.current.add(storeId);
                    try {
                        const response = await storesApi.getStore(storeId);
                        if (response?.data) {
                            newStoreData[storeId] = response.data;
                        }
                    } catch (e) {
                        // Silently handle store fetch errors
                    }
                }
                if (Object.keys(newStoreData).length > 0) {
                    setStoresCache(prev => ({ ...prev, ...newStoreData }));
                }
            }

            // Fetch users
            if (usersToFetch.length > 0) {
                const newUserData: Record<string, any> = {};
                for (const userId of usersToFetch) {
                    fetchedUsersRef.current.add(userId);
                    try {
                        const response = await usersApi.getUserById(userId);
                        // Handle both raw user object and StandardResponse wrapped
                        const userData = response?.data || response;
                        if (userData && (userData.firstName || userData.id)) {
                            newUserData[userId] = userData;
                        }
                    } catch (e) {
                        // Silently handle user fetch errors
                    }
                }
                if (Object.keys(newUserData).length > 0) {
                    setUsersCache(prev => ({ ...prev, ...newUserData }));
                }
            }
        };

        fetchEnrichmentData();
    }, [rawOrders]);

    // Enrich orders with cached store and user data
    const orders = rawOrders.map((order: any) => ({
        ...order,
        store: storesCache[order.storeId] || null,
        user: usersCache[order.userId] || null,
    }));

    // Extract riders - handle TrackThatRide API response format
    const ridersRaw = ridersData?.data as any;
    const riders = Array.isArray(ridersRaw)
        ? ridersRaw
        : (ridersRaw?.drivers || ridersRaw?.data || []);

    function getLatestStatus(order: Order): string {
        if (!order.orderTracking || order.orderTracking.length === 0) return 'PENDING';
        const sorted = [...order.orderTracking].sort((a: any, b: any) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        return sorted[0]?.orderStatus || sorted[0]?.status || 'PENDING';
    }

    // Helper to get specific charge from order
    function getChargeByName(order: Order, chargeName: string): number {
        if (!order.orderCharges?.chargeNodes) return 0;
        const chargeNode = order.orderCharges.chargeNodes.find(
            (node) => node.name?.toLowerCase() === chargeName.toLowerCase()
        );
        return chargeNode ? Number(chargeNode.amount) || 0 : 0;
    }

    function getDeliveryFee(order: Order): number {
        return getChargeByName(order, 'deliveryFee');
    }

    function getServiceFee(order: Order): number {
        return getChargeByName(order, 'serviceFee');
    }

    // Filter orders locally
    const filteredOrders = orders.filter((order: Order) => {
        const latestStatus = getLatestStatus(order);
        const orderDate = new Date(order.createdAt);
        const matchesStatus = !statusFilter || latestStatus.toUpperCase() === statusFilter.toUpperCase();
        const matchesBusinessType = !businessTypeFilter || order.type?.toUpperCase() === businessTypeFilter.toUpperCase();
        // Use global location filter from context
        const matchesLocation = matchesLocationFilter(order.dropOffLocationAddress, selectedLocation);
        const matchesDelivery = !deliveryFilter ||
            (deliveryFilter === 'assigned' && !!order.ttrRideId) ||
            (deliveryFilter === 'unassigned' && !order.ttrRideId);
        const matchesDateFrom = !dateFrom || orderDate >= new Date(dateFrom);
        const matchesDateTo = !dateTo || orderDate <= new Date(dateTo + 'T23:59:59');

        // Enhanced search across all table fields
        const searchLower = searchQuery.toLowerCase();
        const matchesSearch = !searchQuery ||
            order.id?.toLowerCase()?.includes(searchLower) ||
            order.fullHouseAddress?.toLowerCase()?.includes(searchLower) ||
            order.dropOffLocationAddress?.toLowerCase()?.includes(searchLower) ||
            order.store?.name?.toLowerCase()?.includes(searchLower) ||
            order.store?.mobile?.toLowerCase()?.includes(searchLower) ||
            order.user?.mobile?.toLowerCase()?.includes(searchLower) ||
            order.user?.firstName?.toLowerCase()?.includes(searchLower) ||
            order.user?.lastName?.toLowerCase()?.includes(searchLower);

        return matchesStatus && matchesBusinessType && matchesLocation && matchesDelivery && matchesDateFrom && matchesDateTo && matchesSearch;
    });

    // Stats calculation - based on filtered orders so filters apply to stats too
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    // If date filters are applied, use filtered orders for stats; otherwise use today's logic
    const hasDateFilter = dateFrom || dateTo;

    // Total orders in period (filtered or today)
    const ordersInPeriod = hasDateFilter
        ? filteredOrders
        : orders.filter((o: Order) => new Date(o.createdAt) >= today);

    // Previous period for comparison
    const ordersPreviousPeriod = hasDateFilter
        ? [] // No comparison when custom date range is set
        : orders.filter((o: Order) => {
            const d = new Date(o.createdAt);
            return d >= yesterday && d < today;
        });

    // Status-based stats - now filter by period (today or filtered)
    const pendingOrdersInPeriod = ordersInPeriod.filter((o: Order) => getLatestStatus(o).toUpperCase() === 'PENDING');
    const completedOrdersInPeriod = ordersInPeriod.filter((o: Order) => getLatestStatus(o).toUpperCase() === 'DELIVERED');

    // Previous period stats for comparison
    const pendingOrdersPrevious = ordersPreviousPeriod.filter((o: Order) => getLatestStatus(o).toUpperCase() === 'PENDING');
    const completedOrdersPrevious = ordersPreviousPeriod.filter((o: Order) => getLatestStatus(o).toUpperCase() === 'DELIVERED');

    // Revenue stats
    const revenueInPeriod = ordersInPeriod.reduce((sum: number, o: Order) => sum + (parseFloat(String(o.totalAmount)) || 0), 0);
    const revenuePreviousPeriod = ordersPreviousPeriod.reduce((sum: number, o: Order) => sum + (parseFloat(String(o.totalAmount)) || 0), 0);

    // Completion rate based on orders in period
    const completionRate = ordersInPeriod.length > 0 ? Math.round((completedOrdersInPeriod.length / ordersInPeriod.length) * 100) : 0;

    // Stats period label
    const statsPeriodLabel = hasDateFilter
        ? 'In Selected Period'
        : 'Today';

    // Pagination
    const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
    const paginatedOrders = filteredOrders.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const applyFilters = () => setCurrentPage(1);
    const clearFilters = () => {
        setStatusFilter('');
        setBusinessTypeFilter('');
        setDeliveryFilter('');
        setDateFrom('');
        setDateTo('');
        setSearchQuery('');
        setCurrentPage(1);
    };

    const handleViewOrder = (order: Order) => {
        setSelectedOrder(order);
        onViewOpen();
    };
    const handleEditOrder = (order: Order) => {
        setEditingOrder(order);
        setNewStatus(getLatestStatus(order));
        onEditOpen();
    };
    const handleAssignRider = (order: Order) => {
        setAssigningOrder(order);
        onAssignOpen();
    };
    const handleUpdateStatus = () => {
        if (editingOrder) {
            updateStatusMutation.mutate({ orderId: editingOrder.id, status: newStatus as OrderStatus });
        }
    };
    const handleAssignRiderToOrder = (riderId: number) => {
        if (assigningOrder) {
            setAssigningRiderId(riderId);
            assignRiderMutation.mutate({ orderId: assigningOrder.id, riderId });
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}, ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
    };

    return (
        <Box>
            {/* Header */}
            <Flex justify="space-between" align="center" mb={6}>
                <Heading size="lg" color="gray.100">{title}</Heading>
                <HStack spacing={3}>
                    <InputGroup maxW="250px">
                        <InputLeftElement>
                            <Icon as={Search} color="gray.500" boxSize={4} />
                        </InputLeftElement>
                        <Input
                            placeholder="Search orders..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            size="sm"
                            bg="gray.800"
                            borderColor="gray.700"
                        />
                    </InputGroup>
                    <IconButton
                        aria-label="Refresh"
                        icon={<RefreshCw size={16} />}
                        variant="ghost"
                        size="sm"
                        onClick={() => refetch()}
                    />
                </HStack>
            </Flex>

            {/* Stats Cards */}
            <Flex gap={4} mb={6} flexWrap="wrap">
                <Box flex="1" minW="200px" bg="gray.900" p={4} borderRadius="xl" borderWidth="1px" borderColor="gray.800">
                    <Flex justify="space-between" align="flex-start">
                        <Box>
                            <Text color="gray.500" fontSize="sm">Total Orders ({statsPeriodLabel})</Text>
                            <Text color="gray.100" fontSize="2xl" fontWeight="bold">{ordersInPeriod.length}</Text>
                            <Text color={ordersPreviousPeriod.length > 0 ? 'cyan.400' : 'gray.500'} fontSize="xs">
                                {hasDateFilter ? `${filteredOrders.length} total filtered` : ordersPreviousPeriod.length > 0 ? `${ordersPreviousPeriod.length} orders yesterday` : 'No orders yesterday'}
                            </Text>
                        </Box>
                        <Icon as={ShoppingCart} color="blue.400" boxSize={6} />
                    </Flex>
                </Box>
                <Box flex="1" minW="200px" bg="gray.900" p={4} borderRadius="xl" borderWidth="1px" borderColor="gray.800">
                    <Flex justify="space-between" align="flex-start">
                        <Box>
                            <Text color="gray.500" fontSize="sm">Pending Orders ({statsPeriodLabel})</Text>
                            <Text color="gray.100" fontSize="2xl" fontWeight="bold">{pendingOrdersInPeriod.length}</Text>
                            <Text color={hasDateFilter ? 'orange.400' : (pendingOrdersPrevious.length > 0 ? 'orange.400' : 'gray.500')} fontSize="xs">
                                {hasDateFilter
                                    ? `${pendingOrdersInPeriod.length} pending in selected period`
                                    : pendingOrdersPrevious.length > 0
                                        ? `${pendingOrdersPrevious.length} pending yesterday`
                                        : 'No pending yesterday'}
                            </Text>
                        </Box>
                        <Icon as={Clock} color="orange.400" boxSize={6} />
                    </Flex>
                </Box>
                <Box flex="1" minW="200px" bg="gray.900" p={4} borderRadius="xl" borderWidth="1px" borderColor="gray.800">
                    <Flex justify="space-between" align="flex-start">
                        <Box>
                            <Text color="gray.500" fontSize="sm">Completed ({statsPeriodLabel})</Text>
                            <Text color="gray.100" fontSize="2xl" fontWeight="bold">{completedOrdersInPeriod.length}</Text>
                            <Text color="teal.400" fontSize="xs">
                                {hasDateFilter
                                    ? `${completionRate}% completion rate`
                                    : completedOrdersPrevious.length > 0
                                        ? `${completedOrdersPrevious.length} completed yesterday`
                                        : `${completionRate}% completion rate`}
                            </Text>
                        </Box>
                        <Icon as={CheckCircle} color="teal.400" boxSize={6} />
                    </Flex>
                </Box>
                <Box flex="1" minW="200px" bg="gray.900" p={4} borderRadius="xl" borderWidth="1px" borderColor="gray.800">
                    <Flex justify="space-between" align="flex-start">
                        <Box>
                            <Text color="gray.500" fontSize="sm">Revenue ({statsPeriodLabel})</Text>
                            <Text color="gray.100" fontSize="2xl" fontWeight="bold">{formatCurrency(revenueInPeriod)}</Text>
                            <Text color={hasDateFilter ? 'purple.400' : (revenueInPeriod >= revenuePreviousPeriod ? 'green.400' : 'red.400')} fontSize="xs">
                                {hasDateFilter
                                    ? `Filtered period total`
                                    : revenuePreviousPeriod > 0
                                        ? `${revenueInPeriod >= revenuePreviousPeriod ? '+' : ''}${Math.round(((revenueInPeriod - revenuePreviousPeriod) / revenuePreviousPeriod) * 100)}% from yesterday`
                                        : '+0% from yesterday'}
                            </Text>
                        </Box>
                        <Icon as={TrendingUp} color="purple.400" boxSize={6} />
                    </Flex>
                </Box>
            </Flex>

            {/* Advanced Filters */}
            <Box bg="gray.900" p={4} borderRadius="xl" borderWidth="1px" borderColor="gray.800" mb={6}>
                <Flex gap={4} flexWrap="wrap" align="flex-end">
                    <Box minW="130px">
                        <Text color="gray.500" fontSize="xs" mb={1}>Business Type</Text>
                        <Select value={businessTypeFilter} onChange={(e) => setBusinessTypeFilter(e.target.value)} size="sm" bg="gray.800" borderColor="gray.700">
                            <option value="">All Types</option>
                            <option value="Q_COMMERCE">Q-Commerce</option>
                            <option value="LOGISTICS">Logistics</option>
                        </Select>
                    </Box>
                    <Box minW="130px">
                        <Text color="gray.500" fontSize="xs" mb={1}>Status</Text>
                        <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} size="sm" bg="gray.800" borderColor="gray.700">
                            <option value="">All Status</option>
                            <option value="PENDING">Pending</option>
                            <option value="ACKNOWLEDGED">Acknowledged</option>
                            <option value="PICKED_UP">Picked Up</option>
                            <option value="IN_TRANSIT">In Transit</option>
                            <option value="DELIVERED">Delivered</option>
                            <option value="CANCELLED">Cancelled</option>
                        </Select>
                    </Box>
                    <Box minW="120px">
                        <Text color="gray.500" fontSize="xs" mb={1}>Delivery</Text>
                        <Select value={deliveryFilter} onChange={(e) => setDeliveryFilter(e.target.value)} size="sm" bg="gray.800" borderColor="gray.700">
                            <option value="">All Orders</option>
                            <option value="assigned">Assigned</option>
                            <option value="unassigned">Unassigned</option>
                        </Select>
                    </Box>
                    <Box minW="130px">
                        <Text color="gray.500" fontSize="xs" mb={1}>Date From</Text>
                        <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} size="sm" bg="gray.800" borderColor="gray.700" />
                    </Box>
                    <Box minW="130px">
                        <Text color="gray.500" fontSize="xs" mb={1}>Date To</Text>
                        <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} size="sm" bg="gray.800" borderColor="gray.700" />
                    </Box>
                    {/* Buttons inline with filters */}
                    <HStack spacing={2}>
                        <Button leftIcon={<Filter size={14} />} colorScheme="purple" size="sm" onClick={applyFilters}>
                            Apply
                        </Button>
                        <Button leftIcon={<Download size={14} />} variant="outline" size="sm" onClick={() => {
                            const csv = filteredOrders.map((o: Order) => `${o.id},${o.createdAt},${o.totalAmount},${getLatestStatus(o)}`).join('\n');
                            const blob = new Blob([`Order ID,Created At,Amount,Status\n${csv}`], { type: 'text/csv' });
                            const url = URL.createObjectURL(blob);
                            const a = document.createElement('a');
                            a.href = url;
                            a.download = 'orders.csv';
                            a.click();
                        }}>
                            Export
                        </Button>
                        {(statusFilter || businessTypeFilter || deliveryFilter || dateFrom || dateTo) && (
                            <Button variant="ghost" size="sm" onClick={clearFilters}>Clear</Button>
                        )}
                    </HStack>
                </Flex>
            </Box>

            {/* Orders Table */}
            <Box bg="gray.900" borderRadius="xl" borderWidth="1px" borderColor="gray.800" overflow="hidden">
                {isLoading ? (
                    <Flex justify="center" py={12}>
                        <Spinner size="lg" color="purple.500" />
                    </Flex>
                ) : (
                    <Box overflowX="auto">
                        <Table variant="simple" size="sm">
                            <Thead>
                                <Tr>
                                    <Th borderColor="gray.800" color="gray.500" textTransform="uppercase" fontSize="xs">Store Name</Th>
                                    <Th borderColor="gray.800" color="gray.500" textTransform="uppercase" fontSize="xs">Store Phone</Th>
                                    <Th borderColor="gray.800" color="gray.500" textTransform="uppercase" fontSize="xs">Created At</Th>
                                    <Th borderColor="gray.800" color="gray.500" textTransform="uppercase" fontSize="xs">Customer Phone</Th>
                                    <Th borderColor="gray.800" color="gray.500" textTransform="uppercase" fontSize="xs">Delivery</Th>
                                    <Th borderColor="gray.800" color="gray.500" textTransform="uppercase" fontSize="xs">Amount</Th>
                                    <Th borderColor="gray.800" color="gray.500" textTransform="uppercase" fontSize="xs">Service Fee</Th>
                                    <Th borderColor="gray.800" color="gray.500" textTransform="uppercase" fontSize="xs">Delivery Fee</Th>
                                    <Th borderColor="gray.800" color="gray.500" textTransform="uppercase" fontSize="xs">Status</Th>
                                    <Th borderColor="gray.800" color="gray.500" textTransform="uppercase" fontSize="xs">Customer Name</Th>
                                    <Th borderColor="gray.800" color="gray.500" textTransform="uppercase" fontSize="xs">Actions</Th>
                                </Tr>
                            </Thead>
                            <Tbody>
                                {paginatedOrders.length === 0 ? (
                                    <Tr>
                                        <Td colSpan={11} textAlign="center" py={8} borderColor="gray.800">
                                            <Text color="gray.500">No orders found</Text>
                                        </Td>
                                    </Tr>
                                ) : (
                                    paginatedOrders.map((order) => (
                                        <Tr key={order.id} _hover={{ bg: 'gray.800' }}>
                                            <Td borderColor="gray.800">
                                                <Text fontSize="sm" fontWeight="500" color="gray.100">{order.store?.name || '--'}</Text>
                                            </Td>
                                            <Td borderColor="gray.800">
                                                <Text fontSize="sm" color="gray.400">{order.store?.mobile || '--'}</Text>
                                            </Td>
                                            <Td borderColor="gray.800">
                                                <Text fontSize="sm" color="gray.400">{formatDate(order.createdAt)}</Text>
                                            </Td>
                                            <Td borderColor="gray.800">
                                                <Text fontSize="sm" color="gray.400">{order.user?.mobile || '--'}</Text>
                                            </Td>
                                            <Td borderColor="gray.800">
                                                {order.ttrRideId ? (
                                                    <Tooltip
                                                        label={`Ride #${order.ttrRideId}${order.ttrTrackingCode ? ` • ${order.ttrTrackingCode}` : ''}`}
                                                        placement="top"
                                                        hasArrow
                                                        bg="gray.700"
                                                    >
                                                        <Badge
                                                            colorScheme="green"
                                                            variant="subtle"
                                                            cursor="pointer"
                                                        >
                                                            Assigned
                                                        </Badge>
                                                    </Tooltip>
                                                ) : (
                                                    <Badge colorScheme="gray" variant="subtle" opacity={0.6}>Unassigned</Badge>
                                                )}
                                            </Td>
                                            <Td borderColor="gray.800">
                                                <Text fontSize="sm" fontWeight="500" color="green.400">{formatCurrency(order.totalAmount)}</Text>
                                            </Td>
                                            <Td borderColor="gray.800">
                                                <Text fontSize="sm" fontWeight="500" color="orange.400">{formatCurrency(getServiceFee(order))}</Text>
                                            </Td>
                                            <Td borderColor="gray.800">
                                                <Text fontSize="sm" fontWeight="500" color="blue.400">{formatCurrency(getDeliveryFee(order))}</Text>
                                            </Td>
                                            <Td borderColor="gray.800">
                                                <StatusPill status={getLatestStatus(order)} />
                                            </Td>
                                            <Td borderColor="gray.800">
                                                <Text fontSize="sm" fontWeight="500" color="gray.100">
                                                    {formatFullName(order.user?.firstName, order.user?.lastName)}
                                                </Text>
                                            </Td>
                                            <Td borderColor="gray.800">
                                                <HStack spacing={1}>
                                                    <IconButton aria-label="View" icon={<Eye size={14} />} size="xs" variant="ghost" onClick={() => handleViewOrder(order)} />
                                                    <IconButton aria-label="Edit" icon={<Edit size={14} />} size="xs" variant="ghost" onClick={() => handleEditOrder(order)} />
                                                    <IconButton aria-label="Assign" icon={<MoreVertical size={14} />} size="xs" variant="ghost" onClick={() => handleAssignRider(order)} />
                                                </HStack>
                                            </Td>
                                        </Tr>
                                    ))
                                )}
                            </Tbody>
                        </Table>
                    </Box>
                )}

                {/* Pagination */}
                {!isLoading && filteredOrders.length > 0 && (
                    <Flex justify="space-between" align="center" p={4} borderTopWidth="1px" borderColor="gray.800">
                        <Text color="gray.500" fontSize="sm">
                            Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredOrders.length)} of {filteredOrders.length} orders
                        </Text>
                        <HStack spacing={2}>
                            <IconButton
                                aria-label="Previous"
                                icon={<ChevronLeft size={16} />}
                                size="sm"
                                variant="ghost"
                                isDisabled={currentPage === 1}
                                onClick={() => setCurrentPage(currentPage - 1)}
                            />
                            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                                let pageNum: number;
                                if (totalPages <= 5) pageNum = i + 1;
                                else if (currentPage <= 3) pageNum = i + 1;
                                else if (currentPage >= totalPages - 2) pageNum = totalPages - 4 + i;
                                else pageNum = currentPage - 2 + i;
                                return (
                                    <Button
                                        key={pageNum}
                                        size="sm"
                                        variant={currentPage === pageNum ? 'solid' : 'ghost'}
                                        colorScheme={currentPage === pageNum ? 'purple' : 'gray'}
                                        onClick={() => setCurrentPage(pageNum)}
                                    >
                                        {pageNum}
                                    </Button>
                                );
                            })}
                            <IconButton
                                aria-label="Next"
                                icon={<ChevronRight size={16} />}
                                size="sm"
                                variant="ghost"
                                isDisabled={currentPage === totalPages || totalPages === 0}
                                onClick={() => setCurrentPage(currentPage + 1)}
                            />
                        </HStack>
                    </Flex>
                )}
            </Box>

            {/* View Order Modal */}
            <Modal isOpen={isViewOpen} onClose={onViewClose} size="xl" scrollBehavior="inside">
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
                                        <Text fontWeight="600" color="gray.400">Created At: <Text as="span" fontWeight="normal" color="gray.100">{formatDate(selectedOrder.createdAt)}</Text></Text>
                                    </Box>
                                </Flex>

                                {/* Notes Card */}
                                <Card bg="gray.800" borderColor="gray.700" borderWidth="1px">
                                    <CardBody>
                                        <Text fontWeight="600" mb={2} color="gray.100">Notes</Text>
                                        <Text color="gray.400"><Text as="span" fontWeight="500" color="gray.300">Note for Vendor:</Text> {selectedOrder.noteForVendor || '—'}</Text>
                                        <Text color="gray.400"><Text as="span" fontWeight="500" color="gray.300">Note for Rider:</Text> {selectedOrder.noteForRider || '—'}</Text>
                                    </CardBody>
                                </Card>

                                {/* Address Card */}
                                <Card bg="gray.800" borderColor="gray.700" borderWidth="1px">
                                    <CardBody>
                                        <Text fontWeight="600" mb={2} color="gray.100">Address</Text>
                                        <Text color="gray.400"><Text as="span" fontWeight="500" color="gray.300">Drop-off Location:</Text> {selectedOrder.dropOffLocationAddress || '--'}</Text>
                                        <Text color="gray.400"><Text as="span" fontWeight="500" color="gray.300">Full Address:</Text> {selectedOrder.fullHouseAddress || '--'}</Text>

                                        {/* Merchant Info */}
                                        <Divider my={3} borderColor="gray.700" />
                                        <Text fontWeight="600" color="purple.400">Merchant Store: <Text as="span" fontWeight="normal" color="gray.100">{selectedOrder.store?.name || '--'}</Text></Text>
                                        <Text fontWeight="600" color="purple.400">Merchant Phone: <Text as="span" fontWeight="normal" color="gray.100">{selectedOrder.store?.mobile || '--'}</Text></Text>
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
                                        <Text fontWeight="600" mb={3} color="gray.100">Payment Summary</Text>
                                        <VStack spacing={2} align="stretch">
                                            <Flex justify="space-between">
                                                <Text color="gray.400">Subtotal (Before Charges)</Text>
                                                <Text color="gray.100">{formatCurrency(selectedOrder.totalAmountBeforeCharges)}</Text>
                                            </Flex>
                                            <Divider borderColor="gray.700" />
                                            <Flex justify="space-between">
                                                <Text color="gray.400">Service Fee</Text>
                                                <Text color="orange.400" fontWeight="500">{formatCurrency(getServiceFee(selectedOrder))}</Text>
                                            </Flex>
                                            <Flex justify="space-between">
                                                <Text color="gray.400">Delivery Fee</Text>
                                                <Text color="blue.400" fontWeight="500">{formatCurrency(getDeliveryFee(selectedOrder))}</Text>
                                            </Flex>
                                            <Flex justify="space-between">
                                                <Text color="gray.400">Total Charges</Text>
                                                <Text color="gray.300">{formatCurrency(selectedOrder.Charges)}</Text>
                                            </Flex>
                                            {selectedOrder.discountAmount && selectedOrder.discountAmount > 0 && (
                                                <Flex justify="space-between">
                                                    <Text color="gray.400">Discount {selectedOrder.appliedCouponCode ? `(${selectedOrder.appliedCouponCode})` : ''}</Text>
                                                    <Text color="green.400">-{formatCurrency(selectedOrder.discountAmount)}</Text>
                                                </Flex>
                                            )}
                                            <Divider borderColor="gray.700" />
                                            <Flex justify="space-between">
                                                <Text fontWeight="600" color="gray.100">Total Amount</Text>
                                                <Text fontWeight="600" color="green.400" fontSize="lg">{formatCurrency(selectedOrder.totalAmount)}</Text>
                                            </Flex>
                                        </VStack>
                                    </CardBody>
                                </Card>

                                {/* Tracking */}
                                <Box>
                                    <Text fontWeight="600" mb={2} color="gray.100">Tracking</Text>
                                    <VStack align="stretch" spacing={2}>
                                        {selectedOrder.orderTracking && selectedOrder.orderTracking.length > 0 ? (
                                            selectedOrder.orderTracking.map((tracking: any, idx: number) => (
                                                <Card key={idx} bg="gray.800" borderColor="gray.700" borderWidth="1px">
                                                    <CardBody py={3}>
                                                        <Flex justify="space-between" align="center">
                                                            <Badge
                                                                colorScheme={
                                                                    (tracking.orderStatus || tracking.status) === 'DELIVERED' ? 'green' :
                                                                        (tracking.orderStatus || tracking.status) === 'ACKNOWLEDGED' ? 'blue' :
                                                                            (tracking.orderStatus || tracking.status) === 'PENDING' ? 'yellow' :
                                                                                (tracking.orderStatus || tracking.status) === 'CANCELLED' ? 'red' :
                                                                                    (tracking.orderStatus || tracking.status) === 'PICKED_UP' ? 'purple' :
                                                                                        (tracking.orderStatus || tracking.status) === 'IN_TRANSIT' ? 'cyan' : 'gray'
                                                                }
                                                                fontSize="sm"
                                                                px={3}
                                                                py={1}
                                                                borderRadius="md"
                                                            >
                                                                {tracking.orderStatus || tracking.status || 'UNKNOWN'}
                                                            </Badge>
                                                            <Text fontSize="sm" color="gray.400">{formatDate(tracking.createdAt)}</Text>
                                                        </Flex>
                                                    </CardBody>
                                                </Card>
                                            ))
                                        ) : (
                                            <Text color="gray.500">No tracking information</Text>
                                        )}
                                    </VStack>
                                </Box>
                            </VStack>
                        )}
                    </ModalBody>
                </ModalContent>
            </Modal>

            {/* Edit Status Modal */}
            <Modal isOpen={isEditOpen} onClose={onEditClose} size="md">
                <ModalOverlay />
                <ModalContent bg="gray.900" color="gray.100">
                    <ModalHeader borderBottomWidth="1px" borderColor="gray.800">Update Order Status</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody pb={6}>
                        <VStack spacing={4}>
                            <Box w="100%">
                                <Text color="gray.400" mb={2}>Order: {editingOrder?.id}</Text>
                                <Select value={newStatus} onChange={(e) => setNewStatus(e.target.value)} bg="gray.800" borderColor="gray.700">
                                    <option value="PENDING">Pending</option>
                                    <option value="ACKNOWLEDGED">Acknowledged</option>
                                    <option value="PICKED_UP">Picked Up</option>
                                    <option value="IN_TRANSIT">In Transit</option>
                                    <option value="DELIVERED">Delivered</option>
                                    <option value="CANCELLED">Cancelled</option>
                                </Select>
                            </Box>
                            <Button colorScheme="purple" w="100%" onClick={handleUpdateStatus} isLoading={updateStatusMutation.isPending}>
                                Update Status
                            </Button>
                        </VStack>
                    </ModalBody>
                </ModalContent>
            </Modal>

            {/* Assign Rider Modal */}
            <Modal isOpen={isAssignOpen} onClose={onAssignClose} size="md">
                <ModalOverlay />
                <ModalContent bg="gray.900" color="gray.100">
                    <ModalHeader borderBottomWidth="1px" borderColor="gray.800">Assign Rider</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody pb={6}>
                        <Text color="gray.400" mb={4}>Select a rider for order: {assigningOrder?.id}</Text>
                        <VStack spacing={3}>
                            {riders.length === 0 ? (
                                <Text color="gray.500">No riders available</Text>
                            ) : (
                                riders.map((rider: any, index: number) => {
                                    // Handle both internal and external API field names (matching LogisticsPage)
                                    const name = rider.name || rider.riderName || `${rider.first_name || ''} ${rider.last_name || ''}`.trim() || 'Unknown Rider';
                                    const phone = rider.riderPhone || rider.phone || rider.mobile || '--';
                                    const riderIdValue = rider.riderId || rider.id || rider.driver_id;
                                    const uniqueKey = riderIdValue || `rider-${index}`;

                                    return (
                                        <Card key={uniqueKey} bg="gray.800" borderColor="gray.700" borderWidth="1px" w="100%">
                                            <CardBody py={3}>
                                                <Flex justify="space-between" align="center">
                                                    <Box>
                                                        <Text fontWeight="600" color="gray.100">
                                                            {name}
                                                        </Text>
                                                        <Text fontSize="sm" color="purple.400">{phone}</Text>
                                                    </Box>
                                                    <Button
                                                        size="sm"
                                                        colorScheme="purple"
                                                        onClick={() => {
                                                            if (riderIdValue) {
                                                                handleAssignRiderToOrder(Number(riderIdValue));
                                                            } else {
                                                                toast({ title: 'Rider ID not found', status: 'error', duration: 3000 });
                                                            }
                                                        }}
                                                        isLoading={assigningRiderId === Number(riderIdValue) && assignRiderMutation.isPending}
                                                        isDisabled={assignRiderMutation.isPending && assigningRiderId !== Number(riderIdValue)}
                                                    >
                                                        Assign
                                                    </Button>
                                                </Flex>
                                            </CardBody>
                                        </Card>
                                    );
                                })
                            )}
                        </VStack>
                    </ModalBody>
                </ModalContent>
            </Modal>
        </Box>
    );
};

export default OrdersPage;
