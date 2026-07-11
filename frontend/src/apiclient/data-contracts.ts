/** HTTPValidationError */
export interface HTTPValidationError {
  /** Detail */
  detail?: ValidationError[];
}

/** HealthResponse */
export interface HealthResponse {
  /** Status */
  status: string;
}

/** ValidationError */
export interface ValidationError {
  /** Location */
  loc: (string | number)[];
  /** Message */
  msg: string;
  /** Error Type */
  type: string;
}

/** VeganWeapon */
export interface VeganWeapon {
  /** Id */
  id: number;
  /** Name */
  name: string;
  /** Category */
  category: string;
  /** Description */
  description?: string | null;
  /** Ingredients */
  ingredients: string[];
  /** Instructions */
  instructions: string;
  /** Prep Time Minutes */
  prep_time_minutes?: number | null;
  /** Servings */
  servings?: string | null;
  /**
   * Tags
   * @default []
   */
  tags?: string[];
  /** Created At */
  created_at: string;
  /** Updated At */
  updated_at: string;
}

/** VeganWeaponsResponse */
export interface VeganWeaponsResponse {
  /** Weapons */
  weapons: VeganWeapon[];
  /** Categories */
  categories: string[];
  /** Total Count */
  total_count: number;
}

export type CheckHealthData = HealthResponse;

export interface GetVeganWeaponsParams {
  /** Category */
  category?: string | null;
}

export type GetVeganWeaponsData = VeganWeaponsResponse;

export type GetVeganWeaponsError = HTTPValidationError;

export interface GetVeganWeaponParams {
  /** Weapon Id */
  weaponId: number;
}

export type GetVeganWeaponData = VeganWeapon;

export type GetVeganWeaponError = HTTPValidationError;
