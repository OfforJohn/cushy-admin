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
    Image,
    SimpleGrid,
    Card,
    CardBody,
    Table,
    Thead,
    Tbody,
    Tr,
    Th,
    Td,
    Tabs,
    TabList,
    Tab,
    useDisclosure,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    ModalCloseButton,
    FormControl,
    FormLabel,
    Textarea,
    Checkbox,
    CheckboxGroup,
    useToast,
    Spinner,
    Divider,
    Progress,
    Tooltip,
} from '@chakra-ui/react';
import {
    Plus,
    Search,
    Eye,
    Edit,
    Trash2,
    MoreVertical,
    TrendingUp,
    MousePointerClick,
    BarChart3,
    Percent,
    Upload,
    Image as ImageIcon,
    Calendar,
    MapPin,
    Users,
    RefreshCw,
} from 'lucide-react';
import { useLocationFilter } from '../../context/LocationContext';

// Types
interface BannerAd {
    id: string;
    title: string;
    description: string;
    imageUrl: string;
    buttonText?: string;
    buttonLink?: string;
    status: 'active' | 'scheduled' | 'expired' | 'draft';
    locations: string[];
    tags: string[];
    startDate: string;
    endDate: string;
    impressions: number;
    clicks: number;
    ctr: number;
    createdAt: string;
    createdBy: string;
}

// Mock data
const mockBanners: BannerAd[] = [
    {
        id: '1',
        title: 'Weekend Special - 30% Off',
        description: 'Get 30% off on all restaurant orders this weekend!',
        imageUrl: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=200&h=120&fit=crop',
        buttonText: 'Order Now',
        buttonLink: 'app://restaurants',
        status: 'active',
        locations: ['Homepage', 'Restaurant'],
        tags: ['Homepage', 'Restaurant'],
        startDate: 'Dec 15, 2024',
        endDate: 'Dec 17, 2024',
        impressions: 45234,
        clicks: 3421,
        ctr: 7.6,
        createdAt: '2024-12-10',
        createdBy: 'Admin User',
    },
    {
        id: '2',
        title: 'Free Delivery on Medicines',
        description: 'Order your prescriptions with zero delivery charges',
        imageUrl: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=200&h=120&fit=crop',
        buttonText: 'Shop Now',
        buttonLink: 'app://pharmacy',
        status: 'active',
        locations: ['Pharmacy'],
        tags: ['Pharmacy'],
        startDate: 'Dec 10, 2024',
        endDate: 'Dec 31, 2024',
        impressions: 28901,
        clicks: 2145,
        ctr: 7.4,
        createdAt: '2024-12-08',
        createdBy: 'Admin User',
    },
    {
        id: '3',
        title: 'Earn 5% Cashback on CushCoin',
        description: 'Top up your wallet and get instant cashback rewards',
        imageUrl: 'https://images.unsplash.com/photo-1621761191319-c6fb62004040?w=200&h=120&fit=crop',
        buttonText: 'Top Up Now',
        buttonLink: 'app://wallet',
        status: 'active',
        locations: ['CushCoin Wallet'],
        tags: ['CushCoin Wallet'],
        startDate: 'Dec 1, 2024',
        endDate: 'Dec 31, 2024',
        impressions: 32567,
        clicks: 1890,
        ctr: 5.8,
        createdAt: '2024-11-28',
        createdBy: 'Admin User',
    },
    {
        id: '4',
        title: 'Fresh Groceries, Same Day Delivery',
        description: 'Shop fresh produce delivered to your doorstep today',
        imageUrl: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=200&h=120&fit=crop',
        buttonText: 'Shop Groceries',
        buttonLink: 'app://groceries',
        status: 'scheduled',
        locations: ['Groceries'],
        tags: ['Groceries'],
        startDate: 'Dec 20, 2024',
        endDate: 'Jan 5, 2025',
        impressions: 0,
        clicks: 0,
        ctr: 0,
        createdAt: '2024-12-15',
        createdBy: 'Admin User',
    },
    {
        id: '5',
        title: 'Holiday Season Sale',
        description: 'Up to 50% off on selected items',
        imageUrl: 'https://images.unsplash.com/photo-1607083206968-13611e3d76db?w=200&h=120&fit=crop',
        buttonText: 'Shop Now',
        buttonLink: 'app://deals',
        status: 'expired',
        locations: ['Homepage'],
        tags: ['Homepage'],
        startDate: 'Dec 1, 2024',
        endDate: 'Dec 10, 2024',
        impressions: 89456,
        clicks: 5234,
        ctr: 5.9,
        createdAt: '2024-11-25',
        createdBy: 'Admin User',
    },
    {
        id: '6',
        title: 'New Year Promo',
        description: 'Celebrate with exclusive deals',
        imageUrl: 'https://images.unsplash.com/photo-1546074177-ffdda98d214f?w=200&h=120&fit=crop',
        buttonText: 'Learn More',
        buttonLink: 'app://promo',
        status: 'draft',
        locations: ['Homepage', 'Restaurant', 'Groceries'],
        tags: ['Homepage', 'Restaurant', 'Groceries'],
        startDate: 'Jan 1, 2025',
        endDate: 'Jan 15, 2025',
        impressions: 0,
        clicks: 0,
        ctr: 0,
        createdAt: '2024-12-18',
        createdBy: 'Admin User',
    },
];

