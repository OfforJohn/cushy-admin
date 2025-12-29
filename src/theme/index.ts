import { extendTheme, type ThemeConfig } from '@chakra-ui/react';

const config: ThemeConfig = {
    initialColorMode: 'dark',
    useSystemColorMode: false,
};

const colors = {
    brand: {
        primary: {
            50: '#f5eef6',
            100: '#e5d6e8',
            200: '#d1b8d6',
            300: '#b894bf',
            400: '#9b6ca3',
            500: '#4E1E58',
            600: '#441a4d',
            700: '#3a1642',
            800: '#2f1236',
            900: '#1f0c24',
        },
        accent: {
            50: '#fff8eb',
            100: '#ffedc6',
            200: '#ffe0a0',
            300: '#ffd379',
            400: '#ffc452',
            500: '#FFB137',
            600: '#e69d2e',
            700: '#cc8a26',
            800: '#b3771f',
            900: '#996417',
        },
    },
    // Override default colors for dark mode
    gray: {
        50: '#f9fafb',
        100: '#f3f4f6',
        200: '#e5e7eb',
        300: '#d1d5db',
        400: '#9ca3af',
        500: '#6b7280',
        600: '#4b5563',
        700: '#374151',
        800: '#1f2937',
        900: '#111827',
        950: '#0d1117',
    },
};

const styles = {
    global: {
        'html, body': {
            bg: 'gray.950',
            color: 'gray.100',
        },
        '::-webkit-scrollbar': {
            width: '8px',
            height: '8px',
        },
        '::-webkit-scrollbar-track': {
            bg: 'gray.900',
        },
        '::-webkit-scrollbar-thumb': {
            bg: 'gray.700',
            borderRadius: 'full',
        },
        '::-webkit-scrollbar-thumb:hover': {
            bg: 'gray.600',
        },
    },
};

const components = {
    Button: {
        baseStyle: {
            fontWeight: '600',
            borderRadius: 'lg',
        },
        variants: {
            primary: {
                bg: 'brand.primary.500',
                color: 'white',
                _hover: {
                    bg: 'brand.primary.600',
                    _disabled: {
                        bg: 'brand.primary.500',
                    },
                },
            },
            accent: {
                bg: 'brand.accent.500',
                color: 'gray.900',
                _hover: {
                    bg: 'brand.accent.600',
                },
            },
            ghost: {
                color: 'gray.300',
                _hover: {
                    bg: 'whiteAlpha.100',
                },
            },
        },
        defaultProps: {
            variant: 'primary',
        },
    },
    Card: {
        baseStyle: {
            container: {
                bg: 'gray.900',
                borderRadius: 'xl',
                border: '1px solid',
                borderColor: 'gray.800',
            },
        },
    },
    Input: {
        variants: {
            filled: {
                field: {
                    bg: 'gray.800',
                    borderColor: 'gray.700',
                    _hover: {
                        bg: 'gray.750',
                    },
                    _focus: {
                        bg: 'gray.800',
                        borderColor: 'brand.primary.500',
                    },
                },
            },
        },
        defaultProps: {
            variant: 'filled',
        },
    },
    Table: {
        variants: {
            simple: {
                th: {
                    color: 'gray.400',
                    borderColor: 'gray.800',
                    fontWeight: '600',
                    textTransform: 'uppercase',
                    fontSize: 'xs',
                    letterSpacing: 'wider',
                },
                td: {
                    borderColor: 'gray.800',
                },
                tbody: {
                    tr: {
                        _hover: {
                            bg: 'whiteAlpha.50',
                        },
                    },
                },
            },
        },
    },
    Modal: {
        baseStyle: {
            dialog: {
                bg: 'gray.900',
                borderRadius: 'xl',
            },
            overlay: {
                bg: 'blackAlpha.700',
                backdropFilter: 'blur(4px)',
            },
        },
    },
    Drawer: {
        baseStyle: {
            dialog: {
                bg: 'gray.900',
            },
            overlay: {
                bg: 'blackAlpha.700',
                backdropFilter: 'blur(4px)',
            },
        },
    },
    Menu: {
        baseStyle: {
            list: {
                bg: 'gray.900',
                borderColor: 'gray.800',
                borderRadius: 'lg',
                boxShadow: 'xl',
            },
            item: {
                bg: 'transparent',
                _hover: {
                    bg: 'whiteAlpha.100',
                },
                _focus: {
                    bg: 'whiteAlpha.100',
                },
            },
        },
    },
    Badge: {
        baseStyle: {
            borderRadius: 'full',
            px: 2,
            py: 0.5,
            fontWeight: '600',
            fontSize: 'xs',
        },
    },
};

const fonts = {
    heading: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    body: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
};

export const theme = extendTheme({
    config,
    colors,
    styles,
    components,
    fonts,
});

export default theme;
