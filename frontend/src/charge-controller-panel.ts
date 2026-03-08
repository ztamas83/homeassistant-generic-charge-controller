import { LitElement, html, css, nothing } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { loadHaElements } from "./load-ha-elements";
import { getEaseeChargers } from "./utils/charger/easee";
import "./components/cc-charger-card";
import "./components/cc-load-balancer-settings";
import "./components/cc-household-card";

type TabId = "chargers" | "households" | "settings";

@customElement("charge-controller-panel")
export class ChargeControllerPanel extends LitElement {
  @property({ attribute: false }) public hass!: any;
  @property({ type: Boolean, reflect: true }) public narrow = false;
  @property({ type: Object }) public route: { path: string } = { path: "" };
  @property({ type: Object }) public panel: Record<string, unknown> = {};

  @state() private _elementsLoaded = false;
  @state() private _selectedChargerId: string | null = null;
  @state() private _activeTab: TabId = "chargers";
  @state() private _routeApplied = false;
  @state() private _configuredHouseholds: Record<string, any> = {};
  @state() private _configuredChargers: Record<string, any> = {};

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
      this._configuredHouseholds = await this.hass.callWS({
        type: "generic_charge_controller/households/get",
      });
      this._configuredChargers = await this.hass.callWS({
        type: "generic_charge_controller/chargers/get",
      });
    } catch (err) {
      console.error("Error loading data from Charge Controller backend:", err);
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

    const inDetail = !!this._selectedChargerId;
    const chargers = getEaseeChargers(this.hass);
    const selectedCharger = inDetail 
      ? chargers.find(c => c.id === this._selectedChargerId)
      : null;

    return html`
      <div class="toolbar">
        ${inDetail 
          ? html`
            <ha-icon-button
              .label=${"Back"}
              @click=${this._goBack}
            >
              <ha-icon .icon=${"mdi:arrow-left"}></ha-icon>
            </ha-icon-button>`
      : nothing
        }
        <div class="title">
          ${inDetail ? selectedCharger?.name ?? "Charger Details" : "Charge Controller"}
        </div>
        ${!inDetail
        ? html`
            <div class="tabs">
              <div 
                class="tab ${this._activeTab === "chargers" ? "active" : ""}" 
                @click=${() => this._activeTab = "chargers"}
              >
                Chargers
              </div>
              <div 
                class="tab ${this._activeTab === "households" ? "active" : ""}" 
                @click=${() => this._activeTab = "households"}
              >
                Households
              </div>
            </div>
          `
        : nothing
        }
      </div>
      <div class="content">
        ${inDetail 
          ? this._renderDetail(selectedCharger)
      : this._activeTab === "chargers"
        ? this._renderGrid(chargers)
        : this._renderHouseholds()
        }
      </div>
    `;
  }

  private _renderGrid(chargers: any[]) {
    return html`
      ${chargers.length === 0
        ? html`<p>No Easee chargers detected in your system.</p>`
        : html`
            <div class="grid">
              ${chargers.map(charger => {
                const isConfigured = !!this._configuredChargers[charger.id];
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
                  .configured=${isConfigured}
                  @charger-selected=${this._onChargerSelected}
                ></cc-charger-card>
              `;
              })}
            </div>
          `}
    `;
  }

  private _renderHouseholds() {
    // Detect "Tibber pulse" devices
    const tibberPulseDevices = Object.values(this.hass.devices).filter(
      (device: any) => device.model === "Tibber Pulse"
    );

    return html`
      ${tibberPulseDevices.length === 0
        ? html`<p>No Tibber Pulse devices detected in your system.</p>`
        : html`
            <div class="grid">
              ${tibberPulseDevices.map((device: any) => {
          const name = device.name.replace(/Tibber Pulse/gi, "").trim() || device.name;
          const isConfigured = !!this._configuredHouseholds[device.id];
          return html`
                  <cc-household-card
                    .deviceId=${device.id}
                    .name=${name}
                    .enabled=${isConfigured}
                    @household-enabled=${this._onHouseholdEnabled}
                    @household-removed=${this._onHouseholdRemoved}
                  ></cc-household-card>
                `;
        })}
            </div>
          `}
    `;
  }

  private _renderDetail(charger: any | null) {
    if (!charger) {
      return html`<p>Charger not found.</p>`;
    }

    const isConfigured = !!this._configuredChargers[charger.id];

    return html`
      <div class="detail-view">
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
          .configured=${isConfigured}
        ></cc-charger-card>

        <cc-load-balancer-settings
          .hass=${this.hass}
          .chargerId=${charger.id}
          .households=${this._configuredHouseholds}
          @config-saved=${this._loadData}
        ></cc-load-balancer-settings>

        <ha-card header="Statistics">
          <div class="card-content">
            <p>Placeholder for charging statistics and history.</p>
          </div>
        </ha-card>
      </div>
    `;
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

  private async _onHouseholdEnabled(e: CustomEvent<{ deviceId: string }>) {
    console.log(`Enable household for device: ${e.detail.deviceId}`);
    try {
      const household = await this.hass.callWS({
        type: "generic_charge_controller/households/save",
        device_id: e.detail.deviceId,
        config: { enabled: true }
      });
      this._configuredHouseholds = {
        ...this._configuredHouseholds,
        [e.detail.deviceId]: household
      };
    } catch (err) {
      console.error("Error saving household:", err);
    }
  }

  private async _onHouseholdRemoved(e: CustomEvent<{ deviceId: string }>) {
    console.log(`Household removed for device: ${e.detail.deviceId}`);
    try {
      await this.hass.callWS({
        type: "generic_charge_controller/households/delete",
        device_id: e.detail.deviceId,
      });
      const newHouseholds = { ...this._configuredHouseholds };
      delete newHouseholds[e.detail.deviceId];
      this._configuredHouseholds = newHouseholds;
    } catch (err) {
      console.error("Error deleting household:", err);
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
