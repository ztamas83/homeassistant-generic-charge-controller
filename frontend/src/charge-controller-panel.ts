import { LitElement, html, css } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { loadHaElements } from "./load-ha-elements";
import "./components/cc-charger-card";

@customElement("charge-controller-panel")
export class ChargeControllerPanel extends LitElement {
  @property({ attribute: false }) public hass!: any;
  @property({ type: Boolean, reflect: true }) public narrow = false;
  @property({ type: Object }) public route: { path: string } = { path: "" };
  @property({ type: Object }) public panel: Record<string, unknown> = {};

  @state() private _elementsLoaded = false;

  protected firstUpdated() {
    this._loadElements();
  }

  private async _loadElements() {
    await loadHaElements();
    this._elementsLoaded = true;
  }

  protected render() {
    if (!this._elementsLoaded) {
      return html`<div class="loading">Loading...</div>`;
    }

    return html`
      <div class="toolbar">
        <div class="title">Charge Controller</div>
      </div>
      <div class="content">
        <div class="grid">
          <cc-charger-card
            .name=${"Main Garage Charger"}
            .status=${"Charging"}
            .currentLimit=${16}
            .currentUsage=${12.5}
          ></cc-charger-card>
          
          <cc-charger-card
            .name=${"Guest Parking"}
            .status=${"Idle"}
            .currentLimit=${32}
            .currentUsage=${0}
          ></cc-charger-card>
        </div>
      </div>
    `;
  }

  static styles = css`
    :host {
      display: block;
      height: 100vh;
      background-color: var(--primary-background-color);
      color: var(--primary-text-color);
    }

    .toolbar {
      display: flex;
      align-items: center;
      height: 56px;
      padding: 0 16px;
      background-color: var(--app-header-background-color, var(--primary-background-color));
      color: var(--app-header-text-color, var(--primary-text-color));
      border-bottom: 1px solid var(--divider-color);
      font-size: 20px;
    }

    .content {
      padding: 16px;
      height: calc(100vh - 56px - 32px);
      overflow-y: auto;
    }

    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 16px;
    }

    .loading {
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100vh;
    }
  `;
}
