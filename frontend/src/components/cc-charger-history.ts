import { LitElement, html, svg, css, nothing } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { HomeAssistant } from "../types";

const RANGES = [
  { hours: 6, label: "6 h" },
  { hours: 24, label: "24 h" },
  { hours: 72, label: "3 d" },
  { hours: 168, label: "7 d" },
];

const PHASE_LABELS = ["P1", "P2", "P3"];

const MODES = [
  { state: "charging", label: "Charging" },
  { state: "limited", label: "Limited" },
  { state: "failsafe", label: "Failsafe" },
  { state: "idle", label: "Idle" },
];

const REFRESH_MS = 60_000;

// Chart geometry (px)
const HEIGHT = 200;
const MARGIN = { top: 10, right: 52, bottom: 22, left: 42 };
const BAND_HEIGHT = 10;
const BAND_GAP = 8;
// Coinciding phase lines are drawn this far apart so all three stay visible
const LINE_OFFSET = 2;

interface Point {
  t: number; // ms since epoch
  v: number | null; // null when the sensor had no numeric value
}

interface ModePoint {
  t: number;
  s: string;
}

/** Last point at or before time t, or undefined. Points are sorted by time. */
function pointAt<T extends { t: number }>(points: T[], t: number): T | undefined {
  let lo = 0;
  let hi = points.length - 1;
  let found: T | undefined;
  while (lo <= hi) {
    const mid = (lo + hi) >> 1;
    if (points[mid].t <= t) {
      found = points[mid];
      lo = mid + 1;
    } else {
      hi = mid - 1;
    }
  }
  return found;
}

/** Step size giving at most five ticks between 0 and max. */
function tickStep(max: number): number {
  for (const step of [1, 2, 5, 10, 20, 50]) {
    if (max / step <= 5) return step;
  }
  return 100;
}

/**
 * Step chart of a charger's calculated target currents per phase, with the load
 * balancing mode as a band below. Data comes from the HA recorder.
 */
@customElement("cc-charger-history")
export class CcChargerHistory extends LitElement {
  @property({ attribute: false }) public hass!: HomeAssistant & {
    themes?: { darkMode?: boolean };
  };
  /** Target current sensors for charger phases P1-P3. */
  @property({ attribute: false }) public targetEntities: string[] = [];
  @property({ attribute: false }) public modeEntity: string | null = null;

  @state() private _hours = 24;
  @state() private _targets: Point[][] = [];
  @state() private _modes: ModePoint[] = [];
  @state() private _range: [number, number] = [0, 0];
  @state() private _loading = false;
  @state() private _error = "";
  @state() private _width = 600;
  @state() private _hoverT: number | null = null;

  private _fetchKey = "";
  private _timer?: number;
  private _resizeObserver?: ResizeObserver;

  connectedCallback() {
    super.connectedCallback();
    this._timer = window.setInterval(() => this._fetch(), REFRESH_MS);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    window.clearInterval(this._timer);
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
    const key = JSON.stringify([this.targetEntities, this.modeEntity, this._hours]);
    if (key !== this._fetchKey && this.targetEntities.length > 0) {
      this._fetchKey = key;
      this._fetch();
    }
  }

  private async _fetch() {
    if (this.targetEntities.length === 0) return;
    const end = Date.now();
    const start = end - this._hours * 3600_000;
    const entityIds = [...this.targetEntities, ...(this.modeEntity ? [this.modeEntity] : [])];

    this._loading = true;
    try {
      const result = await this.hass.callWS<Record<string, { s: string; lu: number }[]>>({
        type: "history/history_during_period",
        start_time: new Date(start).toISOString(),
        end_time: new Date(end).toISOString(),
        entity_ids: entityIds,
        minimal_response: true,
        no_attributes: true,
        significant_changes_only: false,
      });
      const rows = (entityId: string) =>
        (result[entityId] ?? []).map((row) => ({ t: Math.max(row.lu * 1000, start), s: row.s }));

      this._targets = this.targetEntities.map((entityId) =>
        rows(entityId).map(({ t, s }) => {
          const v = parseFloat(s);
          return { t, v: Number.isFinite(v) ? v : null };
        })
      );
      this._modes = this.modeEntity ? rows(this.modeEntity) : [];
      this._range = [start, end];
      this._error = "";
    } catch (err: any) {
      this._error = `History could not be loaded: ${err?.message ?? err}`;
    } finally {
      this._loading = false;
    }
  }

