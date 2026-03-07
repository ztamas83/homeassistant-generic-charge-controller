import { LitElement, html, css } from "lit";
import { customElement, property } from "lit/decorators.js";
import { mdiScaleBalance, mdiScaleBalanceOff } from "../utils/icons";

@customElement("cc-charger-card")
export class CcChargerCard extends LitElement {
  @property() public name = "";
  @property() public serialNumber = "";
  @property() public status = "";
  @property({ type: Number }) public power = 0;
  @property({ type: Number }) public currentLimit = 0;
  @property({ type: Number }) public currentUsage = 0;
  @property({ type: Boolean }) public configured = false;

  protected render() {
    return html`
      <ha-card .header=${this.name}>
        <ha-svg-icon
          class="configured-icon ${this.configured ? "is-configured" : ""}"
          .path=${this.configured ? mdiScaleBalance : mdiScaleBalanceOff}
          title=${this.configured ? "Load balancing configured" : "Load balancing NOT configured"}
        ></ha-svg-icon>

        <div class="card-content">
          <div class="row">
            <span class="label">Serial:</span>
            <span class="value">${this.serialNumber}</span>
          </div>
          <div class="row">
            <span class="label">Status:</span>
            <span class="value status ${this.status.toLowerCase()}">${this.status}</span>
          </div>
          <div class="row">
            <span class="label">Power:</span>
            <span class="value">${this.power.toFixed(1)} kW</span>
          </div>
          <div class="row">
            <span class="label">Current Limit:</span>
            <span class="value">${this.currentLimit} A</span>
          </div>
          <div class="row">
            <span class="label">Current Usage:</span>
            <span class="value">${this.currentUsage.toFixed(1)} A</span>
          </div>
          <div class="progress-bar">
             <div class="progress" style="width: ${Math.min(100, (this.currentUsage / this.currentLimit) * 100)}%"></div>
          </div>
        </div>
        <div class="card-actions">
          ${this.configured
            ? html`<ha-button>Details</ha-button>`
            : html`<ha-button>Configure</ha-button>`
          }
        </div>
      </ha-card>
    `;
  }

  static styles = css`
    ha-card {
      height: 100%;
      display: flex;
      flex-direction: column;
      position: relative;
    }

    .configured-icon {
      position: absolute;
      top: 16px;
      right: 16px;
      color: var(--disabled-text-color);
      z-index: 1;
    }

    .configured-icon.is-configured {
      color: var(--success-color, #4caf50);
    }

    .card-content {
      flex-grow: 1;
      padding-top: 0;
    }

    .row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 8px;
    }

    .label {
      color: var(--secondary-text-color);
    }

    .value {
      font-weight: 500;
    }

    .status.charging {
      color: var(--success-color, #4caf50);
    }

    .status.idle {
      color: var(--secondary-text-color);
    }

    .progress-bar {
      height: 8px;
      background-color: var(--secondary-background-color);
      border-radius: 4px;
      margin-top: 12px;
      overflow: hidden;
    }

    .progress {
      height: 100%;
      background-color: var(--primary-color);
      transition: width 0.5s ease-in-out;
    }

    .card-actions {
      display: flex;
      justify-content: flex-end;
      gap: 8px;
      border-top: 1px solid var(--divider-color);
      padding: 4px 8px;
    }
  `;
}
