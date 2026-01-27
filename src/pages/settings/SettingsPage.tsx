import React, { useState, useEffect } from 'react';
import {
    Box,
    Flex,
    Heading,
    Text,
    Tabs,
    TabList,
    TabPanels,
    Tab,
    TabPanel,
    Input,
    InputGroup,
    InputLeftElement,
    Icon,
    VStack,
    HStack,
    Avatar,
    Badge,
    Button,
    IconButton,
    Switch,
    SimpleGrid,
    useToast,
    Divider,
    Card,
    CardBody,
    CardHeader,
    Menu,
    MenuButton,
    MenuList,
    MenuItem,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    ModalCloseButton,
    useDisclosure,
    FormControl,
    FormLabel,
    Select,
    Spinner,
    Alert,
    AlertIcon,
    InputRightElement,
} from '@chakra-ui/react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    Search,
    Plus,
    Edit,
    MoreVertical,
    ShoppingBag,
    Utensils,
    ShoppingCart,
    Check,
    AlertCircle,
    Database,
    CreditCard,
    Globe,
    MessageSquare,
    Mail,
    Bell,
    Tag,
    Trash2,
    Lock,
    Eye,
    EyeOff,
    KeyRound,
} from 'lucide-react';
import { adminApi } from '../../api/admin.api';
import { promoApi, Coupon, CreateCouponDto, CouponType } from '../../api/promo.api';
import { storesApi } from '../../api/stores.api';
import { usersApi } from '../../api/users.api';
import { useAuth } from '../../context/AuthContext';

// System Service interface
interface SystemService {
    name: string;
    icon: React.ElementType;
    status: 'Operational' | 'Degraded' | 'Down';
}

