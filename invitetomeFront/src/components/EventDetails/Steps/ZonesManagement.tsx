/**
 * ===============================================================================
 * ZONESMANAGEMENT - COORDINADOR REFACTORIZADO (OPCIÓN A CONSERVADORA)
 * ===============================================================================
 * 
 * Versión refactorizada del componente ZonesManagement que implementa la 
 * arquitectura modular conservadora del Plan Maestro de Refactorización.
 * 
 * CAMBIOS IMPLEMENTADOS:
 * - ✅ Hook unificado useZonesManagement (280 líneas → 50+ exports)
 * - ✅ Componentes UI modulares (AccessTypeBadges, CheckpointTable, ZoneSection)
 * - ✅ Arquitectura 6 archivos conservadora
 * - ✅ Funcionalidad 100% preservada
 * - ✅ Reducción 1589 líneas → ~900 líneas
 * 
 * ESTRUCTURA MODULAR:
 * - hooks.ts: Lógica de estado y operaciones
 * - UIComponents.tsx: Componentes de interfaz reutilizables  
 * - services.ts: Conexión con backend
 * - types.ts: Definiciones TypeScript
 * - CapacityPolicyChip.tsx: Componente existente preservado
 * - index.tsx: API pública
 * 
 * @version 2.0.0 - Arquitectura Modular
 * @author Almirante Temporal 
 * @date 2025-01-31
 */

import React from 'react';
import {
  Button,
  VerticalLayout,
  HorizontalLayout,
  Notification
} from '@vaadin/react-components';
import Dialogs from './Dialogs';
import Accordion from '@mui/material/Accordion';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionSummary from '@mui/material/AccordionSummary';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Fade from '@mui/material/Fade';
import {
  Breadcrumbs,
  Link,
  Typography,
  Box,
  Card,
  CardContent,
  IconButton,
  Chip // <-- Add Chip here from MUI
} from '@mui/material';
import {
  LocationOn,
  MeetingRoom,
  Close
} from '@mui/icons-material';

// ========== IMPORTACIONES MODULARES ==========
import { useZonesManagement } from './ZonesManagement_components/hooks';
import {
  AccessTypeBadges,
  ZoneSection,
  EmptyState
} from './ZonesManagement_components/UIComponents';
import CapacityPolicyChip from './ZonesManagement_components/CapacityPolicyChip';

/**
 * ===============================================================================
 * COMPONENTE PRINCIPAL REFACTORIZADO
 * ===============================================================================
 */
