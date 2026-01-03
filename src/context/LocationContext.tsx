import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface LocationContextType {
    selectedLocation: string;
    setSelectedLocation: (location: string) => void;
    locationLabel: string;
    locations: { value: string; label: string }[];
}

const LOCATIONS = [
    { value: 'all', label: 'All Locations' },
    { value: 'minna', label: 'Minna' },
    { value: 'abuja', label: 'Abuja' },
    { value: 'lagos', label: 'Lagos' },
];

const LocationContext = createContext<LocationContextType | undefined>(undefined);

export const LocationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [selectedLocation, setSelectedLocation] = useState<string>('all');

    const locationLabel = LOCATIONS.find(l => l.value === selectedLocation)?.label || 'All Locations';

    return (
        <LocationContext.Provider
            value={{
                selectedLocation,
                setSelectedLocation,
                locationLabel,
                locations: LOCATIONS,
            }}
        >
            {children}
        </LocationContext.Provider>
    );
};

export const useLocationFilter = (): LocationContextType => {
    const context = useContext(LocationContext);
    if (!context) {
        throw new Error('useLocationFilter must be used within a LocationProvider');
    }
    return context;
};

// Helper to check if an address/location string matches the selected location filter
export const matchesLocationFilter = (
    address: string | undefined | null,
    selectedLocation: string
): boolean => {
    if (!selectedLocation || selectedLocation === 'all') return true;
    if (!address) return false;
    return address.toLowerCase().includes(selectedLocation.toLowerCase());
};

export default LocationContext;
