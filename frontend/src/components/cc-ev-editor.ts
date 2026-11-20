import { LitElement, html, css, nothing } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { ChargerConfig, EvConfig, HomeAssistant } from "../types";
import type { HaFormSchema } from "../types/ha-elements";

type EvForm = Omit<EvConfig, "ev_id">;

const LABELS: Record<string, string> = {
  name: "Name",
  charger_id: "Charger",
  battery_kwh: "Battery capacity",
  soc_entity: "Battery level sensor (optional)",
  target_soc_entity: "Target battery level sensor (optional)",
  power_entity: "Charging power sensor",
  fallback_power_kw: "Fallback charging power",
  max_blocks: "Maximum number of charging blocks",
  ready_by: "Ready by (optional)",
};

/** Time selector values are HH:MM:SS; the backend stores HH:MM. */
const toHm = (v: unknown): string | null =>
  typeof v === "string" && v ? v.slice(0, 5) : null;

@customElement("cc-ev-editor")
export class CcEvEditor extends LitElement {
  @property({ attribute: false }) public hass!: HomeAssistant;
  /** EV to edit; null creates a new one. */
  @property({ attribute: false }) public ev: EvConfig | null = null;
  @property({ attribute: false }) public chargerConfigs: Record<string, ChargerConfig> = {};
  /** Charger device id -> display name. */
  @property({ attribute: false }) public chargerNames: Record<string, string> = {};

  @state() private _data: Partial<EvForm> = { fallback_power_kw: 7, max_blocks: 3 };
  @state() private _error = "";
  @state() private _saving = false;

  protected willUpdate(changed: Map<string, unknown>) {
    if (changed.has("ev") && this.ev) {
      const { ev_id, ...form } = this.ev;
      this._data = form;
    }
  }

  private get _schema(): HaFormSchema[] {
    return [
      { name: "name", required: true, selector: { text: {} } },
      {
        name: "charger_id",
        required: true,
        selector: {
          select: {
            mode: "dropdown",
            options: Object.keys(this.chargerConfigs).map((id) => ({
              value: id,
              label: this.chargerNames[id] ?? id,
            })),
          },
        },
      },
      {
        name: "battery_kwh",
        required: true,
        selector: { number: { min: 1, max: 300, step: 0.1, mode: "box", unit_of_measurement: "kWh" } },
      },
      { name: "soc_entity", selector: { entity: { filter: { domain: "sensor" } } } },
      {
        name: "target_soc_entity",
        selector: { entity: { filter: { domain: ["sensor", "number", "input_number"] } } },
      },
      {
        name: "power_entity",
        required: true,
        selector: { entity: { filter: { domain: "sensor", device_class: "power" } } },
      },
      {
        name: "fallback_power_kw",
        selector: { number: { min: 0.5, max: 50, step: 0.1, mode: "box", unit_of_measurement: "kW" } },
      },
      { name: "max_blocks", selector: { number: { min: 1, max: 6, step: 1, mode: "slider" } } },
      { name: "ready_by", selector: { time: {} } },
    ];
  }

  private get _valid(): boolean {
    const d = this._data;
    return !!(d.name?.trim() && d.charger_id && d.battery_kwh && d.power_entity);
  }

  protected render() {
    const noChargers = Object.keys(this.chargerConfigs).length === 0;
    return html`
      <ha-card .header=${this.ev ? `Edit ${this.ev.name}` : "New EV"}>
        <div class="card-content">
          <p class="description">
            Link the EV to a charger that is configured for load balancing. The power sensor is
            used to learn the real charging power.
          </p>
          ${noChargers
            ? html`<p class="error">No chargers are configured. Configure load balancing for a charger first.</p>`
            : nothing}
          <ha-form
            .hass=${this.hass}
            .data=${this._data}
            .schema=${this._schema}
            .computeLabel=${(s: HaFormSchema) => LABELS[s.name] ?? s.name}
            .computeHelper=${(s: HaFormSchema) =>
              s.name === "target_soc_entity" ? "e.g. the car's charge limit" : ""}
            @value-changed=${(e: CustomEvent) => (this._data = e.detail.value)}
          ></ha-form>
          ${this._error ? html`<p class="error">${this._error}</p>` : nothing}
        </div>
        <div class="card-actions">
          <ha-button appearance="plain" @click=${this._cancel}>Cancel</ha-button>
          <ha-button .disabled=${!this._valid || this._saving} @click=${this._save}>Save</ha-button>
        </div>
      </ha-card>
    `;
  }

  private async _save() {
    this._saving = true;
    this._error = "";
    const d = this._data;
    const config = {
      name: d.name?.trim(),
      charger_id: d.charger_id,
      battery_kwh: d.battery_kwh,
      soc_entity: d.soc_entity || null,
      target_soc_entity: d.target_soc_entity || null,
      power_entity: d.power_entity,
      fallback_power_kw: d.fallback_power_kw,
      max_blocks: d.max_blocks,
      ready_by: toHm(d.ready_by),
      model: d.model ?? "hourly",
    };
    try {
      await this.hass.callWS({
        type: "generic_charge_controller/evs/save",
        ...(this.ev ? { ev_id: this.ev.ev_id } : {}),
        config,
      });
      this.dispatchEvent(new CustomEvent("ev-saved", { bubbles: true, composed: true }));
    } catch (err: any) {
      this._error = err?.message ?? String(err);
    } finally {
      this._saving = false;
    }
  }

  private _cancel() {
    this.dispatchEvent(new CustomEvent("editor-closed", { bubbles: true, composed: true }));
  }

  static styles = css`
    .description {
      color: var(--secondary-text-color);
      margin-top: 0;
    }

    .error {
      color: var(--error-color);
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
