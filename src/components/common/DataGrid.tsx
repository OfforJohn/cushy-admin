import React, { useState, useMemo } from 'react';
import {
    Table,
    Thead,
    Tbody,
    Tr,
    Th,
    Td,
    Box,
    Flex,
    Text,
    IconButton,
    Select,
    HStack,
    Button,
    Input,
    InputGroup,
    InputLeftElement,
    Icon,
    Checkbox,
    Menu,
    MenuButton,
    MenuList,
    MenuItem,
    Skeleton,
    useToast,
} from '@chakra-ui/react';
import {
    ChevronLeft,
    ChevronRight,
    ChevronsLeft,
    ChevronsRight,
    Search,
    Download,
    MoreVertical,
    ArrowUp,
    ArrowDown,
} from 'lucide-react';
import { PAGINATION } from '../../utils/constants';

export interface Column<T> {
    key: string;
    header: string;
    render?: (item: T, index: number) => React.ReactNode;
    sortable?: boolean;
    width?: string;
}

export interface DataGridProps<T> {
    data: T[];
    columns: Column<T>[];
    isLoading?: boolean;
    totalItems?: number;
    page?: number;
    pageSize?: number;
    onPageChange?: (page: number) => void;
    onPageSizeChange?: (size: number) => void;
    onRowClick?: (item: T) => void;
    onSelectionChange?: (selectedItems: T[]) => void;
    selectable?: boolean;
    actions?: (item: T) => React.ReactNode;
    searchable?: boolean;
    onSearch?: (query: string) => void;
    exportable?: boolean;
    onExport?: () => void;
    emptyMessage?: string;
    getRowId?: (item: T) => string;
}

