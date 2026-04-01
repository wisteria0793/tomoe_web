import React, { createContext, useContext, useState } from 'react';

const FacilityContext = createContext();

export const FacilityProvider = ({ children }) => {
    const [selectedFacility, setSelectedFacility] = useState(null);

    return (
        <FacilityContext.Provider value={{ selectedFacility, setSelectedFacility }}>
            {children}
        </FacilityContext.Provider>
    );
};

export const useFacility = () => {
    return useContext(FacilityContext);
}; 
