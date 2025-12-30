import React, { useState, useMemo } from 'react';
import {
    Box,
    Flex,
    Heading,
    Text,
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
    Checkbox,
    Image,
    Spinner,
    Card,
    CardBody,
    Link,
    useToast,
    Input,
    InputGroup,
    InputLeftElement,
    IconButton,
} from '@chakra-ui/react';
import { useQuery } from '@tanstack/react-query';
import {
    Package,
    CheckCircle,
    AlertTriangle,
    Clock,
    Ban,
    Filter,
    Download,
    Utensils,
    Pill,
    ShoppingCart,
    Search,
    Trash2,
    RefreshCw,
    ChevronLeft,
    ChevronRight,
} from 'lucide-react';
import { productsApi, Product } from '../../api/products.api';

export const ProductsPage: React.FC = () => {
    const toast = useToast();
    const [merchantTypeFilter, setMerchantTypeFilter] = useState('all');
    const [merchantFilter, setMerchantFilter] = useState('all');
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');
    const [priceFilter, setPriceFilter] = useState('all');
    const [availabilityFilter, setAvailabilityFilter] = useState('all');
    const [sortBy, setSortBy] = useState('newest');
    const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    // Fetch real products from API
    const { data: products = [], isLoading, error, refetch } = useQuery({
        queryKey: ['products'],
        queryFn: () => productsApi.getAllProducts(),
        retry: false,
    });

    // Get unique merchants for filter dropdown
    const uniqueMerchants = useMemo(() => {
        const merchants = new Map<string, { id: string; name: string; category: string }>();
        products.forEach(p => {
            if (p.store?.id && p.store?.name) {
                merchants.set(p.store.id, {
                    id: p.store.id,
                    name: p.store.name,
                    category: p.store.category || '',
                });
            }
        });
        return Array.from(merchants.values());
    }, [products]);

    // Get unique product categories for filter dropdown
    const uniqueCategories = useMemo(() => {
        const categories = new Set<string>();
        products.forEach(p => {
            if (p.menuCategory?.name) {
                categories.add(p.menuCategory.name);
            }
        });
        return Array.from(categories);
    }, [products]);

    // Filter products (including search)
    const filteredProducts = products.filter(product => {
        // Search filter
        if (searchQuery) {
            const searchLower = searchQuery.toLowerCase();
            const matchesSearch =
                product.name?.toLowerCase().includes(searchLower) ||
                product.description?.toLowerCase().includes(searchLower) ||
                product.store?.name?.toLowerCase().includes(searchLower) ||
                product.menuCategory?.name?.toLowerCase().includes(searchLower) ||
                product.id?.toLowerCase().includes(searchLower);
            if (!matchesSearch) return false;
        }

        // Merchant type filter (Restaurant, Pharmacy, Grocery)
        if (merchantTypeFilter !== 'all') {
            const storeCategory = product.store?.category?.toLowerCase() || '';
            if (merchantTypeFilter === 'restaurant' && storeCategory !== 'restaurant') return false;
            if (merchantTypeFilter === 'pharmacy' && storeCategory !== 'med_tech') return false;
            if (merchantTypeFilter === 'grocery' && !['super_market', 'grocery'].includes(storeCategory)) return false;
        }
        // Specific merchant filter
        if (merchantFilter !== 'all' && product.store?.id !== merchantFilter) return false;
        // Product category filter
        if (categoryFilter !== 'all' && product.menuCategory?.name !== categoryFilter) return false;
        // Status filter
        if (statusFilter !== 'all') {
            if (statusFilter === 'active' && !product.isAvailable) return false;
            if (statusFilter === 'inactive' && product.isAvailable) return false;
        }
        // Availability filter
        if (availabilityFilter !== 'all') {
            if (availabilityFilter === 'instock' && !product.isAvailable) return false;
            if (availabilityFilter === 'outofstock' && product.isAvailable) return false;
        }
        // Price filter
        if (priceFilter !== 'all') {
            if (priceFilter === '0-1000' && product.price > 1000) return false;
            if (priceFilter === '1000-5000' && (product.price < 1000 || product.price > 5000)) return false;
            if (priceFilter === '5000+' && product.price < 5000) return false;
        }
        return true;
    });

    // Calculate stats from FILTERED products (so filters apply to stats)
    const totalProducts = filteredProducts.length;
    const activeProducts = filteredProducts.filter(p => p.isAvailable).length;
    const outOfStock = filteredProducts.filter(p => !p.isAvailable).length;
    const inactiveProducts = outOfStock; // Same as out of stock for this API
    const hasFilters = merchantTypeFilter !== 'all' || merchantFilter !== 'all' || categoryFilter !== 'all' || statusFilter !== 'all' || priceFilter !== 'all' || availabilityFilter !== 'all' || searchQuery;

    // Sort products
    const sortedProducts = [...filteredProducts].sort((a, b) => {
        switch (sortBy) {
            case 'newest':
                return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
            case 'oldest':
                return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
            case 'price-low':
                return a.price - b.price;
            case 'price-high':
                return b.price - a.price;
            case 'rating':
                return (b.rating || 0) - (a.rating || 0);
            default:
                return 0;
        }
    });

    // Pagination
    const totalPages = Math.ceil(sortedProducts.length / itemsPerPage);
    const paginatedProducts = sortedProducts.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const handleSelectAll = (checked: boolean) => {
        if (checked) {
            setSelectedProducts(sortedProducts.map(p => p.id));
        } else {
            setSelectedProducts([]);
        }
    };

    const handleSelectProduct = (productId: string, checked: boolean) => {
        if (checked) {
            setSelectedProducts([...selectedProducts, productId]);
        } else {
            setSelectedProducts(selectedProducts.filter(id => id !== productId));
        }
    };

    const clearFilters = () => {
        setMerchantTypeFilter('all');
        setMerchantFilter('all');
        setCategoryFilter('all');
        setStatusFilter('all');
        setPriceFilter('all');
        setAvailabilityFilter('all');
        setSortBy('newest');
        setSearchQuery('');
        setCurrentPage(1);
    };

    const getStockBadge = (product: Product) => {
        if (!product.isAvailable) {
            return <Badge colorScheme="red" variant="subtle" px={2} py={0.5} borderRadius="full">Out of Stock</Badge>;
        }
        return <Badge colorScheme="green" variant="subtle" px={2} py={0.5} borderRadius="full">In Stock</Badge>;
    };

    const getStatusBadge = (product: Product) => {
        if (!product.isAvailable) {
            return <Badge colorScheme="gray" variant="subtle" px={2} py={0.5} borderRadius="full">Inactive</Badge>;
        }
        return <Badge colorScheme="green" variant="solid" px={2} py={0.5} borderRadius="full">Active</Badge>;
    };

    const getMerchantTypeIcon = (category?: string) => {
        switch (category?.toLowerCase()) {
            case 'restaurant':
                return <Icon as={Utensils} color="orange.400" boxSize={4} />;
            case 'med_tech':
                return <Icon as={Pill} color="red.400" boxSize={4} />;
            case 'super_market':
            case 'grocery':
                return <Icon as={ShoppingCart} color="green.400" boxSize={4} />;
            default:
                return <Icon as={Package} color="purple.400" boxSize={4} />;
        }
    };

    const getMerchantTypeName = (category?: string) => {
        switch (category?.toLowerCase()) {
            case 'restaurant':
                return 'Restaurant';
            case 'med_tech':
                return 'Pharmacy';
            case 'super_market':
            case 'grocery':
                return 'Grocery';
            default:
                return 'Other';
        }
    };

    return (
        <Box>
            {/* Header */}
            <Flex justify="space-between" align="center" mb={6}>
                <Box>
                    <Heading size="lg" color="gray.100">
                        All Products
                    </Heading>
                    <Text color="gray.500" fontSize="sm">
                        Products from Restaurants, Pharmacies & Groceries
                    </Text>
                </Box>
                <HStack spacing={3}>
                    <InputGroup size="sm" w="300px">
                        <InputLeftElement pointerEvents="none">
                            <Search size={16} color="gray" />
                        </InputLeftElement>
                        <Input
                            placeholder="Search products, merchants..."
                            value={searchQuery}
                            onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                            bg="gray.800"
                            borderColor="gray.700"
                        />
                    </InputGroup>
                    <IconButton
                        aria-label="Refresh"
                        icon={<RefreshCw size={16} />}
                        variant="ghost"
                        size="sm"
                        onClick={() => refetch()}
                    />
                </HStack>
            </Flex>

            {/* Stats Cards */}
            <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4} mb={6}>
                <Card bg="gray.900" borderColor="gray.800" borderWidth="1px">
                    <CardBody py={4} px={5}>
                        <Flex justify="space-between" align="center">
                            <Box>
                                <Text fontSize="xs" color="gray.500">{hasFilters ? 'Filtered' : 'Total'} Products</Text>
                                <Text fontSize="2xl" fontWeight="bold" color="gray.100">{totalProducts.toLocaleString()}</Text>
                                {hasFilters && <Text fontSize="xs" color="purple.400">{products.length} total</Text>}
                            </Box>
                            <Box p={2} bg="rgba(59, 130, 246, 0.1)" borderRadius="lg">
                                <Icon as={Package} color="blue.400" boxSize={5} />
                            </Box>
                        </Flex>
                    </CardBody>
                </Card>

                <Card bg="gray.900" borderColor="gray.800" borderWidth="1px">
                    <CardBody py={4} px={5}>
                        <Flex justify="space-between" align="center">
                            <Box>
                                <Text fontSize="xs" color="gray.500">Active</Text>
                                <Text fontSize="2xl" fontWeight="bold" color="green.400">{activeProducts.toLocaleString()}</Text>
                                {hasFilters && <Text fontSize="xs" color="green.300">{totalProducts > 0 ? Math.round((activeProducts / totalProducts) * 100) : 0}% of filtered</Text>}
                            </Box>
                            <Box p={2} bg="rgba(34, 197, 94, 0.1)" borderRadius="lg">
                                <Icon as={CheckCircle} color="green.400" boxSize={5} />
                            </Box>
                        </Flex>
                    </CardBody>
                </Card>

                <Card bg="gray.900" borderColor="gray.800" borderWidth="1px">
                    <CardBody py={4} px={5}>
                        <Flex justify="space-between" align="center">
                            <Box>
                                <Text fontSize="xs" color="gray.500">Out of Stock</Text>
                                <Text fontSize="2xl" fontWeight="bold" color="red.400">{outOfStock}</Text>
                                {hasFilters && <Text fontSize="xs" color="red.300">{totalProducts > 0 ? Math.round((outOfStock / totalProducts) * 100) : 0}% of filtered</Text>}
                            </Box>
                            <Box p={2} bg="rgba(239, 68, 68, 0.1)" borderRadius="lg">
                                <Icon as={AlertTriangle} color="red.400" boxSize={5} />
                            </Box>
                        </Flex>
                    </CardBody>
                </Card>

                <Card bg="gray.900" borderColor="gray.800" borderWidth="1px">
                    <CardBody py={4} px={5}>
                        <Flex justify="space-between" align="center">
                            <Box>
                                <Text fontSize="xs" color="gray.500">Inactive</Text>
                                <Text fontSize="2xl" fontWeight="bold" color="gray.400">{inactiveProducts}</Text>
                                {hasFilters && <Text fontSize="xs" color="gray.500">Unavailable products</Text>}
                            </Box>
                            <Box p={2} bg="rgba(107, 114, 128, 0.1)" borderRadius="lg">
                                <Icon as={Ban} color="gray.400" boxSize={5} />
                            </Box>
                        </Flex>
                    </CardBody>
                </Card>
            </SimpleGrid>

            {/* Filters Section */}
            <Box bg="gray.900" borderRadius="xl" borderWidth="1px" borderColor="gray.800" p={4} mb={6}>
                <Flex justify="space-between" align="center" mb={4}>
                    <Text fontWeight="600" color="gray.100">Filters</Text>
                    <Link
                        color="purple.400"
                        fontSize="sm"
                        cursor="pointer"
                        onClick={clearFilters}
                    >
                        Clear All
                    </Link>
                </Flex>

                <SimpleGrid columns={{ base: 2, md: 4, lg: 7 }} spacing={4}>
                    {/* Merchant Type Filter */}
                    <Box>
                        <Text fontSize="xs" color="gray.500" mb={1}>Merchant Type</Text>
                        <Select
                            size="sm"
                            bg="gray.800"
                            borderColor="gray.700"
                            value={merchantTypeFilter}
                            onChange={(e) => setMerchantTypeFilter(e.target.value)}
                        >
                            <option value="all">All Types</option>
                            <option value="restaurant">🍽️ Restaurants</option>
                            <option value="pharmacy">💊 Pharmacies</option>
                            <option value="grocery">🛒 Groceries</option>
                        </Select>
                    </Box>

                    {/* Specific Merchant Filter */}
                    <Box>
                        <Text fontSize="xs" color="gray.500" mb={1}>Merchant</Text>
                        <Select
                            size="sm"
                            bg="gray.800"
                            borderColor="gray.700"
                            value={merchantFilter}
                            onChange={(e) => setMerchantFilter(e.target.value)}
                        >
                            <option value="all">All Merchants</option>
                            {uniqueMerchants.map(m => (
                                <option key={m.id} value={m.id}>{m.name}</option>
                            ))}
                        </Select>
                    </Box>

                    {/* Product Category Filter */}
                    <Box>
                        <Text fontSize="xs" color="gray.500" mb={1}>Product Category</Text>
                        <Select
                            size="sm"
                            bg="gray.800"
                            borderColor="gray.700"
                            value={categoryFilter}
                            onChange={(e) => setCategoryFilter(e.target.value)}
                        >
                            <option value="all">All Categories</option>
                            {uniqueCategories.map(cat => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </Select>
                    </Box>

                    {/* Status Filter */}
                    <Box>
                        <Text fontSize="xs" color="gray.500" mb={1}>Status</Text>
                        <Select
                            size="sm"
                            bg="gray.800"
                            borderColor="gray.700"
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                        >
                            <option value="all">All Statuses</option>
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                        </Select>
                    </Box>

                    {/* Price Range Filter */}
                    <Box>
                        <Text fontSize="xs" color="gray.500" mb={1}>Price Range</Text>
                        <Select
                            size="sm"
                            bg="gray.800"
                            borderColor="gray.700"
                            value={priceFilter}
                            onChange={(e) => setPriceFilter(e.target.value)}
                        >
                            <option value="all">All Prices</option>
                            <option value="0-1000">₦0 - ₦1,000</option>
                            <option value="1000-5000">₦1,000 - ₦5,000</option>
                            <option value="5000+">₦5,000+</option>
                        </Select>
                    </Box>

                    {/* Availability Filter */}
                    <Box>
                        <Text fontSize="xs" color="gray.500" mb={1}>Availability</Text>
                        <Select
                            size="sm"
                            bg="gray.800"
                            borderColor="gray.700"
                            value={availabilityFilter}
                            onChange={(e) => setAvailabilityFilter(e.target.value)}
                        >
                            <option value="all">All</option>
                            <option value="instock">In Stock</option>
                            <option value="outofstock">Out of Stock</option>
                        </Select>
                    </Box>

                    {/* Sort By */}
                    <Box>
                        <Text fontSize="xs" color="gray.500" mb={1}>Sort By</Text>
                        <Select
                            size="sm"
                            bg="gray.800"
                            borderColor="gray.700"
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                        >
                            <option value="newest">Newest First</option>
                            <option value="oldest">Oldest First</option>
                            <option value="price-low">Price: Low to High</option>
                            <option value="price-high">Price: High to Low</option>
                            <option value="rating">Highest Rated</option>
                        </Select>
                    </Box>
                </SimpleGrid>
            </Box>

            {/* Products Table */}
            <Box bg="gray.900" borderRadius="xl" borderWidth="1px" borderColor="gray.800" overflow="hidden">
                <Flex justify="space-between" align="center" p={4} borderBottomWidth="1px" borderColor="gray.800">
                    <Box>
                        <Text fontWeight="600" color="gray.100">All Merchant Products</Text>
                        <Text fontSize="sm" color="gray.500">
                            Showing {paginatedProducts.length} of {sortedProducts.length} products
                            {hasFilters && ` (${products.length} total)`}
                        </Text>
                    </Box>
                    <HStack spacing={3}>
                        {selectedProducts.length > 0 && (
                            <Button
                                size="sm"
                                colorScheme="red"
                                variant="outline"
                                leftIcon={<Trash2 size={14} />}
                                onClick={() => {
                                    toast({
                                        title: `Delete ${selectedProducts.length} products?`,
                                        description: 'This feature is not yet implemented',
                                        status: 'info',
                                        duration: 3000,
                                    });
                                }}
                            >
                                Delete ({selectedProducts.length})
                            </Button>
                        )}
                        <Button
                            size="sm"
                            variant="outline"
                            borderColor="gray.600"
                            leftIcon={<Download size={14} />}
                            onClick={() => {
                                const csv = sortedProducts.map(p =>
                                    `"${p.id}","${p.name}","${p.store?.name || ''}","${p.menuCategory?.name || ''}","${p.price}","${p.isAvailable ? 'Active' : 'Inactive'}"`
                                ).join('\n');
                                const blob = new Blob([`ID,Name,Merchant,Category,Price,Status\n${csv}`], { type: 'text/csv' });
                                const url = URL.createObjectURL(blob);
                                const a = document.createElement('a');
                                a.href = url;
                                a.download = 'products.csv';
                                a.click();
                            }}
                        >
                            Export
                        </Button>
                    </HStack>
                </Flex>

                {isLoading ? (
                    <Flex justify="center" py={12}>
                        <Spinner size="lg" color="purple.500" />
                    </Flex>
                ) : error ? (
                    <Flex justify="center" py={12}>
                        <Text color="red.400">Failed to load products. Please try again.</Text>
                    </Flex>
                ) : (
                    <Box overflowX="auto">
                        <Table variant="simple" size="sm">
                            <Thead>
                                <Tr>
                                    <Th borderColor="gray.800" w="40px">
                                        <Checkbox
                                            isChecked={selectedProducts.length === sortedProducts.length && sortedProducts.length > 0}
                                            isIndeterminate={selectedProducts.length > 0 && selectedProducts.length < sortedProducts.length}
                                            onChange={(e) => handleSelectAll(e.target.checked)}
                                            colorScheme="purple"
                                        />
                                    </Th>
                                    <Th borderColor="gray.800" color="gray.500" textTransform="uppercase" fontSize="xs">Product</Th>
                                    <Th borderColor="gray.800" color="gray.500" textTransform="uppercase" fontSize="xs">Merchant</Th>
                                    <Th borderColor="gray.800" color="gray.500" textTransform="uppercase" fontSize="xs">Type</Th>
                                    <Th borderColor="gray.800" color="gray.500" textTransform="uppercase" fontSize="xs">Category</Th>
                                    <Th borderColor="gray.800" color="gray.500" textTransform="uppercase" fontSize="xs">Price</Th>
                                    <Th borderColor="gray.800" color="gray.500" textTransform="uppercase" fontSize="xs">Stock</Th>
                                    <Th borderColor="gray.800" color="gray.500" textTransform="uppercase" fontSize="xs">Status</Th>
                                </Tr>
                            </Thead>
                            <Tbody>
                                {paginatedProducts.length === 0 ? (
                                    <Tr>
                                        <Td colSpan={8} textAlign="center" py={8} borderColor="gray.800">
                                            <Text color="gray.500">No products found</Text>
                                        </Td>
                                    </Tr>
                                ) : (
                                    paginatedProducts.map((product) => (
                                        <Tr key={product.id} _hover={{ bg: 'gray.800' }}>
                                            <Td borderColor="gray.800">
                                                <Checkbox
                                                    isChecked={selectedProducts.includes(product.id)}
                                                    onChange={(e) => handleSelectProduct(product.id, e.target.checked)}
                                                    colorScheme="purple"
                                                />
                                            </Td>
                                            <Td borderColor="gray.800">
                                                <HStack spacing={3}>
                                                    <Image
                                                        src={product.image || product.images?.[0] || ''}
                                                        alt={product.name}
                                                        boxSize="40px"
                                                        borderRadius="lg"
                                                        objectFit="cover"
                                                        fallbackSrc="https://via.placeholder.com/40"
                                                    />
                                                    <Box>
                                                        <Text fontWeight="500" color="gray.100" noOfLines={1}>{product.name}</Text>
                                                        <Text fontSize="xs" color="gray.500">#{product.id.substring(0, 8)}</Text>
                                                    </Box>
                                                </HStack>
                                            </Td>
                                            <Td borderColor="gray.800">
                                                <Text fontSize="sm" color="gray.300" noOfLines={1}>{product.store?.name || 'Unknown'}</Text>
                                            </Td>
                                            <Td borderColor="gray.800">
                                                <HStack spacing={2}>
                                                    {getMerchantTypeIcon(product.store?.category)}
                                                    <Text fontSize="sm" color="gray.400">{getMerchantTypeName(product.store?.category)}</Text>
                                                </HStack>
                                            </Td>
                                            <Td borderColor="gray.800">
                                                <Text fontSize="sm" color="gray.400">{product.menuCategory?.name || '--'}</Text>
                                            </Td>
                                            <Td borderColor="gray.800">
                                                <Text fontSize="sm" fontWeight="500" color="gray.100">₦{product.price.toLocaleString()}</Text>
                                            </Td>
                                            <Td borderColor="gray.800">
                                                {getStockBadge(product)}
                                            </Td>
                                            <Td borderColor="gray.800">
                                                {getStatusBadge(product)}
                                            </Td>
                                        </Tr>
                                    ))
                                )}
                            </Tbody>
                        </Table>
                    </Box>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                    <Flex justify="space-between" align="center" p={4} borderTopWidth="1px" borderColor="gray.800">
                        <Text fontSize="sm" color="gray.500">
                            Page {currentPage} of {totalPages}
                        </Text>
                        <HStack spacing={2}>
                            <IconButton
                                aria-label="Previous page"
                                icon={<ChevronLeft size={16} />}
                                size="sm"
                                variant="outline"
                                borderColor="gray.600"
                                isDisabled={currentPage === 1}
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                            />
                            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                let pageNum;
                                if (totalPages <= 5) {
                                    pageNum = i + 1;
                                } else if (currentPage <= 3) {
                                    pageNum = i + 1;
                                } else if (currentPage >= totalPages - 2) {
                                    pageNum = totalPages - 4 + i;
                                } else {
                                    pageNum = currentPage - 2 + i;
                                }
                                return (
                                    <Button
                                        key={pageNum}
                                        size="sm"
                                        variant={currentPage === pageNum ? 'solid' : 'outline'}
                                        colorScheme={currentPage === pageNum ? 'purple' : 'gray'}
                                        borderColor="gray.600"
                                        onClick={() => setCurrentPage(pageNum)}
                                    >
                                        {pageNum}
                                    </Button>
                                );
                            })}
                            <IconButton
                                aria-label="Next page"
                                icon={<ChevronRight size={16} />}
                                size="sm"
                                variant="outline"
                                borderColor="gray.600"
                                isDisabled={currentPage === totalPages}
                                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                            />
                        </HStack>
                    </Flex>
                )}
            </Box>
        </Box>
    );
};

export default ProductsPage;
