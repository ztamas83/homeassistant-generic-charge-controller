import { LitElement, html, css, nothing } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import {
  ChargerConfig,
  ChargerEntityKey,
  ControllerSettings,
  DiscoveredCharger,
  HomeAssistant,
  HouseholdConfig,
  HouseholdPhase,
} from "../types";

const PHASES: HouseholdPhase[] = ["L1", "L2", "L3"];

const MODE_TEXT: Record<string, string> = {
  idle: "Idle (not charging)",
  charging: "Charging, not limited",
  limited: "Charging, limited to protect the main fuse",
  failsafe: "Failsafe: household load unknown, charging paused",
};

/**
 * Live load balancing status of a charger: loads, targets, mode and the switch
 * that enables sending limits to the charger.
 */
@customElement("cc-charger-status")
export class CcChargerStatus extends LitElement {
  @property({ attribute: false }) public hass!: HomeAssistant;
  @property({ attribute: false }) public config!: ChargerConfig;
  @property({ attribute: false }) public household: HouseholdConfig | null = null;
  @property({ attribute: false }) public chargerEntities: Partial<Record<ChargerEntityKey, string>> = {};
  @property({ attribute: false }) public householdEntities: Partial<Record<HouseholdPhase, string>> = {};
  @property({ attribute: false }) public discovered: DiscoveredCharger | null = null;
  @property({ attribute: false }) public settings: ControllerSettings | null = null;

  @state() private _busy = false;
  @state() private _error = "";

  private _state(entityId: string | undefined) {
    return entityId ? this.hass.states[entityId] : undefined;
  }

  private _amps(entityId: string | undefined, decimals: number) {
    const value = parseFloat(this._state(entityId)?.state as string);
    return Number.isFinite(value) ? `${value.toFixed(decimals)} A` : "–";
  }

  protected render() {
    const switchState = this._state(this.chargerEntities.control_switch)?.state;
    const active = switchState === "on";
    const modeState = this._state(this.chargerEntities.mode);
    const mode = modeState?.state;
    const attrs = (modeState?.attributes ?? {}) as Record<string, any>;
    const reasons: string[] = attrs.reasons ?? [];
    const lastSent: Record<string, number> | null = attrs.last_sent ?? null;
    const lastSentAt: string | null = attrs.last_sent_at ?? null;
    const currentsMissing =
      this.discovered !== null && !this.discovered.entities.circuit_current;

    return html`
      <ha-card header="Load balancing status">
        <div class="card-content">
          <div class="control ${active ? "on" : ""}">
            <div>
              <div class="control-title">
                Sending limits to the charger: <strong>${active ? "On" : "Off"}</strong>
              </div>
              <div class="secondary">
                ${active
                  ? "Calculated limits are sent while a car is connected."
                  : "Limits are calculated and shown, but not sent to the charger."}
              </div>
            </div>
            <ha-button
              .disabled=${this._busy || !this.chargerEntities.control_switch}
              @click=${() => this._setActive(!active)}
            >
              ${active ? "Stop" : "Start"}
            </ha-button>
          </div>
          ${this._error ? html`<p class="error">${this._error}</p>` : nothing}

          <div class="mode ${mode ?? ""}">${mode ? MODE_TEXT[mode] ?? mode : "Mode unknown"}</div>
          ${reasons.length
            ? html`<ul class="reasons">${reasons.map((r) => html`<li>${r}</li>`)}</ul>`
            : nothing}

          <table>
            <thead>
              <tr>
                <th>Phase</th>
                <th class="num">Household</th>
                <th class="num">Charger</th>
                <th class="num">Target</th>
              </tr>
            </thead>
            <tbody>
              ${PHASES.map((phase) => {
                const chargerPhase = this.config.phase_map[phase];
                return html`
                  <tr>
                    <td>${phase} <span class="secondary">→ ${chargerPhase}</span></td>
                    <td class="num">${this._amps(this.householdEntities[phase], 1)}</td>
                    <td class="num">
                      ${this._amps(this.chargerEntities[`charger_current_${chargerPhase}`], 1)}
                    </td>
                    <td class="num strong">
                      ${this._amps(this.chargerEntities[`target_current_${chargerPhase}`], 0)}
                    </td>
                  </tr>
                `;
              })}
            </tbody>
          </table>

          <div class="facts secondary">
            ${this.household
              ? html`<span>Main fuse ${this.household.fuse_a} A</span>`
              : nothing}
            ${this.settings
              ? html`<span>Safety margin ${this.settings.safety_margin_a} A</span>
                  <span>Charger update every ${this.settings.charger_update_interval_s} s</span>`
              : nothing}
            ${lastSent
              ? html`<span>
                  Last sent ${["P1", "P2", "P3"].map((p) => lastSent[p]).join(" / ")} A
                  ${lastSentAt ? html`at ${new Date(lastSentAt).toLocaleTimeString(this.hass.language)}` : nothing}
                </span>`
              : nothing}
          </div>

          ${currentsMissing
            ? html`<p class="hint">
                Charger phase currents are not available${this.discovered?.disabled_entities.includes(
                  "circuit_current"
                )
                  ? html`: the Easee entity <strong>Circuit current</strong> is disabled. Enable it
                      in Home Assistant (Settings → Entities)`
                  : nothing}.
                Until then the whole household load counts as other load, so targets are lower
                while charging.
              </p>`
            : nothing}
        </div>
      </ha-card>
    `;
  }

  private async _setActive(active: boolean) {
    if (
      active &&
      !confirm("Start sending load balancing limits to the charger?")
    ) {
      return;
    }
    this._busy = true;
    this._error = "";
    try {
      await this.hass.callService("switch", active ? "turn_on" : "turn_off", {
        entity_id: this.chargerEntities.control_switch,
      });
    } catch (err: any) {
      this._error = err?.message ?? String(err);
    } finally {
      this._busy = false;
    }
  }

  static styles = css`
    .control {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 16px;
      padding: 12px;
      border-radius: 8px;
      border: 1px solid var(--divider-color);
      margin-bottom: 16px;
    }

    .control.on {
      border-color: var(--success-color, #4caf50);
    }

    .control-title {
      margin-bottom: 2px;
    }

    .secondary {
      color: var(--secondary-text-color);
      font-size: 13px;
    }

    .mode {
      font-weight: 500;
    }

    .mode.limited {
      color: var(--warning-color, #ff9800);
    }

    .mode.failsafe {
      color: var(--error-color);
    }

    .reasons {
      margin: 4px 0 0;
      padding-left: 20px;
      color: var(--secondary-text-color);
      font-size: 13px;
    }

    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 16px;
    }

    th,
    td {
      text-align: left;
      padding: 6px 8px;
      border-bottom: 1px solid var(--divider-color);
    }

    th {
      color: var(--secondary-text-color);
      font-weight: 500;
      font-size: 13px;
    }

    .num {
      text-align: right;
      font-variant-numeric: tabular-nums;
    }

    .strong {
      font-weight: 600;
    }

    .facts {
      display: flex;
      flex-wrap: wrap;
      gap: 4px 16px;
      margin-top: 12px;
    }

    .hint {
      margin-bottom: 0;
      padding: 8px 12px;
      border-radius: 6px;
      background: rgba(255, 152, 0, 0.12);
      font-size: 13px;
    }

    .error {
      color: var(--error-color);
    }
  `;
}
