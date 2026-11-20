import { LitElement, html, css, nothing } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { loadHaElements } from "./load-ha-elements";
import { getEaseeChargerData } from "./utils/charger/easee";
import { ChargerData } from "./utils/charger/charger-data";
import {
  ChargerConfig,
  ControllerEntities,
  ControllerSettings,
  DiscoveredCharger,
  EvConfig,
  HouseholdConfig,
} from "./types";
import "./components/cc-charger-card";
import "./components/cc-load-balancer-settings";
import "./components/cc-household-card";
import "./components/cc-household-editor";
import "./components/cc-charger-history";
import "./components/cc-ev-card";
import "./components/cc-ev-editor";
import "./components/cc-ev-detail";
import "./components/cc-settings";
import "./components/cc-charger-status";
import "./components/cc-dashboard";

type TabId = "dashboard" | "households" | "chargers" | "evs" | "settings";

const TABS: [TabId, string][] = [
  ["dashboard", "Dashboard"],
  ["households", "Households"],
  ["chargers", "Chargers"],
  ["evs", "EVs"],
  ["settings", "Settings"],
];

/** Panel-relative URL of each tab. */
const TAB_PATHS: Record<TabId, string> = {
  dashboard: "",
  households: "/households",
  chargers: "/chargers",
  evs: "/evs",
  settings: "/settings",
};

const PANEL_URL = "/charge-controller";

const WS = "generic_charge_controller";

@customElement("charge-controller-panel")
export class ChargeControllerPanel extends LitElement {
  @property({ attribute: false }) public hass!: any;
  @property({ type: Boolean, reflect: true }) public narrow = false;
  @property({ type: Object }) public route: { path: string } = { path: "" };
  @property({ type: Object }) public panel: Record<string, unknown> = {};

  @state() private _elementsLoaded = false;
  @state() private _selectedChargerId: string | null = null;
  @state() private _activeTab: TabId = "dashboard";
  @state() private _routeApplied = false;
  @state() private _households: Record<string, HouseholdConfig> = {};
  @state() private _chargerConfigs: Record<string, ChargerConfig> = {};
  @state() private _discoveredChargers: DiscoveredCharger[] = [];
  @state() private _entities: ControllerEntities = {
    households: {},
    chargers: {},
  };
  @state() private _settings: ControllerSettings | null = null;
  /** Household being edited: an id, "new", or null when not editing. */
  @state() private _editingHousehold: string | null = null;
  @state() private _evs: Record<string, EvConfig> = {};
  /** EV being edited: an id, "new", or null when not editing. */
  @state() private _editingEv: string | null = null;
  @state() private _selectedEvId: string | null = null;
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
      const [households, chargers, discovered, entities, settings, evs] =
        await Promise.all([
          this.hass.callWS({ type: `${WS}/households/get` }),
          this.hass.callWS({ type: `${WS}/chargers/get` }),
          this.hass.callWS({ type: `${WS}/chargers/discover` }),
          this.hass.callWS({ type: `${WS}/entities` }),
          this.hass.callWS({ type: `${WS}/settings/get` }),
          // Older backends have no EV support
          this.hass.callWS({ type: `${WS}/evs/get` }).catch(() => ({})),
        ]);
      this._evs = evs ?? {};
      this._settings = settings;
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

    const chargers = this._discoveredChargers.map((c) =>
      getEaseeChargerData(this.hass, c),
    );
    const selectedEv = this._selectedEvId ? (this._evs[this._selectedEvId] ?? null) : null;
    const inDetail = !!this._selectedChargerId || !!this._selectedEvId;
    const selectedCharger = inDetail
      ? (chargers.find((c) => c.id === this._selectedChargerId) ?? null)
      : null;

