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
    SimpleGrid,
    Select,
    Table,
    Thead,
    Tbody,
    Tr,
    Th,
    Td,
    Avatar,
    Spinner,
    Card,
    CardBody,
    Link,
} from '@chakra-ui/react';
import { useQuery } from '@tanstack/react-query';
import {
    MessageCircle,
    Video,
    Clock,
    CheckCircle,
    Download,
    Radio,
    Calendar,
    XCircle,
    ExternalLink,
    Phone,
} from 'lucide-react';
import { healthApi, Appointment, ConsultationStatus, ConsultationType } from '../../api/health.api';
import { formatCurrency } from '../../utils/formatters';
import { useLocationFilter, matchesLocationFilter } from '../../context/LocationContext';

export const ConsultationsPage: React.FC = () => {
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const { selectedLocation } = useLocationFilter();

    // Fetch all appointments from API
    const { data: appointmentsData, isLoading, isError } = useQuery({
        queryKey: ['appointments', statusFilter],
        queryFn: () => healthApi.getAllAppointments(
            statusFilter !== 'all' ? statusFilter as ConsultationStatus : undefined
        ),
    });

    // Fetch appointment statistics
    const { data: statsData } = useQuery({
        queryKey: ['appointmentStats'],
        queryFn: () => healthApi.getAllAppointmentsStats(),
    });

    const allConsultations = appointmentsData?.data || [];
    const stats = statsData?.data;

    // Filter by location
    const consultations = allConsultations.filter((appointment: Appointment) => {
        const patientLocation = appointment.patient?.location?.state || appointment.patient?.location?.address || '';
        const doctorLocation = appointment.doctor?.location?.state || appointment.doctor?.location?.address || '';
        return matchesLocationFilter(patientLocation, selectedLocation) ||
            matchesLocationFilter(doctorLocation, selectedLocation);
    });

    // Calculate stats from API or fallback to counting
    const totalConsultations = stats?.total || consultations.length;
    const ongoingCount = stats?.ongoing || consultations.filter((c: Appointment) => c.status === ConsultationStatus.ONGOING).length;
    const scheduledCount = stats?.scheduled || consultations.filter((c: Appointment) => c.status === ConsultationStatus.SCHEDULED || c.status === ConsultationStatus.BOOKED).length;
    const completedCount = stats?.completed || consultations.filter((c: Appointment) => c.status === ConsultationStatus.COMPLETED).length;
    const cancelledCount = stats?.cancelled || consultations.filter((c: Appointment) => c.status === ConsultationStatus.CANCELLED).length;
    const completionRate = totalConsultations > 0 ? Math.round((completedCount / totalConsultations) * 100) : 0;

    const getStatusBadge = (status?: ConsultationStatus) => {
        switch (status) {
            case ConsultationStatus.COMPLETED:
                return <Badge colorScheme="green" variant="subtle">Completed</Badge>;
            case ConsultationStatus.ONGOING:
                return <Badge colorScheme="blue" variant="solid">Ongoing</Badge>;
            case ConsultationStatus.SCHEDULED:
            case ConsultationStatus.BOOKED:
                return <Badge colorScheme="purple" variant="subtle">Scheduled</Badge>;
            case ConsultationStatus.PENDING:
                return <Badge colorScheme="yellow" variant="subtle">Pending</Badge>;
            case ConsultationStatus.CANCELLED:
                return <Badge colorScheme="gray" variant="subtle">Cancelled</Badge>;
            case ConsultationStatus.REJECTED:
                return <Badge colorScheme="red" variant="subtle">Rejected</Badge>;
            default:
                return <Badge colorScheme="gray" variant="subtle">{status || 'Unknown'}</Badge>;
        }
    };

    const getModeIcon = (type?: ConsultationType) => {
        switch (type) {
            case ConsultationType.VIDEO:
                return <Icon as={Video} color="purple.400" boxSize={4} />;
            case ConsultationType.CHAT:
                return <Icon as={MessageCircle} color="blue.400" boxSize={4} />;
            case ConsultationType.AUDIO:
                return <Icon as={Phone} color="green.400" boxSize={4} />;
            default:
                return <Icon as={Calendar} color="gray.400" boxSize={4} />;
        }
    };

    const formatTime = (startTime?: string, endTime?: string) => {
        if (!startTime) return 'N/A';
        if (endTime) return `${startTime} - ${endTime}`;
        return startTime;
    };

    return (
        <Box>
            {/* Header */}
            <Flex justify="space-between" align="center" mb={6}>
                <Heading size="lg" color="gray.100">
                    Consultations
                </Heading>
            </Flex>

            {/* Stats Cards */}
            <SimpleGrid columns={{ base: 2, md: 5 }} spacing={4} mb={6}>
                <Card bg="gray.900" borderColor="gray.800" borderWidth="1px">
                    <CardBody py={4}>
                        <Flex justify="space-between" align="flex-start">
                            <Box>
                                <Text fontSize="xs" color="gray.500">Total Consultations</Text>
                                <Text fontSize="2xl" fontWeight="bold" color="gray.100">{totalConsultations}</Text>
                                <Text fontSize="xs" color="gray.500">All time</Text>
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
                                <Text fontSize="2xl" fontWeight="bold" color="blue.400">{ongoingCount}</Text>
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
                                <Text fontSize="xs" color="gray.500">Scheduled</Text>
                                <Text fontSize="2xl" fontWeight="bold" color="purple.400">{scheduledCount}</Text>
                                <Text fontSize="xs" color="gray.500">Upcoming</Text>
                            </Box>
                            <Icon as={Clock} color="orange.400" boxSize={5} />
                        </Flex>
                    </CardBody>
                </Card>

                <Card bg="gray.900" borderColor="gray.800" borderWidth="1px">
                    <CardBody py={4}>
                        <Flex justify="space-between" align="flex-start">
                            <Box>
                                <Text fontSize="xs" color="gray.500">Completed</Text>
                                <Text fontSize="2xl" fontWeight="bold" color="green.400">{completedCount}</Text>
                                <Text fontSize="xs" color="green.400">{completionRate}% rate</Text>
                            </Box>
                            <Icon as={CheckCircle} color="green.400" boxSize={5} />
                        </Flex>
                    </CardBody>
                </Card>

                <Card bg="gray.900" borderColor="gray.800" borderWidth="1px">
                    <CardBody py={4}>
                        <Flex justify="space-between" align="flex-start">
                            <Box>
                                <Text fontSize="xs" color="gray.500">Cancelled</Text>
                                <Text fontSize="2xl" fontWeight="bold" color="red.400">{cancelledCount}</Text>
                                <Text fontSize="xs" color="gray.500">Not completed</Text>
                            </Box>
                            <Icon as={XCircle} color="red.400" boxSize={5} />
                        </Flex>
                    </CardBody>
                </Card>
            </SimpleGrid>

            {/* Filters and Actions */}
            <Flex justify="space-between" align={{ base: 'start', md: 'center' }} mb={4} flexDir={{ base: 'column', md: 'row' }} gap={3}>
                <Flex gap={2} flexWrap="wrap" align="center">
                    <Select
                        w={{ base: '110px', sm: '130px' }}
                        size="sm"
                        bg="gray.800"
                        borderColor="gray.700"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                    >
                        <option value="all">All Status</option>
                        <option value={ConsultationStatus.BOOKED}>Booked</option>
                        <option value={ConsultationStatus.ONGOING}>Ongoing</option>
                        <option value={ConsultationStatus.COMPLETED}>Completed</option>
                        <option value={ConsultationStatus.CANCELLED}>Cancelled</option>
                    </Select>
                    <Input
                        type="date"
                        size="sm"
                        bg="gray.800"
                        borderColor="gray.700"
                        w={{ base: '140px', sm: '150px' }}
                    />
                </Flex>
                <HStack spacing={2} flexWrap="wrap">
                    <Button size="sm" variant="ghost" leftIcon={<Download size={14} />}>
                        Export CSV
                    </Button>
                    <Button
                        size="sm"
                        colorScheme="green"
                        leftIcon={<Radio size={14} />}
                    >
                        Live Monitor
                    </Button>
                </HStack>
            </Flex>

            {/* Table */}
            <Box bg="gray.900" borderRadius="xl" borderWidth="1px" borderColor="gray.800" overflow="hidden">
                <Flex justify="space-between" align="center" p={4} borderBottomWidth="1px" borderColor="gray.800">
                    <Text fontWeight="600" color="gray.100">Consultations</Text>
                    <Text fontSize="sm" color="gray.500">{consultations.length} consultations</Text>
                </Flex>

                {isLoading ? (
                    <Flex justify="center" py={12}>
                        <Spinner size="lg" color="purple.500" />
                    </Flex>
                ) : isError ? (
                    <Flex justify="center" py={12}>
                        <Text color="red.400">Failed to load consultations. Make sure the backend is running.</Text>
                    </Flex>
                ) : (
                    <Box overflowX="auto">
                        <Table variant="simple" size="sm">
                            <Thead>
                                <Tr>
                                    <Th borderColor="gray.800" color="gray.500">Consultation ID</Th>
                                    <Th borderColor="gray.800" color="gray.500">Patient</Th>
                                    <Th borderColor="gray.800" color="gray.500">Professional</Th>
                                    <Th borderColor="gray.800" color="gray.500">Type</Th>
                                    <Th borderColor="gray.800" color="gray.500">Date</Th>
                                    <Th borderColor="gray.800" color="gray.500">Time</Th>
                                    <Th borderColor="gray.800" color="gray.500">Fee</Th>
                                    <Th borderColor="gray.800" color="gray.500">Status</Th>
                                    <Th borderColor="gray.800" color="gray.500">Meeting</Th>
                                </Tr>
                            </Thead>
                            <Tbody>
                                {consultations.length === 0 ? (
                                    <Tr>
                                        <Td colSpan={9} textAlign="center" py={8} borderColor="gray.800">
                                            <Text color="gray.500">No consultations found</Text>
                                        </Td>
                                    </Tr>
                                ) : (
                                    consultations.map((consultation: Appointment) => (
                                        <Tr key={consultation.id} _hover={{ bg: 'gray.800' }}>
                                            <Td borderColor="gray.800">
                                                <Text fontSize="sm" color="purple.400" fontWeight="500">
                                                    {consultation.id}
                                                </Text>
                                            </Td>
                                            <Td borderColor="gray.800">
                                                <HStack spacing={3}>
                                                    <Avatar
                                                        size="xs"
                                                        name={`${consultation.patient?.firstName || ''} ${consultation.patient?.lastName || ''}`}
                                                        bg="blue.500"
                                                    />
                                                    <Box>
                                                        <Text fontSize="sm" color="gray.100">
                                                            {consultation.patient?.firstName} {consultation.patient?.lastName}
                                                        </Text>
                                                        <Text fontSize="xs" color="gray.500">
                                                            {consultation.patient?.mobile || consultation.patient?.email}
                                                        </Text>
                                                    </Box>
                                                </HStack>
                                            </Td>
                                            <Td borderColor="gray.800">
                                                <Box>
                                                    <Text fontSize="sm" color="gray.100">
                                                        Dr. {consultation.doctor?.firstName} {consultation.doctor?.lastName}
                                                    </Text>
                                                    <Text fontSize="xs" color="gray.500">
                                                        {consultation.doctor?.professionDetails?.specialty || 'General'}
                                                    </Text>
                                                </Box>
                                            </Td>
                                            <Td borderColor="gray.800">
                                                <HStack spacing={2}>
                                                    {getModeIcon(consultation.consultationType)}
                                                    <Text fontSize="sm" color="gray.400">
                                                        {consultation.consultationType || 'Standard'}
                                                    </Text>
                                                </HStack>
                                            </Td>
                                            <Td borderColor="gray.800">
                                                <Text fontSize="sm" color="gray.400">
                                                    {consultation.date
                                                        ? new Date(consultation.date).toLocaleDateString()
                                                        : 'N/A'}
                                                </Text>
                                            </Td>
                                            <Td borderColor="gray.800">
                                                <Text fontSize="sm" color="gray.400">
                                                    {formatTime(consultation.startTime, consultation.endTime)}
                                                </Text>
                                            </Td>
                                            <Td borderColor="gray.800">
                                                <Text fontSize="sm" color="green.400" fontWeight="500">
                                                    {consultation.consultationAmount
                                                        ? formatCurrency(Number(consultation.consultationAmount))
                                                        : consultation.doctor?.professionDetails?.consultationFee
                                                            ? formatCurrency(consultation.doctor.professionDetails.consultationFee)
                                                            : 'N/A'}
                                                </Text>
                                            </Td>
                                            <Td borderColor="gray.800">
                                                {getStatusBadge(consultation.status)}
                                            </Td>
                                            <Td borderColor="gray.800">
                                                {consultation.meetingLink ? (
                                                    <Link href={consultation.meetingLink} isExternal>
                                                        <Badge colorScheme="blue" cursor="pointer">
                                                            Join <ExternalLink size={10} style={{ display: 'inline', marginLeft: 4 }} />
                                                        </Badge>
                                                    </Link>
                                                ) : (
                                                    <Text fontSize="xs" color="gray.500">-</Text>
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
