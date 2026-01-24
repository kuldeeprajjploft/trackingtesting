const express = require("express");

const app = express();
const PORT = 3000;

app.use(express.static(__dirname));

app.get("/api/live-share", async (req, res) => {
  const uuid = req.query.uuid;
  if (!uuid) {
    return res.status(400).json({ error: "uuid is required" });
  }

  try {
    const response = await fetch(
      `https://api.keeptruckin.com/api/s1/live_shares?type=v&uuid=${uuid}`,
      {
        headers: {
          "Accept": "application/json, text/plain, */*",
          "Origin": "https://tracking.gomotive.com",
          "Referer": "https://tracking.gomotive.com",
          "User-Agent": "Mozilla/5.0",
          "X-Web-Share-Api-Key": "3gCAa2VxLV3nlJfk7EhzJUEe5lg3IU9b50sNyOfUSSE6Fg2ACZr6GK5KqpMW55rn"
        }
      }
    );

    const data = await response.json();
    res.send(data);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/live-share-clound", async (req, res) => {
  console.log('clound service')
  const uuid = req.query.uuid;
  if (!uuid) {
    return res.status(400).json({ error: "uuid is required" });
  }

  try {
    const response = await fetch(`https://cloud.samsara.com/o/29533/fleet/viewer/tdmbHrRrIBcD9AOQcYrg`,
      {
        headers: {
          "Accept": "application/json, text/plain, */*",
          "Origin": "https://cloud.samsara.com",
          "Referer": "https://cloud.samsara.com",
          "User-Agent": "Mozilla/5.0",
          "X-Web-Share-Api-Key": "3gCAa2VxLV3nlJfk7EhzJUEe5lg3IU9b50sNyOfUSSE6Fg2ACZr6GK5KqpMW55rn"
        }
      }
    );
    console.log('clound response');
    console.log(response);

    const data = await response.json();
    res.send(data);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
