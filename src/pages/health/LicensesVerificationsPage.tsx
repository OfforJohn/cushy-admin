import React, { useState } from 'react';
import {
    Box,
    Flex,
    Heading,
    Text,
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
import {
    Clock,
    CheckCircle,
    XCircle,
    Calendar,
    Check,
    Bell,
    FileText,
    MoreVertical,
    Eye,
    Filter,
    ArrowUpDown,
} from 'lucide-react';

// Mock data for license verifications
const mockLicenses = [
    {
        id: '1',
        professional: { name: 'Dr. Amina Yusuf', email: 'amina@email.com' },
        licenseType: 'MDCN',
        licenseNumber: 'MDCN-12345',
        submittedDate: '2024-12-25',
        status: 'Pending',
        priority: 'High',
        documents: ['License', 'ID'],
    },
    {
        id: '2',
        professional: { name: 'Dr. Chidi Okonkwo', email: 'chidi@email.com' },
        licenseType: 'PCN',
        licenseNumber: 'PCN-67890',
        submittedDate: '2024-12-27',
        status: 'Verified',
        priority: 'Low',
        documents: ['License', 'ID', 'Certificate'],
    },
    {
        id: '3',
        professional: { name: 'Dr. Fatima Ibrahim', email: 'fatima@email.com' },
        licenseType: 'MDCN',
        licenseNumber: 'MDCN-11111',
        submittedDate: '2024-12-20',
        status: 'Rejected',
        priority: 'Medium',
        documents: ['License'],
    },
];

export const LicensesVerificationsPage: React.FC = () => {
    const toast = useToast();

    const [statusFilter, setStatusFilter] = useState('all');
    const [licenseTypeFilter, setLicenseTypeFilter] = useState('all');
    const [cityFilter, setCityFilter] = useState('all');
    const [selectedLicenses, setSelectedLicenses] = useState<string[]>([]);

    const licenses = mockLicenses;
    const isLoading = false;

    // Calculate stats
    const pendingCount = licenses.filter(l => l.status === 'Pending').length;
    const verifiedTodayCount = licenses.filter(l => l.status === 'Verified').length;
    const rejectedCount = licenses.filter(l => l.status === 'Rejected').length;
    const expiringCount = 0; // Would come from API

    // Filter licenses
    const filteredLicenses = licenses.filter(license => {
        if (statusFilter !== 'all' && license.status.toLowerCase() !== statusFilter) return false;
        if (licenseTypeFilter !== 'all' && license.licenseType !== licenseTypeFilter) return false;
        return true;
    });

    const handleSelectAll = (checked: boolean) => {
        if (checked) {
            setSelectedLicenses(filteredLicenses.map(l => l.id));
        } else {
            setSelectedLicenses([]);
        }
    };

    const handleSelectLicense = (licenseId: string, checked: boolean) => {
        if (checked) {
            setSelectedLicenses([...selectedLicenses, licenseId]);
        } else {
            setSelectedLicenses(selectedLicenses.filter(id => id !== licenseId));
        }
    };

    const handleBulkApprove = () => {
        toast({
            title: `Approved ${selectedLicenses.length} licenses`,
            status: 'success',
            duration: 2000,
        });
        setSelectedLicenses([]);
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'Verified':
                return <Badge colorScheme="green" variant="subtle">Verified</Badge>;
            case 'Pending':
                return <Badge colorScheme="yellow" variant="subtle">Pending</Badge>;
            case 'Rejected':
                return <Badge colorScheme="red" variant="subtle">Rejected</Badge>;
            case 'Expired':
                return <Badge colorScheme="orange" variant="subtle">Expired</Badge>;
            default:
                return <Badge colorScheme="gray" variant="subtle">{status}</Badge>;
        }
    };

    const getPriorityBadge = (priority: string) => {
        switch (priority) {
            case 'High':
                return <Badge colorScheme="red" variant="subtle">High</Badge>;
            case 'Medium':
                return <Badge colorScheme="orange" variant="subtle">Medium</Badge>;
            case 'Low':
                return <Badge colorScheme="gray" variant="subtle">Low</Badge>;
            default:
                return <Badge colorScheme="gray" variant="subtle">{priority}</Badge>;
        }
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
                        Licenses & Verifications
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
            <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4} mb={6}>
                <Card bg="gray.900" borderColor="gray.800" borderWidth="1px">
                    <CardBody py={4}>
                        <Flex justify="space-between" align="flex-start">
                            <Box>
                                <Text fontSize="xs" color="gray.500">Pending Verification</Text>
                                <Text fontSize="2xl" fontWeight="bold" color="gray.100">{pendingCount}</Text>
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
                                <Text fontSize="xs" color="gray.500">Verified Today</Text>
                                <Text fontSize="2xl" fontWeight="bold" color="gray.100">{verifiedTodayCount}</Text>
                                <Text fontSize="xs" color="green.400">12 approved this week</Text>
                            </Box>
                            <Icon as={CheckCircle} color="green.400" boxSize={5} />
                        </Flex>
                    </CardBody>
                </Card>

                <Card bg="gray.900" borderColor="gray.800" borderWidth="1px">
                    <CardBody py={4}>
                        <Flex justify="space-between" align="flex-start">
                            <Box>
                                <Text fontSize="xs" color="gray.500">Rejected This Week</Text>
                                <Text fontSize="2xl" fontWeight="bold" color="gray.100">{rejectedCount}</Text>
                                <Text fontSize="xs" color="red.400">Most: Invalid docs</Text>
                            </Box>
                            <Icon as={XCircle} color="red.400" boxSize={5} />
                        </Flex>
                    </CardBody>
                </Card>

                <Card bg="gray.900" borderColor="gray.800" borderWidth="1px">
                    <CardBody py={4}>
                        <Flex justify="space-between" align="flex-start">
                            <Box>
                                <Text fontSize="xs" color="gray.500">Expiring Soon</Text>
                                <Text fontSize="2xl" fontWeight="bold" color="gray.100">{expiringCount}</Text>
                                <Text fontSize="xs" color="orange.400">Next 30 days</Text>
                            </Box>
                            <Icon as={Calendar} color="orange.400" boxSize={5} />
                        </Flex>
                    </CardBody>
                </Card>
            </SimpleGrid>

            {/* Quick Actions */}
            <Flex justify="space-between" align="center" mb={4} flexWrap="wrap" gap={3}>
                <HStack spacing={3}>
                    <Button
                        size="sm"
                        colorScheme="purple"
                        leftIcon={<Check size={14} />}
                        isDisabled={selectedLicenses.length === 0}
                        onClick={handleBulkApprove}
                    >
                        Bulk Approve ({selectedLicenses.length})
                    </Button>
                    <Button
                        size="sm"
                        variant="outline"
                        borderColor="gray.600"
                        leftIcon={<Bell size={14} />}
                    >
                        Send Reminders
                    </Button>
                    <Button
                        size="sm"
                        variant="outline"
                        borderColor="gray.600"
                        leftIcon={<FileText size={14} />}
                    >
                        Export Report
                    </Button>
                </HStack>
                <Text fontSize="sm" color="gray.500">Quick Actions</Text>
            </Flex>

            {/* Filters */}
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
                        <option value="pending">Pending</option>
                        <option value="verified">Verified</option>
                        <option value="rejected">Rejected</option>
                    </Select>
                    <Select
                        w="160px"
                        size="sm"
                        bg="gray.800"
                        borderColor="gray.700"
                        value={licenseTypeFilter}
                        onChange={(e) => setLicenseTypeFilter(e.target.value)}
                    >
                        <option value="all">All License Types</option>
                        <option value="MDCN">MDCN</option>
                        <option value="PCN">PCN</option>
                        <option value="NMCN">NMCN</option>
                    </Select>
                    <Select
                        w="130px"
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
                </HStack>

                <HStack spacing={2}>
                    <Text fontSize="sm" color="gray.500">Showing urgent items first</Text>
                    <Icon as={Calendar} color="red.400" boxSize={4} />
                </HStack>
            </Flex>

            {/* Verification Queue */}
            <Box bg="gray.900" borderRadius="xl" borderWidth="1px" borderColor="gray.800" overflow="hidden">
                <Flex justify="space-between" align="center" p={4} borderBottomWidth="1px" borderColor="gray.800">
                    <Box>
                        <Text fontWeight="600" color="gray.100">Verification Queue</Text>
                        <Text fontSize="sm" color="purple.400">{pendingCount} pending verifications</Text>
                    </Box>
                    <HStack spacing={2}>
                        <Button size="xs" variant="ghost" leftIcon={<ArrowUpDown size={12} />}>
                            Sort
                        </Button>
                        <Text fontSize="sm" color="gray.500">Date</Text>
                    </HStack>
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
                                            isChecked={selectedLicenses.length === filteredLicenses.length && filteredLicenses.length > 0}
                                            isIndeterminate={selectedLicenses.length > 0 && selectedLicenses.length < filteredLicenses.length}
                                            onChange={(e) => handleSelectAll(e.target.checked)}
                                            colorScheme="purple"
                                        />
                                    </Th>
                                    <Th borderColor="gray.800" color="gray.500">Professional</Th>
                                    <Th borderColor="gray.800" color="gray.500">License Type</Th>
                                    <Th borderColor="gray.800" color="gray.500">License Number</Th>
                                    <Th borderColor="gray.800" color="gray.500">Submitted Date</Th>
                                    <Th borderColor="gray.800" color="gray.500">Status</Th>
                                    <Th borderColor="gray.800" color="gray.500">Priority</Th>
                                    <Th borderColor="gray.800" color="gray.500">Documents</Th>
                                    <Th borderColor="gray.800" color="gray.500">Actions</Th>
                                </Tr>
                            </Thead>
                            <Tbody>
                                {filteredLicenses.length === 0 ? (
                                    <Tr>
                                        <Td colSpan={9} textAlign="center" py={8} borderColor="gray.800">
                                            <Text color="gray.500">No records match the selected filters.</Text>
                                        </Td>
                                    </Tr>
                                ) : (
                                    filteredLicenses.map((license) => (
                                        <Tr key={license.id} _hover={{ bg: 'gray.800' }}>
                                            <Td borderColor="gray.800">
                                                <Checkbox
                                                    isChecked={selectedLicenses.includes(license.id)}
                                                    onChange={(e) => handleSelectLicense(license.id, e.target.checked)}
                                                    colorScheme="purple"
                                                />
                                            </Td>
                                            <Td borderColor="gray.800">
                                                <HStack spacing={3}>
                                                    <Avatar size="sm" name={license.professional.name} bg="purple.500" />
                                                    <Box>
                                                        <Text fontWeight="500" color="gray.100">{license.professional.name}</Text>
                                                        <Text fontSize="xs" color="gray.500">{license.professional.email}</Text>
                                                    </Box>
                                                </HStack>
                                            </Td>
                                            <Td borderColor="gray.800">
                                                <Badge colorScheme="blue" variant="subtle">{license.licenseType}</Badge>
                                            </Td>
                                            <Td borderColor="gray.800">
                                                <Text fontSize="sm" color="gray.400">{license.licenseNumber}</Text>
                                            </Td>
                                            <Td borderColor="gray.800">
                                                <Text fontSize="sm" color="gray.400">{formatDate(license.submittedDate)}</Text>
                                            </Td>
                                            <Td borderColor="gray.800">
                                                {getStatusBadge(license.status)}
                                            </Td>
                                            <Td borderColor="gray.800">
                                                {getPriorityBadge(license.priority)}
                                            </Td>
                                            <Td borderColor="gray.800">
                                                <HStack spacing={1}>
                                                    {license.documents.map((doc, idx) => (
                                                        <Badge key={idx} colorScheme="green" size="sm">{doc}</Badge>
                                                    ))}
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
                                                        isDisabled={license.status !== 'Pending'}
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
            </Box>
        </Box>
    );
};

export default LicensesVerificationsPage;
