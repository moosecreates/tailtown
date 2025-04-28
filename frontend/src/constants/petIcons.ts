import { PetIcon } from '../types/petIcons';

/**
 * Pet icon definitions for the Tailtown application
 * These icons serve as shorthand notes for staff to quickly understand important information about each pet
 */

// Group Type Icons
export const GROUP_ICONS: PetIcon[] = [
  {
    id: 'small-group',
    category: 'group',
    icon: '🟢',
    label: 'Small Group',
    description: 'Compatible with small groups of similar pets',
  },
  {
    id: 'medium-group',
    category: 'group',
    icon: '🟠',
    label: 'Medium Group',
    description: 'Can be in medium-sized playgroups with supervision',
  },
  {
    id: 'large-group',
    category: 'group',
    icon: '🔵',
    label: 'Large Group',
    description: 'Thrives in large playgroups',
  },
  {
    id: 'solo-only',
    category: 'group',
    icon: '⚪',
    label: 'Solo Only',
    description: 'Must be kept separate from other animals',
  },
];

// Size Icons
export const SIZE_ICONS: PetIcon[] = [
  {
    id: 'small-size',
    category: 'size',
    icon: '🐕‍🦺',
    label: 'Small',
    description: 'Under 20 lbs',
  },
  {
    id: 'medium-size',
    category: 'size',
    icon: '🐕',
    label: 'Medium',
    description: '20-50 lbs',
  },
  {
    id: 'large-size',
    category: 'size',
    icon: '🦮',
    label: 'Large',
    description: 'Over 50 lbs',
  },
];

// Behavioral Flags
export const BEHAVIOR_ICONS: PetIcon[] = [
  {
    id: 'no-bedding',
    category: 'behavior',
    icon: '🛏️',
    label: 'No Bedding',
    description: 'Destroys or eats bedding materials',
  },
  {
    id: 'thunder-reactive',
    category: 'behavior',
    icon: '⚡',
    label: 'Thunder Reactive',
    description: 'Sensitive to loud noises/storms',
  },
  {
    id: 'digger',
    category: 'behavior',
    icon: '🕳️',
    label: 'Digger',
    description: 'Tends to dig in yard areas',
  },
  {
    id: 'fence-fighter',
    category: 'behavior',
    icon: '🧱',
    label: 'Fence Fighter',
    description: 'Reactive to animals on other side of fences',
  },
  {
    id: 'mouthy',
    category: 'behavior',
    icon: '🦷',
    label: 'Mouthy',
    description: 'May nip or play-bite during excitement',
  },
  {
    id: 'barker',
    category: 'behavior',
    icon: '🔊',
    label: 'Barker',
    description: 'Excessive barking',
  },
  {
    id: 'escape-artist',
    category: 'behavior',
    icon: '🏃',
    label: 'Escape Artist',
    description: 'Attempts to escape from kennels/yards',
  },
  {
    id: 'resource-guarder',
    category: 'behavior',
    icon: '🚫',
    label: 'Resource Guarder',
    description: 'Guards food, toys, or space',
  },
];

// Medical Icons
export const MEDICAL_ICONS: PetIcon[] = [
  {
    id: 'medication-required',
    category: 'medical',
    icon: '💊',
    label: 'Medication Required',
    description: 'Needs regular medication',
  },
  {
    id: 'medical-monitoring',
    category: 'medical',
    icon: '🩺',
    label: 'Medical Monitoring',
    description: 'Requires special health monitoring',
  },
  {
    id: 'mobility-issues',
    category: 'medical',
    icon: '🦴',
    label: 'Mobility Issues',
    description: 'Has difficulty with movement',
  },
  {
    id: 'special-diet',
    category: 'medical',
    icon: '🍽️',
    label: 'Special Diet',
    description: 'Has dietary restrictions or requirements',
  },
  {
    id: 'skin-condition',
    category: 'medical',
    icon: '🧴',
    label: 'Skin Condition',
    description: 'Has skin allergies or sensitivities',
  },
];

// Handling Icons (removed "Use Gloves" as requested)
export const HANDLING_ICONS: PetIcon[] = [
  {
    id: 'advanced-handling',
    category: 'handling',
    icon: '⚠️',
    label: 'Advanced Handling',
    description: 'Requires experienced staff',
  },
  {
    id: 'approach-slowly',
    category: 'handling',
    icon: '👋',
    label: 'Approach Slowly',
    description: 'Needs gentle introduction',
  },
  {
    id: 'harness-only',
    category: 'handling',
    icon: '🦺',
    label: 'Harness Only',
    description: 'Should not be walked with collar only',
  },
];

// Generic Flags
export const FLAG_ICONS: PetIcon[] = [
  {
    id: 'red-flag',
    category: 'flag',
    icon: '🟥',
    label: 'Red Flag',
    description: 'Critical issue (custom)',
    color: '#f44336',
  },
  {
    id: 'yellow-flag',
    category: 'flag',
    icon: '🟨',
    label: 'Yellow Flag',
    description: 'Caution needed (custom)',
    color: '#ffeb3b',
  },
  {
    id: 'green-flag',
    category: 'flag',
    icon: '🟩',
    label: 'Green Flag',
    description: 'Positive note (custom)',
    color: '#4caf50',
  },
  {
    id: 'blue-flag',
    category: 'flag',
    icon: '🟦',
    label: 'Blue Flag',
    description: 'Special instruction (custom)',
    color: '#2196f3',
  },
  {
    id: 'white-flag',
    category: 'flag',
    icon: '⬜',
    label: 'White Flag',
    description: 'General note (custom)',
    color: '#ffffff',
  },
];

// All icons combined
export const ALL_PET_ICONS: PetIcon[] = [
  ...GROUP_ICONS,
  ...SIZE_ICONS,
  ...BEHAVIOR_ICONS,
  ...MEDICAL_ICONS,
  ...HANDLING_ICONS,
  ...FLAG_ICONS,
];

// Helper function to get an icon by ID
export const getIconById = (id: string): PetIcon | undefined => {
  return ALL_PET_ICONS.find(icon => icon.id === id);
};

// Helper function to get icons by category
export const getIconsByCategory = (category: string): PetIcon[] => {
  return ALL_PET_ICONS.filter(icon => icon.category === category);
};
