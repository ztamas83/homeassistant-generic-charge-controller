import { LitElement, html, css } from "lit";
import { customElement, property } from "lit/decorators.js";

@customElement("cc-household-card")
export class CcHouseholdCard extends LitElement {
  @property() public deviceId = "";
  @property() public name = "";
  @property({ type: Boolean }) public enabled = false;

  protected render() {
    return html`
      <ha-card .header=${this.name}>
        <div class="card-content">
          ${this.enabled
            ? html`<p>Monitoring enabled for this household.</p>`
            : html`<p>Tibber Pulse device detected. Enable it to start monitoring household load.</p>`
          }
        </div>
        <div class="card-actions">
          ${this.enabled
            ? html`<ha-button @click=${this._remove} class="warning">Remove</ha-button>`
            : html`<ha-button @click=${this._enable}>Enable</ha-button>`
          }
        </div>
      </ha-card>
    `;
  }

  private _enable() {
    this.dispatchEvent(
      new CustomEvent("household-enabled", {
        detail: { deviceId: this.deviceId },
        bubbles: true,
        composed: true,
      })
    );
  }

  private _remove() {
    this.dispatchEvent(
      new CustomEvent("household-removed", {
        detail: { deviceId: this.deviceId },
        bubbles: true,
        composed: true,
      })
    );
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

    .card-actions {
      display: flex;
      justify-content: flex-end;
      padding: 8px;
      border-top: 1px solid var(--divider-color);
    }

    .warning {
      --mdc-theme-primary: var(--error-color);
    }
  `;
}
