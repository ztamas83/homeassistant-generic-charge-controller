import { LitElement, html, css, nothing } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { ControllerSettings, HomeAssistant } from "../types";
import type { HaFormSchema } from "../types/ha-elements";

type Settings = ControllerSettings;

const number = (name: string, min: number, max: number, unit: string): HaFormSchema => ({
  name,
  required: true,
  selector: { number: { min, max, step: 1, mode: "slider", unit_of_measurement: unit } },
});

const SCHEMA: HaFormSchema[] = [
  number("charger_update_interval_s", 30, 60, "s"),
  number("safety_margin_a", 0, 5, "A"),
  number("ramp_up_a_per_min", 1, 10, "A/min"),
  number("stale_after_s", 60, 600, "s"),
];

const LABELS: Record<string, string> = {
  charger_update_interval_s: "Charger update interval",
  safety_margin_a: "Safety margin below the fuse rating",
  ramp_up_a_per_min: "Ramp-up speed after a load drops",
  stale_after_s: "Treat a meter as failed after no report for",
};

const HELPERS: Record<string, string> = {
  charger_update_interval_s:
    "New limits are sent to the charger at most this often. A household phase above 150% of the fuse for more than 10 s is sent at once.",
  safety_margin_a: "Current kept free on every phase.",
  ramp_up_a_per_min: "Lower targets apply at once; higher targets rise at most this fast.",
  stale_after_s:
    "A meter sensor that has not reported for this long counts as unknown, which pauses charging (failsafe).",
};

@customElement("cc-settings")
export class CcSettings extends LitElement {
  @property({ attribute: false }) public hass!: HomeAssistant;

  @state() private _data: Settings | null = null;
  @state() private _saved: Settings | null = null;
  @state() private _error = "";
  @state() private _saving = false;

  protected firstUpdated() {
    this._load();
  }

  private async _load() {
    try {
      const settings = await this.hass.callWS<Settings>({
        type: "generic_charge_controller/settings/get",
      });
      this._data = settings;
      this._saved = settings;
    } catch (err: any) {
      this._error = err?.message ?? String(err);
    }
  }

  protected render() {
    const changed = JSON.stringify(this._data) !== JSON.stringify(this._saved);
    return html`
      <ha-card header="Load balancing">
        <div class="card-content">
          <p class="description">
            Limits are recalculated whenever a meter or charger value changes.
          </p>
          ${this._data
            ? html`<ha-form
                .hass=${this.hass}
                .data=${this._data}
                .schema=${SCHEMA}
                .computeLabel=${(s: HaFormSchema) => LABELS[s.name] ?? s.name}
                .computeHelper=${(s: HaFormSchema) => HELPERS[s.name] ?? ""}
                @value-changed=${(e: CustomEvent) => (this._data = e.detail.value)}
              ></ha-form>`
            : nothing}
          ${this._error ? html`<p class="error">${this._error}</p>` : nothing}
        </div>
        <div class="card-actions">
          <ha-button .disabled=${!changed || this._saving} @click=${this._save}>Save</ha-button>
        </div>
      </ha-card>
    `;
  }

  private async _save() {
    this._saving = true;
    this._error = "";
    try {
      const saved = await this.hass.callWS<Settings>({
        type: "generic_charge_controller/settings/save",
        changes: this._data,
      });
      this._data = saved;
      this._saved = saved;
    } catch (err: any) {
      this._error = err?.message ?? String(err);
    } finally {
      this._saving = false;
    }
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
      padding: 8px;
      border-top: 1px solid var(--divider-color);
    }
  `;
}