const displayLocations = [
    { id: 'homepage', label: 'Homepage', description: 'Main app landing page banner' },
    { id: 'cushcoin', label: 'CushCoin Wallet', description: 'Wallet & transactions section' },
    { id: 'restaurant', label: 'Restaurant Page', description: 'Food ordering & restaurant listings' },
    { id: 'pharmacy', label: 'Pharmaceutical Page', description: 'Pharmacy & medicine section' },
    { id: 'groceries', label: 'Groceries Page', description: 'Grocery shopping & supermarkets' },
];

const targetCities = ['All Cities', 'Lagos', 'Abuja', 'Minna'];
const userSegments = ['All Users', 'New Users', 'Returning Users', 'Premium Users'];

export const AdListingPage: React.FC = () => {
    const [activeTab, setActiveTab] = useState(0);
    const [searchQuery, setSearchQuery] = useState('');
    const { selectedLocation } = useLocationFilter();
    const toast = useToast();

    // Create Banner Modal state
    const { isOpen: isCreateOpen, onOpen: onCreateOpen, onClose: onCreateClose } = useDisclosure();
    const [newBanner, setNewBanner] = useState({
        title: '',
        buttonText: '',
        priorityLevel: 'medium',
        buttonLink: '',
        linkType: 'external',
        imageUrl: '',
        locations: [] as string[],
        startDate: '',
        endDate: '',
        targetCities: ['All Cities'],
        userSegments: ['All Users'],
    });

    // Filter banners based on tab and search
    const getFilteredBanners = () => {
        let filtered = mockBanners;

        // Filter by tab
        if (activeTab === 1) filtered = filtered.filter(b => b.status === 'active');
        else if (activeTab === 2) filtered = filtered.filter(b => b.status === 'scheduled');
        else if (activeTab === 3) filtered = filtered.filter(b => b.status === 'expired');
        else if (activeTab === 4) filtered = filtered.filter(b => b.status === 'draft');

        // Filter by search
        if (searchQuery) {
            filtered = filtered.filter(b =>
                b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                b.description.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        return filtered;
    };

    const filteredBanners = getFilteredBanners();

    // Stats
    const stats = {
        activeBanners: mockBanners.filter(b => b.status === 'active').length,
        totalClicks: mockBanners.reduce((sum, b) => sum + b.clicks, 0),
        totalImpressions: mockBanners.reduce((sum, b) => sum + b.impressions, 0),
        avgCtr: mockBanners.filter(b => b.ctr > 0).length > 0
            ? (mockBanners.reduce((sum, b) => sum + b.ctr, 0) / mockBanners.filter(b => b.ctr > 0).length).toFixed(1)
            : '0',
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active': return 'green';
            case 'scheduled': return 'blue';
            case 'expired': return 'gray';
            case 'draft': return 'yellow';
            default: return 'gray';
        }
    };

    const formatNumber = (num: number) => {
        if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
        if (num >= 1000) return (num / 1000).toFixed(0) + 'K';
        return num.toString();
    };

    const handleCreateBanner = () => {
        toast({
            title: 'Banner Created',
            description: 'Your banner ad has been created successfully.',
            status: 'success',
            duration: 3000,
        });
        onCreateClose();
        // Reset form
        setNewBanner({
            title: '',
            buttonText: '',
            priorityLevel: 'medium',
            buttonLink: '',
            linkType: 'external',
            imageUrl: '',
            locations: [],
            startDate: '',
            endDate: '',
            targetCities: ['All Cities'],
            userSegments: ['All Users'],
        });
    };

    return (
        <Box p={6}>
            {/* Header */}
            <Flex justify="space-between" align="flex-start" mb={6}>
                <Box>
                    <Heading size="lg" color="gray.100" mb={1}>In-App Banner Ads</Heading>
                    <Text color="gray.500">Create and manage promotional banners across different app sections</Text>
                </Box>
                <Button
                    leftIcon={<Plus size={16} />}
                    colorScheme="purple"
                    onClick={onCreateOpen}
                >
                    Create Banner
                </Button>
            </Flex>

            {/* Tabs and Stats */}
            <Box mb={6}>
                <Flex justify="space-between" align="center" mb={4} flexWrap="wrap" gap={4}>
                    <Tabs
                        variant="soft-rounded"
                        colorScheme="purple"
                        index={activeTab}
                        onChange={setActiveTab}
                    >
                        <TabList bg="gray.800" p={1} borderRadius="lg">
                            <Tab _selected={{ bg: 'purple.500', color: 'white' }} color="gray.400" fontSize="sm">All Banners</Tab>
                            <Tab _selected={{ bg: 'purple.500', color: 'white' }} color="gray.400" fontSize="sm">Active</Tab>
                            <Tab _selected={{ bg: 'purple.500', color: 'white' }} color="gray.400" fontSize="sm">Scheduled</Tab>
                            <Tab _selected={{ bg: 'purple.500', color: 'white' }} color="gray.400" fontSize="sm">Expired</Tab>
                            <Tab _selected={{ bg: 'purple.500', color: 'white' }} color="gray.400" fontSize="sm">Draft</Tab>
                        </TabList>
                    </Tabs>

                    <InputGroup maxW="250px">
                        <InputLeftElement>
                            <Icon as={Search} color="gray.500" boxSize={4} />
                        </InputLeftElement>
                        <Input
                            placeholder="Search banners..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            bg="gray.800"
                            borderColor="gray.700"
                            fontSize="sm"
                        />
                    </InputGroup>
                </Flex>

                {/* Stats Cards */}
                <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4}>
                    <Card bg="gray.800" borderColor="gray.700" borderWidth="1px">
                        <CardBody py={4}>
                            <Flex align="center" gap={3}>
                                <Box p={2} borderRadius="lg" bg="green.500/20">
                                    <Icon as={BarChart3} color="green.400" boxSize={5} />
                                </Box>
                                <Box>
                                    <Text color="gray.500" fontSize="xs" textTransform="uppercase">Active Banners</Text>
                                    <Text color="gray.100" fontSize="2xl" fontWeight="bold">{stats.activeBanners}</Text>
                                </Box>
                            </Flex>
                        </CardBody>
                    </Card>

                    <Card bg="gray.800" borderColor="gray.700" borderWidth="1px">
                        <CardBody py={4}>
                            <Flex align="center" gap={3}>
                                <Box p={2} borderRadius="lg" bg="blue.500/20">
                                    <Icon as={MousePointerClick} color="blue.400" boxSize={5} />
                                </Box>
                                <Box>
                                    <Text color="gray.500" fontSize="xs" textTransform="uppercase">Total Clicks</Text>
                                    <Text color="gray.100" fontSize="2xl" fontWeight="bold">{formatNumber(stats.totalClicks)}</Text>
                                </Box>
                            </Flex>
                        </CardBody>
                    </Card>

                    <Card bg="gray.800" borderColor="gray.700" borderWidth="1px">
                        <CardBody py={4}>
                            <Flex align="center" gap={3}>
                                <Box p={2} borderRadius="lg" bg="purple.500/20">
                                    <Icon as={Eye} color="purple.400" boxSize={5} />
                                </Box>
                                <Box>
                                    <Text color="gray.500" fontSize="xs" textTransform="uppercase">Impressions</Text>
                                    <Text color="gray.100" fontSize="2xl" fontWeight="bold">{formatNumber(stats.totalImpressions)}</Text>
                                </Box>
                            </Flex>
                        </CardBody>
                    </Card>

                    <Card bg="gray.800" borderColor="gray.700" borderWidth="1px">
                        <CardBody py={4}>
                            <Flex align="center" gap={3}>
                                <Box p={2} borderRadius="lg" bg="orange.500/20">
                                    <Icon as={Percent} color="orange.400" boxSize={5} />
                                </Box>
                                <Box>
                                    <Text color="gray.500" fontSize="xs" textTransform="uppercase">CTR</Text>
                                    <Text color="gray.100" fontSize="2xl" fontWeight="bold">{stats.avgCtr}%</Text>
                                </Box>
                            </Flex>
                        </CardBody>
                    </Card>
                </SimpleGrid>
            </Box>

            {/* Active Banners List */}
            <Box>
                <Heading size="md" color="gray.100" mb={4}>Active Banners</Heading>

                <VStack spacing={4} align="stretch">
                    {filteredBanners.length === 0 ? (
                        <Card bg="gray.800" borderColor="gray.700" borderWidth="1px">
                            <CardBody py={8} textAlign="center">
                                <Text color="gray.500">No banners found</Text>
                            </CardBody>
                        </Card>
                    ) : (
                        filteredBanners.map((banner) => (
                            <Card key={banner.id} bg="gray.800" borderColor="gray.700" borderWidth="1px">
                                <CardBody>
                                    <Flex gap={4} align="flex-start">
                                        {/* Banner Image */}
                                        <Image
                                            src={banner.imageUrl}
                                            alt={banner.title}
                                            w="160px"
                                            h="100px"
                                            objectFit="cover"
                                            borderRadius="lg"
                                            fallback={
                                                <Flex
                                                    w="160px"
                                                    h="100px"
                                                    bg="gray.700"
                                                    borderRadius="lg"
                                                    align="center"
                                                    justify="center"
                                                >
                                                    <Icon as={ImageIcon} color="gray.500" boxSize={8} />
                                                </Flex>
                                            }
                                        />

                                        {/* Banner Info */}
                                        <Box flex={1}>
                                            <Flex justify="space-between" align="flex-start" mb={2}>
                                                <Box>
                                                    <Text color="gray.100" fontWeight="600" fontSize="lg">{banner.title}</Text>
                                                    <Text color="gray.500" fontSize="sm">{banner.description}</Text>
                                                </Box>
                                                <Badge colorScheme={getStatusColor(banner.status)} textTransform="capitalize">
                                                    {banner.status}
                                                </Badge>
                                            </Flex>

                                            {/* Tags */}
                                            <HStack spacing={2} mb={3}>
                                                {banner.tags.map((tag, idx) => (
                                                    <Badge key={idx} colorScheme="purple" variant="subtle" fontSize="xs">
                                                        {tag}
                                                    </Badge>
                                                ))}
                                                <Text color="gray.500" fontSize="xs">
                                                    📅 {banner.startDate} - {banner.endDate}
                                                </Text>
                                            </HStack>

                                            {/* Stats */}
                                            <Flex justify="space-between" align="center">
                                                <HStack spacing={6}>
                                                    <Text color="gray.400" fontSize="sm">
                                                        Impressions: <Text as="span" color="gray.100" fontWeight="500">{formatNumber(banner.impressions)}</Text>
                                                    </Text>
                                                    <Text color="gray.400" fontSize="sm">
                                                        Clicks: <Text as="span" color="gray.100" fontWeight="500">{formatNumber(banner.clicks)}</Text>
                                                    </Text>
                                                    <Text color="gray.400" fontSize="sm">
                                                        CTR: <Text as="span" color="green.400" fontWeight="500">{banner.ctr}%</Text>
                                                    </Text>
                                                </HStack>

                                                {/* Actions */}
                                                <HStack spacing={1}>
                                                    <Tooltip label="View">
                                                        <IconButton
                                                            aria-label="View"
                                                            icon={<Eye size={16} />}
                                                            size="sm"
                                                            variant="ghost"
                                                            color="gray.400"
                                                        />
                                                    </Tooltip>
                                                    <Tooltip label="Edit">
                                                        <IconButton
                                                            aria-label="Edit"
                                                            icon={<Edit size={16} />}
                                                            size="sm"
                                                            variant="ghost"
                                                            color="gray.400"
                                                        />
                                                    </Tooltip>
                                                    <Tooltip label="Delete">
                                                        <IconButton
                                                            aria-label="Delete"
                                                            icon={<Trash2 size={16} />}
                                                            size="sm"
                                                            variant="ghost"
                                                            color="red.400"
                                                        />
                                                    </Tooltip>
                                                    <IconButton
                                                        aria-label="More"
                                                        icon={<MoreVertical size={16} />}
                                                        size="sm"
                                                        variant="ghost"
                                                        color="gray.400"
                                                    />
                                                </HStack>
                                            </Flex>

                                            {/* Scheduled notice */}
                                            {banner.status === 'scheduled' && (
                                                <Text color="blue.400" fontSize="xs" mt={2}>
                                                    Starts in: 5 days
                                                </Text>
                                            )}
                                        </Box>
                                    </Flex>
                                </CardBody>
                            </Card>
                        ))
                    )}
                </VStack>
            </Box>

            {/* Create Banner Modal */}
            <Modal isOpen={isCreateOpen} onClose={onCreateClose} size="6xl" scrollBehavior="inside">
                <ModalOverlay />
                <ModalContent bg="gray.900" borderColor="gray.800">
                    <ModalHeader borderBottomWidth="1px" borderColor="gray.800">
                        <Text color="gray.100">Create Banner Ad</Text>
                        <Text color="gray.500" fontSize="sm" fontWeight="normal">
                            Design and configure a new promotional banner for app sections
                        </Text>
                    </ModalHeader>
                    <ModalCloseButton />
                    <ModalBody py={6}>
                        <Flex gap={8}>
                            {/* Left Column - Form */}
                            <Box flex={2}>
                                {/* Basic Information */}
                                <Box mb={6}>
                                    <Text color="purple.400" fontWeight="600" mb={4}>Basic Information</Text>
                                    <VStack spacing={4} align="stretch">
                                        <FormControl>
                                            <FormLabel color="gray.400" fontSize="sm">Banner Title *</FormLabel>
                                            <Input
                                                placeholder="e.g., Weekend Special - 30% Off All Orders"
                                                value={newBanner.title}
                                                onChange={(e) => setNewBanner({ ...newBanner, title: e.target.value })}
                                                bg="gray.800"
                                                borderColor="gray.700"
                                            />
                                        </FormControl>

                                        <HStack spacing={4}>
                                            <FormControl flex={1}>
                                                <FormLabel color="gray.400" fontSize="sm">Button Text *</FormLabel>
                                                <Input
                                                    placeholder="e.g., Shop Now, Learn More, Get Started"
                                                    value={newBanner.buttonText}
                                                    onChange={(e) => setNewBanner({ ...newBanner, buttonText: e.target.value })}
                                                    bg="gray.800"
                                                    borderColor="gray.700"
                                                />
                                            </FormControl>
                                            <FormControl w="200px">
                                                <FormLabel color="gray.400" fontSize="sm">Priority Level</FormLabel>
                                                <Select
                                                    value={newBanner.priorityLevel}
                                                    onChange={(e) => setNewBanner({ ...newBanner, priorityLevel: e.target.value })}
                                                    bg="gray.800"
                                                    borderColor="gray.700"
                                                >
                                                    <option value="high">High Priority</option>
                                                    <option value="medium">Medium Priority</option>
                                                    <option value="low">Low Priority</option>
                                                </Select>
                                            </FormControl>
                                        </HStack>

                                        <FormControl>
                                            <FormLabel color="gray.400" fontSize="sm">Button Action/Link *</FormLabel>
                                            <HStack>
                                                <Select
                                                    value={newBanner.linkType}
                                                    onChange={(e) => setNewBanner({ ...newBanner, linkType: e.target.value })}
                                                    bg="gray.800"
                                                    borderColor="gray.700"
                                                    w="150px"
                                                >
                                                    <option value="external">External URL</option>
                                                    <option value="internal">App Screen</option>
                                                </Select>
                                                <Input
                                                    placeholder="https://example.com or app://restaurants"
                                                    value={newBanner.buttonLink}
                                                    onChange={(e) => setNewBanner({ ...newBanner, buttonLink: e.target.value })}
                                                    bg="gray.800"
                                                    borderColor="gray.700"
                                                    flex={1}
                                                />
                                            </HStack>
                                        </FormControl>
                                    </VStack>
                                </Box>

                                {/* Banner Image */}
                                <Box mb={6}>
                                    <Text color="purple.400" fontWeight="600" mb={4}>Banner Image</Text>
                                    <Box
                                        border="2px dashed"
                                        borderColor="gray.700"
                                        borderRadius="lg"
                                        p={8}
                                        textAlign="center"
                                        bg="gray.800/50"
                                        cursor="pointer"
                                        _hover={{ borderColor: 'purple.500' }}
                                    >
                                        <Icon as={Upload} color="gray.500" boxSize={8} mb={2} />
                                        <Text color="gray.400" fontWeight="500">Upload Banner Image</Text>
                                        <Text color="gray.500" fontSize="sm">Click to browse or drag and drop your image here</Text>
                                        <Text color="gray.600" fontSize="xs" mt={2}>PNG, JPG up to 2MB • Recommended: 1920x480px (3:1 ratio)</Text>
                                        <Button size="sm" colorScheme="purple" variant="outline" mt={4}>
                                            Choose File
                                        </Button>
                                    </Box>

                                    <Box mt={4} p={4} bg="blue.900/30" borderRadius="md" borderLeftWidth="3px" borderColor="blue.400">
                                        <Text color="blue.300" fontWeight="500" fontSize="sm" mb={2}>📋 Image Guidelines:</Text>
                                        <VStack align="start" spacing={1}>
                                            <Text color="blue.200" fontSize="xs">• Use high-resolution images (minimum 1920x480px)</Text>
                                            <Text color="blue.200" fontSize="xs">• Ensure text is readable on mobile devices</Text>
                                            <Text color="blue.200" fontSize="xs">• Avoid placing crucial content near edges</Text>
                                            <Text color="blue.200" fontSize="xs">• Test contrast for accessibility</Text>
                                        </VStack>
                                    </Box>
                                </Box>

                                {/* Display Locations */}
                                <Box mb={6}>
                                    <Text color="purple.400" fontWeight="600" mb={4}>Display Locations</Text>
                                    <Text color="gray.500" fontSize="sm" mb={4}>Select where this banner should appear in the app</Text>
                                    <SimpleGrid columns={2} spacing={3}>
                                        {displayLocations.map((loc) => (
                                            <Checkbox
                                                key={loc.id}
                                                colorScheme="purple"
                                                isChecked={newBanner.locations.includes(loc.id)}
                                                onChange={(e) => {
                                                    if (e.target.checked) {
                                                        setNewBanner({ ...newBanner, locations: [...newBanner.locations, loc.id] });
                                                    } else {
                                                        setNewBanner({ ...newBanner, locations: newBanner.locations.filter(l => l !== loc.id) });
                                                    }
                                                }}
                                            >
                                                <Box>
                                                    <Text color="gray.100" fontSize="sm">{loc.label}</Text>
                                                    <Text color="gray.500" fontSize="xs">{loc.description}</Text>
                                                </Box>
                                            </Checkbox>
                                        ))}
                                    </SimpleGrid>
                                </Box>

                                {/* Schedule & Targeting */}
                                <Box>
                                    <Text color="purple.400" fontWeight="600" mb={4}>Schedule & Targeting</Text>
                                    <SimpleGrid columns={2} spacing={4}>
                                        <FormControl>
                                            <FormLabel color="gray.400" fontSize="sm">Start Date & Time</FormLabel>
                                            <Input
                                                type="datetime-local"
                                                value={newBanner.startDate}
                                                onChange={(e) => setNewBanner({ ...newBanner, startDate: e.target.value })}
                                                bg="gray.800"
                                                borderColor="gray.700"
                                            />
                                        </FormControl>
                                        <FormControl>
                                            <FormLabel color="gray.400" fontSize="sm">Target Cities</FormLabel>
                                            <Select
                                                bg="gray.800"
                                                borderColor="gray.700"
                                                value={newBanner.targetCities[0]}
                                                onChange={(e) => setNewBanner({ ...newBanner, targetCities: [e.target.value] })}
                                            >
                                                {targetCities.map(city => (
                                                    <option key={city} value={city}>{city}</option>
                                                ))}
                                            </Select>
                                        </FormControl>
                                        <FormControl>
                                            <FormLabel color="gray.400" fontSize="sm">End Date & Time</FormLabel>
                                            <Input
                                                type="datetime-local"
                                                value={newBanner.endDate}
                                                onChange={(e) => setNewBanner({ ...newBanner, endDate: e.target.value })}
                                                bg="gray.800"
                                                borderColor="gray.700"
                                            />
                                        </FormControl>
                                        <FormControl>
                                            <FormLabel color="gray.400" fontSize="sm">User Segments</FormLabel>
                                            <Select
                                                bg="gray.800"
                                                borderColor="gray.700"
                                                value={newBanner.userSegments[0]}
                                                onChange={(e) => setNewBanner({ ...newBanner, userSegments: [e.target.value] })}
                                            >
                                                {userSegments.map(seg => (
                                                    <option key={seg} value={seg}>{seg}</option>
                                                ))}
                                            </Select>
                                        </FormControl>
                                    </SimpleGrid>
                                </Box>
                            </Box>

                            {/* Right Column - Preview */}
                            <Box flex={1} position="sticky" top={0}>
                                <Text color="purple.400" fontWeight="600" mb={4}>Live Preview</Text>
                                <Box
                                    bg="purple.900"
                                    borderRadius="lg"
                                    p={4}
                                    minH="150px"
                                    display="flex"
                                    alignItems="center"
                                    justifyContent="center"
                                    mb={4}
                                >
                                    {newBanner.title ? (
                                        <VStack>
                                            <Text color="white" fontWeight="600">{newBanner.title}</Text>
                                            {newBanner.buttonText && (
                                                <Button size="sm" colorScheme="whiteAlpha">{newBanner.buttonText}</Button>
                                            )}
                                        </VStack>
                                    ) : (
                                        <Text color="purple.300" fontSize="sm">Banner preview will appear here</Text>
                                    )}
                                </Box>

                                <VStack align="stretch" spacing={2} fontSize="sm" color="gray.400">
                                    <Flex justify="space-between">
                                        <Text>Estimated reach:</Text>
                                        <Text color="gray.100">~15,000 users</Text>
                                    </Flex>
                                    <Flex justify="space-between">
                                        <Text>Campaign duration:</Text>
                                        <Text color="gray.100">7 days</Text>
                                    </Flex>
                                    <Flex justify="space-between">
                                        <Text>Locations selected:</Text>
                                        <Text color="gray.100">{newBanner.locations.length || 0}</Text>
                                    </Flex>
                                </VStack>

                                <Divider my={4} borderColor="gray.700" />

                                <Box p={4} bg="purple.900/30" borderRadius="md">
                                    <Text color="purple.300" fontWeight="500" fontSize="sm" mb={2}>🎯 Banner Best Practices:</Text>
                                    <VStack align="start" spacing={1}>
                                        <Text color="purple.200" fontSize="xs">• Keep headlines under 8 words</Text>
                                        <Text color="purple.200" fontSize="xs">• Use strong call-to-action text</Text>
                                        <Text color="purple.200" fontSize="xs">• Ensure 4:4.5:1 contrast ratio</Text>
                                        <Text color="purple.200" fontSize="xs">• Test on multiple cities</Text>
                                        <Text color="purple.200" fontSize="xs">• Add text different resources</Text>
                                    </VStack>
                                </Box>

                                <Divider my={4} borderColor="gray.700" />

                                <VStack align="stretch" spacing={1} fontSize="xs" color="gray.500">
                                    <Text>Created by: Admin User</Text>
                                    <Text>Created at: {new Date().toLocaleString()}</Text>
                                    <Text>Last modified: Just now</Text>
                                </VStack>
                            </Box>
                        </Flex>
                    </ModalBody>
                    <ModalFooter borderTopWidth="1px" borderColor="gray.800" gap={2}>
                        <Button variant="ghost" onClick={onCreateClose}>Cancel</Button>
                        <Button variant="outline" colorScheme="purple">Save Draft</Button>
                        <Button colorScheme="purple" onClick={handleCreateBanner}>Publish Banner</Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </Box>
    );
};

export default AdListingPage;
