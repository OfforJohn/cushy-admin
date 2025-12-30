import React, { useState } from 'react';
import {
    Box,
    Flex,
    Heading,
    Text,
    Input,
    InputGroup,
    InputLeftElement,
    Icon,
    VStack,
    HStack,
    Badge,
    Button,
    IconButton,
    SimpleGrid,
    Select,
    Table,
    Thead,
    Tbody,
    Tr,
    Th,
    Td,
    Checkbox,
    Menu,
    MenuButton,
    MenuList,
    MenuItem,
    Avatar,
    useToast,
    Spinner,
    Card,
    CardBody,
} from '@chakra-ui/react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    Search,
    Clock,
    CheckCircle,
    XCircle,
    TrendingUp,
    Check,
    X,
    Bell,
    FileText,
    MoreVertical,
    Eye,
    ChevronLeft,
    ChevronRight,
    Filter,
} from 'lucide-react';
import { adminApi } from '../../api/admin.api';

interface Vendor {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    mobile: string;
    isVerified: boolean;
    createdAt: string;
    store?: {
        id: string;
        name: string;
        category?: string;
    };
}

export const MerchantApprovalPage: React.FC = () => {
    const toast = useToast();
    const queryClient = useQueryClient();

    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [businessTypeFilter, setBusinessTypeFilter] = useState('all');
    const [cityFilter, setCityFilter] = useState('all');
    const [selectedVendors, setSelectedVendors] = useState<string[]>([]);
    const [page, setPage] = useState(1);
    const pageSize = 10;

    // Fetch vendors (pending approval)
    const { data: vendorsData, isLoading } = useQuery({
        queryKey: ['vendorApproval', page, statusFilter],
        queryFn: () => adminApi.getVendorList({
            page,
            size: pageSize,
            status: statusFilter === 'all' ? undefined : statusFilter.toUpperCase()
        }),
        retry: false,
        staleTime: 30000,
    });

    // Approve vendor mutation
    const approveVendorMutation = useMutation({
        mutationFn: (vendorId: string) => adminApi.updateVendorVerification(vendorId, { isVerified: true }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['vendorApproval'] });
            toast({
                title: 'Vendor approved successfully',
                status: 'success',
                duration: 2000,
            });
        },
        onError: () => {
            toast({
                title: 'Failed to approve vendor',
                status: 'error',
                duration: 3000,
            });
        },
    });

    // Reject vendor mutation
    const rejectVendorMutation = useMutation({
        mutationFn: (vendorId: string) => adminApi.updateVendorVerification(vendorId, { isVerified: false }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['vendorApproval'] });
            toast({
                title: 'Vendor rejected',
                status: 'success',
                duration: 2000,
            });
        },
        onError: () => {
            toast({
                title: 'Failed to reject vendor',
                status: 'error',
                duration: 3000,
            });
        },
    });

    const vendors: Vendor[] = Array.isArray(vendorsData?.data?.vendorList) ? vendorsData.data.vendorList : [];
    const pagination = vendorsData?.data?.pagination || { total: 0, page: 1, pageCount: 1 };

    // Calculate stats
    const pendingCount = vendors.filter(v => !v.isVerified).length;
    const approvedCount = vendors.filter(v => v.isVerified).length;

    // Filter vendors by search
    const filteredVendors = vendors.filter(vendor => {
        if (!searchQuery) return true;
        const searchLower = searchQuery.toLowerCase();
        return (
            vendor.firstName?.toLowerCase().includes(searchLower) ||
            vendor.lastName?.toLowerCase().includes(searchLower) ||
            vendor.email?.toLowerCase().includes(searchLower) ||
            vendor.store?.name?.toLowerCase().includes(searchLower)
        );
    });

    const handleSelectAll = (checked: boolean) => {
        if (checked) {
            setSelectedVendors(filteredVendors.map(v => v.id));
        } else {
            setSelectedVendors([]);
        }
    };

    const handleSelectVendor = (vendorId: string, checked: boolean) => {
        if (checked) {
            setSelectedVendors([...selectedVendors, vendorId]);
        } else {
            setSelectedVendors(selectedVendors.filter(id => id !== vendorId));
        }
    };

    const handleBulkApprove = () => {
        selectedVendors.forEach(id => approveVendorMutation.mutate(id));
        setSelectedVendors([]);
    };

    const handleBulkReject = () => {
        selectedVendors.forEach(id => rejectVendorMutation.mutate(id));
        setSelectedVendors([]);
    };

    const getStatusBadge = (isVerified: boolean) => {
        if (isVerified) {
            return <Badge colorScheme="green" variant="subtle">Approved</Badge>;
        }
        return <Badge colorScheme="yellow" variant="subtle">Pending</Badge>;
    };

    const getPriorityBadge = (createdAt: string) => {
        const daysAgo = Math.floor((Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60 * 24));
        if (daysAgo > 7) {
            return <Badge colorScheme="red" variant="subtle">High</Badge>;
        } else if (daysAgo > 3) {
            return <Badge colorScheme="orange" variant="subtle">Medium</Badge>;
        }
        return <Badge colorScheme="gray" variant="subtle">Low</Badge>;
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        });
    };

    return (
        <Box>
            {/* Header */}
            <Flex justify="space-between" align="center" mb={6}>
                <HStack spacing={4}>
                    <Heading size="lg" color="gray.100">
                        Merchant Approval
                    </Heading>
                    <Select
                        w="140px"
                        size="sm"
                        bg="gray.800"
                        borderColor="gray.700"
                        value={cityFilter}
                        onChange={(e) => setCityFilter(e.target.value)}
                    >
                        <option value="all">All Cities</option>
                        <option value="minna">Minna</option>
                        <option value="abuja">Abuja</option>
                        <option value="lagos">Lagos</option>
                    </Select>
                </HStack>
            </Flex>

            {/* Search Bar */}
            <InputGroup mb={6} maxW="400px">
                <InputLeftElement>
                    <Icon as={Search} color="gray.500" boxSize={4} />
                </InputLeftElement>
                <Input
                    placeholder="Search vendor or business name..."
                    bg="gray.800"
                    borderColor="gray.700"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </InputGroup>

            {/* Stats Cards */}
            <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4} mb={6}>
                <Card bg="gray.900" borderColor="gray.800" borderWidth="1px">
                    <CardBody>
                        <HStack spacing={3}>
                            <Box p={2} bg="orange.500" bg="rgba(251, 191, 36, 0.1)" borderRadius="lg">
                                <Icon as={Clock} color="orange.400" boxSize={5} />
                            </Box>
                            <Box>
                                <Text fontSize="xs" color="gray.500">Pending Review</Text>
                                <Text fontSize="2xl" fontWeight="bold" color="gray.100">{pendingCount}</Text>
                                <Text fontSize="xs" color="gray.500">Avg 3.2 days</Text>
                            </Box>
                        </HStack>
                    </CardBody>
                </Card>

                <Card bg="gray.900" borderColor="gray.800" borderWidth="1px">
                    <CardBody>
                        <HStack spacing={3}>
                            <Box p={2} bg="rgba(34, 197, 94, 0.1)" borderRadius="lg">
                                <Icon as={CheckCircle} color="green.400" boxSize={5} />
                            </Box>
                            <Box>
                                <Text fontSize="xs" color="gray.500">Approved Today</Text>
                                <Text fontSize="2xl" fontWeight="bold" color="gray.100">{approvedCount}</Text>
                                <Text fontSize="xs" color="green.400">↑ 10 this week</Text>
                            </Box>
                        </HStack>
                    </CardBody>
                </Card>

                <Card bg="gray.900" borderColor="gray.800" borderWidth="1px">
                    <CardBody>
                        <HStack spacing={3}>
                            <Box p={2} bg="rgba(239, 68, 68, 0.1)" borderRadius="lg">
                                <Icon as={XCircle} color="red.400" boxSize={5} />
                            </Box>
                            <Box>
                                <Text fontSize="xs" color="gray.500">Rejected This Week</Text>
                                <Text fontSize="2xl" fontWeight="bold" color="gray.100">0</Text>
                                <Text fontSize="xs" color="red.400">× Invalid KYC docs</Text>
                            </Box>
                        </HStack>
                    </CardBody>
                </Card>

                <Card bg="gray.900" borderColor="gray.800" borderWidth="1px">
                    <CardBody>
                        <HStack spacing={3}>
                            <Box p={2} bg="rgba(139, 92, 246, 0.1)" borderRadius="lg">
                                <Icon as={TrendingUp} color="purple.400" boxSize={5} />
                            </Box>
                            <Box>
                                <Text fontSize="xs" color="gray.500">Total Active Vendors</Text>
                                <Text fontSize="2xl" fontWeight="bold" color="gray.100">{pagination.total}</Text>
                                <Text fontSize="xs" color="green.400">↑ 10 this month</Text>
                            </Box>
                        </HStack>
                    </CardBody>
                </Card>
            </SimpleGrid>

            {/* Quick Actions */}
            <Flex justify="space-between" align="center" mb={4} flexWrap="wrap" gap={3}>
                <HStack spacing={3}>
                    <Text fontSize="sm" fontWeight="500" color="gray.400">Quick Actions</Text>
                    <Button
                        size="sm"
                        colorScheme="purple"
                        leftIcon={<Check size={14} />}
                        isDisabled={selectedVendors.length === 0}
                        onClick={handleBulkApprove}
                        isLoading={approveVendorMutation.isPending}
                    >
                        Bulk Approve ({selectedVendors.length})
                    </Button>
                    <Button
                        size="sm"
                        colorScheme="red"
                        variant="solid"
                        leftIcon={<X size={14} />}
                        isDisabled={selectedVendors.length === 0}
                        onClick={handleBulkReject}
                        isLoading={rejectVendorMutation.isPending}
                    >
                        Bulk Reject ({selectedVendors.length})
                    </Button>
                    <Button
                        size="sm"
                        variant="outline"
                        borderColor="gray.600"
                        leftIcon={<Bell size={14} />}
                    >
                        Send Reminders
                    </Button>
                </HStack>
                <Button
                    size="sm"
                    variant="outline"
                    borderColor="gray.600"
                    leftIcon={<FileText size={14} />}
                >
                    Export KYC Report
                </Button>
            </Flex>

            {/* Filters */}
            <HStack spacing={3} mb={4}>
                <Select
                    w="130px"
                    size="sm"
                    bg="gray.800"
                    borderColor="gray.700"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                >
                    <option value="all">All Status</option>
                    <option value="verified">Verified</option>
                    <option value="unverified">Unverified</option>
                </Select>
                <Select
                    w="160px"
                    size="sm"
                    bg="gray.800"
                    borderColor="gray.700"
                    value={businessTypeFilter}
                    onChange={(e) => setBusinessTypeFilter(e.target.value)}
                >
                    <option value="all">All Business Types</option>
                    <option value="restaurant">Restaurant</option>
                    <option value="pharmacy">Pharmacy</option>
                    <option value="grocery">Grocery</option>
                </Select>
                <Select
                    w="120px"
                    size="sm"
                    bg="gray.800"
                    borderColor="gray.700"
                    value={cityFilter}
                    onChange={(e) => setCityFilter(e.target.value)}
                >
                    <option value="all">All Cities</option>
                    <option value="minna">Minna</option>
                    <option value="abuja">Abuja</option>
                </Select>
                <Button size="sm" variant="ghost" leftIcon={<Filter size={14} />}>
                    More Filters
                </Button>

                <Text fontSize="sm" color="gray.500" ml="auto">
                    Showing urgent reviews first
                </Text>
            </HStack>

            {/* Vendor Approval Queue */}
            <Box bg="gray.900" borderRadius="xl" borderWidth="1px" borderColor="gray.800" overflow="hidden">
                <Flex justify="space-between" align="center" p={4} borderBottomWidth="1px" borderColor="gray.800">
                    <Text fontWeight="600" color="gray.100">Merchant Approval Queue</Text>
                    <Text fontSize="sm" color="purple.400">{pagination.total} pending approvals</Text>
                </Flex>

                {isLoading ? (
                    <Flex justify="center" py={12}>
                        <Spinner size="lg" color="purple.500" />
                    </Flex>
                ) : (
                    <Box overflowX="auto">
                        <Table variant="simple" size="sm">
                            <Thead>
                                <Tr>
                                    <Th borderColor="gray.800" w="40px">
                                        <Checkbox
                                            isChecked={selectedVendors.length === filteredVendors.length && filteredVendors.length > 0}
                                            isIndeterminate={selectedVendors.length > 0 && selectedVendors.length < filteredVendors.length}
                                            onChange={(e) => handleSelectAll(e.target.checked)}
                                            colorScheme="purple"
                                        />
                                    </Th>
                                    <Th borderColor="gray.800" color="gray.500">VENDOR</Th>
                                    <Th borderColor="gray.800" color="gray.500">BUSINESS TYPE</Th>
                                    <Th borderColor="gray.800" color="gray.500">REGISTRATION</Th>
                                    <Th borderColor="gray.800" color="gray.500">SUBMITTED</Th>
                                    <Th borderColor="gray.800" color="gray.500">STATUS</Th>
                                    <Th borderColor="gray.800" color="gray.500">PRIORITY</Th>
                                    <Th borderColor="gray.800" color="gray.500">KYC DOCUMENTS</Th>
                                    <Th borderColor="gray.800" color="gray.500">ACTIONS</Th>
                                </Tr>
                            </Thead>
                            <Tbody>
                                {filteredVendors.length === 0 ? (
                                    <Tr>
                                        <Td colSpan={9} textAlign="center" py={8} borderColor="gray.800">
                                            <Text color="gray.500">No vendors found</Text>
                                        </Td>
                                    </Tr>
                                ) : (
                                    filteredVendors.map((vendor) => (
                                        <Tr key={vendor.id} _hover={{ bg: 'gray.800' }}>
                                            <Td borderColor="gray.800">
                                                <Checkbox
                                                    isChecked={selectedVendors.includes(vendor.id)}
                                                    onChange={(e) => handleSelectVendor(vendor.id, e.target.checked)}
                                                    colorScheme="purple"
                                                />
                                            </Td>
                                            <Td borderColor="gray.800">
                                                <HStack spacing={3}>
                                                    <Avatar size="sm" name={`${vendor.firstName} ${vendor.lastName}`} bg="purple.500" />
                                                    <Box>
                                                        <Text fontWeight="500" color="gray.100">
                                                            {vendor.store?.name || `${vendor.firstName} ${vendor.lastName}`}
                                                        </Text>
                                                        <Text fontSize="xs" color="gray.500">{vendor.email}</Text>
                                                    </Box>
                                                </HStack>
                                            </Td>
                                            <Td borderColor="gray.800">
                                                <Badge colorScheme="blue" variant="subtle">
                                                    {vendor.store?.category || 'Restaurant'}
                                                </Badge>
                                            </Td>
                                            <Td borderColor="gray.800">
                                                <Text fontSize="sm" color="gray.400">{vendor.mobile}</Text>
                                            </Td>
                                            <Td borderColor="gray.800">
                                                <Text fontSize="sm" color="gray.400">{formatDate(vendor.createdAt)}</Text>
                                            </Td>
                                            <Td borderColor="gray.800">
                                                {getStatusBadge(vendor.isVerified)}
                                            </Td>
                                            <Td borderColor="gray.800">
                                                {getPriorityBadge(vendor.createdAt)}
                                            </Td>
                                            <Td borderColor="gray.800">
                                                <HStack spacing={1}>
                                                    <Badge colorScheme="green" size="sm">ID</Badge>
                                                    <Badge colorScheme="green" size="sm">CAC</Badge>
                                                    <Badge colorScheme="gray" size="sm">TIN</Badge>
                                                </HStack>
                                            </Td>
                                            <Td borderColor="gray.800">
                                                <HStack spacing={1}>
                                                    <IconButton
                                                        aria-label="Approve"
                                                        icon={<Check size={14} />}
                                                        size="xs"
                                                        colorScheme="green"
                                                        variant="ghost"
                                                        onClick={() => approveVendorMutation.mutate(vendor.id)}
                                                        isDisabled={vendor.isVerified}
                                                    />
                                                    <IconButton
                                                        aria-label="Reject"
                                                        icon={<X size={14} />}
                                                        size="xs"
                                                        colorScheme="red"
                                                        variant="ghost"
                                                        onClick={() => rejectVendorMutation.mutate(vendor.id)}
                                                    />
                                                    <Menu>
                                                        <MenuButton
                                                            as={IconButton}
                                                            icon={<MoreVertical size={14} />}
                                                            size="xs"
                                                            variant="ghost"
                                                        />
                                                        <MenuList bg="gray.800" borderColor="gray.700">
                                                            <MenuItem bg="gray.800" _hover={{ bg: 'gray.700' }} icon={<Eye size={14} />}>
                                                                View Details
                                                            </MenuItem>
                                                            <MenuItem bg="gray.800" _hover={{ bg: 'gray.700' }} icon={<FileText size={14} />}>
                                                                View Documents
                                                            </MenuItem>
                                                            <MenuItem bg="gray.800" _hover={{ bg: 'gray.700' }} icon={<Bell size={14} />}>
                                                                Send Reminder
                                                            </MenuItem>
                                                        </MenuList>
                                                    </Menu>
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
                <Flex justify="space-between" align="center" p={4} borderTopWidth="1px" borderColor="gray.800">
                    <Text fontSize="sm" color="gray.500">
                        Showing {((page - 1) * pageSize) + 1}-{Math.min(page * pageSize, pagination.total)} of {pagination.total}
                    </Text>
                    <HStack spacing={2}>
                        <Button
                            size="sm"
                            variant="outline"
                            borderColor="gray.600"
                            leftIcon={<ChevronLeft size={14} />}
                            isDisabled={page <= 1}
                            onClick={() => setPage(p => p - 1)}
                        >
                            Prev
                        </Button>
                        <Button
                            size="sm"
                            variant="outline"
                            borderColor="gray.600"
                            rightIcon={<ChevronRight size={14} />}
                            isDisabled={page >= pagination.pageCount}
                            onClick={() => setPage(p => p + 1)}
                        >
                            Next
                        </Button>
                    </HStack>
                </Flex>
            </Box>
        </Box>
    );
};

export default MerchantApprovalPage;
