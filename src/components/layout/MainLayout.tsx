import React, { useState } from 'react';
import { Box, Flex, useBreakpointValue, Drawer, DrawerOverlay, DrawerContent, DrawerCloseButton, useDisclosure } from '@chakra-ui/react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';

export const MainLayout: React.FC = () => {
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const isMobile = useBreakpointValue({ base: true, lg: false });
    const { isOpen, onOpen, onClose } = useDisclosure();

    const toggleSidebar = () => {
        if (isMobile) {
            // On mobile, open drawer
            isOpen ? onClose() : onOpen();
        } else {
            // On desktop, collapse/expand
            setIsSidebarCollapsed(!isSidebarCollapsed);
        }
    };

    // Callback for closing mobile sidebar when a menu item is clicked
    const handleMobileMenuClose = () => {
        if (isMobile && isOpen) {
            onClose();
        }
    };

    return (
        <Flex h="100vh" overflow="hidden" bg="gray.950">
            {/* Sidebar - Desktop */}
            {!isMobile && <Sidebar isCollapsed={isSidebarCollapsed} />}

            {/* Sidebar - Mobile Drawer */}
            <Drawer isOpen={isOpen && !!isMobile} placement="left" onClose={onClose} size="xs">
                <DrawerOverlay />
                <DrawerContent bg="gray.900" maxW="260px">
                    <DrawerCloseButton color="gray.400" />
                    <Sidebar isCollapsed={false} onCloseMobile={handleMobileMenuClose} />
                </DrawerContent>
            </Drawer>

            {/* Main content area */}
            <Flex flex={1} direction="column" overflow="hidden">
                <TopBar onToggleSidebar={toggleSidebar} />

                {/* Page content */}
                <Box
                    flex={1}
                    overflow="auto"
                    p={6}
                    css={{
                        '&::-webkit-scrollbar': {
                            width: '8px',
                            height: '8px',
                        },
                        '&::-webkit-scrollbar-track': {
                            background: '#111827',
                        },
                        '&::-webkit-scrollbar-thumb': {
                            background: '#374151',
                            borderRadius: '4px',
                        },
                        '&::-webkit-scrollbar-thumb:hover': {
                            background: '#4b5563',
                        },
                    }}
                >
                    <Outlet />
                </Box>
            </Flex>
        </Flex>
    );
};

export default MainLayout;
