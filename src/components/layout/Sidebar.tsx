import React, { useState } from 'react';
import {
    Box,
    Flex,
    VStack,
    Text,
    Icon,
    Collapse,
    useDisclosure,
    Tooltip,
    Image,
} from '@chakra-ui/react';
import { Link, useLocation } from 'react-router-dom';
import {
    LayoutDashboard,
    ShoppingBag,
    Utensils,
    Pill,
    ShoppingCart,
    Stethoscope,
    Truck,
    Users,
    Megaphone,
    HeadphonesIcon,
    BarChart3,
    Settings,
    FileText,
    ChevronDown,
    ChevronRight,
    Store,
} from 'lucide-react';
import { NAV_ITEMS } from '../../utils/constants';

const iconMap: Record<string, React.ElementType> = {
    LayoutDashboard,
    ShoppingBag,
    Utensils,
    Pill,
    ShoppingCart,
    Stethoscope,
    Truck,
    Users,
    Megaphone,
    HeadphonesIcon,
    BarChart3,
    Settings,
    FileText,
    Store,
};

interface NavItemProps {
    label: string;
    path?: string;
    icon: string;
    children?: { label: string; path: string }[];
    isCollapsed?: boolean;
    defaultOpen?: boolean;
    onCloseMobile?: () => void;
}

const NavItem: React.FC<NavItemProps> = ({ label, path, icon, children, isCollapsed, defaultOpen = false, onCloseMobile }) => {
    const location = useLocation();
    const IconComponent = iconMap[icon] || LayoutDashboard;

    const isActive = path ? location.pathname === path :
        children?.some(child => location.pathname === child.path);
    const hasChildren = children && children.length > 0;
    const isLink = path && !hasChildren;

    // Auto-expand if any child is active, otherwise use defaultOpen
    const hasActiveChild = children?.some(child => location.pathname === child.path);
    const { isOpen, onToggle } = useDisclosure({ defaultIsOpen: hasActiveChild || defaultOpen });

    const handleClick = () => {
        if (hasChildren) {
            onToggle();
        }
    };

    const handleLinkClick = () => {
        // Close mobile sidebar when any link is clicked
        onCloseMobile?.();
    };

    const content = (
        <Flex
            align="center"
            px={3}
            py={2.5}
            cursor="pointer"
            borderRadius="lg"
            bg={isActive ? 'whiteAlpha.100' : 'transparent'}
            color={isActive ? 'brand.accent.500' : 'gray.400'}
            _hover={{
                bg: 'whiteAlpha.50',
                color: 'gray.100',
            }}
            transition="all 0.2s"
            onClick={isLink ? handleLinkClick : handleClick}
            as={isLink ? Link : 'div'}
            {...(isLink ? { to: path } : {})}
            w="full"
        >
            <Icon as={IconComponent} boxSize={5} />
            {!isCollapsed && (
                <>
                    <Text ml={3} fontSize="sm" fontWeight="500" flex={1}>
                        {label}
                    </Text>
                    {hasChildren && (
                        <Icon
                            as={isOpen ? ChevronDown : ChevronRight}
                            boxSize={4}
                            transition="transform 0.2s"
                        />
                    )}
                </>
            )}
        </Flex>
    );

    return (
        <Box w="full">
            {isCollapsed ? (
                <Tooltip label={label} placement="right" hasArrow>
                    {content}
                </Tooltip>
            ) : (
                content
            )}

            {hasChildren && !isCollapsed && (
                <Collapse in={isOpen}>
                    <VStack align="stretch" pl={8} mt={1} spacing={0}>
                        {children.map((child) => (
                            <Flex
                                key={child.path}
                                as={Link}
                                to={child.path}
                                onClick={handleLinkClick}
                                align="center"
                                py={2}
                                px={3}
                                fontSize="sm"
                                color={location.pathname === child.path ? 'brand.accent.500' : 'gray.500'}
                                _hover={{ color: 'gray.200' }}
                                borderRadius="md"
                                transition="all 0.2s"
                            >
                                <Box
                                    w={1.5}
                                    h={1.5}
                                    borderRadius="full"
                                    bg={location.pathname === child.path ? 'brand.accent.500' : 'gray.600'}
                                    mr={2}
                                />
                                {child.label}
                            </Flex>
                        ))}
                    </VStack>
                </Collapse>
            )}
        </Box>
    );
};

interface SidebarProps {
    isCollapsed?: boolean;
    onToggle?: () => void;
    onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isCollapsed = false, onCloseMobile }) => {
    return (
        <Box
            as="aside"
            w={isCollapsed ? '70px' : '260px'}
            minW={isCollapsed ? '70px' : '260px'}
            h="100vh"
            bg="gray.900"
            borderRight="1px solid"
            borderColor="gray.800"
            position="sticky"
            top={0}
            transition="width 0.2s ease"
            overflowY="auto"
            overflowX="hidden"
            css={{
                '&::-webkit-scrollbar': {
                    width: '4px',
                },
                '&::-webkit-scrollbar-track': {
                    background: 'transparent',
                },
                '&::-webkit-scrollbar-thumb': {
                    background: '#374151',
                    borderRadius: '2px',
                },
            }}
        >
            {/* Logo */}
            <Flex
                align="center"
                justify={isCollapsed ? 'center' : 'flex-start'}
                h="64px"
                px={isCollapsed ? 2 : 4}
                borderBottom="1px solid"
                borderColor="gray.800"
            >
                <Flex align="center" gap={2}>
                    <Box
                        w={8}
                        h={8}
                        borderRadius="lg"
                        overflow="hidden"
                    >
                        <img
                            src="/assets/logo.png"
                            alt="Cushy Access Logo"
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                    </Box>
                    {!isCollapsed && (
                        <Box>
                            <Text
                                fontSize="lg"
                                fontWeight="bold"
                                bgGradient="linear(to-r, brand.primary.400, brand.accent.500)"
                                bgClip="text"
                            >
                                Cushy Access
                            </Text>
                            <Text fontSize="xs" color="gray.500" mt={-1}>
                                Admin Dashboard
                            </Text>
                        </Box>
                    )}
                </Flex>
            </Flex>

            {/* Navigation */}
            <VStack align="stretch" spacing={0.5} p={3}>
                {NAV_ITEMS.map((item) => (
                    <NavItem
                        key={item.label}
                        label={item.label}
                        path={'path' in item ? item.path : undefined}
                        icon={item.icon}
                        children={'children' in item ? (item.children as unknown as { label: string; path: string }[]) : undefined}
                        isCollapsed={isCollapsed}
                        defaultOpen={item.label === 'Merchants'}
                        onCloseMobile={onCloseMobile}
                    />
                ))}
            </VStack>
        </Box>
    );
};

export default Sidebar;
