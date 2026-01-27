import React, { useState, useEffect } from 'react';
import {
    Box,
    Flex,
    VStack,
    HStack,
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
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalCloseButton,
    PinInput,
    PinInputField,
    Spinner,
    Alert,
    AlertIcon,
} from '@chakra-ui/react';
import { Eye, EyeOff, Lock, Mail, ShieldCheck, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { usersApi } from '../../api/users.api';

// Rate limiting constants
const MAX_LOGIN_ATTEMPTS = 5;
const MAX_OTP_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 2 * 60 * 60 * 1000; // 2 hours
const STORAGE_KEY_ATTEMPTS = 'login_attempts';
const STORAGE_KEY_LOCKOUT = 'login_lockout_until';
const STORAGE_KEY_OTP_ATTEMPTS = 'otp_attempts';
const STORAGE_KEY_OTP_LOCKOUT = 'otp_lockout_until';

interface LoginAttemptData {
    count: number;
    lastAttempt: number;
}

export const LoginPage: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

    // OTP verification state
    const [showOtpModal, setShowOtpModal] = useState(false);
    const [otp, setOtp] = useState('');
    const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
    const [isSendingOtp, setIsSendingOtp] = useState(false);
    const [resendCooldown, setResendCooldown] = useState(0);

    // Rate limiting state - Login
    const [isLockedOut, setIsLockedOut] = useState(false);
    const [lockoutTimeRemaining, setLockoutTimeRemaining] = useState(0);
    const [failedAttempts, setFailedAttempts] = useState(0);

    // Rate limiting state - OTP
    const [isOtpLockedOut, setIsOtpLockedOut] = useState(false);
    const [otpLockoutTimeRemaining, setOtpLockoutTimeRemaining] = useState(0);
    const [failedOtpAttempts, setFailedOtpAttempts] = useState(0);

    // Login token from step 1 (used in step 2)
    const [loginToken, setLoginToken] = useState('');

    const { updateUser } = useAuth();
    const navigate = useNavigate();
    const toast = useToast();

    // Check for existing lockout on mount and update timer
    useEffect(() => {
        const checkLockout = () => {
            const lockoutUntil = localStorage.getItem(STORAGE_KEY_LOCKOUT);
            if (lockoutUntil) {
                const lockoutTime = parseInt(lockoutUntil, 10);
                const now = Date.now();
                if (now < lockoutTime) {
                    setIsLockedOut(true);
                    setLockoutTimeRemaining(Math.ceil((lockoutTime - now) / 1000));
                } else {
                    // Lockout expired, clear it
                    localStorage.removeItem(STORAGE_KEY_LOCKOUT);
                    localStorage.removeItem(STORAGE_KEY_ATTEMPTS);
                    setIsLockedOut(false);
                    setFailedAttempts(0);
                }
            }

            // Load failed attempts count
            const attemptsData = localStorage.getItem(STORAGE_KEY_ATTEMPTS);
            if (attemptsData) {
                try {
                    const data: LoginAttemptData = JSON.parse(attemptsData);
                    // Reset attempts if last attempt was more than lockout duration ago
                    if (Date.now() - data.lastAttempt > LOCKOUT_DURATION_MS) {
                        localStorage.removeItem(STORAGE_KEY_ATTEMPTS);
                        setFailedAttempts(0);
                    } else {
                        setFailedAttempts(data.count);
                    }
                } catch {
                    localStorage.removeItem(STORAGE_KEY_ATTEMPTS);
                }
            }
        };

        checkLockout();

        // Update lockout timer every second
        const interval = setInterval(() => {
            const lockoutUntil = localStorage.getItem(STORAGE_KEY_LOCKOUT);
            if (lockoutUntil) {
                const lockoutTime = parseInt(lockoutUntil, 10);
                const now = Date.now();
                if (now < lockoutTime) {
                    setLockoutTimeRemaining(Math.ceil((lockoutTime - now) / 1000));
                } else {
                    localStorage.removeItem(STORAGE_KEY_LOCKOUT);
                    localStorage.removeItem(STORAGE_KEY_ATTEMPTS);
                    setIsLockedOut(false);
                    setFailedAttempts(0);
                    setLockoutTimeRemaining(0);
                }
            }
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    // Cooldown timer for OTP resend
    useEffect(() => {
        if (resendCooldown > 0) {
            const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [resendCooldown]);

    const recordFailedAttempt = () => {
        const newCount = failedAttempts + 1;
        const attemptData: LoginAttemptData = {
            count: newCount,
            lastAttempt: Date.now(),
        };
        localStorage.setItem(STORAGE_KEY_ATTEMPTS, JSON.stringify(attemptData));
        setFailedAttempts(newCount);

        if (newCount >= MAX_LOGIN_ATTEMPTS) {
            const lockoutUntil = Date.now() + LOCKOUT_DURATION_MS;
            localStorage.setItem(STORAGE_KEY_LOCKOUT, lockoutUntil.toString());
            setIsLockedOut(true);
            setLockoutTimeRemaining(Math.ceil(LOCKOUT_DURATION_MS / 1000));
            toast({
                title: 'Account temporarily locked',
                description: `Too many failed attempts. Please try again in 2 hours.`,
                status: 'error',
                duration: 10000,
            });
        }
    };

    const clearFailedAttempts = () => {
        localStorage.removeItem(STORAGE_KEY_ATTEMPTS);
        localStorage.removeItem(STORAGE_KEY_LOCKOUT);
        setFailedAttempts(0);
        setIsLockedOut(false);
    };

    // OTP rate limiting helpers
    const recordFailedOtpAttempt = () => {
        const newCount = failedOtpAttempts + 1;
        const attemptData: LoginAttemptData = {
            count: newCount,
            lastAttempt: Date.now(),
        };
        localStorage.setItem(STORAGE_KEY_OTP_ATTEMPTS, JSON.stringify(attemptData));
        setFailedOtpAttempts(newCount);

        if (newCount >= MAX_OTP_ATTEMPTS) {
            const lockoutUntil = Date.now() + LOCKOUT_DURATION_MS;
            localStorage.setItem(STORAGE_KEY_OTP_LOCKOUT, lockoutUntil.toString());
            setIsOtpLockedOut(true);
            setOtpLockoutTimeRemaining(Math.ceil(LOCKOUT_DURATION_MS / 1000));
            // Close modal and clear auth
            setShowOtpModal(false);
            localStorage.removeItem('accessToken');
            localStorage.removeItem('user');
            toast({
                title: 'OTP verification locked',
                description: `Too many failed attempts. Please try again in 2 hours.`,
                status: 'error',
                duration: 10000,
            });
        }
    };

    const clearFailedOtpAttempts = () => {
        localStorage.removeItem(STORAGE_KEY_OTP_ATTEMPTS);
        localStorage.removeItem(STORAGE_KEY_OTP_LOCKOUT);
        setFailedOtpAttempts(0);
        setIsOtpLockedOut(false);
    };

    // Check OTP lockout on mount and update timer
    useEffect(() => {
        const checkOtpLockout = () => {
            const lockoutUntil = localStorage.getItem(STORAGE_KEY_OTP_LOCKOUT);
            if (lockoutUntil) {
                const lockoutTime = parseInt(lockoutUntil, 10);
                const now = Date.now();
                if (now < lockoutTime) {
                    setIsOtpLockedOut(true);
                    setOtpLockoutTimeRemaining(Math.ceil((lockoutTime - now) / 1000));
                } else {
                    localStorage.removeItem(STORAGE_KEY_OTP_LOCKOUT);
                    localStorage.removeItem(STORAGE_KEY_OTP_ATTEMPTS);
                    setIsOtpLockedOut(false);
                    setFailedOtpAttempts(0);
                }
            }

            // Load failed OTP attempts count
            const attemptsData = localStorage.getItem(STORAGE_KEY_OTP_ATTEMPTS);
            if (attemptsData) {
                try {
                    const data: LoginAttemptData = JSON.parse(attemptsData);
                    if (Date.now() - data.lastAttempt > LOCKOUT_DURATION_MS) {
                        localStorage.removeItem(STORAGE_KEY_OTP_ATTEMPTS);
                        setFailedOtpAttempts(0);
                    } else {
                        setFailedOtpAttempts(data.count);
                    }
                } catch {
                    localStorage.removeItem(STORAGE_KEY_OTP_ATTEMPTS);
                }
            }
        };

        checkOtpLockout();

        // Update OTP lockout timer every second
        const interval = setInterval(() => {
            const lockoutUntil = localStorage.getItem(STORAGE_KEY_OTP_LOCKOUT);
            if (lockoutUntil) {
                const lockoutTime = parseInt(lockoutUntil, 10);
                const now = Date.now();
                if (now < lockoutTime) {
                    setOtpLockoutTimeRemaining(Math.ceil((lockoutTime - now) / 1000));
                } else {
                    localStorage.removeItem(STORAGE_KEY_OTP_LOCKOUT);
                    localStorage.removeItem(STORAGE_KEY_OTP_ATTEMPTS);
                    setIsOtpLockedOut(false);
                    setFailedOtpAttempts(0);
                    setOtpLockoutTimeRemaining(0);
                }
            }
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    const formatTimeRemaining = (seconds: number): string => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

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

        if (isLockedOut) {
            toast({
                title: 'Account locked',
                description: `Please wait ${formatTimeRemaining(lockoutTimeRemaining)} before trying again`,
                status: 'error',
                duration: 3000,
            });
            return;
        }

        if (!validateForm()) return;

        setIsLoading(true);
        try {
            // Step 1: Validate credentials and send OTP
            // This does NOT authenticate yet - just validates and sends OTP
            const response = await usersApi.adminLogin(email, password);

            if (response.error) {
                throw new Error(response.message || 'Login failed');
            }

            // Store the login token for step 2
            setLoginToken(response.data?.loginToken || '');
            setShowOtpModal(true);
            setResendCooldown(60); // Start 60 second cooldown
            toast({
                title: 'Verification code sent',
                description: 'Please check your email for the verification code',
                status: 'info',
                duration: 5000,
            });
        } catch (error: any) {
            // Record failed login attempt
            recordFailedAttempt();

            const remainingAttempts = MAX_LOGIN_ATTEMPTS - failedAttempts - 1;

            toast({
                title: 'Login failed',
                description: remainingAttempts > 0
                    ? `Invalid email or password. ${remainingAttempts} attempt${remainingAttempts === 1 ? '' : 's'} remaining.`
                    : 'Invalid email or password.',
                status: 'error',
                duration: 5000,
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerifyOtp = async () => {
        if (isOtpLockedOut) {
            toast({
                title: 'OTP verification locked',
                description: `Please wait ${formatTimeRemaining(otpLockoutTimeRemaining)} before trying again`,
                status: 'error',
                duration: 3000,
            });
            return;
        }

        if (otp.length !== 4) {
            toast({
                title: 'Invalid code',
                description: 'Please enter the 4-digit verification code',
                status: 'warning',
                duration: 3000,
            });
            return;
        }

        setIsVerifyingOtp(true);
        try {
            // Step 2: Verify OTP and complete login
            const response = await usersApi.adminVerifyLogin(email, otp, loginToken);

            if (response.error) {
                throw new Error(response.message || 'Verification failed');
            }

            // Store the auth token and user data
            if (response.data?.access_token) {
                localStorage.setItem('accessToken', response.data.access_token);
            }
            if (response.data?.user) {
                localStorage.setItem('user', JSON.stringify(response.data.user));
                updateUser(response.data.user);
            }

            // Clear all failed attempts on successful login
            clearFailedAttempts();
            clearFailedOtpAttempts();

            toast({
                title: 'Welcome back!',
                description: 'Logged in successfully',
                status: 'success',
                duration: 3000,
            });
            setShowOtpModal(false);
            navigate('/');
        } catch (error: any) {
            // Record failed OTP attempt
            recordFailedOtpAttempt();

            const remainingOtpAttempts = MAX_OTP_ATTEMPTS - failedOtpAttempts - 1;

            toast({
                title: 'Verification failed',
                description: remainingOtpAttempts > 0
                    ? `Invalid or expired code. ${remainingOtpAttempts} attempt${remainingOtpAttempts === 1 ? '' : 's'} remaining.`
                    : 'Invalid or expired code.',
                status: 'error',
                duration: 5000,
            });
            setOtp('');
        } finally {
            setIsVerifyingOtp(false);
        }
    };

    const handleResendOtp = async () => {
        if (resendCooldown > 0) return;

        setIsSendingOtp(true);
        try {
            // Re-send OTP using the same admin login endpoint
            const response = await usersApi.adminLogin(email, password);

            if (response.error) {
                throw new Error(response.message || 'Failed to resend code');
            }

            // Update the login token
            setLoginToken(response.data?.loginToken || '');
            setResendCooldown(60);
            toast({
                title: 'Code resent',
                description: 'A new verification code has been sent to your email',
                status: 'success',
                duration: 3000,
            });
        } catch (error: any) {
            toast({
                title: 'Failed to resend code',
                description: error?.response?.data?.message || 'Please try again',
                status: 'error',
                duration: 3000,
            });
        } finally {
            setIsSendingOtp(false);
        }
    };

    const handleCloseOtpModal = () => {
        setShowOtpModal(false);
        setOtp('');
        // Clear auth data since verification was not completed
        localStorage.removeItem('accessToken');
        localStorage.removeItem('user');
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

                {/* Lockout Alert */}
                {isLockedOut && (
                    <Alert status="error" mb={4} borderRadius="md" bg="red.900" borderColor="red.700">
                        <AlertIcon as={AlertTriangle} />
                        <Box>
                            <Text fontWeight="bold" fontSize="sm">Account temporarily locked</Text>
                            <Text fontSize="xs">Try again in {formatTimeRemaining(lockoutTimeRemaining)}</Text>
                        </Box>
                    </Alert>
                )}

                {/* Failed attempts warning */}
                {!isLockedOut && failedAttempts > 0 && failedAttempts < MAX_LOGIN_ATTEMPTS && (
                    <Alert status="warning" mb={4} borderRadius="md" bg="orange.900" borderColor="orange.700">
                        <AlertIcon />
                        <Text fontSize="sm">
                            {MAX_LOGIN_ATTEMPTS - failedAttempts} login attempt{MAX_LOGIN_ATTEMPTS - failedAttempts === 1 ? '' : 's'} remaining
                        </Text>
                    </Alert>
                )}

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
                                    isDisabled={isLockedOut}
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
                                    isDisabled={isLockedOut}
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
                                        isDisabled={isLockedOut}
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
                            isLoading={isLoading || isSendingOtp}
                            loadingText={isSendingOtp ? 'Sending code...' : 'Signing in...'}
                            isDisabled={isLockedOut}
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

            {/* OTP Verification Modal */}
            <Modal isOpen={showOtpModal} onClose={handleCloseOtpModal} isCentered closeOnOverlayClick={false}>
                <ModalOverlay bg="blackAlpha.700" />
                <ModalContent bg="gray.900" borderColor="gray.800" mx={4}>
                    <ModalHeader>
                        <VStack spacing={2} align="center">
                            <Box
                                p={3}
                                bg="purple.500"
                                borderRadius="full"
                            >
                                <Icon as={ShieldCheck} boxSize={6} color="white" />
                            </Box>
                            <Text color="gray.100">Email Verification</Text>
                        </VStack>
                    </ModalHeader>
                    <ModalCloseButton color="gray.400" />
                    <ModalBody pb={6}>
                        <VStack spacing={4}>
                            <Text color="gray.400" textAlign="center" fontSize="sm">
                                We've sent a 4-digit verification code to your email address. Enter the code below to complete your login.
                            </Text>

                            <HStack justify="center" spacing={3}>
                                <PinInput
                                    value={otp}
                                    onChange={setOtp}
                                    otp
                                    size="lg"
                                    placeholder=""
                                >
                                    <PinInputField bg="gray.800" borderColor="gray.700" _focus={{ borderColor: 'purple.500' }} />
                                    <PinInputField bg="gray.800" borderColor="gray.700" _focus={{ borderColor: 'purple.500' }} />
                                    <PinInputField bg="gray.800" borderColor="gray.700" _focus={{ borderColor: 'purple.500' }} />
                                    <PinInputField bg="gray.800" borderColor="gray.700" _focus={{ borderColor: 'purple.500' }} />
                                </PinInput>
                            </HStack>

                            <Button
                                w="full"
                                colorScheme="purple"
                                onClick={handleVerifyOtp}
                                isLoading={isVerifyingOtp}
                                loadingText="Verifying..."
                                isDisabled={otp.length !== 4}
                            >
                                Verify & Login
                            </Button>

                            <HStack spacing={1} justify="center">
                                <Text color="gray.500" fontSize="sm">
                                    Didn't receive the code?
                                </Text>
                                <Button
                                    variant="link"
                                    colorScheme="purple"
                                    size="sm"
                                    onClick={handleResendOtp}
                                    isDisabled={resendCooldown > 0 || isSendingOtp}
                                >
                                    {isSendingOtp ? (
                                        <Spinner size="xs" />
                                    ) : resendCooldown > 0 ? (
                                        `Resend in ${resendCooldown}s`
                                    ) : (
                                        'Resend'
                                    )}
                                </Button>
                            </HStack>
                        </VStack>
                    </ModalBody>
                </ModalContent>
            </Modal>
        </Flex>
    );
};

export default LoginPage;
