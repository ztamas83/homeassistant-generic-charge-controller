import { LitElement, svg, css, html, nothing } from "lit";
import { customElement, property } from "lit/decorators.js";
import { tickStep } from "../utils/chart";

// Chart geometry (viewBox units)
const W = 480;
const H = 160;
const M = { top: 10, right: 8, bottom: 20, left: 30 };

@customElement("cc-ev-hourly-power")
export class CcEvHourlyPower extends LitElement {
  /** 24 entries, index = local hour, null = not enough samples. */
  @property({ attribute: false }) public hourly: (number | null)[] | undefined;
  /** 24 entries 0..1, confidence per hour (drives bar opacity). */
  @property({ attribute: false }) public confidence: number[] | undefined;
  /** Estimate currently used (kW), drawn as a dashed line. */
  @property({ type: Number }) public estimatePower: number | null = null;

  protected render() {
    const data = this.hourly;
    if (!data || data.length === 0) return nothing;
    if (data.every((v) => v == null)) {
      return html`<p class="hint">No hourly data learned yet.</p>`;
    }
    const values = data.filter((v): v is number => v != null);
    const top = Math.max(...values, this.estimatePower ?? 0, 0.1);
    const step = tickStep(top) / (top < 5 ? (top < 2 ? 4 : 2) : 1);
    const max = Math.ceil(top / step) * step;
    const iw = W - M.left - M.right;
    const ih = H - M.top - M.bottom;
    const bw = iw / 24;
    const y = (v: number) => M.top + ih - (v / max) * ih;
    const nowHour = new Date().getHours();
    const ticks: number[] = [];
    for (let v = 0; v <= max + 1e-9; v += step) ticks.push(v);
    const fmt = (v: number) => (Number.isInteger(v) ? String(v) : v.toFixed(1));
    const est = this.estimatePower;
    const pad = (h: number) => String(h).padStart(2, "0");

    return html`
      <div class="title">Learned power by hour</div>
      <svg viewBox="0 0 ${W} ${H}" width="100%" role="img" aria-label="Learned charging power by hour">
        ${ticks.map(
          (v) => svg`
            <line class="grid" x1=${M.left} x2=${W - M.right} y1=${y(v)} y2=${y(v)} />
            <text class="axis" x=${M.left - 4} y=${y(v) + 3} text-anchor="end">${fmt(v)}</text>`,
        )}
        <text class="axis" x="2" y=${M.top - 2}>kW</text>
        ${data.map((v, h) => {
          const x = M.left + h * bw + bw * 0.15;
          const w = bw * 0.7;
          const c = Math.max(0, Math.min(1, this.confidence?.[h] ?? 0));
          const label =
            v == null
              ? `${pad(h)}:00  not enough data`
              : `${pad(h)}:00  ${v.toFixed(1)} kW  (confidence ${Math.round(c * 100)} %)`;
          return v == null
            ? svg`<rect class="stub" x=${x} y=${y(0) - 6} width=${w} height="6"><title>${label}</title></rect>`
            : svg`<rect class="bar ${h === nowHour ? "now" : ""}" x=${x} y=${y(v)} width=${w}
                opacity=${0.25 + 0.75 * c}
                height=${Math.max(y(0) - y(v), 1)}><title>${label}</title></rect>`;
        })}
        ${est != null && est > 0
          ? svg`<line class="est" x1=${M.left} x2=${W - M.right} y1=${y(est)} y2=${y(est)} />
              <text class="estlabel" x=${W - M.right - 2} y=${y(est) - 3} text-anchor="end">${est.toFixed(1)} kW used</text>`
          : nothing}
        ${data.map((_, h) =>
          h % 3 === 0
            ? svg`<text class="axis" x=${M.left + h * bw + bw / 2} y=${H - 5} text-anchor="middle">${h}</text>`
            : nothing,
        )}
      </svg>
      <div class="legend">Bar opacity = confidence. Faded hours use the window average.</div>
    `;
  }

  static styles = css`
    :host {
      display: block;
      margin-top: 12px;
    }
    .title {
      font-size: 0.9em;
      color: var(--secondary-text-color);
      margin-bottom: 4px;
    }
    .hint {
      color: var(--secondary-text-color);
      margin: 8px 0 0;
    }
    svg {
      display: block;
      height: auto;
    }
    .grid {
      stroke: var(--divider-color);
      stroke-width: 1;
    }
    .axis {
      fill: var(--secondary-text-color);
      font-size: 10px;
    }
    .bar {
      fill: var(--cc-series-1, var(--primary-color));
    }
    .bar.now {
      stroke: var(--primary-text-color);
      stroke-width: 1.5;
    }
    .legend {
      font-size: 0.8em;
      color: var(--secondary-text-color);
      margin-top: 2px;
    }
    .stub {
      fill: none;
      stroke: var(--secondary-text-color);
      stroke-width: 1;
      stroke-dasharray: 2 2;
      opacity: 0.4;
    }
    .est {
      stroke: var(--secondary-text-color);
      stroke-width: 1;
      stroke-dasharray: 4 3;
    }
    .estlabel {
      fill: var(--secondary-text-color);
      font-size: 10px;
    }
  `;
}

declare global {
  interface HTMLElementTagNameMap {
    "cc-ev-hourly-power": CcEvHourlyPower;
  }
}
