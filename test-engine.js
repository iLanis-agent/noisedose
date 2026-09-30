var E = require('./engine.js'), n = 0, bad = 0;
function eq(a, b, m, tol) { n++; tol = tol || 1e-9; if (Math.abs(a - b) > tol) { bad++; console.log('FAIL', m, a, b); } }
var N = E.STANDARDS.niosh, O = E.STANDARDS.osha;
// NIOSH: halves every 3 dB from 8h at 85
eq(E.allowedHours(85, N), 8, 'n85'); eq(E.allowedHours(88, N), 4, 'n88'); eq(E.allowedHours(91, N), 2, 'n91');
eq(E.allowedHours(94, N), 1, 'n94'); eq(E.allowedHours(100, N) * 60, 15, 'n100 15min', 1e-9); eq(E.allowedHours(103, N) * 60, 7.5, 'n103');
// OSHA Table G-16
[[90, 8], [95, 4], [100, 2], [105, 1], [110, 0.5], [115, 0.25]].forEach(function (p) { eq(E.allowedHours(p[0], O), p[1], 'osha' + p[0]); });
eq(E.allowedHours(92, O), 8 / Math.pow(2, 0.4), 'osha92 formula');
// known published value: OSHA 92 dBA = 6.06 h
eq(E.allowedHours(92, O), 6.0629, 'osha92 6.06h', 1e-3);
// doses
eq(E.dose([{ db: 85, min: 480 }], N), 100, 'n full'); eq(E.dose([{ db: 85, min: 240 }], N), 50, 'n half');
eq(E.dose([{ db: 94, min: 60 }], N), 100, 'n94 1h'); eq(E.dose([{ db: 100, min: 15 }], N), 100, 'n100 15m');
eq(E.dose([{ db: 90, min: 480 }], O), 100, 'o full'); eq(E.dose([{ db: 85, min: 480 }], O), 50, 'o85 8h = 50% (action level)');
eq(E.dose([{ db: 79, min: 600 }], O), 0, 'osha ignores <80');
eq(E.dose([{ db: 79, min: 480 }], N) > 0 ? 1 : 0, 1, 'niosh counts 79');
// additive
eq(E.dose([{ db: 88, min: 120 }, { db: 91, min: 60 }], N), 50 + 50, 'additive');
// TWA round trip
eq(E.twa(100, N), 85, 'twa100'); eq(E.twa(200, N), 88, 'twa200'); eq(E.twa(50, O), 85, 'osha twa50'); eq(E.twa(100, O), 90, 'osha twa100');
eq(E.twa(0, N) === null ? 1 : 0, 1, 'twa0');
// minutes left
eq(E.minutesLeft([{ db: 85, min: 240 }], 88, N), 120, 'left 88 after 4h@85');
eq(E.minutesLeft([{ db: 100, min: 15 }], 88, N), 0, 'left when over');
eq(E.minutesLeft([], 100, N), 15, 'left 100');
eq(E.minutesLeft([], 70, O), Infinity, 'osha infinite below 80');
// analyze
var a = E.analyze([{ name: 'Commute', db: 80, min: 60 }, { name: 'Power saw', db: 100, min: 7.5 }, { name: 'skip', db: 90, min: 0 }]);
eq(a.niosh, 100 / (8 * Math.pow(2, 5 / 3)) + 50, 'analyze dose');
eq(a.top.name === 'Power saw' ? 1 : 0, 1, 'top'); eq(a.nioshStatus === 'over' ? 1 : 0, 0, 'status not over');
eq(E.analyze([{ db: 100, min: 30 }]).nioshStatus === 'over' ? 1 : 0, 1, 'over');
eq(E.analyze([]).niosh, 0, 'empty');
// monotonic
for (var L = 60; L < 120; L++) eq(E.allowedHours(L + 1, N) < E.allowedHours(L, N) ? 1 : 0, 1, 'mono' + L);
console.log(n + ' assertions, ' + bad + ' failed'); process.exit(bad ? 1 : 0);
