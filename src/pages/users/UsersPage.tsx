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
    Avatar,
    VStack,
    Badge,
    useToast,
} from '@chakra-ui/react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    Search,
    Filter,
    Download,
    RefreshCw,
    Eye,
    UserCheck,
    UserX,
    Wallet,
    Mail,
    Shield,
    MoreVertical,
} from 'lucide-react';
import { adminApi } from '../../api/admin.api';
import { DataGrid, Column } from '../../components/common/DataGrid';
import { StatusPill, VerificationStatusPill } from '../../components/common/StatusPill';
import { formatCurrency, formatDateTime, formatFullName, formatPhoneNumber } from '../../utils/formatters';
import { USER_ROLE_LABELS } from '../../utils/constants';
import { UserRoles } from '../../types/user.types';

interface UserListItem {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    mobile: string;
    userRole: UserRoles;
    isVerified: boolean;
    createdAt: string;
    walletBalance?: number;
    ordersCount?: number;
    lastActive?: string;
}

export const UsersPage: React.FC = () => {
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [roleFilter, setRoleFilter] = useState<string>('');
    const [searchQuery, setSearchQuery] = useState('');

    const toast = useToast();
    const queryClient = useQueryClient();

    // Fetch user summaries
    const { data: usersData, isLoading, refetch } = useQuery({
        queryKey: ['userSummaries', page, pageSize],
        queryFn: () => adminApi.getUserSummaries(page, pageSize),
    });

    // Update user role mutation
    const updateRoleMutation = useMutation({
        mutationFn: ({ userId, newRole }: { userId: string; newRole: UserRoles }) =>
            adminApi.updateUserRole(userId, newRole),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['userSummaries'] });
            toast({
                title: 'User updated',
                status: 'success',
                duration: 2000,
            });
        },
        onError: () => {
            toast({
                title: 'Failed to update user',
                status: 'error',
                duration: 3000,
            });
        },
    });

    const users: UserListItem[] = usersData?.data || [];

    // Filter users
    const filteredUsers = users.filter(user => {
        const matchesRole = !roleFilter || user.userRole === roleFilter;
        const matchesSearch = !searchQuery ||
            user.firstName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            user.lastName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            user.mobile?.includes(searchQuery);
        return matchesRole && matchesSearch;
    });

    const handlePromoteToAdmin = (userId: string) => {
        updateRoleMutation.mutate({ userId, newRole: UserRoles.ADMIN });
    };

    const handleDemoteToCustomer = (userId: string) => {
        updateRoleMutation.mutate({ userId, newRole: UserRoles.CUSTOMER });
    };

    const getRoleBadgeColor = (role: UserRoles) => {
        switch (role) {
            case UserRoles.ADMIN:
                return 'purple';
            case UserRoles.VENDOR:
                return 'blue';
            case UserRoles.DOCTOR:
                return 'green';
            case UserRoles.THIRD_PARTY:
                return 'orange';
            default:
                return 'gray';
        }
    };

    const columns: Column<UserListItem>[] = [
        {
            key: 'user',
            header: 'User',
            render: (user) => (
                <HStack spacing={3}>
                    <Avatar
                        size="sm"
                        name={formatFullName(user.firstName, user.lastName)}
                        bg="brand.primary.500"
                    />
                    <VStack align="start" spacing={0}>
                        <Text fontSize="sm" fontWeight="500">
                            {formatFullName(user.firstName, user.lastName)}
                        </Text>
                        <Text fontSize="xs" color="gray.500">
                            {user.email}
                        </Text>
                    </VStack>
                </HStack>
            ),
        },
        {
            key: 'mobile',
            header: 'Phone',
            render: (user) => (
                <Text fontSize="sm" color="gray.400">
                    {formatPhoneNumber(user.mobile)}
                </Text>
            ),
        },
        {
            key: 'userRole',
            header: 'Role',
            sortable: true,
            render: (user) => (
                <Badge colorScheme={getRoleBadgeColor(user.userRole)}>
                    {USER_ROLE_LABELS[user.userRole] || user.userRole}
                </Badge>
            ),
        },
        {
            key: 'isVerified',
            header: 'Status',
            render: (user) => <VerificationStatusPill isVerified={user.isVerified} />,
        },
        {
            key: 'walletBalance',
            header: 'Wallet',
            sortable: true,
            render: (user) => (
                <Text fontWeight="500" color="green.400">
                    {formatCurrency(user.walletBalance || 0)}
                </Text>
            ),
        },
        {
            key: 'ordersCount',
            header: 'Orders',
            sortable: true,
            render: (user) => (
                <Badge colorScheme="gray">{user.ordersCount || 0}</Badge>
            ),
        },
        {
            key: 'createdAt',
            header: 'Joined',
            sortable: true,
            render: (user) => (
                <Text fontSize="sm" color="gray.400">
                    {formatDateTime(user.createdAt)}
                </Text>
            ),
        },
    ];

    const renderActions = (user: UserListItem) => (
        <>
            <MenuItem icon={<Eye size={16} />}>
                View Profile
            </MenuItem>
            <MenuItem icon={<Wallet size={16} />}>
                View Wallet
            </MenuItem>
            <MenuItem icon={<Mail size={16} />}>
                Send Email
            </MenuItem>
            {user.userRole !== UserRoles.ADMIN && (
                <MenuItem
                    icon={<Shield size={16} />}
                    onClick={() => handlePromoteToAdmin(user.id)}
                >
                    Promote to Admin
                </MenuItem>
            )}
            {user.userRole === UserRoles.ADMIN && (
                <MenuItem
                    icon={<UserX size={16} />}
                    color="orange.400"
                    onClick={() => handleDemoteToCustomer(user.id)}
                >
                    Demote to Customer
                </MenuItem>
            )}
        </>
    );

    return (
        <Box>
            {/* Header */}
            <Flex justify="space-between" align="center" mb={6}>
                <Box>
                    <Heading size="lg" color="gray.100" mb={1}>
                        Users
                    </Heading>
                    <Text color="gray.500">
                        Manage user accounts and permissions
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

            {/* Stats */}
            <HStack spacing={4} mb={6}>
                <Box
                    bg="gray.900"
                    px={4}
                    py={3}
                    borderRadius="lg"
                    border="1px solid"
                    borderColor="gray.800"
                >
                    <Text fontSize="sm" color="gray.500">Total Users</Text>
                    <Text fontSize="xl" fontWeight="bold" color="gray.100">
                        {users.length}
                    </Text>
                </Box>
                <Box
                    bg="gray.900"
                    px={4}
                    py={3}
                    borderRadius="lg"
                    border="1px solid"
                    borderColor="gray.800"
                >
                    <Text fontSize="sm" color="gray.500">Verified</Text>
                    <Text fontSize="xl" fontWeight="bold" color="green.400">
                        {users.filter(u => u.isVerified).length}
                    </Text>
                </Box>
                <Box
                    bg="gray.900"
                    px={4}
                    py={3}
                    borderRadius="lg"
                    border="1px solid"
                    borderColor="gray.800"
                >
                    <Text fontSize="sm" color="gray.500">Admins</Text>
                    <Text fontSize="xl" fontWeight="bold" color="brand.primary.400">
                        {users.filter(u => u.userRole === UserRoles.ADMIN).length}
                    </Text>
                </Box>
                <Box
                    bg="gray.900"
                    px={4}
                    py={3}
                    borderRadius="lg"
                    border="1px solid"
                    borderColor="gray.800"
                >
                    <Text fontSize="sm" color="gray.500">Vendors</Text>
                    <Text fontSize="xl" fontWeight="bold" color="blue.400">
                        {users.filter(u => u.userRole === UserRoles.VENDOR).length}
                    </Text>
                </Box>
            </HStack>

            {/* Filters */}
            <Flex gap={4} mb={6} flexWrap="wrap">
                <InputGroup maxW="300px">
                    <InputLeftElement>
                        <Icon as={Search} color="gray.500" boxSize={4} />
                    </InputLeftElement>
                    <Input
                        placeholder="Search users..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        size="sm"
                    />
                </InputGroup>

                <Select
                    placeholder="All Roles"
                    maxW="180px"
                    size="sm"
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value)}
                >
                    <option value="CUSTOMER">Customers</option>
                    <option value="VENDOR">Vendors</option>
                    <option value="ADMIN">Admins</option>
                    <option value="DOCTOR">Health Professionals</option>
                </Select>

                <Select placeholder="Verification" maxW="150px" size="sm">
                    <option value="verified">Verified</option>
                    <option value="unverified">Unverified</option>
                </Select>

                <Button leftIcon={<Filter size={16} />} variant="ghost" size="sm">
                    More Filters
                </Button>
            </Flex>

            {/* Users Table */}
            <DataGrid
                data={filteredUsers}
                columns={columns}
                isLoading={isLoading}
                page={page}
                pageSize={pageSize}
                totalItems={filteredUsers.length}
                onPageChange={setPage}
                onPageSizeChange={setPageSize}
                actions={renderActions}
                selectable
                exportable
                emptyMessage="No users found"
            />
        </Box>
    );
};

export default UsersPage;
