import { LitElement, html, css, nothing } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import {
  EvConfig,
  EvEntityKey,
  EvPlanInfo,
  EV_STATUS_TEXT,
  HomeAssistant,
} from "../types";
import "./cc-ev-schedule";

const WS = "generic_charge_controller";
const REFRESH_MS = 60_000;

@customElement("cc-ev-detail")
export class CcEvDetail extends LitElement {
  @property({ attribute: false }) public hass!: HomeAssistant;
  @property({ attribute: false }) public ev!: EvConfig;
  @property({ attribute: false }) public entities: Partial<Record<EvEntityKey, string>> = {};
  /** Entity id of the linked charger's load balancing switch, if any. */
  @property({ attribute: false }) public chargerControlSwitch: string | null = null;

  @state() private _info: EvPlanInfo | null = null;
  @state() private _error = "";

  private _timer?: number;
  private _fetchKey = "";

  connectedCallback() {
    super.connectedCallback();
    this._timer = window.setInterval(() => this._fetch(), REFRESH_MS);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    window.clearInterval(this._timer);
  }

  protected willUpdate() {
    // Re-fetch when the EV changes or its status / charge-now state changes
    const key = JSON.stringify([
      this.ev?.ev_id,
      this._state("status"),
      this._state("charge_now"),
    ]);
    if (key !== this._fetchKey) {
      this._fetchKey = key;
      this._fetch();
    }
  }

  private _state(key: EvEntityKey): string | undefined {
    const id = this.entities[key];
    return id ? this.hass?.states[id]?.state : undefined;
  }

  private async _fetch() {
    if (!this.ev) return;
    const evId = this.ev.ev_id;
    try {
      const info = await this.hass.callWS<EvPlanInfo>({ type: `${WS}/evs/plan`, ev_id: evId });
      if (evId === this.ev.ev_id) {
        this._info = info;
        this._error = "";
      }
    } catch (err: any) {
      this._error =
        err?.code === "not_loaded"
          ? "The charge controller is not loaded."
          : `Plan could not be loaded: ${err?.message ?? err}`;
    }
  }

  private _numberValue(key: EvEntityKey): number | undefined {
    const v = parseFloat(this._state(key) ?? "");
    return Number.isFinite(v) ? v : undefined;
  }

  private _setNumber(key: EvEntityKey, value: number) {
    const entity_id = this.entities[key];
    if (!entity_id || !Number.isFinite(value)) return;
    this.hass.callService("number", "set_value", { entity_id, value });
  }

  private _setSwitch(key: EvEntityKey, on: boolean) {
    const entity_id = this.entities[key];
    if (!entity_id) return;
    this.hass.callService("switch", on ? "turn_on" : "turn_off", { entity_id });
  }

  private async _resetLearning() {
    if (!confirm(`Reset learned charging data for "${this.ev.name}"?`)) return;
    try {
      await this.hass.callWS({ type: `${WS}/evs/learning/reset`, ev_id: this.ev.ev_id });
      await this._fetch();
    } catch (err: any) {
      this._error = err?.message ?? String(err);
    }
  }

  private _socControl(key: "current_soc" | "target_soc", label: string) {
    return html`
      <ha-selector
        .hass=${this.hass}
        .label=${label}
        .selector=${{
          number: { min: 0, max: 100, step: 1, mode: "slider", unit_of_measurement: "%" },
        }}
        .value=${this._numberValue(key)}
        .disabled=${!this.entities[key]}
        @value-changed=${(e: CustomEvent) => this._setNumber(key, e.detail.value)}
      ></ha-selector>
    `;
  }

  private _toggle(key: EvEntityKey, label: string) {
    return html`
      <ha-selector
        .hass=${this.hass}
        .label=${label}
        .selector=${{ boolean: {} }}
        .value=${this._state(key) === "on"}
        .disabled=${!this.entities[key]}
        @value-changed=${(e: CustomEvent) => this._setSwitch(key, !!e.detail.value)}
      ></ha-selector>
    `;
  }

  protected render() {
    const info = this._info;
    const status = info?.status ?? this._state("status");
    const est = info?.estimate;
    const chargerOff =
      this.chargerControlSwitch !== null &&
      this.hass.states[this.chargerControlSwitch]?.state === "off";
    return html`
      ${chargerOff
        ? html`<div class="warning">
            Load balancing is switched off for the linked charger. Smart charging cannot control
            the charger until it is switched on.
          </div>`
        : nothing}
      ${this._error ? html`<div class="error">${this._error}</div>` : nothing}
      <ha-card .header=${this.ev.name}>
        <div class="card-content">
          <div class="row">
            <span class="label">Status:</span>
            <span class="value">${status ? (EV_STATUS_TEXT[status] ?? status) : "–"}</span>
          </div>
          ${info?.energy_needed_kwh != null
            ? html`<div class="row">
                <span class="label">Energy needed:</span>
                <span class="value">${info.energy_needed_kwh.toFixed(1)} kWh</span>
              </div>`
            : nothing}
          ${info?.plan
            ? html`<div class="row">
                <span class="label">Planned cost:</span>
                <span class="value">${info.plan.cost.toFixed(2)}${info.currency ? ` ${info.currency}` : ""}</span>
              </div>`
            : nothing}
          ${this._socControl("current_soc", "Current battery level")}
          ${this._socControl("target_soc", "Target battery level")}
          ${this._toggle("smart_charging", "Smart charging")}
          ${this._toggle("control_charger", "Control charger (off = dry run)")}
        </div>
      </ha-card>

      <ha-card header="Charging estimate">
        <div class="card-content">
          ${est
            ? html`
                <div class="row">
                  <span class="label">Power:</span>
                  <span class="value">${est.power_kw.toFixed(1)} kW</span>
                </div>
                <div class="row">
                  <span class="label">Duration:</span>
                  <span class="value">${this._duration(est.duration_min)}</span>
                </div>
                <div class="row">
                  <span class="label">Source:</span>
                  <span class="value">${est.source === "learned" ? "Learned" : "Fallback"}</span>
                </div>
                <div class="row">
                  <span class="label">Confidence:</span>
                  <span class="value">${Math.round(est.confidence * 100)} %</span>
                </div>
                <div class="row">
                  <span class="label">Samples:</span>
                  <span class="value">${est.n_samples}</span>
                </div>
              `
            : html`<p class="hint">No estimate available.</p>`}
        </div>
        <div class="card-actions">
          <ha-button variant="danger" appearance="plain" @click=${this._resetLearning}
            >Reset learning</ha-button
          >
        </div>
      </ha-card>

      <ha-card header="Schedule">
        <div class="card-content">
          <cc-ev-schedule
            .hass=${this.hass}
            .prices=${info?.prices ?? []}
            .currency=${info?.currency ?? null}
            .blocks=${info?.plan?.blocks ?? []}
            .deadline=${info?.deadline ?? null}
          ></cc-ev-schedule>
        </div>
      </ha-card>
    `;
  }

  private _duration(min: number) {
    const h = Math.floor(min / 60);
    const m = Math.round(min % 60);
    return h > 0 ? `${h} h ${m} min` : `${m} min`;
  }

  static styles = css`
    :host {
      display: flex;
      flex-direction: column;
      gap: 16px;
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

    .hint {
      color: var(--secondary-text-color);
    }

    .warning {
      background-color: var(--warning-color, #ffa600);
      color: var(--text-primary-color, #fff);
      padding: 8px 16px;
      border-radius: 4px;
    }

    .error {
      background-color: var(--error-color);
      color: var(--text-primary-color, #fff);
      padding: 8px 16px;
      border-radius: 4px;
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
