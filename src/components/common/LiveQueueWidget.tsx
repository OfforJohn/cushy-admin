import React from 'react';
import {
    Box,
    Flex,
    VStack,
    HStack,
    Text,
    Badge,
    Icon,
    Skeleton,
} from '@chakra-ui/react';
import { Clock, AlertCircle, CheckCircle } from 'lucide-react';

interface QueueItem {
    id: string;
    title: string;
    subtitle?: string;
    status?: 'urgent' | 'pending' | 'completed';
    time?: string;
    count?: number;
}

interface LiveQueueWidgetProps {
    title: string;
    items: QueueItem[];
    icon?: React.ElementType;
    isLoading?: boolean;
    onItemClick?: (item: QueueItem) => void;
    maxItems?: number;
    showViewAll?: boolean;
    onViewAll?: () => void;
}

export const LiveQueueWidget: React.FC<LiveQueueWidgetProps> = ({
    title,
    items,
    icon,
    isLoading = false,
    onItemClick,
    maxItems = 5,
    showViewAll = true,
    onViewAll,
}) => {
    const displayedItems = items.slice(0, maxItems);
    const hasMore = items.length > maxItems;

    const getStatusIcon = (status?: QueueItem['status']) => {
        switch (status) {
            case 'urgent':
                return { icon: AlertCircle, color: 'red.400' };
            case 'completed':
                return { icon: CheckCircle, color: 'green.400' };
            default:
                return { icon: Clock, color: 'yellow.400' };
        }
    };

    return (
        <Box
            bg="gray.900"
            borderRadius="xl"
            border="1px solid"
            borderColor="gray.800"
            overflow="hidden"
        >
            {/* Header */}
            <Flex
                justify="space-between"
                align="center"
                px={4}
                py={3}
                borderBottom="1px solid"
                borderColor="gray.800"
            >
                <HStack spacing={2}>
                    {icon && <Icon as={icon} color="brand.accent.500" boxSize={4} />}
                    <Text fontWeight="600" color="gray.100">
                        {title}
                    </Text>
                    <Badge
                        colorScheme="purple"
                        borderRadius="full"
                        px={2}
                        fontSize="xs"
                    >
                        {items.length}
                    </Badge>
                </HStack>
                {showViewAll && (
                    <Text
                        fontSize="sm"
                        color="brand.accent.500"
                        cursor="pointer"
                        _hover={{ textDecoration: 'underline' }}
                        onClick={onViewAll}
                    >
                        View all →
                    </Text>
                )}
            </Flex>

            {/* Queue items */}
            <VStack align="stretch" spacing={0} maxH="300px" overflowY="auto">
                {isLoading ? (
                    // Loading state
                    Array.from({ length: 3 }).map((_, i) => (
                        <Flex
                            key={i}
                            px={4}
                            py={3}
                            borderBottom="1px solid"
                            borderColor="gray.800"
                            _last={{ borderBottom: 'none' }}
                        >
                            <VStack align="stretch" flex={1} spacing={1}>
                                <Skeleton height="16px" width="70%" />
                                <Skeleton height="12px" width="40%" />
                            </VStack>
                        </Flex>
                    ))
                ) : displayedItems.length === 0 ? (
                    <Flex
                        px={4}
                        py={8}
                        justify="center"
                        align="center"
                    >
                        <Text color="gray.500" fontSize="sm">
                            No items in queue
                        </Text>
                    </Flex>
                ) : (
                    displayedItems.map((item) => {
                        const statusConfig = getStatusIcon(item.status);

                        return (
                            <Flex
                                key={item.id}
                                px={4}
                                py={3}
                                borderBottom="1px solid"
                                borderColor="gray.800"
                                _last={{ borderBottom: 'none' }}
                                cursor={onItemClick ? 'pointer' : 'default'}
                                _hover={onItemClick ? { bg: 'whiteAlpha.50' } : {}}
                                onClick={() => onItemClick?.(item)}
                                transition="all 0.2s"
                            >
                                {/* Status indicator */}
                                <Flex
                                    w={2}
                                    minW={2}
                                    mr={3}
                                    align="center"
                                    justify="center"
                                >
                                    <Box
                                        w={2}
                                        h={2}
                                        borderRadius="full"
                                        bg={statusConfig.color}
                                    />
                                </Flex>

                                {/* Content */}
                                <VStack align="stretch" flex={1} spacing={0}>
                                    <Text fontSize="sm" fontWeight="500" color="gray.100" noOfLines={1}>
                                        {item.title}
                                    </Text>
                                    {item.subtitle && (
                                        <Text fontSize="xs" color="gray.500" noOfLines={1}>
                                            {item.subtitle}
                                        </Text>
                                    )}
                                </VStack>

                                {/* Meta */}
                                <VStack align="flex-end" spacing={0} ml={2}>
                                    {item.time && (
                                        <Text fontSize="xs" color="gray.500">
                                            {item.time}
                                        </Text>
                                    )}
                                    {item.count !== undefined && (
                                        <Badge
                                            colorScheme="gray"
                                            borderRadius="full"
                                            fontSize="xs"
                                            px={2}
                                        >
                                            {item.count}
                                        </Badge>
                                    )}
                                </VStack>
                            </Flex>
                        );
                    })
                )}
            </VStack>

            {/* More indicator */}
            {hasMore && (
                <Flex
                    justify="center"
                    py={2}
                    borderTop="1px solid"
                    borderColor="gray.800"
                >
                    <Text fontSize="xs" color="gray.500">
                        +{items.length - maxItems} more items
                    </Text>
                </Flex>
            )}
        </Box>
    );
};

export default LiveQueueWidget;
