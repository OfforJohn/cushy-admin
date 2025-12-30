import React, { useState } from 'react';
import {
    Box,
    Flex,
    Heading,
    Text,
    Input,
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
    Spinner,
    Card,
    CardBody,
} from '@chakra-ui/react';
import {
    MessageCircle,
    Video,
    Clock,
    CheckCircle,
    AlertTriangle,
    MoreVertical,
    Eye,
    Download,
    Filter,
    Radio,
} from 'lucide-react';

// Mock data for consultations
const mockConsultations = [
    {
        id: 'CONS-001',
        user: { name: 'John Doe', email: 'john@email.com' },
        professional: { name: 'Dr. Amina Yusuf', specialty: 'General Practice' },
        mode: 'Video',
        time: '2024-12-29T10:30:00',
        duration: 30,
        fee: 5000,
        status: 'Completed',
        prescription: true,
    },
    {
        id: 'CONS-002',
        user: { name: 'Jane Smith', email: 'jane@email.com' },
        professional: { name: 'Dr. Chidi Okonkwo', specialty: 'Pediatrics' },
        mode: 'Chat',
        time: '2024-12-29T11:00:00',
        duration: 20,
        fee: 3000,
        status: 'Ongoing',
        prescription: false,
    },
    {
        id: 'CONS-003',
        user: { name: 'Mary Johnson', email: 'mary@email.com' },
        professional: { name: 'Dr. Fatima Ibrahim', specialty: 'Dermatology' },
        mode: 'Video',
        time: '2024-12-29T14:00:00',
        duration: 0,
        fee: 10000,
        status: 'Awaiting',
        prescription: false,
    },
];

