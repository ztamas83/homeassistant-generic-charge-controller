import { LitElement, html, css } from "lit";
import { customElement, property } from "lit/decorators.js";
import { EvConfig, EvEntityKey, EV_STATUS_TEXT, HomeAssistant } from "../types";

@customElement("cc-ev-card")
export class CcEvCard extends LitElement {
  @property({ attribute: false }) public hass!: HomeAssistant;
  @property({ attribute: false }) public ev!: EvConfig;
  @property({ attribute: false }) public entities: Partial<Record<EvEntityKey, string>> = {};

  private _state(key: EvEntityKey): string | null {
    const id = this.entities[key];
    const s = id ? this.hass.states[id]?.state : undefined;
    return s === undefined || s === "unknown" || s === "unavailable" ? null : s;
  }

  private _num(key: EvEntityKey, digits = 0): string {
    const v = parseFloat(this._state(key) ?? "");
    return Number.isFinite(v) ? v.toFixed(digits) : "–";
  }

  private _nextStart(): string {
    const s = this._state("next_charge_start");
    const d = s ? new Date(s) : null;
    if (!d || Number.isNaN(d.getTime())) return "–";
    return new Intl.DateTimeFormat(this.hass.language, {
      weekday: "short",
      hour: "2-digit",
      minute: "2-digit",
    }).format(d);
  }

  protected render() {
    const status = this._state("status");
    return html`
      <ha-card .header=${this.ev.name} @click=${this._open}>
        <div class="card-content">
          <div class="row">
            <span class="label">Battery:</span>
            <span class="value">${this._num("current_soc")} % → ${this._num("target_soc")} %</span>
          </div>
          <div class="row">
            <span class="label">Energy needed:</span>
            <span class="value">${this._num("energy_needed", 1)} kWh</span>
          </div>
          <div class="row">
            <span class="label">Status:</span>
            <span class="value">${status ? (EV_STATUS_TEXT[status] ?? status) : "–"}</span>
          </div>
          <div class="row">
            <span class="label">Next charge start:</span>
            <span class="value">${this._nextStart()}</span>
          </div>
          <div class="row">
            <span class="label">Estimated power:</span>
            <span class="value">${this._num("estimated_power", 1)} kW</span>
          </div>
        </div>
        <div class="card-actions">
          <ha-button variant="danger" appearance="plain" @click=${this._onDelete}>Delete</ha-button>
          <ha-button @click=${this._onEdit}>Edit</ha-button>
        </div>
      </ha-card>
    `;
  }

  private _fire(type: string) {
    this.dispatchEvent(
      new CustomEvent(type, {
        detail: { evId: this.ev.ev_id },
        bubbles: true,
        composed: true,
      })
    );
  }

  private _open() {
    this._fire("ev-selected");
  }

  private _onEdit(e: Event) {
    e.stopPropagation();
    this._fire("ev-edit");
  }

  private _onDelete(e: Event) {
    e.stopPropagation();
    this._fire("ev-delete");
  }

  static styles = css`
    ha-card {
      height: 100%;
      display: flex;
      flex-direction: column;
      cursor: pointer;
    }

    .card-content {
      flex-grow: 1;
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

    .card-actions {
      display: flex;
      justify-content: flex-end;
      gap: 8px;
      padding: 8px;
      border-top: 1px solid var(--divider-color);
    }
  `;
}
