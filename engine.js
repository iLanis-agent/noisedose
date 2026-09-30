(function (root) {
  'use strict';
  // NIOSH REL: 85 dBA criterion, 3 dB exchange. OSHA PEL: 90 dBA criterion, 5 dB exchange (29 CFR 1910.95 Table G-16).
  var STANDARDS = {
    niosh: { id: 'niosh', label: 'NIOSH REL', criterion: 85, exchange: 3, threshold: 0 },
    osha: { id: 'osha', label: 'OSHA PEL', criterion: 90, exchange: 5, threshold: 80 }
  };
  function r(x, d) { var p = Math.pow(10, d); return Math.round(x * p) / p; }
  // allowed hours per day at level L
  function allowedHours(L, s) {
    var t = 8 / Math.pow(2, (L - s.criterion) / s.exchange);
    return t;
  }
  // dose fraction from one segment (minutes at dBA). OSHA ignores levels below 80 dBA.
  function segDose(L, minutes, s) {
    if (!(minutes > 0) || L < s.threshold) return 0;
    return (minutes / 60) / allowedHours(L, s);
  }
  function dose(segs, s) {
    var d = 0, i;
    for (i = 0; i < segs.length; i++) d += segDose(segs[i].db, segs[i].min, s);
    return d * 100;
  }
  // 8-hour equivalent level from dose percent: L = criterion + exchange*log2(D/100)
  function twa(dosePct, s) {
    if (dosePct <= 0) return null;
    return s.criterion + s.exchange * Math.log(dosePct / 100) / Math.log(2);
  }
  // minutes still available at level L before reaching 100% dose
  function minutesLeft(segs, L, s) {
    var d = dose(segs, s);
    if (d >= 100) return 0;
    if (L < s.threshold) return Infinity;
    return (1 - d / 100) * allowedHours(L, s) * 60;
  }
  function status(dn) {
    if (dn < 50) return 'low';
    if (dn < 100) return 'watch';
    return 'over';
  }
  function analyze(segs) {
    var clean = segs.filter(function (x) { return x.min > 0 && isFinite(x.db); });
    var n = dose(clean, STANDARDS.niosh), o = dose(clean, STANDARDS.osha);
    var top = null, i, dn;
    for (i = 0; i < clean.length; i++) {
      dn = segDose(clean[i].db, clean[i].min, STANDARDS.niosh) * 100;
      if (!top || dn > top.dose) top = { name: clean[i].name || (clean[i].db + ' dBA'), dose: dn };
    }
    return {
      totalMinutes: clean.reduce(function (a, x) { return a + x.min; }, 0),
      niosh: n, osha: o,
      nioshTWA: twa(n, STANDARDS.niosh), oshaTWA: twa(o, STANDARDS.osha),
      nioshStatus: status(n), oshaStatus: status(o),
      top: top, topShare: top && n > 0 ? top.dose / n : 0
    };
  }
  var api = { STANDARDS: STANDARDS, allowedHours: allowedHours, segDose: segDose, dose: dose, twa: twa, minutesLeft: minutesLeft, analyze: analyze, round: r };
  if (typeof module !== 'undefined' && module.exports) module.exports = api; else root.NoiseDose = api;
})(typeof window !== 'undefined' ? window : this);
