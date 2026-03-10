const MONTHLY_LIMIT = 500;

let callCount = 0;
let resetMonth = new Date().getMonth();

export function checkPlacesLimit(callsNeeded: number = 1): boolean {
  const currentMonth = new Date().getMonth();
  if (currentMonth !== resetMonth) {
    callCount = 0;
    resetMonth = currentMonth;
  }
  if (callCount + callsNeeded > MONTHLY_LIMIT) return false;
  callCount += callsNeeded;
  return true;
}

export function getPlacesUsage(): { used: number; limit: number } {
  const currentMonth = new Date().getMonth();
  if (currentMonth !== resetMonth) {
    callCount = 0;
    resetMonth = currentMonth;
  }
  return { used: callCount, limit: MONTHLY_LIMIT };
}
