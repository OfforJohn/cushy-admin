import React, { useState } from 'react';
import {
    Box,
    Flex,
    VStack,
    Text,
    Input,
    Button,
    FormControl,
    FormLabel,
    FormErrorMessage,
    InputGroup,
    InputRightElement,
    IconButton,
    useToast,
    Icon,
} from '@chakra-ui/react';
import { Eye, EyeOff, Lock, Mail } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export const LoginPage: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

    const { login } = useAuth();
    const navigate = useNavigate();
    const toast = useToast();

    const validateForm = (): boolean => {
        const newErrors: { email?: string; password?: string } = {};

        if (!email) {
            newErrors.email = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            newErrors.email = 'Invalid email format';
        }

        if (!password) {
            newErrors.password = 'Password is required';
        } else if (password.length < 6) {
            newErrors.password = 'Password must be at least 6 characters';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) return;

        setIsLoading(true);
        try {
            await login({ email, password });
            toast({
                title: 'Welcome back!',
                description: 'Logged in successfully',
                status: 'success',
                duration: 3000,
            });
            navigate('/');
        } catch (error: any) {
            toast({
                title: 'Login failed',
                description: error.message || 'Invalid credentials',
                status: 'error',
                duration: 5000,
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Flex
            minH="100vh"
            bg="gray.950"
            align="center"
            justify="center"
            p={4}
        >
            {/* Background decoration */}
            <Box
                position="absolute"
                top="10%"
                left="5%"
                w="400px"
                h="400px"
                bg="brand.primary.500"
                opacity={0.03}
                borderRadius="full"
                filter="blur(100px)"
            />
            <Box
                position="absolute"
                bottom="10%"
                right="5%"
                w="300px"
                h="300px"
                bg="brand.accent.500"
                opacity={0.03}
                borderRadius="full"
                filter="blur(100px)"
            />

            <Box
                maxW="420px"
                w="full"
                bg="gray.900"
                borderRadius="2xl"
                border="1px solid"
                borderColor="gray.800"
                p={8}
                position="relative"
                zIndex={1}
            >
                {/* Logo */}
                <VStack spacing={2} mb={8}>
                    <Flex align="center" gap={2}>
                        <Box
                            w={10}
                            h={10}
                            bg="brand.primary.500"
                            borderRadius="xl"
                            display="flex"
                            alignItems="center"
                            justifyContent="center"
                        >
                            <Text color="white" fontWeight="bold" fontSize="xl">
                                C
                            </Text>
                        </Box>
                        <Text
                            fontSize="2xl"
                            fontWeight="bold"
                            bgGradient="linear(to-r, brand.primary.400, brand.accent.500)"
                            bgClip="text"
                        >
                            Cushy Access
                        </Text>
                    </Flex>
                    <Text color="gray.500" fontSize="sm">
                        Admin Dashboard
                    </Text>
                </VStack>

                {/* Form */}
                <form onSubmit={handleSubmit}>
                    <VStack spacing={5}>
                        <FormControl isInvalid={!!errors.email}>
                            <FormLabel color="gray.400" fontSize="sm">
                                Email Address
                            </FormLabel>
                            <InputGroup>
                                <Input
                                    type="email"
                                    placeholder="admin@cushyaccess.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    bg="gray.800"
                                    border="1px solid"
                                    borderColor="gray.700"
                                    _hover={{ borderColor: 'gray.600' }}
                                    _focus={{ borderColor: 'brand.primary.500', bg: 'gray.800' }}
                                    pl={10}
                                />
                                <Box
                                    position="absolute"
                                    left={3}
                                    top="50%"
                                    transform="translateY(-50%)"
                                    zIndex={2}
                                >
                                    <Icon as={Mail} color="gray.500" boxSize={4} />
                                </Box>
                            </InputGroup>
                            <FormErrorMessage>{errors.email}</FormErrorMessage>
                        </FormControl>

                        <FormControl isInvalid={!!errors.password}>
                            <FormLabel color="gray.400" fontSize="sm">
                                Password
                            </FormLabel>
                            <InputGroup>
                                <Input
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="Enter your password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    bg="gray.800"
                                    border="1px solid"
                                    borderColor="gray.700"
                                    _hover={{ borderColor: 'gray.600' }}
                                    _focus={{ borderColor: 'brand.primary.500', bg: 'gray.800' }}
                                    pl={10}
                                />
                                <Box
                                    position="absolute"
                                    left={3}
                                    top="50%"
                                    transform="translateY(-50%)"
                                    zIndex={2}
                                >
                                    <Icon as={Lock} color="gray.500" boxSize={4} />
                                </Box>
                                <InputRightElement>
                                    <IconButton
                                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                                        icon={<Icon as={showPassword ? EyeOff : Eye} boxSize={4} />}
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setShowPassword(!showPassword)}
                                    />
                                </InputRightElement>
                            </InputGroup>
                            <FormErrorMessage>{errors.password}</FormErrorMessage>
                        </FormControl>

                        <Button
                            type="submit"
                            w="full"
                            size="lg"
                            bg="brand.primary.500"
                            color="white"
                            _hover={{ bg: 'brand.primary.600' }}
                            isLoading={isLoading}
                            loadingText="Signing in..."
                        >
                            Sign In
                        </Button>
                    </VStack>
                </form>

                {/* Footer */}
                <Text
                    textAlign="center"
                    fontSize="xs"
                    color="gray.600"
                    mt={6}
                >
                    Admin access only. Contact support if you have issues.
                </Text>
            </Box>
        </Flex>
    );
};

export default LoginPage;
