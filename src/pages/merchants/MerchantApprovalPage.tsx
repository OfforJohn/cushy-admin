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
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalCloseButton,
    ModalFooter,
    useDisclosure,
    Divider,
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
    Store,
    Mail,
    Phone,
    MapPin,
    Calendar,
} from 'lucide-react';
import { adminApi } from '../../api/admin.api';
import { useLocationFilter, matchesLocationFilter } from '../../context/LocationContext';

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
        address?: {
            city?: string;
            state?: string;
            address?: string;
        };
    };
}

export const MerchantApprovalPage: React.FC = () => {
    const toast = useToast();
    const queryClient = useQueryClient();
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);

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
            limit: pageSize,
            isVerified: statusFilter === 'all' ? undefined : statusFilter === 'verified'
        }),
        retry: false,
        staleTime: 30000,
    });

    // Fetch vendor stats for accurate counts
    const { data: vendorStatsData } = useQuery({
        queryKey: ['vendorStats'],
        queryFn: () => adminApi.getVendorStats(),
    });

    const { selectedLocation } = useLocationFilter();

    // Approve vendor mutation
    const approveVendorMutation = useMutation({
        mutationFn: (vendorId: string) => adminApi.updateVendorVerification(vendorId, { isVerified: true }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['vendorApproval'] });
            queryClient.invalidateQueries({ queryKey: ['vendorStats'] });
            toast({
                title: 'Vendor approved successfully',
                status: 'success',
                duration: 2000,
            });
            onClose();
        },
        onError: (error: any) => {
            toast({
                title: 'Failed to approve vendor',
                description: error?.message || 'An error occurred',
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
            queryClient.invalidateQueries({ queryKey: ['vendorStats'] });
            toast({
                title: 'Vendor rejected',
                status: 'success',
                duration: 2000,
            });
            onClose();
        },
        onError: (error: any) => {
            toast({
                title: 'Failed to reject vendor',
                description: error?.message || 'An error occurred',
                status: 'error',
                duration: 3000,
            });
        },
    });

    const vendorsRaw = vendorsData?.data;
    const vendors: Vendor[] = Array.isArray(vendorsRaw) ? vendorsRaw : (vendorsRaw as any)?.vendorList || [];
    const pagination = (vendorsRaw as any)?.pagination || { total: vendors.length, page: 1, pageCount: 1 };
    const vendorStats = vendorStatsData?.data;

    // Apply location filter
    const filteredByLocation = vendors.filter(vendor => {
        const vendorCity = vendor.store?.address?.city || '';
        return matchesLocationFilter(vendorCity, selectedLocation);
    });

    // Calculate stats from API - Total vendors = verified + unverified (all registered)
    const pendingCount = vendorStats?.unverifiedVendors ?? filteredByLocation.filter(v => !v.isVerified).length;
    const approvedCount = vendorStats?.verifiedVendors ?? filteredByLocation.filter(v => v.isVerified).length;
    const totalVendors = (vendorStats?.verifiedVendors ?? 0) + (vendorStats?.unverifiedVendors ?? 0) || pagination.total;
    const newVendors = vendorStats?.newVendors ?? 0;

    // Filter vendors by search (use filteredByLocation as base)
    const filteredVendors = filteredByLocation.filter(vendor => {
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

    const handleViewDetails = (vendor: Vendor) => {
        setSelectedVendor(vendor);
        onOpen();
    };

    const handleSendReminder = (vendor: Vendor) => {
        // Simulate sending email reminder
        const mailtoLink = `mailto:${vendor.email}?subject=Complete Your Merchant Verification&body=Dear ${vendor.firstName},\n\nPlease complete your merchant verification process to start selling on our platform.\n\nBest regards,\nCushy Access Team`;
        window.open(mailtoLink, '_blank');
        toast({
            title: 'Email client opened',
            description: `Reminder email draft created for ${vendor.email}`,
            status: 'info',
            duration: 3000,
        });
    };

    const handleBulkSendReminders = () => {
        const unverifiedVendors = filteredVendors.filter(v => !v.isVerified && selectedVendors.includes(v.id));
        if (unverifiedVendors.length === 0) {
            toast({
                title: 'No pending vendors selected',
                description: 'Select vendors with pending status to send reminders',
                status: 'warning',
                duration: 3000,
            });
            return;
        }
        // Open email for first vendor (for bulk, you'd typically use a backend email service)
        const emails = unverifiedVendors.map(v => v.email).join(',');
        const mailtoLink = `mailto:${emails}?subject=Complete Your Merchant Verification&body=Dear Merchant,\n\nPlease complete your merchant verification process to start selling on our platform.\n\nBest regards,\nCushy Access Team`;
        window.open(mailtoLink, '_blank');
        toast({
            title: 'Email client opened',
            description: `Reminder email draft created for ${unverifiedVendors.length} vendors`,
            status: 'info',
            duration: 3000,
        });
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
            <SimpleGrid columns={{ base: 2, md: 5 }} spacing={4} mb={6}>
                <Card bg="gray.900" borderColor="gray.800" borderWidth="1px">
                    <CardBody py={4}>
                        <HStack spacing={3}>
                            <Box p={2} bg="rgba(251, 191, 36, 0.1)" borderRadius="lg">
                                <Icon as={Clock} color="orange.400" boxSize={5} />
                            </Box>
                            <Box>
                                <Text fontSize="xs" color="gray.500">Pending Review</Text>
                                <Text fontSize="2xl" fontWeight="bold" color="gray.100">{pendingCount}</Text>
                            </Box>
                        </HStack>
                    </CardBody>
                </Card>

                <Card bg="gray.900" borderColor="gray.800" borderWidth="1px">
                    <CardBody py={4}>
                        <HStack spacing={3}>
                            <Box p={2} bg="rgba(34, 197, 94, 0.1)" borderRadius="lg">
                                <Icon as={CheckCircle} color="green.400" boxSize={5} />
                            </Box>
                            <Box>
                                <Text fontSize="xs" color="gray.500">Verified</Text>
                                <Text fontSize="2xl" fontWeight="bold" color="gray.100">{approvedCount}</Text>
                            </Box>
                        </HStack>
                    </CardBody>
                </Card>

                <Card bg="gray.900" borderColor="gray.800" borderWidth="1px">
                    <CardBody py={4}>
                        <HStack spacing={3}>
                            <Box p={2} bg="rgba(239, 68, 68, 0.1)" borderRadius="lg">
                                <Icon as={XCircle} color="red.400" boxSize={5} />
                            </Box>
                            <Box>
                                <Text fontSize="xs" color="gray.500">Rejected</Text>
                                <Text fontSize="2xl" fontWeight="bold" color="gray.100">-</Text>
                                <Text fontSize="xs" color="gray.500">Coming soon</Text>
                            </Box>
                        </HStack>
                    </CardBody>
                </Card>

                <Card bg="gray.900" borderColor="gray.800" borderWidth="1px">
                    <CardBody py={4}>
                        <HStack spacing={3}>
                            <Box p={2} bg="rgba(59, 130, 246, 0.1)" borderRadius="lg">
                                <Icon as={TrendingUp} color="blue.400" boxSize={5} />
                            </Box>
                            <Box>
                                <Text fontSize="xs" color="gray.500">New This Month</Text>
                                <Text fontSize="2xl" fontWeight="bold" color="gray.100">{newVendors}</Text>
                            </Box>
                        </HStack>
                    </CardBody>
                </Card>

                <Card bg="gray.900" borderColor="gray.800" borderWidth="1px">
                    <CardBody py={4}>
                        <HStack spacing={3}>
                            <Box p={2} bg="rgba(139, 92, 246, 0.1)" borderRadius="lg">
                                <Icon as={Store} color="purple.400" boxSize={5} />
                            </Box>
                            <Box>
                                <Text fontSize="xs" color="gray.500">Total Vendors</Text>
                                <Text fontSize="2xl" fontWeight="bold" color="gray.100">{totalVendors}</Text>
                            </Box>
                        </HStack>
                    </CardBody>
                </Card>
            </SimpleGrid>

            {/* Quick Actions */}
            <Flex justify="space-between" align={{ base: 'start', md: 'center' }} mb={4} flexDir={{ base: 'column', md: 'row' }} gap={3}>
                <Box>
                    <Text fontSize="sm" fontWeight="500" color="gray.400" mb={{ base: 2, md: 0 }}>Quick Actions</Text>
                    <Flex gap={2} flexWrap="wrap" mt={{ base: 2, md: 0 }}>
                        <Button
                            size="sm"
                            colorScheme="purple"
                            leftIcon={<Check size={14} />}
                            isDisabled={selectedVendors.length === 0}
                            onClick={handleBulkApprove}
                            isLoading={approveVendorMutation.isPending}
                        >
                            <Text display={{ base: 'none', sm: 'inline' }}>Bulk </Text>Approve ({selectedVendors.length})
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
                            <Text display={{ base: 'none', sm: 'inline' }}>Bulk </Text>Reject ({selectedVendors.length})
                        </Button>
                        <Button
                            size="sm"
                            variant="outline"
                            borderColor="gray.600"
                            leftIcon={<Bell size={14} />}
                            onClick={handleBulkSendReminders}
                            isDisabled={selectedVendors.length === 0}
                        >
                            <Text display={{ base: 'none', sm: 'inline' }}>Send </Text>Reminders
                        </Button>
                    </Flex>
                </Box>
                <Button
                    size="sm"
                    variant="outline"
                    borderColor="gray.600"
                    leftIcon={<FileText size={14} />}
                    mt={{ base: 2, md: 0 }}
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

                <Text fontSize="sm" color="gray.500" ml="auto">
                    Showing {filteredVendors.length} vendors
                </Text>
            </HStack>

            {/* Vendor Approval Queue */}
            <Box bg="gray.900" borderRadius="xl" borderWidth="1px" borderColor="gray.800" overflow="hidden">
                <Flex justify="space-between" align="center" p={4} borderBottomWidth="1px" borderColor="gray.800">
                    <Text fontWeight="600" color="gray.100">Merchant Approval Queue</Text>
                    <Text fontSize="sm" color="purple.400">{pendingCount} pending approvals</Text>
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
                                    <Th borderColor="gray.800" color="gray.500">CONTACT</Th>
                                    <Th borderColor="gray.800" color="gray.500">SUBMITTED</Th>
                                    <Th borderColor="gray.800" color="gray.500">STATUS</Th>
                                    <Th borderColor="gray.800" color="gray.500">ACTIONS</Th>
                                </Tr>
                            </Thead>
                            <Tbody>
                                {filteredVendors.length === 0 ? (
                                    <Tr>
                                        <Td colSpan={7} textAlign="center" py={8} borderColor="gray.800">
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
                                                    {vendor.store?.category || 'Not set'}
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
                                                <HStack spacing={1}>
                                                    {!vendor.isVerified && (
                                                        <IconButton
                                                            aria-label="Approve"
                                                            icon={<Check size={14} />}
                                                            size="xs"
                                                            colorScheme="green"
                                                            variant="ghost"
                                                            onClick={() => approveVendorMutation.mutate(vendor.id)}
                                                            isLoading={approveVendorMutation.isPending}
                                                        />
                                                    )}
                                                    {vendor.isVerified && (
                                                        <IconButton
                                                            aria-label="Revoke"
                                                            icon={<X size={14} />}
                                                            size="xs"
                                                            colorScheme="red"
                                                            variant="ghost"
                                                            onClick={() => rejectVendorMutation.mutate(vendor.id)}
                                                            isLoading={rejectVendorMutation.isPending}
                                                        />
                                                    )}
                                                    <Menu>
                                                        <MenuButton
                                                            as={IconButton}
                                                            icon={<MoreVertical size={14} />}
                                                            size="xs"
                                                            variant="ghost"
                                                        />
                                                        <MenuList bg="gray.800" borderColor="gray.700">
                                                            <MenuItem
                                                                bg="gray.800"
                                                                _hover={{ bg: 'gray.700' }}
                                                                icon={<Eye size={14} />}
                                                                onClick={() => handleViewDetails(vendor)}
                                                            >
                                                                View Details
                                                            </MenuItem>
                                                            <MenuItem
                                                                bg="gray.800"
                                                                _hover={{ bg: 'gray.700' }}
                                                                icon={<Bell size={14} />}
                                                                onClick={() => handleSendReminder(vendor)}
                                                            >
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

            {/* Vendor Details Modal */}
            <Modal isOpen={isOpen} onClose={onClose} size="xl">
                <ModalOverlay />
                <ModalContent bg="gray.900" borderColor="gray.700">
                    <ModalHeader color="gray.100">
                        Vendor Details
                        {selectedVendor && (
                            <Text fontSize="sm" color="gray.400" fontWeight="normal">
                                {selectedVendor.store?.name || `${selectedVendor.firstName} ${selectedVendor.lastName}`}
                            </Text>
                        )}
                    </ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        {selectedVendor && (
                            <VStack spacing={4} align="stretch">
                                {/* Business Info */}
                                <Box p={4} bg="gray.800" borderRadius="md">
                                    <SimpleGrid columns={2} spacing={4}>
                                        <Box>
                                            <Text fontSize="xs" color="gray.500">Business Name</Text>
                                            <Text color="gray.100">{selectedVendor.store?.name || 'Not set'}</Text>
                                        </Box>
                                        <Box>
                                            <Text fontSize="xs" color="gray.500">Category</Text>
                                            <Text color="gray.100">{selectedVendor.store?.category || 'Restaurant'}</Text>
                                        </Box>
                                        <Box>
                                            <Text fontSize="xs" color="gray.500">Owner Name</Text>
                                            <Text color="gray.100">{selectedVendor.firstName} {selectedVendor.lastName}</Text>
                                        </Box>
                                        <Box>
                                            <Text fontSize="xs" color="gray.500">Status</Text>
                                            {getStatusBadge(selectedVendor.isVerified)}
                                        </Box>
                                    </SimpleGrid>
                                </Box>

                                <Divider borderColor="gray.700" />

                                {/* Contact Info */}
                                <Text fontWeight="600" color="gray.100">Contact Information</Text>

                                <SimpleGrid columns={1} spacing={3}>
                                    <Box p={3} bg="gray.800" borderRadius="md">
                                        <Flex justify="space-between" align="center">
                                            <HStack>
                                                <Icon as={Mail} color="blue.400" />
                                                <Text color="gray.100">Email</Text>
                                            </HStack>
                                            <Text color="gray.300">{selectedVendor.email}</Text>
                                        </Flex>
                                    </Box>

                                    <Box p={3} bg="gray.800" borderRadius="md">
                                        <Flex justify="space-between" align="center">
                                            <HStack>
                                                <Icon as={Phone} color="green.400" />
                                                <Text color="gray.100">Phone</Text>
                                            </HStack>
                                            <Text color="gray.300">{selectedVendor.mobile}</Text>
                                        </Flex>
                                    </Box>

                                    <Box p={3} bg="gray.800" borderRadius="md">
                                        <Flex justify="space-between" align="center">
                                            <HStack>
                                                <Icon as={MapPin} color="orange.400" />
                                                <Text color="gray.100">Location</Text>
                                            </HStack>
                                            <Text color="gray.300">
                                                {selectedVendor.store?.address?.city || 'Not specified'}
                                                {selectedVendor.store?.address?.state ? `, ${selectedVendor.store.address.state}` : ''}
                                            </Text>
                                        </Flex>
                                    </Box>

                                    <Box p={3} bg="gray.800" borderRadius="md">
                                        <Flex justify="space-between" align="center">
                                            <HStack>
                                                <Icon as={Calendar} color="purple.400" />
                                                <Text color="gray.100">Registered</Text>
                                            </HStack>
                                            <Text color="gray.300">{formatDate(selectedVendor.createdAt)}</Text>
                                        </Flex>
                                    </Box>
                                </SimpleGrid>

                                <Divider borderColor="gray.700" />

                                {/* Verification Documents */}
                                <Text fontWeight="600" color="gray.100">Verification Documents</Text>

                                <SimpleGrid columns={1} spacing={3}>
                                    <Box p={3} bg="gray.800" borderRadius="md">
                                        <Flex justify="space-between" align="center">
                                            <HStack>
                                                <Icon as={FileText} color="green.400" />
                                                <Text color="gray.100">Business Registration (CAC)</Text>
                                            </HStack>
                                            <Badge colorScheme="gray">Coming Soon</Badge>
                                        </Flex>
                                    </Box>

                                    <Box p={3} bg="gray.800" borderRadius="md">
                                        <Flex justify="space-between" align="center">
                                            <HStack>
                                                <Icon as={FileText} color="blue.400" />
                                                <Text color="gray.100">Government ID</Text>
                                            </HStack>
                                            <Badge colorScheme="gray">Coming Soon</Badge>
                                        </Flex>
                                    </Box>

                                    <Box p={3} bg="gray.800" borderRadius="md">
                                        <Flex justify="space-between" align="center">
                                            <HStack>
                                                <Icon as={FileText} color="purple.400" />
                                                <Text color="gray.100">Tax Identification (TIN)</Text>
                                            </HStack>
                                            <Badge colorScheme="gray">Coming Soon</Badge>
                                        </Flex>
                                    </Box>
                                </SimpleGrid>
                            </VStack>
                        )}
                    </ModalBody>
                    <ModalFooter>
                        {selectedVendor && !selectedVendor.isVerified && (
                            <>
                                <Button
                                    colorScheme="red"
                                    variant="outline"
                                    mr={3}
                                    onClick={() => rejectVendorMutation.mutate(selectedVendor.id)}
                                    isLoading={rejectVendorMutation.isPending}
                                >
                                    Reject
                                </Button>
                                <Button
                                    colorScheme="green"
                                    onClick={() => approveVendorMutation.mutate(selectedVendor.id)}
                                    isLoading={approveVendorMutation.isPending}
                                >
                                    Approve
                                </Button>
                            </>
                        )}
                        {selectedVendor && selectedVendor.isVerified && (
                            <>
                                <Button
                                    colorScheme="red"
                                    variant="outline"
                                    mr={3}
                                    onClick={() => rejectVendorMutation.mutate(selectedVendor.id)}
                                    isLoading={rejectVendorMutation.isPending}
                                >
                                    Revoke Verification
                                </Button>
                                <Button variant="ghost" onClick={onClose}>Close</Button>
                            </>
                        )}
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </Box>
    );
};

export default MerchantApprovalPage;
