import { LitElement, html, css, nothing } from "lit";
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

interface PlanEntry {
  info?: EvPlanInfo;
  error?: string;
}

const MODE_TEXT: Record<string, string> = {
  scheduled_pause: "Paused (schedule)",
};

/** Landing overview: household -> charger -> EV tree with plans and costs. */
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
    return `${s(e.status)}|${s(e.charge_now)}`;
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

  private _fmtTime(t: number | string) {
    return new Intl.DateTimeFormat(this.hass.language, {
      weekday: "short",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(t));
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

  private _householdOf(c: ChargerData): string | null {
    const id = this.chargerConfigs[c.id]?.household_id;
    return id && this.households[id] ? id : null;
  }

  // ---- summary ----

  private _renderSummary() {
    const households = Object.keys(this.households).length;
    const chargerIds = this.chargers.map((c) => c.id);
    const active = chargerIds.filter(
      (id) => this._state(this.entities.chargers[id]?.control_switch) === "on",
    ).length;
    const evs = Object.values(this.evs);
    const charging = evs.filter((ev) => this._evStatus(ev) === "charging").length;
    const planned = evs.filter((ev) => this._evStatus(ev) === "planned").length;

    const costs: Record<string, number> = {};
    let nextStart: number | null = null;
    const now = Date.now();
    for (const ev of evs) {
      const info = this._plans[ev.ev_id]?.info;
      if (!info?.plan) continue;
      const cur = info.currency ?? "";
      costs[cur] = (costs[cur] ?? 0) + info.plan.cost;
      for (const b of info.plan.blocks) {
        const s = Date.parse(b.start);
        if (s > now && (nextStart === null || s < nextStart)) nextStart = s;
      }
    }
    const costText = Object.keys(costs).length
      ? Object.entries(costs)
          .map(([cur, v]) => this._fmtCost(v, cur || null))
          .join(" + ")
      : "–";

    const tile = (label: string, value: unknown) => html`
      <div class="tile">
        <div class="tile-value">${value}</div>
        <div class="tile-label">${label}</div>
      </div>
    `;
    return html`
      <div class="summary">
        ${tile("Households", households)}
        ${tile("Chargers active", `${active} / ${chargerIds.length}`)}
        ${tile("EVs charging / planned", `${charging} / ${planned}`)}
        ${tile("Planned cost", costText)}
        ${tile("Next charge start", nextStart ? this._fmtTime(nextStart) : "–")}
      </div>
    `;
  }

  // ---- household ----

  private _renderLoad(h: HouseholdConfig) {
    return html`
      <div class="loads">
        ${PHASES.map((p) => {
          const st = this.hass.states[h[`${p}_entity`]];
          const v = parseFloat(st?.state);
          const ok = Number.isFinite(v);
          const pct = ok && h.fuse_a > 0 ? Math.min(100, (Math.abs(v) / h.fuse_a) * 100) : 0;
          const over = ok && Math.abs(v) > h.fuse_a;
          return html`
            <div class="load" title="${p.toUpperCase()}: ${ok ? v : "unavailable"} A of ${h.fuse_a} A">
              <span class="load-label">${p.toUpperCase()}</span>
              <div class="bar"><div class="fill ${over ? "over" : ""}" style="width:${pct}%"></div></div>
              <span class="load-value">${ok ? `${v.toFixed(1)} A` : "n/a"}</span>
            </div>
          `;
        })}
      </div>
    `;
  }

  private _renderHousehold(h: HouseholdConfig) {
    const chargers = this.chargers.filter((c) => this._householdOf(c) === h.household_id);
    return html`
      <section class="card">
        <header class="node-head">
          <div class="node-title">${h.name}</div>
          <div class="chips">
            <span class="chip">Fuse ${h.fuse_a} A</span>
            ${h.price_area ? html`<span class="chip">${h.price_area}</span>` : nothing}
          </div>
        </header>
        ${this._renderLoad(h)}
        ${chargers.length === 0
          ? html`<p class="empty">No chargers assigned.</p>`
          : html`<div class="children">${chargers.map((c) => this._renderCharger(c))}</div>`}
      </section>
    `;
  }

  // ---- charger ----

  private _renderCharger(c: ChargerData) {
    const e = this.entities.chargers[c.id];
    const mode = this._state(e?.mode);
    const control = this._state(e?.control_switch);
    const targets = [1, 2, 3].map((i) => {
      const v = parseFloat(this._state((e as any)?.[`target_current_P${i}`]) ?? "");
      return Number.isFinite(v) ? v.toFixed(0) : "–";
    });
    const evs = Object.values(this.evs).filter((ev) => ev.charger_id === c.id);
    return html`
      <div class="child">
        <div class="node clickable" @click=${() => this._fire("charger-selected", { chargerId: c.id })}>
          <div class="node-head">
            <div class="node-title">${c.name}</div>
            <div class="chips">
              ${mode ? html`<span class="chip">${MODE_TEXT[mode] ?? mode.replace(/_/g, " ")}</span>` : nothing}
              ${control !== null
                ? html`<span class="chip ${control === "on" ? "on" : "off"}"
                    >Load balancing ${control === "on" ? "on" : "off"}</span
                  >`
                : nothing}
            </div>
          </div>
          ${e?.target_current_P1
            ? html`<div class="sub">Target current: ${targets.join(" / ")} A</div>`
            : nothing}
        </div>
        ${evs.length > 0
          ? html`<div class="children">${evs.map((ev) => this._renderEv(ev))}</div>`
          : nothing}
      </div>
    `;
  }

  // ---- EV ----

  private _renderEv(ev: EvConfig) {
    const entry = this._plans[ev.ev_id];
    const info = entry?.info;
    const status = this._evStatus(ev);
    const ents = this.entities.evs?.[ev.ev_id] ?? {};
    const num = (id: string | undefined, d = 0) => {
      const v = parseFloat(this._state(id) ?? "");
      return Number.isFinite(v) ? v.toFixed(d) : "–";
    };
    const soc = info?.soc != null ? info.soc.toFixed(0) : num(ents.current_soc);
    const target = info?.target_soc != null ? info.target_soc.toFixed(0) : num(ents.target_soc);
    const energy =
      info?.energy_needed_kwh != null ? info.energy_needed_kwh.toFixed(1) : num(ents.energy_needed, 1);
    const power =
      info?.estimate?.power_kw != null ? info.estimate.power_kw.toFixed(1) : num(ents.estimated_power, 1);
    const next = this._nextBlock(info);
    return html`
      <div class="child">
        <div class="node clickable" @click=${() => this._fire("ev-selected", { evId: ev.ev_id })}>
          <div class="node-head">
            <div class="node-title">${ev.name}</div>
            <div class="chips">
              <span class="chip ${status === "charging" ? "on" : ""}"
                >${status ? (EV_STATUS_TEXT[status] ?? status) : "–"}</span
              >
            </div>
          </div>
          <div class="facts">
            <span>SOC ${soc} % → ${target} %</span>
            <span>${energy} kWh needed</span>
            <span>~${power} kW</span>
            ${info?.plan
              ? html`<span class="strong">${this._fmtCost(info.plan.cost, info.currency)}</span>`
              : nothing}
            ${next
              ? html`<span>${this._fmtTime(next.start)} - ${this._fmtHm(next.end)}</span>`
              : nothing}
          </div>
          ${entry?.error && !info ? html`<div class="sub warn">Plan unavailable</div>` : nothing}
          ${info?.plan?.insufficient_time
            ? html`<div class="sub warn">Not enough time to reach target</div>`
            : nothing}
          ${info ? this._renderTimeline(info) : nothing}
        </div>
      </div>
    `;
  }

  /** Mini timeline: price step line and planned blocks over the next WINDOW_H hours. */
  private _renderTimeline(info: EvPlanInfo) {
    const blocks = info.plan?.blocks ?? [];
    const prices: PriceSlot[] = info.prices ?? [];
    if (blocks.length === 0 && prices.length === 0) return nothing;
    const t0 = Date.now();
    const t1 = t0 + WINDOW_H * HOUR_MS;
    const W = 1000;
    const H = 40;
    const x = (t: number) => ((Math.min(Math.max(t, t0), t1) - t0) / (t1 - t0)) * W;
    const slots = prices
      .map((p) => ({ s: Date.parse(p.start), e: Date.parse(p.end), v: p.price }))
      .filter((p) => p.e > t0 && p.s < t1)
      .sort((a, b) => a.s - b.s);
    const vals = slots.map((s) => s.v);
    const lo = Math.min(0, ...vals);
    const hi = Math.max(lo + 0.01, ...vals);
    const y = (v: number) => 4 + (1 - (v - lo) / (hi - lo)) * (H - 8);
    let d = "";
    let prevEnd = -1;
    for (const s of slots) {
      d += s.s === prevEnd ? `L${x(s.s)} ${y(s.v)}` : `M${x(s.s)} ${y(s.v)}`;
      d += `L${x(s.e)} ${y(s.v)}`;
      prevEnd = s.e;
    }
    const hourTicks: number[] = [];
    const first = new Date(t0);
    first.setMinutes(0, 0, 0);
    for (let t = first.getTime() + HOUR_MS; t < t1; t += HOUR_MS) {
      if (new Date(t).getHours() % 6 === 0) hourTicks.push(t);
    }
    return html`
      <div class="timeline">
        <svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="none">
          ${hourTicks.map(
            (t) => html`<line class="tick" x1=${x(t)} x2=${x(t)} y1="0" y2=${H}></line>`,
          )}
          ${blocks
            .filter((b) => Date.parse(b.end) > t0 && Date.parse(b.start) < t1)
            .map(
              (b) =>
                html`<rect class="block" x=${x(Date.parse(b.start))} y="0"
                  width=${Math.max(2, x(Date.parse(b.end)) - x(Date.parse(b.start)))} height=${H}></rect>`,
            )}
          ${d ? html`<path class="price" d=${d} fill="none"></path>` : nothing}
        </svg>
        <div class="axis">
          <span>Now</span>
          <span>${this._fmtHm(t0 + (WINDOW_H / 2) * HOUR_MS)}</span>
          <span>+${WINDOW_H} h</span>
        </div>
      </div>
    `;
  }

  // ---- ungrouped ----

  private _renderUngrouped() {
    const loose = this.chargers.filter((c) => !this._householdOf(c));
    const chargerIds = new Set(this.chargers.map((c) => c.id));
    const unlinked = Object.values(this.evs).filter((ev) => !chargerIds.has(ev.charger_id));
    return html`
      ${loose.length > 0
        ? html`<section class="card">
            <header class="node-head"><div class="node-title">Not configured</div></header>
            <div class="children">${loose.map((c) => this._renderCharger(c))}</div>
          </section>`
        : nothing}
      ${unlinked.length > 0
        ? html`<section class="card">
            <header class="node-head"><div class="node-title">Unlinked EVs</div></header>
            <div class="children">
              ${unlinked.map((ev) => html`<div class="child">${this._renderEv(ev)}</div>`)}
            </div>
          </section>`
        : nothing}
    `;
  }

  protected render() {
    const hasHouseholds = Object.keys(this.households).length > 0;
    const hasEvs = Object.keys(this.evs).length > 0;
    return html`
      ${this._renderSummary()}
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
      <div class="tree">
        ${Object.values(this.households).map((h) => this._renderHousehold(h))}
        ${this._renderUngrouped()}
      </div>
    `;
  }

  static styles = css`
    :host {
      display: block;
    }
    .summary {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      gap: 12px;
      margin-bottom: 16px;
    }
    .tile {
      background: var(--card-background-color, var(--primary-background-color));
      border: 1px solid var(--divider-color);
      border-radius: 8px;
      padding: 12px;
    }
    .tile-value {
      font-size: 20px;
      font-weight: 500;
      overflow-wrap: anywhere;
    }
    .tile-label {
      font-size: 12px;
      color: var(--secondary-text-color);
      margin-top: 2px;
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
    .tree {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
    .card {
      background: var(--card-background-color, var(--primary-background-color));
      border: 1px solid var(--divider-color);
      border-radius: 12px;
      padding: 16px;
    }
    .node-head {
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 8px;
    }
    .node-title {
      font-size: 16px;
      font-weight: 500;
    }
    .chips {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
    }
    .chip {
      font-size: 12px;
      padding: 2px 8px;
      border-radius: 10px;
      background: var(--secondary-background-color);
      color: var(--secondary-text-color);
    }
    .chip.on {
      background: var(--success-color, #4caf50);
      color: #fff;
    }
    .chip.off {
      color: var(--warning-color, #ff9800);
    }
    .loads {
      display: flex;
      flex-direction: column;
      gap: 4px;
      margin: 12px 0;
    }
    .load {
      display: grid;
      grid-template-columns: 24px 1fr 56px;
      align-items: center;
      gap: 8px;
      font-size: 12px;
    }
    .load-label {
      color: var(--secondary-text-color);
    }
    .load-value {
      text-align: right;
    }
    .bar {
      height: 6px;
      border-radius: 3px;
      background: var(--divider-color);
      overflow: hidden;
    }
    .fill {
      height: 100%;
      background: var(--primary-color);
    }
    .fill.over {
      background: var(--error-color);
    }
    .children {
      margin: 12px 0 0 8px;
      padding-left: 14px;
      border-left: 2px solid var(--divider-color);
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    .child {
      position: relative;
    }
    .child::before {
      content: "";
      position: absolute;
      left: -14px;
      top: 20px;
      width: 12px;
      border-top: 2px solid var(--divider-color);
    }
    .node {
      border: 1px solid var(--divider-color);
      border-radius: 8px;
      padding: 10px 12px;
      background: var(--primary-background-color);
    }
    .node.clickable {
      cursor: pointer;
    }
    .node.clickable:hover {
      border-color: var(--primary-color);
    }
    .sub {
      margin-top: 6px;
      font-size: 13px;
      color: var(--secondary-text-color);
    }
    .sub.warn {
      color: var(--warning-color, #ff9800);
    }
    .facts {
      display: flex;
      flex-wrap: wrap;
      gap: 4px 14px;
      margin-top: 6px;
      font-size: 13px;
      color: var(--secondary-text-color);
    }
    .facts .strong {
      color: var(--primary-text-color);
      font-weight: 500;
    }
    .empty {
      color: var(--secondary-text-color);
      margin: 8px 0 0;
    }
    .timeline {
      margin-top: 8px;
    }
    .timeline svg {
      display: block;
      width: 100%;
      height: 40px;
      background: var(--secondary-background-color);
      border-radius: 4px;
    }
    .timeline .block {
      fill: var(--primary-color);
      opacity: 0.35;
    }
    .timeline .price {
      stroke: var(--secondary-text-color);
      stroke-width: 1.5;
      opacity: 0.6;
      vector-effect: non-scaling-stroke;
    }
    .timeline .tick {
      stroke: var(--divider-color);
      stroke-width: 1;
      vector-effect: non-scaling-stroke;
    }
    .axis {
      display: flex;
      justify-content: space-between;
      font-size: 11px;
      color: var(--secondary-text-color);
      margin-top: 2px;
    }
    @media (max-width: 600px) {
      .card {
        padding: 12px;
      }
      .children {
        margin-left: 2px;
        padding-left: 10px;
      }
      .child::before {
        left: -10px;
        width: 8px;
      }
    }
  `;
}
