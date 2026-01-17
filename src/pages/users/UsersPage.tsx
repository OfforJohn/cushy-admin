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
    Avatar,
    Badge,
    useToast,
    useDisclosure,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalCloseButton,
    FormControl,
    FormLabel,
    Textarea,
    Table,
    Thead,
    Tbody,
    Tr,
    Th,
    Td,
    Card,
    CardBody,
    Divider,
    Spinner,
    SimpleGrid,
} from '@chakra-ui/react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
    Search,
    Download,
    RefreshCw,
    Wallet,
    Plus,
    Users,
    UserCheck,
    Clock,
    DollarSign,
    Activity,
    ArrowLeft,
    ChevronLeft,
    ChevronRight,
    Calendar,
} from 'lucide-react';
import { adminApi } from '../../api/admin.api';
import { formatCurrency, formatDateTime, formatFullName, formatPhoneNumber } from '../../utils/formatters';
import { UserRoles } from '../../types/user.types';
import { useLocationFilter, matchesLocationFilter } from '../../context/LocationContext';
import { useNavigate } from 'react-router-dom';

interface UserListItem {
    id?: string;
    firstName?: string;
    lastName?: string;
    name?: string;
    fullName?: string;
    email: string;
    mobile?: string;
    phone?: string;
    phoneNumber?: string;
    location?: string;
    userRole?: UserRoles;
    isVerified?: boolean;
    status?: string; // "Active" or "Inactive" from backend
    createdAt?: string;
    walletBalance?: string | number;
    ordersCount?: number;
    lastActive?: string;
}

interface ManualCreditEntry {
    id: string;
    date: string;
    user: {
        name: string;
        phone: string;
    };
    amount: number;
    reason: string;
    status: 'Completed' | 'Pending Approval' | 'Rejected';
    initiatedBy: string;
}

// Error Boundary to catch errors
class ErrorBoundary extends React.Component<
    { children: React.ReactNode },
    { hasError: boolean; error: Error | null }
> {
    constructor(props: { children: React.ReactNode }) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: Error) {
        return { hasError: true, error };
    }

    render() {
        if (this.state.hasError) {
            return (
                <Box p={8} bg="red.900" borderRadius="lg" m={4}>
                    <Text color="red.100" fontSize="xl" fontWeight="bold" mb={4}>
                        ⚠️ Error on Users Page
                    </Text>
                    <Text color="red.200" mb={2}>
                        Something went wrong. Please copy this error:
                    </Text>
                    <Box bg="gray.900" p={4} borderRadius="md" fontFamily="mono" fontSize="sm">
                        <Text color="red.300" whiteSpace="pre-wrap">
                            {this.state.error?.message}
                        </Text>
                        <Text color="gray.400" mt={2} whiteSpace="pre-wrap" fontSize="xs">
                            {this.state.error?.stack}
                        </Text>
                    </Box>
                </Box>
            );
        }
        return this.props.children;
    }
}

