import { LitElement, html, svg, css, nothing } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { HomeAssistant, PlanBlock, PriceSlot } from "../types";
import { tickStep } from "../utils/chart";

// Chart geometry (px)
const HEIGHT = 200;
const MARGIN = { top: 10, right: 12, bottom: 22, left: 46 };
const DAY_MS = 86_400_000;

interface Slot {
  s: number;
  e: number;
  price: number;
}

/**
 * Step chart of electricity prices (per kWh) for today and tomorrow, with the
 * planned charging blocks as shaded bands.
 */
@customElement("cc-ev-schedule")
export class CcEvSchedule extends LitElement {
  @property({ attribute: false }) public hass!: HomeAssistant & {
    themes?: { darkMode?: boolean };
  };
  @property({ attribute: false }) public prices: PriceSlot[] = [];
  @property({ attribute: false }) public currency: string | null = null;
  @property({ attribute: false }) public blocks: PlanBlock[] = [];
  @property({ attribute: false }) public deadline: string | null = null;

  @state() private _width = 600;
  @state() private _hoverT: number | null = null;
  private _resizeObserver?: ResizeObserver;

  disconnectedCallback() {
    super.disconnectedCallback();
    this._resizeObserver?.disconnect();
  }

  protected firstUpdated() {
    const container = this.renderRoot.querySelector(".chart") as HTMLElement;
    this._resizeObserver = new ResizeObserver((entries) => {
      const width = Math.round(entries[0].contentRect.width);
      if (width > 0) this._width = width;
    });
    this._resizeObserver.observe(container);
  }

  protected willUpdate() {
    this.toggleAttribute("dark", !!this.hass?.themes?.darkMode);
  }

  private get _slots(): Slot[] {
    return this.prices
      .map((p) => ({ s: Date.parse(p.start), e: Date.parse(p.end), price: p.price }))
      .filter((p) => Number.isFinite(p.s) && Number.isFinite(p.e))
      .sort((a, b) => a.s - b.s);
  }

  /** Local midnight today to local midnight after tomorrow. */
  private get _range(): [number, number] {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    const start = d.getTime();
    const end = new Date(start + 2.5 * DAY_MS);
    end.setHours(0, 0, 0, 0);
    return [start, end.getTime()];
  }

  private get _yRange(): [number, number] {
    const [a, b] = this._range;
    const values = this._slots.filter((s) => s.e > a && s.s < b).map((s) => s.price);
    const max = Math.max(0.1, ...values);
    const min = Math.min(0, ...values);
    const step = tickStep(max * 10) / 10;
    return [Math.floor(min / step) * step, Math.ceil(max / step) * step];
  }

  private get _plotRight() {
    return this._width - MARGIN.right;
  }

  private _x(t: number) {
    const [start, end] = this._range;
    return MARGIN.left + ((t - start) / (end - start)) * (this._plotRight - MARGIN.left);
  }

  private _y(v: number) {
    const [lo, hi] = this._yRange;
    return MARGIN.top + (1 - (v - lo) / (hi - lo)) * (HEIGHT - MARGIN.top - MARGIN.bottom);
  }

