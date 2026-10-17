// Illustrative, deterministic routing rules inspired by GRAFT.
// No timing, cost or speed is modeled: only capability and remote policy.

function assessDevice(request, device) {
  const capable = device.capabilities.includes(request.capability);
  if (!capable) {
    return { id: device.id, eligible: false, reason: `Lacks the "${request.capability}" capability.` };
  }
  if (!device.local && !request.allowRemote) {
    return { id: device.id, eligible: false, reason: 'Remote device excluded: remote execution is off.' };
  }
  const where = device.local ? 'Local device' : 'Remote device, allowed by policy';
  return { id: device.id, eligible: true, reason: `${where}; supports "${request.capability}".` };
}

function firstEligible(candidates, devices, local) {
  const match = candidates.find((c, i) => c.eligible && devices[i].local === local);
  return match ? match.id : null;
}

export function evaluateRouting(request, devices) {
  const candidates = devices.map((device) => assessDevice(request, device));
  const selectedId = firstEligible(candidates, devices, true) ?? firstEligible(candidates, devices, false);
  return { selectedId, candidates };
}