export const SettingsPage: React.FC = () => {
    const toast = useToast();
    const queryClient = useQueryClient();
    const { isOpen: isCouponModalOpen, onOpen: onCouponModalOpen, onClose: onCouponModalClose } = useDisclosure();
    const { isOpen: isEditModalOpen, onOpen: onEditModalOpen, onClose: onEditModalClose } = useDisclosure();
    const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);

    const [freeDeliveryEnabled, setFreeDeliveryEnabled] = useState(false);
    const [selectedCategories, setSelectedCategories] = useState<string[]>(['all']);
    const [userSearch, setUserSearch] = useState('');
    const [couponTab, setCouponTab] = useState(0);
    const [isSaving, setIsSaving] = useState(false);
    const [appliesToType, setAppliesToType] = useState<'SITE' | 'MERCHANT'>('SITE');
    const [selectedMerchantId, setSelectedMerchantId] = useState<string>('');

    // New coupon form state
    const [newCoupon, setNewCoupon] = useState<CreateCouponDto>({
        code: '',
        type: 'PERCENT',
        value: 0,
        appliesTo: 'SITE',
        startDate: '',
        endDate: '',
        usageLimit: undefined,
    });

    // Change password state
    const { user } = useAuth();
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isChangingPassword, setIsChangingPassword] = useState(false);
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);

    // Fetch free delivery status - with error handling
    const { data: freeDeliveryData, isError: freeDeliveryError } = useQuery({
        queryKey: ['freeDeliveryStatus'],
        queryFn: () => adminApi.getGlobalFreeDeliveryStatus(),
        retry: false,
        staleTime: 30000,
    });

    // Fetch coupons - with error handling
    const { data: couponsData, isLoading: couponsLoading, isError: couponsError } = useQuery({
        queryKey: ['coupons'],
        queryFn: () => promoApi.getAllCoupons(),
        retry: false,
        staleTime: 30000,
    });

    // Fetch stores for merchant dropdown - with error handling
    const { data: storesData, isError: storesError } = useQuery({
        queryKey: ['stores'],
        queryFn: () => storesApi.getAllStores(),
        retry: false,
        staleTime: 30000,
    });

    // Fetch user summaries for quick access - with error handling
    const { data: userSummariesData, isError: userSummariesError } = useQuery({
        queryKey: ['userSummaries'],
        queryFn: () => adminApi.getUserSummaries(1, 5),
        retry: false,
        staleTime: 30000,
    });

    // Update free delivery when data loads
    useEffect(() => {
        if (freeDeliveryData?.data?.result !== undefined) {
            setFreeDeliveryEnabled(freeDeliveryData.data.result);
        }
    }, [freeDeliveryData]);

    // Toggle free delivery mutation
    const toggleFreeDeliveryMutation = useMutation({
        mutationFn: (isActive: boolean) => adminApi.toggleGlobalFreeDelivery(isActive),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['freeDeliveryStatus'] });
            toast({
                title: 'Free delivery settings updated',
                status: 'success',
                duration: 2000,
            });
        },
        onError: () => {
            toast({
                title: 'Failed to update free delivery',
                status: 'error',
                duration: 3000,
            });
        },
    });

    // Create coupon mutation
    const createCouponMutation = useMutation({
        mutationFn: (data: CreateCouponDto) => promoApi.createCoupon(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['coupons'] });
            toast({
                title: 'Coupon created successfully',
                status: 'success',
                duration: 2000,
            });
            onCouponModalClose();
            resetCouponForm();
        },
        onError: (error: any) => {
            toast({
                title: 'Failed to create coupon',
                description: error?.response?.data?.message || 'An error occurred',
                status: 'error',
                duration: 3000,
            });
        },
    });

    // Deactivate coupon mutation
    const deactivateCouponMutation = useMutation({
        mutationFn: (id: string) => promoApi.deactivateCoupon(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['coupons'] });
            toast({
                title: 'Coupon deactivated',
                status: 'success',
                duration: 2000,
            });
        },
        onError: () => {
            toast({
                title: 'Failed to deactivate coupon',
                status: 'error',
                duration: 3000,
            });
        },
    });

    // Delete coupon mutation
    const deleteCouponMutation = useMutation({
        mutationFn: (id: string) => promoApi.deletePromoCode(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['coupons'] });
            toast({
                title: 'Coupon deleted',
                status: 'success',
                duration: 2000,
            });
        },
        onError: () => {
            toast({
                title: 'Failed to delete coupon',
                status: 'error',
                duration: 3000,
            });
        },
    });

    const coupons: Coupon[] = Array.isArray(couponsData?.data) ? couponsData.data : [];
    // /api/v1/stores returns { data: [...stores...] }
    const stores = Array.isArray(storesData?.data) ? storesData.data : [];
    const userSummaries = Array.isArray(userSummariesData?.data) ? userSummariesData.data : [];

    // Filter coupons by tab
    const getFilteredCoupons = () => {
        switch (couponTab) {
            case 1: // Site-Wide
                return coupons.filter(c => c.appliesTo === 'SITE' || !c.appliesTo);
            case 2: // Merchant-Specific
                return coupons.filter(c => c.appliesTo && c.appliesTo !== 'SITE');
            case 3: // Active
                return coupons.filter(c => c.isActive);
            case 4: // Expired
                return coupons.filter(c => !c.isActive || (c.endDate && new Date(c.endDate) < new Date()));
            default:
                return coupons;
        }
    };

    // Mock service areas (would need a backend endpoint, rememebr to mention this to Dev. Taofeek 
    // - or maybe I'll just implement it myself on the backend, once I'm free)
    const serviceAreas = [
        { id: '1', name: 'Minna', state: 'Niger State', status: 'Active' as const },
        { id: '2', name: 'Abuja', state: 'FCT', status: 'Active' as const },
        { id: '3', name: 'Lagos', state: 'Lagos State', status: 'Pending' as const },
    ];

    // System services status (would need health check endpoints, this too.)
    const systemServices: SystemService[] = [
        { name: 'Database', icon: Database, status: 'Operational' },
        { name: 'Payment Gateway', icon: CreditCard, status: 'Operational' },
        { name: 'API Services', icon: Globe, status: 'Operational' },
        { name: 'SMS Service', icon: MessageSquare, status: 'Degraded' },
        { name: 'Email Service', icon: Mail, status: 'Operational' },
        { name: 'Push Notifications', icon: Bell, status: 'Operational' },
    ];

    const resetCouponForm = () => {
        setNewCoupon({
            code: '',
            type: 'PERCENT',
            value: 0,
            appliesTo: 'SITE',
            startDate: '',
            endDate: '',
            usageLimit: undefined,
        });
        setAppliesToType('SITE');
        setSelectedMerchantId('');
    };

    const handleCreateCoupon = () => {
        if (!newCoupon.code || !newCoupon.value) {
            toast({
                title: 'Please fill in required fields',
                status: 'warning',
                duration: 2000,
            });
            return;
        }

        // Set appliesTo based on type selection
        const couponData: CreateCouponDto = {
            ...newCoupon,
            appliesTo: appliesToType === 'MERCHANT' && selectedMerchantId ? selectedMerchantId : 'SITE',
        };

        createCouponMutation.mutate(couponData);
    };

    const handleFreeDeliveryToggle = () => {
        const newValue = !freeDeliveryEnabled;
        setFreeDeliveryEnabled(newValue);
        toggleFreeDeliveryMutation.mutate(newValue);
    };

    const toggleCategory = (category: string) => {
        if (category === 'all') {
            setSelectedCategories(['all']);
        } else {
            setSelectedCategories(prev => {
                const filtered = prev.filter(c => c !== 'all');
                if (filtered.includes(category)) {
                    return filtered.filter(c => c !== category);
                }
                return [...filtered, category];
            });
        }
    };

    const handleSaveChanges = async () => {
        setIsSaving(true);
        try {
            await toggleFreeDeliveryMutation.mutateAsync(freeDeliveryEnabled);
            toast({
                title: 'Settings saved successfully',
                status: 'success',
                duration: 2000,
            });
        } catch {
            toast({
                title: 'Failed to save settings',
                status: 'error',
                duration: 3000,
            });
        } finally {
            setIsSaving(false);
        }
    };

    const handleChangePassword = async () => {
        // Validation
        if (!currentPassword || !newPassword || !confirmPassword) {
            toast({
                title: 'All fields are required',
                status: 'warning',
                duration: 3000,
            });
            return;
        }

        if (newPassword.length < 6) {
            toast({
                title: 'New password must be at least 6 characters',
                status: 'warning',
                duration: 3000,
            });
            return;
        }

        if (newPassword !== confirmPassword) {
            toast({
                title: 'Passwords do not match',
                description: 'New password and confirm password must be the same',
                status: 'error',
                duration: 3000,
            });
            return;
        }

        if (!user?.email) {
            toast({
                title: 'Session error',
                description: 'Please log in again',
                status: 'error',
                duration: 3000,
            });
            return;
        }

        setIsChangingPassword(true);
        try {
            await usersApi.changePassword(user.email, currentPassword, newPassword);
            toast({
                title: 'Password changed successfully',
                description: 'Your password has been updated',
                status: 'success',
                duration: 3000,
            });
            // Clear the form
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } catch (error: any) {
            const errorMessage = error?.response?.data?.message || 'Failed to change password';
            toast({
                title: 'Failed to change password',
                description: errorMessage === 'INCORRECT_OLD_PASSWORD' ? 'Current password is incorrect' : errorMessage,
                status: 'error',
                duration: 5000,
            });
        } finally {
            setIsChangingPassword(false);
        }
    };

    const renderGeneralTab = () => (
        <Box>
            {/* API Error Notice */}
            {(freeDeliveryError || couponsError || userSummariesError) && (
                <Alert status="warning" mb={4} borderRadius="md">
                    <AlertIcon />
                    <Text fontSize="sm">Some features may be limited due to API connectivity issues.</Text>
                </Alert>
            )}

            <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6} mb={6}>
                {/* See Users Cart */}
                <Card bg="gray.900" borderColor="gray.800">
                    <CardHeader>
                        <Flex justify="space-between" align="center">
                            <Heading size="sm">See Users Cart</Heading>
                            <Icon as={Search} color="gray.500" />
                        </Flex>
                    </CardHeader>
                    <CardBody pt={0}>
                        <InputGroup mb={4}>
                            <InputLeftElement>
                                <Search size={16} color="#6b7280" />
                            </InputLeftElement>
                            <Input
                                placeholder="Enter user ID, phone or email..."
                                size="sm"
                                value={userSearch}
                                onChange={(e) => setUserSearch(e.target.value)}
                            />
                        </InputGroup>

                        <Text fontSize="xs" color="gray.500" mb={3}>Quick Access</Text>
                        <VStack spacing={3} align="stretch">
                            {userSummaries.length === 0 && (
                                <Text color="gray.500" fontSize="sm">No users found</Text>
                            )}
                            {userSummaries.slice(0, 3).map((user: any) => (
                                <Flex key={user.id} justify="space-between" align="center" p={2} borderRadius="md" _hover={{ bg: 'gray.800' }} cursor="pointer">
                                    <HStack spacing={3}>
                                        <Avatar size="sm" name={`${user.firstName} ${user.lastName}`} bg="purple.500" />
                                        <Box>
                                            <Text fontSize="sm" fontWeight="500">{user.firstName} {user.lastName}</Text>
                                            <Text fontSize="xs" color="brand.accent.500">{user.email}</Text>
                                        </Box>
                                    </HStack>
                                    <Text fontSize="sm" color="gray.500">View cart</Text>
                                </Flex>
                            ))}
                        </VStack>

                        <SimpleGrid columns={2} spacing={4} mt={6}>
                            <Box textAlign="center" p={4} bg="gray.800" borderRadius="lg">
                                <Text fontSize="xs" color="gray.500">Active Carts</Text>
                                <Text fontSize="2xl" fontWeight="bold" color="gray.100">0</Text>
                            </Box>
                            <Box textAlign="center" p={4} bg="gray.800" borderRadius="lg">
                                <Text fontSize="xs" color="gray.500">Abandoned</Text>
                                <Text fontSize="2xl" fontWeight="bold" color="red.400">0</Text>
                            </Box>
                        </SimpleGrid>
                    </CardBody>
                </Card>

                {/* Service Areas */}
                <Card bg="gray.900" borderColor="gray.800">
                    <CardHeader>
                        <Flex justify="space-between" align="center">
                            <Heading size="sm">Service Areas</Heading>
                            <Button leftIcon={<Plus size={14} />} size="sm" colorScheme="purple">
                                Add City
                            </Button>
                        </Flex>
                    </CardHeader>
                    <CardBody pt={0}>
                        <VStack spacing={3} align="stretch">
                            {serviceAreas.map(area => (
                                <Flex key={area.id} justify="space-between" align="center" p={3} bg="gray.800" borderRadius="lg">
                                    <HStack spacing={3}>
                                        <Box
                                            w={10}
                                            h={10}
                                            borderRadius="full"
                                            bg={area.status === 'Active' ? 'green.500' : 'orange.500'}
                                            display="flex"
                                            alignItems="center"
                                            justifyContent="center"
                                        >
                                            {area.status === 'Active' ? <Check size={20} color="white" /> : <AlertCircle size={20} color="white" />}
                                        </Box>
                                        <Box>
                                            <Text fontWeight="500">{area.name}</Text>
                                            <Text fontSize="xs" color="gray.500">{area.state}</Text>
                                        </Box>
                                    </HStack>
                                    <HStack>
                                        <Badge
                                            colorScheme={area.status === 'Active' ? 'green' : 'orange'}
                                            variant="subtle"
                                        >
                                            {area.status}
                                        </Badge>
                                        <Menu>
                                            <MenuButton as={IconButton} icon={<MoreVertical size={16} />} variant="ghost" size="sm" />
                                            <MenuList bg="gray.800" borderColor="gray.700">
                                                <MenuItem bg="gray.800" _hover={{ bg: 'gray.700' }}>Edit</MenuItem>
                                                <MenuItem bg="gray.800" _hover={{ bg: 'gray.700' }} color="red.400">Remove</MenuItem>
                                            </MenuList>
                                        </Menu>
                                    </HStack>
                                </Flex>
                            ))}
                        </VStack>
                    </CardBody>
                </Card>
            </SimpleGrid>

            {/* Coupon Management */}
            <Card bg="gray.900" borderColor="gray.800" mb={6}>
                <CardHeader>
                    <Flex justify="space-between" align={{ base: 'start', md: 'center' }} flexDir={{ base: 'column', md: 'row' }} gap={3}>
                        <Box>
                            <Heading size="sm">Coupon Management</Heading>
                            <Text fontSize="sm" color="gray.500">Create and manage site-wide and merchant-specific coupons</Text>
                        </Box>
                        <Button leftIcon={<Plus size={14} />} size="sm" colorScheme="purple" onClick={onCouponModalOpen}>
                            Create Coupon
                        </Button>
                    </Flex>
                </CardHeader>
                <CardBody pt={0}>
                    <Tabs index={couponTab} onChange={setCouponTab} variant="unstyled">
                        <Box overflowX="auto" pb={2}>
                            <TabList borderBottom="1px solid" borderColor="gray.800" mb={4} minW="max-content">
                                <Tab _selected={{ borderBottom: '2px solid', borderColor: 'purple.500', color: 'white' }} color="gray.500" pb={2} fontSize={{ base: 'xs', sm: 'sm' }} whiteSpace="nowrap">All Coupons</Tab>
                                <Tab _selected={{ borderBottom: '2px solid', borderColor: 'purple.500', color: 'white' }} color="gray.500" pb={2} fontSize={{ base: 'xs', sm: 'sm' }} whiteSpace="nowrap">Site-Wide</Tab>
                                <Tab _selected={{ borderBottom: '2px solid', borderColor: 'purple.500', color: 'white' }} color="gray.500" pb={2} fontSize={{ base: 'xs', sm: 'sm' }} whiteSpace="nowrap">Merchant-Specific</Tab>
                                <Tab _selected={{ borderBottom: '2px solid', borderColor: 'purple.500', color: 'white' }} color="gray.500" pb={2} fontSize={{ base: 'xs', sm: 'sm' }} whiteSpace="nowrap">Active</Tab>
                                <Tab _selected={{ borderBottom: '2px solid', borderColor: 'purple.500', color: 'white' }} color="gray.500" pb={2} fontSize={{ base: 'xs', sm: 'sm' }} whiteSpace="nowrap">Expired</Tab>
                            </TabList>
                        </Box>
                        <TabPanels>
                            {[0, 1, 2, 3, 4].map((tabIndex) => (
                                <TabPanel key={tabIndex} p={0}>
                                    {couponsLoading ? (
                                        <Flex justify="center" py={8}>
                                            <Spinner color="purple.500" />
                                        </Flex>
                                    ) : (
                                        <VStack spacing={3} align="stretch">
                                            {getFilteredCoupons().length === 0 && (
                                                <Text color="gray.500" textAlign="center" py={8}>No coupons found</Text>
                                            )}
                                            {getFilteredCoupons().map((coupon) => (
                                                <Flex key={coupon.id} justify="space-between" align="center" p={4} bg="gray.800" borderRadius="lg">
                                                    <HStack spacing={4}>
                                                        <Icon as={Tag} color="brand.accent.500" boxSize={6} />
                                                        <Box>
                                                            <HStack>
                                                                <Text fontWeight="600">{coupon.code}</Text>
                                                                <Badge colorScheme="purple" size="sm">
                                                                    {coupon.appliesTo === 'SITE' || !coupon.appliesTo ? 'Site-Wide' : 'Merchant'}
                                                                </Badge>
                                                            </HStack>
                                                            <Text fontSize="sm" color="brand.accent.500">
                                                                {coupon.value}{coupon.type === 'PERCENT' ? '%' : '₦'} discount
                                                            </Text>
                                                            <HStack fontSize="xs" color="gray.500" mt={1}>
                                                                {coupon.endDate && <Text>Valid until {new Date(coupon.endDate).toLocaleDateString()}</Text>}
                                                                <Text>• {coupon.usedCount || 0} uses</Text>
                                                                <Badge colorScheme={coupon.isActive ? 'green' : 'red'} size="sm">
                                                                    {coupon.isActive ? 'ACTIVE' : 'INACTIVE'}
                                                                </Badge>
                                                            </HStack>
                                                        </Box>
                                                    </HStack>
                                                    <HStack>
                                                        <IconButton
                                                            aria-label="Edit"
                                                            icon={<Edit size={14} />}
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => {
                                                                setEditingCoupon(coupon);
                                                                onEditModalOpen();
                                                            }}
                                                        />
                                                        <Menu>
                                                            <MenuButton as={IconButton} icon={<MoreVertical size={14} />} variant="ghost" size="sm" />
                                                            <MenuList bg="gray.800" borderColor="gray.700">
                                                                {coupon.isActive && (
                                                                    <MenuItem
                                                                        bg="gray.800"
                                                                        _hover={{ bg: 'gray.700' }}
                                                                        color="orange.400"
                                                                        onClick={() => deactivateCouponMutation.mutate(coupon.id)}
                                                                        isDisabled={deactivateCouponMutation.isPending}
                                                                    >
                                                                        Deactivate Coupon
                                                                    </MenuItem>
                                                                )}
                                                                {!coupon.isActive && (
                                                                    <MenuItem
                                                                        bg="gray.800"
                                                                        _hover={{ bg: 'gray.700' }}
                                                                        color="gray.500"
                                                                        isDisabled
                                                                    >
                                                                        Activate (Not available)
                                                                    </MenuItem>
                                                                )}
                                                                <MenuItem
                                                                    bg="gray.800"
                                                                    _hover={{ bg: 'gray.700' }}
                                                                    color="red.400"
                                                                    icon={<Trash2 size={14} />}
                                                                    onClick={() => deleteCouponMutation.mutate(coupon.id)}
                                                                    isDisabled={deleteCouponMutation.isPending}
                                                                >
                                                                    Delete
                                                                </MenuItem>
                                                            </MenuList>
                                                        </Menu>
                                                    </HStack>
                                                </Flex>
                                            ))}
                                        </VStack>
                                    )}
                                </TabPanel>
                            ))}
                        </TabPanels>
                    </Tabs>
                </CardBody>
            </Card>

            <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6} mb={6}>
                {/* Fee Structure */}
                <Card bg="gray.900" borderColor="gray.800">
                    <CardHeader>
                        <Flex justify="space-between" align="center">
                            <Heading size="sm">Fee Structure</Heading>
                            <IconButton aria-label="Edit" icon={<Edit size={14} />} variant="ghost" size="sm" />
                        </Flex>
                    </CardHeader>
                    <CardBody pt={0}>
                        <SimpleGrid columns={2} spacing={4}>
                            <Box>
                                <Text fontSize="xs" color="brand.accent.500" mb={1}>Service Fee (%)</Text>
                                <Input size="sm" type="number" defaultValue={0} />
                            </Box>
                            <Box>
                                <Text fontSize="xs" color="brand.accent.500" mb={1}>Delivery fee per mile (₦)</Text>
                                <Input size="sm" type="number" defaultValue={0} />
                            </Box>
                            <Box>
                                <Text fontSize="xs" color="brand.accent.500" mb={1}>Restaurant Packaging Fee (₦)</Text>
                                <Input size="sm" type="number" defaultValue={0} />
                            </Box>
                            <Box>
                                <Text fontSize="xs" color="brand.accent.500" mb={1}>Groceries Packaging Fee (₦)</Text>
                                <Input size="sm" type="number" defaultValue={0} />
                            </Box>
                            <Box>
                                <Text fontSize="xs" color="brand.accent.500" mb={1}>Pharma Packaging Fee (₦)</Text>
                                <Input size="sm" type="number" defaultValue={0} />
                            </Box>
                            <Box>
                                <Text fontSize="xs" color="brand.accent.500" mb={1}>Health Commission (%)</Text>
                                <Input size="sm" type="number" defaultValue={0} />
                            </Box>
                        </SimpleGrid>
                    </CardBody>
                </Card>

                {/* System Status */}
                <Card bg="gray.900" borderColor="gray.800">
                    <CardHeader>
                        <Heading size="sm">System Status</Heading>
                    </CardHeader>
                    <CardBody pt={0}>
                        <VStack spacing={3} align="stretch">
                            {systemServices.map((service, idx) => (
                                <Flex key={idx} justify="space-between" align="center">
                                    <HStack spacing={3}>
                                        <Box
                                            w={2}
                                            h={2}
                                            borderRadius="full"
                                            bg={service.status === 'Operational' ? 'green.500' : service.status === 'Degraded' ? 'orange.500' : 'red.500'}
                                        />
                                        <Icon as={service.icon} color="brand.accent.500" boxSize={4} />
                                        <Text fontSize="sm">{service.name}</Text>
                                    </HStack>
                                    <Text
                                        fontSize="sm"
                                        color={service.status === 'Operational' ? 'green.400' : service.status === 'Degraded' ? 'orange.400' : 'red.400'}
                                    >
                                        {service.status}
                                    </Text>
                                </Flex>
                            ))}
                        </VStack>
                        <Divider my={4} borderColor="gray.700" />
                        <Flex justify="space-between" align="center">
                            <Text fontSize="sm" color="gray.500" textDecoration="underline">Last System Check</Text>
                            <Text fontSize="sm" color="brand.accent.500">2 minutes ago</Text>
                        </Flex>
                    </CardBody>
                </Card>
            </SimpleGrid>

            {/* Free Delivery Mode */}
            <Card bg="green.600" borderColor="green.500" mb={6}>
                <CardBody>
                    <Flex justify="space-between" align="start" mb={4}>
                        <Box>
                            <Heading size="sm" color="white">Free Delivery Mode</Heading>
                            <Text fontSize="sm" color="green.100">Enable site-wide free delivery for all orders</Text>
                        </Box>
                        <Switch
                            isChecked={freeDeliveryEnabled}
                            onChange={handleFreeDeliveryToggle}
                            colorScheme="whiteAlpha"
                            size="lg"
                            isDisabled={toggleFreeDeliveryMutation.isPending}
                        />
                    </Flex>

                    <Flex gap={2} mb={4} flexWrap="wrap">
                        <Button
                            leftIcon={<ShoppingBag size={16} />}
                            bg={selectedCategories.includes('all') ? 'green.700' : 'green.500'}
                            color="white"
                            size="sm"
                            onClick={() => toggleCategory('all')}
                            _hover={{ bg: 'green.700' }}
                        >
                            All Orders
                        </Button>
                        <Button
                            leftIcon={<Utensils size={16} />}
                            bg={selectedCategories.includes('restaurants') ? 'green.700' : 'green.500'}
                            color="white"
                            size="sm"
                            onClick={() => toggleCategory('restaurants')}
                            _hover={{ bg: 'green.700' }}
                        >
                            Restaurants
                        </Button>
                        <Button
                            leftIcon={<ShoppingCart size={16} />}
                            bg={selectedCategories.includes('groceries') ? 'green.700' : 'green.500'}
                            color="white"
                            size="sm"
                            onClick={() => toggleCategory('groceries')}
                            _hover={{ bg: 'green.700' }}
                        >
                            Groceries
                        </Button>
                    </Flex>

                    <Flex justify="space-between" align="center">
                        <Text fontSize="sm" color="green.100">Impact Estimate:</Text>
                        <Text fontWeight="bold" color="white">+45% Order Volume</Text>
                    </Flex>
                </CardBody>
            </Card>

            {/* Security Section */}
            <Card bg="gray.900" borderColor="gray.800" mb={6}>
                <CardHeader>
                    <HStack spacing={3}>
                        <Box p={2} borderRadius="lg" bg="purple.500" opacity={0.8}>
                            <Icon as={KeyRound} color="white" boxSize={5} />
                        </Box>
                        <Box>
                            <Heading size="sm">Security</Heading>
                            <Text fontSize="sm" color="gray.500">Manage your account security settings</Text>
                        </Box>
                    </HStack>
                </CardHeader>
                <CardBody pt={0}>
                    <Box>
                        <Text fontWeight="500" color="gray.200" mb={4}>Change Password</Text>
                        <VStack spacing={4} align="stretch" maxW="400px">
                            <FormControl>
                                <FormLabel fontSize="sm" color="gray.400">Current Password</FormLabel>
                                <InputGroup>
                                    <Input
                                        type={showCurrentPassword ? 'text' : 'password'}
                                        placeholder="Enter current password"
                                        value={currentPassword}
                                        onChange={(e) => setCurrentPassword(e.target.value)}
                                        bg="gray.800"
                                        borderColor="gray.700"
                                    />
                                    <InputRightElement>
                                        <IconButton
                                            aria-label={showCurrentPassword ? 'Hide' : 'Show'}
                                            icon={showCurrentPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                        />
                                    </InputRightElement>
                                </InputGroup>
                            </FormControl>

                            <FormControl>
                                <FormLabel fontSize="sm" color="gray.400">New Password</FormLabel>
                                <InputGroup>
                                    <Input
                                        type={showNewPassword ? 'text' : 'password'}
                                        placeholder="Enter new password (min 6 characters)"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        bg="gray.800"
                                        borderColor="gray.700"
                                    />
                                    <InputRightElement>
                                        <IconButton
                                            aria-label={showNewPassword ? 'Hide' : 'Show'}
                                            icon={showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => setShowNewPassword(!showNewPassword)}
                                        />
                                    </InputRightElement>
                                </InputGroup>
                            </FormControl>

                            <FormControl>
                                <FormLabel fontSize="sm" color="gray.400">Confirm New Password</FormLabel>
                                <Input
                                    type="password"
                                    placeholder="Confirm new password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    bg="gray.800"
                                    borderColor="gray.700"
                                />
                            </FormControl>

                            <Button
                                colorScheme="purple"
                                size="sm"
                                leftIcon={<Lock size={14} />}
                                onClick={handleChangePassword}
                                isLoading={isChangingPassword}
                                loadingText="Changing..."
                                alignSelf="flex-start"
                            >
                                Change Password
                            </Button>
                        </VStack>
                    </Box>
                </CardBody>
            </Card>

            {/* Footer */}
            <Flex justify="space-between" align={{ base: 'start', md: 'center' }} flexDir={{ base: 'column', md: 'row' }} gap={3}>
                <Text fontSize={{ base: 'xs', md: 'sm' }} color="gray.500">
                    Last updated: {new Date().toLocaleString()} • Status: <Text as="span" color={freeDeliveryEnabled ? 'green.400' : 'gray.400'}>{freeDeliveryEnabled ? 'Enabled' : 'Disabled'}</Text>
                </Text>
                <Button colorScheme="purple" size="sm" onClick={handleSaveChanges} isLoading={isSaving} w={{ base: '100%', md: 'auto' }}>
                    Save Changes
                </Button>
            </Flex>

            {/* Create Coupon Modal */}
            <Modal isOpen={isCouponModalOpen} onClose={onCouponModalClose} size="lg">
                <ModalOverlay />
                <ModalContent bg="gray.900" borderColor="gray.800">
                    <ModalHeader>Create New Coupon</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <VStack spacing={4} align="stretch">
                            <FormControl isRequired>
                                <FormLabel fontSize="sm">Code</FormLabel>
                                <Input
                                    placeholder="e.g. SAVE50"
                                    value={newCoupon.code}
                                    onChange={(e) => setNewCoupon({ ...newCoupon, code: e.target.value.toUpperCase() })}
                                />
                            </FormControl>

                            <FormControl isRequired>
                                <FormLabel fontSize="sm">Type</FormLabel>
                                <Select
                                    value={newCoupon.type}
                                    onChange={(e) => setNewCoupon({ ...newCoupon, type: e.target.value as CouponType })}
                                >
                                    <option value="PERCENT">PERCENT</option>
                                    <option value="FIXED">FIXED</option>
                                </Select>
                            </FormControl>

                            <FormControl isRequired>
                                <FormLabel fontSize="sm">Value</FormLabel>
                                <Input
                                    type="number"
                                    placeholder={newCoupon.type === 'PERCENT' ? 'e.g. 10 for 10%' : 'e.g. 500 for ₦500'}
                                    value={newCoupon.value || ''}
                                    onChange={(e) => setNewCoupon({ ...newCoupon, value: Number(e.target.value) })}
                                />
                            </FormControl>

                            <FormControl>
                                <FormLabel fontSize="sm">Applies To</FormLabel>
                                <Select
                                    value={appliesToType}
                                    onChange={(e) => setAppliesToType(e.target.value as 'SITE' | 'MERCHANT')}
                                >
                                    <option value="SITE">Site-Wide (All Merchants)</option>
                                    <option value="MERCHANT">Specific Merchant</option>
                                </Select>
                            </FormControl>

                            {appliesToType === 'MERCHANT' && (
                                <FormControl isRequired>
                                    <FormLabel fontSize="sm">Select Merchant</FormLabel>
                                    <Select
                                        placeholder="-- Select Merchant --"
                                        value={selectedMerchantId}
                                        onChange={(e) => setSelectedMerchantId(e.target.value)}
                                    >
                                        {stores.length === 0 && (
                                            <option disabled>Loading merchants...</option>
                                        )}
                                        {stores.map((store: any) => (
                                            <option key={store.id} value={store.id}>
                                                {store.name || 'Unnamed Store'}
                                            </option>
                                        ))}
                                    </Select>
                                </FormControl>
                            )}

                            <FormControl>
                                <FormLabel fontSize="sm">Start Date</FormLabel>
                                <Input
                                    type="date"
                                    value={newCoupon.startDate}
                                    onChange={(e) => setNewCoupon({ ...newCoupon, startDate: e.target.value })}
                                />
                            </FormControl>

                            <FormControl>
                                <FormLabel fontSize="sm">End Date</FormLabel>
                                <Input
                                    type="date"
                                    value={newCoupon.endDate}
                                    onChange={(e) => setNewCoupon({ ...newCoupon, endDate: e.target.value })}
                                />
                            </FormControl>

                            <FormControl>
                                <FormLabel fontSize="sm">Usage Limit</FormLabel>
                                <Input
                                    type="number"
                                    placeholder="Leave empty for unlimited"
                                    value={newCoupon.usageLimit || ''}
                                    onChange={(e) => setNewCoupon({ ...newCoupon, usageLimit: e.target.value ? Number(e.target.value) : undefined })}
                                />
                            </FormControl>
                        </VStack>
                    </ModalBody>
                    <ModalFooter>
                        <Button variant="ghost" mr={3} onClick={onCouponModalClose}>
                            Cancel
                        </Button>
                        <Button
                            colorScheme="purple"
                            onClick={handleCreateCoupon}
                            isLoading={createCouponMutation.isPending}
                        >
                            Create
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>

            {/* Edit Coupon Modal (Read-only view since backend has no update endpoint) */}
            <Modal isOpen={isEditModalOpen} onClose={onEditModalClose} size="md">
                <ModalOverlay />
                <ModalContent bg="gray.900">
                    <ModalHeader>Coupon Details</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        {editingCoupon && (
                            <VStack spacing={4} align="stretch">
                                <Box>
                                    <Text fontSize="xs" color="gray.500" mb={1}>Coupon Code</Text>
                                    <Text fontSize="lg" fontWeight="bold" color="purple.400">{editingCoupon.code}</Text>
                                </Box>

                                <SimpleGrid columns={2} spacing={4}>
                                    <Box>
                                        <Text fontSize="xs" color="gray.500" mb={1}>Type</Text>
                                        <Badge colorScheme={editingCoupon.type === 'PERCENT' ? 'blue' : 'green'}>
                                            {editingCoupon.type === 'PERCENT' ? 'Percentage' : 'Fixed Amount'}
                                        </Badge>
                                    </Box>
                                    <Box>
                                        <Text fontSize="xs" color="gray.500" mb={1}>Value</Text>
                                        <Text fontWeight="500">
                                            {editingCoupon.type === 'PERCENT' ? `${editingCoupon.value}%` : `₦${editingCoupon.value.toLocaleString()}`}
                                        </Text>
                                    </Box>
                                </SimpleGrid>

                                <SimpleGrid columns={2} spacing={4}>
                                    <Box>
                                        <Text fontSize="xs" color="gray.500" mb={1}>Status</Text>
                                        <Badge colorScheme={editingCoupon.isActive ? 'green' : 'red'}>
                                            {editingCoupon.isActive ? 'Active' : 'Inactive'}
                                        </Badge>
                                    </Box>
                                    <Box>
                                        <Text fontSize="xs" color="gray.500" mb={1}>Applies To</Text>
                                        <Text>{editingCoupon.appliesTo === 'SITE' ? 'Site-Wide' : 'Merchant Specific'}</Text>
                                    </Box>
                                </SimpleGrid>

                                <SimpleGrid columns={2} spacing={4}>
                                    <Box>
                                        <Text fontSize="xs" color="gray.500" mb={1}>Start Date</Text>
                                        <Text>{editingCoupon.startDate ? new Date(editingCoupon.startDate).toLocaleDateString() : 'No start date'}</Text>
                                    </Box>
                                    <Box>
                                        <Text fontSize="xs" color="gray.500" mb={1}>End Date</Text>
                                        <Text>{editingCoupon.endDate ? new Date(editingCoupon.endDate).toLocaleDateString() : 'No end date'}</Text>
                                    </Box>
                                </SimpleGrid>

                                <SimpleGrid columns={2} spacing={4}>
                                    <Box>
                                        <Text fontSize="xs" color="gray.500" mb={1}>Usage Limit</Text>
                                        <Text>{editingCoupon.usageLimit || 'Unlimited'}</Text>
                                    </Box>
                                    <Box>
                                        <Text fontSize="xs" color="gray.500" mb={1}>Times Used</Text>
                                        <Text fontWeight="500">{editingCoupon.usedCount || 0}</Text>
                                    </Box>
                                </SimpleGrid>

                                <Box>
                                    <Text fontSize="xs" color="gray.500" mb={1}>Created At</Text>
                                    <Text>{new Date(editingCoupon.createdAt).toLocaleString()}</Text>
                                </Box>

                                <Box bg="gray.800" p={3} borderRadius="md" mt={2}>
                                    <Text fontSize="xs" color="orange.400">
                                        ⚠️ Editing coupons is not currently supported by the backend API.
                                        To make changes, please deactivate this coupon and create a new one.
                                    </Text>
                                </Box>
                            </VStack>
                        )}
                    </ModalBody>
                    <ModalFooter>
                        {editingCoupon?.isActive && (
                            <Button
                                colorScheme="orange"
                                variant="outline"
                                mr={3}
                                onClick={() => {
                                    deactivateCouponMutation.mutate(editingCoupon.id);
                                    onEditModalClose();
                                }}
                                isLoading={deactivateCouponMutation.isPending}
                            >
                                Deactivate
                            </Button>
                        )}
                        <Button variant="ghost" onClick={onEditModalClose}>
                            Close
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </Box>
    );

    return (
        <Box>
            {/* Header */}
            <Heading size="lg" color="gray.100" mb={6}>
                Settings
            </Heading>

            {/* Settings Content (no tabs) */}
            {renderGeneralTab()}
        </Box>
    );
};

export default SettingsPage;
