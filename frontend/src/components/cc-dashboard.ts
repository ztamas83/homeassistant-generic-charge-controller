import { LitElement, html, svg, css, nothing } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import {
  ChargerConfig,
  ControllerEntities,
  EV_STATUS_TEXT,
  EvConfig,
  EvPlanInfo,
  HouseholdConfig,
  PlanBlock,
  PriceSlot,
} from "../types";
import { ChargerData } from "../utils/charger/charger-data";

const WS = "generic_charge_controller";
const REFRESH_MS = 60_000;
const HOUR_MS = 3_600_000;
const WINDOW_H = 30;
const PHASES = ["l1", "l2", "l3"] as const;
const WARN_PCT = 80;

interface PlanEntry {
  info?: EvPlanInfo;
  error?: string;
}

/** Landing overview: one card per EV, grouped by household. */
@customElement("cc-dashboard")
export class CcDashboard extends LitElement {
  @property({ attribute: false }) public hass!: any;
  @property({ attribute: false }) public households: Record<string, HouseholdConfig> = {};
  @property({ attribute: false }) public chargerConfigs: Record<string, ChargerConfig> = {};
  @property({ attribute: false }) public chargers: ChargerData[] = [];
  @property({ attribute: false }) public entities: ControllerEntities = {
    households: {},
    chargers: {},
  };
  @property({ attribute: false }) public evs: Record<string, EvConfig> = {};

  @state() private _plans: Record<string, PlanEntry> = {};

  private _timer?: number;
  private _signatures: Record<string, string> = {};

  connectedCallback() {
    super.connectedCallback();
    this._fetchAll();
    this._timer = window.setInterval(() => this._fetchAll(), REFRESH_MS);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    window.clearInterval(this._timer);
  }

  protected updated() {
    // Refetch an EV's plan when its status or charge_now state changes (or it is new)
    for (const evId of Object.keys(this.evs)) {
      const sig = this._signature(evId);
      if (this._signatures[evId] !== sig) {
        const first = this._signatures[evId] === undefined;
        this._signatures[evId] = sig;
        if (!first) this._fetchPlan(evId);
        else if (!this._plans[evId]) this._fetchPlan(evId);
      }
    }
  }

  private _signature(evId: string): string {
    const e = this.entities.evs?.[evId] ?? {};
    const s = (id?: string) => (id ? (this.hass?.states[id]?.state ?? "") : "");
    return `${s(e.status)}|${s(e.charge_now)}|${s(e.smart_charging)}`;
  }

  private _fetchAll() {
    for (const evId of Object.keys(this.evs)) this._fetchPlan(evId);
  }

  private async _fetchPlan(evId: string) {
    if (!this.hass) return;
    try {
      const info = await this.hass.callWS({ type: `${WS}/evs/plan`, ev_id: evId });
      this._plans = { ...this._plans, [evId]: { info } };
    } catch (err: any) {
      this._plans = {
        ...this._plans,
        [evId]: { error: err?.code === "not_loaded" ? "not loaded" : (err?.message ?? "error") },
      };
    }
  }

  // ---- helpers ----

  private _state(entityId?: string): string | null {
    const s = entityId ? this.hass.states[entityId]?.state : undefined;
    return s === undefined || s === "unknown" || s === "unavailable" ? null : s;
  }

  private _evStatus(ev: EvConfig): string | null {
    return (
      this._state(this.entities.evs?.[ev.ev_id]?.status) ??
      this._plans[ev.ev_id]?.info?.status ??
      null
    );
  }

  private _nextBlock(info?: EvPlanInfo): PlanBlock | null {
    const now = Date.now();
    const blocks = (info?.plan?.blocks ?? [])
      .filter((b) => Date.parse(b.end) > now)
      .sort((a, b) => Date.parse(a.start) - Date.parse(b.start));
    return blocks[0] ?? null;
  }

