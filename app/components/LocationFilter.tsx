import { useMemo } from 'react';

interface Location {
  id: string;
  name: string;
  displayName: string;
  filters: {
    sunlight: boolean;
    lavaTubes: boolean;
    iceProximity: boolean;
    flatTerrain: boolean;
    spaceportDistance: boolean;
    sufficientArea: boolean;
  };
}

const locations: Location[] = [
  {
    id: 'shackleton',
    name: 'shackleton',
    displayName: 'Кратер Шеклтон',
    filters: {
      sunlight: true,
      lavaTubes: false,
      iceProximity: true,
      flatTerrain: false,
      spaceportDistance: false,
      sufficientArea: false
    }
  },
  {
    id: 'cabeus',
    name: 'cabeus',
    displayName: 'Кратер Кабеус',
    filters: {
      sunlight: false,
      lavaTubes: true,
      iceProximity: true,
      flatTerrain: false,
      spaceportDistance: false,
      sufficientArea: false
    }
  },
  {
    id: 'haworth',
    name: 'haworth',
    displayName: 'Плато Хаворт',
    filters: {
      sunlight: true,
      lavaTubes: false,
      iceProximity: false,
      flatTerrain: true,
      spaceportDistance: false,
      sufficientArea: true
    }
  },
  {
    id: 'malapert',
    name: 'malapert',
    displayName: 'Гора Малаперт',
    filters: {
      sunlight: false,
      lavaTubes: true,
      iceProximity: false,
      flatTerrain: false,
      spaceportDistance: false,
      sufficientArea: false
    }
  },
  {
    id: '11',
    name: '11',
    displayName: '11',
    filters: {
      sunlight: false,
      lavaTubes: false,
      iceProximity: false,
      flatTerrain: true,
      spaceportDistance: false,
      sufficientArea: true
    }
  },
  {
    id: '12',
    name: '12',
    displayName: '12',
    filters: {
      sunlight: false,
      lavaTubes: false,
      iceProximity: false,
      flatTerrain: false,
      spaceportDistance: true,
      sufficientArea: false
    }
  }
];

interface LocationFilterProps {
  activeFilters: {
    sunlight: boolean;
    lavaTubes: boolean;
    iceProximity: boolean;
    flatTerrain: boolean;
    spaceportDistance: boolean;
    sufficientArea: boolean;
  };
  filtersApplied: boolean;
}

export function useLocationFilter({ activeFilters, filtersApplied }: LocationFilterProps) {
  return useMemo(() => {
    if (!filtersApplied) {
      return locations.reduce((acc, location) => {
        acc[location.id] = { isActive: true, location };
        return acc;
      }, {} as Record<string, { isActive: boolean; location: Location }>);
    }

    const activeFilterKeys = Object.entries(activeFilters)
      .filter(([_, value]) => value)
      .map(([key]) => key);

    if (activeFilterKeys.length === 0) {
      return locations.reduce((acc, location) => {
        acc[location.id] = { isActive: true, location };
        return acc;
      }, {} as Record<string, { isActive: boolean; location: Location }>);
    }

    return locations.reduce((acc, location) => {
      const isActive = activeFilterKeys.some(filterKey => location.filters[filterKey as keyof typeof location.filters]);
      acc[location.id] = { isActive, location };
      return acc;
    }, {} as Record<string, { isActive: boolean; location: Location }>);
  }, [activeFilters, filtersApplied]);
}

export type { Location };
export { locations }; 