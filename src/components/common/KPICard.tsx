import React from 'react';
import { Box, Flex, Text, Icon, Skeleton } from '@chakra-ui/react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { formatCompactCurrency, formatCompactNumber } from '../../utils/formatters';

interface KPICardProps {
    title: string;
    value: number | string;
    previousValue?: number;
    isCurrency?: boolean;
    icon?: React.ElementType;
    iconColor?: string;
    trend?: 'up' | 'down' | 'neutral';
    trendValue?: number;
    isLoading?: boolean;
    subtitle?: string;
}

export const KPICard: React.FC<KPICardProps> = ({
    title,
    value,
    previousValue,
    isCurrency = false,
    icon,
    iconColor = 'brand.accent.500',
    trend,
    trendValue,
    isLoading = false,
    subtitle,
}) => {
    // Calculate trend if not provided
    const calculatedTrend = trend || (
        previousValue !== undefined && typeof value === 'number'
            ? value > previousValue ? 'up' : value < previousValue ? 'down' : 'neutral'
            : undefined
    );

    const trendIcon = calculatedTrend === 'up'
        ? TrendingUp
        : calculatedTrend === 'down'
            ? TrendingDown
            : Minus;

    const trendColor = calculatedTrend === 'up'
        ? 'green.400'
        : calculatedTrend === 'down'
            ? 'red.400'
            : 'gray.500';

    const formattedValue = typeof value === 'number'
        ? isCurrency
            ? formatCompactCurrency(value)
            : formatCompactNumber(value)
        : value;

    return (
        <Box
            bg="gray.900"
            borderRadius="xl"
            border="1px solid"
            borderColor="gray.800"
            p={5}
            position="relative"
            overflow="hidden"
            transition="all 0.2s"
            _hover={{
                borderColor: 'gray.700',
                transform: 'translateY(-2px)',
                boxShadow: 'lg',
            }}
        >
            {/* Background gradient accent */}
            <Box
                position="absolute"
                top={0}
                right={0}
                w="100px"
                h="100px"
                bg={iconColor}
                opacity={0.05}
                borderRadius="full"
                transform="translate(30%, -30%)"
            />

            <Flex justify="space-between" align="flex-start">
                <Box flex={1}>
                    <Text color="gray.500" fontSize="sm" fontWeight="500" mb={1}>
                        {title}
                    </Text>

                    {isLoading ? (
                        <Skeleton height="36px" width="120px" mb={2} />
                    ) : (
                        <Text
                            fontSize="2xl"
                            fontWeight="bold"
                            color="gray.100"
                            mb={1}
                        >
                            {formattedValue}
                        </Text>
                    )}

                    {/* Trend indicator */}
                    {calculatedTrend && !isLoading && (
                        <Flex align="center" gap={1}>
                            <Icon as={trendIcon} color={trendColor} boxSize={3} />
                            {trendValue !== undefined && (
                                <Text color={trendColor} fontSize="xs" fontWeight="600">
                                    {trendValue > 0 ? '+' : ''}{trendValue.toFixed(1)}%
                                </Text>
                            )}
                            <Text color="gray.500" fontSize="xs">
                                {subtitle || 'vs last period'}
                            </Text>
                        </Flex>
                    )}

                    {!calculatedTrend && subtitle && !isLoading && (
                        <Text color="gray.500" fontSize="xs">
                            {subtitle}
                        </Text>
                    )}
                </Box>

                {/* Icon */}
                {icon && (
                    <Flex
                        w={10}
                        h={10}
                        borderRadius="lg"
                        bg={`${iconColor}20`}
                        align="center"
                        justify="center"
                    >
                        <Icon as={icon} boxSize={5} color={iconColor} />
                    </Flex>
                )}
            </Flex>
        </Box>
    );
};

export default KPICard;
