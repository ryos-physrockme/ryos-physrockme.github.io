"""Draw the known sine-Gordon breather as a static website illustration.

Dimensionless equation: phi_tt - phi_xx + sin(phi) = 0.
phi(x,t) = 4 atan(sqrt(1-omega^2) sin(omega t)
                  / (omega cosh(sqrt(1-omega^2) x))), omega = 0.8.
Source: https://doi.org/10.1007/s42985-021-00084-w, equation (1).
This illustrates an established solution, not a new research result.

Requires NumPy and Matplotlib only when regenerating the checked-in SVG.
"""

import argparse
from pathlib import Path

import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
from matplotlib.collections import LineCollection
import numpy as np


def field(x, t, omega=0.8):
    eta = np.sqrt(1 - omega**2)
    return 4 * np.arctan(eta * np.sin(omega * t) / (omega * np.cosh(eta * x)))


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--preview", type=Path, help="Optional PNG preview path")
    args = parser.parse_args()
    root = Path(__file__).resolve().parent.parent
    omega = 0.8
    period = 2 * np.pi / omega
    x = np.linspace(-8, 8, 161)
    t = np.linspace(0, 2 * period, 81)

    # Check the equation independently with fourth-order finite differences.
    test_x, test_t = np.meshgrid(np.linspace(-7, 7, 37), np.linspace(0, period, 41))
    h = 0.002
    value = field(test_x, test_t)
    dtt = (-field(test_x, test_t+2*h) + 16*field(test_x, test_t+h)
           - 30*value + 16*field(test_x, test_t-h) - field(test_x, test_t-2*h))/(12*h*h)
    dxx = (-field(test_x+2*h, test_t) + 16*field(test_x+h, test_t)
           - 30*value + 16*field(test_x-h, test_t) - field(test_x-2*h, test_t))/(12*h*h)
    residual = float(np.max(np.abs(dtt - dxx + np.sin(value))))
    assert residual < 1e-7, f"Equation residual too large: {residual}"

    plt.rcParams.update({"font.family": "DejaVu Sans", "svg.fonttype": "none", "svg.hashsalt": "sine-gordon-breather"})
    # Parallel projection of the space-time surface; x runs horizontally,
    # t diagonally, and phi vertically. Keep a fixed, shallow web-friendly frame.
    def project(x, t, phi):
        return np.stack((410 + 34*x + 8*(t-period),
                         112 + 5*(t-period) - 20*phi), axis=-1)

    fig, ax = plt.subplots(figsize=(8.2, 2.3), dpi=160)
    fig.subplots_adjust(0, 0, 1, 1)
    curves = [project(x, np.full_like(x, time), field(x, time)) for time in t[::5]]
    columns = [project(np.full_like(t, pos), t, field(pos, t)) for pos in x[::16]]
    ax.add_collection(LineCollection(columns, colors="#b4a6cb", linewidths=.45))
    ax.add_collection(LineCollection(curves, colors="#65508e", linewidths=.65))
    # A darker profile makes the localized shape readable among time slices.
    profile = project(x, np.full_like(x, period/4), field(x, period/4))
    ax.plot(profile[:, 0], profile[:, 1], color="#65508e", linewidth=1.4)
    origin = project(-8, 0, 0)
    for endpoint, label in [(project(8.7, 0, 0), "$x$"),
                            (project(-8, 2*period+.7, 0), "$t$"),
                            (project(-8, 0, 2.6), r"$\varphi$")]:
        ax.annotate("", xy=endpoint, xytext=origin,
                    arrowprops={"arrowstyle": "->", "color": "#c2b8d2", "lw": .6})
        ax.text(endpoint[0]+5, endpoint[1]-3, label, color="#65508e", fontsize=9)
    ax.set_xlim(0, 820)
    ax.set_ylim(230, 0)
    ax.set_axis_off()
    metadata = {"Title": "Sine-Gordon breather", "Description": __doc__, "Date": None}
    target = root / "assets" / "sine-gordon-breather.svg"
    fig.savefig(target, transparent=True, metadata=metadata)
    if args.preview:
        fig.savefig(args.preview, facecolor="white")
    plt.close(fig)
    print(f"Wrote {target.name}; maximum equation residual: {residual:.2e}")


if __name__ == "__main__":
    main()
