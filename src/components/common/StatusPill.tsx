import React from 'react';
import { Badge, BadgeProps } from '@chakra-ui/react';
import { STATUS_COLORS } from '../../utils/constants';
import { formatEnumValue } from '../../utils/formatters';

interface StatusPillProps extends Omit<BadgeProps, 'colorScheme'> {
    status: string;
    customColors?: {
        bg: string;
        color: string;
    };
}

export const StatusPill: React.FC<StatusPillProps> = ({
    status,
    customColors,
    ...props
}) => {
    const colors = customColors ||
        STATUS_COLORS[status.toUpperCase() as keyof typeof STATUS_COLORS] ||
        { bg: 'gray.500', color: 'white' };

    return (
        <Badge
            px={2.5}
            py={1}
            borderRadius="full"
            bg={colors.bg}
            color={colors.color}
            fontSize="xs"
            fontWeight="600"
            textTransform="capitalize"
            {...props}
        >
            {formatEnumValue(status)}
        </Badge>
    );
};

// Specific status variants
export const OrderStatusPill: React.FC<{ status: string }> = ({ status }) => (
    <StatusPill status={status} />
);

export const VerificationStatusPill: React.FC<{ isVerified: boolean }> = ({ isVerified }) => (
    <StatusPill
        status={isVerified ? 'VERIFIED' : 'UNVERIFIED'}
    />
);

export const ActiveStatusPill: React.FC<{ isActive: boolean }> = ({ isActive }) => (
    <StatusPill
        status={isActive ? 'ACTIVE' : 'INACTIVE'}
    />
);

export default StatusPill;
