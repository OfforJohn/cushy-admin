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
    MenuItem,
    useDisclosure,
    Drawer,
    DrawerOverlay,
    DrawerContent,
    DrawerHeader,
    DrawerBody,
    DrawerCloseButton,
    VStack,
    Badge,
    Divider,
    useToast,
} from '@chakra-ui/react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    Search,
    Filter,
    Download,
    RefreshCw,
    Eye,
    Truck,
    XCircle,
    RotateCcw,
    MapPin,
    Phone,
    User,
    Store,
    Calendar,
} from 'lucide-react';
import { ordersApi } from '../../api/orders.api';
import { DataGrid, Column } from '../../components/common/DataGrid';
import { StatusPill } from '../../components/common/StatusPill';
import { Order, OrderStatus } from '../../types/order.types';
import { formatCurrency, formatDateTime, formatOrderId, formatFullName } from '../../utils/formatters';

interface OrdersPageProps {
    categoryFilter?: string;
    title?: string;
}

export const OrdersPage: React.FC<OrdersPageProps> = ({
    categoryFilter,
    title = 'All Orders'
}) => {
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [statusFilter, setStatusFilter] = useState<string>('');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

    const { isOpen, onOpen, onClose } = useDisclosure();
    const toast = useToast();
    const queryClient = useQueryClient();

    // Fetch all orders
    const { data: ordersData, isLoading, refetch } = useQuery({
        queryKey: ['orders', categoryFilter],
        queryFn: () => ordersApi.getAllOrders({
            storeCategory: categoryFilter,
        }),
    });

    // Update order status mutation
    const updateStatusMutation = useMutation({
        mutationFn: ({ orderId, status }: { orderId: string; status: OrderStatus }) =>
            ordersApi.updateOrderStatus(orderId, { status }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['orders'] });
            toast({
                title: 'Order updated',
                status: 'success',
                duration: 2000,
            });
        },
        onError: () => {
            toast({
                title: 'Failed to update order',
                status: 'error',
                duration: 3000,
            });
        },
    });

    const orders = ordersData?.data || [];

    // Filter orders locally for search and status
    const filteredOrders = orders.filter(order => {
        const latestStatus = getLatestStatus(order);
        const matchesStatus = !statusFilter || latestStatus.toUpperCase() === statusFilter.toUpperCase();
        const matchesSearch = !searchQuery ||
            order.id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            order.user?.firstName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            order.store?.name?.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesStatus && matchesSearch;
    });

    const handleViewOrder = (order: Order) => {
        setSelectedOrder(order);
        onOpen();
    };

    const handleUpdateStatus = (orderId: string, status: OrderStatus) => {
        updateStatusMutation.mutate({ orderId, status });
    };

    function getLatestStatus(order: Order): string {
        if (!order.orderTracking || order.orderTracking.length === 0) return 'PENDING';
        return order.orderTracking[order.orderTracking.length - 1]?.status || 'PENDING';
    }

    const columns: Column<Order>[] = [
        {
            key: 'id',
            header: 'Order ID',
            sortable: true,
            render: (order) => (
                <Text fontFamily="mono" fontSize="sm" color="brand.accent.500">
                    {formatOrderId(order.id)}
                </Text>
            ),
        },
        {
            key: 'user',
            header: 'Customer',
            render: (order) => (
                <VStack align="start" spacing={0}>
                    <Text fontSize="sm" fontWeight="500">
                        {formatFullName(order.user?.firstName, order.user?.lastName)}
                    </Text>
                    <Text fontSize="xs" color="gray.500">
                        {order.user?.mobile || '-'}
                    </Text>
                </VStack>
            ),
        },
        {
            key: 'store',
            header: 'Vendor',
            render: (order) => (
                <VStack align="start" spacing={0}>
                    <Text fontSize="sm" fontWeight="500">
                        {order.store?.name || 'Unknown'}
                    </Text>
                    <Text fontSize="xs" color="gray.500" textTransform="capitalize">
                        {order.store?.category?.replace('_', ' ') || '-'}
                    </Text>
                </VStack>
            ),
        },
        {
            key: 'totalItems',
            header: 'Items',
            sortable: true,
            render: (order) => (
                <Badge colorScheme="gray">{order.totalItems || 0} items</Badge>
            ),
        },
        {
            key: 'totalAmount',
            header: 'Total',
            sortable: true,
            render: (order) => (
                <Text fontWeight="600" color="green.400">
                    {formatCurrency(order.totalAmount)}
                </Text>
            ),
        },
        {
            key: 'status',
            header: 'Status',
            render: (order) => <StatusPill status={getLatestStatus(order)} />,
        },
        {
            key: 'type',
            header: 'Type',
            render: (order) => (
                <Badge
                    colorScheme={order.scheduleDelivery ? 'blue' : 'purple'}
                    variant="subtle"
                >
                    {order.scheduleDelivery ? 'Scheduled' : 'Express'}
                </Badge>
            ),
        },
        {
            key: 'createdAt',
            header: 'Date',
            sortable: true,
            render: (order) => (
                <Text fontSize="sm" color="gray.400">
                    {formatDateTime(order.createdAt)}
                </Text>
            ),
        },
    ];

    const renderActions = (order: Order) => (
        <>
            <MenuItem icon={<Eye size={16} />} onClick={() => handleViewOrder(order)}>
                View Details
            </MenuItem>
            <MenuItem
                icon={<Truck size={16} />}
                onClick={() => handleUpdateStatus(order.id, OrderStatus.PICKED_UP)}
            >
                Mark Picked Up
            </MenuItem>
            <MenuItem
                icon={<RefreshCw size={16} />}
                onClick={() => handleUpdateStatus(order.id, OrderStatus.DELIVERED)}
            >
                Mark Delivered
            </MenuItem>
            <MenuItem
                icon={<XCircle size={16} />}
                color="red.400"
                onClick={() => handleUpdateStatus(order.id, OrderStatus.CANCELLED)}
            >
                Cancel Order
            </MenuItem>
            <MenuItem icon={<RotateCcw size={16} />} color="orange.400">
                Issue Refund
            </MenuItem>
        </>
    );

    return (
        <Box>
            {/* Header */}
            <Flex justify="space-between" align="center" mb={6}>
                <Box>
                    <Heading size="lg" color="gray.100" mb={1}>
                        {title}
                    </Heading>
                    <Text color="gray.500">
                        {categoryFilter
                            ? `Orders from ${categoryFilter.replace('_', ' ')} vendors`
                            : 'Manage and track all customer orders'}
                    </Text>
                </Box>
                <HStack spacing={3}>
                    <Button
                        leftIcon={<RefreshCw size={16} />}
                        variant="ghost"
                        size="sm"
                        onClick={() => refetch()}
                    >
                        Refresh
                    </Button>
                    <Button
                        leftIcon={<Download size={16} />}
                        variant="ghost"
                        size="sm"
                    >
                        Export
                    </Button>
                </HStack>
            </Flex>

            {/* Filters */}
            <Flex gap={4} mb={6} flexWrap="wrap">
                <InputGroup maxW="300px">
                    <InputLeftElement>
                        <Icon as={Search} color="gray.500" boxSize={4} />
                    </InputLeftElement>
                    <Input
                        placeholder="Search orders..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        size="sm"
                    />
                </InputGroup>

                <Select
                    placeholder="All Statuses"
                    maxW="180px"
                    size="sm"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                >
                    <option value="PENDING">Pending</option>
                    <option value="ACKNOWLEDGED">Acknowledged</option>
                    <option value="PICKED_UP">Picked Up</option>
                    <option value="DELIVERED">Delivered</option>
                    <option value="CANCELLED">Cancelled</option>
                </Select>

                {!categoryFilter && (
                    <Select placeholder="All Categories" maxW="180px" size="sm">
                        <option value="restaurant">Restaurant</option>
                        <option value="med_tech">Pharmacy</option>
                        <option value="super_market">Supermarket</option>
                        <option value="grocery">Grocery</option>
                    </Select>
                )}

                <Button leftIcon={<Filter size={16} />} variant="ghost" size="sm">
                    More Filters
                </Button>
            </Flex>

            {/* Orders Table */}
            <DataGrid
                data={filteredOrders}
                columns={columns}
                isLoading={isLoading}
                page={page}
                pageSize={pageSize}
                totalItems={filteredOrders.length}
                onPageChange={setPage}
                onPageSizeChange={setPageSize}
                onRowClick={handleViewOrder}
                actions={renderActions}
                selectable
                exportable
                emptyMessage="No orders found"
            />

            {/* Order Detail Drawer */}
            <Drawer isOpen={isOpen} onClose={onClose} size="md">
                <DrawerOverlay />
                <DrawerContent bg="gray.900">
                    <DrawerCloseButton />
                    <DrawerHeader borderBottomWidth="1px" borderColor="gray.800">
                        <HStack spacing={3}>
                            <Text>Order Details</Text>
                            {selectedOrder && (
                                <StatusPill status={getLatestStatus(selectedOrder)} />
                            )}
                        </HStack>
                    </DrawerHeader>
                    <DrawerBody>
                        {selectedOrder && (
                            <VStack spacing={6} align="stretch" py={4}>
                                {/* Order Info */}
                                <Box>
                                    <Text fontSize="xs" color="gray.500" mb={2}>ORDER ID</Text>
                                    <Text fontFamily="mono" color="brand.accent.500">
                                        {selectedOrder.id}
                                    </Text>
                                </Box>

                                <Divider borderColor="gray.800" />

                                {/* Customer */}
                                <Box>
                                    <HStack mb={3}>
                                        <Icon as={User} color="gray.500" boxSize={4} />
                                        <Text fontSize="sm" fontWeight="600" color="gray.400">Customer</Text>
                                    </HStack>
                                    <VStack align="start" spacing={1} pl={6}>
                                        <Text fontWeight="500">
                                            {formatFullName(selectedOrder.user?.firstName, selectedOrder.user?.lastName)}
                                        </Text>
                                        <HStack color="gray.500" fontSize="sm">
                                            <Phone size={14} />
                                            <Text>{selectedOrder.user?.mobile || '-'}</Text>
                                        </HStack>
                                    </VStack>
                                </Box>

                                {/* Vendor */}
                                <Box>
                                    <HStack mb={3}>
                                        <Icon as={Store} color="gray.500" boxSize={4} />
                                        <Text fontSize="sm" fontWeight="600" color="gray.400">Vendor</Text>
                                    </HStack>
                                    <VStack align="start" spacing={1} pl={6}>
                                        <Text fontWeight="500">
                                            {selectedOrder.store?.name || 'Unknown'}
                                        </Text>
                                        <Badge colorScheme="purple" textTransform="capitalize">
                                            {selectedOrder.store?.category?.replace('_', ' ')}
                                        </Badge>
                                    </VStack>
                                </Box>

                                {/* Delivery */}
                                <Box>
                                    <HStack mb={3}>
                                        <Icon as={MapPin} color="gray.500" boxSize={4} />
                                        <Text fontSize="sm" fontWeight="600" color="gray.400">Delivery Address</Text>
                                    </HStack>
                                    <Text pl={6} color="gray.300">
                                        {selectedOrder.dropOffLocationAddress || selectedOrder.fullHouseAddress || 'Not specified'}
                                    </Text>
                                </Box>

                                <Divider borderColor="gray.800" />

                                {/* Order Summary */}
                                <Box>
                                    <Text fontSize="sm" fontWeight="600" color="gray.400" mb={3}>
                                        Order Summary
                                    </Text>
                                    <VStack spacing={2}>
                                        <Flex justify="space-between" w="full">
                                            <Text color="gray.500">Items ({selectedOrder.totalItems})</Text>
                                            <Text>{formatCurrency(selectedOrder.totalAmountBeforeCharges)}</Text>
                                        </Flex>
                                        {selectedOrder.discountAmount && selectedOrder.discountAmount > 0 && (
                                            <Flex justify="space-between" w="full">
                                                <Text color="gray.500">Discount</Text>
                                                <Text color="green.400">-{formatCurrency(selectedOrder.discountAmount)}</Text>
                                            </Flex>
                                        )}
                                        <Flex justify="space-between" w="full">
                                            <Text color="gray.500">Charges</Text>
                                            <Text>{formatCurrency(selectedOrder.Charges)}</Text>
                                        </Flex>
                                        <Divider borderColor="gray.700" />
                                        <Flex justify="space-between" w="full">
                                            <Text fontWeight="600">Total</Text>
                                            <Text fontWeight="600" color="green.400" fontSize="lg">
                                                {formatCurrency(selectedOrder.totalAmount)}
                                            </Text>
                                        </Flex>
                                    </VStack>
                                </Box>

                                {/* Date */}
                                <Box>
                                    <HStack mb={2}>
                                        <Icon as={Calendar} color="gray.500" boxSize={4} />
                                        <Text fontSize="sm" fontWeight="600" color="gray.400">Order Date</Text>
                                    </HStack>
                                    <Text pl={6} color="gray.300">
                                        {formatDateTime(selectedOrder.createdAt)}
                                    </Text>
                                </Box>

                                {/* Actions */}
                                <VStack spacing={2} pt={4}>
                                    <Button
                                        w="full"
                                        colorScheme="green"
                                        leftIcon={<RefreshCw size={16} />}
                                        onClick={() => handleUpdateStatus(selectedOrder.id, OrderStatus.DELIVERED)}
                                    >
                                        Mark as Delivered
                                    </Button>
                                    <Button
                                        w="full"
                                        variant="outline"
                                        colorScheme="red"
                                        leftIcon={<XCircle size={16} />}
                                    >
                                        Cancel Order
                                    </Button>
                                </VStack>
                            </VStack>
                        )}
                    </DrawerBody>
                </DrawerContent>
            </Drawer>
        </Box>
    );
};

export default OrdersPage;
