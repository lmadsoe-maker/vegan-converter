import { CheckHealthData, GetVeganWeaponData, GetVeganWeaponsData } from "./data-contracts";

export namespace Apiclient {
  /**
   * @description Check health of application. Returns 200 when OK, 500 when not.
   * @name check_health
   * @summary Check Health
   * @request GET:/_healthz
   */
  export namespace check_health {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = CheckHealthData;
  }

  /**
   * @description Get all vegan weapons, optionally filtered by category
   * @tags dbtn/module:vegan_weapons
   * @name get_vegan_weapons
   * @summary Get Vegan Weapons
   * @request GET:/routes/vegan-weapons
   */
  export namespace get_vegan_weapons {
    export type RequestParams = {};
    export type RequestQuery = {
      /** Category */
      category?: string | null;
    };
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = GetVeganWeaponsData;
  }

  /**
   * @description Get a specific vegan weapon by ID
   * @tags dbtn/module:vegan_weapons
   * @name get_vegan_weapon
   * @summary Get Vegan Weapon
   * @request GET:/routes/vegan-weapons/{weapon_id}
   */
  export namespace get_vegan_weapon {
    export type RequestParams = {
      /** Weapon Id */
      weaponId: number;
    };
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = GetVeganWeaponData;
  }
}
