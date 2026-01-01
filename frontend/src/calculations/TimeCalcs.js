import FetchData from '../DAL/FetchData';
import { supabase } from '../supabaseClient';

export default class TimeCalcs {
  static async getTimeHeaders() {
    let formattedTimePeriods = [];

    const orgID = await FetchData.loggedInOrgID();

    const { data, error } = await supabase
      .from('Organisation')
      .select('*')
      .eq('OrganisationID', orgID)
      .single();

    if (error || !data) {
      console.error('Error fetching organization data:', error);
      return [];
    }

    const timePeriods = [];
    const dateBase = "2025-01-01";
    const interval = data.IntervalDuration;

    // Helper to format time as HH:mm
    const getT = (dateVar) =>
      dateVar.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });

    // Renamed currentTime to startTime
    let startTime = new Date(`${dateBase}T${data.StartTime}`);
    const endTime = new Date(`${dateBase}T${data.FinishTime}`);

    // Helpers for comparison
    const breakStartStr = data.BreakStart.substring(0, 5);
    const lunchStartStr = data.LunchStart.substring(0, 5);
    const lunchEndStr = data.LunchEnd.substring(0, 5);
    let lunchEnd = new Date(`${dateBase}T${data.LunchEnd}`)
    let lunchStart = new Date(`${dateBase}T${data.LunchStart}`)


    // Push the very first starting point
    timePeriods.push(getT(startTime));

    while (startTime < endTime) {
      // Create a temporary object to find the end of the current slot
      let temporaryNext = new Date(startTime);
      temporaryNext.setMinutes(temporaryNext.getMinutes() + interval);
      let nextSlotStr = getT(temporaryNext);

      // 1. Handle Lunch Logic
      if (nextSlotStr === lunchStartStr) {
        timePeriods.push(lunchStartStr); // End before lunch

        temporaryNext.setMinutes(temporaryNext.getMinutes() + interval);
        nextSlotStr = getT(temporaryNext);
        startTime = temporaryNext;
        timePeriods.push(getT(startTime));

        startTime = lunchEnd;
        timePeriods.push(getT(startTime)); // Resume after lunch
      }
      // 2. Handle Break Logic
      else if (nextSlotStr === breakStartStr) {
        timePeriods.push(breakStartStr); // End before break

        startTime = new Date(`${dateBase}T${data.BreakEnd}`);
        timePeriods.push(getT(startTime)); // Resume after break
      }
      // 3. Regular Interval
      else {
        startTime = temporaryNext;
        timePeriods.push(getT(startTime));
      }
    }

    // Generate the "Start - End" strings
    lunchStart.setMinutes(lunchStart.getMinutes() + interval);

    for (let index = 0; index < timePeriods.length - 1; index++) {
      let timeOne = timePeriods[index];
      let timeTwo = timePeriods[index + 1];

      // Skip the actual break/lunch duration from the final list
      if (timeOne === breakStartStr) {
        continue;
      }

      if (timeOne === getT(lunchStart)) {
          continue;
      }

      formattedTimePeriods.push(`${timeOne} - ${timeTwo}`);
    }

    console.log("Raw Time Points:", timePeriods);
    return formattedTimePeriods;
  }
}