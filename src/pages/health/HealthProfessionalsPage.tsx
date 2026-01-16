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
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalCloseButton,
    ModalFooter,
    useDisclosure,
    Image,
    VStack,
    Divider,
    Link,
} from '@chakra-ui/react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    Search,
    Users,
    Clock,
    CheckCircle,
    Star,
    MoreVertical,
    Eye,
    Download,
    ArrowUpDown,
    ShieldCheck,
    XCircle,
    FileText,
    ExternalLink,
} from 'lucide-react';
import { healthApi, Doctor, ApprovalStatus } from '../../api/health.api';
import { formatCurrency } from '../../utils/formatters';
import { useLocationFilter, matchesLocationFilter } from '../../context/LocationContext';

export const HealthProfessionalsPage: React.FC = () => {
    const toast = useToast();
    const queryClient = useQueryClient();
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);

    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const { selectedLocation } = useLocationFilter();

    // Fetch all doctors from API
    const { data: doctorsData, isLoading, isError } = useQuery({
        queryKey: ['doctors'],
        queryFn: () => healthApi.getAllDoctors(),
    });

    // Fetch pending verifications
    const { data: pendingData } = useQuery({
        queryKey: ['pendingDoctors'],
        queryFn: () => healthApi.getDoctorsWithPendingVerification(),
    });

    // Verify doctor mutation
    const verifyMutation = useMutation({
        mutationFn: ({ doctorId, status }: { doctorId: string; status: ApprovalStatus }) =>
            healthApi.verifyDoctor(doctorId, status),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['doctors'] });
            queryClient.invalidateQueries({ queryKey: ['pendingDoctors'] });
            toast({
                title: 'Success',
                description: 'Verification status updated',
                status: 'success',
                duration: 3000,
            });
            onClose();
        },
        onError: (error: any) => {
            toast({
                title: 'Error',
                description: error?.message || 'Failed to update verification status',
                status: 'error',
                duration: 3000,
            });
        },
    });

    const allProfessionals = doctorsData?.data || [];
    const pendingProfessionals = pendingData?.data || [];

    // Filter by location
    const professionals = allProfessionals.filter((professional: Doctor) => {
        const professionalLocation = professional.location?.state || professional.location?.address || '';
        return matchesLocationFilter(professionalLocation, selectedLocation);
    });

    // Calculate stats
    const totalProfessionals = professionals.length;
    const pendingVerification = pendingProfessionals.filter((p: Doctor) =>
        matchesLocationFilter(p.location?.state || '', selectedLocation)
    ).length;
    const activeProfessionals = professionals.filter(
        (p: Doctor) => p.professionDetails?.approvalStatus === ApprovalStatus.APPROVED
    ).length;
    const avgRating = 4.5; // TODO: Calculate from actual ratings when available

    // Filter professionals
    const filteredProfessionals = professionals.filter((professional: Doctor) => {
        const fullName = `${professional.firstName || ''} ${professional.lastName || ''}`.trim();
        if (searchQuery) {
            const searchLower = searchQuery.toLowerCase();
            if (
                !fullName.toLowerCase().includes(searchLower) &&
                !(professional.email || '').toLowerCase().includes(searchLower)
            ) {
                return false;
            }
        }
        if (statusFilter !== 'all') {
            const status = professional.professionDetails?.approvalStatus;
            if (statusFilter === 'approved' && status !== ApprovalStatus.APPROVED) return false;
            if (statusFilter === 'pending' && status !== ApprovalStatus.PENDING) return false;
            if (statusFilter === 'rejected' && status !== ApprovalStatus.REJECTED) return false;
        }
        return true;
    });

    const getStatusBadge = (status?: ApprovalStatus) => {
        switch (status) {
            case ApprovalStatus.APPROVED:
                return <Badge colorScheme="green" variant="subtle">Approved</Badge>;
            case ApprovalStatus.PENDING:
                return <Badge colorScheme="yellow" variant="subtle">Pending</Badge>;
            case ApprovalStatus.REJECTED:
                return <Badge colorScheme="red" variant="subtle">Rejected</Badge>;
            default:
                return <Badge colorScheme="gray" variant="subtle">Unknown</Badge>;
        }
    };

    const getAvailabilityBadge = (isVerified?: boolean) => {
        if (isVerified) {
            return <Badge colorScheme="green" variant="solid">Verified</Badge>;
        }
        return <Badge colorScheme="gray" variant="solid">Unverified</Badge>;
    };

    const handleVerify = (doctorId: string, status: ApprovalStatus) => {
        verifyMutation.mutate({ doctorId, status });
    };

    const handleViewDocuments = (doctor: Doctor) => {
        setSelectedDoctor(doctor);
        onOpen();
    };

    return (
        <Box>
            {/* Header */}
            <Flex justify="space-between" align="center" mb={6}>
                <Heading size="lg" color="gray.100">
                    Professionals
                </Heading>
            </Flex>

            {/* Sub-header with search */}
            <Flex justify="space-between" align="center" mb={6}>
                <HStack spacing={4}>
                    <Text fontSize="lg" fontWeight="500" color="gray.300">Health Professionals</Text>
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
                                <Text fontSize="xs" color="green.400">Registered professionals</Text>
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
                                <Text fontSize="2xl" fontWeight="bold" color="orange.400">{pendingVerification}</Text>
                                <Text fontSize="xs" color="gray.500">Awaiting review</Text>
                            </Box>
                            <Icon as={Clock} color="orange.400" boxSize={5} />
                        </Flex>
                    </CardBody>
                </Card>

                <Card bg="gray.900" borderColor="gray.800" borderWidth="1px">
                    <CardBody py={4}>
                        <Flex justify="space-between" align="flex-start">
                            <Box>
                                <Text fontSize="xs" color="gray.500">Approved</Text>
                                <Text fontSize="2xl" fontWeight="bold" color="green.400">{activeProfessionals}</Text>
                                <Text fontSize="xs" color="green.400">Verified professionals</Text>
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
                                <Text fontSize="xs" color="gray.500">Based on consultations</Text>
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
                        w="130px"
                        size="sm"
                        bg="gray.800"
                        borderColor="gray.700"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                    >
                        <option value="all">All Status</option>
                        <option value="approved">Approved</option>
                        <option value="pending">Pending</option>
                        <option value="rejected">Rejected</option>
                    </Select>
                    <Button size="sm" variant="ghost" leftIcon={<Download size={14} />}>
                        Export CSV
                    </Button>
                </HStack>
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
                ) : isError ? (
                    <Flex justify="center" py={12}>
                        <Text color="red.400">Failed to load professionals. Make sure the backend is running.</Text>
                    </Flex>
                ) : (
                    <Box overflowX="auto">
                        <Table variant="simple" size="sm">
                            <Thead>
                                <Tr>
                                    <Th borderColor="gray.800" color="gray.500">Professional</Th>
                                    <Th borderColor="gray.800" color="gray.500">Specialty</Th>
                                    <Th borderColor="gray.800" color="gray.500">License No.</Th>
                                    <Th borderColor="gray.800" color="gray.500">Experience</Th>
                                    <Th borderColor="gray.800" color="gray.500">Consultation Fee</Th>
                                    <Th borderColor="gray.800" color="gray.500">Status</Th>
                                    <Th borderColor="gray.800" color="gray.500">Actions</Th>
                                </Tr>
                            </Thead>
                            <Tbody>
                                {filteredProfessionals.length === 0 ? (
                                    <Tr>
                                        <Td colSpan={7} textAlign="center" py={8} borderColor="gray.800">
                                            <Text color="gray.500">No professionals found</Text>
                                        </Td>
                                    </Tr>
                                ) : (
                                    filteredProfessionals.map((professional: Doctor) => (
                                        <Tr key={professional.id} _hover={{ bg: 'gray.800' }}>
                                            <Td borderColor="gray.800">
                                                <HStack spacing={3}>
                                                    <Avatar
                                                        size="sm"
                                                        name={`${professional.firstName || ''} ${professional.lastName || ''}`}
                                                        src={professional.profilePic}
                                                        bg="purple.500"
                                                    />
                                                    <Box>
                                                        <Text fontWeight="500" color="gray.100">
                                                            Dr. {professional.firstName} {professional.lastName}
                                                        </Text>
                                                        <Text fontSize="xs" color="gray.500">{professional.email}</Text>
                                                    </Box>
                                                </HStack>
                                            </Td>
                                            <Td borderColor="gray.800">
                                                <Badge colorScheme="blue" variant="subtle">
                                                    {professional.professionDetails?.specialty || 'General'}
                                                </Badge>
                                            </Td>
                                            <Td borderColor="gray.800">
                                                <Text fontSize="sm" color="gray.400">
                                                    {professional.professionDetails?.medicalLicenseNumber || 'N/A'}
                                                </Text>
                                            </Td>
                                            <Td borderColor="gray.800">
                                                <Text fontSize="sm" color="gray.400">
                                                    {professional.professionDetails?.yearOfExperience
                                                        ? `${professional.professionDetails.yearOfExperience} years`
                                                        : 'N/A'}
                                                </Text>
                                            </Td>
                                            <Td borderColor="gray.800">
                                                <Text fontSize="sm" color="green.400" fontWeight="500">
                                                    {professional.professionDetails?.consultationFee
                                                        ? formatCurrency(professional.professionDetails.consultationFee)
                                                        : 'Not set'}
                                                </Text>
                                            </Td>
                                            <Td borderColor="gray.800">
                                                {getStatusBadge(professional.professionDetails?.approvalStatus)}
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
                                                        <MenuItem
                                                            bg="gray.800"
                                                            _hover={{ bg: 'gray.700' }}
                                                            icon={<FileText size={14} />}
                                                            onClick={() => handleViewDocuments(professional)}
                                                        >
                                                            View Documents
                                                        </MenuItem>
                                                        {professional.professionDetails?.approvalStatus === ApprovalStatus.PENDING && (
                                                            <>
                                                                <MenuItem
                                                                    bg="gray.800"
                                                                    _hover={{ bg: 'gray.700' }}
                                                                    icon={<ShieldCheck size={14} />}
                                                                    color="green.400"
                                                                    onClick={() => handleVerify(professional.id, ApprovalStatus.APPROVED)}
                                                                    isDisabled={verifyMutation.isPending}
                                                                >
                                                                    Approve
                                                                </MenuItem>
                                                                <MenuItem
                                                                    bg="gray.800"
                                                                    _hover={{ bg: 'gray.700' }}
                                                                    icon={<XCircle size={14} />}
                                                                    color="red.400"
                                                                    onClick={() => handleVerify(professional.id, ApprovalStatus.REJECTED)}
                                                                    isDisabled={verifyMutation.isPending}
                                                                >
                                                                    Reject
                                                                </MenuItem>
                                                            </>
                                                        )}
                                                        {professional.professionDetails?.approvalStatus === ApprovalStatus.APPROVED && (
                                                            <MenuItem
                                                                bg="gray.800"
                                                                _hover={{ bg: 'gray.700' }}
                                                                color="red.400"
                                                                icon={<XCircle size={14} />}
                                                                onClick={() => handleVerify(professional.id, ApprovalStatus.REJECTED)}
                                                            >
                                                                Revoke Approval
                                                            </MenuItem>
                                                        )}
                                                        {professional.professionDetails?.approvalStatus === ApprovalStatus.REJECTED && (
                                                            <MenuItem
                                                                bg="gray.800"
                                                                _hover={{ bg: 'gray.700' }}
                                                                color="green.400"
                                                                icon={<ShieldCheck size={14} />}
                                                                onClick={() => handleVerify(professional.id, ApprovalStatus.APPROVED)}
                                                                isDisabled={verifyMutation.isPending}
                                                            >
                                                                Re-Approve
                                                            </MenuItem>
                                                        )}
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

            {/* Document Viewer Modal */}
            <Modal isOpen={isOpen} onClose={onClose} size="xl">
                <ModalOverlay />
                <ModalContent bg="gray.900" borderColor="gray.700">
                    <ModalHeader color="gray.100">
                        Professional Documents
                        {selectedDoctor && (
                            <Text fontSize="sm" color="gray.400" fontWeight="normal">
                                Dr. {selectedDoctor.firstName} {selectedDoctor.lastName}
                            </Text>
                        )}
                    </ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        {selectedDoctor && (
                            <VStack spacing={4} align="stretch">
                                {/* Professional Info */}
                                <Box p={4} bg="gray.800" borderRadius="md">
                                    <SimpleGrid columns={2} spacing={4}>
                                        <Box>
                                            <Text fontSize="xs" color="gray.500">License Number</Text>
                                            <Text color="gray.100">{selectedDoctor.professionDetails?.medicalLicenseNumber || 'N/A'}</Text>
                                        </Box>
                                        <Box>
                                            <Text fontSize="xs" color="gray.500">Specialty</Text>
                                            <Text color="gray.100">{selectedDoctor.professionDetails?.specialty || 'General'}</Text>
                                        </Box>
                                        <Box>
                                            <Text fontSize="xs" color="gray.500">Institution</Text>
                                            <Text color="gray.100">{selectedDoctor.professionDetails?.medicalInstitution || 'N/A'}</Text>
                                        </Box>
                                        <Box>
                                            <Text fontSize="xs" color="gray.500">Qualification</Text>
                                            <Text color="gray.100">{selectedDoctor.professionDetails?.highestQualification || 'N/A'}</Text>
                                        </Box>
                                        <Box>
                                            <Text fontSize="xs" color="gray.500">Experience</Text>
                                            <Text color="gray.100">
                                                {selectedDoctor.professionDetails?.yearOfExperience
                                                    ? `${selectedDoctor.professionDetails.yearOfExperience} years`
                                                    : 'N/A'}
                                            </Text>
                                        </Box>
                                        <Box>
                                            <Text fontSize="xs" color="gray.500">Languages</Text>
                                            <Text color="gray.100">{selectedDoctor.professionDetails?.languageSpoken || 'N/A'}</Text>
                                        </Box>
                                    </SimpleGrid>
                                </Box>

                                <Divider borderColor="gray.700" />

                                {/* Documents */}
                                <Text fontWeight="600" color="gray.100">Uploaded Documents</Text>

                                <SimpleGrid columns={1} spacing={3}>
                                    {/* Medical License */}
                                    <Box p={3} bg="gray.800" borderRadius="md">
                                        <Flex justify="space-between" align="center">
                                            <HStack>
                                                <Icon as={FileText} color="green.400" />
                                                <Text color="gray.100">Medical License</Text>
                                            </HStack>
                                            {selectedDoctor.professionDetails?.medicalLicense ? (
                                                <Link href={selectedDoctor.professionDetails.medicalLicense} isExternal>
                                                    <Button size="xs" colorScheme="purple" rightIcon={<ExternalLink size={12} />}>
                                                        View
                                                    </Button>
                                                </Link>
                                            ) : (
                                                <Badge colorScheme="red">Not Uploaded</Badge>
                                            )}
                                        </Flex>
                                    </Box>

                                    {/* Government ID */}
                                    <Box p={3} bg="gray.800" borderRadius="md">
                                        <Flex justify="space-between" align="center">
                                            <HStack>
                                                <Icon as={FileText} color="blue.400" />
                                                <Text color="gray.100">Government ID</Text>
                                            </HStack>
                                            {selectedDoctor.professionDetails?.governmentId ? (
                                                <Link href={selectedDoctor.professionDetails.governmentId} isExternal>
                                                    <Button size="xs" colorScheme="purple" rightIcon={<ExternalLink size={12} />}>
                                                        View
                                                    </Button>
                                                </Link>
                                            ) : (
                                                <Badge colorScheme="red">Not Uploaded</Badge>
                                            )}
                                        </Flex>
                                    </Box>

                                    {/* Professional Certificate */}
                                    <Box p={3} bg="gray.800" borderRadius="md">
                                        <Flex justify="space-between" align="center">
                                            <HStack>
                                                <Icon as={FileText} color="purple.400" />
                                                <Text color="gray.100">Professional Certificate</Text>
                                            </HStack>
                                            {selectedDoctor.professionDetails?.professionalCertificate ? (
                                                <Link href={selectedDoctor.professionDetails.professionalCertificate} isExternal>
                                                    <Button size="xs" colorScheme="purple" rightIcon={<ExternalLink size={12} />}>
                                                        View
                                                    </Button>
                                                </Link>
                                            ) : (
                                                <Badge colorScheme="gray">Not Uploaded</Badge>
                                            )}
                                        </Flex>
                                    </Box>
                                </SimpleGrid>

                                {/* Bio */}
                                {selectedDoctor.professionDetails?.professionalBio && (
                                    <>
                                        <Divider borderColor="gray.700" />
                                        <Box>
                                            <Text fontSize="xs" color="gray.500" mb={1}>Professional Bio</Text>
                                            <Text color="gray.300" fontSize="sm">
                                                {selectedDoctor.professionDetails.professionalBio}
                                            </Text>
                                        </Box>
                                    </>
                                )}
                            </VStack>
                        )}
                    </ModalBody>
                    <ModalFooter>
                        {selectedDoctor?.professionDetails?.approvalStatus === ApprovalStatus.PENDING && (
                            <>
                                <Button
                                    colorScheme="red"
                                    variant="outline"
                                    mr={3}
                                    onClick={() => handleVerify(selectedDoctor.id, ApprovalStatus.REJECTED)}
                                    isLoading={verifyMutation.isPending}
                                >
                                    Reject
                                </Button>
                                <Button
                                    colorScheme="green"
                                    onClick={() => handleVerify(selectedDoctor.id, ApprovalStatus.APPROVED)}
                                    isLoading={verifyMutation.isPending}
                                >
                                    Approve
                                </Button>
                            </>
                        )}
                        {selectedDoctor?.professionDetails?.approvalStatus !== ApprovalStatus.PENDING && (
                            <Button variant="ghost" onClick={onClose}>Close</Button>
                        )}
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </Box>
    );
};

export default HealthProfessionalsPage;
