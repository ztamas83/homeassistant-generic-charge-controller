import { LitElement, html, css } from "lit";
import { customElement, property } from "lit/decorators.js";
import { HomeAssistant, HouseholdConfig } from "../types";

const PHASES = ["l1", "l2", "l3"] as const;

@customElement("cc-household-card")
export class CcHouseholdCard extends LitElement {
  @property({ attribute: false }) public hass!: HomeAssistant;
  @property({ attribute: false }) public household!: HouseholdConfig;

  private _phaseValue(entityId: string) {
    const state = this.hass.states[entityId];
    if (!state || state.state === "unavailable" || state.state === "unknown") {
      return html`<span class="unavailable">unavailable</span>`;
    }
    const unit = (state.attributes.unit_of_measurement as string) ?? "";
    return html`${state.state} ${unit}`;
  }

  protected render() {
    const h = this.household;
    return html`
      <ha-card .header=${h.name}>
        <div class="card-content">
          <div class="row">
            <span class="label">Main fuse:</span>
            <span class="value">${h.fuse_a} A</span>
          </div>
          ${PHASES.map((p) => {
            const entityId = h[`${p}_entity`];
            return html`
              <div class="row">
                <span class="label" title=${entityId}>${p.toUpperCase()}:</span>
                <span class="value">${this._phaseValue(entityId)}</span>
              </div>
            `;
          })}
        </div>
        <div class="card-actions">
          <ha-button variant="danger" appearance="plain" @click=${this._delete}>Delete</ha-button>
          <ha-button @click=${this._edit}>Edit</ha-button>
        </div>
      </ha-card>
    `;
  }

  private _fire(type: string) {
    this.dispatchEvent(
      new CustomEvent(type, {
        detail: { householdId: this.household.household_id },
        bubbles: true,
        composed: true,
      })
    );
  }

  private _edit() {
    this._fire("household-edit");
  }

  private _delete() {
    this._fire("household-delete");
  }

  static styles = css`
    ha-card {
      height: 100%;
      display: flex;
      flex-direction: column;
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

    .unavailable {
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
