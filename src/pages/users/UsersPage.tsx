import React, { useState, useMemo } from 'react';
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
    Tabs,
    TabList,
    Tab,
    TabPanels,
    TabPanel,
    Popover,
    PopoverTrigger,
    PopoverContent,
    PopoverArrow,
    PopoverCloseButton,
    PopoverHeader,
    PopoverBody,
} from '@chakra-ui/react';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import {
    Search,
    Download,
    RefreshCw,
    Wallet,
    Plus,
    Minus,
    Users,
    UserCheck,
    Clock,
    DollarSign,
    Activity,
    ArrowLeft,
    ChevronLeft,
    ChevronRight,
    Calendar,
    Eye,
} from 'lucide-react';
import { adminApi } from '../../api/admin.api';
import { walletApi } from '../../api/wallet.api';
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

interface ManualFundingEntry {
    id: string;
    walletId: string;
    userId: string;
    amount: number;
    fundedBy: string;
    fundedById?: string;
    description: string;
    transactionReference: string;
    status: string;
    oldBalance: number;
    newBalance: number;
    currency: string;
    createdAt: string;
    updatedAt?: string;
}

export const UsersPage: React.FC = () => {
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [registrationFilter, setRegistrationFilter] = useState<string>('');
    const [lastActiveFilter, setLastActiveFilter] = useState<string>('');
    const [walletFilter, setWalletFilter] = useState<string>('');
    const [searchQuery, setSearchQuery] = useState('');

    // Manual Credit/Debit Modal state
    const { isOpen: isManualCreditOpen, onOpen: onManualCreditOpen, onClose: onManualCreditClose } = useDisclosure();
    const [creditSearch, setCreditSearch] = useState('');
    const [creditAmount, setCreditAmount] = useState('');
    const [creditReason, setCreditReason] = useState('');
    const [creditNotes, setCreditNotes] = useState('');
    const [selectedUser, setSelectedUser] = useState<UserListItem | null>(null);
    const [transactionType, setTransactionType] = useState<'credit' | 'debit'>('credit');
    const [showUserDropdown, setShowUserDropdown] = useState(false);

    // Wallet Actions Modal state
    const { isOpen: isWalletActionsOpen, onOpen: onWalletActionsOpen, onClose: onWalletActionsClose } = useDisclosure();
    const [selectedReason, setSelectedReason] = useState<{ description: string; reference: string } | null>(null);

    // Wallet Actions Modal filter & sort state
    const [walletActionsTypeFilter, setWalletActionsTypeFilter] = useState<'all' | 'credit' | 'debit'>('all');
    const [walletActionsStatusFilter, setWalletActionsStatusFilter] = useState<string>('all');
    const [walletActionsSearch, setWalletActionsSearch] = useState('');
    const [walletActionsSortBy, setWalletActionsSortBy] = useState<'date' | 'amount'>('date');
    const [walletActionsSortOrder, setWalletActionsSortOrder] = useState<'asc' | 'desc'>('desc');

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

    // Fetch manual fundings history
    const { data: manualFundingsData, isLoading: fundingsLoading, refetch: refetchFundings } = useQuery({
        queryKey: ['manualFundings'],
        queryFn: () => walletApi.getManualFundingHistory({ limit: 50 }),
    });

    // Extract manual fundings
    const manualFundings: ManualFundingEntry[] = useMemo(() => {
        if (!manualFundingsData?.data) return [];
        const data = manualFundingsData.data;
        if (Array.isArray(data)) return data;
        if (data.data && Array.isArray(data.data)) return data.data;
        return [];
    }, [manualFundingsData]);

    // Manual credit mutation
    const fundWalletMutation = useMutation({
        mutationFn: (data: { userId: string; amount: number; description: string }) =>
            walletApi.fundWallet({
                userId: data.userId,
                amount: data.amount,
                description: data.description,
            }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['manualFundings'] });
            queryClient.invalidateQueries({ queryKey: ['userSummaries'] });
            toast({
                title: 'Credit processed successfully',
                description: 'The wallet has been credited.',
                status: 'success',
                duration: 3000,
            });
            onManualCreditClose();
            resetCreditForm();
        },
        onError: (error: any) => {
            toast({
                title: 'Transaction failed',
                description: error?.response?.data?.message || 'Failed to process transaction',
                status: 'error',
                duration: 3000,
            });
        },
    });

    // Manual debit mutation
    const debitWalletMutation = useMutation({
        mutationFn: (data: { userId: string; amount: number; description: string }) =>
            walletApi.debitWallet({
                userId: data.userId,
                amount: data.amount,
                description: data.description,
            }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['manualFundings'] });
            queryClient.invalidateQueries({ queryKey: ['userSummaries'] });
            toast({
                title: 'Debit processed successfully',
                description: 'The wallet has been debited.',
                status: 'success',
                duration: 3000,
            });
            onManualCreditClose();
            resetCreditForm();
        },
        onError: (error: any) => {
            toast({
                title: 'Debit failed',
                description: error?.response?.data?.message || 'Failed to debit wallet',
                status: 'error',
                duration: 3000,
            });
        },
    });

    // Reversal mutation (for debits)
    const reversalMutation = useMutation({
        mutationFn: (data: { transactionReference: string; reason: string }) =>
            walletApi.reverseManualFunding(data.transactionReference, data.reason),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['manualFundings'] });
            queryClient.invalidateQueries({ queryKey: ['userSummaries'] });
            toast({
                title: 'Reversal processed successfully',
                description: 'The transaction has been reversed.',
                status: 'success',
                duration: 3000,
            });
            refetchFundings();
        },
        onError: (error: any) => {
            toast({
                title: 'Reversal failed',
                description: error?.response?.data?.message || 'Failed to reverse transaction',
                status: 'error',
                duration: 3000,
            });
        },
    });

    const resetCreditForm = () => {
        setCreditAmount('');
        setCreditReason('');
        setCreditNotes('');
        setSelectedUser(null);
        setCreditSearch('');
        setShowUserDropdown(false);
    };

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

    // Filtered and sorted wallet actions for the modal
    const filteredWalletActions = useMemo(() => {
        let result = [...manualFundings];

        // Filter by type (credit/debit)
        if (walletActionsTypeFilter === 'credit') {
            result = result.filter(f => f.amount >= 0);
        } else if (walletActionsTypeFilter === 'debit') {
            result = result.filter(f => f.amount < 0);
        }

        // Filter by status
        if (walletActionsStatusFilter !== 'all') {
            result = result.filter(f => f.status === walletActionsStatusFilter);
        }

        // Filter by search (user name, reference, description)
        if (walletActionsSearch.trim()) {
            const searchLower = walletActionsSearch.toLowerCase().trim();
            result = result.filter(f => {
                const fundingUser = users.find(u => u.id === f.userId);
                const userName = fundingUser ? getUserName(fundingUser).toLowerCase() : '';
                return (
                    userName.includes(searchLower) ||
                    f.transactionReference?.toLowerCase().includes(searchLower) ||
                    f.description?.toLowerCase().includes(searchLower) ||
                    f.fundedBy?.toLowerCase().includes(searchLower)
                );
            });
        }

        // Sorting
        result.sort((a, b) => {
            if (walletActionsSortBy === 'date') {
                const dateA = new Date(a.createdAt).getTime();
                const dateB = new Date(b.createdAt).getTime();
                return walletActionsSortOrder === 'desc' ? dateB - dateA : dateA - dateB;
            } else {
                // Sort by amount
                const amountA = Math.abs(a.amount);
                const amountB = Math.abs(b.amount);
                return walletActionsSortOrder === 'desc' ? amountB - amountA : amountA - amountB;
            }
        });

        return result;
    }, [manualFundings, walletActionsTypeFilter, walletActionsStatusFilter, walletActionsSearch, walletActionsSortBy, walletActionsSortOrder, users]);

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

    // All customer users (for modal search - no table filters applied)
    const allCustomerUsers = Array.isArray(users) ? users.filter(user => {
        const userRole = user.userRole?.toUpperCase();
        const isCustomer = !userRole || userRole === 'CUSTOMER' || userRole === 'USER';
        const isExcluded = userRole === 'VENDOR' || userRole === 'ADMIN' || userRole === 'DOCTOR' ||
            userRole === 'THIRD_PARTY' || userRole === 'RIDER' || userRole === 'HEALTH_PROFESSIONAL';
        return !isExcluded && (isCustomer || !userRole);
    }) : [];

    // Filter users - ONLY show CUSTOMER type users
    const filteredUsers = Array.isArray(users) ? users.filter(user => {
        // Only include CUSTOMER users (exclude VENDOR, ADMIN, DOCTOR, THIRD_PARTY, RIDER, etc.)
        const userRole = user.userRole?.toUpperCase();
        // Either user role is CUSTOMER, or if no role specified include it (backwards compatibility)
        const isCustomer = !userRole || userRole === 'CUSTOMER' || userRole === 'USER';
        const isExcluded = userRole === 'VENDOR' || userRole === 'ADMIN' || userRole === 'DOCTOR' ||
            userRole === 'THIRD_PARTY' || userRole === 'RIDER' || userRole === 'HEALTH_PROFESSIONAL';
        if (isExcluded || (!isCustomer && userRole)) {
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



    const getStatusColor = (status: string) => {
        const normalizedStatus = status?.toUpperCase();
        switch (normalizedStatus) {
            case 'SUCCESSFUL':
            case 'COMPLETED':
                return 'green.400';
            case 'PENDING':
            case 'PENDING APPROVAL':
                return 'orange.400';
            case 'REJECTED':
            case 'FAILED':
            case 'REVERSED':
                return 'red.400';
            default:
                return 'gray.400';
        }
    };

    const handleProcessCredit = async () => {
        if (!selectedUser) {
            toast({
                title: 'Please select a user',
                status: 'warning',
                duration: 2000,
            });
            return;
        }
        if (!creditAmount || parseFloat(creditAmount) < 100) {
            toast({
                title: 'Please enter a valid amount (minimum ₦100)',
                status: 'warning',
                duration: 2000,
            });
            return;
        }
        if (!creditReason) {
            toast({
                title: 'Please select a reason',
                status: 'warning',
                duration: 2000,
            });
            return;
        }
        if (!creditNotes) {
            toast({
                title: 'Please provide notes for the transaction',
                status: 'warning',
                duration: 2000,
            });
            return;
        }

        const amount = parseFloat(creditAmount);
        const descriptionText = `${creditReason}: ${creditNotes}`;

        // Process the selected user
        if (selectedUser.id) {
            if (transactionType === 'credit') {
                fundWalletMutation.mutate({
                    userId: selectedUser.id,
                    amount: Math.abs(amount),
                    description: descriptionText,
                });
            } else {
                debitWalletMutation.mutate({
                    userId: selectedUser.id,
                    amount: Math.abs(amount),
                    description: descriptionText,
                });
            }
        } else {
            toast({
                title: 'User ID not found',
                description: 'Please select a different user or refresh the page.',
                status: 'error',
                duration: 3000,
            });
        }
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
            <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={4} mb={6}>
                {/* Total Users (Lifetime) */}
                <Card bg="gray.900" borderColor="gray.800" borderWidth="1px">
                    <CardBody p={5}>
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
                    <CardBody p={5}>
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
                    <CardBody p={5}>
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
                    <CardBody p={5}>
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
                                    onClick={() => {
                                        setTransactionType('credit');
                                        onManualCreditOpen();
                                    }}
                                >
                                    Manual Credit
                                </Button>

                                <Button
                                    w="full"
                                    colorScheme="red"
                                    variant="outline"
                                    borderColor="red.600"
                                    leftIcon={<Minus size={16} />}
                                    color="red.300"
                                    onClick={() => {
                                        setTransactionType('debit');
                                        onManualCreditOpen();
                                    }}
                                >
                                    Manual Debit
                                </Button>

                                <Button
                                    w="full"
                                    variant="outline"
                                    borderColor="gray.600"
                                    leftIcon={<DollarSign size={16} />}
                                    color="gray.300"
                                    onClick={onWalletActionsOpen}
                                >
                                    View Wallet Actions
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
                            </VStack>

                            <Divider my={4} borderColor="gray.700" />

                            {/* Recent Activity - Live from API */}
                            <Text fontSize="sm" fontWeight="600" color="gray.400" mb={3}>
                                Recent Activity
                            </Text>
                            <VStack spacing={2} align="stretch">
                                {fundingsLoading ? (
                                    <Flex justify="center" py={4}>
                                        <Spinner size="sm" />
                                    </Flex>
                                ) : manualFundings.length === 0 ? (
                                    <Text fontSize="xs" color="gray.500" textAlign="center" py={2}>
                                        No recent activity
                                    </Text>
                                ) : (
                                    manualFundings.slice(0, 3).map((funding) => (
                                        <Flex key={funding.id} justify="space-between" align="center" py={2}>
                                            <HStack spacing={2}>
                                                <Box
                                                    w={2}
                                                    h={2}
                                                    borderRadius="full"
                                                    bg={funding.amount >= 0 ? 'green.400' : 'red.400'}
                                                />
                                                <Text fontSize="xs" color="gray.400">
                                                    {funding.amount >= 0 ? 'Credit' : 'Debit'}: {formatCurrency(Math.abs(funding.amount))}
                                                </Text>
                                            </HStack>
                                            <Text fontSize="xs" color="gray.500">
                                                {formatRelativeTime(funding.createdAt)}
                                            </Text>
                                        </Flex>
                                    ))
                                )}
                            </VStack>
                        </CardBody>
                    </Card>
                </Box>
            </Flex>

            {/* Manual Credit/Debit Modal */}
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
                                    <Text fontSize="lg" fontWeight="600" color="gray.100">Manual Wallet Transaction</Text>
                                </HStack>
                            </Box>
                        </HStack>
                    </ModalHeader>
                    <ModalCloseButton color="gray.400" />
                    <ModalBody py={6}>
                        <VStack spacing={6} align="stretch">
                            {/* Credit/Debit Form */}
                            <Box bg="gray.800" p={6} borderRadius="lg" borderWidth="1px" borderColor="gray.700">
                                {/* Transaction Type Tabs */}
                                <Tabs
                                    variant="soft-rounded"
                                    colorScheme={transactionType === 'credit' ? 'green' : 'red'}
                                    mb={4}
                                    onChange={(index) => setTransactionType(index === 0 ? 'credit' : 'debit')}
                                    index={transactionType === 'credit' ? 0 : 1}
                                >
                                    <TabList>
                                        <Tab
                                            _selected={{ bg: 'green.600', color: 'white' }}
                                            color="gray.400"
                                        >
                                            <HStack spacing={2}>
                                                <Plus size={16} />
                                                <Text>Credit Wallet</Text>
                                            </HStack>
                                        </Tab>
                                        <Tab
                                            _selected={{ bg: 'red.600', color: 'white' }}
                                            color="gray.400"
                                        >
                                            <HStack spacing={2}>
                                                <Minus size={16} />
                                                <Text>Debit Wallet</Text>
                                            </HStack>
                                        </Tab>
                                    </TabList>
                                </Tabs>

                                <Text fontSize="sm" color="gray.400" mb={4}>
                                    {transactionType === 'credit'
                                        ? "Add funds to a user's wallet."
                                        : "Remove funds from a user's wallet. Use with caution."}
                                </Text>

                                {/* Select User - Single select */}
                                <FormControl mb={4}>
                                    <FormLabel fontSize="sm" color="gray.300">
                                        Select User *
                                    </FormLabel>

                                    {/* Selected user display */}
                                    {selectedUser ? (
                                        <Flex
                                            align="center"
                                            justify="space-between"
                                            bg="gray.800"
                                            p={3}
                                            borderRadius="md"
                                            borderWidth="1px"
                                            borderColor="purple.500"
                                            mb={2}
                                        >
                                            <HStack spacing={3}>
                                                <Avatar size="sm" name={getUserName(selectedUser)} bg="purple.600" />
                                                <Box>
                                                    <Text fontSize="sm" color="gray.100" fontWeight="500">
                                                        {getUserName(selectedUser)}
                                                    </Text>
                                                    <Text fontSize="xs" color="gray.500">
                                                        {selectedUser.email}
                                                    </Text>
                                                </Box>
                                            </HStack>
                                            <Button
                                                size="xs"
                                                variant="ghost"
                                                colorScheme="red"
                                                onClick={() => setSelectedUser(null)}
                                            >
                                                Change
                                            </Button>
                                        </Flex>
                                    ) : (
                                        /* Search input - only show when no user selected */
                                        <Box position="relative">
                                            <InputGroup>
                                                <InputLeftElement>
                                                    <Icon as={Search} color="gray.500" boxSize={4} />
                                                </InputLeftElement>
                                                <Input
                                                    placeholder="Type to search by name or email..."
                                                    value={creditSearch}
                                                    onChange={(e) => {
                                                        setCreditSearch(e.target.value);
                                                        setShowUserDropdown(e.target.value.length >= 2);
                                                    }}
                                                    onFocus={() => creditSearch.length >= 2 && setShowUserDropdown(true)}
                                                    bg="gray.900"
                                                    borderColor="gray.600"
                                                    color="gray.100"
                                                    _placeholder={{ color: 'gray.500' }}
                                                />
                                            </InputGroup>

                                            {/* Dropdown with matched users */}
                                            {showUserDropdown && creditSearch.length >= 2 && (
                                                <Box
                                                    position="absolute"
                                                    top="100%"
                                                    left={0}
                                                    right={0}
                                                    bg="gray.800"
                                                    borderWidth="1px"
                                                    borderColor="gray.600"
                                                    borderRadius="md"
                                                    maxH="200px"
                                                    overflowY="auto"
                                                    zIndex={10}
                                                    mt={1}
                                                >
                                                    {allCustomerUsers
                                                        .filter(u =>
                                                            getUserName(u).toLowerCase().includes(creditSearch.toLowerCase()) ||
                                                            u.email?.toLowerCase().includes(creditSearch.toLowerCase())
                                                        )
                                                        .slice(0, 10)
                                                        .map(user => (
                                                            <Box
                                                                key={user.id}
                                                                px={3}
                                                                py={2}
                                                                cursor="pointer"
                                                                _hover={{ bg: 'gray.700' }}
                                                                onClick={() => {
                                                                    setSelectedUser(user);
                                                                    setCreditSearch('');
                                                                    setShowUserDropdown(false);
                                                                }}
                                                            >
                                                                <Text fontSize="sm" color="gray.100">{getUserName(user)}</Text>
                                                                <Text fontSize="xs" color="gray.500">{user.email}</Text>
                                                            </Box>
                                                        ))
                                                    }
                                                    {allCustomerUsers.filter(u =>
                                                        getUserName(u).toLowerCase().includes(creditSearch.toLowerCase()) ||
                                                        u.email?.toLowerCase().includes(creditSearch.toLowerCase())
                                                    ).length === 0 && (
                                                            <Box px={3} py={2}>
                                                                <Text fontSize="sm" color="gray.500">No users found</Text>
                                                            </Box>
                                                        )}
                                                </Box>
                                            )}
                                            <Text fontSize="xs" color="gray.500" mt={1}>
                                                Type at least 2 characters to search
                                            </Text>
                                        </Box>
                                    )}
                                </FormControl>



                                {/* Amount */}
                                <FormControl mb={4}>
                                    <FormLabel fontSize="sm" color="gray.300">
                                        {transactionType === 'credit' ? 'Credit' : 'Debit'} Amount *
                                    </FormLabel>
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

                                {/* Reason */}
                                <FormControl mb={4}>
                                    <FormLabel fontSize="sm" color="gray.300">Reason *</FormLabel>
                                    <Select
                                        placeholder="Select reason..."
                                        value={creditReason}
                                        onChange={(e) => setCreditReason(e.target.value)}
                                        bg="gray.900"
                                        borderColor="gray.600"
                                        color="gray.100"
                                    >
                                        {transactionType === 'credit' ? (
                                            <>
                                                <option value="Order Refund">Order Refund</option>
                                                <option value="Service Compensation">Service Compensation</option>
                                                <option value="Promotional Credit">Promotional Credit</option>
                                                <option value="Account Correction">Account Correction</option>
                                                <option value="Other">Other</option>
                                            </>
                                        ) : (
                                            <>
                                                <option value="Order Cancellation">Order Cancellation</option>
                                                <option value="Fraud Prevention">Fraud Prevention</option>
                                                <option value="Account Correction">Account Correction</option>
                                                <option value="Chargeback">Chargeback</option>
                                                <option value="Other">Other</option>
                                            </>
                                        )}
                                    </Select>
                                </FormControl>

                                {/* Notes */}
                                <FormControl mb={4}>
                                    <FormLabel fontSize="sm" color="gray.300">Additional Notes *</FormLabel>
                                    <Textarea
                                        placeholder={`Provide detailed explanation for this ${transactionType} transaction...`}
                                        value={creditNotes}
                                        onChange={(e) => setCreditNotes(e.target.value)}
                                        bg="gray.900"
                                        borderColor="gray.600"
                                        color="gray.100"
                                        rows={3}
                                        _placeholder={{ color: 'gray.500' }}
                                    />
                                    <Text fontSize="xs" color="gray.500" mt={1}>
                                        Required for audit trail
                                    </Text>
                                </FormControl>

                                {/* Action Buttons */}
                                <HStack spacing={3} justify="flex-start">
                                    <Button variant="outline" borderColor="gray.600" color="gray.300" onClick={onManualCreditClose}>
                                        Cancel
                                    </Button>
                                    <Button
                                        type="button"
                                        colorScheme={transactionType === 'credit' ? 'green' : 'red'}
                                        leftIcon={transactionType === 'credit' ? <Plus size={16} /> : <Minus size={16} />}
                                        onClick={handleProcessCredit}
                                        isLoading={fundWalletMutation.isPending || debitWalletMutation.isPending}
                                        isDisabled={fundWalletMutation.isPending || debitWalletMutation.isPending || !selectedUser}
                                    >
                                        Process {transactionType === 'credit' ? 'Credit' : 'Debit'}
                                    </Button>
                                </HStack>
                            </Box>

                            {/* Recent Manual Fundings */}
                            <Box>
                                <HStack justify="space-between" mb={4}>
                                    <Box>
                                        <Text fontSize="md" fontWeight="600" color="purple.400" mb={1}>
                                            Recent Manual Transactions
                                        </Text>
                                        <Text fontSize="sm" color="gray.400">
                                            Last {Math.min(7, manualFundings.length)} manual credit/debit transactions
                                        </Text>
                                    </Box>
                                    <Button
                                        size="xs"
                                        variant="ghost"
                                        leftIcon={<RefreshCw size={12} />}
                                        onClick={() => refetchFundings()}
                                        isLoading={fundingsLoading}
                                    >
                                        Refresh
                                    </Button>
                                </HStack>

                                <Box overflowX="auto">
                                    {fundingsLoading ? (
                                        <Flex justify="center" py={8}>
                                            <Spinner size="md" color="purple.500" />
                                        </Flex>
                                    ) : manualFundings.length === 0 ? (
                                        <Flex justify="center" py={8}>
                                            <Text color="gray.500">No manual transactions yet</Text>
                                        </Flex>
                                    ) : (
                                        <Table variant="simple" size="sm">
                                            <Thead>
                                                <Tr>
                                                    <Th color="gray.500" fontSize="xs" borderColor="gray.700">DATE</Th>
                                                    <Th color="gray.500" fontSize="xs" borderColor="gray.700">REF</Th>
                                                    <Th color="gray.500" fontSize="xs" borderColor="gray.700">AMOUNT</Th>
                                                    <Th color="gray.500" fontSize="xs" borderColor="gray.700">DESCRIPTION</Th>
                                                    <Th color="gray.500" fontSize="xs" borderColor="gray.700">STATUS</Th>
                                                    <Th color="gray.500" fontSize="xs" borderColor="gray.700">BY</Th>
                                                    <Th color="gray.500" fontSize="xs" borderColor="gray.700">ACTIONS</Th>
                                                </Tr>
                                            </Thead>
                                            <Tbody>
                                                {manualFundings.slice(0, 7).map((funding) => (
                                                    <Tr key={funding.id}>
                                                        <Td color="gray.300" borderColor="gray.700" fontSize="sm">
                                                            {formatDateTime(funding.createdAt)}
                                                        </Td>
                                                        <Td borderColor="gray.700">
                                                            <Text fontSize="xs" color="gray.400" fontFamily="mono">
                                                                {funding.transactionReference?.slice(0, 12)}...
                                                            </Text>
                                                        </Td>
                                                        <Td borderColor="gray.700">
                                                            <Text
                                                                fontWeight="500"
                                                                fontSize="sm"
                                                                color={funding.amount >= 0 ? 'green.400' : 'red.400'}
                                                            >
                                                                {funding.amount >= 0 ? '+' : ''}{formatCurrency(funding.amount)}
                                                            </Text>
                                                        </Td>
                                                        <Td color="gray.300" borderColor="gray.700" fontSize="sm" maxW="200px">
                                                            <Text noOfLines={1}>{funding.description}</Text>
                                                        </Td>
                                                        <Td borderColor="gray.700">
                                                            <Badge
                                                                colorScheme={funding.status === 'SUCCESSFUL' ? 'green' : funding.status === 'REVERSED' ? 'red' : 'yellow'}
                                                                fontSize="xs"
                                                            >
                                                                {funding.status}
                                                            </Badge>
                                                        </Td>
                                                        <Td color="gray.400" borderColor="gray.700" fontSize="sm">
                                                            {funding.fundedBy}
                                                        </Td>
                                                        <Td borderColor="gray.700">
                                                            {funding.status === 'SUCCESSFUL' && funding.amount > 0 && (
                                                                <Button
                                                                    size="xs"
                                                                    colorScheme="red"
                                                                    variant="outline"
                                                                    isLoading={reversalMutation.isPending}
                                                                    onClick={() => {
                                                                        if (window.confirm(`Reverse ${formatCurrency(funding.amount)}? This will debit the user's wallet.`)) {
                                                                            reversalMutation.mutate({
                                                                                transactionReference: funding.transactionReference,
                                                                                reason: 'Manual reversal by admin',
                                                                            });
                                                                        }
                                                                    }}
                                                                >
                                                                    Reverse
                                                                </Button>
                                                            )}
                                                        </Td>
                                                    </Tr>
                                                ))}
                                            </Tbody>
                                        </Table>
                                    )}
                                </Box>
                            </Box>
                        </VStack>
                    </ModalBody>
                </ModalContent>
            </Modal>

            {/* Wallet Actions Modal */}
            <Modal isOpen={isWalletActionsOpen} onClose={onWalletActionsClose} size="6xl">
                <ModalOverlay bg="blackAlpha.700" />
                <ModalContent bg="gray.900" borderColor="gray.700" borderWidth="1px">
                    <ModalHeader borderBottomWidth="1px" borderColor="gray.700">
                        <HStack spacing={3}>
                            <Box p={2} bg="purple.900" borderRadius="lg">
                                <Icon as={DollarSign} color="purple.400" boxSize={5} />
                            </Box>
                            <Box>
                                <Text color="gray.100">All Wallet Actions</Text>
                                <Text fontSize="sm" color="gray.400" fontWeight="normal">
                                    Complete history of manual credits, debits, and reversals
                                </Text>
                            </Box>
                        </HStack>
                    </ModalHeader>
                    <ModalCloseButton color="gray.400" />
                    <ModalBody py={6}>
                        {/* Filter & Sort Controls */}
                        <Flex
                            direction={{ base: 'column', md: 'row' }}
                            gap={3}
                            mb={4}
                            flexWrap="wrap"
                            align={{ base: 'stretch', md: 'center' }}
                        >
                            {/* Search */}
                            <InputGroup maxW={{ base: 'full', md: '250px' }}>
                                <InputLeftElement>
                                    <Icon as={Search} color="gray.500" boxSize={4} />
                                </InputLeftElement>
                                <Input
                                    placeholder="Search user, ref, description..."
                                    value={walletActionsSearch}
                                    onChange={(e) => setWalletActionsSearch(e.target.value)}
                                    bg="gray.800"
                                    borderColor="gray.600"
                                    color="gray.100"
                                    size="sm"
                                    _placeholder={{ color: 'gray.500' }}
                                />
                            </InputGroup>

                            {/* Type Filter */}
                            <Select
                                value={walletActionsTypeFilter}
                                onChange={(e) => setWalletActionsTypeFilter(e.target.value as 'all' | 'credit' | 'debit')}
                                bg="gray.800"
                                borderColor="gray.600"
                                color="gray.100"
                                size="sm"
                                maxW={{ base: 'full', md: '150px' }}
                            >
                                <option value="all">All Types</option>
                                <option value="credit">Credits Only</option>
                                <option value="debit">Debits Only</option>
                            </Select>

                            {/* Status Filter */}
                            <Select
                                value={walletActionsStatusFilter}
                                onChange={(e) => setWalletActionsStatusFilter(e.target.value)}
                                bg="gray.800"
                                borderColor="gray.600"
                                color="gray.100"
                                size="sm"
                                maxW={{ base: 'full', md: '150px' }}
                            >
                                <option value="all">All Status</option>
                                <option value="SUCCESSFUL">Successful</option>
                                <option value="REVERSED">Reversed</option>
                                <option value="PENDING">Pending</option>
                            </Select>

                            {/* Sort By */}
                            <Select
                                value={walletActionsSortBy}
                                onChange={(e) => setWalletActionsSortBy(e.target.value as 'date' | 'amount')}
                                bg="gray.800"
                                borderColor="gray.600"
                                color="gray.100"
                                size="sm"
                                maxW={{ base: 'full', md: '130px' }}
                            >
                                <option value="date">Sort by Date</option>
                                <option value="amount">Sort by Amount</option>
                            </Select>

                            {/* Sort Order */}
                            <Button
                                size="sm"
                                variant="outline"
                                borderColor="gray.600"
                                color="gray.300"
                                onClick={() => setWalletActionsSortOrder(prev => prev === 'desc' ? 'asc' : 'desc')}
                                leftIcon={walletActionsSortOrder === 'desc' ? <Icon as={ChevronRight} transform="rotate(90deg)" /> : <Icon as={ChevronRight} transform="rotate(-90deg)" />}
                            >
                                {walletActionsSortOrder === 'desc' ? 'Newest' : 'Oldest'}
                            </Button>

                            {/* Results Count */}
                            <Text fontSize="sm" color="gray.500" ml={{ base: 0, md: 'auto' }}>
                                {filteredWalletActions.length} of {manualFundings.length} actions
                            </Text>
                        </Flex>

                        <Box overflowX="auto">
                            {fundingsLoading ? (
                                <Flex justify="center" py={8}>
                                    <Spinner size="lg" color="purple.500" />
                                </Flex>
                            ) : filteredWalletActions.length === 0 ? (
                                <Flex justify="center" py={8} direction="column" align="center">
                                    <Icon as={Wallet} color="gray.600" boxSize={10} mb={3} />
                                    <Text color="gray.500">
                                        {manualFundings.length === 0 ? 'No wallet actions yet' : 'No matching wallet actions'}
                                    </Text>
                                </Flex>
                            ) : (
                                <Table variant="simple" size="sm">
                                    <Thead>
                                        <Tr>
                                            <Th color="gray.500" fontSize="xs" borderColor="gray.700">DATE</Th>
                                            <Th color="gray.500" fontSize="xs" borderColor="gray.700">REF</Th>
                                            <Th color="gray.500" fontSize="xs" borderColor="gray.700">AMOUNT</Th>
                                            <Th color="gray.500" fontSize="xs" borderColor="gray.700">USER</Th>
                                            <Th color="gray.500" fontSize="xs" borderColor="gray.700">STATUS</Th>
                                            <Th color="gray.500" fontSize="xs" borderColor="gray.700">BY</Th>
                                            <Th color="gray.500" fontSize="xs" borderColor="gray.700">ACTIONS</Th>
                                        </Tr>
                                    </Thead>
                                    <Tbody>
                                        {filteredWalletActions.map((funding) => {
                                            // Find user by userId from users
                                            const fundingUser = users.find(u => u.id === funding.userId);
                                            return (
                                                <Tr key={funding.id}>
                                                    <Td color="gray.300" borderColor="gray.700" fontSize="sm">
                                                        {formatDateTime(funding.createdAt)}
                                                    </Td>
                                                    <Td borderColor="gray.700">
                                                        <Text fontSize="xs" color="gray.400" fontFamily="mono">
                                                            {funding.transactionReference}
                                                        </Text>
                                                    </Td>
                                                    <Td borderColor="gray.700">
                                                        <Text
                                                            fontWeight="600"
                                                            fontSize="sm"
                                                            color={funding.amount >= 0 ? 'green.400' : 'red.400'}
                                                        >
                                                            {funding.amount >= 0 ? '+' : ''}{formatCurrency(funding.amount)}
                                                        </Text>
                                                    </Td>
                                                    <Td borderColor="gray.700">
                                                        <Text fontSize="sm" color="gray.300">
                                                            {fundingUser ? getUserName(fundingUser) : 'Unknown User'}
                                                        </Text>
                                                        <Text fontSize="xs" color="gray.500">
                                                            {fundingUser?.email || funding.userId?.slice(0, 8)}
                                                        </Text>
                                                    </Td>
                                                    <Td borderColor="gray.700">
                                                        <Badge
                                                            colorScheme={funding.status === 'SUCCESSFUL' ? 'green' : funding.status === 'REVERSED' ? 'red' : 'yellow'}
                                                            fontSize="xs"
                                                        >
                                                            {funding.status}
                                                        </Badge>
                                                    </Td>
                                                    <Td borderColor="gray.700">
                                                        <Text fontSize="sm" color="gray.400">
                                                            {funding.fundedBy}
                                                        </Text>
                                                    </Td>
                                                    <Td borderColor="gray.700">
                                                        <Popover placement="left">
                                                            <PopoverTrigger>
                                                                <Button
                                                                    size="xs"
                                                                    variant="ghost"
                                                                    colorScheme="purple"
                                                                    leftIcon={<Eye size={12} />}
                                                                >
                                                                    View Reason
                                                                </Button>
                                                            </PopoverTrigger>
                                                            <PopoverContent bg="gray.800" borderColor="gray.600" maxW="350px">
                                                                <PopoverArrow bg="gray.800" />
                                                                <PopoverCloseButton />
                                                                <PopoverHeader borderColor="gray.600" fontWeight="600" color="gray.100">
                                                                    Transaction Details
                                                                </PopoverHeader>
                                                                <PopoverBody>
                                                                    <VStack align="start" spacing={2}>
                                                                        <Box>
                                                                            <Text fontSize="xs" color="gray.500" mb={1}>Reference</Text>
                                                                            <Text fontSize="sm" color="gray.300" fontFamily="mono">
                                                                                {funding.transactionReference}
                                                                            </Text>
                                                                        </Box>
                                                                        <Box>
                                                                            <Text fontSize="xs" color="gray.500" mb={1}>Reason & Notes</Text>
                                                                            <Text fontSize="sm" color="gray.200">
                                                                                {funding.description || 'No description provided'}
                                                                            </Text>
                                                                        </Box>
                                                                        <Box>
                                                                            <Text fontSize="xs" color="gray.500" mb={1}>Balance Change</Text>
                                                                            <HStack>
                                                                                <Text fontSize="sm" color="gray.400">
                                                                                    {formatCurrency(funding.oldBalance)}
                                                                                </Text>
                                                                                <Text fontSize="sm" color="gray.500">→</Text>
                                                                                <Text fontSize="sm" color={funding.amount >= 0 ? 'green.400' : 'red.400'}>
                                                                                    {formatCurrency(funding.newBalance)}
                                                                                </Text>
                                                                            </HStack>
                                                                        </Box>
                                                                    </VStack>
                                                                </PopoverBody>
                                                            </PopoverContent>
                                                        </Popover>
                                                    </Td>
                                                </Tr>
                                            );
                                        })}
                                    </Tbody>
                                </Table>
                            )}
                        </Box>
                    </ModalBody>
                </ModalContent>
            </Modal>
        </Box >
    );
};

export default UsersPage;
