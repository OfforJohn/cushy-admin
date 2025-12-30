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
import { useQuery } from '@tanstack/react-query';
import {
    Search,
    Users,
    Clock,
    CheckCircle,
    Star,
    Plus,
    MoreVertical,
    Eye,
    Edit,
    Trash2,
    Download,
    Filter,
    ArrowUpDown,
} from 'lucide-react';

// Mock data for health professionals
const mockProfessionals = [
    {
        id: '1',
        name: 'Dr. Amina Yusuf',
        email: 'amina.yusuf@email.com',
        specialty: 'General Practice',
        license: 'MDCN-12345',
        location: 'Minna',
        fee: 5000,
        status: 'Active',
        rating: 4.8,
        availability: 'Available',
        avatar: null,
    },
    {
        id: '2',
        name: 'Dr. Chidi Okonkwo',
        email: 'chidi.okonkwo@email.com',
        specialty: 'Pediatrics',
        license: 'MDCN-23456',
        location: 'Abuja',
        fee: 7500,
        status: 'Active',
        rating: 4.5,
        availability: 'Busy',
        avatar: null,
    },
    {
        id: '3',
        name: 'Dr. Fatima Ibrahim',
        email: 'fatima.ibrahim@email.com',
        specialty: 'Dermatology',
        license: 'MDCN-34567',
        location: 'Lagos',
        fee: 10000,
        status: 'Pending',
        rating: 0,
        availability: 'Offline',
        avatar: null,
    },
];

