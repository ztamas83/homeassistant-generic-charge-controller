import { LitElement, html, css, nothing } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { loadHaElements } from "./load-ha-elements";
import { getEaseeChargerData } from "./utils/charger/easee";
import { ChargerData } from "./utils/charger/charger-data";
import {
  ChargerConfig,
  ControllerEntities,
  DiscoveredCharger,
  HouseholdConfig,
} from "./types";
import "./components/cc-charger-card";
import "./components/cc-load-balancer-settings";
import "./components/cc-household-card";
import "./components/cc-household-editor";
import "./components/cc-charger-history";
import "./components/cc-settings";

type TabId = "households" | "chargers" | "settings";

const WS = "generic_charge_controller";

@customElement("charge-controller-panel")
export class ChargeControllerPanel extends LitElement {
  @property({ attribute: false }) public hass!: any;
  @property({ type: Boolean, reflect: true }) public narrow = false;
  @property({ type: Object }) public route: { path: string } = { path: "" };
  @property({ type: Object }) public panel: Record<string, unknown> = {};

  @state() private _elementsLoaded = false;
  @state() private _selectedChargerId: string | null = null;
  @state() private _activeTab: TabId = "households";
  @state() private _routeApplied = false;
  @state() private _households: Record<string, HouseholdConfig> = {};
  @state() private _chargerConfigs: Record<string, ChargerConfig> = {};
  @state() private _discoveredChargers: DiscoveredCharger[] = [];
  @state() private _entities: ControllerEntities = { households: {}, chargers: {} };
  /** Household being edited: an id, "new", or null when not editing. */
  @state() private _editingHousehold: string | null = null;
  @state() private _error = "";

  protected firstUpdated() {
    this._loadElements();
    this._loadData();
  }

  private async _loadElements() {
    await loadHaElements();
    this._elementsLoaded = true;
  }

  private async _loadData() {
    try {
      const [households, chargers, discovered, entities] = await Promise.all([
        this.hass.callWS({ type: `${WS}/households/get` }),
        this.hass.callWS({ type: `${WS}/chargers/get` }),
        this.hass.callWS({ type: `${WS}/chargers/discover` }),
        this.hass.callWS({ type: `${WS}/entities` }),
      ]);
      this._households = households;
      this._chargerConfigs = chargers;
      this._discoveredChargers = discovered;
      this._entities = entities;
    } catch (err: any) {
      this._error = `Error loading data from Charge Controller backend: ${err?.message ?? err}`;
    }
  }

  protected willUpdate(changedProps: Map<string, unknown>) {
    if (changedProps.has("route")) {
      this._applyRoute();
    }
  }

  connectedCallback() {
    super.connectedCallback();
    if (!this._routeApplied) {
      this._applyRoute();
      this._routeApplied = true;
    }
  }

  protected render() {
    if (!this._elementsLoaded) {
      return html`<div class="loading">Loading...</div>`;
    }

    const chargers = this._discoveredChargers.map((c) => getEaseeChargerData(this.hass, c));
    const inDetail = !!this._selectedChargerId;
    const selectedCharger = inDetail
      ? chargers.find((c) => c.id === this._selectedChargerId) ?? null
      : null;

    return html`
      <div class="toolbar">
        ${inDetail
          ? html`
            <ha-icon-button .label=${"Back"} @click=${this._goBack}>
              <ha-icon .icon=${"mdi:arrow-left"}></ha-icon>
            </ha-icon-button>`
          : nothing}
        <div class="title">
          ${inDetail ? selectedCharger?.name ?? "Charger Details" : "Charge Controller"}
        </div>
        ${!inDetail
          ? html`
            <div class="tabs">
              <div
                class="tab ${this._activeTab === "households" ? "active" : ""}"
                @click=${() => (this._activeTab = "households")}
              >
                Households
              </div>
              <div
                class="tab ${this._activeTab === "chargers" ? "active" : ""}"
                @click=${() => (this._activeTab = "chargers")}
              >
                Chargers
              </div>
              <div
                class="tab ${this._activeTab === "settings" ? "active" : ""}"
                @click=${() => (this._activeTab = "settings")}
              >
                Settings
              </div>
            </div>
          `
          : nothing}
      </div>
      <div class="content">
        ${this._error
          ? html`<div class="error-banner" @click=${() => (this._error = "")}>${this._error}</div>`
          : nothing}
        ${inDetail
          ? this._renderDetail(selectedCharger)
          : this._activeTab === "households"
            ? this._renderHouseholds()
            : this._activeTab === "chargers"
              ? this._renderChargers(chargers)
              : html`<div class="detail-view"><cc-settings .hass=${this.hass}></cc-settings></div>`}
      </div>
    `;
  }

