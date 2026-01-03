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
    IconButton,
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
    useDisclosure,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalCloseButton,
    useToast,
    Spinner,
    Divider,
    Avatar,
    Tooltip,
} from '@chakra-ui/react';
import { useQuery } from '@tanstack/react-query';
import {
    Search,
    Download,
    RefreshCw,
    Eye,
    ArrowUpRight,
    ArrowDownLeft,
    Wallet,
    TrendingUp,
    Clock,
    CheckCircle,
    XCircle,
    Filter,
    ChevronLeft,
    ChevronRight,
    CreditCard,
    Banknote,
    Repeat,
} from 'lucide-react';
import { useLocationFilter } from '../../context/LocationContext';
import { formatCurrency, formatDateTime, formatFullName } from '../../utils/formatters';
import { walletApi } from '../../api/wallet.api';
import { Transaction, TransactionCategory, TransactionStatus } from '../../types/wallet.types';

export const TransactionsPage: React.FC = () => {
    const [typeFilter, setTypeFilter] = useState<string>('');
    const [statusFilter, setStatusFilter] = useState<string>('');
    const [dateFrom, setDateFrom] = useState<string>('');
    const [dateTo, setDateTo] = useState<string>('');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const { isOpen, onOpen, onClose } = useDisclosure();
    const toast = useToast();
    const { selectedLocation } = useLocationFilter();

    // Fetch transactions from API
    const { data: transactionsData, isLoading, refetch } = useQuery({
        queryKey: ['transactions'],
        queryFn: () => walletApi.getAllTransactions(),
    });

    const transactions: Transaction[] = transactionsData?.data || transactionsData || [];

    // Helper to determine if a category is a credit type
    const isCreditCategory = (category: string) => {
        return [
            TransactionCategory.CREDIT,
            TransactionCategory.FUND_WALLET,
            TransactionCategory.ORDER_REFUND,
            TransactionCategory.ORDER,
        ].includes(category as TransactionCategory);
    };

    // Filter transactions
    const filteredTransactions = transactions.filter(txn => {
        const matchesType = !typeFilter || txn.category === typeFilter;
        const matchesStatus = !statusFilter || txn.status === statusFilter;
        const matchesSearch = !searchQuery ||
            txn.transactionReference?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            txn.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            txn.user?.firstName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            txn.user?.lastName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            txn.user?.email?.toLowerCase().includes(searchQuery.toLowerCase());

        let matchesDate = true;
        if (dateFrom) {
            matchesDate = new Date(txn.createdAt) >= new Date(dateFrom);
        }
        if (dateTo && matchesDate) {
            matchesDate = new Date(txn.createdAt) <= new Date(dateTo + 'T23:59:59');
        }

        return matchesType && matchesStatus && matchesSearch && matchesDate;
    });

    // Stats
    const stats = {
        totalTransactions: filteredTransactions.length,
        totalCredits: filteredTransactions
            .filter(t => isCreditCategory(t.category) && t.status === TransactionStatus.COMPLETED)
            .reduce((sum, t) => sum + (Number(t.amount) || 0), 0),
        totalDebits: filteredTransactions
            .filter(t => !isCreditCategory(t.category) && t.status === TransactionStatus.COMPLETED)
            .reduce((sum, t) => sum + (Number(t.amount) || 0), 0),
        pendingCount: filteredTransactions.filter(t => t.status === TransactionStatus.PENDING).length,
    };

    // Pagination
    const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
    const paginatedTransactions = filteredTransactions.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const clearFilters = () => {
        setTypeFilter('');
        setStatusFilter('');
        setDateFrom('');
        setDateTo('');
        setSearchQuery('');
        setCurrentPage(1);
    };

    const handleViewTransaction = (txn: Transaction) => {
        setSelectedTransaction(txn);
        onOpen();
    };

    const getCategoryIcon = (category: string) => {
        switch (category) {
            case TransactionCategory.FUND_WALLET: return <ArrowDownLeft size={16} />;
            case TransactionCategory.CREDIT: return <ArrowDownLeft size={16} />;
            case TransactionCategory.ORDER: return <ArrowDownLeft size={16} />;
            case TransactionCategory.ORDER_REFUND: return <ArrowDownLeft size={16} />;
            case TransactionCategory.DEBIT: return <ArrowUpRight size={16} />;
            case TransactionCategory.LOGISTICS: return <ArrowUpRight size={16} />;
            case TransactionCategory.Q_COMMERCE: return <ArrowUpRight size={16} />;
            default: return <CreditCard size={16} />;
        }
    };

    const getCategoryColor = (category: string) => {
        if (isCreditCategory(category)) return 'green';
        return 'red';
    };

    const getCategoryLabel = (category: string) => {
        switch (category) {
            case TransactionCategory.FUND_WALLET: return 'Wallet Funding';
            case TransactionCategory.CREDIT: return 'Credit';
            case TransactionCategory.ORDER: return 'Order Payment';
            case TransactionCategory.ORDER_REFUND: return 'Refund';
            case TransactionCategory.DEBIT: return 'Debit';
            case TransactionCategory.LOGISTICS: return 'Logistics';
            case TransactionCategory.Q_COMMERCE: return 'Q-Commerce';
            default: return category;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case TransactionStatus.COMPLETED: return 'green';
            case TransactionStatus.PENDING: return 'yellow';
            case TransactionStatus.FAILED: return 'red';
            case TransactionStatus.REVERSED: return 'purple';
            case TransactionStatus.AWAITING_DELIVERY: return 'blue';
            default: return 'gray';
        }
    };

    const exportToCSV = () => {
        const headers = ['Reference', 'Category', 'Amount', 'Status', 'User', 'Description', 'Date'];
        const rows = filteredTransactions.map(t => [
            t.transactionReference || '',
            t.category || '',
            (t.amount || 0).toString(),
            t.status || '',
            `${t.user?.firstName || ''} ${t.user?.lastName || ''}`,
            t.description || '',
            new Date(t.createdAt).toLocaleString(),
        ]);

        const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'transactions.csv';
        a.click();

        toast({
            title: 'Export Complete',
            description: 'Transactions exported successfully.',
            status: 'success',
            duration: 3000,
        });
    };

    return (
        <Box p={6}>
            {/* Header */}
            <Flex justify="space-between" align="flex-start" mb={6}>
                <Box>
                    <Heading size="lg" color="gray.100" mb={1}>Transactions</Heading>
                    <Text color="gray.500">View and manage all wallet transactions</Text>
                </Box>
                <HStack spacing={2}>
                    <Button
                        leftIcon={<Download size={16} />}
                        variant="outline"
                        size="sm"
                        onClick={exportToCSV}
                    >
                        Export CSV
                    </Button>
                    <Button
                        leftIcon={<RefreshCw size={16} />}
                        variant="ghost"
                        size="sm"
                    >
                        Refresh
                    </Button>
                </HStack>
            </Flex>

            {/* Stats Cards */}
            <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4} mb={6}>
                <Card bg="gray.800" borderColor="gray.700" borderWidth="1px">
                    <CardBody py={4}>
                        <Flex align="center" gap={3}>
                            <Box p={2} borderRadius="lg" bg="purple.500/20">
                                <Icon as={Wallet} color="purple.400" boxSize={5} />
                            </Box>
                            <Box>
                                <Text color="gray.500" fontSize="xs" textTransform="uppercase">Total Transactions</Text>
                                <Text color="gray.100" fontSize="2xl" fontWeight="bold">{stats.totalTransactions}</Text>
                            </Box>
                        </Flex>
                    </CardBody>
                </Card>

                <Card bg="gray.800" borderColor="gray.700" borderWidth="1px">
                    <CardBody py={4}>
                        <Flex align="center" gap={3}>
                            <Box p={2} borderRadius="lg" bg="green.500/20">
                                <Icon as={ArrowDownLeft} color="green.400" boxSize={5} />
                            </Box>
                            <Box>
                                <Text color="gray.500" fontSize="xs" textTransform="uppercase">Total Credits</Text>
                                <Text color="green.400" fontSize="2xl" fontWeight="bold">{formatCurrency(stats.totalCredits)}</Text>
                            </Box>
                        </Flex>
                    </CardBody>
                </Card>

                <Card bg="gray.800" borderColor="gray.700" borderWidth="1px">
                    <CardBody py={4}>
                        <Flex align="center" gap={3}>
                            <Box p={2} borderRadius="lg" bg="red.500/20">
                                <Icon as={ArrowUpRight} color="red.400" boxSize={5} />
                            </Box>
                            <Box>
                                <Text color="gray.500" fontSize="xs" textTransform="uppercase">Total Debits</Text>
                                <Text color="red.400" fontSize="2xl" fontWeight="bold">{formatCurrency(stats.totalDebits)}</Text>
                            </Box>
                        </Flex>
                    </CardBody>
                </Card>

                <Card bg="gray.800" borderColor="gray.700" borderWidth="1px">
                    <CardBody py={4}>
                        <Flex align="center" gap={3}>
                            <Box p={2} borderRadius="lg" bg="yellow.500/20">
                                <Icon as={Clock} color="yellow.400" boxSize={5} />
                            </Box>
                            <Box>
                                <Text color="gray.500" fontSize="xs" textTransform="uppercase">Pending</Text>
                                <Text color="yellow.400" fontSize="2xl" fontWeight="bold">{stats.pendingCount}</Text>
                            </Box>
                        </Flex>
                    </CardBody>
                </Card>
            </SimpleGrid>

            {/* Filters */}
            <Box bg="gray.900" borderRadius="xl" borderWidth="1px" borderColor="gray.800" p={4} mb={6}>
                <Flex gap={4} flexWrap="wrap" align="flex-end">
                    <Box flex={1} minW="200px">
                        <Text color="gray.500" fontSize="xs" mb={1}>Search</Text>
                        <InputGroup size="sm">
                            <InputLeftElement>
                                <Icon as={Search} color="gray.500" boxSize={4} />
                            </InputLeftElement>
                            <Input
                                placeholder="Search by reference, user, description..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                bg="gray.800"
                                borderColor="gray.700"
                            />
                        </InputGroup>
                    </Box>
                    <Box minW="150px">
                        <Text color="gray.500" fontSize="xs" mb={1}>Category</Text>
                        <Select
                            value={typeFilter}
                            onChange={(e) => setTypeFilter(e.target.value)}
                            size="sm"
                            bg="gray.800"
                            borderColor="gray.700"
                        >
                            <option value="">All Categories</option>
                            <option value={TransactionCategory.FUND_WALLET}>Wallet Funding</option>
                            <option value={TransactionCategory.CREDIT}>Credit</option>
                            <option value={TransactionCategory.DEBIT}>Debit</option>
                            <option value={TransactionCategory.ORDER}>Order Payment</option>
                            <option value={TransactionCategory.ORDER_REFUND}>Refund</option>
                            <option value={TransactionCategory.LOGISTICS}>Logistics</option>
                            <option value={TransactionCategory.Q_COMMERCE}>Q-Commerce</option>
                        </Select>
                    </Box>
                    <Box minW="140px">
                        <Text color="gray.500" fontSize="xs" mb={1}>Status</Text>
                        <Select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            size="sm"
                            bg="gray.800"
                            borderColor="gray.700"
                        >
                            <option value="">All Statuses</option>
                            <option value={TransactionStatus.COMPLETED}>Completed</option>
                            <option value={TransactionStatus.PENDING}>Pending</option>
                            <option value={TransactionStatus.FAILED}>Failed</option>
                            <option value={TransactionStatus.REVERSED}>Reversed</option>
                            <option value={TransactionStatus.AWAITING_DELIVERY}>Awaiting Delivery</option>
                        </Select>
                    </Box>
                    <Box minW="140px">
                        <Text color="gray.500" fontSize="xs" mb={1}>From Date</Text>
                        <Input
                            type="date"
                            value={dateFrom}
                            onChange={(e) => setDateFrom(e.target.value)}
                            size="sm"
                            bg="gray.800"
                            borderColor="gray.700"
                        />
                    </Box>
                    <Box minW="140px">
                        <Text color="gray.500" fontSize="xs" mb={1}>To Date</Text>
                        <Input
                            type="date"
                            value={dateTo}
                            onChange={(e) => setDateTo(e.target.value)}
                            size="sm"
                            bg="gray.800"
                            borderColor="gray.700"
                        />
                    </Box>
                    <HStack>
                        <Button size="sm" colorScheme="purple" onClick={() => setCurrentPage(1)}>
                            Apply
                        </Button>
                        {(typeFilter || statusFilter || dateFrom || dateTo || searchQuery) && (
                            <Button size="sm" variant="ghost" onClick={clearFilters}>
                                Clear
                            </Button>
                        )}
                    </HStack>
                </Flex>
            </Box>

            {/* Transactions Table */}
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
                                    <Th borderColor="gray.800" color="gray.500" textTransform="uppercase" fontSize="xs">Reference</Th>
                                    <Th borderColor="gray.800" color="gray.500" textTransform="uppercase" fontSize="xs">Type</Th>
                                    <Th borderColor="gray.800" color="gray.500" textTransform="uppercase" fontSize="xs">User</Th>
                                    <Th borderColor="gray.800" color="gray.500" textTransform="uppercase" fontSize="xs">Amount</Th>
                                    <Th borderColor="gray.800" color="gray.500" textTransform="uppercase" fontSize="xs">Status</Th>
                                    <Th borderColor="gray.800" color="gray.500" textTransform="uppercase" fontSize="xs">Description</Th>
                                    <Th borderColor="gray.800" color="gray.500" textTransform="uppercase" fontSize="xs">Date</Th>
                                    <Th borderColor="gray.800" color="gray.500" textTransform="uppercase" fontSize="xs">Actions</Th>
                                </Tr>
                            </Thead>
                            <Tbody>
                                {paginatedTransactions.length === 0 ? (
                                    <Tr>
                                        <Td colSpan={8} textAlign="center" py={8} borderColor="gray.800">
                                            <Text color="gray.500">No transactions found</Text>
                                        </Td>
                                    </Tr>
                                ) : (
                                    paginatedTransactions.map((txn) => (
                                        <Tr key={txn.id} _hover={{ bg: 'gray.800' }}>
                                            <Td borderColor="gray.800">
                                                <Text fontSize="sm" fontWeight="500" color="gray.100" fontFamily="mono">
                                                    {txn.transactionReference}
                                                </Text>
                                            </Td>
                                            <Td borderColor="gray.800">
                                                <HStack spacing={2}>
                                                    <Box
                                                        p={1.5}
                                                        borderRadius="md"
                                                        bg={`${getCategoryColor(txn.category)}.500`}
                                                        color="white"
                                                    >
                                                        {getCategoryIcon(txn.category)}
                                                    </Box>
                                                    <Text fontSize="sm" color="gray.300">
                                                        {getCategoryLabel(txn.category)}
                                                    </Text>
                                                </HStack>
                                            </Td>
                                            <Td borderColor="gray.800">
                                                <HStack spacing={2}>
                                                    <Avatar
                                                        size="xs"
                                                        name={`${txn.user?.firstName || ''} ${txn.user?.lastName || ''}`}
                                                        bg="purple.500"
                                                    />
                                                    <Box>
                                                        <Text fontSize="sm" color="gray.100">
                                                            {txn.user?.firstName || ''} {txn.user?.lastName || ''}
                                                        </Text>
                                                        <Text fontSize="xs" color="gray.500">{txn.user?.email || txn.userId}</Text>
                                                    </Box>
                                                </HStack>
                                            </Td>
                                            <Td borderColor="gray.800">
                                                <Text
                                                    fontSize="sm"
                                                    fontWeight="600"
                                                    color={isCreditCategory(txn.category) ? 'green.400' : 'red.400'}
                                                >
                                                    {isCreditCategory(txn.category) ? '+' : '-'}
                                                    {formatCurrency(Number(txn.amount) || 0)}
                                                </Text>
                                            </Td>
                                            <Td borderColor="gray.800">
                                                <Badge colorScheme={getStatusColor(txn.status)} textTransform="capitalize">
                                                    {txn.status}
                                                </Badge>
                                            </Td>
                                            <Td borderColor="gray.800">
                                                <Text fontSize="sm" color="gray.400" maxW="200px" isTruncated>
                                                    {txn.description || '-'}
                                                </Text>
                                            </Td>
                                            <Td borderColor="gray.800">
                                                <Text fontSize="sm" color="gray.400">
                                                    {new Date(txn.createdAt).toLocaleDateString()}
                                                </Text>
                                                <Text fontSize="xs" color="gray.500">
                                                    {new Date(txn.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </Text>
                                            </Td>
                                            <Td borderColor="gray.800">
                                                <Tooltip label="View Details">
                                                    <IconButton
                                                        aria-label="View"
                                                        icon={<Eye size={14} />}
                                                        size="xs"
                                                        variant="ghost"
                                                        onClick={() => handleViewTransaction(txn)}
                                                    />
                                                </Tooltip>
                                            </Td>
                                        </Tr>
                                    ))
                                )}
                            </Tbody>
                        </Table>
                    </Box>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                    <Flex justify="space-between" align="center" p={4} borderTopWidth="1px" borderColor="gray.800">
                        <Text color="gray.500" fontSize="sm">
                            Showing {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, filteredTransactions.length)} of {filteredTransactions.length}
                        </Text>
                        <HStack spacing={2}>
                            <IconButton
                                aria-label="Previous"
                                icon={<ChevronLeft size={16} />}
                                size="sm"
                                variant="ghost"
                                isDisabled={currentPage === 1}
                                onClick={() => setCurrentPage(p => p - 1)}
                            />
                            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                const page = i + 1;
                                return (
                                    <Button
                                        key={page}
                                        size="sm"
                                        variant={currentPage === page ? 'solid' : 'ghost'}
                                        colorScheme={currentPage === page ? 'purple' : 'gray'}
                                        onClick={() => setCurrentPage(page)}
                                    >
                                        {page}
                                    </Button>
                                );
                            })}
                            <IconButton
                                aria-label="Next"
                                icon={<ChevronRight size={16} />}
                                size="sm"
                                variant="ghost"
                                isDisabled={currentPage === totalPages}
                                onClick={() => setCurrentPage(p => p + 1)}
                            />
                        </HStack>
                    </Flex>
                )}
            </Box>

            {/* Transaction Details Modal */}
            <Modal isOpen={isOpen} onClose={onClose} size="lg">
                <ModalOverlay />
                <ModalContent bg="gray.900" borderColor="gray.800">
                    <ModalHeader color="gray.100">Transaction Details</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody pb={6}>
                        {selectedTransaction && (
                            <VStack spacing={4} align="stretch">
                                {/* Transaction Header */}
                                <Flex justify="space-between" align="center" p={4} bg="gray.800" borderRadius="lg">
                                    <HStack spacing={3}>
                                        <Box
                                            p={2}
                                            borderRadius="lg"
                                            bg={`${getCategoryColor(selectedTransaction.category)}.500`}
                                            color="white"
                                        >
                                            {getCategoryIcon(selectedTransaction.category)}
                                        </Box>
                                        <Box>
                                            <Text color="gray.400" fontSize="sm">
                                                {getCategoryLabel(selectedTransaction.category)}
                                            </Text>
                                            <Text
                                                color={isCreditCategory(selectedTransaction.category) ? 'green.400' : 'red.400'}
                                                fontSize="2xl"
                                                fontWeight="bold"
                                            >
                                                {isCreditCategory(selectedTransaction.category) ? '+' : '-'}
                                                {formatCurrency(Number(selectedTransaction.amount) || 0)}
                                            </Text>
                                        </Box>
                                    </HStack>
                                    <Badge colorScheme={getStatusColor(selectedTransaction.status)} fontSize="sm" px={3} py={1}>
                                        {selectedTransaction.status}
                                    </Badge>
                                </Flex>

                                {/* Details Grid */}
                                <SimpleGrid columns={2} spacing={4}>
                                    <Box>
                                        <Text color="gray.500" fontSize="xs" textTransform="uppercase">Reference</Text>
                                        <Text color="gray.100" fontFamily="mono">{selectedTransaction.transactionReference}</Text>
                                    </Box>
                                    <Box>
                                        <Text color="gray.500" fontSize="xs" textTransform="uppercase">Date & Time</Text>
                                        <Text color="gray.100">{new Date(selectedTransaction.createdAt).toLocaleString()}</Text>
                                    </Box>
                                    <Box>
                                        <Text color="gray.500" fontSize="xs" textTransform="uppercase">User ID</Text>
                                        <Text color="gray.100" fontFamily="mono">{selectedTransaction.userId}</Text>
                                    </Box>
                                    <Box>
                                        <Text color="gray.500" fontSize="xs" textTransform="uppercase">Wallet ID</Text>
                                        <Text color="gray.100" fontFamily="mono">{selectedTransaction.walletId || '-'}</Text>
                                    </Box>
                                </SimpleGrid>

                                <Divider borderColor="gray.700" />

                                {/* Description */}
                                <Box>
                                    <Text color="gray.500" fontSize="xs" textTransform="uppercase" mb={1}>Description</Text>
                                    <Text color="gray.100">{selectedTransaction.description || '-'}</Text>
                                </Box>

                                <Divider borderColor="gray.700" />

                                {/* User Info */}
                                <Box>
                                    <Text color="gray.500" fontSize="xs" textTransform="uppercase" mb={2}>User Information</Text>
                                    <Card bg="gray.800" borderColor="gray.700" borderWidth="1px">
                                        <CardBody>
                                            <HStack spacing={3}>
                                                <Avatar
                                                    name={`${selectedTransaction.user?.firstName || ''} ${selectedTransaction.user?.lastName || ''}`}
                                                    bg="purple.500"
                                                />
                                                <Box>
                                                    <Text color="gray.100" fontWeight="500">
                                                        {selectedTransaction.user?.firstName || ''} {selectedTransaction.user?.lastName || ''}
                                                    </Text>
                                                    <Text color="gray.400" fontSize="sm">{selectedTransaction.user?.email || '-'}</Text>
                                                    <Text color="gray.500" fontSize="sm">User ID: {selectedTransaction.userId}</Text>
                                                </Box>
                                            </HStack>
                                        </CardBody>
                                    </Card>
                                </Box>

                                {/* Additional Info */}
                                {selectedTransaction.orderId && (
                                    <>
                                        <Divider borderColor="gray.700" />
                                        <Box>
                                            <Text color="gray.500" fontSize="xs" textTransform="uppercase" mb={2}>Related Order</Text>
                                            <Flex justify="space-between">
                                                <Text color="gray.400">Order ID</Text>
                                                <Text color="purple.400" fontFamily="mono">{selectedTransaction.orderId}</Text>
                                            </Flex>
                                        </Box>
                                    </>
                                )}
                            </VStack>
                        )}
                    </ModalBody>
                </ModalContent>
            </Modal>
        </Box>
    );
};

export default TransactionsPage;
