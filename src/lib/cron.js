import cron from "cron";
import https from "https";

const job = new cron.CronJob("*/14 * * * *", function () {
  https
    .get(process.env.API_URL, (res) => {
      if (res.statusCode === 200) {
        console.log("Get request sent successfully");
      } else {
        console.log("Get request failed", res.statusCode);
      }
    })
    .on("error", (e) => console.error("Error while sending request", e));
});

export default job;

// CRON JOB EXPLANATION
// Cron jobs are scheduled tasks that run periodically at fixed intervals
// We want to send 1 GET request for every 14 minutes

// How to define a schedule
// You define a schedule using a cron expression, which consists of 5 fields representing

// ! Minute, Hour, Day of the month, Month, Day of the week

// Examples and Explanation
// */14* * * * -> every 14 minutes
// * 0 0 * * 0 -> At midnight on every sunday
// */30 3 15 * * -> At 3:30 AM on every 15th day of the month
// * 0 0 1 1 * -> At midnight on January 1st
// * 0 * * * * -> Every hour
