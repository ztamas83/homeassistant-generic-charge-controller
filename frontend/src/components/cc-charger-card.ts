import { LitElement, html, css } from "lit";
import { customElement, property } from "lit/decorators.js";
import { mdiScaleBalance, mdiScaleBalanceOff } from "../utils/icons";

@customElement("cc-charger-card")
export class CcChargerCard extends LitElement {
  @property() public chargerId = "";
  @property() public name = "";
  @property() public serialNumber = "";
  @property() public status = "";
  @property({ type: Number }) public power = 0;
  @property({ type: Number }) public currentLimit = 0;
  @property({ type: Number }) public currentUsage = 0;
  @property({ type: Number }) public l1Usage = 0;
  @property({ type: Number }) public l2Usage = 0;
  @property({ type: Number }) public l3Usage = 0;
  @property({ type: Boolean }) public configured = false;
  /** Calculated target current per charger phase P1-P3; null when unknown. */
  @property({ attribute: false }) public targets: (number | null)[] | null = null;
  /** Load balancing mode (idle, charging, limited, failsafe); null when unknown. */
  @property() public mode: string | null = null;
  /** Whether limits are sent to the charger; null when unknown. */
  @property({ attribute: false }) public controlActive: boolean | null = null;

  private _formatTarget(value: number | null) {
    return value === null ? "–" : value.toFixed(0);
  }

  protected render() {
    const accentClass = this.configured
      ? this.status === "charging"
        ? "accent-charging"
        : "accent-idle"
      : "accent-unconfigured";
    return html`
      <ha-card .header=${this.name} @click=${this._handleClick}>
        <div class="accent ${accentClass}"></div>
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
            <span class="label">Usage (P1/P2/P3):</span>
            <span class="value">${this.l1Usage.toFixed(1)} / ${this.l2Usage.toFixed(1)} / ${this.l3Usage.toFixed(1)} A</span>
          </div>
          ${this.configured && this.targets
            ? html`
              <div class="row">
                <span class="label">Target (P1/P2/P3):</span>
                <span class="value">${this.targets.map((t) => this._formatTarget(t)).join(" / ")} A</span>
              </div>
              <div class="row">
                <span class="label">Load balancing:</span>
                <span class="value mode ${this.mode ?? ""}">${this.mode ?? "unknown"}</span>
              </div>
              <div class="row">
                <span class="label">Sending limits:</span>
                <span class="value">${this.controlActive === null ? "–" : this.controlActive ? "On" : "Off"}</span>
              </div>`
            : ""}
          <div class="row">
            <span class="label">Current Limit:</span>
            <span class="value">${this.currentLimit} A</span>
          </div>
          <div class="progress-bar">
             <div class="progress" style="width: ${Math.min(100, (this.currentUsage / this.currentLimit) * 100)}%"></div>
          </div>
        </div>
        <div class="card-actions">
          ${this.configured
            ? html`<ha-button>Details</ha-button>`
            : html`<ha-button class="warning">Configure</ha-button>`
          }
        </div>
      </ha-card>
    `;
  }

  private _handleClick() {
    this.dispatchEvent(new CustomEvent("charger-selected", {
      detail: { chargerId: this.chargerId },
      bubbles: true,
      composed: true,
    }));
  }

  static styles = css`
    ha-card {
      cursor: pointer;
      transition: box-shadow 0.2s ease, transform 0.15s ease;
      overflow: hidden;
      position: relative;
      height: 100%;
      box-sizing: border-box;
    }

    ha-card:hover {
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
      transform: translateY(-1px);
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

    .mode.limited {
      color: var(--warning-color, #ff9800);
    }

    .mode.failsafe {
      color: var(--error-color);
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

    /* Colored left accent based on mode */
    .accent {
      position: absolute;
      left: 0;
      top: 0;
      bottom: 0;
      width: 4px;
    }

    .accent-charging {
      background: var(--warning-color, #00ff88);
    }

    .accent-idle {
      background: var(--disabled-text-color, #bdbdbd);
    }

    .accent-unconfigured {
      background: transparent;
    }
    
    .warning {
      --mdc-theme-primary: var(--error-color);
    }
  `;
}
