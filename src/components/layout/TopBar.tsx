import React from 'react';
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
} from '@chakra-ui/react';
import {
    Search,
    Bell,
    ChevronDown,
    LogOut,
    User,
    Settings,
    Menu as MenuIcon,
    MapPin,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { formatFullName } from '../../utils/formatters';

interface TopBarProps {
    onToggleSidebar?: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({ onToggleSidebar }) => {
    const { user, logout } = useAuth();

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
                    <MenuList>
                        <MenuItem>Create Order</MenuItem>
                        <MenuItem>Add Vendor</MenuItem>
                        <MenuItem>Create Coupon</MenuItem>
                        <MenuItem>Send Announcement</MenuItem>
                        <MenuDivider />
                        <MenuItem>Run Payouts</MenuItem>
                    </MenuList>
                </Menu>

                {/* Notifications */}
                <Box position="relative">
                    <IconButton
                        aria-label="Notifications"
                        icon={<Icon as={Bell} boxSize={5} />}
                        variant="ghost"
                        size="sm"
                    />
                    <Badge
                        position="absolute"
                        top={0}
                        right={0}
                        colorScheme="red"
                        borderRadius="full"
                        minW={4}
                        h={4}
                        fontSize="xs"
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                    >
                        3
                    </Badge>
                </Box>

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
                    <MenuList>
                        <MenuItem icon={<User size={16} />}>Profile</MenuItem>
                        <MenuItem icon={<Settings size={16} />}>Settings</MenuItem>
                        <MenuDivider />
                        <MenuItem icon={<LogOut size={16} />} onClick={logout} color="red.400">
                            Logout
                        </MenuItem>
                    </MenuList>
                </Menu>
            </HStack>
        </Flex>
    );
};

export default TopBar;
