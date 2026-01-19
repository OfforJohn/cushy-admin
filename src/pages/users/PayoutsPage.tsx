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
    Input,
    InputGroup,
    InputLeftElement,
    Icon,
    Badge,
    Avatar,
    useToast,
    Card,
    CardBody,
    SimpleGrid,
    Table,
    Thead,
    Tbody,
    Tr,
    Th,
    Td,
    Spinner,
    Menu,
    MenuButton,
    MenuList,
    MenuItem,
    IconButton,
} from '@chakra-ui/react';
import { useQuery } from '@tanstack/react-query';
import {
    Search,
    RefreshCw,
    Download,
    Wallet,
    ArrowUpRight,
    ArrowDownRight,
    Clock,
    CheckCircle,
    XCircle,
    MoreVertical,
    Eye,
    Store,
    Users,
    TrendingUp,
} from 'lucide-react';
import { adminApi } from '../../api/admin.api';
import { formatCurrency, formatDateTime } from '../../utils/formatters';

interface PayoutTransaction {
    id: string;
    vendorName: string;
    vendorEmail: string;
    amount: number;
    status: 'pending' | 'completed' | 'failed' | 'processing';
    type: 'withdrawal' | 'commission' | 'refund';
    bankName?: string;
    accountNumber?: string;
    createdAt: string;
    completedAt?: string;
}

