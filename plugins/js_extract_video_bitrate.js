// Tdarr flow plugin — compare bitrate_k to cutoff (cutoff in bps)
// -> outputNumber 1 if bitrate_k >= cutoff (equal => 1)
// -> outputNumber 2 if bitrate_k < cutoff 
module.exports = async (args) => {
  const vars = args.variables || {};
  const rawBitrateK = vars.bitrate_k || '';
  const rawCutoff = vars.cutoff_4k_hdr || vars['cutoff_4k_hdr'] || '';

  const parseToBps = (raw) => {
    if (raw === undefined || raw === null) return NaN;
    const s = String(raw).trim();
    // if contains 'k' treat as kilobits
    const kMatch = s.match(/([0-9]+(?:[.,][0-9]+)?)\s*[kK]\b/);
    if (kMatch) return Math.round(parseFloat(kMatch[1].replace(',', '')) * 1000);
    // if contains bps or b/s treat as bits/sec
    const bpsMatch = s.match(/([0-9]+(?:[.,][0-9]+)?)\s*(?:b\/s|bps|bit[s]?)\b/i);
    if (bpsMatch) return Math.round(parseFloat(bpsMatch[1].replace(',', '')));
    // plain number: heuristic — small numbers (<10000) likely kbps, else bps
    const numMatch = s.match(/([0-9]+(?:[.,][0-9]+)?)/);
    if (!numMatch) return NaN;
    const num = parseFloat(numMatch[1].replace(',', ''));
    return num < 10000 ? Math.round(num * 1000) : Math.round(num);
  };

  const bitrateBps = parseToBps(rawBitrateK);
  const cutoffBps = parseToBps(rawCutoff);

  // if cutoff invalid, treat as 0 so files go to output 1
  const validCutoff = Number.isFinite(cutoffBps) && cutoffBps > 0 ? cutoffBps : 0;
  const validBitrate = Number.isFinite(bitrateBps) && bitrateBps > 0 ? bitrateBps : 0;

  const outputNumber = (validBitrate >= validCutoff) ? 1 : 2;

  return {
    outputFileObj: args.inputFileObj,
    outputNumber: outputNumber,
    variables: vars
  };
};