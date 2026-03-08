import { LitElement, html, css, nothing } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { HomeAssistant } from "../types";

@customElement("cc-load-balancer-settings")
export class CcLoadBalancerSettings extends LitElement {
  @property({ attribute: false }) public hass!: HomeAssistant;
  @property() public chargerId = "";
  @property({ attribute: false }) public households: Record<string, any> = {};

  @state() private _selectedHouseholdId = "";

  protected firstUpdated() {
    this._loadConfig();
  }

  private async _loadConfig() {
    try {
      const chargers = await this.hass.callWS<Record<string, any>>({
        type: "generic_charge_controller/chargers/get",
      });
      const config = chargers[this.chargerId];
      if (config) {
        this._selectedHouseholdId = config.household_id || "";
      }
    } catch (err) {
      console.error("Error loading charger config:", err);
    }
  }

  protected render() {
    const enabledHouseholds = Object.values(this.households);
    
    if (enabledHouseholds.length === 0) {
      return html`
        <ha-card header="Load Balancing Configuration">
          <div class="card-content">
            <p class="warning-text">
              No households are currently enabled. At least one household must be enabled in the "Households" tab before you can configure load balancing for this charger.
            </p>
          </div>
        </ha-card>
      `;
    }

    return html`
      <ha-card header="Load Balancing Configuration">
        <div class="card-content">
          <p class="description">
            Select the household this charger should be connected to for load balancing.
          </p>
          
          <div class="settings-row">
            <span class="label">Connected Household</span>
            <select 
              .value=${this._selectedHouseholdId}
              @change=${(e: any) => this._selectedHouseholdId = e.target.value}
            >
              <option value="">Select a household...</option>
              ${enabledHouseholds.map(h => {
                const device = this.hass.devices[h.device_id];
                const name = device ? device.name.replace(/Tibber Pulse/gi, "").trim() || device.name : h.device_id;
                return html`<option value=${h.device_id} ?selected=${this._selectedHouseholdId === h.device_id}>${name}</option>`;
              })}
            </select>
          </div>
        </div>
        <div class="card-actions">
           <ha-button 
             .disabled=${!this._selectedHouseholdId}
             @click=${this._save}
           >
             Save Configuration
           </ha-button>
        </div>
      </ha-card>
    `;
  }

  private async _save() {
    try {
      await this.hass.callWS({
        type: "generic_charge_controller/chargers/save",
        charger_id: this.chargerId,
        config: {
          household_id: this._selectedHouseholdId,
        }
      });
      
      this.dispatchEvent(new CustomEvent("config-saved", {
        bubbles: true,
        composed: true
      }));
    } catch (err) {
      console.error("Error saving charger config:", err);
    }
  }

  static styles = css`
    .description {
      color: var(--secondary-text-color);
      margin-bottom: 16px;
    }

    .warning-text {
      color: var(--error-color);
      font-weight: 500;
    }

    .settings-row {
      display: flex;
      flex-direction: column;
      margin-bottom: 16px;
    }

    .label {
      font-weight: 500;
      margin-bottom: 8px;
    }

    select {
      width: 100%;
      padding: 8px;
      border-radius: 4px;
      border: 1px solid var(--divider-color);
      background-color: var(--card-background-color);
      color: var(--primary-text-color);
      font-size: 16px;
    }

    .card-actions {
      display: flex;
      justify-content: flex-end;
      padding: 8px;
      border-top: 1px solid var(--divider-color);
    }
  `;
}