export const PayoutsPage: React.FC = () => {
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [statusFilter, setStatusFilter] = useState<string>('');
    const [searchQuery, setSearchQuery] = useState('');
    const toast = useToast();

    // Fetch vendor list to calculate total merchant wallet balance
    const { data: vendorData, isLoading: vendorsLoading, refetch } = useQuery({
        queryKey: ['vendorList'],
        queryFn: () => adminApi.getVendorList({ limit: 500 }),
    });

    // Extract vendors and calculate total balance
    const extractVendors = () => {
        if (!vendorData) return [];
        const data = vendorData.data || vendorData;
        if (Array.isArray(data)) return data;
        if (data && typeof data === 'object' && 'vendorList' in data) return (data as { vendorList: any[] }).vendorList;
        return [];
    };

    const vendors = extractVendors();

    // Calculate total merchant wallet balance
    const totalMerchantBalance = vendors.reduce((sum: number, vendor: any) => {
        const balance = typeof vendor.walletBalance === 'string'
            ? parseFloat(vendor.walletBalance.replace(/[^0-9.-]/g, ''))
            : (vendor.walletBalance || 0);
        return sum + (isNaN(balance) ? 0 : balance);
    }, 0);

    // Mock payout transactions (to be replaced with actual API when available)
    const mockPayouts: PayoutTransaction[] = [
        {
            id: 'pyt_001',
            vendorName: 'Fresh Foods Market',
            vendorEmail: 'fresh@foods.com',
            amount: 125000,
            status: 'completed',
            type: 'withdrawal',
            bankName: 'GT Bank',
            accountNumber: '****4521',
            createdAt: '2026-01-02T10:30:00Z',
            completedAt: '2026-01-02T11:00:00Z',
        },
        {
            id: 'pyt_002',
            vendorName: 'MediCare Pharmacy',
            vendorEmail: 'info@medicare.ng',
            amount: 85000,
            status: 'pending',
            type: 'withdrawal',
            bankName: 'First Bank',
            accountNumber: '****7890',
            createdAt: '2026-01-02T09:15:00Z',
        },
        {
            id: 'pyt_003',
            vendorName: 'Quick Bites Restaurant',
            vendorEmail: 'orders@quickbites.com',
            amount: 45000,
            status: 'processing',
            type: 'withdrawal',
            bankName: 'Access Bank',
            accountNumber: '****1234',
            createdAt: '2026-01-01T16:45:00Z',
        },
        {
            id: 'pyt_004',
            vendorName: 'Green Grocers',
            vendorEmail: 'hello@greengrocers.ng',
            amount: 15000,
            status: 'failed',
            type: 'withdrawal',
            bankName: 'UBA',
            accountNumber: '****5678',
            createdAt: '2026-01-01T14:20:00Z',
        },
    ];

    // Filter payouts
    const filteredPayouts = mockPayouts.filter(payout => {
        const matchesStatus = !statusFilter || payout.status === statusFilter;
        const matchesSearch = !searchQuery ||
            payout.vendorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            payout.vendorEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
            payout.id.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesStatus && matchesSearch;
    });

    // Calculate stats
    const stats = {
        totalPending: mockPayouts.filter(p => p.status === 'pending').reduce((sum, p) => sum + p.amount, 0),
        totalCompleted: mockPayouts.filter(p => p.status === 'completed').reduce((sum, p) => sum + p.amount, 0),
        pendingCount: mockPayouts.filter(p => p.status === 'pending').length,
        completedCount: mockPayouts.filter(p => p.status === 'completed').length,
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'completed': return 'green';
            case 'pending': return 'yellow';
            case 'processing': return 'blue';
            case 'failed': return 'red';
            default: return 'gray';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'completed': return CheckCircle;
            case 'pending': return Clock;
            case 'processing': return RefreshCw;
            case 'failed': return XCircle;
            default: return Clock;
        }
    };

    const handleExportCSV = () => {
        if (filteredPayouts.length === 0) {
            toast({ title: 'No data to export', status: 'warning', duration: 2000 });
            return;
        }

        const headers = ['ID', 'Vendor', 'Email', 'Amount', 'Status', 'Type', 'Bank', 'Account', 'Date'];
        const rows = filteredPayouts.map(p => [
            p.id,
            p.vendorName,
            p.vendorEmail,
            formatCurrency(p.amount),
            p.status,
            p.type,
            p.bankName || 'N/A',
            p.accountNumber || 'N/A',
            formatDateTime(p.createdAt),
        ]);

        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `payouts_${new Date().toISOString().split('T')[0]}.csv`;
        link.click();

        toast({ title: 'Export successful', status: 'success', duration: 2000 });
    };

    return (
        <Box>
            {/* Header */}
            <Flex justify="space-between" align={{ base: 'start', md: 'center' }} mb={6} flexDir={{ base: 'column', md: 'row' }} gap={3}>
                <Box>
                    <Heading size="lg" color="gray.100" mb={1}>
                        Payouts
                    </Heading>
                    <Text color="gray.500">
                        Manage merchant withdrawals and payout requests
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
                        variant="outline"
                        size="sm"
                        borderColor="gray.700"
                        onClick={handleExportCSV}
                    >
                        Export
                    </Button>
                </HStack>
            </Flex>

            {/* Stats Cards */}
            <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4} mb={6}>
                {/* Total Merchant Wallet Balance */}
                <Card bg="gray.900" borderColor="gray.800" borderWidth="1px">
                    <CardBody p={5}>
                        <HStack spacing={3} mb={2}>
                            <Box p={2} borderRadius="lg" bg="purple.500" opacity={0.8}>
                                <Icon as={Store} color="purple.400" boxSize={5} />
                            </Box>
                            <Text fontSize="xs" color="gray.500" fontWeight="500">Total Merchant Balance</Text>
                        </HStack>
                        <Text fontSize="2xl" fontWeight="bold" color="purple.400">
                            {vendorsLoading ? <Spinner size="sm" /> : formatCurrency(totalMerchantBalance)}
                        </Text>
                        <Text fontSize="xs" color="gray.500" mt={1}>
                            {vendors.length} merchants
                        </Text>
                    </CardBody>
                </Card>

                {/* Pending Payouts */}
                <Card bg="gray.900" borderColor="gray.800" borderWidth="1px">
                    <CardBody p={5}>
                        <HStack spacing={3} mb={2}>
                            <Box p={2} borderRadius="lg" bg="yellow.500" opacity={0.8}>
                                <Icon as={Clock} color="yellow.400" boxSize={5} />
                            </Box>
                            <Text fontSize="xs" color="gray.500" fontWeight="500">Pending Payouts</Text>
                        </HStack>
                        <Text fontSize="2xl" fontWeight="bold" color="yellow.400">
                            {formatCurrency(stats.totalPending)}
                        </Text>
                        <Text fontSize="xs" color="gray.500" mt={1}>
                            {stats.pendingCount} requests
                        </Text>
                    </CardBody>
                </Card>

                {/* Completed Today */}
                <Card bg="gray.900" borderColor="gray.800" borderWidth="1px">
                    <CardBody p={5}>
                        <HStack spacing={3} mb={2}>
                            <Box p={2} borderRadius="lg" bg="green.500" opacity={0.8}>
                                <Icon as={CheckCircle} color="green.400" boxSize={5} />
                            </Box>
                            <Text fontSize="xs" color="gray.500" fontWeight="500">Completed</Text>
                        </HStack>
                        <Text fontSize="2xl" fontWeight="bold" color="green.400">
                            {formatCurrency(stats.totalCompleted)}
                        </Text>
                        <Text fontSize="xs" color="gray.500" mt={1}>
                            {stats.completedCount} payouts
                        </Text>
                    </CardBody>
                </Card>

                {/* Processing */}
                <Card bg="gray.900" borderColor="gray.800" borderWidth="1px">
                    <CardBody p={5}>
                        <HStack spacing={3} mb={2}>
                            <Box p={2} borderRadius="lg" bg="blue.500" opacity={0.8}>
                                <Icon as={TrendingUp} color="blue.400" boxSize={5} />
                            </Box>
                            <Text fontSize="xs" color="gray.500" fontWeight="500">Processing</Text>
                        </HStack>
                        <Text fontSize="2xl" fontWeight="bold" color="blue.400">
                            {mockPayouts.filter(p => p.status === 'processing').length}
                        </Text>
                        <Text fontSize="xs" color="gray.500" mt={1}>
                            In progress
                        </Text>
                    </CardBody>
                </Card>
            </SimpleGrid>

            {/* Filters */}
            <Card bg="gray.900" borderColor="gray.800" borderWidth="1px" mb={6}>
                <CardBody p={4}>
                    <Flex gap={3} flexWrap="wrap" align="center">
                        <InputGroup maxW={{ base: '100%', md: '250px' }} size="sm">
                            <InputLeftElement>
                                <Icon as={Search} color="gray.500" boxSize={4} />
                            </InputLeftElement>
                            <Input
                                placeholder="Search payouts..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                bg="gray.800"
                                borderColor="gray.700"
                            />
                        </InputGroup>
                        <Select
                            placeholder="All Status"
                            size="sm"
                            maxW="150px"
                            bg="gray.800"
                            borderColor="gray.700"
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                        >
                            <option value="pending">Pending</option>
                            <option value="processing">Processing</option>
                            <option value="completed">Completed</option>
                            <option value="failed">Failed</option>
                        </Select>
                        {(statusFilter || searchQuery) && (
                            <Button
                                variant="ghost"
                                size="sm"
                                color="gray.400"
                                onClick={() => { setStatusFilter(''); setSearchQuery(''); }}
                            >
                                Clear
                            </Button>
                        )}
                    </Flex>
                </CardBody>
            </Card>

            {/* Payouts Table */}
            <Card bg="gray.900" borderColor="gray.800" borderWidth="1px">
                <CardBody p={0}>
                    <Box overflowX="auto">
                        <Table variant="simple" size="sm">
                            <Thead>
                                <Tr>
                                    <Th borderColor="gray.700" color="gray.500" fontSize="xs">VENDOR</Th>
                                    <Th borderColor="gray.700" color="gray.500" fontSize="xs">AMOUNT</Th>
                                    <Th borderColor="gray.700" color="gray.500" fontSize="xs">STATUS</Th>
                                    <Th borderColor="gray.700" color="gray.500" fontSize="xs">BANK</Th>
                                    <Th borderColor="gray.700" color="gray.500" fontSize="xs">DATE</Th>
                                    <Th borderColor="gray.700" color="gray.500" fontSize="xs" w="50px"></Th>
                                </Tr>
                            </Thead>
                            <Tbody>
                                {filteredPayouts.length === 0 ? (
                                    <Tr>
                                        <Td colSpan={6} textAlign="center" py={8} borderColor="gray.800">
                                            <Text color="gray.500">No payout requests found</Text>
                                        </Td>
                                    </Tr>
                                ) : (
                                    filteredPayouts.map((payout) => (
                                        <Tr key={payout.id} _hover={{ bg: 'gray.800' }}>
                                            <Td borderColor="gray.800">
                                                <HStack spacing={3}>
                                                    <Avatar
                                                        size="sm"
                                                        name={payout.vendorName}
                                                        bg="purple.600"
                                                    />
                                                    <VStack align="start" spacing={0}>
                                                        <Text fontSize="sm" fontWeight="500" color="gray.100">
                                                            {payout.vendorName}
                                                        </Text>
                                                        <Text fontSize="xs" color="gray.500">
                                                            {payout.vendorEmail}
                                                        </Text>
                                                    </VStack>
                                                </HStack>
                                            </Td>
                                            <Td borderColor="gray.800">
                                                <Text fontSize="sm" fontWeight="600" color="gray.100">
                                                    {formatCurrency(payout.amount)}
                                                </Text>
                                            </Td>
                                            <Td borderColor="gray.800">
                                                <Badge
                                                    colorScheme={getStatusColor(payout.status)}
                                                    variant="subtle"
                                                    px={2}
                                                    py={1}
                                                    borderRadius="md"
                                                >
                                                    <HStack spacing={1}>
                                                        <Icon as={getStatusIcon(payout.status)} boxSize={3} />
                                                        <Text textTransform="capitalize">{payout.status}</Text>
                                                    </HStack>
                                                </Badge>
                                            </Td>
                                            <Td borderColor="gray.800">
                                                <VStack align="start" spacing={0}>
                                                    <Text fontSize="sm" color="gray.300">
                                                        {payout.bankName || 'N/A'}
                                                    </Text>
                                                    <Text fontSize="xs" color="gray.500">
                                                        {payout.accountNumber || ''}
                                                    </Text>
                                                </VStack>
                                            </Td>
                                            <Td borderColor="gray.800">
                                                <Text fontSize="sm" color="gray.400">
                                                    {formatDateTime(payout.createdAt)}
                                                </Text>
                                            </Td>
                                            <Td borderColor="gray.800">
                                                <Menu>
                                                    <MenuButton
                                                        as={IconButton}
                                                        icon={<MoreVertical size={16} />}
                                                        variant="ghost"
                                                        size="sm"
                                                        color="gray.400"
                                                    />
                                                    <MenuList bg="gray.800" borderColor="gray.700">
                                                        <MenuItem
                                                            icon={<Eye size={16} />}
                                                            bg="gray.800"
                                                            _hover={{ bg: 'gray.700' }}
                                                        >
                                                            View Details
                                                        </MenuItem>
                                                        {payout.status === 'pending' && (
                                                            <>
                                                                <MenuItem
                                                                    icon={<CheckCircle size={16} />}
                                                                    bg="gray.800"
                                                                    _hover={{ bg: 'gray.700' }}
                                                                    color="green.400"
                                                                >
                                                                    Approve
                                                                </MenuItem>
                                                                <MenuItem
                                                                    icon={<XCircle size={16} />}
                                                                    bg="gray.800"
                                                                    _hover={{ bg: 'gray.700' }}
                                                                    color="red.400"
                                                                >
                                                                    Reject
                                                                </MenuItem>
                                                            </>
                                                        )}
                                                    </MenuList>
                                                </Menu>
                                            </Td>
                                        </Tr>
                                    ))
                                )}
                            </Tbody>
                        </Table>
                    </Box>

                    {/* Pagination */}
                    {filteredPayouts.length > 0 && (
                        <Flex justify="space-between" align="center" p={4} borderTopWidth="1px" borderColor="gray.800">
                            <Text fontSize="sm" color="gray.500">
                                Showing {filteredPayouts.length} of {mockPayouts.length} payouts
                            </Text>
                            <HStack spacing={2}>
                                <Select
                                    size="xs"
                                    w="70px"
                                    value={pageSize}
                                    onChange={(e) => setPageSize(Number(e.target.value))}
                                    bg="gray.800"
                                    borderColor="gray.700"
                                >
                                    <option value={10}>10</option>
                                    <option value={25}>25</option>
                                    <option value={50}>50</option>
                                </Select>
                            </HStack>
                        </Flex>
                    )}
                </CardBody>
            </Card>
        </Box>
    );
};

export default PayoutsPage;
