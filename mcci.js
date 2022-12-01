const fetch = require('node-fetch');
require("dotenv").config();

let players = [];

(async () => {
  await findPlayers("k6qwn3z6", "wk64j3ed", {}, "Badlands", "ldyzeg7w");
  await findPlayers("k6qwn3z6", "wk64j3ed", {}, "Beehive", "gdr3j2kd");
  await findPlayers("k6qwn3z6", "wk64j3ed", {}, "Cliff", "nwlj63g9");
  await findPlayers("k6qwn3z6", "wk64j3ed", {}, "Industry", "ywee4l4w");
  await findPlayers("k6qwn3z6", "wk64j3ed", {}, "Pits", "69zgrz4w");
  await findPlayers("k6qwn3z6", "wk64j3ed", {}, "Siege", "r9ggzx29");
  await findPlayers("k6qwn3z6", "wk64j3ed", {}, "Treetop", "ldyze27w");
  await findPlayers("k6qwn3z6", "wk64j3ed", {}, "Walls", "o9xe247w");
  await updateRuns("k6qwn3z6", "CATEGORY_TO_SUBMIT_TO", {}, 8);
})();

async function findPlayers(game, category, vars, mode, level) {
  const varMap = Object.entries(vars);
  const varString = varMap.length ? `?${varMap.map(([variable, option]) => `var-${variable}=${option}`).join("&")}` : "";
  const data = await (await fetch(`https://www.speedrun.com/api/v1/leaderboards/${game}${level ? `/level/${level}` : ''}/${level ? "" : "category/"}${category}${varString}`)).json();
  // Iterates through the runs in the category
  for (const run of data.data.runs) {
    // Iterates through each player in the run
    for (const player of run.run.players) {
      // If the player is a guest then skip
      if (player.rel == "user") {
        // If the player already exists in players then find
        // them and update their time if needed.
        const existingPlayer = players.find((p) => p.id === player.id);
        if (existingPlayer) {
          if (!existingPlayer.runs[mode]) {
            existingPlayer.runs[mode] = {
              time: run.run.times.primary_t,
              link: run.run.weblink
            };
          } else if (run.run.times.primary_t < existingPlayer.runs[mode]) {
            existingPlayer.runs[mode].time = run.run.times.primary_t;
            existingPlayer.runs[mode].link = run.run.weblink;
          }
        } else {
          players.push({
            id: player.id,
            runs: {
              [mode]: {
                time: run.run.times.primary_t,
                link: run.run.weblink
              }
            }
          });
        }
      }
    }
  }
}

async function updateRuns(game, category, vars, count) {
  const varMap = Object.entries(vars);
  const varString = varMap.length ? `?${varMap.map(([variable, option]) => `var-${variable}=${option}`).join("&")}` : "";

  const data = await (await fetch(`https://www.speedrun.com/api/v1/leaderboards/${game}/category/${category}${varString}`)).json();

  // Filters out only the players with a time in every category
  players = players.filter(player => Object.keys(player.runs).length === count);

  next:
  // Iterates through each player
  for (const player of players) {
    // Adds up their time
    const total = Object.values(player.runs).reduce((total, run) => total + run.time, 0).toFixed(3);
    // Goes through the runs and if any have a faster or same time then
    // skip this player.
    for (const run of data.data.runs) {
      if (run.run.players[0].id == player.id) {
        if (total - run.run.times.primary_t >= 0) {
          continue next;
        }
      }
    }
    // Creates the run
    const run = {
      run: {
        category,
        platform: "8gej2n93",
        verified: true,
        times: {
          realtime: parseFloat(total)
        },
        players: [
          {
            rel: "user",
            id: player.id
          }
        ],
        emulated: false,
        comment: Object.entries(player.runs).map(([mode, info]) => `${mode}: ${info.link}`).join("\n"),
        variables: varMap.reduce((variables, variable) => {
          variables[variable[0]] = {
            type: "pre-defined",
            value: variable[1],
          };
          return variables;
        }, {})
      }
    };
    // Submits the run
    await fetch("https://www.speedrun.com/api/v1/runs", {
      method: "post",
      body: JSON.stringify(run),
      headers: { "Content-Type": "application/json", "X-API-Key": process.env.SRC_API_KEY }
    });
  }
}