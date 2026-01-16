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
    Link,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalCloseButton,
    ModalFooter,
    useDisclosure,
    VStack,
    Divider,
} from '@chakra-ui/react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    Clock,
    CheckCircle,
    XCircle,
    Check,
    FileText,
    MoreVertical,
    Eye,
    ArrowUpDown,
    ExternalLink,
    ShieldCheck,
    Users,
} from 'lucide-react';
import { healthApi, Doctor, ApprovalStatus } from '../../api/health.api';
import { useLocationFilter, matchesLocationFilter } from '../../context/LocationContext';

export const LicensesVerificationsPage: React.FC = () => {
    const toast = useToast();
    const queryClient = useQueryClient();
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);

    const [statusFilter, setStatusFilter] = useState('all');
    const [selectedLicenses, setSelectedLicenses] = useState<string[]>([]);
    const { selectedLocation } = useLocationFilter();

    // Fetch doctors with pending verification
    const { data: pendingData, isLoading: pendingLoading } = useQuery({
        queryKey: ['pendingDoctors'],
        queryFn: () => healthApi.getDoctorsWithPendingVerification(),
    });

    // Fetch all doctors for statistics
    const { data: allDoctorsData, isLoading: allLoading } = useQuery({
        queryKey: ['allDoctors'],
        queryFn: () => healthApi.getAllDoctors(),
    });

    // Verify doctor mutation
    const verifyMutation = useMutation({
        mutationFn: ({ doctorId, status }: { doctorId: string; status: ApprovalStatus }) =>
            healthApi.verifyDoctor(doctorId, status),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['pendingDoctors'] });
            queryClient.invalidateQueries({ queryKey: ['allDoctors'] });
            toast({
                title: 'Success',
                description: 'Verification status updated',
                status: 'success',
                duration: 3000,
            });
            setSelectedLicenses([]);
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

    const isLoading = pendingLoading || allLoading;
    const allPendingDoctors = pendingData?.data || [];
    const allDoctorsRaw = allDoctorsData?.data || [];

    // Apply location filter
    const pendingDoctors = allPendingDoctors.filter((d: Doctor) =>
        matchesLocationFilter(d.location?.state || '', selectedLocation)
    );
    const allDoctors = allDoctorsRaw.filter((d: Doctor) =>
        matchesLocationFilter(d.location?.state || '', selectedLocation)
    );

    // Calculate stats
    const pendingCount = pendingDoctors.length;
    const verifiedCount = allDoctors.filter((d: Doctor) => d.professionDetails?.approvalStatus === ApprovalStatus.APPROVED).length;
    const rejectedCount = allDoctors.filter((d: Doctor) => d.professionDetails?.approvalStatus === ApprovalStatus.REJECTED).length;

    // Get filtered list based on status
    const getFilteredDoctors = () => {
        if (statusFilter === 'pending') return pendingDoctors;
        if (statusFilter === 'approved') return allDoctors.filter((d: Doctor) => d.professionDetails?.approvalStatus === ApprovalStatus.APPROVED);
        if (statusFilter === 'rejected') return allDoctors.filter((d: Doctor) => d.professionDetails?.approvalStatus === ApprovalStatus.REJECTED);
        return allDoctors;
    };

    const filteredDoctors = getFilteredDoctors();

    const handleSelectAll = (checked: boolean) => {
        if (checked) {
            setSelectedLicenses(filteredDoctors.map((d: Doctor) => d.id));
        } else {
            setSelectedLicenses([]);
        }
    };

    const handleSelectLicense = (doctorId: string, checked: boolean) => {
        if (checked) {
            setSelectedLicenses([...selectedLicenses, doctorId]);
        } else {
            setSelectedLicenses(selectedLicenses.filter(id => id !== doctorId));
        }
    };

    const handleBulkApprove = () => {
        selectedLicenses.forEach(doctorId => {
            verifyMutation.mutate({ doctorId, status: ApprovalStatus.APPROVED });
        });
    };

    const handleApprove = (doctorId: string) => {
        verifyMutation.mutate({ doctorId, status: ApprovalStatus.APPROVED });
    };

    const handleReject = (doctorId: string) => {
        verifyMutation.mutate({ doctorId, status: ApprovalStatus.REJECTED });
    };

    const handleViewDocuments = (doctor: Doctor) => {
        setSelectedDoctor(doctor);
        onOpen();
    };

    const getStatusBadge = (status?: ApprovalStatus) => {
        switch (status) {
            case ApprovalStatus.APPROVED:
                return <Badge colorScheme="green" variant="subtle">Verified</Badge>;
            case ApprovalStatus.PENDING:
                return <Badge colorScheme="yellow" variant="subtle">Pending</Badge>;
            case ApprovalStatus.REJECTED:
                return <Badge colorScheme="red" variant="subtle">Rejected</Badge>;
            default:
                return <Badge colorScheme="gray" variant="subtle">Unknown</Badge>;
        }
    };

    const formatDate = (dateString?: string) => {
        if (!dateString) return 'N/A';
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
                <Heading size="lg" color="gray.100">
                    Licenses & Verifications
                </Heading>
            </Flex>

            {/* Stats Cards */}
            <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4} mb={6}>
                <Card bg="gray.900" borderColor="gray.800" borderWidth="1px">
                    <CardBody py={4}>
                        <Flex justify="space-between" align="flex-start">
                            <Box>
                                <Text fontSize="xs" color="gray.500">Pending Verification</Text>
                                <Text fontSize="2xl" fontWeight="bold" color="orange.400">{pendingCount}</Text>
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
                                <Text fontSize="xs" color="gray.500">Verified</Text>
                                <Text fontSize="2xl" fontWeight="bold" color="green.400">{verifiedCount}</Text>
                                <Text fontSize="xs" color="green.400">Approved professionals</Text>
                            </Box>
                            <Icon as={CheckCircle} color="green.400" boxSize={5} />
                        </Flex>
                    </CardBody>
                </Card>

                <Card bg="gray.900" borderColor="gray.800" borderWidth="1px">
                    <CardBody py={4}>
                        <Flex justify="space-between" align="flex-start">
                            <Box>
                                <Text fontSize="xs" color="gray.500">Rejected</Text>
                                <Text fontSize="2xl" fontWeight="bold" color="red.400">{rejectedCount}</Text>
                                <Text fontSize="xs" color="red.400">Invalid documents</Text>
                            </Box>
                            <Icon as={XCircle} color="red.400" boxSize={5} />
                        </Flex>
                    </CardBody>
                </Card>

                <Card bg="gray.900" borderColor="gray.800" borderWidth="1px">
                    <CardBody py={4}>
                        <Flex justify="space-between" align="flex-start">
                            <Box>
                                <Text fontSize="xs" color="gray.500">Total Professionals</Text>
                                <Text fontSize="2xl" fontWeight="bold" color="gray.100">{allDoctors.length}</Text>
                                <Text fontSize="xs" color="gray.500">All registered</Text>
                            </Box>
                            <Icon as={Users} color="purple.400" boxSize={5} />
                        </Flex>
                    </CardBody>
                </Card>
            </SimpleGrid>

            {/* Quick Actions */}
            <Flex justify="space-between" align="center" mb={4} flexWrap="wrap" gap={3}>
                <HStack spacing={3}>
                    <Button
                        size="sm"
                        colorScheme="green"
                        leftIcon={<Check size={14} />}
                        isDisabled={selectedLicenses.length === 0 || verifyMutation.isPending}
                        isLoading={verifyMutation.isPending}
                        onClick={handleBulkApprove}
                    >
                        Bulk Approve ({selectedLicenses.length})
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
                        <option value="approved">Verified</option>
                        <option value="rejected">Rejected</option>
                    </Select>
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
                                            isChecked={selectedLicenses.length === filteredDoctors.length && filteredDoctors.length > 0}
                                            isIndeterminate={selectedLicenses.length > 0 && selectedLicenses.length < filteredDoctors.length}
                                            onChange={(e) => handleSelectAll(e.target.checked)}
                                            colorScheme="purple"
                                        />
                                    </Th>
                                    <Th borderColor="gray.800" color="gray.500">Professional</Th>
                                    <Th borderColor="gray.800" color="gray.500">License Number</Th>
                                    <Th borderColor="gray.800" color="gray.500">Specialty</Th>
                                    <Th borderColor="gray.800" color="gray.500">Registered Date</Th>
                                    <Th borderColor="gray.800" color="gray.500">Status</Th>
                                    <Th borderColor="gray.800" color="gray.500">Documents</Th>
                                    <Th borderColor="gray.800" color="gray.500">Actions</Th>
                                </Tr>
                            </Thead>
                            <Tbody>
                                {filteredDoctors.length === 0 ? (
                                    <Tr>
                                        <Td colSpan={8} textAlign="center" py={8} borderColor="gray.800">
                                            <Text color="gray.500">No records found</Text>
                                        </Td>
                                    </Tr>
                                ) : (
                                    filteredDoctors.map((doctor: Doctor) => (
                                        <Tr key={doctor.id} _hover={{ bg: 'gray.800' }}>
                                            <Td borderColor="gray.800">
                                                <Checkbox
                                                    isChecked={selectedLicenses.includes(doctor.id)}
                                                    onChange={(e) => handleSelectLicense(doctor.id, e.target.checked)}
                                                    colorScheme="purple"
                                                />
                                            </Td>
                                            <Td borderColor="gray.800">
                                                <HStack spacing={3}>
                                                    <Avatar
                                                        size="sm"
                                                        name={`${doctor.firstName || ''} ${doctor.lastName || ''}`}
                                                        src={doctor.profilePic}
                                                        bg="purple.500"
                                                    />
                                                    <Box>
                                                        <Text fontWeight="500" color="gray.100">
                                                            Dr. {doctor.firstName} {doctor.lastName}
                                                        </Text>
                                                        <Text fontSize="xs" color="gray.500">{doctor.email}</Text>
                                                    </Box>
                                                </HStack>
                                            </Td>
                                            <Td borderColor="gray.800">
                                                <Text fontSize="sm" color="gray.400">
                                                    {doctor.professionDetails?.medicalLicenseNumber || 'N/A'}
                                                </Text>
                                            </Td>
                                            <Td borderColor="gray.800">
                                                <Badge colorScheme="blue" variant="subtle">
                                                    {doctor.professionDetails?.specialty || 'General'}
                                                </Badge>
                                            </Td>
                                            <Td borderColor="gray.800">
                                                <Text fontSize="sm" color="gray.400">{formatDate(doctor.createdAt)}</Text>
                                            </Td>
                                            <Td borderColor="gray.800">
                                                {getStatusBadge(doctor.professionDetails?.approvalStatus)}
                                            </Td>
                                            <Td borderColor="gray.800">
                                                <HStack spacing={1}>
                                                    {doctor.professionDetails?.medicalLicense && (
                                                        <Link href={doctor.professionDetails.medicalLicense} isExternal>
                                                            <Badge colorScheme="green" size="sm" cursor="pointer">
                                                                License
                                                            </Badge>
                                                        </Link>
                                                    )}
                                                    {doctor.professionDetails?.governmentId && (
                                                        <Link href={doctor.professionDetails.governmentId} isExternal>
                                                            <Badge colorScheme="blue" size="sm" cursor="pointer">
                                                                ID
                                                            </Badge>
                                                        </Link>
                                                    )}
                                                    {doctor.professionDetails?.professionalCertificate && (
                                                        <Link href={doctor.professionDetails.professionalCertificate} isExternal>
                                                            <Badge colorScheme="purple" size="sm" cursor="pointer">
                                                                Cert
                                                            </Badge>
                                                        </Link>
                                                    )}
                                                    {!doctor.professionDetails?.medicalLicense &&
                                                        !doctor.professionDetails?.governmentId &&
                                                        !doctor.professionDetails?.professionalCertificate && (
                                                            <Text fontSize="xs" color="gray.500">No docs</Text>
                                                        )}
                                                </HStack>
                                            </Td>
                                            <Td borderColor="gray.800">
                                                <HStack spacing={1}>
                                                    {doctor.professionDetails?.approvalStatus === ApprovalStatus.PENDING && (
                                                        <>
                                                            <IconButton
                                                                aria-label="Approve"
                                                                icon={<Check size={14} />}
                                                                size="xs"
                                                                colorScheme="green"
                                                                variant="ghost"
                                                                onClick={() => handleApprove(doctor.id)}
                                                                isDisabled={verifyMutation.isPending}
                                                            />
                                                            <IconButton
                                                                aria-label="Reject"
                                                                icon={<XCircle size={14} />}
                                                                size="xs"
                                                                colorScheme="red"
                                                                variant="ghost"
                                                                onClick={() => handleReject(doctor.id)}
                                                                isDisabled={verifyMutation.isPending}
                                                            />
                                                        </>
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
                                                                onClick={() => handleViewDocuments(doctor)}
                                                            >
                                                                View Details
                                                            </MenuItem>
                                                            {doctor.professionDetails?.approvalStatus === ApprovalStatus.APPROVED && (
                                                                <MenuItem
                                                                    bg="gray.800"
                                                                    _hover={{ bg: 'gray.700' }}
                                                                    icon={<XCircle size={14} />}
                                                                    color="red.400"
                                                                    onClick={() => handleReject(doctor.id)}
                                                                >
                                                                    Revoke Verification
                                                                </MenuItem>
                                                            )}
                                                            {doctor.professionDetails?.approvalStatus === ApprovalStatus.REJECTED && (
                                                                <MenuItem
                                                                    bg="gray.800"
                                                                    _hover={{ bg: 'gray.700' }}
                                                                    icon={<CheckCircle size={14} />}
                                                                    color="green.400"
                                                                    onClick={() => handleApprove(doctor.id)}
                                                                    isDisabled={verifyMutation.isPending}
                                                                >
                                                                    Re-Approve
                                                                </MenuItem>
                                                            )}
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

            {/* Document Viewer Modal */}
            <Modal isOpen={isOpen} onClose={onClose} size="xl">
                <ModalOverlay />
                <ModalContent bg="gray.900" borderColor="gray.700">
                    <ModalHeader color="gray.100">
                        Professional Details
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
                                <Text fontWeight="600" color="gray.100">Verification Documents</Text>

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
                                                        View Document
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
                                                        View Document
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
                                                        View Document
                                                    </Button>
                                                </Link>
                                            ) : (
                                                <Badge colorScheme="gray">Not Uploaded (Optional)</Badge>
                                            )}
                                        </Flex>
                                    </Box>
                                </SimpleGrid>
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
                                    onClick={() => handleReject(selectedDoctor.id)}
                                    isLoading={verifyMutation.isPending}
                                >
                                    Reject
                                </Button>
                                <Button
                                    colorScheme="green"
                                    onClick={() => handleApprove(selectedDoctor.id)}
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

export default LicensesVerificationsPage;