    return html`
      <div class="toolbar">
        <ha-menu-button
          .hass=${this.hass}
          .narrow=${this.narrow}
        ></ha-menu-button>
        ${inDetail || this._editingHousehold !== null || this._editingEv !== null
          ? html`<ha-icon-button .label=${"Back"} @click=${this._goBack}>
              <ha-icon .icon=${"mdi:arrow-left"}></ha-icon>
            </ha-icon-button>`
          : nothing}
        <div class="title">
          ${inDetail
            ? this._selectedEvId
              ? (selectedEv?.name ?? "EV Details")
              : (selectedCharger?.name ?? "Charger Details")
            : "Charge Controller"}
        </div>
        <div class="build-id">${__BUILD_ID__}</div>
      </div>
      ${!inDetail
        ? html`
            <div class="tabs">
              ${TABS.map(
                ([tab, label]) => html`
                  <div
                    class="tab ${this._activeTab === tab ? "active" : ""}"
                    @click=${() => this._navigate(TAB_PATHS[tab])}
                  >
                    ${label}
                  </div>
                `,
              )}
            </div>
          `
        : nothing}

      <div class="content">
        ${this._error
          ? html`<div class="error-banner" @click=${() => (this._error = "")}>
              ${this._error}
            </div>`
          : nothing}
        ${this._selectedEvId
          ? this._renderEvDetail(selectedEv)
          : inDetail
            ? this._renderDetail(selectedCharger)
            : this._activeTab === "dashboard"
            ? html`<cc-dashboard
                .hass=${this.hass}
                .households=${this._households}
                .chargerConfigs=${this._chargerConfigs}
                .chargers=${chargers}
                .entities=${this._entities}
                .evs=${this._evs}
                @ev-selected=${this._onEvSelected}
                @goto-tab=${(e: CustomEvent<{ tab: TabId }>) =>
                  this._navigate(TAB_PATHS[e.detail.tab])}
              ></cc-dashboard>`
            : this._activeTab === "households"
            ? this._renderHouseholds()
            : this._activeTab === "chargers"
              ? this._renderChargers(chargers)
              : this._activeTab === "evs"
                ? this._renderEvs(chargers)
                : html`<div class="detail-view">
                  <cc-settings .hass=${this.hass}></cc-settings>
                </div>`}
      </div>
    `;
  }

  /** Numeric state of one of the charger's sensors, null when unknown. */
  private _chargerValue(chargerId: string, key: string): number | null {
    const entityId = (
      this._entities.chargers[chargerId] as Record<string, string>
    )?.[key];
    const value = parseFloat(this.hass.states[entityId]?.state);
    return Number.isFinite(value) ? value : null;
  }

  private _renderChargerCard(charger: ChargerData, selectable: boolean) {
    const entities = this._entities.chargers[charger.id];
    const targets = entities
      ? [1, 2, 3].map((i) =>
          this._chargerValue(charger.id, `target_current_P${i}`),
        )
      : null;
    const modeState = entities?.mode
      ? this.hass.states[entities.mode]?.state
      : undefined;
    const controlActive = entities?.control_switch
      ? this.hass.states[entities.control_switch]?.state === "on"
      : null;
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
        .controlActive=${controlActive}
        @charger-selected=${selectable ? this._onChargerSelected : null}
      ></cc-charger-card>
    `;
  }

  private _renderChargers(chargers: ChargerData[]) {
    if (chargers.length === 0) {
      return html`<p>No Easee chargers detected in your system.</p>`;
    }

    const householdOf = (c: ChargerData) =>
      this._chargerConfigs[c.id]?.household_id;
    const unassigned = chargers.filter((c) => {
      const householdId = householdOf(c);
      return !householdId || !this._households[householdId];
    });

    return html`
      ${Object.values(this._households).map((h) =>
        this._renderChargerGroup(
          h.name,
          chargers.filter((c) => householdOf(c) === h.household_id),
          "No chargers assigned to this household.",
        ),
      )}
      ${unassigned.length > 0
        ? this._renderChargerGroup("Not configured", unassigned, "")
        : nothing}
    `;
  }

  private _renderChargerGroup(
    title: string,
    chargers: ChargerData[],
    emptyText: string,
  ) {
    return html`
      <section class="group">
        <h2 class="group-header">${title}</h2>
        ${chargers.length === 0
          ? html`<p class="group-empty">${emptyText}</p>`
          : html`<div class="grid">
              ${chargers.map((c) => this._renderChargerCard(c, true))}
            </div>`}
      </section>
    `;
  }

  private _renderHouseholds() {
    if (this._editingHousehold !== null) {
      const household =
        this._editingHousehold === "new"
          ? null
          : this._households[this._editingHousehold];
      if (this._editingHousehold !== "new" && !household) {
        return html`<p>Household not found.</p>`;
      }
      return html`
        <div class="detail-view">
          <cc-household-editor
            .hass=${this.hass}
            .household=${household}
            @household-saved=${this._onHouseholdSaved}
            @editor-closed=${this._goBack}
          ></cc-household-editor>
        </div>
      `;
    }

    const households = Object.values(this._households);
    return html`
      <div class="actions">
        <ha-button @click=${() => this._navigate("/households/new")}
          >Add household</ha-button
        >
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
                      this._navigate(
                        `/households/edit/${encodeURIComponent(e.detail.householdId)}`,
                      )}
                    @household-delete=${this._onHouseholdDelete}
                  ></cc-household-card>
                `,
              )}
            </div>
          `}
    `;
  }

  private _renderEvs(chargers: ChargerData[]) {
    if (this._editingEv !== null) {
      const names: Record<string, string> = {};
      for (const c of chargers) names[c.id] = c.name;
      if (this._editingEv !== "new" && !this._evs[this._editingEv]) {
        return html`<p>EV not found.</p>`;
      }
      return html`
        <div class="detail-view">
          <cc-ev-editor
            .hass=${this.hass}
            .ev=${this._editingEv === "new" ? null : this._evs[this._editingEv]}
            .chargerConfigs=${this._chargerConfigs}
            .chargerNames=${names}
            @ev-saved=${this._onEvSaved}
            @editor-closed=${this._goBack}
          ></cc-ev-editor>
        </div>
      `;
    }

    const evs = Object.values(this._evs);
    return html`
      <div class="actions">
        <ha-button @click=${() => this._navigate("/evs/new")}>Add EV</ha-button>
      </div>
      ${evs.length === 0
        ? html`<p>No EVs configured yet.</p>`
        : html`
            <div class="grid">
              ${evs.map(
                (ev) => html`
                  <cc-ev-card
                    .hass=${this.hass}
                    .ev=${ev}
                    .entities=${this._entities.evs?.[ev.ev_id] ?? {}}
                    @ev-selected=${this._onEvSelected}
                    @ev-edit=${(e: CustomEvent) =>
                      this._navigate(`/evs/edit/${encodeURIComponent(e.detail.evId)}`)}
                    @ev-delete=${this._onEvDelete}
                  ></cc-ev-card>
                `,
              )}
            </div>
          `}
    `;
  }

  private _renderEvDetail(ev: EvConfig | null) {
    if (!ev) {
      return html`<p>EV not found.</p>`;
    }
    return html`
      <div class="detail-view">
        <cc-ev-detail
          .hass=${this.hass}
          .ev=${ev}
          .entities=${this._entities.evs?.[ev.ev_id] ?? {}}
          .chargerControlSwitch=${this._entities.chargers[ev.charger_id]?.control_switch ?? null}
        ></cc-ev-detail>
      </div>
    `;
  }

  private _renderDetail(charger: ChargerData | null) {
    if (!charger) {
      return html`<p>Charger not found.</p>`;
    }

    return html`
      <div class="detail-view">
        ${this._renderChargerCard(charger, false)}
        ${this._chargerConfigs[charger.id]
          ? html`<cc-charger-status
              .hass=${this.hass}
              .config=${this._chargerConfigs[charger.id]}
              .household=${this._households[
                this._chargerConfigs[charger.id].household_id
              ] ?? null}
              .chargerEntities=${this._entities.chargers[charger.id] ?? {}}
              .householdEntities=${this._entities.households[
                this._chargerConfigs[charger.id].household_id
              ] ?? {}}
              .discovered=${this._discoveredChargers.find(
                (d) => d.device_id === charger.id,
              ) ?? null}
              .settings=${this._settings}
            ></cc-charger-status>`
          : nothing}
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
    const ids = [
      entities.target_current_P1,
      entities.target_current_P2,
      entities.target_current_P3,
    ];
    return ids.every((id) => id) ? (ids as string[]) : [];
  }

  private async _onChargerConfigSaved() {
    await this._loadData();
    // The backend reloads the integration after saving; entities exist shortly after
    setTimeout(() => this._loadData(), 3000);
  }

  /**
   * Show a panel view by pushing its URL, so the browser Back button returns
   * to the previous view. Entries we push are marked in history.state.
   */
  private _navigate(path: string) {
    if (location.pathname === `${PANEL_URL}${path}`) {
      return;
    }
    history.pushState({ ccPanel: true }, "", `${PANEL_URL}${path}`);
    this._applyPath(path);
    window.dispatchEvent(new Event("location-changed"));
  }

  /** Back to the previous panel view, or to the parent view on a direct link. */
  private _goBack = () => {
    if (history.state?.ccPanel) {
      history.back();
      return;
    }
    const path = this.route?.path ?? "";
    const parent = path.startsWith("/charger/")
      ? TAB_PATHS.chargers
      : path.startsWith("/ev/") || path.startsWith("/evs/")
        ? TAB_PATHS.evs
        : path.startsWith("/households/")
          ? TAB_PATHS.households
          : TAB_PATHS.dashboard;
    this._navigate(parent);
  };

  private _onChargerSelected(e: CustomEvent<{ chargerId: string }>) {
    this._navigate(`/charger/${encodeURIComponent(e.detail.chargerId)}`);
  }

  private _onEvSelected(e: CustomEvent<{ evId: string }>) {
    this._navigate(`/ev/${encodeURIComponent(e.detail.evId)}`);
  }

  private async _onEvSaved() {
    this._goBack();
    await this._loadData();
    // The backend reloads the integration after saving; entities exist shortly after
    setTimeout(() => this._loadData(), 3000);
  }

  private async _onEvDelete(e: CustomEvent<{ evId: string }>) {
    const ev = this._evs[e.detail.evId];
    if (!ev || !confirm(`Delete EV "${ev.name}"?`)) {
      return;
    }
    try {
      await this.hass.callWS({ type: `${WS}/evs/delete`, ev_id: ev.ev_id });
      await this._loadData();
    } catch (err: any) {
      this._error = err?.message ?? String(err);
    }
  }

  private async _onHouseholdSaved() {
    this._goBack();
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
    this._applyPath(this.route?.path ?? "");
    this._routeApplied = true;
  }

  /** Set the visible view from a panel-relative URL path. */
  private _applyPath(path: string) {
    const rest = (prefix: string) => decodeURIComponent(path.slice(prefix.length));
    this._selectedChargerId = null;
    this._selectedEvId = null;
    this._editingHousehold = null;
    this._editingEv = null;
    if (path.startsWith("/charger/")) {
      this._activeTab = "chargers";
      this._selectedChargerId = rest("/charger/");
    } else if (path.startsWith("/ev/")) {
      this._activeTab = "evs";
      this._selectedEvId = rest("/ev/");
    } else if (path === "/households/new") {
      this._activeTab = "households";
      this._editingHousehold = "new";
    } else if (path.startsWith("/households/edit/")) {
      this._activeTab = "households";
      this._editingHousehold = rest("/households/edit/");
    } else if (path === "/evs/new") {
      this._activeTab = "evs";
      this._editingEv = "new";
    } else if (path.startsWith("/evs/edit/")) {
      this._activeTab = "evs";
      this._editingEv = rest("/evs/edit/");
    } else {
      const tab = (Object.keys(TAB_PATHS) as TabId[]).find(
        (t) => TAB_PATHS[t] === path,
      );
      this._activeTab = tab ?? "dashboard";
    }
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
      background-color: var(
        --app-header-background-color,
        var(--primary-background-color)
      );
      color: var(--app-header-text-color, var(--primary-text-color));
      border-bottom: 1px solid var(--divider-color);
      font-size: 20px;
      position: sticky;
      top: 0;
      z-index: 4;
    }

    .toolbar .title {
      font-weight: 400;
      white-space: nowrap;
      overflow: hidden;
      flex: 1;
    }

    .toolbar .build-id {
      font-size: 12px;
      color: var(--secondary-text-color);
      white-space: nowrap;
    }

    .tabs {
      display: flex;
      gap: 0;
      overflow-x: auto;
      overscroll-behavior-x: contain;
      scrollbar-width: none;
      border-bottom: 1px solid var(--divider-color);
      padding: 0 16px;
      background: var(--primary-background-color);
      position: sticky;
      top: 56px;
      z-index: 3;
    }

    .tab {
      padding: 12px 24px;
      cursor: pointer;
      border: none;
      background: none;
      color: var(--secondary-text-color);
      font-size: 14px;
      font-weight: 500;
      border-bottom: 2px solid transparent;
      transition: all 0.2s ease;
      font-family: inherit;
      white-space: nowrap;
      flex-shrink: 0;
    }

    .tabs::-webkit-scrollbar {
      display: none;
    }

    @media (max-width: 600px) {
      .tabs {
        padding: 0;
      }

      .tab {
        padding: 12px 16px;
      }

      .content {
        padding: 16px;
      }
    }

    .tab:hover {
      color: var(--primary-text-color);
    }

    .tab.active {
      color: var(--primary-color);
      border-bottom-color: var(--primary-color);
    }

    .content {
      padding: 24px;
      max-width: 1200px;
      margin: 0 auto;
      box-sizing: border-box;
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

    .toolbar ha-menu-button,
    .toolbar ha-icon-button {
      color: var(--app-header-text-color, var(--primary-text-color));
    }

    ha-icon-button {
      margin-right: 8px;
    }
  `;
}