export const ConsultationsPage: React.FC = () => {
    const [statusFilter, setStatusFilter] = useState('all');
    const [modeFilter, setModeFilter] = useState('all');
    const [specialtyFilter, setSpecialtyFilter] = useState('all');
    const [cityFilter, setCityFilter] = useState('all');

    const consultations = mockConsultations;
    const isLoading = false;

    // Calculate stats
    const totalConsultations = consultations.length;
    const ongoingCount = consultations.filter(c => c.status === 'Ongoing').length;
    const awaitingCount = consultations.filter(c => c.status === 'Awaiting').length;
    const completedCount = consultations.filter(c => c.status === 'Completed').length;
    const disputedCount = consultations.filter(c => c.status === 'Disputed').length;
    const completionRate = totalConsultations > 0 ? Math.round((completedCount / totalConsultations) * 100) : 0;

    // Filter consultations
    const filteredConsultations = consultations.filter(consultation => {
        if (statusFilter !== 'all' && consultation.status.toLowerCase() !== statusFilter) return false;
        if (modeFilter !== 'all' && consultation.mode.toLowerCase() !== modeFilter) return false;
        return true;
    });

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'Completed':
                return <Badge colorScheme="green" variant="subtle">Completed</Badge>;
            case 'Ongoing':
                return <Badge colorScheme="blue" variant="solid">Ongoing</Badge>;
            case 'Awaiting':
                return <Badge colorScheme="yellow" variant="subtle">Awaiting</Badge>;
            case 'Disputed':
                return <Badge colorScheme="red" variant="subtle">Disputed</Badge>;
            case 'Cancelled':
                return <Badge colorScheme="gray" variant="subtle">Cancelled</Badge>;
            default:
                return <Badge colorScheme="gray" variant="subtle">{status}</Badge>;
        }
    };

    const getModeIcon = (mode: string) => {
        switch (mode) {
            case 'Video':
                return <Icon as={Video} color="purple.400" boxSize={4} />;
            case 'Chat':
                return <Icon as={MessageCircle} color="blue.400" boxSize={4} />;
            default:
                return null;
        }
    };

    const formatTime = (dateString: string) => {
        return new Date(dateString).toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    return (
        <Box>
            {/* Header */}
            <Flex justify="space-between" align="center" mb={6}>
                <HStack spacing={4}>
                    <Heading size="lg" color="gray.100">
                        Consultations
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

            {/* Stats Cards */}
            <SimpleGrid columns={{ base: 2, md: 5 }} spacing={4} mb={6}>
                <Card bg="gray.900" borderColor="gray.800" borderWidth="1px">
                    <CardBody py={4}>
                        <Flex justify="space-between" align="flex-start">
                            <Box>
                                <Text fontSize="xs" color="gray.500">Total Consultations</Text>
                                <Text fontSize="2xl" fontWeight="bold" color="gray.100">{totalConsultations}</Text>
                                <Text fontSize="xs" color="gray.500">0 today</Text>
                            </Box>
                            <Icon as={MessageCircle} color="blue.400" boxSize={5} />
                        </Flex>
                    </CardBody>
                </Card>

                <Card bg="gray.900" borderColor="gray.800" borderWidth="1px">
                    <CardBody py={4}>
                        <Flex justify="space-between" align="flex-start">
                            <Box>
                                <Text fontSize="xs" color="gray.500">Ongoing</Text>
                                <Text fontSize="2xl" fontWeight="bold" color="gray.100">{ongoingCount}</Text>
                                <Text fontSize="xs" color="blue.400">Live sessions</Text>
                            </Box>
                            <Icon as={Video} color="purple.400" boxSize={5} />
                        </Flex>
                    </CardBody>
                </Card>

                <Card bg="gray.900" borderColor="gray.800" borderWidth="1px">
                    <CardBody py={4}>
                        <Flex justify="space-between" align="flex-start">
                            <Box>
                                <Text fontSize="xs" color="gray.500">Awaiting</Text>
                                <Text fontSize="2xl" fontWeight="bold" color="gray.100">{awaitingCount}</Text>
                                <Text fontSize="xs" color="orange.400">Avg 12 min wait</Text>
                            </Box>
                            <Icon as={Clock} color="orange.400" boxSize={5} />
                        </Flex>
                    </CardBody>
                </Card>

                <Card bg="gray.900" borderColor="gray.800" borderWidth="1px">
                    <CardBody py={4}>
                        <Flex justify="space-between" align="flex-start">
                            <Box>
                                <Text fontSize="xs" color="gray.500">Completion Rate</Text>
                                <Text fontSize="2xl" fontWeight="bold" color="gray.100">{completionRate}%</Text>
                                <Text fontSize="xs" color="gray.500">This week</Text>
                            </Box>
                            <Icon as={CheckCircle} color="green.400" boxSize={5} />
                        </Flex>
                    </CardBody>
                </Card>

                <Card bg="gray.900" borderColor="gray.800" borderWidth="1px">
                    <CardBody py={4}>
                        <Flex justify="space-between" align="flex-start">
                            <Box>
                                <Text fontSize="xs" color="gray.500">Disputed</Text>
                                <Text fontSize="2xl" fontWeight="bold" color="gray.100">{disputedCount}</Text>
                                <Text fontSize="xs" color="red.400">Needs review</Text>
                            </Box>
                            <Icon as={AlertTriangle} color="red.400" boxSize={5} />
                        </Flex>
                    </CardBody>
                </Card>
            </SimpleGrid>

            {/* Filters and Actions */}
            <Flex justify="space-between" align="center" mb={4} flexWrap="wrap" gap={3}>
                <HStack spacing={3}>
                    <Select
                        w="130px"
                        size="sm"
                        bg="gray.800"
                        borderColor="gray.700"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                    >
                        <option value="all">All Status</option>
                        <option value="ongoing">Ongoing</option>
                        <option value="awaiting">Awaiting</option>
                        <option value="completed">Completed</option>
                        <option value="disputed">Disputed</option>
                    </Select>
                    <Select
                        w="130px"
                        size="sm"
                        bg="gray.800"
                        borderColor="gray.700"
                        value={modeFilter}
                        onChange={(e) => setModeFilter(e.target.value)}
                    >
                        <option value="all">All Modes</option>
                        <option value="video">Video</option>
                        <option value="chat">Chat</option>
                    </Select>
                    <Select
                        w="150px"
                        size="sm"
                        bg="gray.800"
                        borderColor="gray.700"
                        value={specialtyFilter}
                        onChange={(e) => setSpecialtyFilter(e.target.value)}
                    >
                        <option value="all">All Specialties</option>
                        <option value="general">General Practice</option>
                        <option value="pediatrics">Pediatrics</option>
                    </Select>
                    <Input
                        type="date"
                        size="sm"
                        bg="gray.800"
                        borderColor="gray.700"
                        w="150px"
                    />
                    <Button size="sm" variant="ghost" leftIcon={<Filter size={14} />}>
                        More Filters
                    </Button>
                    <Button size="sm" variant="ghost" leftIcon={<Download size={14} />}>
                        Export CSV
                    </Button>
                </HStack>
                <Button
                    size="sm"
                    colorScheme="green"
                    leftIcon={<Radio size={14} />}
                >
                    Live Monitor
                </Button>
            </Flex>

            {/* Table */}
            <Box bg="gray.900" borderRadius="xl" borderWidth="1px" borderColor="gray.800" overflow="hidden">
                <Flex justify="space-between" align="center" p={4} borderBottomWidth="1px" borderColor="gray.800">
                    <Text fontWeight="600" color="gray.100">Consultations</Text>
                    <Text fontSize="sm" color="gray.500">{filteredConsultations.length} consultations</Text>
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
                                    <Th borderColor="gray.800" color="gray.500">Consultation ID</Th>
                                    <Th borderColor="gray.800" color="gray.500">User</Th>
                                    <Th borderColor="gray.800" color="gray.500">Professional</Th>
                                    <Th borderColor="gray.800" color="gray.500">Mode</Th>
                                    <Th borderColor="gray.800" color="gray.500">Time</Th>
                                    <Th borderColor="gray.800" color="gray.500">Fee</Th>
                                    <Th borderColor="gray.800" color="gray.500">Status</Th>
                                    <Th borderColor="gray.800" color="gray.500">Prescription</Th>
                                </Tr>
                            </Thead>
                            <Tbody>
                                {filteredConsultations.length === 0 ? (
                                    <Tr>
                                        <Td colSpan={8} textAlign="center" py={8} borderColor="gray.800">
                                            <Text color="gray.500">No consultations found</Text>
                                        </Td>
                                    </Tr>
                                ) : (
                                    filteredConsultations.map((consultation) => (
                                        <Tr key={consultation.id} _hover={{ bg: 'gray.800' }}>
                                            <Td borderColor="gray.800">
                                                <Text fontSize="sm" color="purple.400" fontWeight="500">{consultation.id}</Text>
                                            </Td>
                                            <Td borderColor="gray.800">
                                                <HStack spacing={3}>
                                                    <Avatar size="xs" name={consultation.user.name} bg="blue.500" />
                                                    <Box>
                                                        <Text fontSize="sm" color="gray.100">{consultation.user.name}</Text>
                                                    </Box>
                                                </HStack>
                                            </Td>
                                            <Td borderColor="gray.800">
                                                <Box>
                                                    <Text fontSize="sm" color="gray.100">{consultation.professional.name}</Text>
                                                    <Text fontSize="xs" color="gray.500">{consultation.professional.specialty}</Text>
                                                </Box>
                                            </Td>
                                            <Td borderColor="gray.800">
                                                <HStack spacing={2}>
                                                    {getModeIcon(consultation.mode)}
                                                    <Text fontSize="sm" color="gray.400">{consultation.mode}</Text>
                                                </HStack>
                                            </Td>
                                            <Td borderColor="gray.800">
                                                <Text fontSize="sm" color="gray.400">{formatTime(consultation.time)}</Text>
                                            </Td>
                                            <Td borderColor="gray.800">
                                                <Text fontSize="sm" color="gray.100">₦{consultation.fee.toLocaleString()}</Text>
                                            </Td>
                                            <Td borderColor="gray.800">
                                                {getStatusBadge(consultation.status)}
                                            </Td>
                                            <Td borderColor="gray.800">
                                                {consultation.prescription ? (
                                                    <Badge colorScheme="green" variant="subtle">Yes</Badge>
                                                ) : (
                                                    <Badge colorScheme="gray" variant="subtle">No</Badge>
                                                )}
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

export default ConsultationsPage;
