import React, { useEffect, useState } from 'react';
import { Box, Heading, VStack, Text, Button, SimpleGrid, Input, HStack, Icon, useToast } from '@chakra-ui/react';
import { TrendingUp } from 'lucide-react';
import { defaultPremiumPayload, PremiumPayload } from '../../utils/premiumFeaturesPayload';

const PremiumPushPage: React.FC = () => {
  const [sending, setSending] = useState(false);
  const [premiumPayload, setPremiumPayload] = useState<PremiumPayload>({ ...defaultPremiumPayload });
  const [fetchingTokens, setFetchingTokens] = useState(false);
  const [expoTokens, setExpoTokens] = useState<string[]>(() => {
    const saved = localStorage.getItem('expoTokens');
    return saved ? JSON.parse(saved) : [];
  });
  const toast = useToast();
  // Fetch Expo tokens and store in localorage
  const handleFetchTokens = async () => {
    setFetchingTokens(true);
    try {
      const res = await fetch('https://api.cushyaccess.com/api/v1/notifications/expo-tokens');
      const data = await res.json();
      if (data.tokens) {
        localStorage.setItem('expoTokens', JSON.stringify(data.tokens));
        setExpoTokens(data.tokens);
        toast({
          title: 'Expo tokens fetched',
          description: `${data.tokens.length} tokens saved to localStorage`,
          status: 'success',
          duration: 4000,
          isClosable: true,
        });
      } else {
        setExpoTokens([]);
        toast({
          title: 'No tokens found',
          status: 'info',
          duration: 3000,
        });
      }
    } catch (e) {
      toast({
        title: 'Failed to fetch tokens',
        status: 'error',
        duration: 3000,
      });
    }
    setFetchingTokens(false);
  };

  // Example payload for autofill
  const samplePayload: PremiumPayload = {
    title: 'Premium Features',
    subtitle: 'Unlock powerful tools',
    description: 'Experience faster deliveries and exclusive rewards',
    icon: 'gift',
    backgroundColor: 'green',
    badges: ['New', 'Limited Time'],
    features: [
      { icon: 'truck', text: 'Fast Delivery (24-48 hours)', color: '#10B981' },
      { icon: 'shield', text: 'Secure Transfers', color: '#3B82F6' },
      { icon: 'lightning', text: 'Instant Notifications', color: '#F59E0B' },
      { icon: 'star', text: 'Exclusive Rewards', color: '#8B5CF6' },
    ],
    cta: { text: 'Get Started', icon: 'arrow-forward' },
    route: '/(logistics)',
  };

  const handleInAppPremiumPush = async () => {
    if (!premiumPayload.title.trim()) {
      toast({
        title: 'Title is required.',
        description: 'Please enter a title before sending the notification.',
        status: 'warning',
        duration: 4000,
        isClosable: true,
      });
      return;
    }
    setSending(true);
    await fetch('https://api.cushyaccess.com/api/v1/notifications/send-in-app', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(premiumPayload),
    });
    setSending(false);
    toast({
      title: 'Notification Sent',
      status: 'success',
      duration: 3000,
    });
  };

  const handleAutofillDefaults = () => {
    setPremiumPayload({ ...samplePayload });
  };

  useEffect(() => {
    setPremiumPayload({ ...defaultPremiumPayload });
  }, []);


  return (
    <Box p={6}>
      <Heading size="sm" color="green.400" mb={4}>Send Premium Features Push</Heading>
      <VStack align="stretch" spacing={4}>
        <Text color="gray.300" fontSize="md" fontWeight="bold">Send a Premium Features notification to all users via IN-APP endpoint.</Text>
        <Box p={4} bg="gray.800" borderRadius="md" borderWidth="1px" borderColor="gray.700">
          <Text color="green.300" fontWeight="bold" mb={2}>Instructions for Admins:</Text>
          <Text color="gray.200" fontSize="sm" mb={1}>• <b>Title</b>, <b>Subtitle</b>, and <b>Description</b> are shown in the notification banner.</Text>
          <Text color="gray.200" fontSize="sm" mb={1}>• <b>Icon</b>: Use a valid icon name (e.g. <code>gift</code>, <code>truck</code>, <code>wallet</code>).</Text>
          <Text color="gray.200" fontSize="sm" mb={1}>• <b>Background Color</b>: Use a color name (e.g. <code>green</code>, <code>purple</code>, <code>blue</code>).</Text>
          <Text color="gray.200" fontSize="sm" mb={1}>• <b>Badges</b>: Comma-separated labels (e.g. <code>New, Limited Time</code>).</Text>
          <Text color="gray.200" fontSize="sm" mb={1}>• <b>Features</b>: Add multiple features, each with an icon, text, and color (e.g. <code>icon: truck, text: Fast Delivery, color: #10B981</code>).</Text>
          <Text color="gray.200" fontSize="sm" mb={1}>• <b>CTA</b>: Call-to-action button (e.g. <code>text: Get Started, icon: arrow-forward</code>).</Text>
          <Text color="gray.200" fontSize="sm" mb={1}>• <b>Route</b>: App screen to open (e.g. <code>/(logistics)</code>).</Text>
          <Text color="gray.400" fontSize="xs" mt={2}>All fields are optional except <b>title</b>. Only filled fields will be sent. Features and CTA will be stringified as required by the backend.</Text>
        </Box>
        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
          <Input
            placeholder="Title"
            value={premiumPayload.title}
            onChange={e => setPremiumPayload({ ...premiumPayload, title: e.target.value })}
            bg="gray.800"
            borderColor="gray.700"
            fontSize="sm"
          />
          <Input
            placeholder="Subtitle"
            value={premiumPayload.subtitle}
            onChange={e => setPremiumPayload({ ...premiumPayload, subtitle: e.target.value })}
            bg="gray.800"
            borderColor="gray.700"
            fontSize="sm"
          />
          <Input
            placeholder="Description"
            value={premiumPayload.description}
            onChange={e => setPremiumPayload({ ...premiumPayload, description: e.target.value })}
            bg="gray.800"
            borderColor="gray.700"
            fontSize="sm"
          />
          <Input
            placeholder="Icon (e.g. gift)"
            value={premiumPayload.icon}
            onChange={e => setPremiumPayload({ ...premiumPayload, icon: e.target.value })}
            bg="gray.800"
            borderColor="gray.700"
            fontSize="sm"
          />
          <Input
            placeholder="Background Color (e.g. green)"
            value={premiumPayload.backgroundColor}
            onChange={e => setPremiumPayload({ ...premiumPayload, backgroundColor: e.target.value })}
            bg="gray.800"
            borderColor="gray.700"
            fontSize="sm"
          />
          <Input
            placeholder="Route (e.g. /(logistics))"
            value={premiumPayload.route}
            onChange={e => setPremiumPayload({ ...premiumPayload, route: e.target.value })}
            bg="gray.800"
            borderColor="gray.700"
            fontSize="sm"
          />
        </SimpleGrid>
        <Input
          placeholder="Badges (comma separated)"
          value={premiumPayload.badges.join(', ')}
          onChange={e => setPremiumPayload({ ...premiumPayload, badges: e.target.value.split(',').map(b => b.trim()) })}
          bg="gray.800"
          borderColor="gray.700"
          fontSize="sm"
        />
        <HStack>
          <Input
            placeholder="CTA Text"
            value={premiumPayload.cta.text}
            onChange={e => setPremiumPayload({ ...premiumPayload, cta: { ...premiumPayload.cta, text: e.target.value } })}
            bg="gray.800"
            borderColor="gray.700"
            fontSize="sm"
          />
          <Input
            placeholder="CTA Icon"
            value={premiumPayload.cta.icon}
            onChange={e => setPremiumPayload({ ...premiumPayload, cta: { ...premiumPayload.cta, icon: e.target.value } })}
            bg="gray.800"
            borderColor="gray.700"
            fontSize="sm"
          />
        </HStack>
        {expoTokens.length > 0 && (
          <Box mt={4} p={4} bg="gray.900" borderRadius="md" borderWidth="1px" borderColor="gray.700">
            <Text color="blue.200" fontWeight="bold" mb={2}>Fetched Expo Tokens ({expoTokens.length}):</Text>
            <Box maxH="200px" overflowY="auto" fontSize="xs" color="blue.100">
              {expoTokens.map((token, idx) => (
                <Text key={token} isTruncated title={token}>{idx + 1}. {token}</Text>
              ))}
            </Box>
          </Box>
        )}
        <VStack align="stretch" spacing={2}>
          <Text color="green.200" fontSize="sm" fontWeight="bold">Features</Text>
          {premiumPayload.features.map((feature, idx) => (
            <HStack key={idx}>
              <Input
                placeholder="Icon"
                value={feature.icon}
                onChange={e => {
                  const features = [...premiumPayload.features];
                  features[idx] = { ...features[idx], icon: e.target.value };
                  setPremiumPayload({ ...premiumPayload, features });
                }}
                bg="gray.800"
                borderColor="gray.700"
                fontSize="sm"
              />
              <Input
                placeholder="Text"
                value={feature.text}
                onChange={e => {
                  const features = [...premiumPayload.features];
                  features[idx] = { ...features[idx], text: e.target.value };
                  setPremiumPayload({ ...premiumPayload, features });
                }}
                bg="gray.800"
                borderColor="gray.700"
                fontSize="sm"
              />
              <Input
                placeholder="Color"
                value={feature.color}
                onChange={e => {
                  const features = [...premiumPayload.features];
                  features[idx] = { ...features[idx], color: e.target.value };
                  setPremiumPayload({ ...premiumPayload, features });
                }}
                bg="gray.800"
                borderColor="gray.700"
                fontSize="sm"
              />
              <Button size="xs" colorScheme="red" onClick={() => {
                const features = premiumPayload.features.filter((_, i) => i !== idx);
                setPremiumPayload({ ...premiumPayload, features });
              }}>Remove</Button>
            </HStack>
          ))}

          <Button
            size="sm"
            variant="outline"
            colorScheme="green"
            onClick={handleAutofillDefaults}
          >
            Auto-Fill Example Values
          </Button>

          <Button size="sm" colorScheme="green" variant="outline" onClick={() => setPremiumPayload({ ...premiumPayload, features: [...premiumPayload.features, { icon: '', text: '', color: '' }] })}>Add Feature</Button>
        </VStack>
        <HStack spacing={4}>
          <Button
            colorScheme="green"
            isLoading={sending}
            onClick={handleInAppPremiumPush}
            leftIcon={<Icon as={TrendingUp} />}
          >
            Send IN-APP Premium Push
          </Button>
          <Button
            colorScheme="blue"
            variant="outline"
            isLoading={fetchingTokens}
            onClick={handleFetchTokens}
          >
            Fetch & Save Expo Tokens
          </Button>
        </HStack>
      </VStack>
    </Box>
  );
};

export default PremiumPushPage;
