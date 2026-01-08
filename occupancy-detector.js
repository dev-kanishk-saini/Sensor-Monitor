export function createOccupancyDetector({
  absenceDelayMs = 3000 // absence confirmation delay
}) {
  let occupied = false;
  let absenceTimer = null;

  function anyGateAbove(values, thresholds) {
    return values.some((v, i) => v > thresholds[i]);
  }

  function allGatesBelow(values, thresholds) {
    return values.every((v, i) => v <= thresholds[i]);
  }

  return function processAvgData({
    m_avg,
    s_avg,
    motion_thres,
    static_thres
  }) {

    /* ---------------- PRESENCE LOGIC ---------------- */
    if (anyGateAbove(m_avg, motion_thres)) {
      if (!occupied) {
        occupied = true;
        console.log("✅ PRESENCE DETECTED");
      }

      // cancel absence countdown if motion appears
      if (absenceTimer) {
        clearTimeout(absenceTimer);
        absenceTimer = null;
      }

      return occupied;
    }

    /* ---------------- ABSENCE CANDIDATE ---------------- */
    if (
      occupied &&
      allGatesBelow(m_avg, motion_thres) &&
      allGatesBelow(s_avg, static_thres)
    ) {
      if (!absenceTimer) {
        console.log("⏳ Absence candidate... waiting");

        absenceTimer = setTimeout(() => {
          occupied = false;
          absenceTimer = null;
          console.log("❌ ABSENCE CONFIRMED");
        }, absenceDelayMs);
      }
    } else {
      // static or noise still present → cancel absence
      if (absenceTimer) {
        clearTimeout(absenceTimer);
        absenceTimer = null;
      }
    }

    return occupied;
  };
}
