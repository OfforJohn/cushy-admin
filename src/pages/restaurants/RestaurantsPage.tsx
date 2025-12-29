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

export const VendorsPage: React.FC = () => {
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [categoryFilter, setCategoryFilter] = useState<string>('');
    const [verificationFilter, setVerificationFilter] = useState<string>('');
    const [searchQuery, setSearchQuery] = useState('');

    const [selectedVendor, setSelectedVendor] = useState<StoreType | null>(null);
    const [verificationNote, setVerificationNote] = useState('');

    const { isOpen, onOpen, onClose } = useDisclosure();
    const toast = useToast();
    const queryClient = useQueryClient();

    // Fetch vendors
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
            vendor.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            vendor.email?.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesVerification && matchesSearch;
    });

    const handleVerify = (vendor: StoreType, approve: boolean) => {
        setSelectedVendor(vendor);
        if (approve) {
            verificationMutation.mutate({
                vendorId: vendor.id,
                isVerified: true,
            });
        } else {
            onOpen();
        }
    };

    const handleRejectConfirm = () => {
        if (selectedVendor) {
            verificationMutation.mutate({
                vendorId: selectedVendor.id,
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
                <HStack spacing={1} color="gray.400">
                    <Icon as={MapPin} boxSize={3} />
                    <Text fontSize="sm">
                        {vendor.address?.city || 'Not specified'}
                    </Text>
                </HStack>
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
            <MenuItem icon={<Store size={16} />}>
                View Products
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
            <HStack spacing={4} mb={6} overflowX="auto">
                <Box
                    bg="gray.900"
                    px={4}
                    py={3}
                    borderRadius="lg"
                    border="1px solid"
                    borderColor="gray.800"
                    minW="100px"
                >
                    <Text fontSize="sm" color="gray.500">Total</Text>
                    <Text fontSize="xl" fontWeight="bold" color="gray.100">
                        {vendors.length}
                    </Text>
                </Box>
                <Box
                    bg="gray.900"
                    px={4}
                    py={3}
                    borderRadius="lg"
                    border="1px solid"
                    borderColor="gray.800"
                    minW="100px"
                >
                    <Text fontSize="sm" color="gray.500">Verified</Text>
                    <Text fontSize="xl" fontWeight="bold" color="green.400">
                        {vendors.filter(v => v.isVerified).length}
                    </Text>
                </Box>
                <Box
                    bg="gray.900"
                    px={4}
                    py={3}
                    borderRadius="lg"
                    border="1px solid"
                    borderColor="gray.800"
                    minW="100px"
                >
                    <Text fontSize="sm" color="gray.500">Pending</Text>
                    <Text fontSize="xl" fontWeight="bold" color="yellow.400">
                        {vendors.filter(v => !v.isVerified).length}
                    </Text>
                </Box>
                <Box
                    bg="gray.900"
                    px={4}
                    py={3}
                    borderRadius="lg"
                    border="1px solid"
                    borderColor="gray.800"
                    minW="120px"
                >
                    <HStack spacing={2}>
                        <Icon as={Utensils} color="orange.400" boxSize={4} />
                        <Text fontSize="sm" color="gray.500">Restaurants</Text>
                    </HStack>
                    <Text fontSize="xl" fontWeight="bold" color="orange.400">
                        {vendors.filter(v => v.category === StoreCategory.RESTAURANT).length}
                    </Text>
                </Box>
                <Box
                    bg="gray.900"
                    px={4}
                    py={3}
                    borderRadius="lg"
                    border="1px solid"
                    borderColor="gray.800"
                    minW="120px"
                >
                    <HStack spacing={2}>
                        <Icon as={Pill} color="blue.400" boxSize={4} />
                        <Text fontSize="sm" color="gray.500">Pharmacies</Text>
                    </HStack>
                    <Text fontSize="xl" fontWeight="bold" color="blue.400">
                        {vendors.filter(v => v.category === StoreCategory.MED_TECH).length}
                    </Text>
                </Box>
                <Box
                    bg="gray.900"
                    px={4}
                    py={3}
                    borderRadius="lg"
                    border="1px solid"
                    borderColor="gray.800"
                    minW="120px"
                >
                    <HStack spacing={2}>
                        <Icon as={ShoppingCart} color="green.400" boxSize={4} />
                        <Text fontSize="sm" color="gray.500">Groceries</Text>
                    </HStack>
                    <Text fontSize="xl" fontWeight="bold" color="green.400">
                        {vendors.filter(v => v.category === StoreCategory.GROCERY || v.category === StoreCategory.SUPER_MARKET).length}
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
                        placeholder="Search vendors..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        size="sm"
                    />
                </InputGroup>

                <Select
                    placeholder="All Categories"
                    maxW="180px"
                    size="sm"
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                >
                    <option value="restaurant">Restaurants</option>
                    <option value="grocery">Grocery</option>
                    <option value="med_tech">Pharmacy</option>
                    <option value="super_market">Supermarket</option>
                    <option value="local_food">Local Food</option>
                </Select>

                <Select
                    placeholder="All Status"
                    maxW="150px"
                    size="sm"
                    value={verificationFilter}
                    onChange={(e) => setVerificationFilter(e.target.value)}
                >
                    <option value="verified">Verified</option>
                    <option value="pending">Pending</option>
                </Select>

                <Button leftIcon={<Filter size={16} />} variant="ghost" size="sm">
                    More Filters
                </Button>
            </Flex>

            {/* Vendors Table */}
            <DataGrid
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
            <Modal isOpen={isOpen} onClose={onClose}>
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
            </Modal>
        </Box>
    );
};

export default VendorsPage;
