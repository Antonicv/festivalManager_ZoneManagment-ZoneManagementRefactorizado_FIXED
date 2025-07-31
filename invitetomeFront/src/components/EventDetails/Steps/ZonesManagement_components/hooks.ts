/**
 * =============================================================================
 * HOOK - useZonesManagement
 * =============================================================================
 * 
 * 
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import type { 
  EventData, 
  ZoneType, 
  Checkpoint, 
  Gate, 
  Zone, 
  Subzone 
} from './types';
import { EventItemEndpoint, createInitialData, isFirstVisit } from './services';

// ========== INTERFACE DEL HOOK ==========
export interface UseZonesManagementReturn {
  // Estados principales
  eventData: EventData | null;
  loading: boolean;
  notification: string | null;
  setNotification: (message: string | null) => void;
  initialDataCreated: boolean;
  showInitialMessage: boolean;

  // Datos clasificados
  gates: Gate[];
  venues: Zone[];
  zones: Zone[];
  subzones: Subzone[];
  zonesArray: ZoneType[];
  allCheckpoints: Checkpoint[];
  summary: {
    totalZones: number;
    totalGates: number;
    totalVenues: number;
    totalSubzones: number;
    totalCheckpoints: number;
    totalCapacity: number;
    totalOccupancy: number;
  };
  subzonesByParent: { [parentZoneId: string]: Subzone[] };

  // Estados de diálogos
  gateDialogOpen: boolean;
  setGateDialogOpen: (open: boolean) => void;
  zoneDialogOpen: boolean;
  setZoneDialogOpen: (open: boolean) => void;
  venueDialogOpen: boolean;
  setVenueDialogOpen: (open: boolean) => void;
  checkpointDialogOpen: boolean;
  setCheckpointDialogOpen: (open: boolean) => void;
  subzoneDialogOpen: boolean;
  setSubzoneDialogOpen: (open: boolean) => void;
  selectedZone: ZoneType | null;

  // Estados de navegación
  currentPath: string[];
  summaryView: 'overview' | 'gates' | 'zones' | 'details' | 'checkpoints';
  setSummaryView: (view: 'overview' | 'gates' | 'zones' | 'details' | 'checkpoints') => void;

  // Estados de expansión
  expandedGates: boolean;
  setExpandedGates: (expanded: boolean) => void;
  expandedVenues: boolean;
  setExpandedVenues: (expanded: boolean) => void;
  expandedZones: boolean;
  setExpandedZones: (expanded: boolean) => void;
  expandedIndividualGates: { [zoneId: string]: boolean };
  expandedIndividualVenues: { [zoneId: string]: boolean };
  expandedIndividualZones: { [zoneId: string]: boolean };
  expandedSubzones: { [parentZoneId: string]: boolean };
  updatePolicies: { [zoneId: string]: boolean };

  // Operaciones CRUD
  handleDeleteCheckpoint: (zone: ZoneType, checkpoint: Checkpoint) => Promise<void>;
  handleUpdateCheckpoint: (zone: ZoneType, checkpoint: Checkpoint) => Promise<void>;
  setEventData: (data: EventData | ((prev: EventData | null) => EventData | null)) => void;

  // Handlers UI
  handleAddCheckpoint: (zone: ZoneType) => void;
  handleAddSubzoneToZone: (parentZone: ZoneType) => void;
  toggleUpdatePolicy: (zoneId: string, event: React.MouseEvent) => void;
  handleBreadcrumbClick: (pathIndex: number) => void;
  updateBreadcrumbPath: () => void;
  getBreadcrumbIcon: (index?: number) => React.ReactElement;
  handleIndividualGateExpansion: (gateId: string) => void;
  handleIndividualVenueExpansion: (venueId: string) => void;  handleIndividualZoneExpansion: (zoneId: string) => void;
  handleSubzoneExpansion: (parentZoneId: string) => void;

  // Utilidades
  dismissInitialMessage: () => void;
}

// ========== HOOK PRINCIPAL ==========
export const useZonesManagement = (): UseZonesManagementReturn => {
  
  // Estados principales
  const [eventData, setEventData] = useState<EventData | null>(null);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState<string | null>(null);
  const [initialDataCreated, setInitialDataCreated] = useState(false);
  const [showInitialMessage, setShowInitialMessage] = useState(true);

  // Función para cerrar el mensaje inicial
  const dismissInitialMessage = useCallback(() => {
    setShowInitialMessage(false);
  }, []);

  // Estados de diálogos
  const [gateDialogOpen, setGateDialogOpen] = useState(false);
  const [zoneDialogOpen, setZoneDialogOpen] = useState(false);
  const [venueDialogOpen, setVenueDialogOpen] = useState(false);
  const [checkpointDialogOpen, setCheckpointDialogOpen] = useState(false);
  const [subzoneDialogOpen, setSubzoneDialogOpen] = useState(false);
  const [selectedZone, setSelectedZone] = useState<ZoneType | null>(null);

  // Estados de navegación
  const [currentPath, setCurrentPath] = useState<string[]>([]);
  const [summaryView, setSummaryView] = useState<'overview' | 'gates' | 'zones' | 'details' | 'checkpoints'>('overview');

  // Estados de expansión
  const [expandedGates, setExpandedGates] = useState(false);
  const [expandedVenues, setExpandedVenues] = useState(false);
  const [expandedZones, setExpandedZones] = useState(false);
  const [expandedIndividualGates, setExpandedIndividualGates] = useState<{ [zoneId: string]: boolean }>({});
  const [expandedIndividualVenues, setExpandedIndividualVenues] = useState<{ [zoneId: string]: boolean }>({});
  const [expandedIndividualZones, setExpandedIndividualZones] = useState<{ [zoneId: string]: boolean }>({});
  const [expandedSubzones, setExpandedSubzones] = useState<{ [parentZoneId: string]: boolean }>({});
  const [updatePolicies, setUpdatePolicies] = useState<{ [zoneId: string]: boolean }>({});

  // ========== EFECTO DE CARGA INICIAL ==========
  useEffect(() => {
    const loadEventData = async () => {
      try {
        const data = await EventItemEndpoint.getEventData('EVENT_050');
        
        if (isFirstVisit(data)) {
          const initialData = createInitialData('EVENT_050');
          setEventData(initialData);
          setInitialDataCreated(true);
          setNotification('Datos iniciales creados. ¡Comienza configurando tus zonas!');
        } else {
          setEventData(data);
          setInitialDataCreated(false);
        }
      } catch (error) {
        console.error('Error loading event data:', error);
        setNotification('Error cargando datos del evento');
        const initialData = createInitialData('EVENT_050');
        setEventData(initialData);
        setInitialDataCreated(true);
      } finally {
        setLoading(false);
      }
    };

    loadEventData();
  }, []);

  // ========== DATOS CLASIFICADOS ==========
  const zonesArray = useMemo(() => {
    if (!eventData?.data?.zones) return [];
    return Object.values(eventData.data.zones);
  }, [eventData]);

  const gates = useMemo(() => 
    zonesArray.filter((zone): zone is Gate => zone.type === 'GATE'),
    [zonesArray]
  );

  const venues = useMemo(() => 
    zonesArray.filter((zone): zone is Zone => zone.type === 'VENUE'),
    [zonesArray]
  );

  const zones = useMemo(() => 
    zonesArray.filter((zone): zone is Zone => zone.type === 'ZONE'),
    [zonesArray]
  );

  const subzones = useMemo(() => 
    zonesArray.filter((zone): zone is Subzone => zone.type === 'SUBZONE'),
    [zonesArray]
  );

  const allCheckpoints = useMemo(() => {
    const checkpoints: Checkpoint[] = [];
    zonesArray.forEach(zone => {
      if (zone.checkPoints) {
        checkpoints.push(...Object.values(zone.checkPoints));
      }
    });
    return checkpoints;
  }, [zonesArray]);

  const summary = useMemo(() => {
    const totalCapacity = zonesArray.reduce((sum, zone) => sum + (zone.maxCapacity || 0), 0);
    const totalOccupancy = zonesArray.reduce((sum, zone) => sum + (zone.currentOccupancy || 0), 0);

    return {
      totalZones: zones.length,
      totalGates: gates.length,
      totalVenues: venues.length,
      totalSubzones: subzones.length,
      totalCheckpoints: allCheckpoints.length,
      totalCapacity,
      totalOccupancy
    };
  }, [gates, venues, zones, subzones, allCheckpoints, zonesArray]);

  const subzonesByParent = useMemo(() => {
    const grouped: { [parentZoneId: string]: Subzone[] } = {};
    subzones.forEach(subzone => {
      const parentId = subzone.parentZoneId;
      if (!grouped[parentId]) {
        grouped[parentId] = [];
      }
      grouped[parentId].push(subzone);
    });
    return grouped;
  }, [subzones]);

  // ========== OPERACIONES CRUD ==========
  const handleDeleteCheckpoint = useCallback(async (zone: ZoneType, checkpoint: Checkpoint) => {
    if (!eventData) return;

    try {
      const zonesCopy = { ...eventData.data.zones };
      const zoneCopy = { ...zonesCopy[zone.zoneId] };

      if (zoneCopy.checkPoints) {
        delete zoneCopy.checkPoints[checkpoint.checkpointId];
      }

      zonesCopy[zone.zoneId] = zoneCopy;

      const updatedEventData = {
        ...eventData,
        data: { zones: zonesCopy }
      };

      setEventData(updatedEventData);
      setNotification(`Checkpoint "${checkpoint.name}" eliminado exitosamente`);
      
      await EventItemEndpoint.saveEventItem(updatedEventData);
    } catch (error) {
      console.error('Error deleting checkpoint:', error);
      setNotification('Error eliminando checkpoint');
    }
  }, [eventData]);

  const handleUpdateCheckpoint = useCallback(async (zone: ZoneType, checkpoint: Checkpoint) => {
    if (!eventData) return;

    try {
      const zonesCopy = { ...eventData.data.zones };
      const zoneCopy = { ...zonesCopy[zone.zoneId] };

      if (zoneCopy.checkPoints) {
        zoneCopy.checkPoints = {
          ...zoneCopy.checkPoints,
          [checkpoint.checkpointId]: checkpoint
        };
      }

      zonesCopy[zone.zoneId] = zoneCopy;

      const updatedEventData = {
        ...eventData,
        data: { zones: zonesCopy }
      };

      setEventData(updatedEventData);
      setNotification(`Checkpoint "${checkpoint.name}" actualizado exitosamente`);
      
      await EventItemEndpoint.saveEventItem(updatedEventData);
    } catch (error) {
      console.error('Error updating checkpoint:', error);
      setNotification('Error actualizando checkpoint');
    }
  }, [eventData]);

  // ========== HANDLERS UI ==========
  const handleAddCheckpoint = useCallback((zone: ZoneType) => {
    setSelectedZone(zone);
    setCheckpointDialogOpen(true);
  }, []);

  const handleAddSubzoneToZone = useCallback((parentZone: ZoneType) => {
    setSelectedZone(parentZone);
    setSubzoneDialogOpen(true);
  }, []);

  const toggleUpdatePolicy = useCallback((zoneId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    setUpdatePolicies(prev => ({
      ...prev,
      [zoneId]: !prev[zoneId]
    }));
  }, []);

  const handleBreadcrumbClick = useCallback((pathIndex: number) => {
    if (pathIndex === 0) {
      setSummaryView('overview');
      setCurrentPath([]);
    }
  }, []);

  const updateBreadcrumbPath = useCallback(() => {
    // Placeholder implementation
  }, []);
  const getBreadcrumbIcon = useCallback((index?: number) => {
    return React.createElement('span', null, index === 0 ? '🏠' : '📍');
  }, []);

  const handleIndividualGateExpansion = useCallback((gateId: string) => {
    setExpandedIndividualGates(prev => ({
      ...prev,
      [gateId]: !prev[gateId]
    }));
  }, []);

  const handleIndividualVenueExpansion = useCallback((venueId: string) => {
    setExpandedIndividualVenues(prev => ({
      ...prev,
      [venueId]: !prev[venueId]
    }));
  }, []);

  const handleIndividualZoneExpansion = useCallback((zoneId: string) => {
    setExpandedIndividualZones(prev => ({
      ...prev,
      [zoneId]: !prev[zoneId]
    }));
  }, []);

  const handleSubzoneExpansion = useCallback((parentZoneId: string) => {
    setExpandedSubzones(prev => ({
      ...prev,
      [parentZoneId]: !prev[parentZoneId]
    }));
  }, []);

  // ========== RETURN DEL HOOK ==========
  return {
    // Estados principales
    eventData,
    loading,
    notification,
    setNotification,
    initialDataCreated,
    showInitialMessage,

    // Datos clasificados
    gates,
    venues,
    zones,
    subzones,
    zonesArray,
    allCheckpoints,
    summary,
    subzonesByParent,

    // Estados de diálogos
    gateDialogOpen,
    setGateDialogOpen,
    zoneDialogOpen,
    setZoneDialogOpen,
    venueDialogOpen,
    setVenueDialogOpen,
    checkpointDialogOpen,
    setCheckpointDialogOpen,
    subzoneDialogOpen,
    setSubzoneDialogOpen,
    selectedZone,

    // Estados de navegación
    currentPath,
    summaryView,
    setSummaryView,

    // Estados de expansión
    expandedGates,
    setExpandedGates,
    expandedVenues,
    setExpandedVenues,
    expandedZones,
    setExpandedZones,
    expandedIndividualGates,
    expandedIndividualVenues,
    expandedIndividualZones,
    expandedSubzones,
    updatePolicies,

    // Operaciones CRUD
    handleDeleteCheckpoint,
    handleUpdateCheckpoint,
    setEventData,

    // Handlers UI
    handleAddCheckpoint,
    handleAddSubzoneToZone,
    toggleUpdatePolicy,
    handleBreadcrumbClick,
    updateBreadcrumbPath,
    getBreadcrumbIcon,
    handleIndividualGateExpansion,
    handleIndividualVenueExpansion,    handleIndividualZoneExpansion,
    handleSubzoneExpansion,

    // Utilidades
    dismissInitialMessage,
  };
};

export default useZonesManagement;
