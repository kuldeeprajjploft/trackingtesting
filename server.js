const express = require("express");

const app = express();
const PORT = 3000;

app.use(express.static(__dirname));

app.get("/api/live-share", async (req, res) => {

  console.log("live not clound service");

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
  console.log("cloud service");

  const token = req.query.uuid || "s5tt9FUHRGuuS3yDMUEH";

  try {
    // 1️⃣ Fetch CSRF + session cookie
    const csrfRes = await fetch(
      "https://us6-ws.cloud.samsara.com/r/auth/csrf",
      {
        headers: {
          "Accept": "application/json",
          "Origin": "https://cloud.samsara.com",
          "Referer": "https://cloud.samsara.com",
          "User-Agent": "Mozilla/5.0"
        }
      }
    );

    const { csrf_token } = await csrfRes.json();
    const cookie = csrfRes.headers.get("set-cookie");

    if (!csrf_token || !cookie) {
      return res.status(500).json({ error: "Failed to get CSRF or Cookie" });
    }

    // 2️⃣ GraphQL FleetViewer call
    const response = await fetch(
      "https://us6-ws.cloud.samsara.com/r/graphql?q=FleetViewer",
      {
        method: "POST",
        headers: {
          "Accept": "application/json; version=2",
          "Content-Type": "application/json",
          "Origin": "https://cloud.samsara.com",
          "Referer": "https://cloud.samsara.com",
          "User-Agent": "Mozilla/5.0",
          "X-CSRF-Token": csrf_token,
          "Cookie": cookie
        },
        body: JSON.stringify({
          query: `
            query FleetViewer($token: String!, $duration: Int64!) {
              fleetViewerToken(token: $token) {
                ...FleetViewerInfo
              }
            }

            fragment FleetViewerInfo on FleetViewerToken {
              description
              devices(feature: "fleetTrackable") {
                ...FleetViewerDevice
              }
              destinationName
              destinationAddress: address
              destinationLatitude: latitude
              destinationLongitude: longitude
              group { id }
              organization {
                name
                logoType
                logoDomain
                logoS3Location
              }
            }

            fragment FleetViewerDevice on Device {
              name
              id
              orgId
              location: fleetViewerLocation(duration: $duration) {
                time
                latitude
                longitude
                heading
                speed
                formatted
                locationSource
                accuracyMillimeters
              }
              engineState: objectStat(
                statTypeEnum: osDEngineState
                duration: $duration
              ) {
                time: changedAtMs
                value: intValue
              }
              isAsset: hasFeature(featureKey: freight)
              deviceCable {
                powerStatusEvents(invalidateIfStale: true) {
                  isOn
                }
              }
              currentDriver {
                id
                name
              }
              tagMapMarkerColor
              unpoweredDormantSince: objectStat(
                statTypeEnum: osDUnpoweredDormantSinceMs
                duration: $duration
              ) {
                value: intValue
              }
              hasLocationAdvertisement: hasFeature(
                featureKey: location_advertisement
              )
            }
          `,
          variables: {
            token: token,
            duration: 30000
          },
          extensions: {
            route: "/o/:org_id/fleet/viewer/:token",
            orgId: "29533",
            diffBase: "003e6446-3263-48dc-9ea1-4c0c5142cfbc",
            stashOutput: true,
            storeDepSet: true
          }
        })
      }
    );

    const raw = await response.text();
    console.log("RAW RESPONSE:", raw);

    res.status(response.status).send(raw);

  } catch (err) {
    console.error("cloud error:", err);
    res.status(500).json({ error: err.message });
  }
});



app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
