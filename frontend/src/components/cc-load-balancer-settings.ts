import { LitElement, html, css, nothing } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import {
  ChargerConfig,
  ChargerPhase,
  HomeAssistant,
  HouseholdConfig,
  HouseholdPhase,
} from "../types";
import type { HaFormSchema } from "../types/ha-elements";

const HOUSEHOLD_PHASES: HouseholdPhase[] = ["L1", "L2", "L3"];
const CHARGER_PHASE_OPTIONS = [
  { value: "P1", label: "Charger phase 1" },
  { value: "P2", label: "Charger phase 2" },
  { value: "P3", label: "Charger phase 3" },
];

interface SettingsForm {
  household_id?: string;
  L1: ChargerPhase;
  L2: ChargerPhase;
  L3: ChargerPhase;
}

@customElement("cc-load-balancer-settings")
export class CcLoadBalancerSettings extends LitElement {
  @property({ attribute: false }) public hass!: HomeAssistant;
  @property() public chargerId = "";
  @property({ attribute: false }) public households: Record<string, HouseholdConfig> = {};
  /** Stored configuration of this charger, if any. */
  @property({ attribute: false }) public config: ChargerConfig | null = null;

  @state() private _data: SettingsForm = { L1: "P1", L2: "P2", L3: "P3" };
  @state() private _error = "";
  @state() private _saving = false;
  /** Collapsed when the charger is configured, expanded when it still needs configuring. */
  @state() private _expanded: boolean | null = null;

  protected willUpdate(changed: Map<string, unknown>) {
    if (changed.has("config") && this.config) {
      this._data = { household_id: this.config.household_id, ...this.config.phase_map };
    }
    if (this._expanded === null) {
      this._expanded = !this.config;
    }
  }

  private _summary() {
    if (!this.config) {
      return "Not configured";
    }
    const household = this.households[this.config.household_id]?.name ?? "Unknown household";
    const mapping = HOUSEHOLD_PHASES.map((p) => `${p}→${this.config!.phase_map[p]}`).join(", ");
    return `${household} · ${mapping}`;
  }

  private _renderHeader() {
    return html`
      <button
        class="header"
        aria-expanded=${this._expanded ? "true" : "false"}
        @click=${() => (this._expanded = !this._expanded)}
      >
        <span class="header-text">
          <span class="title">Load balancing configuration</span>
          ${this._expanded ? nothing : html`<span class="summary">${this._summary()}</span>`}
        </span>
        <span class="chevron ${this._expanded ? "open" : ""}" aria-hidden="true">▾</span>
      </button>
    `;
  }

  private get _schema(): HaFormSchema[] {
    return [
      {
        name: "household_id",
        required: true,
        selector: {
          select: {
            mode: "dropdown",
            options: Object.values(this.households).map((h) => ({
              value: h.household_id,
              label: h.name,
            })),
          },
        },
      },
      ...HOUSEHOLD_PHASES.map((p) => ({
        name: p,
        required: true,
        selector: { select: { mode: "dropdown", options: CHARGER_PHASE_OPTIONS } },
      })),
    ];
  }

  private get _phaseMapValid(): boolean {
    return new Set(HOUSEHOLD_PHASES.map((p) => this._data[p])).size === 3;
  }

  protected render() {
    if (Object.keys(this.households).length === 0) {
      return html`
        <ha-card header="Load balancing configuration">
          <div class="card-content">
            <p class="warning-text">
              No households are configured. Add a household in the "Households" tab before
              configuring load balancing for this charger.
            </p>
          </div>
        </ha-card>
      `;
    }

    const valid = !!this._data.household_id && this._phaseMapValid;

    if (!this._expanded) {
      return html`<ha-card>${this._renderHeader()}</ha-card>`;
    }

    return html`
      <ha-card>
        ${this._renderHeader()}
        <div class="card-content">
          <p class="description">
            Select the household this charger is connected to, and which charger phase each
            household phase is wired to.
          </p>
          <ha-form
            .hass=${this.hass}
            .data=${this._data}
            .schema=${this._schema}
            .computeLabel=${(s: HaFormSchema) =>
              s.name === "household_id" ? "Household" : `Household ${s.name}`}
            @value-changed=${(e: CustomEvent) => (this._data = e.detail.value)}
          ></ha-form>
          ${this._phaseMapValid
            ? nothing
            : html`<p class="error">Each charger phase can only be selected once.</p>`}
          ${this._error ? html`<p class="error">${this._error}</p>` : nothing}
        </div>
        <div class="card-actions">
          ${this.config
            ? html`<ha-button variant="danger" appearance="plain" @click=${this._remove}>
                Remove configuration
              </ha-button>`
            : nothing}
          <ha-button .disabled=${!valid || this._saving} @click=${this._save}>Save</ha-button>
        </div>
      </ha-card>
    `;
  }

  private async _call(msg: Record<string, unknown>): Promise<boolean> {
    this._saving = true;
    this._error = "";
    try {
      await this.hass.callWS(msg);
      this.dispatchEvent(new CustomEvent("config-saved", { bubbles: true, composed: true }));
      return true;
    } catch (err: any) {
      this._error = err?.message ?? String(err);
      return false;
    } finally {
      this._saving = false;
    }
  }

  private async _save() {
    const { household_id, L1, L2, L3 } = this._data;
    const saved = await this._call({
      type: "generic_charge_controller/chargers/save",
      charger_id: this.chargerId,
      config: { type: "easee", household_id, phase_map: { L1, L2, L3 } },
    });
    if (saved) {
      this._expanded = false;
    }
  }

  private _remove() {
    return this._call({
      type: "generic_charge_controller/chargers/delete",
      charger_id: this.chargerId,
    });
  }

  static styles = css`
    .header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
      width: 100%;
      padding: 16px;
      border: none;
      background: none;
      color: var(--primary-text-color);
      font: inherit;
      text-align: left;
      cursor: pointer;
    }

    .header-text {
      display: flex;
      flex-direction: column;
      gap: 2px;
      min-width: 0;
    }

    .title {
      font-size: var(--ha-card-header-font-size, 20px);
    }

    .summary {
      color: var(--secondary-text-color);
      font-size: 14px;
    }

    .chevron {
      color: var(--secondary-text-color);
      font-size: 20px;
      transition: transform 0.2s;
      transform: rotate(-90deg);
    }

    .chevron.open {
      transform: none;
    }

    .description {
      color: var(--secondary-text-color);
      margin-top: 0;
    }

    .warning-text,
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
