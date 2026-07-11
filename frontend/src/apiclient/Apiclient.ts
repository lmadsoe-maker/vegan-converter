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

  /**
   * @description Convert any recipe to a plant-based version
   *
   * @tags recipe_conversion
   * @name convert_recipe
   * @summary Convert Recipe
   * @request POST:/api/convert-recipe
   */
  convert_recipe = (data: { original_recipe: string }, params: RequestParams = {}) =>
    this.request<any, any>({
      path: `/api/convert-recipe`,
      method: "POST",
      body: data,
      ...params,
    });

  /**
   * @description Analyze a photo to extract recipe or meal information
   *
   * @tags photo_analysis
   * @name analyze_photo
   * @summary Analyze Photo
   * @request POST:/api/photo-analysis
   */
  analyze_photo = (data: { image_base64: string; analysis_type?: string }, params: RequestParams = {}) =>
    this.request<any, any>({
      path: `/api/photo-analysis`,
      method: "POST",
      body: data,
      ...params,
    });
}