const UsersPageContent: React.FC = () => {
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [registrationFilter, setRegistrationFilter] = useState<string>('');
    const [lastActiveFilter, setLastActiveFilter] = useState<string>('');
    const [walletFilter, setWalletFilter] = useState<string>('');
    const [searchQuery, setSearchQuery] = useState('');

    // Manual Credit Modal state
    const { isOpen: isManualCreditOpen, onOpen: onManualCreditOpen, onClose: onManualCreditClose } = useDisclosure();
    const [creditSearch, setCreditSearch] = useState('');
    const [creditAmount, setCreditAmount] = useState('');
    const [creditReference, setCreditReference] = useState('REF-2024-001');
    const [creditReason, setCreditReason] = useState('');
    const [creditNotes, setCreditNotes] = useState('');

    const toast = useToast();
    const queryClient = useQueryClient();
    const navigate = useNavigate();
    const { selectedLocation } = useLocationFilter();

    // Fetch dashboard stats for accurate KPI cards (same as Overview page)
    const { data: statsData, isLoading: statsLoading } = useQuery({
        queryKey: ['dashboardStats'],
        queryFn: () => adminApi.getDashboardStats('7d'),
    });

    // Fetch ALL user summaries for proper search and filtering (use large page size)
    const { data: usersData, isLoading: usersLoading, refetch } = useQuery({
        queryKey: ['userSummaries'],
        queryFn: () => adminApi.getUserSummaries(1, 1000), // Fetch all users
    });

    // Extract users array and pagination info - handle different response structures
    const extractUsersAndPagination = (): { users: UserListItem[]; total: number } => {
        if (!usersData) return { users: [], total: 0 };

        let users: UserListItem[] = [];
        let total = 0;

        // Extract users array - cast to any to handle flexible response structure
        const rawData: any = usersData.data || usersData;
        if (Array.isArray(rawData)) {
            users = rawData;
            total = rawData.length;
        } else if (rawData && rawData.users && Array.isArray(rawData.users)) {
            users = rawData.users;
            total = rawData.pagination?.total || rawData.users.length;
        } else if (rawData && Array.isArray(rawData.data)) {
            users = rawData.data;
            total = rawData.pagination?.total || rawData.data.length;
        }

        return { users, total };
    };

    const { users, total: totalUsersFromApi } = extractUsersAndPagination();

    // Safe number parsing for wallet balance in table rows
    const parseWalletBalance = (balance: any): number => {
        if (typeof balance === 'number' && !isNaN(balance)) return balance;
        if (typeof balance === 'string') {
            const parsed = parseFloat(balance.replace(/[^0-9.-]/g, ''));
            return isNaN(parsed) ? 0 : parsed;
        }
        return 0;
    };

    // Get user name from various possible fields
    const getUserName = (user: UserListItem): string => {
        // Try fullName first
        if (user.fullName) return user.fullName;
        // Try name field
        if (user.name) return user.name;
        // Try firstName + lastName
        if (user.firstName || user.lastName) {
            return formatFullName(user.firstName, user.lastName);
        }
        // Fallback to email prefix
        if (user.email) {
            return user.email.split('@')[0];
        }
        return 'N/A';
    };

    // Get user phone from various possible fields
    const getUserPhone = (user: UserListItem): string => {
        // Backend already formats phone as "+234 xxx xxx xxxx"
        if (user.phone) return user.phone;
        const phone = user.mobile || user.phoneNumber;
        return phone ? formatPhoneNumber(phone) : 'N/A';
    };

    // Check if user is active (handles both status string and isVerified boolean)
    const isUserActive = (user: UserListItem): boolean => {
        // Check status string first (from backend)
        if (user.status) {
            return user.status.toLowerCase() === 'active';
        }
        // Fallback to isVerified boolean
        return user.isVerified === true;
    };

    // Combined loading state
    const isLoading = statsLoading || usersLoading;

    // Extract stats from dashboard API (same as Overview page)
    const stats = statsData?.data;
    const totalUsers = stats?.usersCount || 0;
    const totalWalletBalance = stats?.totalBalanceResult || 0;
    const activeUsersData = stats?.activeUsersResult;
    const activeUsers = activeUsersData?.activeUsers || 0;
    const activeRate = totalUsers > 0 ? ((activeUsers / totalUsers) * 100).toFixed(1) : '0';

    // Calculate total orders from table users (for display only)
    const totalOrdersFromTable = Array.isArray(users)
        ? users.reduce((sum, u) => sum + (typeof u.ordersCount === 'number' ? u.ordersCount : 0), 0)
        : 0;

    // Helper to parse days from lastActive string like "2 hours ago", "3 days ago"
    const parseLastActiveDays = (lastActive: string | undefined): number => {
        if (!lastActive) return 999; // Treat as very old
        const lower = lastActive.toLowerCase();
        if (lower.includes('just now') || lower.includes('hour')) return 0;
        const daysMatch = lower.match(/(\d+)\s*day/);
        if (daysMatch) return parseInt(daysMatch[1]);
        return 999;
    };

    // Filter users - exclude VENDOR and ADMIN roles (only show CUSTOMER users)
    const filteredUsers = Array.isArray(users) ? users.filter(user => {
        // Only include CUSTOMER users (exclude VENDOR, ADMIN, DOCTOR, THIRD_PARTY)
        const userRole = user.userRole?.toUpperCase();
        if (userRole === 'VENDOR' || userRole === 'ADMIN' || userRole === 'DOCTOR') {
            return false;
        }

        // Search by name, email, phone
        const userName = getUserName(user).toLowerCase();
        const userPhone = user.mobile || user.phone || user.phoneNumber || '';
        const matchesSearch = !searchQuery ||
            userName.includes(searchQuery.toLowerCase()) ||
            user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            userPhone.includes(searchQuery);

        // Registration date filter
        let matchesRegistration = true;
        if (registrationFilter && user.createdAt) {
            const createdDate = new Date(user.createdAt);
            const now = new Date();
            const daysDiff = Math.floor((now.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24));
            matchesRegistration = daysDiff <= parseInt(registrationFilter);
        }

        // Last active filter
        let matchesLastActive = true;
        if (lastActiveFilter) {
            const activeDays = parseLastActiveDays(user.lastActive);
            matchesLastActive = activeDays <= parseInt(lastActiveFilter);
        }

        // Wallet balance filter
        let matchesWallet = true;
        if (walletFilter) {
            const balance = parseWalletBalance(user.walletBalance);
            if (walletFilter === 'zero') matchesWallet = balance === 0;
            else if (walletFilter === 'low') matchesWallet = balance > 0 && balance <= 5000;
            else if (walletFilter === 'medium') matchesWallet = balance > 5000 && balance <= 50000;
            else if (walletFilter === 'high') matchesWallet = balance > 50000;
        }

        // Global location filter
        const matchesLocation = matchesLocationFilter(user.location, selectedLocation);

        return matchesSearch && matchesRegistration && matchesLastActive && matchesWallet && matchesLocation;
    }) : [];

    // Sort by wallet balance (highest first by default)
    const sortedUsers = [...filteredUsers].sort((a, b) => {
        const balanceA = parseWalletBalance(a.walletBalance);
        const balanceB = parseWalletBalance(b.walletBalance);
        return balanceB - balanceA;
    });

    // Pagination
    const totalPages = Math.ceil(sortedUsers.length / pageSize);
    const paginatedUsers = sortedUsers.slice((page - 1) * pageSize, page * pageSize);

    // Mock recent manual credits data
    const recentCredits: ManualCreditEntry[] = [
        {
            id: '1',
            date: 'Oct 21, 2:30 PM',
            user: { name: 'Michael Chen', phone: '+234 803 456 7890' },
            amount: 25000,
            reason: 'Order Refund',
            status: 'Completed',
            initiatedBy: 'Admin User',
        },
        {
            id: '2',
            date: 'Oct 21, 11:15 AM',
            user: { name: 'Lisa Wang', phone: '+234 804 567 8901' },
            amount: 75000,
            reason: 'Service Compensation',
            status: 'Pending Approval',
            initiatedBy: 'Ops Manager',
        },
        {
            id: '3',
            date: 'Oct 20, 4:45 PM',
            user: { name: 'David Smith', phone: '+234 805 678 9012' },
            amount: 5000,
            reason: 'Promotional Credit',
            status: 'Completed',
            initiatedBy: 'Marketing',
        },
    ];

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Completed':
                return 'green.400';
            case 'Pending Approval':
                return 'orange.400';
            case 'Rejected':
                return 'red.400';
            default:
                return 'gray.400';
        }
    };

    const handleProcessCredit = () => {
        if (!creditAmount || !creditReason || !creditNotes) {
            toast({
                title: 'Please fill all required fields',
                status: 'warning',
                duration: 2000,
            });
            return;
        }
        toast({
            title: 'Credit processed successfully',
            description: 'The wallet credit has been submitted for approval.',
            status: 'success',
            duration: 3000,
        });
        onManualCreditClose();
        setCreditAmount('');
        setCreditReason('');
        setCreditNotes('');
    };

    const formatRelativeTime = (dateStr: string) => {
        if (!dateStr) return 'N/A';
        const now = new Date();
        const past = new Date(dateStr);
        if (isNaN(past.getTime())) return 'N/A';
        const diffMs = now.getTime() - past.getTime();
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        const diffDays = Math.floor(diffHours / 24);

        if (diffHours < 1) return 'Just now';
        if (diffHours < 24) return `${diffHours} hours ago`;
        if (diffDays === 1) return '1 day ago';
        return `${diffDays} days ago`;
    };

    const clearFilters = () => {
        setRegistrationFilter('');
        setLastActiveFilter('');
        setWalletFilter('');
        setSearchQuery('');
        setPage(1);
    };

    // Export users to CSV
    const exportToCSV = () => {
        if (sortedUsers.length === 0) {
            toast({
                title: 'No data to export',
                status: 'warning',
                duration: 2000,
            });
            return;
        }

        // Create CSV headers
        const headers = ['Name', 'Email', 'Phone', 'Wallet Balance', 'Orders', 'Location', 'Last Active'];

        // Create CSV rows
        const rows = sortedUsers.map(user => [
            getUserName(user),
            user.email || 'N/A',
            getUserPhone(user),
            typeof user.walletBalance === 'string' ? user.walletBalance : `₦${parseWalletBalance(user.walletBalance).toLocaleString()}`,
            user.ordersCount || 0,
            user.location || 'N/A',
            user.lastActive || 'N/A'
        ]);

        // Combine headers and rows
        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
        ].join('\n');

        // Create and download file
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `users_export_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        toast({
            title: 'Export successful',
            description: `${sortedUsers.length} users exported to CSV`,
            status: 'success',
            duration: 2000,
        });
    };

    return (
        <Box>
            {/* Header */}
            <Flex justify="space-between" align="center" mb={6}>
                <HStack spacing={3}>
                    <Heading size="lg" color="gray.100">
                        Users & Wallet Management
                    </Heading>
                    <Badge colorScheme="green" variant="solid" fontSize="xs" px={2}>
                        Live
                    </Badge>
                </HStack>
                <HStack spacing={3}>
                    <IconButton
                        aria-label="Refresh"
                        icon={<RefreshCw size={16} />}
                        variant="ghost"
                        size="sm"
                        onClick={() => refetch()}
                    />
                </HStack>
            </Flex>

            {/* KPI Cards */}
            <SimpleGrid columns={{ base: 1, md: 3, lg: 5 }} spacing={4} mb={6}>
                {/* Total Users (Lifetime) */}
                <Card bg="gray.900" borderColor="gray.800" borderWidth="1px">
                    <CardBody py={4}>
                        <Flex justify="space-between" align="start">
                            <Box>
                                <Text fontSize="xs" color="gray.500" mb={1}>Total Users</Text>
                                <Text fontSize="2xl" fontWeight="bold" color="gray.100">
                                    {totalUsers.toLocaleString()}
                                </Text>
                                <Text fontSize="xs" color="gray.500">Lifetime registered</Text>
                            </Box>
                            <Box p={2} bg="rgba(128, 90, 213, 0.2)" borderRadius="lg">
                                <Icon as={Users} color="purple.400" boxSize={5} />
                            </Box>
                        </Flex>
                    </CardBody>
                </Card>

                {/* Active Users */}
                <Card bg="gray.900" borderColor="gray.800" borderWidth="1px">
                    <CardBody py={4}>
                        <Flex justify="space-between" align="start">
                            <Box>
                                <Text fontSize="xs" color="gray.500" mb={1}>Active Users</Text>
                                <Text fontSize="2xl" fontWeight="bold" color="gray.100">
                                    {activeUsers.toLocaleString()}
                                </Text>
                                <Text fontSize="xs" color="gray.500">{activeRate}% verified</Text>
                            </Box>
                            <Box p={2} bg="rgba(72, 187, 120, 0.2)" borderRadius="lg">
                                <Icon as={UserCheck} color="green.400" boxSize={5} />
                            </Box>
                        </Flex>
                    </CardBody>
                </Card>

                {/* Total Wallet Balance */}
                <Card bg="gray.900" borderColor="gray.800" borderWidth="1px">
                    <CardBody py={4}>
                        <Flex justify="space-between" align="start">
                            <Box>
                                <Text fontSize="xs" color="gray.500" mb={1}>Total Wallet Balance</Text>
                                <Text fontSize="2xl" fontWeight="bold" color="gray.100">
                                    {formatCurrency(totalWalletBalance)}
                                </Text>
                                <Text fontSize="xs" color="gray.500">Across all users</Text>
                            </Box>
                            <Box p={2} bg="rgba(237, 137, 54, 0.2)" borderRadius="lg">
                                <Icon as={Wallet} color="orange.400" boxSize={5} />
                            </Box>
                        </Flex>
                    </CardBody>
                </Card>

                {/* Total Orders */}
                <Card bg="gray.900" borderColor="gray.800" borderWidth="1px">
                    <CardBody py={4}>
                        <Flex justify="space-between" align="start">
                            <Box>
                                <Text fontSize="xs" color="gray.500" mb={1}>Total Orders</Text>
                                <Text fontSize="2xl" fontWeight="bold" color="gray.100">
                                    {totalOrdersFromTable.toLocaleString()}
                                </Text>
                                <Text fontSize="xs" color="gray.500">By all users</Text>
                            </Box>
                            <Box p={2} bg="rgba(66, 153, 225, 0.2)" borderRadius="lg">
                                <Icon as={Activity} color="blue.400" boxSize={5} />
                            </Box>
                        </Flex>
                    </CardBody>
                </Card>

                {/* Pending Payouts */}
                <Card bg="gray.900" borderColor="gray.800" borderWidth="1px">
                    <CardBody py={4}>
                        <Flex justify="space-between" align="start">
                            <Box>
                                <Text fontSize="xs" color="gray.500" mb={1}>Pending Payouts</Text>
                                <Text fontSize="2xl" fontWeight="bold" color="gray.100">
                                    ₦127K
                                </Text>
                                <Text fontSize="xs" color="orange.400">Requires approval</Text>
                            </Box>
                            <Box p={2} bg="rgba(236, 201, 75, 0.2)" borderRadius="lg">
                                <Icon as={Clock} color="yellow.400" boxSize={5} />
                            </Box>
                        </Flex>
                    </CardBody>
                </Card>
            </SimpleGrid>

            {/* Main Content - Two Column Layout */}
            <Flex gap={6} flexDir={{ base: 'column', xl: 'row' }}>
                {/* Left Column - Users Management */}
                <Box flex={2}>
                    <Card bg="gray.900" borderColor="gray.800" borderWidth="1px">
                        <CardBody>
                            {/* Section Header */}
                            <Flex justify="space-between" align={{ base: 'start', md: 'center' }} mb={4} flexDir={{ base: 'column', md: 'row' }} gap={3}>
                                <Text fontSize="lg" fontWeight="600" color="gray.100">Users Management</Text>
                                <HStack spacing={3} flexWrap="wrap">
                                    <InputGroup maxW={{ base: '100%', md: '200px' }} size="sm">
                                        <InputLeftElement>
                                            <Icon as={Search} color="gray.500" boxSize={4} />
                                        </InputLeftElement>
                                        <Input
                                            placeholder="Search users..."
                                            value={searchQuery}
                                            onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
                                            bg="gray.800"
                                            borderColor="gray.700"
                                        />
                                    </InputGroup>
                                    <Button
                                        leftIcon={<Plus size={16} />}
                                        colorScheme="green"
                                        size="sm"
                                        display={{ base: 'none', md: 'flex' }}
                                        onClick={onManualCreditOpen}
                                    >
                                        Manual Credit
                                    </Button>
                                    <IconButton
                                        aria-label="Manual Credit"
                                        icon={<Plus size={16} />}
                                        colorScheme="green"
                                        size="sm"
                                        display={{ base: 'flex', md: 'none' }}
                                        onClick={onManualCreditOpen}
                                    />
                                </HStack>
                            </Flex>

                            {/* Filters Row */}
                            <Flex gap={2} mb={4} flexWrap="wrap" align="center">
                                <Select
                                    placeholder="Registered"
                                    size="sm"
                                    maxW={{ base: '120px', md: '140px' }}
                                    bg="gray.800"
                                    borderColor="gray.700"
                                    value={registrationFilter}
                                    onChange={(e) => { setRegistrationFilter(e.target.value); setPage(1); }}
                                >
                                    <option value="1">Today</option>
                                    <option value="7">Last 7 days</option>
                                    <option value="30">Last 30 days</option>
                                    <option value="90">Last 90 days</option>
                                    <option value="365">Last year</option>
                                </Select>
                                <Select
                                    placeholder="Last Active"
                                    size="sm"
                                    maxW={{ base: '120px', md: '140px' }}
                                    bg="gray.800"
                                    borderColor="gray.700"
                                    value={lastActiveFilter}
                                    onChange={(e) => { setLastActiveFilter(e.target.value); setPage(1); }}
                                >
                                    <option value="0">Today</option>
                                    <option value="7">Last 7 days</option>
                                    <option value="30">Last 30 days</option>
                                    <option value="90">Last 90 days</option>
                                </Select>
                                <Select
                                    placeholder="Wallet"
                                    size="sm"
                                    maxW={{ base: '110px', md: '150px' }}
                                    bg="gray.800"
                                    borderColor="gray.700"
                                    value={walletFilter}
                                    onChange={(e) => { setWalletFilter(e.target.value); setPage(1); }}
                                >
                                    <option value="high">High (&gt;₦50K)</option>
                                    <option value="medium">₦5K - ₦50K</option>
                                    <option value="low">₦1 - ₦5K</option>
                                    <option value="zero">Zero</option>
                                </Select>
                                {(registrationFilter || lastActiveFilter || walletFilter || searchQuery) && (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        color="gray.400"
                                        onClick={clearFilters}
                                        px={2}
                                    >
                                        Clear
                                    </Button>
                                )}
                                <Button
                                    leftIcon={<Download size={14} />}
                                    variant="outline"
                                    size="sm"
                                    borderColor="gray.700"
                                    ml="auto"
                                    onClick={exportToCSV}
                                    display={{ base: 'none', md: 'flex' }}
                                >
                                    Export CSV
                                </Button>
                                <IconButton
                                    aria-label="Export CSV"
                                    icon={<Download size={14} />}
                                    variant="outline"
                                    size="sm"
                                    borderColor="gray.700"
                                    ml="auto"
                                    onClick={exportToCSV}
                                    display={{ base: 'flex', md: 'none' }}
                                />
                            </Flex>

                            {/* Users Table */}
                            <Box overflowX="auto">
                                <Table variant="simple" size="sm">
                                    <Thead>
                                        <Tr>
                                            <Th borderColor="gray.700" color="gray.500" fontSize="xs">USER</Th>
                                            <Th borderColor="gray.700" color="gray.500" fontSize="xs">REGISTERED</Th>
                                            <Th borderColor="gray.700" color="gray.500" fontSize="xs">WALLET</Th>
                                            <Th borderColor="gray.700" color="gray.500" fontSize="xs">ORDERS</Th>
                                            <Th borderColor="gray.700" color="gray.500" fontSize="xs">LOCATION</Th>
                                            <Th borderColor="gray.700" color="gray.500" fontSize="xs">LAST ACTIVE</Th>
                                        </Tr>
                                    </Thead>
                                    <Tbody>
                                        {isLoading ? (
                                            <Tr>
                                                <Td colSpan={6} textAlign="center" py={8} borderColor="gray.800">
                                                    <Spinner color="purple.400" />
                                                </Td>
                                            </Tr>
                                        ) : paginatedUsers.length === 0 ? (
                                            <Tr>
                                                <Td colSpan={6} textAlign="center" py={8} borderColor="gray.800">
                                                    <Text color="gray.500">No users found</Text>
                                                </Td>
                                            </Tr>
                                        ) : (
                                            paginatedUsers.map((user) => (
                                                <Tr key={user.id} _hover={{ bg: 'gray.800' }}>
                                                    <Td borderColor="gray.800">
                                                        <HStack spacing={3}>
                                                            <Avatar
                                                                size="sm"
                                                                name={getUserName(user)}
                                                                bg="purple.600"
                                                            />
                                                            <VStack align="start" spacing={0}>
                                                                <Text fontSize="sm" fontWeight="500" color="gray.100">
                                                                    {getUserName(user)}
                                                                </Text>
                                                                <Text fontSize="xs" color="gray.500">
                                                                    {getUserPhone(user)}
                                                                </Text>
                                                                <Text fontSize="xs" color="blue.400">
                                                                    {user.email || 'N/A'}
                                                                </Text>
                                                            </VStack>
                                                        </HStack>
                                                    </Td>
                                                    <Td borderColor="gray.800">
                                                        <Text fontSize="sm" color="gray.400">
                                                            {user.createdAt ? formatDateTime(user.createdAt) : 'N/A'}
                                                        </Text>
                                                    </Td>
                                                    <Td borderColor="gray.800">
                                                        <Text fontSize="sm" fontWeight="500" color="gray.100">
                                                            {typeof user.walletBalance === 'string' ? user.walletBalance : formatCurrency(parseWalletBalance(user.walletBalance))}
                                                        </Text>
                                                    </Td>
                                                    <Td borderColor="gray.800">
                                                        <Text fontSize="sm" color="gray.300">
                                                            {user.ordersCount || 0}
                                                        </Text>
                                                    </Td>
                                                    <Td borderColor="gray.800">
                                                        <Text fontSize="sm" color="gray.500">
                                                            {user.location || 'N/A'}
                                                        </Text>
                                                    </Td>
                                                    <Td borderColor="gray.800">
                                                        <Text fontSize="sm" color="gray.500">
                                                            {user.lastActive || 'N/A'}
                                                        </Text>
                                                    </Td>
                                                </Tr>
                                            ))
                                        )}
                                    </Tbody>
                                </Table>
                            </Box>

                            {/* Pagination */}
                            {sortedUsers.length > 0 && (
                                <Flex justify="space-between" align={{ base: 'start', md: 'center' }} mt={4} pt={4} borderTopWidth="1px" borderColor="gray.800" flexDir={{ base: 'column', md: 'row' }} gap={3}>
                                    <Flex gap={2} align="center" flexWrap="wrap">
                                        <Text fontSize={{ base: 'xs', md: 'sm' }} color="gray.500">
                                            Showing {((page - 1) * pageSize) + 1} - {Math.min(page * pageSize, sortedUsers.length)} of {sortedUsers.length} users
                                            {totalUsersFromApi > 0 && sortedUsers.length !== totalUsersFromApi && ` (${totalUsersFromApi} total)`}
                                        </Text>
                                        <Select
                                            size="xs"
                                            w="70px"
                                            value={pageSize}
                                            onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }}
                                            bg="gray.800"
                                            borderColor="gray.700"
                                        >
                                            <option value={10}>10</option>
                                            <option value={25}>25</option>
                                            <option value={50}>50</option>
                                            <option value={100}>100</option>
                                        </Select>
                                        <Text fontSize="sm" color="gray.500" display={{ base: 'none', sm: 'inline' }}>per page</Text>
                                    </Flex>
                                    <HStack spacing={2}>
                                        <IconButton
                                            aria-label="Previous page"
                                            icon={<ChevronLeft size={16} />}
                                            size="sm"
                                            variant="outline"
                                            borderColor="gray.700"
                                            isDisabled={page === 1}
                                            onClick={() => setPage(p => Math.max(1, p - 1))}
                                        />
                                        <HStack spacing={1} display={{ base: 'none', sm: 'flex' }}>
                                            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                                let pageNum = i + 1;
                                                if (totalPages > 5) {
                                                    if (page <= 3) pageNum = i + 1;
                                                    else if (page >= totalPages - 2) pageNum = totalPages - 4 + i;
                                                    else pageNum = page - 2 + i;
                                                }
                                                return (
                                                    <Button
                                                        key={pageNum}
                                                        size="sm"
                                                        variant={page === pageNum ? 'solid' : 'ghost'}
                                                        colorScheme={page === pageNum ? 'purple' : undefined}
                                                        onClick={() => setPage(pageNum)}
                                                        minW="32px"
                                                    >
                                                        {pageNum}
                                                    </Button>
                                                );
                                            })}
                                        </HStack>
                                        <Text fontSize="sm" color="gray.400" display={{ base: 'inline', sm: 'none' }}>
                                            {page} / {totalPages}
                                        </Text>
                                        <IconButton
                                            aria-label="Next page"
                                            icon={<ChevronRight size={16} />}
                                            size="sm"
                                            variant="outline"
                                            borderColor="gray.700"
                                            isDisabled={page === totalPages}
                                            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                        />
                                    </HStack>
                                </Flex>
                            )}
                        </CardBody>
                    </Card>
                </Box>

                {/* Right Column - Quick Wallet Actions */}
                <Box flex={1} minW="300px">
                    <Card bg="gray.900" borderColor="gray.800" borderWidth="1px">
                        <CardBody>
                            <Text fontSize="lg" fontWeight="600" color="gray.100" mb={4}>
                                Quick Wallet Actions
                            </Text>

                            <VStack spacing={3}>
                                <Button
                                    w="full"
                                    colorScheme="green"
                                    leftIcon={<Plus size={16} />}
                                    onClick={onManualCreditOpen}
                                >
                                    Manual Credit
                                </Button>

                                <Button
                                    w="full"
                                    variant="outline"
                                    borderColor="gray.600"
                                    leftIcon={<Wallet size={16} />}
                                    color="gray.300"
                                    onClick={() => navigate('/users/transactions')}
                                >
                                    View All Transactions
                                </Button>

                                <Button
                                    w="full"
                                    variant="outline"
                                    borderColor="gray.600"
                                    leftIcon={<DollarSign size={16} />}
                                    color="gray.300"
                                >
                                    Pending Payouts
                                </Button>

                                <Button
                                    w="full"
                                    variant="outline"
                                    borderColor="gray.600"
                                    leftIcon={<Clock size={16} />}
                                    color="gray.300"
                                >
                                    Refund Requests
                                </Button>
                            </VStack>

                            <Divider my={4} borderColor="gray.700" />

                            {/* Recent Activity */}
                            <Text fontSize="sm" fontWeight="600" color="gray.400" mb={3}>
                                Recent Activity
                            </Text>
                            <VStack spacing={2} align="stretch">
                                <Flex justify="space-between" align="center" py={2}>
                                    <HStack spacing={2}>
                                        <Box w={2} h={2} borderRadius="full" bg="green.400" />
                                        <Text fontSize="xs" color="gray.400">Credit processed</Text>
                                    </HStack>
                                    <Text fontSize="xs" color="gray.500">2m ago</Text>
                                </Flex>
                                <Flex justify="space-between" align="center" py={2}>
                                    <HStack spacing={2}>
                                        <Box w={2} h={2} borderRadius="full" bg="orange.400" />
                                        <Text fontSize="xs" color="gray.400">Payout pending</Text>
                                    </HStack>
                                    <Text fontSize="xs" color="gray.500">15m ago</Text>
                                </Flex>
                                <Flex justify="space-between" align="center" py={2}>
                                    <HStack spacing={2}>
                                        <Box w={2} h={2} borderRadius="full" bg="blue.400" />
                                        <Text fontSize="xs" color="gray.400">Refund approved</Text>
                                    </HStack>
                                    <Text fontSize="xs" color="gray.500">1h ago</Text>
                                </Flex>
                            </VStack>
                        </CardBody>
                    </Card>
                </Box>
            </Flex>

            {/* Manual Credit Modal */}
            <Modal isOpen={isManualCreditOpen} onClose={onManualCreditClose} size="4xl" scrollBehavior="inside">
                <ModalOverlay />
                <ModalContent bg="gray.900" borderColor="gray.800" maxH="90vh">
                    <ModalHeader borderBottomWidth="1px" borderColor="gray.700">
                        <HStack spacing={3}>
                            <IconButton
                                aria-label="Back"
                                icon={<ArrowLeft size={18} />}
                                variant="ghost"
                                size="sm"
                                onClick={onManualCreditClose}
                                color="gray.400"
                            />
                            <Box>
                                <HStack spacing={2}>
                                    <Text fontSize="lg" fontWeight="600" color="gray.100">Manual Wallet Credit</Text>
                                    <Badge colorScheme="orange" variant="solid" fontSize="xs">
                                        Requires Approval
                                    </Badge>
                                </HStack>
                            </Box>
                        </HStack>
                    </ModalHeader>
                    <ModalCloseButton color="gray.400" />
                    <ModalBody py={6}>
                        <VStack spacing={6} align="stretch">
                            {/* Credit User Wallet Form */}
                            <Box bg="gray.800" p={6} borderRadius="lg" borderWidth="1px" borderColor="gray.700">
                                <Text fontSize="md" fontWeight="600" color="purple.400" mb={1}>
                                    Credit User Wallet
                                </Text>
                                <Text fontSize="sm" color="gray.400" mb={4}>
                                    Manually add credit to a user's wallet. This action requires dual approval for amounts above ₦50,000.
                                </Text>

                                {/* Search User */}
                                <FormControl mb={4}>
                                    <FormLabel fontSize="sm" color="gray.300">Search User</FormLabel>
                                    <InputGroup>
                                        <InputLeftElement>
                                            <Icon as={Search} color="gray.500" boxSize={4} />
                                        </InputLeftElement>
                                        <Input
                                            placeholder="Search by name, phone, or email..."
                                            value={creditSearch}
                                            onChange={(e) => setCreditSearch(e.target.value)}
                                            bg="gray.900"
                                            borderColor="gray.600"
                                            color="gray.100"
                                            _placeholder={{ color: 'gray.500' }}
                                        />
                                    </InputGroup>
                                </FormControl>

                                {/* Amount and Reference */}
                                <SimpleGrid columns={2} spacing={4} mb={4}>
                                    <FormControl>
                                        <FormLabel fontSize="sm" color="gray.300">Credit Amount</FormLabel>
                                        <InputGroup>
                                            <InputLeftElement>
                                                <Text color="gray.400" fontSize="sm">₦</Text>
                                            </InputLeftElement>
                                            <Input
                                                placeholder="0.00"
                                                value={creditAmount}
                                                onChange={(e) => setCreditAmount(e.target.value)}
                                                bg="gray.900"
                                                borderColor="gray.600"
                                                color="gray.100"
                                                type="number"
                                                _placeholder={{ color: 'gray.500' }}
                                            />
                                        </InputGroup>
                                        <Text fontSize="xs" color="orange.400" mt={1}>Minimum: ₦100</Text>
                                    </FormControl>
                                    <FormControl>
                                        <FormLabel fontSize="sm" color="gray.300">Transaction Reference</FormLabel>
                                        <Input
                                            value={creditReference}
                                            onChange={(e) => setCreditReference(e.target.value)}
                                            bg="gray.900"
                                            borderColor="gray.600"
                                            color="gray.100"
                                        />
                                        <Text fontSize="xs" color="gray.500" mt={1}>Optional: Internal reference for tracking</Text>
                                    </FormControl>
                                </SimpleGrid>

                                {/* Reason */}
                                <FormControl mb={4}>
                                    <FormLabel fontSize="sm" color="gray.300">Reason for Credit *</FormLabel>
                                    <Select
                                        placeholder="Select reason..."
                                        value={creditReason}
                                        onChange={(e) => setCreditReason(e.target.value)}
                                        bg="gray.900"
                                        borderColor="gray.600"
                                        color="gray.100"
                                    >
                                        <option value="refund">Order Refund</option>
                                        <option value="compensation">Service Compensation</option>
                                        <option value="promotional">Promotional Credit</option>
                                        <option value="correction">Account Correction</option>
                                        <option value="other">Other</option>
                                    </Select>
                                </FormControl>

                                {/* Notes */}
                                <FormControl mb={4}>
                                    <FormLabel fontSize="sm" color="gray.300">Additional Notes *</FormLabel>
                                    <Textarea
                                        placeholder="Provide detailed explanation for this credit transaction..."
                                        value={creditNotes}
                                        onChange={(e) => setCreditNotes(e.target.value)}
                                        bg="gray.900"
                                        borderColor="gray.600"
                                        color="gray.100"
                                        rows={3}
                                        _placeholder={{ color: 'gray.500' }}
                                    />
                                    <Text fontSize="xs" color="gray.500" mt={1}>
                                        Required for audit trail and approval process
                                    </Text>
                                </FormControl>

                                {/* Action Buttons */}
                                <HStack spacing={3} justify="flex-start">
                                    <Button variant="outline" borderColor="gray.600" color="gray.300" onClick={onManualCreditClose}>
                                        Cancel
                                    </Button>
                                    <Button
                                        colorScheme="purple"
                                        leftIcon={<Plus size={16} />}
                                        onClick={handleProcessCredit}
                                    >
                                        Process Credit
                                    </Button>
                                </HStack>
                            </Box>

                            {/* Recent Manual Credits */}
                            <Box>
                                <Text fontSize="md" fontWeight="600" color="purple.400" mb={1}>
                                    Recent Manual Credits
                                </Text>
                                <Text fontSize="sm" color="gray.400" mb={4}>
                                    Last 10 manual credit transactions
                                </Text>

                                <Box overflowX="auto">
                                    <Table variant="simple" size="sm">
                                        <Thead>
                                            <Tr>
                                                <Th color="gray.500" fontSize="xs" borderColor="gray.700">DATE</Th>
                                                <Th color="gray.500" fontSize="xs" borderColor="gray.700">USER</Th>
                                                <Th color="gray.500" fontSize="xs" borderColor="gray.700">AMOUNT</Th>
                                                <Th color="gray.500" fontSize="xs" borderColor="gray.700">REASON</Th>
                                                <Th color="gray.500" fontSize="xs" borderColor="gray.700">STATUS</Th>
                                                <Th color="gray.500" fontSize="xs" borderColor="gray.700">INITIATED BY</Th>
                                            </Tr>
                                        </Thead>
                                        <Tbody>
                                            {recentCredits.map((credit) => (
                                                <Tr key={credit.id}>
                                                    <Td color="gray.300" borderColor="gray.700" fontSize="sm">
                                                        {credit.date}
                                                    </Td>
                                                    <Td borderColor="gray.700">
                                                        <HStack spacing={2}>
                                                            <Avatar size="xs" name={credit.user.name} />
                                                            <VStack align="start" spacing={0}>
                                                                <Text fontSize="sm" fontWeight="500" color="gray.100">
                                                                    {credit.user.name}
                                                                </Text>
                                                                <Text fontSize="xs" color="gray.500">
                                                                    {credit.user.phone}
                                                                </Text>
                                                            </VStack>
                                                        </HStack>
                                                    </Td>
                                                    <Td color="gray.100" fontWeight="500" borderColor="gray.700" fontSize="sm">
                                                        {formatCurrency(credit.amount)}
                                                    </Td>
                                                    <Td color="gray.300" borderColor="gray.700" fontSize="sm">
                                                        {credit.reason}
                                                    </Td>
                                                    <Td borderColor="gray.700">
                                                        <Text color={getStatusColor(credit.status)} fontSize="sm">
                                                            {credit.status}
                                                        </Text>
                                                    </Td>
                                                    <Td color="gray.400" borderColor="gray.700" fontSize="sm">
                                                        {credit.initiatedBy}
                                                    </Td>
                                                </Tr>
                                            ))}
                                        </Tbody>
                                    </Table>
                                </Box>
                            </Box>
                        </VStack>
                    </ModalBody>
                </ModalContent>
            </Modal>
        </Box>
    );
};

// Wrap with Error Boundary
export const UsersPage: React.FC = () => {
    return (
        <ErrorBoundary>
            <UsersPageContent />
        </ErrorBoundary>
    );
};

export default UsersPage;
