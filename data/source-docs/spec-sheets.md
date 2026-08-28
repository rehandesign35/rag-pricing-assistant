# Meridian Solar — Equipment Specification Sheet

*Internal reference document. Effective 2026 product line.*

## Solar Panels

| Model | Type | Wattage | Efficiency | Dimensions (mm) | Weight | Warranty | Unit Price |
|---|---|---|---|---|---|---|---|
| XR-400 | Monocrystalline PERC | 400W | 21.2% | 1722 x 1134 x 30 | 21.5 kg | 25-year performance / 12-year product | $310 |
| XR-450 | Monocrystalline PERC | 450W | 21.8% | 1855 x 1134 x 30 | 23.8 kg | 25-year performance / 12-year product | $345 |
| XR-450B | Monocrystalline Bifacial | 450W | 22.1% | 1855 x 1134 x 33 | 24.6 kg | 30-year performance / 15-year product | $410 |
| EC-330 | Polycrystalline | 330W | 18.6% | 1650 x 992 x 35 | 19.2 kg | 20-year performance / 10-year product | $215 |

**Notes:**
- The XR-450B is the only bifacial panel in the current line; bifacial gain adds an estimated 5-10% output depending on mounting height and ground reflectivity.
- All XR-series panels use PERC (Passivated Emitter Rear Cell) technology.
- The EC-330 is Meridian's budget/legacy line, recommended only for space-constrained retrofits where panel count matters less than per-panel efficiency.

## Inverters

| Model | Type | Rated Capacity | Peak Efficiency | Phases | Warranty | Unit Price |
|---|---|---|---|---|---|---|
| SI-6000 | String Inverter | 6.0 kW | 97.5% | Single | 12 years | $1,450 |
| SI-8000 | String Inverter | 8.0 kW | 97.8% | Single | 12 years | $1,680 |
| MI-400 | Microinverter | 0.4 kW (per unit) | 96.8% | Single | 25 years | $185 (per unit) |

**Notes:**
- Microinverters (MI-400) are installed one per panel and are recommended for roofs with partial shading or multiple orientations, since panel-level MPPT avoids whole-string output loss.
- String inverters (SI-6000 / SI-8000) are lower cost per watt but production drops for the whole string if any single panel is shaded or underperforming.
- Inverter sizing guideline: total inverter rated capacity should be 90-110% of total panel DC wattage (DC-to-AC ratio of 1.1-1.25 is standard for string systems).

## Battery Storage

| Model | Usable Capacity | Continuous Output | Round-Trip Efficiency | Warranty | Unit Price |
|---|---|---|---|---|---|
| PowerCell-10 | 10 kWh | 5 kW | 92% | 10 years / 70% capacity retention | $7,200 |
| PowerCell-13 | 13.5 kWh | 5 kW | 93% | 10 years / 70% capacity retention | $8,900 |
| PowerCell-13X | 13.5 kWh | 7.6 kW | 94% | 12 years / 80% capacity retention | $10,500 |

**Notes:**
- The PowerCell-13X is the only model rated for whole-home backup on a standard 200A panel; the PowerCell-10 and PowerCell-13 are typically configured for critical-loads-only backup (refrigerator, lighting, select circuits).
- Batteries are DC-coupled when paired with SI-series inverters and AC-coupled when paired with MI-400 microinverters.