  // Scales
  private get _plotRight() {
    return this._width - MARGIN.right;
  }

  private _x(t: number) {
    const [start, end] = this._range;
    return MARGIN.left + ((t - start) / (end - start)) * (this._plotRight - MARGIN.left);
  }

  private get _yMax() {
    const values = this._targets.flat().map((p) => p.v ?? 0);
    const max = Math.max(10, ...values);
    const step = tickStep(max);
    return Math.ceil(max / step) * step;
  }

  private _y(v: number) {
    return MARGIN.top + (1 - v / this._yMax) * (HEIGHT - MARGIN.top - MARGIN.bottom);
  }

  private _formatTime(t: number, withDate: boolean) {
    return new Intl.DateTimeFormat(this.hass.language, {
      ...(withDate ? { weekday: "short", day: "numeric" } : {}),
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(t));
  }

  /** SVG path of a step line; gaps where the value is unknown. */
  private _stepPath(points: Point[], offset: number) {
    const end = this._range[1];
    let d = "";
    let drawing = false;
    points.forEach((p, i) => {
      const nextT = i + 1 < points.length ? points[i + 1].t : end;
      if (p.v === null) {
        drawing = false;
        return;
      }
      const y = this._y(p.v) + offset;
      d += drawing ? ` V${y}` : ` M${this._x(p.t)},${y}`;
      d += ` H${this._x(nextT)}`;
      drawing = true;
    });
    return d.trim();
  }

  /** Endpoint labels, pushed apart vertically so they never overlap. */
  private _endLabels() {
    const labels = this._targets
      .map((points, i) => {
        const last = points[points.length - 1];
        return last?.v != null ? { i, y: this._y(last.v), v: last.v } : null;
      })
      .filter((l): l is { i: number; y: number; v: number } => l !== null)
      .sort((a, b) => a.y - b.y);
    for (let k = 1; k < labels.length; k++) {
      labels[k].y = Math.max(labels[k].y, labels[k - 1].y + 12);
    }
    return labels;
  }

  private _onPointerMove(e: PointerEvent) {
    const svgEl = e.currentTarget as SVGElement;
    const x = e.clientX - svgEl.getBoundingClientRect().left;
    if (x < MARGIN.left || x > this._plotRight) {
      this._hoverT = null;
      return;
    }
    const [start, end] = this._range;
    this._hoverT = start + ((x - MARGIN.left) / (this._plotRight - MARGIN.left)) * (end - start);
  }

  protected render() {
    return html`
      <ha-card header="Calculated charging currents">
        <div class="card-content">
          <div class="controls">
            <div class="ranges">
              ${RANGES.map(
                (r) => html`
                  <button
                    class="range ${r.hours === this._hours ? "active" : ""}"
                    @click=${() => (this._hours = r.hours)}
                  >
                    ${r.label}
                  </button>
                `
              )}
            </div>
            ${this._renderLegend()}
          </div>
          ${this.targetEntities.length === 0
            ? html`<p class="hint">Save the load balancing configuration to start recording.</p>`
            : nothing}
          ${this._error ? html`<p class="error">${this._error}</p>` : nothing}
          <div class="chart ${this._loading ? "loading" : ""}">
            ${this._range[1] > 0 ? this._renderChart() : nothing}
          </div>
          ${this._range[1] > 0 ? this._renderTable() : nothing}
        </div>
      </ha-card>
    `;
  }

  private _renderLegend() {
    return html`
      <div class="legend">
        ${PHASE_LABELS.map(
          (label, i) => html`<span class="key"><span class="line s${i + 1}"></span>${label}</span>`
        )}
        ${this.modeEntity
          ? MODES.map(
              (m) => html`<span class="key"><span class="swatch ${m.state}"></span>${m.label}</span>`
            )
          : nothing}
      </div>
    `;
  }

  private _renderChart() {
    const width = this._width;
    const [start, end] = this._range;
    const withDate = this._hours > 24;
    const yStep = tickStep(this._yMax);
    const yTicks = Array.from({ length: this._yMax / yStep + 1 }, (_, k) => k * yStep);
    const xTickCount = width < 420 ? 3 : 5;
    const xTicks = Array.from(
      { length: xTickCount },
      (_, k) => start + ((end - start) * k) / (xTickCount - 1)
    );
    const bandY = HEIGHT + BAND_GAP;
    const totalHeight = bandY + (this.modeEntity ? BAND_HEIGHT : 0) + 2;

    return html`
      <svg
        width=${width}
        height=${totalHeight}
        role="img"
        aria-label="Target charging current per phase over time"
        @pointermove=${this._onPointerMove}
        @pointerleave=${() => (this._hoverT = null)}
      >
        ${yTicks.map(
          (v) => svg`
            <line class="grid" x1=${MARGIN.left} x2=${this._plotRight} y1=${this._y(v)} y2=${this._y(v)}></line>
            <text class="axis" x=${MARGIN.left - 6} y=${this._y(v)} text-anchor="end" dominant-baseline="middle">${v === this._yMax ? `${v} A` : v}</text>
          `
        )}
        ${xTicks.map(
          (t, k) => svg`
            <text
              class="axis"
              x=${this._x(t)}
              y=${HEIGHT - MARGIN.bottom + 15}
              text-anchor=${k === 0 ? "start" : k === xTickCount - 1 ? "end" : "middle"}
            >${this._formatTime(t, withDate)}</text>
          `
        )}
        ${this._targets.map(
          (points, i) => svg`
            <path class="series s${i + 1}" d=${this._stepPath(points, (i - 1) * LINE_OFFSET)}></path>
          `
        )}
        ${this._endLabels().map(
          (l) => svg`
            <text class="end-label" x=${this._plotRight + 6} y=${l.y} dominant-baseline="middle">
              ${PHASE_LABELS[l.i]} ${l.v}
            </text>
          `
        )}
        ${this.modeEntity
          ? this._modes.map((m, i) => {
              const x0 = this._x(m.t);
              const x1 = this._x(i + 1 < this._modes.length ? this._modes[i + 1].t : end);
              const w = x1 - x0 > 3 ? x1 - x0 - 1 : x1 - x0;
              return svg`<rect class="band ${m.s}" x=${x0} y=${bandY} width=${Math.max(w, 0)} height=${BAND_HEIGHT} rx="2"></rect>`;
            })
          : nothing}
        ${this._hoverT !== null
          ? svg`<line class="crosshair" x1=${this._x(this._hoverT)} x2=${this._x(this._hoverT)} y1=${MARGIN.top} y2=${totalHeight}></line>`
          : nothing}
      </svg>
      ${this._hoverT !== null ? this._renderTooltip(this._hoverT) : nothing}
    `;
  }

  private _renderTooltip(t: number) {
    const x = this._x(t);
    const left = x > this._width / 2;
    const mode = pointAt(this._modes, t)?.s;
    return html`
      <div class="tooltip" style="${left ? `right:${this._width - x + 8}px` : `left:${x + 8}px`}">
        <div class="tooltip-time">${this._formatTime(t, true)}</div>
        ${this._targets.map((points, i) => {
          const v = pointAt(points, t)?.v;
          return html`
            <div class="tooltip-row">
              <span class="line s${i + 1}"></span>
              <strong>${v == null ? "–" : `${v} A`}</strong>
              <span class="secondary">${PHASE_LABELS[i]}</span>
            </div>
          `;
        })}
        ${mode
          ? html`<div class="tooltip-row">
              <span class="swatch ${mode}"></span>
              <strong>${mode}</strong>
              <span class="secondary">Mode</span>
            </div>`
          : nothing}
      </div>
    `;
  }

  /** Table of all changes, newest first, as an alternative to the chart. */
  private _renderTable() {
    const times = [
      ...new Set([...this._targets.flat().map((p) => p.t), ...this._modes.map((m) => m.t)]),
    ]
      .sort((a, b) => b - a)
      .slice(0, 200);
    return html`
      <details>
        <summary>Show as table</summary>
        <table>
          <thead>
            <tr>
              <th>Time</th>
              ${PHASE_LABELS.map((l) => html`<th class="num">${l} (A)</th>`)}
              ${this.modeEntity ? html`<th>Mode</th>` : nothing}
            </tr>
          </thead>
          <tbody>
            ${times.map(
              (t) => html`
                <tr>
                  <td>${this._formatTime(t, true)}</td>
                  ${this._targets.map((points) => {
                    const v = pointAt(points, t)?.v;
                    return html`<td class="num">${v ?? "–"}</td>`;
                  })}
                  ${this.modeEntity ? html`<td>${pointAt(this._modes, t)?.s ?? "–"}</td>` : nothing}
                </tr>
              `
            )}
          </tbody>
        </table>
      </details>
    `;
  }

  static styles = css`
    :host {
      /* Categorical slots 1-3 (validated all-pairs, light and dark) */
      --cc-series-1: #2a78d6;
      --cc-series-2: #eb6834;
      --cc-series-3: #1baf7a;
      --cc-idle: #c3c2b7;
      /* Status colors, reserved for the mode */
      --cc-good: #0ca30c;
      --cc-warning: #fab219;
      --cc-critical: #d03b3b;
    }

    :host([dark]) {
      --cc-series-1: #3987e5;
      --cc-series-2: #d95926;
      --cc-series-3: #199e70;
      --cc-idle: #4a4a46;
    }

    .controls {
      display: flex;
      flex-wrap: wrap;
      justify-content: space-between;
      align-items: center;
      gap: 8px;
      margin-bottom: 8px;
    }

    .ranges {
      display: flex;
      gap: 4px;
    }

    .range {
      border: 1px solid var(--divider-color);
      background: none;
      color: var(--primary-text-color);
      border-radius: 12px;
      padding: 2px 10px;
      font: inherit;
      font-size: 13px;
      cursor: pointer;
    }

    .range.active {
      background: var(--primary-color);
      border-color: var(--primary-color);
      color: var(--text-primary-color, #fff);
    }

    .legend {
      display: flex;
      flex-wrap: wrap;
      gap: 12px;
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
      border-radius: 1px;
    }

    .swatch {
      display: inline-block;
      width: 10px;
      height: 10px;
      border-radius: 2px;
    }

    .line.s1 { background: var(--cc-series-1); }
    .line.s2 { background: var(--cc-series-2); }
    .line.s3 { background: var(--cc-series-3); }

    .chart {
      position: relative;
      width: 100%;
      transition: opacity 0.2s;
    }

    .chart.loading {
      opacity: 0.5;
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

    .axis {
      fill: var(--secondary-text-color);
      font-size: 11px;
      font-variant-numeric: tabular-nums;
    }

    .series {
      fill: none;
      stroke-width: 2;
      stroke-linejoin: round;
      stroke-linecap: round;
    }

    .series.s1 { stroke: var(--cc-series-1); }
    .series.s2 { stroke: var(--cc-series-2); }
    .series.s3 { stroke: var(--cc-series-3); }

    .end-label {
      fill: var(--secondary-text-color);
      font-size: 11px;
    }

    .band.charging, .swatch.charging { fill: var(--cc-good); background: var(--cc-good); }
    .band.limited, .swatch.limited { fill: var(--cc-warning); background: var(--cc-warning); }
    .band.failsafe, .swatch.failsafe { fill: var(--cc-critical); background: var(--cc-critical); }
    .band.idle, .swatch.idle { fill: var(--cc-idle); background: var(--cc-idle); }
    .band { fill: transparent; }

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

    .tooltip-time {
      color: var(--secondary-text-color);
      margin-bottom: 4px;
    }

    .tooltip-row {
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .secondary {
      color: var(--secondary-text-color);
    }

    details {
      margin-top: 12px;
      font-size: 13px;
    }

    summary {
      cursor: pointer;
      color: var(--secondary-text-color);
    }

    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 8px;
    }

    th, td {
      text-align: left;
      padding: 4px 8px;
      border-bottom: 1px solid var(--divider-color);
    }

    .num {
      text-align: right;
      font-variant-numeric: tabular-nums;
    }

    .hint {
      color: var(--secondary-text-color);
    }

    .error {
      color: var(--error-color);
    }
  `;
}
