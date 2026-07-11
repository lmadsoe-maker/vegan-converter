import {
  CheckHealthData,
  GetVeganWeaponData,
  GetVeganWeaponError,
  GetVeganWeaponParams,
  GetVeganWeaponsData,
  GetVeganWeaponsError,
  GetVeganWeaponsParams,
} from "./data-contracts";
import { HttpClient, RequestParams } from "./http-client";

export class Apiclient<SecurityDataType = unknown> extends HttpClient<SecurityDataType> {
  /**
   * @description Check health of application. Returns 200 when OK, 500 when not.
   *
   * @name check_health
   * @summary Check Health
   * @request GET:/_healthz
   */
  check_health = (params: RequestParams = {}) =>
    this.request<CheckHealthData, any>({
      path: `/_healthz`,
      method: "GET",
      ...params,
    });

  /**
   * @description Get all vegan weapons, optionally filtered by category
   *
   * @tags dbtn/module:vegan_weapons
   * @name get_vegan_weapons
   * @summary Get Vegan Weapons
   * @request GET:/routes/vegan-weapons
   */
  get_vegan_weapons = (query: GetVeganWeaponsParams, params: RequestParams = {}) =>
    this.request<GetVeganWeaponsData, GetVeganWeaponsError>({
      path: `/routes/vegan-weapons`,
      method: "GET",
      query: query,
      ...params,
    });

  /**
   * @description Get a specific vegan weapon by ID
   *
   * @tags dbtn/module:vegan_weapons
   * @name get_vegan_weapon
   * @summary Get Vegan Weapon
   * @request GET:/routes/vegan-weapons/{weapon_id}
   */
  get_vegan_weapon = ({ weaponId, ...query }: GetVeganWeaponParams, params: RequestParams = {}) =>
    this.request<GetVeganWeaponData, GetVeganWeaponError>({
      path: `/routes/vegan-weapons/${weaponId}`,
      method: "GET",
      ...params,
    });
}