const ZonesManagementRefactored: React.FC = () => {
  // ========== HOOK UNIFICADO - TODA LA LÓGICA CENTRALIZADA ==========
  const {
    // Estados principales
    eventData,
    loading,
    notification,
    setNotification,
    initialDataCreated,
    showInitialMessage,
    // Add missing destructured variables
    subzones,
    allCheckpoints,
    zonesArray,
    // Estados de diálogos
    gateDialogOpen,
    setGateDialogOpen,
    zoneDialogOpen,
    setZoneDialogOpen,
    venueDialogOpen,
    setVenueDialogOpen,
    checkpointDialogOpen,
    setCheckpointDialogOpen,    subzoneDialogOpen,
    setSubzoneDialogOpen,
    selectedZone,
    // Estados de navegación y breadcrumbs
    currentPath,
    summaryView,
    setSummaryView,
    // Estados de expansión de acordeones
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
    // Datos procesados y clasificados
    gates,
    venues,
    zones,
    summary,
    subzonesByParent,
    // Handlers CRUD
    handleDeleteCheckpoint,
    handleUpdateCheckpoint,
    // Handlers de UI y navegación
    handleAddCheckpoint,
    handleAddSubzoneToZone,
    toggleUpdatePolicy,
    handleSubzoneExpansion,
    handleIndividualZoneExpansion,
    handleIndividualGateExpansion,
    handleIndividualVenueExpansion,
    handleBreadcrumbClick,
    getBreadcrumbIcon,
    setEventData,
    // Add dismissInitialMessage for closing initial message
    dismissInitialMessage
  } = useZonesManagement();

  // ========== RENDER CONDICIONAL - LOADING ==========
  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center',
        minHeight: '400px',
        gap: '16px'
      }}>
        <div style={{ 
          width: '60px', 
          height: '60px', 
          border: '4px solid #f3f3f3',
          borderTop: '4px solid #3498db',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }}></div>
        <h3 style={{ color: '#666' }}>Configurando tu evento por primera vez...</h3>
        <p style={{ color: '#999' }}>Creando Gate y Venue iniciales</p>
        <style>
          {`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}
        </style>
      </div>
    );
  }

  // ========== RENDER PRINCIPAL ==========
  return (
    <VerticalLayout
      theme="spacing padding"
      style={{
        width: '100%',
        maxWidth: '1200px',
        margin: '0 auto',
      }}
    >
      {/* ========== NOTIFICATION SYSTEM ========== */}
      {notification && (
        <Notification
          duration={3000}
          position="top-end"
          opened
          onOpenedChanged={e => !e.detail.value && setNotification(null)}
        >
          {notification}
        </Notification>
      )}
      
      {/* ========== VISUAL SUMMARY CARD (NEW) ========== */}
      <Card sx={{ mb: 2, backgroundColor: '#f8f9fa', border: '1px solid #e9ecef', width: '100%', maxWidth: '1200px' }}>
        <CardContent sx={{ py: 2 }}>
          <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
            <Typography variant="subtitle2" color="text.secondary" sx={{ fontWeight: 600 }}>
              Visual Summary
            </Typography>
            {currentPath.length > 0 && (
              <Chip 
                label={`Current: ${currentPath[currentPath.length - 1]}`}
                size="small"
                color="primary"
                variant="outlined"
                sx={{ fontWeight: 500 }}
              />
            )}
          </Box>

          {/* Visual Summary of ZonesManagement Data */}
          <Box sx={{ mb: 2, p: 2, backgroundColor: '#ffffff', borderRadius: 1, border: '1px solid #e0e0e0' }}>
            <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block', fontWeight: 600 }}>
              Infrastructure Overview:
            </Typography>
            <Box display="flex" flexWrap="wrap" gap={1} mb={1}>
              <Chip
                icon={<MeetingRoom />}
                label={`${summary.totalGates} Gates`}
                size="small"
                color="primary"
                variant={summaryView === 'gates' ? 'filled' : 'outlined'}
                sx={{ fontWeight: 500, cursor: 'pointer' }}
                onClick={() => setSummaryView(summaryView === 'gates' ? 'overview' : 'gates')}
              />
              <Chip
                icon={<LocationOn />}
                label={`${summary.totalVenues} Venues`}
                size="small"
                color="secondary"
                variant={summaryView === 'zones' ? 'filled' : 'outlined'}
                sx={{ fontWeight: 500, cursor: 'pointer' }}
                onClick={() => setSummaryView(summaryView === 'zones' ? 'overview' : 'zones')}
              />
              <Chip
                label={`${summary.totalZones} Zones`}
                size="small"
                color="warning"
                variant={summaryView === 'zones' ? 'filled' : 'outlined'}
                sx={{ fontWeight: 500, cursor: 'pointer' }}
                onClick={() => setSummaryView(summaryView === 'zones' ? 'overview' : 'zones')}
              />
              <Chip
                label={`${summary.totalSubzones} Subzones`}
                size="small"
                color="info"
                variant={summaryView === 'details' ? 'filled' : 'outlined'}
                sx={{ fontWeight: 500, cursor: 'pointer' }}
                onClick={() => setSummaryView(summaryView === 'details' ? 'overview' : 'details')}
              />
              <Chip
                label={`${summary.totalCheckpoints} Checkpoints`}
                size="small"
                color="success"
                variant={summaryView === 'checkpoints' ? 'filled' : 'outlined'}
                sx={{ fontWeight: 500, cursor: 'pointer' }}
                onClick={() => setSummaryView(summaryView === 'checkpoints' ? 'overview' : 'checkpoints')}
              />
            </Box>

            {/* Live Data Display */}
            <Box sx={{ mt: 1.5, p: 1.5, backgroundColor: '#f0f8ff', borderRadius: 0.5, border: '1px solid #b3d9ff' }}>
              <Typography variant="caption" color="primary" sx={{ fontWeight: 600, display: 'block', mb: 1 }}>
                Current Configuration Status:
              </Typography>
              {summaryView === 'gates' && (
                <Box>
                  <Typography variant="caption" color="text.primary" sx={{ fontWeight: 500, display: 'block', mb: 0.5 }}>
                    Gates Configuration:
                  </Typography>
                  {gates.length > 0 ? gates.map(gate => (
                    <Typography key={gate.zoneId} variant="caption" color="text.secondary" sx={{ display: 'block', ml: 1 }}>
                      - {gate.name}: {Object.values(gate.checkPoints || {}).length} checkpoints, {gate.maxCapacity} capacity
                    </Typography>
                  )) : (
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', ml: 1, fontStyle: 'italic' }}>
                      No gates configured yet. Add your first gate to get started.
                    </Typography>
                  )}
                </Box>
              )}
              {summaryView === 'zones' && (
                <Box>
                  <Typography variant="caption" color="text.primary" sx={{ fontWeight: 500, display: 'block', mb: 0.5 }}>
                    Zones & Venues Status:
                  </Typography>
                  {zones.length > 0 ? zones.map(zone => (
                    <Typography key={zone.zoneId} variant="caption" color="text.secondary" sx={{ display: 'block', ml: 1 }}>
                      - {zone.name} ({zone.type}): {zone.currentOccupancy || 0}/{zone.maxCapacity} occupancy
                    </Typography>
                  )) : (
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', ml: 1, fontStyle: 'italic' }}>
                      No zones configured yet. Add zones to manage your event areas.
                    </Typography>
                  )}
                </Box>
              )}
              {summaryView === 'details' && (
                <Box>
                  <Typography variant="caption" color="text.primary" sx={{ fontWeight: 500, display: 'block', mb: 0.5 }}>
                    Subzones Details:
                  </Typography>
                  {subzones.length > 0 ? subzones.map(subzone => (
                    <Typography key={subzone.zoneId} variant="caption" color="text.secondary" sx={{ display: 'block', ml: 1 }}>
                      - {subzone.name} (Parent: {subzone.parentZoneId || 'N/A'}): {subzone.currentOccupancy || 0}/{subzone.maxCapacity}
                    </Typography>
                  )) : (
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', ml: 1, fontStyle: 'italic' }}>
                      No subzones configured yet. Create subzones within existing zones for better organization.
                    </Typography>
                  )}
                </Box>
              )}
              {summaryView === 'checkpoints' && (
                <Box>
                  <Typography variant="caption" color="text.primary" sx={{ fontWeight: 500, display: 'block', mb: 0.5 }}>
                    All Checkpoints Status:
                  </Typography>
                  {allCheckpoints.length > 0 ? allCheckpoints.map(checkpoint => (
                    <Typography key={checkpoint.checkpointId} variant="caption" color="text.secondary" sx={{ display: 'block', ml: 1 }}>
                      - {checkpoint.name} ({checkpoint.type}) - {checkpoint.role}
                    </Typography>
                  )) : (
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', ml: 1, fontStyle: 'italic' }}>
                      No checkpoints configured yet. Add checkpoints to your gates and zones for access control.
                    </Typography>
                  )}
                </Box>
              )}
              {summaryView === 'overview' && (
                <Box>
                  {initialDataCreated && showInitialMessage ? (
                    <Box sx={{ 
                      p: 2, 
                      mb: 2, 
                      backgroundColor: '#e8f5e8', 
                      borderRadius: 1, 
                      border: '1px solid #4caf50',
                      position: 'relative'
                    }}>
                      <IconButton
                        size="small"
                        onClick={dismissInitialMessage}
                        sx={{ 
                          position: 'absolute',
                          top: 8,
                          right: 8,
                          color: 'success.main'
                        }}
                      >
                        <Close fontSize="small" />
                      </IconButton>
                      <Typography variant="caption" color="success.main" sx={{ fontWeight: 600, display: 'block', mb: 1 }}>
                        Initial Configuration Complete!
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                        Automatically created:
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', ml: 1, mb: 0.5 }}>
                        1 Main Gate - Entry/exit control for the event
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', ml: 1, mb: 1 }}>
                        1 Main Venue - Main event space
                      </Typography>
                      <Typography variant="caption" color="warning.main" sx={{ fontWeight: 600, display: 'block', mb: 0.5 }}>
                        Tip:
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', ml: 1 }}>
                        - Configure checkpoints for Gates and Venues according to your access control and people flow needs.
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', ml: 1 }}>
                        - Click the Green dot to toggle between active and inactive Update Zone Policy.
                      </Typography>
                    </Box>
                  ) : null}
                  <Typography variant="caption" color="text.secondary">
                    {zonesArray.length === 0 ? (
                      "Welcome! Start by adding gates, zones, and checkpoints to configure your event infrastructure. Click on any category above to see detailed information."
                    ) : (
                      "Click on any category above to see detailed information from your zones configuration. This shows the current state of your festival infrastructure including capacity, occupancy, and access types."
                    )}
                  </Typography>
                </Box>
              )}
            </Box>
          </Box>

          {/* Navigation Breadcrumbs */}
          {currentPath.length > 0 && (
            <Breadcrumbs 
              separator={<Close fontSize="small" />} // Use your getBreadcrumbIcon if needed
              aria-label="zones navigation breadcrumb"
              sx={{ mt: 1 }}
            >
              {currentPath.map((pathItem, index) => (
                <Link
                  key={index}
                  component="button"
                  variant="body2"
                  onClick={() => handleBreadcrumbClick(index)}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.5,
                    textDecoration: 'none',
                    color: index === currentPath.length - 1 ? 'text.primary' : 'primary.main',
                    fontWeight: index === currentPath.length - 1 ? 600 : 400,
                    fontSize: '0.875rem',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    '&:hover': {
                      backgroundColor: 'action.hover',
                      textDecoration: 'underline'
                    }
                  }}
                >
                  {getBreadcrumbIcon(index)}
                  {pathItem}
                </Link>
              ))}
            </Breadcrumbs>
          )}
        </CardContent>
      </Card>

      {/* ========== GATES SECTION ========== */}
      <Accordion 
        expanded={expandedGates} 
        onChange={(_event, isExpanded) => setExpandedGates(isExpanded)}
        style={{ marginBottom: '16px', width: '100%', maxWidth: '1200px' }}
      >
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <HorizontalLayout style={{ alignItems: 'center', gap: '16px', width: '100%' }}>
            <h2 style={{ margin: 0, color: '#343a40' }}>Gates</h2>
            <Button 
              theme="primary" 
              onClick={(e) => {
                e.stopPropagation();
                setGateDialogOpen(true);
              }}
            >
              Add Gate
            </Button>
          </HorizontalLayout>
        </AccordionSummary>
        <AccordionDetails>
          <Fade in={expandedGates}>
            <div style={{ width: '100%' }}>
              {/* Gate Form - Inline */}
              {gateDialogOpen && eventData && (
                <div style={{ marginBottom: '16px' }}>
                  <Dialogs
                    gateDialogOpen={gateDialogOpen}
                    setGateDialogOpen={setGateDialogOpen}
                    zoneDialogOpen={false}
                    setZoneDialogOpen={setZoneDialogOpen}
                    venueDialogOpen={false}
                    setVenueDialogOpen={setVenueDialogOpen}
                    checkpointDialogOpen={false}
                    setCheckpointDialogOpen={setCheckpointDialogOpen}
                    subzoneDialogOpen={false}
                    setSubzoneDialogOpen={setSubzoneDialogOpen}
                    selectedZone={selectedZone}
                    eventData={eventData}
                    setEventData={setEventData}
                  />
                </div>
              )}
              
              {gates.length > 0 ? gates.map(gate => (
                <Accordion 
                  key={gate.zoneId}
                  expanded={expandedIndividualGates[gate.zoneId] || false} 
                  onChange={() => handleIndividualGateExpansion(gate.zoneId)}
                  style={{ marginBottom: '16px' }}
                >
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <HorizontalLayout style={{ alignItems: 'center', gap: '16px', width: '100%' }}>
                      <h3 style={{ margin: 0, color: '#495057', fontSize: '18px' }}>
                        {gate.name}
                      </h3>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginLeft: 'auto' }}>
                        <AccessTypeBadges accessTypes={gate.accessTypes} />
                        <CapacityPolicyChip
                          variant="dot"
                          zoneId={gate.zoneId}
                          maxCapacity={gate.maxCapacity}
                          currentOccupancy={gate.currentOccupancy}
                          isActive={updatePolicies[gate.zoneId] ?? true}
                          onClick={toggleUpdatePolicy}
                          size="small"
                        />
                      </div>
                    </HorizontalLayout>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Fade in={expandedIndividualGates[gate.zoneId] || false}>
                      <div style={{ width: '100%' }}>
                        <ZoneSection
                          zone={gate}
                          onAddCheckpoint={handleAddCheckpoint}
                          onDeleteCheckpoint={handleDeleteCheckpoint}
                          onUpdateCheckpoint={handleUpdateCheckpoint}
                          updatePolicies={updatePolicies}
                          onToggleUpdatePolicy={toggleUpdatePolicy}
                        />
                        
                        {/* Checkpoint Form for this Gate - Inline */}
                        {checkpointDialogOpen && selectedZone?.zoneId === gate.zoneId && eventData && (
                          <div style={{ marginLeft: '20px', marginTop: '10px' }}>
                            <Dialogs
                              gateDialogOpen={false}
                              setGateDialogOpen={setGateDialogOpen}
                              zoneDialogOpen={false}
                              setZoneDialogOpen={setZoneDialogOpen}
                              venueDialogOpen={false}
                              setVenueDialogOpen={setVenueDialogOpen}
                              checkpointDialogOpen={checkpointDialogOpen}
                              setCheckpointDialogOpen={setCheckpointDialogOpen}
                              subzoneDialogOpen={false}
                              setSubzoneDialogOpen={setSubzoneDialogOpen}
                              selectedZone={selectedZone}
                              eventData={eventData}
                              setEventData={setEventData}
                            />
                          </div>
                        )}
                      </div>
                    </Fade>
                  </AccordionDetails>
                </Accordion>
              )) : (
                <EmptyState
                  icon={<LocationOn style={{ fontSize: 48, color: '#adb5bd', marginBottom: '16px' }} />}
                  title="No Gates Configured"
                  description="Gates are entry/exit points for your event. Add gates to control access and monitor attendance."
                  actionLabel="Add Your First Gate"
                  onAction={() => setGateDialogOpen(true)}
                />
              )}
            </div>
          </Fade>
        </AccordionDetails>
      </Accordion>
      
      {/* ========== VENUES SECTION ========== */}
      <Accordion 
        expanded={expandedVenues} 
        onChange={(_event, isExpanded) => setExpandedVenues(isExpanded)}
        style={{ marginBottom: '16px', width: '100%', maxWidth: '1200px' }}
      >
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <HorizontalLayout style={{ alignItems: 'center', gap: '16px', width: '100%' }}>
            <h2 style={{ margin: 0, color: '#343a40' }}>Venues</h2>
            <Button 
              theme="primary" 
              onClick={(e) => {
                e.stopPropagation();
                setVenueDialogOpen(true);
              }}
            >
              Add Venue
            </Button>
          </HorizontalLayout>
        </AccordionSummary>
        <AccordionDetails>
          <Fade in={expandedVenues}>
            <div style={{ width: '100%' }}>
              {/* Venue Form - Inline */}
              {venueDialogOpen && eventData && (
                <div style={{ marginBottom: '16px' }}>
                  <Dialogs
                    gateDialogOpen={false}
                    setGateDialogOpen={setGateDialogOpen}
                    zoneDialogOpen={false}
                    setZoneDialogOpen={setZoneDialogOpen}
                    venueDialogOpen={venueDialogOpen}
                    setVenueDialogOpen={setVenueDialogOpen}
                    checkpointDialogOpen={false}
                    setCheckpointDialogOpen={setCheckpointDialogOpen}
                    subzoneDialogOpen={false}
                    setSubzoneDialogOpen={setSubzoneDialogOpen}
                    selectedZone={selectedZone}
                    eventData={eventData}
                    setEventData={setEventData}
                  />
                </div>
              )}
              
              {venues.length > 0 ? venues.map(venue => (
                <Accordion 
                  key={venue.zoneId}
                  expanded={expandedIndividualVenues[venue.zoneId] || false} 
                  onChange={() => handleIndividualVenueExpansion(venue.zoneId)}
                  style={{ marginBottom: '16px' }}
                >
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <HorizontalLayout style={{ alignItems: 'center', gap: '16px', width: '100%' }}>
                      <h3 style={{ margin: 0, color: '#495057', fontSize: '18px' }}>
                        {venue.name}
                      </h3>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginLeft: 'auto' }}>
                        <AccessTypeBadges accessTypes={venue.accessTypes} />
                        <CapacityPolicyChip
                          variant="dot"
                          zoneId={venue.zoneId}
                          maxCapacity={venue.maxCapacity}
                          currentOccupancy={venue.currentOccupancy}
                          isActive={updatePolicies[venue.zoneId] ?? true}
                          onClick={toggleUpdatePolicy}
                          size="small"
                        />
                      </div>
                    </HorizontalLayout>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Fade in={expandedIndividualVenues[venue.zoneId] || false}>
                      <div style={{ width: '100%' }}>
                        <ZoneSection
                          zone={venue}
                          onAddCheckpoint={handleAddCheckpoint}
                          onDeleteCheckpoint={handleDeleteCheckpoint}
                          onUpdateCheckpoint={handleUpdateCheckpoint}
                          updatePolicies={updatePolicies}
                          onToggleUpdatePolicy={toggleUpdatePolicy}
                        />
                        
                        {/* Checkpoint Form for this Venue - Inline */}
                        {checkpointDialogOpen && selectedZone?.zoneId === venue.zoneId && eventData && (
                          <div style={{ marginLeft: '20px', marginTop: '10px' }}>
                            <Dialogs
                              gateDialogOpen={false}
                              setGateDialogOpen={setGateDialogOpen}
                              zoneDialogOpen={false}
                              setZoneDialogOpen={setZoneDialogOpen}
                              venueDialogOpen={false}
                              setVenueDialogOpen={setVenueDialogOpen}
                              checkpointDialogOpen={checkpointDialogOpen}
                              setCheckpointDialogOpen={setCheckpointDialogOpen}
                              subzoneDialogOpen={false}
                              setSubzoneDialogOpen={setSubzoneDialogOpen}
                              selectedZone={selectedZone}
                              eventData={eventData}
                              setEventData={setEventData}
                            />
                          </div>
                        )}
                        
                        {/* Subzone Form for this Venue - Inline */}
                        {subzoneDialogOpen && selectedZone?.zoneId === venue.zoneId && eventData && (
                          <div style={{ marginLeft: '20px', marginTop: '10px' }}>
                            <Dialogs
                              gateDialogOpen={false}
                              setGateDialogOpen={setGateDialogOpen}
                              zoneDialogOpen={false}
                              setZoneDialogOpen={setZoneDialogOpen}
                              venueDialogOpen={false}
                              setVenueDialogOpen={setVenueDialogOpen}
                              checkpointDialogOpen={false}
                              setCheckpointDialogOpen={setCheckpointDialogOpen}
                              subzoneDialogOpen={subzoneDialogOpen}
                              setSubzoneDialogOpen={setSubzoneDialogOpen}
                              selectedZone={selectedZone}
                              eventData={eventData}
                              setEventData={setEventData}
                            />
                          </div>
                        )}
                        
                        {/* SUBZONES - Rendered within their parent venue */}
                        {subzonesByParent[venue.zoneId] && subzonesByParent[venue.zoneId].length > 0 && (
                          <div style={{ marginTop: '16px' }}>
                            <Accordion 
                              expanded={expandedSubzones[venue.zoneId] || false} 
                              onChange={() => handleSubzoneExpansion(venue.zoneId)}
                              style={{ marginLeft: '20px', marginBottom: '8px' }}
                            >
                              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', width: '100%' }}>
                                  {/* Subzone headers: name, access type chips, capacity, update policy button */}
                                  <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                                    <span style={{ fontWeight: 600, color: '#495057', fontSize: '16px' }}>
                                      Subzones
                                    </span>
                                  </div>
                                </div>
                              </AccordionSummary>
                              <AccordionDetails>
                                <Fade in={expandedSubzones[venue.zoneId] || false}>
                                  <div style={{ width: '100%' }}>
                                    {subzonesByParent[venue.zoneId].map(subzone => (
                                      <Accordion key={subzone.zoneId} style={{ marginBottom: '8px' }}>
                                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', width: '100%' }}>
                                            <span style={{ fontWeight: 500, color: '#495057', fontSize: '15px' }}>{subzone.name}</span>
                                            <AccessTypeBadges accessTypes={subzone.accessTypes} />
                                            <CapacityPolicyChip
                                              variant="dot"
                                              zoneId={subzone.zoneId}
                                              maxCapacity={subzone.maxCapacity}
                                              currentOccupancy={subzone.currentOccupancy}
                                              isActive={updatePolicies[subzone.zoneId] ?? true}
                                              onClick={toggleUpdatePolicy}
                                              size="small"
                                            />
                                            <IconButton
                                              size="small"
                                              onClick={e => {
                                                e.stopPropagation();
                                                toggleUpdatePolicy(subzone.zoneId, e);
                                              }}
                                              style={{ marginLeft: 8 }}
                                            >
                                              <span role="img" aria-label="Update Policy">⚙️</span>
                                            </IconButton>
                                          </div>
                                        </AccordionSummary>
                                        <AccordionDetails>
                                          <ZoneSection
                                            zone={subzone}
                                            isSubzone
                                            parentZoneName={venue.name}
                                            onAddCheckpoint={handleAddCheckpoint}
                                            onDeleteCheckpoint={handleDeleteCheckpoint}
                                            onUpdateCheckpoint={handleUpdateCheckpoint}
                                            updatePolicies={updatePolicies}
                                            onToggleUpdatePolicy={toggleUpdatePolicy}
                                          />
                                          {/* Checkpoint Form for this Subzone - Inline */}
                                          {checkpointDialogOpen && selectedZone?.zoneId === subzone.zoneId && eventData && (
                                            <div style={{ marginLeft: '20px', marginTop: '10px' }}>
                                              <Dialogs
                                                gateDialogOpen={false}
                                                setGateDialogOpen={setGateDialogOpen}
                                                zoneDialogOpen={false}
                                                setZoneDialogOpen={setZoneDialogOpen}
                                                venueDialogOpen={false}
                                                setVenueDialogOpen={setVenueDialogOpen}
                                                checkpointDialogOpen={checkpointDialogOpen}
                                                setCheckpointDialogOpen={setCheckpointDialogOpen}
                                                subzoneDialogOpen={false}
                                                setSubzoneDialogOpen={setSubzoneDialogOpen}
                                                selectedZone={selectedZone}
                                                eventData={eventData}
                                                setEventData={setEventData}
                                              />
                                            </div>
                                          )}
                                        </AccordionDetails>
                                      </Accordion>
                                    ))}
                                  </div>
                                </Fade>
                              </AccordionDetails>
                            </Accordion>
                          </div>
                        )}
                      </div>
                    </Fade>
                  </AccordionDetails>
                </Accordion>
              )) : (
                <EmptyState
                  icon={<MeetingRoom style={{ fontSize: 48, color: '#adb5bd', marginBottom: '16px' }} />}
                  title="No Venues Configured"
                  description="Venues are the main event spaces like stages, halls, or performance areas. Add venues to organize your event infrastructure."
                  actionLabel="Add Your First Venue"
                  onAction={() => setVenueDialogOpen(true)}
                />
              )}
            </div>
          </Fade>
        </AccordionDetails>
      </Accordion>
      
      {/* ========== ZONES SECTION ========== */}
      <Accordion 
        expanded={expandedZones} 
        onChange={(_event, isExpanded) => setExpandedZones(isExpanded)}
        style={{ marginBottom: '16px', width: '100%', maxWidth: '1200px' }}
      >
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <HorizontalLayout style={{ alignItems: 'center', gap: '16px', width: '100%' }}>
            <h2 style={{ margin: 0, color: '#343a40' }}>Zones</h2>
            <Button 
              theme="primary" 
              onClick={(e) => {
                e.stopPropagation();
                setZoneDialogOpen(true);
              }}
            >
              Add Zone
            </Button>
          </HorizontalLayout>
        </AccordionSummary>
        <AccordionDetails>
          <Fade in={expandedZones}>
            <div style={{ width: '100%' }}>
              {/* Zone Form - Inline */}
              {zoneDialogOpen && eventData && (
                <div style={{ marginBottom: '16px' }}>
                  <Dialogs
                    gateDialogOpen={false}
                    setGateDialogOpen={setGateDialogOpen}
                    zoneDialogOpen={zoneDialogOpen}
                    setZoneDialogOpen={setZoneDialogOpen}
                    venueDialogOpen={false}
                    setVenueDialogOpen={setVenueDialogOpen}
                    checkpointDialogOpen={false}
                    setCheckpointDialogOpen={setCheckpointDialogOpen}
                    subzoneDialogOpen={false}
                    setSubzoneDialogOpen={setSubzoneDialogOpen}
                    selectedZone={selectedZone}
                    eventData={eventData}
                    setEventData={setEventData}
                  />
                </div>
              )}
              
              {zones.length > 0 ? zones.map(zone => (
                <Accordion 
                  key={zone.zoneId}
                  expanded={expandedIndividualZones[zone.zoneId] || false} 
                  onChange={() => handleIndividualZoneExpansion(zone.zoneId)}
                  style={{ marginBottom: '16px' }}
                >
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <HorizontalLayout style={{ alignItems: 'center', gap: '16px', width: '100%' }}>
                      <h3 style={{ margin: 0, color: '#495057', fontSize: '18px' }}>
                        {zone.name}
                      </h3>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginLeft: 'auto' }}>
                        <AccessTypeBadges accessTypes={zone.accessTypes} />
                        <CapacityPolicyChip
                          variant="dot"
                          zoneId={zone.zoneId}
                          maxCapacity={zone.maxCapacity}
                          currentOccupancy={zone.currentOccupancy}
                          isActive={updatePolicies[zone.zoneId] ?? true}
                          onClick={toggleUpdatePolicy}
                          size="small"
                        />
                        <Button 
                          theme="secondary small"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAddSubzoneToZone(zone);
                          }}
                          style={{ marginLeft: '8px' }}
                        >
                          Add Subzone
                        </Button>
                      </div>
                    </HorizontalLayout>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Fade in={expandedIndividualZones[zone.zoneId] || false}>
                      <div style={{ width: '100%' }}>
                        <ZoneSection
                          zone={zone}
                          onAddCheckpoint={handleAddCheckpoint}
                          onDeleteCheckpoint={handleDeleteCheckpoint}
                          onUpdateCheckpoint={handleUpdateCheckpoint}
                          updatePolicies={updatePolicies}
                          onToggleUpdatePolicy={toggleUpdatePolicy}
                        />
                        
                        {/* Checkpoint & Subzone Forms for this Zone - Inline */}
                        {checkpointDialogOpen && selectedZone?.zoneId === zone.zoneId && eventData && (
                          <div style={{ marginLeft: '20px', marginTop: '10px' }}>
                            <Dialogs
                              gateDialogOpen={false}
                              setGateDialogOpen={setGateDialogOpen}
                              zoneDialogOpen={false}
                              setZoneDialogOpen={setZoneDialogOpen}
                              venueDialogOpen={false}
                              setVenueDialogOpen={setVenueDialogOpen}
                              checkpointDialogOpen={checkpointDialogOpen}
                              setCheckpointDialogOpen={setCheckpointDialogOpen}
                              subzoneDialogOpen={false}
                              setSubzoneDialogOpen={setSubzoneDialogOpen}
                              selectedZone={selectedZone}
                              eventData={eventData}
                              setEventData={setEventData}
                            />
                          </div>
                        )}
                        
                        {subzoneDialogOpen && selectedZone?.zoneId === zone.zoneId && eventData && (
                          <div style={{ marginLeft: '20px', marginTop: '10px' }}>
                            <Dialogs
                              gateDialogOpen={false}
                              setGateDialogOpen={setGateDialogOpen}
                              zoneDialogOpen={false}
                              setZoneDialogOpen={setZoneDialogOpen}
                              venueDialogOpen={false}
                              setVenueDialogOpen={setVenueDialogOpen}
                              checkpointDialogOpen={false}
                              setCheckpointDialogOpen={setCheckpointDialogOpen}
                              subzoneDialogOpen={subzoneDialogOpen}
                              setSubzoneDialogOpen={setSubzoneDialogOpen}
                              selectedZone={selectedZone}
                              eventData={eventData}
                              setEventData={setEventData}
                            />
                          </div>
                        )}
                        
                        {/* SUBZONES - Rendered within their parent zone */}
                        {subzonesByParent[zone.zoneId] && subzonesByParent[zone.zoneId].length > 0 && (
                          <div style={{ marginTop: '16px' }}>
                            <Accordion 
                              expanded={expandedSubzones[zone.zoneId] || false} 
                              onChange={() => handleSubzoneExpansion(zone.zoneId)}
                              style={{ marginLeft: '20px', marginBottom: '8px' }}
                            >
                              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', width: '100%' }}>
                                  {/* Subzone headers: name, access type chips, capacity, update policy button */}
                                  <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                                    <span style={{ fontWeight: 600, color: '#495057', fontSize: '16px' }}>
                                      Subzones
                                    </span>
                                  </div>
                                </div>
                              </AccordionSummary>
                              <AccordionDetails>
                                <Fade in={expandedSubzones[zone.zoneId] || false}>
                                  <div style={{ width: '100%' }}>
                                    {subzonesByParent[zone.zoneId].map(subzone => (
                                      <Accordion key={subzone.zoneId} style={{ marginBottom: '8px' }}>
                                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', width: '100%' }}>
                                            <span style={{ fontWeight: 500, color: '#495057', fontSize: '15px' }}>{subzone.name}</span>
                                            <AccessTypeBadges accessTypes={subzone.accessTypes} />
                                            <CapacityPolicyChip
                                              variant="dot"
                                              zoneId={subzone.zoneId}
                                              maxCapacity={subzone.maxCapacity}
                                              currentOccupancy={subzone.currentOccupancy}
                                              isActive={updatePolicies[subzone.zoneId] ?? true}
                                              onClick={toggleUpdatePolicy}
                                              size="small"
                                            />
                                            <IconButton
                                              size="small"
                                              onClick={e => {
                                                e.stopPropagation();
                                                toggleUpdatePolicy(subzone.zoneId, e);
                                              }}
                                              style={{ marginLeft: 8 }}
                                            >
                                              <span role="img" aria-label="Update Policy">⚙️</span>
                                            </IconButton>
                                          </div>
                                        </AccordionSummary>
                                        <AccordionDetails>
                                          <ZoneSection
                                            zone={subzone}
                                            isSubzone
                                            parentZoneName={zone.name}
                                            onAddCheckpoint={handleAddCheckpoint}
                                            onDeleteCheckpoint={handleDeleteCheckpoint}
                                            onUpdateCheckpoint={handleUpdateCheckpoint}
                                            updatePolicies={updatePolicies}
                                            onToggleUpdatePolicy={toggleUpdatePolicy}
                                          />
                                          {/* Checkpoint Form for this Subzone - Inline */}
                                          {checkpointDialogOpen && selectedZone?.zoneId === subzone.zoneId && eventData && (
                                            <div style={{ marginLeft: '20px', marginTop: '10px' }}>
                                              <Dialogs
                                                gateDialogOpen={false}
                                                setGateDialogOpen={setGateDialogOpen}
                                                zoneDialogOpen={false}
                                                setZoneDialogOpen={setZoneDialogOpen}
                                                venueDialogOpen={false}
                                                setVenueDialogOpen={setVenueDialogOpen}
                                                checkpointDialogOpen={checkpointDialogOpen}
                                                setCheckpointDialogOpen={setCheckpointDialogOpen}
                                                subzoneDialogOpen={false}
                                                setSubzoneDialogOpen={setSubzoneDialogOpen}
                                                selectedZone={selectedZone}
                                                eventData={eventData}
                                                setEventData={setEventData}
                                              />
                                            </div>
                                          )}
                                        </AccordionDetails>
                                      </Accordion>
                                    ))}
                                  </div>
                                </Fade>
                              </AccordionDetails>
                            </Accordion>
                          </div>
                        )}
                      </div>
                    </Fade>
                  </AccordionDetails>
                </Accordion>
              )) : (
                <EmptyState
                  icon={<MeetingRoom style={{ fontSize: 48, color: '#adb5bd', marginBottom: '16px' }} />}
                  title="No Zones Configured"
                  description="Zones help organize different areas within your event. Add zones for better crowd management and access control."
                  actionLabel="Add Your First Zone"
                  onAction={() => setZoneDialogOpen(true)}
                />
              )}
            </div>
          </Fade>
        </AccordionDetails>
      </Accordion>
    </VerticalLayout>
  );
};

export default ZonesManagementRefactored;