  private _fmtHm(t: number | string) {
    return new Intl.DateTimeFormat(this.hass.language, {
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(t));
  }

  private _fmtCost(v: number, currency: string | null) {
    return `${v.toFixed(2)}${currency ? ` ${currency}` : ""}`;
  }

  private _fire(type: string, detail: Record<string, unknown> = {}) {
    this.dispatchEvent(new CustomEvent(type, { detail, bubbles: true, composed: true }));
  }

  private _evHousehold(ev: EvConfig): string | null {
    const id = this.chargerConfigs[ev.charger_id]?.household_id;
    return id && this.households[id] ? id : null;
  }

  private _toggle(entityId: string, on: boolean) {
    this.hass.callService("switch", on ? "turn_off" : "turn_on", { entity_id: entityId });
  }

  // ---- household ----

  private _renderLoadChips(h: HouseholdConfig) {
    return PHASES.map((p) => {
      const v = parseFloat(this.hass.states[h[`${p}_entity`]]?.state);
      const ok = Number.isFinite(v);
      const pct = ok && h.fuse_a > 0 ? (Math.abs(v) / h.fuse_a) * 100 : 0;
      const cls = !ok ? "" : pct > 100 ? "critical" : pct > WARN_PCT ? "warning" : "ok";
      return html`<span class="chip ${cls}" title="${p.toUpperCase()} of ${h.fuse_a} A fuse"
        >${p.toUpperCase()} ${ok ? `${v.toFixed(1)} A` : "n/a"}</span
      >`;
    });
  }

  private _renderGroup(title: unknown, chips: unknown, evs: EvConfig[]) {
    return html`
      <section class="group">
        <header class="group-head">
          <div class="group-title">${title}</div>
          <div class="chips">${chips}</div>
        </header>
        ${evs.length === 0
          ? html`<p class="empty">No EVs assigned.</p>`
          : html`<div class="grid">${evs.map((ev) => this._renderEv(ev))}</div>`}
      </section>
    `;
  }

  // ---- EV card ----

  private _renderToggle(label: string, icon: string, entityId: string | undefined) {
    if (!entityId) return nothing;
    const on = this._state(entityId) === "on";
    return html`
      <button
        class="tbtn ${on ? "active" : ""}"
        aria-pressed=${on}
        @click=${(e: Event) => {
          e.stopPropagation();
          this._toggle(entityId, on);
        }}
      >
        <ha-icon icon=${icon}></ha-icon>${label}
      </button>
    `;
  }

  private _renderAction(label: string, icon: string, entityId: string | undefined) {
    if (!entityId) return nothing;
    return html`
      <button
        class="tbtn"
        @click=${(e: Event) => {
          e.stopPropagation();
          this.hass.callService("button", "press", { entity_id: entityId });
        }}
      >
        <ha-icon icon=${icon}></ha-icon>${label}
      </button>
    `;
  }

  private _renderEv(ev: EvConfig) {
    const entry = this._plans[ev.ev_id];
    const info = entry?.info;
    const status = this._evStatus(ev);
    const ents = this.entities.evs?.[ev.ev_id] ?? {};
    const num = (id: string | undefined, d = 0) => {
      const v = parseFloat(this._state(id) ?? "");
      return Number.isFinite(v) ? v.toFixed(d) : "–";
    };
    const socNum = num(ents.current_soc);
    const soc = socNum !== "–" ? socNum : info?.soc != null ? info.soc.toFixed(0) : "–";
    const target = info?.target_soc != null ? info.target_soc.toFixed(0) : num(ents.target_soc);
    const energy =
      info?.energy_needed_kwh != null ? info.energy_needed_kwh.toFixed(1) : num(ents.energy_needed, 1);
    const power =
      info?.estimate?.power_kw != null ? info.estimate.power_kw.toFixed(1) : num(ents.estimated_power, 1);
    const next = this._nextBlock(info);
    const charger = this.chargers.find((c) => c.id === ev.charger_id);
    return html`
      <ha-card class="ev ${status === "charging" ? "charging" : ""}">
        ${info ? this._renderTimeline(info, ev.ev_id) : nothing}
        <div class="accent"></div>
        <div class="content" @click=${() => this._fire("ev-selected", { evId: ev.ev_id })}>
          <div class="ev-head">
            <div class="ev-name">${ev.name}</div>
            <div class="ev-sub">
              ${status ? (EV_STATUS_TEXT[status] ?? status) : "–"}${charger ? ` · ${charger.name}` : ""}
            </div>
          </div>
          <div class="soc-row">
            <span class="soc">${soc}<span class="unit">%</span></span>
            <span class="target">→ ${target} %</span>
          </div>
          <div class="facts">
            <span>${energy} kWh</span>
            <span>~${power} kW</span>
            ${info?.plan
              ? html`<span class="strong">${this._fmtCost(info.plan.cost, info.currency)}</span>`
              : nothing}
            ${next ? html`<span>${this._fmtHm(next.start)} - ${this._fmtHm(next.end)}</span>` : nothing}
          </div>
          ${entry?.error && !info ? html`<div class="warn">Plan unavailable</div>` : nothing}
          ${info?.plan?.insufficient_time
            ? html`<div class="warn">Not enough time to reach target</div>`
            : nothing}
          <div class="toggles">
            ${this._renderToggle("Smart charging", "mdi:brain", ents.smart_charging)}
            ${this._renderAction("Charge now", "mdi:flash", ents.start_charging)}
          </div>
        </div>
      </ha-card>
    `;
  }

  /** Card background chart: price step area and planned bands over the next WINDOW_H hours. */
  private _renderTimeline(info: EvPlanInfo, evId: string) {
    const blocks = info.plan?.blocks ?? [];
    const prices: PriceSlot[] = info.prices ?? [];
    if (blocks.length === 0 && prices.length === 0) return nothing;
    const t0 = Date.now();
    const t1 = t0 + WINDOW_H * HOUR_MS;
    const W = 1000;
    const H = 100;
    const x = (t: number) => ((Math.min(Math.max(t, t0), t1) - t0) / (t1 - t0)) * W;
    const slots = prices
      .map((p) => ({ s: Date.parse(p.start), e: Date.parse(p.end), v: p.price }))
      .filter((p) => p.e > t0 && p.s < t1)
      .sort((a, b) => a.s - b.s);
    const vals = slots.map((s) => s.v);
    const lo = Math.min(0, ...vals);
    const hi = Math.max(lo + 0.01, ...vals);
    const y = (v: number) => 8 + (1 - (v - lo) / (hi - lo)) * (H - 8);
    let line = "";
    let area = "";
    let prevEnd = -1;
    let runStart = 0;
    let runEnd = 0;
    const closeRun = () => {
      if (prevEnd >= 0) area += `L${runEnd} ${H}L${runStart} ${H}Z`;
    };
    for (const s of slots) {
      const xs = x(s.s);
      const xe = x(s.e);
      if (s.s === prevEnd) {
        line += `L${xs} ${y(s.v)}`;
        area += `L${xs} ${y(s.v)}`;
      } else {
        closeRun();
        line += `M${xs} ${y(s.v)}`;
        area += `M${xs} ${H}L${xs} ${y(s.v)}`;
        runStart = xs;
      }
      line += `L${xe} ${y(s.v)}`;
      area += `L${xe} ${y(s.v)}`;
      runEnd = xe;
      prevEnd = s.e;
    }
    closeRun();
    const gid = `pg-${evId}`;
    return html`
      <svg class="bg" viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" aria-hidden="true">
        ${svg`<defs>
          <linearGradient id=${gid} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stop-color="var(--secondary-text-color)" stop-opacity="0.22"></stop>
            <stop offset="1" stop-color="var(--secondary-text-color)" stop-opacity="0"></stop>
          </linearGradient>
        </defs>`}
        ${blocks
          .filter((b) => Date.parse(b.end) > t0 && Date.parse(b.start) < t1)
          .map(
            (b) =>
              svg`<rect class="band" x=${x(Date.parse(b.start))} y="0"
                width=${Math.max(2, x(Date.parse(b.end)) - x(Date.parse(b.start)))} height=${H}></rect>`,
          )}
        ${area ? svg`<path d=${area} fill="url(#${gid})"></path>` : nothing}
        ${line ? svg`<path class="price" d=${line} fill="none"></path>` : nothing}
      </svg>
    `;
  }

  protected render() {
    const hasHouseholds = Object.keys(this.households).length > 0;
    const hasEvs = Object.keys(this.evs).length > 0;
    const evs = Object.values(this.evs);
    const unlinked = evs.filter((ev) => !this._evHousehold(ev));
    return html`
      ${!hasHouseholds || !hasEvs
        ? html`<div class="hint">
            ${!hasHouseholds
              ? html`<div class="hint-row">
                  <span>No household configured yet.</span>
                  <ha-button @click=${() => this._fire("goto-tab", { tab: "households" })}
                    >Add household</ha-button
                  >
                </div>`
              : nothing}
            ${!hasEvs
              ? html`<div class="hint-row">
                  <span>No EV configured yet.</span>
                  <ha-button @click=${() => this._fire("goto-tab", { tab: "evs" })}>Add EV</ha-button>
                </div>`
              : nothing}
          </div>`
        : nothing}
      ${Object.values(this.households).map((h) =>
        this._renderGroup(
          h.name,
          html`${this._renderLoadChips(h)}<span class="chip">Fuse ${h.fuse_a} A</span>${h.price_area
              ? html`<span class="chip">${h.price_area}</span>`
              : nothing}`,
          evs.filter((ev) => this._evHousehold(ev) === h.household_id),
        ),
      )}
      ${unlinked.length > 0 ? this._renderGroup("Unlinked EVs", nothing, unlinked) : nothing}
    `;
  }

  static styles = css`
    :host {
      display: block;
    }
    .hint {
      border: 1px dashed var(--divider-color);
      border-radius: 8px;
      padding: 8px 12px;
      margin-bottom: 16px;
    }
    .hint-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
      flex-wrap: wrap;
      color: var(--secondary-text-color);
    }
    .group {
      margin-bottom: 24px;
    }
    .group-head {
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 8px;
      margin-bottom: 12px;
    }
    .group-title {
      font-size: 18px;
      font-weight: 500;
    }
    .chips {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
    }
    .chip {
      font-size: 12px;
      padding: 3px 10px;
      border-radius: 12px;
      background: var(--secondary-background-color);
      color: var(--secondary-text-color);
      font-variant-numeric: tabular-nums;
    }
    .chip.ok {
      color: var(--success-color, #4caf50);
    }
    .chip.warning {
      background: var(--warning-color, #ff9800);
      color: #fff;
    }
    .chip.critical {
      background: var(--error-color, #db4437);
      color: #fff;
    }
    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
      gap: 16px;
    }
    @media (max-width: 400px) {
      .grid {
        grid-template-columns: 1fr;
      }
    }
    ha-card.ev {
      position: relative;
      overflow: hidden;
      height: 100%;
      box-sizing: border-box;
    }
    .accent {
      position: absolute;
      inset: 0 auto 0 0;
      width: 4px;
      background: var(--disabled-text-color, #bdbdbd);
    }
    .ev.charging .accent {
      background: var(--success-color, #4caf50);
    }
    .content {
      position: relative;
      z-index: 1;
      padding: 16px 16px 12px 20px;
      cursor: pointer;
    }
    .ev-name {
      font-size: 16px;
      font-weight: 500;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .ev-sub {
      font-size: 13px;
      color: var(--secondary-text-color);
      margin-top: 2px;
    }
    .soc-row {
      display: flex;
      align-items: flex-end;
      gap: 12px;
      margin-top: 12px;
    }
    .soc {
      font-size: 40px;
      font-weight: 300;
      line-height: 1;
      font-variant-numeric: tabular-nums;
    }
    .unit {
      font-size: 18px;
      color: var(--secondary-text-color);
      margin-left: 2px;
    }
    .target {
      font-size: 14px;
      color: var(--secondary-text-color);
      padding-bottom: 3px;
    }
    .facts {
      display: flex;
      flex-wrap: wrap;
      gap: 4px 14px;
      margin-top: 10px;
      font-size: 13px;
      color: var(--secondary-text-color);
    }
    .facts .strong {
      color: var(--primary-text-color);
      font-weight: 500;
    }
    .warn {
      margin-top: 6px;
      font-size: 13px;
      color: var(--warning-color, #ff9800);
    }
    .empty {
      color: var(--secondary-text-color);
      margin: 0;
    }
    .toggles {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin-top: 12px;
    }
    .tbtn {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      font: inherit;
      font-size: 13px;
      padding: 6px 12px;
      border-radius: 16px;
      cursor: pointer;
      color: var(--primary-text-color);
      background: transparent;
      border: 1px solid var(--divider-color);
    }
    .tbtn ha-icon {
      --mdc-icon-size: 16px;
    }
    .tbtn.active {
      background: var(--primary-color);
      border-color: var(--primary-color);
      color: var(--text-primary-color, #fff);
    }
    svg.bg {
      position: absolute;
      left: 0;
      bottom: 0;
      width: 100%;
      height: 70%;
      z-index: 0;
      pointer-events: none;
    }
    svg.bg .band {
      fill: var(--primary-color);
      opacity: 0.16;
    }
    svg.bg .price {
      stroke: var(--secondary-text-color);
      stroke-width: 1.25;
      stroke-opacity: 0.45;
      vector-effect: non-scaling-stroke;
    }
  `;
}