export function DataGrid<T extends Record<string, any>>({
    data,
    columns,
    isLoading = false,
    totalItems,
    page = 1,
    pageSize = PAGINATION.DEFAULT_LIMIT,
    onPageChange,
    onPageSizeChange,
    onRowClick,
    onSelectionChange,
    selectable = false,
    actions,
    searchable = false,
    onSearch,
    exportable = false,
    onExport,
    emptyMessage = 'No data available',
    getRowId = (item) => item.id || String(Math.random()),
}: DataGridProps<T>) {
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [sortColumn, setSortColumn] = useState<string | null>(null);
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
    const [searchQuery, setSearchQuery] = useState('');
    const toast = useToast();

    const total = totalItems ?? data.length;
    const totalPages = Math.ceil(total / pageSize);

    const sortedData = useMemo(() => {
        if (!sortColumn) return data;

        return [...data].sort((a, b) => {
            const aVal = a[sortColumn];
            const bVal = b[sortColumn];

            if (aVal === bVal) return 0;
            if (aVal === null || aVal === undefined) return 1;
            if (bVal === null || bVal === undefined) return -1;

            const comparison = aVal < bVal ? -1 : 1;
            return sortDirection === 'asc' ? comparison : -comparison;
        });
    }, [data, sortColumn, sortDirection]);

    const handleSort = (columnKey: string) => {
        if (sortColumn === columnKey) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortColumn(columnKey);
            setSortDirection('asc');
        }
    };

    const handleSelectAll = (checked: boolean) => {
        if (checked) {
            const allIds = new Set(sortedData.map(getRowId));
            setSelectedIds(allIds);
            onSelectionChange?.(sortedData);
        } else {
            setSelectedIds(new Set());
            onSelectionChange?.([]);
        }
    };

    const handleSelectRow = (item: T, checked: boolean) => {
        const id = getRowId(item);
        const newSelection = new Set(selectedIds);

        if (checked) {
            newSelection.add(id);
        } else {
            newSelection.delete(id);
        }

        setSelectedIds(newSelection);
        onSelectionChange?.(sortedData.filter(i => newSelection.has(getRowId(i))));
    };

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(e.target.value);
        onSearch?.(e.target.value);
    };

    const handleExport = () => {
        if (onExport) {
            onExport();
        } else {
            // Default CSV export
            const headers = columns.map(c => c.header).join(',');
            const rows = sortedData.map(item =>
                columns.map(c => {
                    const value = item[c.key];
                    return typeof value === 'string' && value.includes(',')
                        ? `"${value}"`
                        : value;
                }).join(',')
            ).join('\n');

            const csv = `${headers}\n${rows}`;
            const blob = new Blob([csv], { type: 'text/csv' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'export.csv';
            a.click();
            URL.revokeObjectURL(url);

            toast({
                title: 'Export successful',
                status: 'success',
                duration: 2000,
            });
        }
    };

    const isAllSelected = sortedData.length > 0 && selectedIds.size === sortedData.length;

    return (
        <Box>
            {/* Toolbar */}
            {(searchable || exportable || selectable) && (
                <Flex justify="space-between" align="center" mb={4} gap={4}>
                    {searchable && (
                        <InputGroup maxW="300px">
                            <InputLeftElement>
                                <Icon as={Search} color="gray.500" boxSize={4} />
                            </InputLeftElement>
                            <Input
                                placeholder="Search..."
                                value={searchQuery}
                                onChange={handleSearch}
                                size="sm"
                            />
                        </InputGroup>
                    )}

                    <HStack spacing={2}>
                        {selectable && selectedIds.size > 0 && (
                            <Text fontSize="sm" color="gray.500">
                                {selectedIds.size} selected
                            </Text>
                        )}

                        {exportable && (
                            <Button
                                leftIcon={<Download size={16} />}
                                size="sm"
                                variant="ghost"
                                onClick={handleExport}
                            >
                                Export CSV
                            </Button>
                        )}
                    </HStack>
                </Flex>
            )}

            {/* Table */}
            <Box
                borderRadius="xl"
                border="1px solid"
                borderColor="gray.800"
                overflow="hidden"
            >
                <Box overflowX="auto">
                    <Table variant="simple">
                        <Thead bg="gray.900">
                            <Tr>
                                {selectable && (
                                    <Th w="50px" px={4}>
                                        <Checkbox
                                            isChecked={isAllSelected}
                                            onChange={(e) => handleSelectAll(e.target.checked)}
                                            colorScheme="purple"
                                        />
                                    </Th>
                                )}
                                {columns.map((column) => (
                                    <Th
                                        key={column.key}
                                        cursor={column.sortable ? 'pointer' : 'default'}
                                        onClick={() => column.sortable && handleSort(column.key)}
                                        width={column.width}
                                        _hover={column.sortable ? { bg: 'whiteAlpha.50' } : {}}
                                    >
                                        <HStack spacing={1}>
                                            <Text>{column.header}</Text>
                                            {column.sortable && sortColumn === column.key && (
                                                <Icon
                                                    as={sortDirection === 'asc' ? ArrowUp : ArrowDown}
                                                    boxSize={3}
                                                />
                                            )}
                                        </HStack>
                                    </Th>
                                ))}
                                {actions && <Th w="60px" />}
                            </Tr>
                        </Thead>
                        <Tbody>
                            {isLoading ? (
                                // Loading skeleton
                                Array.from({ length: 5 }).map((_, i) => (
                                    <Tr key={i}>
                                        {selectable && (
                                            <Td>
                                                <Skeleton height="20px" width="20px" />
                                            </Td>
                                        )}
                                        {columns.map((column) => (
                                            <Td key={column.key}>
                                                <Skeleton height="20px" />
                                            </Td>
                                        ))}
                                        {actions && (
                                            <Td>
                                                <Skeleton height="20px" width="20px" />
                                            </Td>
                                        )}
                                    </Tr>
                                ))
                            ) : sortedData.length === 0 ? (
                                <Tr>
                                    <Td
                                        colSpan={columns.length + (selectable ? 1 : 0) + (actions ? 1 : 0)}
                                        textAlign="center"
                                        py={10}
                                    >
                                        <Text color="gray.500">{emptyMessage}</Text>
                                    </Td>
                                </Tr>
                            ) : (
                                sortedData.map((item, index) => (
                                    <Tr
                                        key={getRowId(item)}
                                        cursor={onRowClick ? 'pointer' : 'default'}
                                        onClick={() => onRowClick?.(item)}
                                        _hover={{ bg: 'whiteAlpha.50' }}
                                        bg={selectedIds.has(getRowId(item)) ? 'whiteAlpha.100' : 'transparent'}
                                    >
                                        {selectable && (
                                            <Td px={4} onClick={(e) => e.stopPropagation()}>
                                                <Checkbox
                                                    isChecked={selectedIds.has(getRowId(item))}
                                                    onChange={(e) => handleSelectRow(item, e.target.checked)}
                                                    colorScheme="purple"
                                                />
                                            </Td>
                                        )}
                                        {columns.map((column) => (
                                            <Td key={column.key}>
                                                {column.render
                                                    ? column.render(item, index)
                                                    : item[column.key] ?? '-'}
                                            </Td>
                                        ))}
                                        {actions && (
                                            <Td onClick={(e) => e.stopPropagation()}>
                                                <Menu>
                                                    <MenuButton
                                                        as={IconButton}
                                                        icon={<MoreVertical size={16} />}
                                                        variant="ghost"
                                                        size="sm"
                                                    />
                                                    <MenuList>
                                                        {actions(item)}
                                                    </MenuList>
                                                </Menu>
                                            </Td>
                                        )}
                                    </Tr>
                                ))
                            )}
                        </Tbody>
                    </Table>
                </Box>
            </Box>

            {/* Pagination */}
            {totalPages > 1 && (
                <Flex justify="space-between" align="center" mt={4}>
                    <HStack spacing={2}>
                        <Text fontSize="sm" color="gray.500">
                            Rows per page:
                        </Text>
                        <Select
                            size="sm"
                            w="70px"
                            value={pageSize}
                            onChange={(e) => onPageSizeChange?.(Number(e.target.value))}
                        >
                            {PAGINATION.LIMIT_OPTIONS.map((size) => (
                                <option key={size} value={size}>
                                    {size}
                                </option>
                            ))}
                        </Select>
                    </HStack>

                    <HStack spacing={2}>
                        <Text fontSize="sm" color="gray.500">
                            {((page - 1) * pageSize) + 1} - {Math.min(page * pageSize, total)} of {total}
                        </Text>

                        <HStack spacing={1}>
                            <IconButton
                                aria-label="First page"
                                icon={<ChevronsLeft size={16} />}
                                size="sm"
                                variant="ghost"
                                isDisabled={page === 1}
                                onClick={() => onPageChange?.(1)}
                            />
                            <IconButton
                                aria-label="Previous page"
                                icon={<ChevronLeft size={16} />}
                                size="sm"
                                variant="ghost"
                                isDisabled={page === 1}
                                onClick={() => onPageChange?.(page - 1)}
                            />
                            <IconButton
                                aria-label="Next page"
                                icon={<ChevronRight size={16} />}
                                size="sm"
                                variant="ghost"
                                isDisabled={page === totalPages}
                                onClick={() => onPageChange?.(page + 1)}
                            />
                            <IconButton
                                aria-label="Last page"
                                icon={<ChevronsRight size={16} />}
                                size="sm"
                                variant="ghost"
                                isDisabled={page === totalPages}
                                onClick={() => onPageChange?.(totalPages)}
                            />
                        </HStack>
                    </HStack>
                </Flex>
            )}
        </Box>
    );
}

export default DataGrid;
