import { LitElement, html, css } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { loadHaElements } from "./load-ha-elements";
import { getEaseeChargers } from "./utils/charger/easee";
import "./components/cc-charger-card";

type TabId = "chargers" | "settings";

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

  protected firstUpdated() {
    this._loadElements();
  }

  private async _loadElements() {
    await loadHaElements();
    this._elementsLoaded = true;
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

    const chargers = getEaseeChargers(this.hass);
    const inDetail = !!this._selectedChargerId;
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
          : ""
        }
        <div class="title">
          ${inDetail ? selectedCharger?.name ?? "Charger Details" : "Charge Controller"}
        </div>
      </div>
      <div class="content">
        ${inDetail 
          ? this._renderDetail(selectedCharger)
          : this._renderGrid(chargers)
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
              ${chargers.map(charger => html`
                <cc-charger-card
                  .chargerId=${charger.id}
                  .name=${charger.name}
                  .serialNumber=${charger.serialNumber}
                  .status=${charger.status}
                  .power=${charger.power}
                  .currentLimit=${charger.currentLimit}
                  .currentUsage=${charger.currentUsage}
                  .configured=${charger.configured}
                  @charger-selected=${this._onChargerSelected}
                ></cc-charger-card>
              `)}
            </div>
          `}
    `;
  }

  private _renderDetail(charger: any | null) {
    if (!charger) {
      return html`<p>Charger not found.</p>`;
    }

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
          .configured=${charger.configured}
        ></cc-charger-card>

        <ha-card header="Load Balancing Settings">
          <div class="card-content">
            <p>Placeholder for load balancing configuration.</p>
          </div>
        </ha-card>

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

  private _onChargerSelected(e: any) {
    this._selectedChargerId = e.detail.chargerId;
    this._navigate(`/charger/${e.detail.chargerId}`);
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
