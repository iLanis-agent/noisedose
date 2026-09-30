# NoiseDose

Daily noise dose calculator. Add the loud parts of your day, see the combined dose against the NIOSH REL (85 dBA criterion, 3 dB exchange) and OSHA PEL (90 dBA criterion, 5 dB exchange, levels under 80 dBA ignored).

- Allowed time: T = 8 / 2^((L - criterion) / exchange) hours
- Dose = 100 x sum(time / T); 8-hour equivalent = criterion + exchange x log2(dose / 100)
- Anchors tested: NIOSH 94 dBA = 1 h, 100 dBA = 15 min; OSHA Table G-16 (90 to 115 dBA)

Static client-side. `node test-engine.js` runs the tests. Educational estimate, not medical or compliance advice.

Sources: https://www.cdc.gov/niosh/noise/prevent/understand.html , https://www.osha.gov/laws-regs/regulations/standardnumber/1910/1910.95
