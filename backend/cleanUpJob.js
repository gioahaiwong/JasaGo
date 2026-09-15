const cron = require("node-cron");
const { db } = require("./database");

cron.schedule("* * * * *", () => {
  console.log(
    "Running cleanup job to delete unverified payments or cancelled orders older than 1 day.......",
  );

  const oneMinuteAgo = new Date();
  oneMinuteAgo.setMinutes(oneMinuteAgo.getMinutes() - 1);
  const dateString = oneMinuteAgo.toISOString().slice(0, 19).replace("T", " "); //ini artinya tanggal 1 menit yang lalu dalam format sqlite3
  db.run(
    `DELETE FROM orders WHERE status = 'cancelled' AND created_at < ?`,
    [dateString],
    function (err) {
      if (err) {
        console.error("❌ Cleanup error:", err);
      } else {
        console.log(
          `✅ ${this.changes} cancelled order(s) deleted (older than 1 day).`,
        );
      }
    },
  );

  const twoMinutesago = new Date();
  twoMinutesago.setMinutes(twoMinutesago.getMinutes() - 1);
  const twoMinutesAgoString = twoMinutesago
    .toISOString()
    .slice(0, 19)
    .replace("T", " ");
  db.run(
    `UPDATE payments SET status = 'failed' WHERE status = 'pending' AND created_at < ?`,
    [twoMinutesAgoString],
    function (err2) {
      if (err2) {
        console.error("❌ Cleanup error:", err2);
      } else {
        console.log(
          `✅ ${this.changes} unverified payment(s) deleted (older than 1 minute).`,
        );
        console.log(
          "Order Status Not Change, Provider's work is still valid and recorded!",
        );
      }
    },
  );
});

console.log("Cleanup Job Always Scheduled Completed!");
