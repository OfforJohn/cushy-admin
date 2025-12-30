import React, { useState } from 'react';
import {
    Flex,
    Input,
    InputGroup,
    InputLeftElement,
    Menu,
    MenuButton,
    MenuList,
    MenuItem,
    MenuDivider,
    Button,
    Avatar,
    Text,
    HStack,
    Icon,
    Badge,
    IconButton,
    Box,
    Select,
    VStack,
    Spinner,
} from '@chakra-ui/react';
import {
    Search,
    Bell,
    ChevronDown,
    LogOut,
    Menu as MenuIcon,
    MapPin,
    Tag,
    Megaphone,
    ShoppingBag,
    Store,
    Wallet,
    Clock,
    UserCheck,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../../context/AuthContext';
import { formatFullName } from '../../utils/formatters';
import { ordersApi } from '../../api/orders.api';
import { storesApi } from '../../api/stores.api';

interface TopBarProps {
    onToggleSidebar?: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({ onToggleSidebar }) => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [isNotificationOpen, setIsNotificationOpen] = useState(false);

    // Only fetch when notification menu is opened - saves server resources!
    const { data: ordersData, isLoading: ordersLoading } = useQuery({
        queryKey: ['ordersNotification'],
        queryFn: () => ordersApi.getAllOrders(),
        enabled: isNotificationOpen, // Only fetch when menu is open
    });

    const { data: storesData, isLoading: storesLoading } = useQuery({
        queryKey: ['storesNotification'],
        queryFn: () => storesApi.getStores(),
        enabled: isNotificationOpen, // Only fetch when menu is open
    });

    // Calculate notification counts
    const orders = ordersData?.data || [];
    const stores = storesData?.data || [];

    const pendingOrders = orders.filter(o => {
        if (!o.orderTracking || o.orderTracking.length === 0) return true;
        const sorted = [...o.orderTracking].sort((a: any, b: any) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        const status = (sorted[0]?.orderStatus || sorted[0]?.status || 'PENDING').toUpperCase();
        return status === 'PENDING' || status === 'ACKNOWLEDGED';
    }).length;

    const unverifiedMerchants = stores.filter(s => !s.isVerified).length;
    const totalNotifications = pendingOrders + unverifiedMerchants;

    return (
        <Flex
            as="header"
            h="64px"
            px={6}
            align="center"
            justify="space-between"
            bg="gray.900"
            borderBottom="1px solid"
            borderColor="gray.800"
            position="sticky"
            top={0}
            zIndex={100}
        >
            {/* Left section */}
            <HStack spacing={4}>
                <IconButton
                    aria-label="Toggle sidebar"
                    icon={<Icon as={MenuIcon} />}
                    variant="ghost"
                    size="sm"
                    onClick={onToggleSidebar}
                />

                {/* Search */}
                <InputGroup w={{ base: '200px', md: '320px' }}>
                    <InputLeftElement>
                        <Icon as={Search} color="gray.500" boxSize={4} />
                    </InputLeftElement>
                    <Input
                        placeholder="Search orders, users, vendors..."
                        variant="filled"
                        bg="gray.800"
                        border="1px solid"
                        borderColor="gray.700"
                        _hover={{ borderColor: 'gray.600' }}
                        _focus={{ borderColor: 'brand.primary.500', bg: 'gray.800' }}
                        fontSize="sm"
                    />
                </InputGroup>

                {/* City Filter */}
                <HStack
                    bg="gray.800"
                    px={3}
                    py={2}
                    borderRadius="lg"
                    border="1px solid"
                    borderColor="gray.700"
                    display={{ base: 'none', md: 'flex' }}
                >
                    <Icon as={MapPin} color="brand.accent.500" boxSize={4} />
                    <Select
                        variant="unstyled"
                        size="sm"
                        defaultValue="all"
                        w="auto"
                        cursor="pointer"
                        fontWeight="500"
                    >
                        <option value="all">All Locations</option>
                        <option value="minna">Minna</option>
                        <option value="abuja">Abuja</option>
                        <option value="lagos">Lagos</option>
                    </Select>
                </HStack>
            </HStack>

            {/* Right section */}
            <HStack spacing={3}>
                {/* Quick Actions */}
                <Menu>
                    <MenuButton
                        as={Button}
                        variant="ghost"
                        size="sm"
                        rightIcon={<ChevronDown size={14} />}
                        display={{ base: 'none', md: 'flex' }}
                    >
                        Quick Actions
                    </MenuButton>
                    <MenuList bg="gray.800" borderColor="gray.700">
                        <MenuItem
                            bg="gray.800"
                            _hover={{ bg: 'gray.700' }}
                            icon={<ShoppingBag size={16} />}
                            onClick={() => navigate('/orders')}
                        >
                            View Orders
                        </MenuItem>
                        <MenuItem
                            bg="gray.800"
                            _hover={{ bg: 'gray.700' }}
                            icon={<Store size={16} />}
                            onClick={() => navigate('/merchants')}
                        >
                            View Merchants
                        </MenuItem>
                        <MenuDivider borderColor="gray.700" />
                        <MenuItem
                            bg="gray.800"
                            _hover={{ bg: 'gray.700' }}
                            icon={<Tag size={16} />}
                            onClick={() => navigate('/settings')}
                        >
                            Create Coupon
                        </MenuItem>
                        <MenuItem
                            bg="gray.800"
                            _hover={{ bg: 'gray.700' }}
                            icon={<Megaphone size={16} />}
                            isDisabled
                        >
                            Send Announcement
                        </MenuItem>
                        <MenuDivider borderColor="gray.700" />
                        <MenuItem
                            bg="gray.800"
                            _hover={{ bg: 'gray.700' }}
                            icon={<Wallet size={16} />}
                            onClick={() => navigate('/users-wallet')}
                        >
                            Run Payouts
                        </MenuItem>
                    </MenuList>
                </Menu>

                {/* Notifications */}
                <Menu onOpen={() => setIsNotificationOpen(true)} onClose={() => setIsNotificationOpen(false)}>
                    <MenuButton
                        as={IconButton}
                        aria-label="Notifications"
                        icon={
                            <Box position="relative">
                                <Icon as={Bell} boxSize={5} />
                                {totalNotifications > 0 && (
                                    <Badge
                                        position="absolute"
                                        top={-1}
                                        right={-1}
                                        colorScheme="red"
                                        borderRadius="full"
                                        minW={4}
                                        h={4}
                                        fontSize="xs"
                                        display="flex"
                                        alignItems="center"
                                        justifyContent="center"
                                    >
                                        {totalNotifications > 9 ? '9+' : totalNotifications}
                                    </Badge>
                                )}
                            </Box>
                        }
                        variant="ghost"
                        size="sm"
                    />
                    <MenuList bg="gray.800" borderColor="gray.700" minW="280px">
                        <Box px={3} py={2} borderBottomWidth="1px" borderColor="gray.700">
                            <Text fontSize="sm" fontWeight="600" color="gray.100">Notifications</Text>
                        </Box>
                        {(ordersLoading || storesLoading) ? (
                            <Box py={4} textAlign="center">
                                <Spinner size="sm" color="purple.400" />
                            </Box>
                        ) : totalNotifications === 0 ? (
                            <Box py={4} textAlign="center">
                                <Text fontSize="sm" color="gray.500">No new notifications</Text>
                            </Box>
                        ) : (
                            <>
                                {pendingOrders > 0 && (
                                    <MenuItem
                                        bg="gray.800"
                                        _hover={{ bg: 'gray.700' }}
                                        onClick={() => navigate('/orders')}
                                    >
                                        <HStack spacing={3} w="full">
                                            <Box p={2} borderRadius="md" bg="rgba(236, 201, 75, 0.2)">
                                                <Icon as={Clock} color="yellow.400" boxSize={4} />
                                            </Box>
                                            <VStack align="start" spacing={0} flex={1}>
                                                <Text fontSize="sm" color="gray.100">{pendingOrders} Pending Orders</Text>
                                                <Text fontSize="xs" color="gray.500">Awaiting action</Text>
                                            </VStack>
                                        </HStack>
                                    </MenuItem>
                                )}
                                {unverifiedMerchants > 0 && (
                                    <MenuItem
                                        bg="gray.800"
                                        _hover={{ bg: 'gray.700' }}
                                        onClick={() => navigate('/merchants/merchant-approval')}
                                    >
                                        <HStack spacing={3} w="full">
                                            <Box p={2} borderRadius="md" bg="rgba(128, 90, 213, 0.2)">
                                                <Icon as={UserCheck} color="purple.400" boxSize={4} />
                                            </Box>
                                            <VStack align="start" spacing={0} flex={1}>
                                                <Text fontSize="sm" color="gray.100">{unverifiedMerchants} Verification Requests</Text>
                                                <Text fontSize="xs" color="gray.500">Merchants awaiting approval</Text>
                                            </VStack>
                                        </HStack>
                                    </MenuItem>
                                )}
                            </>
                        )}
                    </MenuList>
                </Menu>

                {/* Profile Menu */}
                <Menu>
                    <MenuButton
                        as={Button}
                        variant="ghost"
                        size="sm"
                        px={2}
                    >
                        <HStack spacing={2}>
                            <Avatar
                                size="sm"
                                name={formatFullName(user?.firstName, user?.lastName)}
                                bg="brand.primary.500"
                            />
                            <Box textAlign="left" display={{ base: 'none', md: 'block' }}>
                                <Text fontSize="sm" fontWeight="600" color="gray.100">
                                    {formatFullName(user?.firstName, user?.lastName)}
                                </Text>
                                <Text fontSize="xs" color="gray.500">
                                    {user?.userRole || 'Admin'}
                                </Text>
                            </Box>
                            <Icon as={ChevronDown} boxSize={4} color="gray.500" />
                        </HStack>
                    </MenuButton>
                    <MenuList bg="gray.800" borderColor="gray.700">
                        <MenuItem
                            bg="gray.800"
                            _hover={{ bg: 'gray.700' }}
                            icon={<LogOut size={16} />}
                            onClick={logout}
                            color="red.400"
                        >
                            Logout
                        </MenuItem>
                    </MenuList>
                </Menu>
            </HStack>
        </Flex>
    );
};

export default TopBar;
