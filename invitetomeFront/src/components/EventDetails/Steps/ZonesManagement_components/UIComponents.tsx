/**
 * =============================================================================
 * COMPONENTES UI SIMPLIFICADOS - UIComponents.tsx
 * =============================================================================
 * 
 * Componentes visuales reutilizables extraídos del componente monolítico
 * siguiendo el enfoque conservador. Estos componentes mantienen la funcionalidad
 * original pero están organizados de manera modular para mejorar la mantenibilidad.
 * 
 * COMPONENTES INCLUIDOS:
 * - ✅ AccessTypeBadges: Badges de tipos de acceso
 * - ✅ CheckpointTable: Tabla de checkpoints con grid de Vaadin
 * - ✅ ZoneSection: Sección individual de zona con checkpoints
 * - ✅ DeviceRoleTabs: Tabs para roles de dispositivos
 * 
 * @author Almirante Temporal
 * @version 1.0.0 - Refactoring Conservador
 */

import React from 'react';
import {
  Button,
  HorizontalLayout,
  Grid,
  GridColumn,
  Checkbox,
} from '@vaadin/react-components';
import { Icon } from '@vaadin/react-components/Icon';
import { Chip, Tabs, Tab } from '@mui/material';
import type { ZoneType, Checkpoint, AccessTypes } from './types';

/**
 * =============================================================================
 * BADGES DE TIPOS DE ACCESO
 * =============================================================================
 * 
 * Componente para mostrar los tipos de acceso disponibles en una zona
 * con colores específicos para cada tipo.
 */
export const AccessTypeBadges: React.FC<{ accessTypes: AccessTypes }> = ({ accessTypes }) => (
  <HorizontalLayout theme="spacing-xs">
    {accessTypes.GENERAL && (
      <Chip 
        label="GENERAL"
        size="small"
        variant="filled"
        sx={{ 
          backgroundColor: '#ff9800', 
          color: 'white',
          fontSize: '0.7rem',
          fontWeight: 600 
        }}
      />
    )}
    {accessTypes.BACKSTAGE && (
      <Chip 
        label="BACKSTAGE"
        size="small"
        variant="filled"
        sx={{ 
          backgroundColor: '#4caf50', 
          color: 'white',
          fontSize: '0.7rem',
          fontWeight: 600 
        }}
      />
    )}
    {accessTypes.STAGE && (
      <Chip 
        label="STAGE"
        size="small"
        variant="filled"
        sx={{ 
          backgroundColor: '#9c27b0', 
          color: 'white',
          fontSize: '0.7rem',
          fontWeight: 600 
        }}
      />
    )}
    {accessTypes.COMPROMIS && (
      <Chip 
        label="COMPROMIS"
        size="small"
        variant="filled"
        sx={{ 
          backgroundColor: '#2196f3', 
          color: 'white',
          fontSize: '0.7rem',
          fontWeight: 600 
        }}
      />
    )}
    {accessTypes.VIP && (
      <Chip 
        label="VIP"
        size="small"
        variant="filled"
        sx={{ 
          backgroundColor: '#f44336', 
          color: 'white',
          fontSize: '0.7rem',
          fontWeight: 600 
        }}
      />
    )}
  </HorizontalLayout>
);

/**
 * =============================================================================
 * CONSTANTES DE ROLES DE DISPOSITIVOS
 * =============================================================================
 */

// Roles específicos para Gates
const GATE_DEVICE_ROLES = [
  'STEWARD-CHECKIN',    // Control de entrada principal
  'STEWARD-CHECKOUT'    // Control de salida principal
];

// Roles específicos para Zones y Subzones  
const ZONE_DEVICE_ROLES = [
  'STEWARD-ZONEIN',     // Control de entrada a zona
  'STEWARD-ZONEOUT'     // Control de salida de zona
];

/**
 * =============================================================================
 * TABS DE ROLES DE DISPOSITIVOS
 * =============================================================================
 * 
 * Componente para mostrar y cambiar roles de dispositivos según el tipo de entidad
 */
export const DeviceRoleTabs: React.FC<{ 
  currentRole: string; 
  entityType: 'gate' | 'zone' | 'subzone';
  onRoleChange: (role: string) => void;
}> = ({ currentRole, entityType, onRoleChange }) => {
  // Seleccionar roles disponibles según el tipo de entidad
  const availableRoles = entityType === 'gate' ? GATE_DEVICE_ROLES : ZONE_DEVICE_ROLES;
  
  const handleRoleChange = (_event: React.SyntheticEvent, newRole: string) => {
    onRoleChange(newRole);
  };

  return (
    <Tabs
      value={currentRole}
      onChange={handleRoleChange}
      variant="scrollable"
      scrollButtons="auto"
      sx={{
        minHeight: 'unset',
        '& .MuiTab-root': {
          minHeight: '28px',
          fontSize: '0.7rem',
          padding: '4px 8px',
          minWidth: 'auto'
        }
      }}
    >
      {availableRoles.map((role) => (
        <Tab
          key={role}
          value={role}
          label={role}
          sx={{
            fontSize: '0.7rem',
            fontWeight: currentRole === role ? 600 : 400,
            textTransform: 'none'
          }}
        />
      ))}
    </Tabs>
  );
};

/**
 * =============================================================================
 * TABLA DE CHECKPOINTS
 * =============================================================================
 * 
 * Componente para mostrar y gestionar checkpoints usando Vaadin Grid
 */
