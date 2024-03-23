import * as Handlebars from 'express-handlebars';

type HelperFunction = (a?: any, b?: any) => any;

const register = (Handlebars) => {
  const helpers: { [key: string]: HelperFunction } = {
    eq: (a, b) => a === b,
    gt: (a, b) => a > b,
    gte: (a, b) => a >= b,
    lt: (a, b) => a < b,
    lte: (a, b) => a <= b,
    ne: (a, b) => a !== b,
    json: (a) => JSON.stringify(a),
    HrFormat: (a) => convertTo12HrFormat(a.toString()),
    lower: (a) => a.toString().toLowerCase(),
    upper: (a) => a.toString().toUpperCase(),
  };

  if (Handlebars && typeof Handlebars.registerHelper === "function") {
    for (const prop in helpers) {
      Handlebars.registerHelper(prop, helpers[prop]);
    }
  } else {
    return helpers;
  }
};
function convertTo12HrFormat(time: string): string {
    // Split the time into hours, minutes, and seconds
    let [hours, minutes, seconds] = time.split(':').map(Number);

    // Round to the nearest minute
    if (seconds >= 30) {
        minutes += 1;
    }

    // Adjust hours if minutes are 60
    if (minutes === 60) {
        minutes = 0;
        hours += 1;
    }

    // Determine AM or PM suffix
    let suffix = hours >= 12 ? 'PM' : 'AM';

    // Convert hours from 24-hour format to 12-hour format
    hours = hours % 12 || 12;

    // Return the formatted time
    return `${hours}:${minutes.toString().padStart(2, '0')} ${suffix}`;
}
export { register };
export const helpers = register(null);