  /** Numeric state of one of the charger's sensors, null when unknown. */
  private _chargerValue(chargerId: string, key: string): number | null {
    const entityId = (this._entities.chargers[chargerId] as Record<string, string>)?.[key];
    const value = parseFloat(this.hass.states[entityId]?.state);
    return Number.isFinite(value) ? value : null;
  }

  private _renderChargerCard(charger: ChargerData, selectable: boolean) {
    const entities = this._entities.chargers[charger.id];
    const targets = entities
      ? [1, 2, 3].map((i) => this._chargerValue(charger.id, `target_current_P${i}`))
      : null;
    const modeState = entities?.mode ? this.hass.states[entities.mode]?.state : undefined;
    return html`
      <cc-charger-card
        .chargerId=${charger.id}
        .name=${charger.name}
        .serialNumber=${charger.serialNumber}
        .status=${charger.status}
        .power=${charger.power}
        .currentLimit=${charger.currentLimit}
        .currentUsage=${charger.currentUsage}
        .l1Usage=${charger.l1_usage}
        .l2Usage=${charger.l2_usage}
        .l3Usage=${charger.l3_usage}
        .configured=${!!this._chargerConfigs[charger.id]}
        .targets=${targets}
        .mode=${modeState ?? null}
        @charger-selected=${selectable ? this._onChargerSelected : null}
      ></cc-charger-card>
    `;
  }

  private _renderChargers(chargers: ChargerData[]) {
    if (chargers.length === 0) {
      return html`<p>No Easee chargers detected in your system.</p>`;
    }

    const householdOf = (c: ChargerData) => this._chargerConfigs[c.id]?.household_id;
    const unassigned = chargers.filter((c) => {
      const householdId = householdOf(c);
      return !householdId || !this._households[householdId];
    });

    return html`
      ${Object.values(this._households).map((h) =>
        this._renderChargerGroup(
          h.name,
          chargers.filter((c) => householdOf(c) === h.household_id),
          "No chargers assigned to this household."
        )
      )}
      ${unassigned.length > 0 ? this._renderChargerGroup("Not configured", unassigned, "") : nothing}
    `;
  }

  private _renderChargerGroup(title: string, chargers: ChargerData[], emptyText: string) {
    return html`
      <section class="group">
        <h2 class="group-header">${title}</h2>
        ${chargers.length === 0
          ? html`<p class="group-empty">${emptyText}</p>`
          : html`<div class="grid">${chargers.map((c) => this._renderChargerCard(c, true))}</div>`}
      </section>
    `;
  }

  private _renderHouseholds() {
    if (this._editingHousehold !== null) {
      const household =
        this._editingHousehold === "new" ? null : this._households[this._editingHousehold];
      return html`
        <div class="detail-view">
          <cc-household-editor
            .hass=${this.hass}
            .household=${household}
            @household-saved=${this._onHouseholdSaved}
            @editor-closed=${() => (this._editingHousehold = null)}
          ></cc-household-editor>
        </div>
      `;
    }

    const households = Object.values(this._households);
    return html`
      <div class="actions">
        <ha-button @click=${() => (this._editingHousehold = "new")}>Add household</ha-button>
      </div>
      ${households.length === 0
        ? html`<p>No households configured yet.</p>`
        : html`
            <div class="grid">
              ${households.map(
                (h) => html`
                  <cc-household-card
                    .hass=${this.hass}
                    .household=${h}
                    @household-edit=${(e: CustomEvent) =>
                      (this._editingHousehold = e.detail.householdId)}
                    @household-delete=${this._onHouseholdDelete}
                  ></cc-household-card>
                `
              )}
            </div>
          `}
    `;
  }