export const CheckpointTable: React.FC<{
  checkpoints: Checkpoint[];
  onDelete: (checkpoint: Checkpoint) => void;
  onUpdate: (checkpoint: Checkpoint) => void;
}> = ({ checkpoints, onDelete, onUpdate }) => (
  <Grid items={checkpoints} allRowsVisible style={{ width: '100%' }}>
    <GridColumn header="" renderer={() => <Checkbox />} />
    <GridColumn header="CheckPoint" path="name" />
    <GridColumn header="Type" path="type" />
    <GridColumn header="Device IMEI" path="deviceImei" />
    <GridColumn 
      header="Device Role" 
      renderer={({ item }) => (
        <DeviceRoleTabs
          currentRole={item.role}
          entityType={item.type === 'GATE' ? 'gate' : 'zone'}
          onRoleChange={(newRole) => {
            console.log(`🔧 Updating checkpoint ${item.name} role from ${item.role} to ${newRole}`);
            // TODO: Implementar actualización de rol cuando el backend esté listo
          }}
        />
      )} 
    />
    <GridColumn
      header="Actions"
      renderer={({ item }) => (
        <HorizontalLayout theme="spacing">
          <Button 
            theme="tertiary" 
            onClick={() => onUpdate(item as Checkpoint)}
            title="Editar checkpoint"
          >
            Edit
          </Button>
          <Button 
            theme="error tertiary" 
            onClick={() => onDelete(item as Checkpoint)}
            title="Eliminar checkpoint"
          >
            Delete
          </Button>
        </HorizontalLayout>
      )}
    />
  </Grid>
);

/**
 * =============================================================================
 * SECCIÓN DE ZONA INDIVIDUAL
 * =============================================================================
 * 
 * Componente que renderiza una zona individual con sus checkpoints,
 * información de capacidad y controles de gestión.
 */
export interface ZoneSectionProps {
  zone: ZoneType;
  isSubzone?: boolean;
  parentZoneName?: string;
  onAddCheckpoint: (zone: ZoneType) => void;
  onDeleteCheckpoint: (zone: ZoneType, checkpoint: Checkpoint) => void;
  onUpdateCheckpoint: (zone: ZoneType, checkpoint: Checkpoint) => void;
  updatePolicies?: { [zoneId: string]: boolean };
  onToggleUpdatePolicy?: (zoneId: string, event: React.MouseEvent) => void;
}

export const ZoneSection: React.FC<ZoneSectionProps> = ({
  zone,
  onAddCheckpoint,
  onDeleteCheckpoint,
  onUpdateCheckpoint,
}) => {
  // Obtener checkpoints de la zona
  const checkpoints = zone.checkPoints ? Object.values(zone.checkPoints) : [];

  return (
    <div 
      style={{ 
        padding: '0',
        border: 'none',
        borderRadius: 0,
        marginBottom: 0,
        backgroundColor: 'transparent'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', justifyContent: 'flex-end' }}>
        <Button 
          theme="primary small"
          onClick={() => onAddCheckpoint(zone)}
          style={{ marginLeft: 'auto' }}
          title={`Agregar checkpoint a ${zone.name}`}
        >
          <Icon icon="vaadin:plus" style={{ marginRight: '4px' }} />
          Add Checkpoint
        </Button>
      </div>
      {/* Tabla de checkpoints o estado vacío */}
      {checkpoints.length > 0 ? (
        <CheckpointTable
          checkpoints={checkpoints}
          onDelete={(checkpoint) => onDeleteCheckpoint(zone, checkpoint)}
          onUpdate={(checkpoint) => onUpdateCheckpoint(zone, checkpoint)}
        />
      ) : (
        <div style={{ 
          padding: '24px', 
          textAlign: 'center', 
          color: '#6c757d',
          backgroundColor: '#f8f9fa',
          borderRadius: '6px',
          border: '2px dashed #dee2e6'
        }}>
          <span style={{ fontSize: '24px', color: '#17a2b8', marginBottom: '8px', display: 'block' }}>
            ℹ️
          </span>
          <div style={{ fontWeight: 500, marginBottom: '4px' }}>
            No checkpoints configured
          </div>
          <div style={{ fontSize: '12px' }}>
            Add checkpoints to control access to this {zone.type.toLowerCase()}
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * =============================================================================
 * COMPONENTE DE ESTADO VACÍO GENERAL
 * =============================================================================
 * 
 * Componente reutilizable para mostrar estados vacíos informativos
 */
export const EmptyState: React.FC<{
  icon?: React.ReactNode;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}> = ({ 
  icon = '📋', 
  title, 
  description,   actionLabel,
  onAction 
}) => (
  <div style={{ 
    padding: '40px 20px', 
    textAlign: 'center', 
    color: '#6c757d',
    backgroundColor: '#f8f9fa',
    borderRadius: '8px',
    border: '2px dashed #dee2e6'
  }}>
    <div style={{ 
      fontSize: '48px',
      color: '#adb5bd',
      marginBottom: '16px'
    }}>
      {icon}
    </div>
    <h3 style={{ 
      margin: '0 0 8px 0', 
      color: '#495057',
      fontWeight: 500
    }}>
      {title}
    </h3>
    {description && (
      <p style={{ 
        margin: '0 0 16px 0', 
        fontSize: '14px',
        maxWidth: '400px',
        marginLeft: 'auto',
        marginRight: 'auto'
      }}>
        {description}
      </p>
    )}
    {actionLabel && onAction && (
      <Button 
        theme="primary"
        onClick={onAction}
      >
        {actionLabel}
      </Button>
    )}
  </div>
);

export default {
  AccessTypeBadges,
  DeviceRoleTabs,
  CheckpointTable,
  ZoneSection,
  EmptyState,
};
