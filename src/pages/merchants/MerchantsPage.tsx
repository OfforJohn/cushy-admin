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
    useDisclosure,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    ModalCloseButton,
    Textarea,
    FormControl,
    FormLabel,
    Image,
    SimpleGrid,
} from '@chakra-ui/react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    Search,
    Filter,
    Download,
    RefreshCw,
    Eye,
    CheckCircle,
    XCircle,
    Wallet,
    Store,
    MapPin,
    Star,
    Utensils,
    Pill,
    ShoppingCart,
    Apple,
    UtensilsCrossed,
} from 'lucide-react';
import { adminApi } from '../../api/admin.api';
import { storesApi } from '../../api/stores.api';
import { DataGrid, Column } from '../../components/common/DataGrid';
import { VerificationStatusPill } from '../../components/common/StatusPill';
import { formatCurrency, formatDateTime } from '../../utils/formatters';
import { STORE_CATEGORY_LABELS } from '../../utils/constants';
import { Store as StoreType, StoreCategory } from '../../types/store.types';
import { useLocationFilter, matchesLocationFilter } from '../../context/LocationContext';

export const MerchantsPage: React.FC = () => {
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [categoryFilter, setCategoryFilter] = useState<string>('');
    const [verificationFilter, setVerificationFilter] = useState<string>('');
    const [searchQuery, setSearchQuery] = useState('');
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');

    const [selectedVendor, setSelectedVendor] = useState<StoreType | null>(null);
    const [verificationNote, setVerificationNote] = useState('');

    const { isOpen, onOpen, onClose } = useDisclosure();
    const toast = useToast();
    const queryClient = useQueryClient();
    const { selectedLocation } = useLocationFilter();

    // Fetch vendors (stores) - this has all store data including images, categories, locations
    const { data: vendorsData, isLoading, refetch } = useQuery({
        queryKey: ['vendors', categoryFilter],
        queryFn: () => storesApi.getStores(categoryFilter as StoreCategory || undefined),
    });

    // Verification mutation
    const verificationMutation = useMutation({
        mutationFn: ({ vendorId, isVerified, reason }: { vendorId: string; isVerified: boolean; reason?: string }) =>
            adminApi.updateVendorVerification(vendorId, { isVerified, reason }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['vendors'] });
            toast({
                title: 'Vendor updated',
                description: 'Verification status has been updated',
                status: 'success',
                duration: 3000,
            });
            onClose();
        },
        onError: () => {
            toast({
                title: 'Failed to update vendor',
                status: 'error',
                duration: 3000,
            });
        },
    });

    const vendors: StoreType[] = vendorsData?.data || [];

    // Filter vendors
    const filteredVendors = vendors.filter(vendor => {
        const matchesCategory = !categoryFilter || vendor.category === categoryFilter;
        const matchesVerification = !verificationFilter ||
            (verificationFilter === 'verified' && vendor.isVerified) ||
            (verificationFilter === 'pending' && !vendor.isVerified);
        const matchesSearch = !searchQuery ||
            vendor.name?.toLowerCase()?.includes(searchQuery.toLowerCase()) ||
            vendor.email?.toLowerCase()?.includes(searchQuery.toLowerCase()) ||
            vendor.mobile?.toLowerCase()?.includes(searchQuery.toLowerCase()) ||
            vendor.address?.city?.toLowerCase()?.includes(searchQuery.toLowerCase()) ||
            vendor.address?.address?.toLowerCase()?.includes(searchQuery.toLowerCase());
        // Use global location filter
        const matchesLocation = matchesLocationFilter(vendor.address?.city, selectedLocation) ||
            matchesLocationFilter(vendor.address?.address, selectedLocation);

        return matchesCategory && matchesVerification && matchesSearch && matchesLocation;
    });

    // Calculate stats from filtered data
    const statsData = {
        total: filteredVendors.length,
        verified: filteredVendors.filter(v => v.isVerified).length,
        pending: filteredVendors.filter(v => !v.isVerified).length,
        restaurants: filteredVendors.filter(v => v.category === StoreCategory.RESTAURANT).length,
        pharmacies: filteredVendors.filter(v => v.category === StoreCategory.MED_TECH).length,
        groceries: filteredVendors.filter(v => v.category === StoreCategory.GROCERY || v.category === StoreCategory.SUPER_MARKET).length,
    };

    const handleVerify = (vendor: StoreType, approve: boolean) => {
        setSelectedVendor(vendor);
        if (approve) {
            verificationMutation.mutate({
                vendorId: vendor.userId,
                isVerified: true,
            });
        } else {
            onOpen();
        }
    };

    const handleRejectConfirm = () => {
        if (selectedVendor) {
            verificationMutation.mutate({
                vendorId: selectedVendor.userId,
                isVerified: false,
                reason: verificationNote,
            });
        }
    };

    const getCategoryColor = (category: StoreCategory) => {
        switch (category) {
            case StoreCategory.RESTAURANT:
                return 'orange';
            case StoreCategory.GROCERY:
                return 'green';
            case StoreCategory.MED_TECH:
                return 'blue';
            case StoreCategory.SUPER_MARKET:
                return 'purple';
            case StoreCategory.LOCAL_FOOD:
                return 'red';
            default:
                return 'gray';
        }
    };

    const columns: Column<StoreType>[] = [
        {
            key: 'store',
            header: 'Vendor',
            render: (vendor) => (
                <HStack spacing={3}>
                    <Avatar
                        size="sm"
                        name={vendor.name || 'Store'}
                        src={vendor.coverImage}
                        bg="brand.primary.500"
                    />
                    <VStack align="start" spacing={0}>
                        <Text fontSize="sm" fontWeight="500">
                            {vendor.name || 'Unnamed Store'}
                        </Text>
                        <Text fontSize="xs" color="gray.500">
                            {vendor.email || 'No email'}
                        </Text>
                    </VStack>
                </HStack>
            ),
        },
        {
            key: 'category',
            header: 'Category',
            sortable: true,
            render: (vendor) => (
                <Badge colorScheme={getCategoryColor(vendor.category)}>
                    {STORE_CATEGORY_LABELS[vendor.category] || vendor.category}
                </Badge>
            ),
        },
        {
            key: 'location',
            header: 'Location',
            render: (vendor) => (
                <VStack spacing={0} align="start">
                    <HStack spacing={1} color="gray.300">
                        <Icon as={MapPin} boxSize={3} />
                        <Text fontSize="sm" noOfLines={1}>
                            {vendor.address?.city || 'Not specified'}
                            {vendor.address?.state ? `, ${vendor.address.state}` : ''}
                        </Text>
                    </HStack>
                    {vendor.address?.address && (
                        <Text fontSize="xs" color="gray.500" noOfLines={1} maxW="180px">
                            {vendor.address.address}
                        </Text>
                    )}
                </VStack>
            ),
        },
        {
            key: 'isVerified',
            header: 'Status',
            render: (vendor) => <VerificationStatusPill isVerified={vendor.isVerified} />,
        },
        {
            key: 'rating',
            header: 'Rating',
            sortable: true,
            render: (vendor) => (
                <HStack spacing={1}>
                    <Icon as={Star} color="yellow.400" boxSize={4} fill="currentColor" />
                    <Text fontWeight="500">{vendor.rating?.toFixed(1) || '0.0'}</Text>
                </HStack>
            ),
        },
        {
            key: 'ordersCount',
            header: 'Orders',
            sortable: true,
            render: (vendor) => (
                <Badge colorScheme="gray">{vendor.ordersCount || 0}</Badge>
            ),
        },
        {
            key: 'walletBalance',
            header: 'Balance',
            sortable: true,
            render: (vendor) => (
                <Text fontWeight="500" color="green.400">
                    {formatCurrency(vendor.walletBalance || 0)}
                </Text>
            ),
        },
    ];

    const renderActions = (vendor: StoreType) => (
        <>
            <MenuItem icon={<Eye size={16} />}>
                View Details
            </MenuItem>
            <MenuItem icon={<Wallet size={16} />}>
                View Payouts
            </MenuItem>
            {!vendor.isVerified && (
                <MenuItem
                    icon={<CheckCircle size={16} />}
                    color="green.400"
                    onClick={() => handleVerify(vendor, true)}
                >
                    Approve
                </MenuItem>
            )}
            {vendor.isVerified && (
                <MenuItem
                    icon={<XCircle size={16} />}
                    color="red.400"
                    onClick={() => handleVerify(vendor, false)}
                >
                    Suspend
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
                        Merchants
                    </Heading>
                    <Text color="gray.500">
                        Manage all merchants - restaurants, pharmacies, and stores
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
                </HStack>
            </Flex>

            {/* Stats Cards */}
            <SimpleGrid columns={{ base: 2, md: 3, lg: 6 }} spacing={4} mb={6}>
                <Box
                    bg="gray.900"
                    px={5}
                    py={4}
                    borderRadius="xl"
                    border="1px solid"
                    borderColor="gray.800"
                >
                    <Text fontSize="xs" color="gray.500" mb={1}>Total Merchants</Text>
                    <Text fontSize="2xl" fontWeight="bold" color="gray.100">
                        {statsData.total}
                    </Text>
                    <Text fontSize="xs" color="gray.500" mt={1}>{vendors.length} total loaded</Text>
                </Box>
                <Box
                    bg="gray.900"
                    px={5}
                    py={4}
                    borderRadius="xl"
                    border="1px solid"
                    borderColor="gray.800"
                >
                    <Text fontSize="xs" color="gray.500" mb={1}>Verified</Text>
                    <Text fontSize="2xl" fontWeight="bold" color="green.400">
                        {statsData.verified}
                    </Text>
                    <Text fontSize="xs" color="green.300" mt={1}>
                        {statsData.total > 0 ? Math.round((statsData.verified / statsData.total) * 100) : 0}% verified
                    </Text>
                </Box>
                <Box
                    bg="gray.900"
                    px={5}
                    py={4}
                    borderRadius="xl"
                    border="1px solid"
                    borderColor="gray.800"
                >
                    <Text fontSize="xs" color="gray.500" mb={1}>Pending</Text>
                    <Text fontSize="2xl" fontWeight="bold" color="yellow.400">
                        {statsData.pending}
                    </Text>
                    <Text fontSize="xs" color="yellow.300" mt={1}>Awaiting verification</Text>
                </Box>
                <Box
                    bg="gray.900"
                    px={5}
                    py={4}
                    borderRadius="xl"
                    border="1px solid"
                    borderColor="gray.800"
                >
                    <HStack spacing={2} mb={1}>
                        <Icon as={Utensils} color="orange.400" boxSize={4} />
                        <Text fontSize="xs" color="gray.500">Restaurants</Text>
                    </HStack>
                    <Text fontSize="2xl" fontWeight="bold" color="orange.400">
                        {statsData.restaurants}
                    </Text>
                </Box>
                <Box
                    bg="gray.900"
                    px={5}
                    py={4}
                    borderRadius="xl"
                    border="1px solid"
                    borderColor="gray.800"
                >
                    <HStack spacing={2} mb={1}>
                        <Icon as={Pill} color="blue.400" boxSize={4} />
                        <Text fontSize="xs" color="gray.500">Pharmacies</Text>
                    </HStack>
                    <Text fontSize="2xl" fontWeight="bold" color="blue.400">
                        {statsData.pharmacies}
                    </Text>
                </Box>
                <Box
                    bg="gray.900"
                    px={5}
                    py={4}
                    borderRadius="xl"
                    border="1px solid"
                    borderColor="gray.800"
                >
                    <HStack spacing={2} mb={1}>
                        <Icon as={ShoppingCart} color="green.400" boxSize={4} />
                        <Text fontSize="xs" color="gray.500">Groceries</Text>
                    </HStack>
                    <Text fontSize="2xl" fontWeight="bold" color="green.400">
                        {statsData.groceries}
                    </Text>
                </Box>
            </SimpleGrid>

            {/* Filters */}
            <Box bg="gray.900" p={4} borderRadius="xl" borderWidth="1px" borderColor="gray.800" mb={6}>
                <Flex gap={4} flexWrap="wrap" align="flex-end">
                    <InputGroup maxW="250px" size="sm">
                        <InputLeftElement>
                            <Icon as={Search} color="gray.500" boxSize={4} />
                        </InputLeftElement>
                        <Input
                            placeholder="Search merchants..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            bg="gray.800"
                            borderColor="gray.700"
                        />
                    </InputGroup>

                    <Box minW="140px">
                        <Text fontSize="xs" color="gray.500" mb={1}>Category</Text>
                        <Select
                            placeholder="All Categories"
                            size="sm"
                            bg="gray.800"
                            borderColor="gray.700"
                            value={categoryFilter}
                            onChange={(e) => setCategoryFilter(e.target.value)}
                        >
                            <option value="restaurant">Restaurants</option>
                            <option value="grocery">Grocery</option>
                            <option value="med_tech">Pharmacy</option>
                            <option value="super_market">Supermarket</option>
                            <option value="local_food">Local Food</option>
                        </Select>
                    </Box>

                    <Box minW="130px">
                        <Text fontSize="xs" color="gray.500" mb={1}>Status</Text>
                        <Select
                            placeholder="All Status"
                            size="sm"
                            bg="gray.800"
                            borderColor="gray.700"
                            value={verificationFilter}
                            onChange={(e) => setVerificationFilter(e.target.value)}
                        >
                            <option value="verified">Verified</option>
                            <option value="pending">Pending</option>
                        </Select>
                    </Box>

                    <Box minW="130px">
                        <Text fontSize="xs" color="gray.500" mb={1}>Date From</Text>
                        <Input
                            type="date"
                            value={dateFrom}
                            onChange={(e) => setDateFrom(e.target.value)}
                            size="sm"
                            bg="gray.800"
                            borderColor="gray.700"
                        />
                    </Box>

                    <Box minW="130px">
                        <Text fontSize="xs" color="gray.500" mb={1}>Date To</Text>
                        <Input
                            type="date"
                            value={dateTo}
                            onChange={(e) => setDateTo(e.target.value)}
                            size="sm"
                            bg="gray.800"
                            borderColor="gray.700"
                        />
                    </Box>

                    {(categoryFilter || verificationFilter || dateFrom || dateTo || searchQuery) && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                                setCategoryFilter('');
                                setVerificationFilter('');
                                setDateFrom('');
                                setDateTo('');
                                setSearchQuery('');
                            }}
                        >
                            Clear
                        </Button>
                    )}

                    <Button
                        leftIcon={<Download size={14} />}
                        variant="outline"
                        size="sm"
                        borderColor="gray.600"
                        ml="auto"
                        onClick={() => {
                            const csv = filteredVendors.map(v =>
                                `"${v.id}","${v.name || ''}","${v.email || ''}","${v.category}","${v.address?.city || ''}","${v.isVerified ? 'Verified' : 'Pending'}","${v.rating || 0}"`
                            ).join('\n');
                            const blob = new Blob([`ID,Name,Email,Category,City,Status,Rating\n${csv}`], { type: 'text/csv' });
                            const url = URL.createObjectURL(blob);
                            const a = document.createElement('a');
                            a.href = url;
                            a.download = 'merchants.csv';
                            a.click();
                        }}
                    >
                        Export CSV
                    </Button>
                </Flex>
            </Box >

            {/* Vendors Table */}
            < DataGrid
                data={filteredVendors}
                columns={columns}
                isLoading={isLoading}
                page={page}
                pageSize={pageSize}
                totalItems={filteredVendors.length}
                onPageChange={setPage}
                onPageSizeChange={setPageSize}
                actions={renderActions}
                selectable
                exportable
                emptyMessage="No vendors found"
            />

            {/* Rejection Modal */}
            < Modal isOpen={isOpen} onClose={onClose} >
                <ModalOverlay />
                <ModalContent bg="gray.900">
                    <ModalHeader>Reject Vendor</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <Text color="gray.400" mb={4}>
                            Please provide a reason for rejecting or suspending this vendor.
                        </Text>
                        <FormControl>
                            <FormLabel>Reason</FormLabel>
                            <Textarea
                                value={verificationNote}
                                onChange={(e) => setVerificationNote(e.target.value)}
                                placeholder="Enter rejection reason..."
                                rows={4}
                            />
                        </FormControl>
                    </ModalBody>
                    <ModalFooter gap={2}>
                        <Button variant="ghost" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button
                            colorScheme="red"
                            onClick={handleRejectConfirm}
                            isLoading={verificationMutation.isPending}
                        >
                            Confirm Rejection
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal >
        </Box >
    );
};

export default MerchantsPage;