  private _fmt(t: number, withDate = false) {
    return new Intl.DateTimeFormat(this.hass.language, {
      ...(withDate ? { weekday: "short", day: "numeric" } : {}),
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(t));
  }

  private get _unit() {
    return this.currency ? `${this.currency}/kWh` : "/kWh";
  }

  private _fmtPrice(v: number) {
    return v.toFixed(Math.abs(v) < 1 ? 3 : 2);
  }

  /** SVG step path; consecutive slots are joined by vertical steps. */
  private _stepPath(slots: Slot[]) {
    let d = "";
    let prevEnd = -1;
    for (const s of slots) {
      const x0 = this._x(s.s);
      const x1 = this._x(s.e);
      const y = this._y(s.price);
      d += s.s === prevEnd ? `L${x0} ${y}` : `M${x0} ${y}`;
      d += `L${x1} ${y}`;
      prevEnd = s.e;
    }
    return d;
  }

  private _onPointerMove(e: PointerEvent) {
    const x = e.clientX - (e.currentTarget as SVGElement).getBoundingClientRect().left;
    if (x < MARGIN.left || x > this._plotRight) {
      this._hoverT = null;
      return;
    }
    const [start, end] = this._range;
    this._hoverT = start + ((x - MARGIN.left) / (this._plotRight - MARGIN.left)) * (end - start);
  }

  protected render() {
    return html`
      <div class="chart">${this._slots.length > 0 ? this._renderChart() : nothing}</div>
      ${this._slots.length === 0 ? html`<p class="hint">No price data available.</p>` : nothing}
      ${this._slots.length > 0
        ? html`<div class="legend">
            <span class="key"><span class="line"></span>Price (${this._unit})</span>
            <span class="key"><span class="swatch"></span>Planned charging</span>
          </div>`
        : nothing}
    `;
  }

  private _renderChart() {
    const [start, end] = this._range;
    const [lo, hi] = this._yRange;
    const slots = this._slots;
    const yStep = tickStep((hi - lo) * 10) / 10 || 0.1;
    const yTicks: number[] = [];
    for (let v = lo; v <= hi + yStep / 2; v += yStep) yTicks.push(Math.round(v * 1000) / 1000);
    const hours = this._width < 420 ? 12 : 6;
    const xTicks: number[] = [];
    for (let t = start; t <= end; ) {
      xTicks.push(t);
      const d = new Date(t);
      d.setHours(d.getHours() + hours);
      t = d.getTime();
    }
    const now = Date.now();
    const deadline = this.deadline ? Date.parse(this.deadline) : NaN;
    const midnights = xTicks.filter((t) => new Date(t).getHours() === 0);

    return html`
      <svg
        width=${this._width}
        height=${HEIGHT}
        role="img"
        aria-label="Electricity prices and planned charging"
        @pointermove=${this._onPointerMove}
        @pointerleave=${() => (this._hoverT = null)}
      >
        ${yTicks.map(
          (v) => svg`
            <line class="grid" x1=${MARGIN.left} x2=${this._plotRight} y1=${this._y(v)} y2=${this._y(v)}></line>
            <text class="axis" x=${MARGIN.left - 6} y=${this._y(v)} text-anchor="end" dominant-baseline="middle">${this._fmtPrice(v)}</text>
          `
        )}
        ${this.blocks.map((b) => {
          const x0 = this._x(Math.max(Date.parse(b.start), start));
          const x1 = this._x(Math.min(Date.parse(b.end), end));
          return svg`<rect class="block" x=${x0} y=${MARGIN.top} width=${Math.max(x1 - x0, 1)} height=${HEIGHT - MARGIN.top - MARGIN.bottom}></rect>`;
        })}
        ${midnights.map(
          (t) => svg`<line class="day" x1=${this._x(t)} x2=${this._x(t)} y1=${MARGIN.top} y2=${HEIGHT - MARGIN.bottom}></line>`
        )}
        ${xTicks.slice(0, -1).map(
          (t) => svg`
            <text class="axis" x=${this._x(t)} y=${HEIGHT - MARGIN.bottom + 15} text-anchor="middle">${
              new Date(t).getHours() === 0 ? this._fmt(t, true).split(",")[0] : String(new Date(t).getHours()).padStart(2, "0")
            }</text>
          `
        )}
        <path class="series" d=${this._stepPath(slots)}></path>
        ${now >= start && now <= end
          ? svg`<line class="now" x1=${this._x(now)} x2=${this._x(now)} y1=${MARGIN.top} y2=${HEIGHT - MARGIN.bottom}></line>
                <text class="axis" x=${this._x(now)} y=${MARGIN.top - 2} text-anchor="middle">now</text>`
          : nothing}
        ${Number.isFinite(deadline) && deadline >= start && deadline <= end
          ? svg`<line class="deadline" x1=${this._x(deadline)} x2=${this._x(deadline)} y1=${MARGIN.top} y2=${HEIGHT - MARGIN.bottom}></line>`
          : nothing}
        ${this._hoverT !== null
          ? svg`<line class="crosshair" x1=${this._x(this._hoverT)} x2=${this._x(this._hoverT)} y1=${MARGIN.top} y2=${HEIGHT - MARGIN.bottom}></line>`
          : nothing}
      </svg>
      ${this._hoverT !== null ? this._renderTooltip(this._hoverT) : nothing}
    `;
  }

  private _renderTooltip(t: number) {
    const x = this._x(t);
    const slot = this._slots.find((s) => t >= s.s && t < s.e);
    const planned = this.blocks.find((b) => t >= Date.parse(b.start) && t < Date.parse(b.end));
    const left = x > this._width / 2;
    return html`
      <div class="tooltip" style="${left ? `right:${this._width - x + 8}px` : `left:${x + 8}px`}">
        <div class="tooltip-time">${this._fmt(t, true)}</div>
        <div><strong>${slot ? this._fmtPrice(slot.price) : "–"}</strong> ${this._unit}</div>
        ${planned
          ? html`<div class="secondary">
              Planned charging, ${planned.cost.toFixed(2)}${this.currency ? ` ${this.currency}` : ""}
            </div>`
          : nothing}
      </div>
    `;
  }

  static styles = css`
    :host {
      --cc-series-1: #2a78d6;
      --cc-block: rgba(12, 163, 12, 0.22);
      --cc-deadline: #d03b3b;
    }

    :host([dark]) {
      --cc-series-1: #3987e5;
      --cc-block: rgba(25, 158, 112, 0.3);
    }

    .chart {
      position: relative;
      width: 100%;
    }

    svg {
      display: block;
      overflow: visible;
      touch-action: pan-y;
    }

    .grid {
      stroke: var(--divider-color);
      stroke-width: 1;
    }

    .day {
      stroke: var(--divider-color);
      stroke-width: 1;
      stroke-dasharray: 3 3;
    }

    .axis {
      fill: var(--secondary-text-color);
      font-size: 11px;
      font-variant-numeric: tabular-nums;
    }

    .series {
      fill: none;
      stroke: var(--cc-series-1);
      stroke-width: 2;
      stroke-linejoin: round;
    }

    .block {
      fill: var(--cc-block);
    }

    .now {
      stroke: var(--primary-text-color);
      stroke-width: 1;
    }

    .deadline {
      stroke: var(--cc-deadline);
      stroke-width: 1.5;
      stroke-dasharray: 4 3;
    }

    .crosshair {
      stroke: var(--secondary-text-color);
      stroke-width: 1;
      pointer-events: none;
    }

    .tooltip {
      position: absolute;
      top: 0;
      pointer-events: none;
      background: var(--card-background-color, #fff);
      border: 1px solid var(--divider-color);
      border-radius: 6px;
      padding: 6px 8px;
      font-size: 12px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
      white-space: nowrap;
    }

    .tooltip-time,
    .secondary {
      color: var(--secondary-text-color);
    }

    .tooltip-time {
      margin-bottom: 4px;
    }

    .legend {
      display: flex;
      flex-wrap: wrap;
      gap: 12px;
      margin-top: 8px;
      font-size: 12px;
      color: var(--secondary-text-color);
    }

    .key {
      display: inline-flex;
      align-items: center;
      gap: 4px;
    }

    .line {
      display: inline-block;
      width: 14px;
      height: 2px;
      background: var(--cc-series-1);
    }

    .swatch {
      display: inline-block;
      width: 10px;
      height: 10px;
      border-radius: 2px;
      background: var(--cc-block);
    }

    .hint {
      color: var(--secondary-text-color);
    }
  `;
}