export const HealthProfessionalsPage: React.FC = () => {
    const toast = useToast();

    const [searchQuery, setSearchQuery] = useState('');
    const [specialtyFilter, setSpecialtyFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');
    const [cityFilter, setCityFilter] = useState('all');

    // In production, this would fetch from a health professionals API
    const professionals = mockProfessionals;
    const isLoading = false;

    // Calculate stats
    const totalProfessionals = professionals.length;
    const pendingVerification = professionals.filter(p => p.status === 'Pending').length;
    const activeToday = professionals.filter(p => p.availability === 'Available').length;
    const avgRating = professionals.filter(p => p.rating > 0).reduce((acc, p) => acc + p.rating, 0) /
        (professionals.filter(p => p.rating > 0).length || 1);

    // Filter professionals
    const filteredProfessionals = professionals.filter(professional => {
        if (searchQuery) {
            const searchLower = searchQuery.toLowerCase();
            if (!professional.name.toLowerCase().includes(searchLower) &&
                !professional.email.toLowerCase().includes(searchLower)) {
                return false;
            }
        }
        if (specialtyFilter !== 'all' && professional.specialty !== specialtyFilter) return false;
        if (statusFilter !== 'all' && professional.status.toLowerCase() !== statusFilter) return false;
        return true;
    });

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'Active':
                return <Badge colorScheme="green" variant="subtle">Active</Badge>;
            case 'Pending':
                return <Badge colorScheme="yellow" variant="subtle">Pending</Badge>;
            case 'Suspended':
                return <Badge colorScheme="red" variant="subtle">Suspended</Badge>;
            default:
                return <Badge colorScheme="gray" variant="subtle">{status}</Badge>;
        }
    };

    const getAvailabilityBadge = (availability: string) => {
        switch (availability) {
            case 'Available':
                return <Badge colorScheme="green" variant="solid">Available</Badge>;
            case 'Busy':
                return <Badge colorScheme="orange" variant="solid">Busy</Badge>;
            case 'Offline':
                return <Badge colorScheme="gray" variant="solid">Offline</Badge>;
            default:
                return <Badge colorScheme="gray" variant="subtle">{availability}</Badge>;
        }
    };

    return (
        <Box>
            {/* Header */}
            <Flex justify="space-between" align="center" mb={6}>
                <HStack spacing={4}>
                    <Heading size="lg" color="gray.100">
                        Professionals
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

            {/* Sub-header with search */}
            <Flex justify="space-between" align="center" mb={6}>
                <HStack spacing={4}>
                    <Text fontSize="lg" fontWeight="500" color="gray.300">Health Professionals</Text>
                    <Select
                        w="140px"
                        size="sm"
                        bg="gray.800"
                        borderColor="gray.700"
                        defaultValue="all"
                    >
                        <option value="all">All Cities</option>
                    </Select>
                </HStack>
                <HStack spacing={4}>
                    <InputGroup maxW="250px">
                        <InputLeftElement>
                            <Icon as={Search} color="gray.500" boxSize={4} />
                        </InputLeftElement>
                        <Input
                            placeholder="Search professionals..."
                            bg="gray.800"
                            borderColor="gray.700"
                            size="sm"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </InputGroup>
                    <HStack spacing={2}>
                        <Avatar size="xs" name="Sarah Admin" bg="purple.500" />
                        <Text fontSize="sm" color="gray.400">Sarah Admin</Text>
                    </HStack>
                </HStack>
            </Flex>

            {/* Stats Cards */}
            <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4} mb={6}>
                <Card bg="gray.900" borderColor="gray.800" borderWidth="1px">
                    <CardBody py={4}>
                        <Flex justify="space-between" align="flex-start">
                            <Box>
                                <Text fontSize="xs" color="gray.500">Total Professionals</Text>
                                <Text fontSize="2xl" fontWeight="bold" color="gray.100">{totalProfessionals}</Text>
                                <Text fontSize="xs" color="green.400">↑ 0 new this week</Text>
                            </Box>
                            <Icon as={Users} color="purple.400" boxSize={5} />
                        </Flex>
                    </CardBody>
                </Card>

                <Card bg="gray.900" borderColor="gray.800" borderWidth="1px">
                    <CardBody py={4}>
                        <Flex justify="space-between" align="flex-start">
                            <Box>
                                <Text fontSize="xs" color="gray.500">Verification Pending</Text>
                                <Text fontSize="2xl" fontWeight="bold" color="gray.100">{pendingVerification}</Text>
                                <Text fontSize="xs" color="gray.500">Avg 2.3 days</Text>
                            </Box>
                            <Icon as={Clock} color="orange.400" boxSize={5} />
                        </Flex>
                    </CardBody>
                </Card>

                <Card bg="gray.900" borderColor="gray.800" borderWidth="1px">
                    <CardBody py={4}>
                        <Flex justify="space-between" align="flex-start">
                            <Box>
                                <Text fontSize="xs" color="gray.500">Active Today</Text>
                                <Text fontSize="2xl" fontWeight="bold" color="gray.100">{activeToday}</Text>
                                <Text fontSize="xs" color="green.400">↑ 89% availability</Text>
                            </Box>
                            <Icon as={CheckCircle} color="green.400" boxSize={5} />
                        </Flex>
                    </CardBody>
                </Card>

                <Card bg="gray.900" borderColor="gray.800" borderWidth="1px">
                    <CardBody py={4}>
                        <Flex justify="space-between" align="flex-start">
                            <Box>
                                <Text fontSize="xs" color="gray.500">Avg Rating</Text>
                                <Text fontSize="2xl" fontWeight="bold" color="gray.100">{avgRating.toFixed(1)}</Text>
                                <Text fontSize="xs" color="gray.500">Based on 1,247 reviews</Text>
                            </Box>
                            <Icon as={Star} color="yellow.400" boxSize={5} />
                        </Flex>
                    </CardBody>
                </Card>
            </SimpleGrid>

            {/* Filters and Actions */}
            <Flex justify="space-between" align="center" mb={4} flexWrap="wrap" gap={3}>
                <HStack spacing={3}>
                    <Select
                        w="150px"
                        size="sm"
                        bg="gray.800"
                        borderColor="gray.700"
                        value={specialtyFilter}
                        onChange={(e) => setSpecialtyFilter(e.target.value)}
                    >
                        <option value="all">All Specialties</option>
                        <option value="General Practice">General Practice</option>
                        <option value="Pediatrics">Pediatrics</option>
                        <option value="Dermatology">Dermatology</option>
                        <option value="Cardiology">Cardiology</option>
                    </Select>
                    <Select
                        w="130px"
                        size="sm"
                        bg="gray.800"
                        borderColor="gray.700"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                    >
                        <option value="all">All Status</option>
                        <option value="active">Active</option>
                        <option value="pending">Pending</option>
                        <option value="suspended">Suspended</option>
                    </Select>
                    <Button size="sm" variant="ghost" leftIcon={<Filter size={14} />}>
                        More Filters
                    </Button>
                    <Button size="sm" variant="ghost" leftIcon={<Download size={14} />}>
                        Export CSV
                    </Button>
                </HStack>
                <Button
                    size="sm"
                    colorScheme="purple"
                    leftIcon={<Plus size={14} />}
                >
                    Add Professional
                </Button>
            </Flex>

            {/* Table */}
            <Box bg="gray.900" borderRadius="xl" borderWidth="1px" borderColor="gray.800" overflow="hidden">
                <Flex justify="space-between" align="center" p={4} borderBottomWidth="1px" borderColor="gray.800">
                    <Text fontWeight="600" color="gray.100">Health Professionals</Text>
                    <Button size="xs" variant="ghost" leftIcon={<ArrowUpDown size={12} />}>
                        Sort
                    </Button>
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
                                    <Th borderColor="gray.800" color="gray.500">Professional</Th>
                                    <Th borderColor="gray.800" color="gray.500">Specialty</Th>
                                    <Th borderColor="gray.800" color="gray.500">License</Th>
                                    <Th borderColor="gray.800" color="gray.500">Location</Th>
                                    <Th borderColor="gray.800" color="gray.500">Fee</Th>
                                    <Th borderColor="gray.800" color="gray.500">Status</Th>
                                    <Th borderColor="gray.800" color="gray.500">Rating</Th>
                                    <Th borderColor="gray.800" color="gray.500">Availability</Th>
                                    <Th borderColor="gray.800" color="gray.500">Actions</Th>
                                </Tr>
                            </Thead>
                            <Tbody>
                                {filteredProfessionals.length === 0 ? (
                                    <Tr>
                                        <Td colSpan={9} textAlign="center" py={8} borderColor="gray.800">
                                            <Text color="gray.500">No professionals found</Text>
                                        </Td>
                                    </Tr>
                                ) : (
                                    filteredProfessionals.map((professional) => (
                                        <Tr key={professional.id} _hover={{ bg: 'gray.800' }}>
                                            <Td borderColor="gray.800">
                                                <HStack spacing={3}>
                                                    <Avatar size="sm" name={professional.name} bg="purple.500" />
                                                    <Box>
                                                        <Text fontWeight="500" color="gray.100">{professional.name}</Text>
                                                        <Text fontSize="xs" color="gray.500">{professional.email}</Text>
                                                    </Box>
                                                </HStack>
                                            </Td>
                                            <Td borderColor="gray.800">
                                                <Badge colorScheme="blue" variant="subtle">{professional.specialty}</Badge>
                                            </Td>
                                            <Td borderColor="gray.800">
                                                <Text fontSize="sm" color="gray.400">{professional.license}</Text>
                                            </Td>
                                            <Td borderColor="gray.800">
                                                <Text fontSize="sm" color="gray.400">{professional.location}</Text>
                                            </Td>
                                            <Td borderColor="gray.800">
                                                <Text fontSize="sm" color="gray.100">₦{professional.fee.toLocaleString()}</Text>
                                            </Td>
                                            <Td borderColor="gray.800">
                                                {getStatusBadge(professional.status)}
                                            </Td>
                                            <Td borderColor="gray.800">
                                                <HStack spacing={1}>
                                                    <Icon as={Star} color="yellow.400" boxSize={3} fill="yellow.400" />
                                                    <Text fontSize="sm" color="gray.100">{professional.rating || '-'}</Text>
                                                </HStack>
                                            </Td>
                                            <Td borderColor="gray.800">
                                                {getAvailabilityBadge(professional.availability)}
                                            </Td>
                                            <Td borderColor="gray.800">
                                                <Menu>
                                                    <MenuButton
                                                        as={IconButton}
                                                        icon={<MoreVertical size={14} />}
                                                        size="xs"
                                                        variant="ghost"
                                                    />
                                                    <MenuList bg="gray.800" borderColor="gray.700">
                                                        <MenuItem bg="gray.800" _hover={{ bg: 'gray.700' }} icon={<Eye size={14} />}>
                                                            View Profile
                                                        </MenuItem>
                                                        <MenuItem bg="gray.800" _hover={{ bg: 'gray.700' }} icon={<Edit size={14} />}>
                                                            Edit
                                                        </MenuItem>
                                                        <MenuItem bg="gray.800" _hover={{ bg: 'gray.700' }} color="red.400" icon={<Trash2 size={14} />}>
                                                            Suspend
                                                        </MenuItem>
                                                    </MenuList>
                                                </Menu>
                                            </Td>
                                        </Tr>
                                    ))
                                )}
                            </Tbody>
                        </Table>
                    </Box>
                )}
            </Box>
        </Box>
    );
};

export default HealthProfessionalsPage;
