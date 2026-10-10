import { LitElement, html, css, nothing } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { HomeAssistant, HouseholdConfig } from "../types";
import type { HaFormSchema } from "../types/ha-elements";

type HouseholdForm = Omit<HouseholdConfig, "household_id">;

const phaseSensor = (name: string): HaFormSchema => ({
  name,
  required: true,
  selector: { entity: { filter: { domain: "sensor", device_class: "current" } } },
});

const SCHEMA: HaFormSchema[] = [
  { name: "name", required: true, selector: { text: {} } },
  {
    name: "fuse_a",
    required: true,
    selector: { number: { min: 6, max: 250, step: 1, mode: "box", unit_of_measurement: "A" } },
  },
  phaseSensor("l1_entity"),
  phaseSensor("l2_entity"),
  phaseSensor("l3_entity"),
];

const LABELS: Record<string, string> = {
  name: "Name",
  fuse_a: "Main fuse rating",
  l1_entity: "Current sensor L1",
  l2_entity: "Current sensor L2",
  l3_entity: "Current sensor L3",
};

@customElement("cc-household-editor")
export class CcHouseholdEditor extends LitElement {
  @property({ attribute: false }) public hass!: HomeAssistant;
  /** Household to edit; null creates a new one. */
  @property({ attribute: false }) public household: HouseholdConfig | null = null;

  @state() private _data: Partial<HouseholdForm> = { fuse_a: 20 };
  @state() private _error = "";
  @state() private _saving = false;

  protected willUpdate(changed: Map<string, unknown>) {
    if (changed.has("household") && this.household) {
      const { household_id, ...form } = this.household;
      this._data = form;
    }
  }

  private get _valid(): boolean {
    const d = this._data;
    return !!(d.name?.trim() && d.fuse_a && d.l1_entity && d.l2_entity && d.l3_entity);
  }

  protected render() {
    return html`
      <ha-card .header=${this.household ? `Edit ${this.household.name}` : "New household"}>
        <div class="card-content">
          <p class="description">
            The main fuse rating applies to all three phases. Pick the sensors that report the
            total current per phase for the household, for example from a power meter reader.
          </p>
          <ha-form
            .hass=${this.hass}
            .data=${this._data}
            .schema=${SCHEMA}
            .computeLabel=${(s: HaFormSchema) => LABELS[s.name] ?? s.name}
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
    try {
      await this.hass.callWS({
        type: "generic_charge_controller/households/save",
        ...(this.household ? { household_id: this.household.household_id } : {}),
        config: this._data,
      });
      this.dispatchEvent(new CustomEvent("household-saved", { bubbles: true, composed: true }));
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
