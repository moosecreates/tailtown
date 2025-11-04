/**
 * Utility functions for vaccine status calculations
 */

export interface VaccineRecord {
  status: 'CURRENT' | 'EXPIRED' | 'MISSING';
  expiration?: string;
  lastAdministered?: string;
}

export interface VaccinationStatus {
  [vaccineName: string]: VaccineRecord;
}

/**
 * Recalculates vaccine status based on current date
 * This ensures that vaccines that have expired since the last database update
 * are properly marked as expired
 */
export const recalculateVaccineStatus = (
  vaccinationStatus: any,
  vaccineExpirations: any
): VaccinationStatus => {
  if (!vaccinationStatus && !vaccineExpirations) {
    return {};
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const recalculated: VaccinationStatus = {};

  // If we have vaccineExpirations, use those to determine status
  if (vaccineExpirations && typeof vaccineExpirations === 'object') {
    Object.entries(vaccineExpirations).forEach(([vaccineName, expirationDate]) => {
      if (typeof expirationDate === 'string') {
        // Parse date as local time to avoid timezone issues
        const [year, month, day] = expirationDate.split('-').map(Number);
        const expDate = new Date(year, month - 1, day);
        expDate.setHours(0, 0, 0, 0);

        recalculated[vaccineName.toLowerCase()] = {
          status: expDate >= today ? 'CURRENT' : 'EXPIRED',
          expiration: expirationDate as string,
        };
      }
    });
  }

  // Also check vaccinationStatus for any additional vaccines
  if (vaccinationStatus && typeof vaccinationStatus === 'object') {
    Object.entries(vaccinationStatus).forEach(([vaccineName, record]: [string, any]) => {
      const lowerName = vaccineName.toLowerCase();
      
      // Skip if we already calculated from vaccineExpirations
      if (recalculated[lowerName]) {
        return;
      }

      if (record && record.expiration) {
        const expDate = new Date(record.expiration);
        expDate.setHours(0, 0, 0, 0);

        recalculated[lowerName] = {
          status: expDate >= today ? 'CURRENT' : 'EXPIRED',
          expiration: record.expiration,
          lastAdministered: record.lastAdministered,
        };
      } else if (record && record.status) {
        // If no expiration date, trust the stored status
        recalculated[lowerName] = record;
      }
    });
  }

  return recalculated;
};

/**
 * Get required vaccines for a pet type
 */
export const getRequiredVaccines = (petType: string): string[] => {
  switch (petType?.toUpperCase()) {
    case 'DOG':
      return ['rabies', 'dhpp', 'bordetella'];
    case 'CAT':
      return ['rabies', 'fvrcp'];
    default:
      return ['rabies'];
  }
};

/**
 * Count vaccine statuses
 */
export const countVaccineStatuses = (
  pet: any
): { expired: number; missing: number; current: number } => {
  const requiredVaccines = getRequiredVaccines(pet.type);
  const vaccinationStatus = recalculateVaccineStatus(
    pet.vaccinationStatus,
    pet.vaccineExpirations
  );

  let expired = 0;
  let missing = 0;
  let current = 0;

  requiredVaccines.forEach((vaccine) => {
    const record = vaccinationStatus[vaccine];
    if (!record) {
      missing++;
    } else if (record.status === 'EXPIRED') {
      expired++;
    } else if (record.status === 'CURRENT') {
      current++;
    } else {
      missing++;
    }
  });

  return { expired, missing, current };
};