  private _renderDetail(charger: ChargerData | null) {
    if (!charger) {
      return html`<p>Charger not found.</p>`;
    }

    return html`
      <div class="detail-view">
        ${this._renderChargerCard(charger, false)}
        <cc-load-balancer-settings
          .hass=${this.hass}
          .chargerId=${charger.id}
          .households=${this._households}
          .config=${this._chargerConfigs[charger.id] ?? null}
          @config-saved=${this._onChargerConfigSaved}
        ></cc-load-balancer-settings>
        <cc-charger-history
          .hass=${this.hass}
          .targetEntities=${this._targetEntities(charger.id)}
          .modeEntity=${this._entities.chargers[charger.id]?.mode ?? null}
        ></cc-charger-history>
      </div>
    `;
  }

  /** Target current sensors P1-P3 of a charger; empty until all exist. */
  private _targetEntities(chargerId: string): string[] {
    const entities = this._entities.chargers[chargerId] ?? {};
    const ids = [entities.target_current_P1, entities.target_current_P2, entities.target_current_P3];
    return ids.every((id) => id) ? (ids as string[]) : [];
  }

  private async _onChargerConfigSaved() {
    await this._loadData();
    // The backend reloads the integration after saving; entities exist shortly after
    setTimeout(() => this._loadData(), 3000);
  }

  private _navigate(path: string) {
    history.replaceState(null, "", `/charge-controller${path}`);
    window.dispatchEvent(new Event("location-changed"));
  }

  private _goBack() {
    this._selectedChargerId = null;
    this._navigate("");
  }

  private _onChargerSelected(e: CustomEvent<{ chargerId: string }>) {
    this._selectedChargerId = e.detail.chargerId;
    this._navigate(`/charger/${e.detail.chargerId}`);
  }

  private async _onHouseholdSaved() {
    this._editingHousehold = null;
    await this._loadData();
  }

  private async _onHouseholdDelete(e: CustomEvent<{ householdId: string }>) {
    const household = this._households[e.detail.householdId];
    if (!household || !confirm(`Delete household "${household.name}"?`)) {
      return;
    }
    try {
      await this.hass.callWS({
        type: `${WS}/households/delete`,
        household_id: household.household_id,
      });
      await this._loadData();
    } catch (err: any) {
      this._error = err?.message ?? String(err);
    }
  }

  private _applyRoute() {
    const path = this.route?.path ?? "";
    if (path.startsWith("/charger/")) {
      this._selectedChargerId = decodeURIComponent(path.slice(9));
    } else {
      this._selectedChargerId = null;
    }
    this._routeApplied = true;
  }

  static styles = css`
    :host {
      display: block;
      height: 100vh;
      background-color: var(--primary-background-color);
      color: var(--primary-text-color);
    }

    .toolbar {
      display: flex;
      align-items: center;
      height: 56px;
      padding: 0 16px;
      background-color: var(--app-header-background-color, var(--primary-background-color));
      color: var(--app-header-text-color, var(--primary-text-color));
      border-bottom: 1px solid var(--divider-color);
      font-size: 20px;
    }

    .toolbar .title {
      flex: 1;
    }

    .tabs {
      display: flex;
      height: 100%;
      align-items: center;
    }

    .tab {
      padding: 0 16px;
      cursor: pointer;
      height: 100%;
      display: flex;
      align-items: center;
      font-size: 16px;
      border-bottom: 2px solid transparent;
      transition: all 0.2s;
    }

    .tab.active {
      border-bottom-color: var(--primary-color);
      color: var(--primary-color);
    }

    .content {
      padding: 16px;
      height: calc(100vh - 56px - 32px);
      overflow-y: auto;
    }

    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 16px;
    }

    .detail-view {
      display: flex;
      flex-direction: column;
      gap: 16px;
      max-width: 600px;
      margin: 0 auto;
    }

    .group + .group {
      margin-top: 32px;
    }

    .group-header {
      margin: 0 0 16px;
      padding-bottom: 8px;
      border-bottom: 1px solid var(--divider-color);
      font-size: 18px;
      font-weight: 500;
    }

    .group-empty {
      color: var(--secondary-text-color);
    }

    .actions {
      display: flex;
      justify-content: flex-end;
      margin-bottom: 16px;
    }

    .error-banner {
      background-color: var(--error-color);
      color: var(--text-primary-color, #fff);
      padding: 8px 16px;
      border-radius: 4px;
      margin-bottom: 16px;
      cursor: pointer;
    }

    .loading {
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100vh;
    }

    ha-icon-button {
      margin-right: 8px;
    }
  `;
}
