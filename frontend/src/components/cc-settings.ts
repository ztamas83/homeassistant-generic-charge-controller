import { LitElement, html, css, nothing } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { HomeAssistant } from "../types";
import type { HaFormSchema } from "../types/ha-elements";

interface Settings {
  charger_update_interval_s: number;
}

const SCHEMA: HaFormSchema[] = [
  {
    name: "charger_update_interval_s",
    required: true,
    selector: { number: { min: 30, max: 60, step: 1, mode: "slider", unit_of_measurement: "s" } },
  },
];

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
            Limits are recalculated whenever a meter or charger value changes. New limits are sent
            to the charger at most once per update interval. A household phase above 150% of the
            fuse rating for more than 10 seconds is sent at once.
          </p>
          ${this._data
            ? html`<ha-form
                .hass=${this.hass}
                .data=${this._data}
                .schema=${SCHEMA}
                .computeLabel=${() => "Charger update interval"}
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
