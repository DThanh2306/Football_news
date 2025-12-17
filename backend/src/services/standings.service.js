const knex = require("../database/knex");
const ApiError = require("../api-error");

function emptyRow(club) {
  return {
    club_id: club.club_id,
    club_name: club.club_name,
    club_img: club.club_img,
    played: 0,
    won: 0,
    draw: 0,
    lost: 0,
    gf: 0,
    ga: 0,
    gd: 0,
    points: 0,
  };
}

async function getStandings({ league_id, season_id = null }) {
  try {
    if (!league_id) throw new ApiError(400, "league_id is required");

    // Lấy danh sách CLB thuộc league
    const clubs = await knex("club_league")
      .join("clubs", "club_league.club_id", "clubs.club_id")
      .where("club_league.league_id", league_id)
      .select("clubs.club_id", "clubs.club_name", "clubs.club_img");

    const table = new Map();
    for (const c of clubs) table.set(c.club_id, emptyRow(c));

    // Trận đã diễn ra (hoặc có tỉ số) trong league (+ season nếu có)
    const q = knex("matches")
      .where({ league_id })
      .whereNotNull("home_score")
      .whereNotNull("away_score");
    if (season_id) q.andWhere({ season_id });

    const matches = await q.select(
      "home_fc_id",
      "away_fc_id",
      "home_score",
      "away_score"
    );

    for (const m of matches) {
      // Bỏ qua nếu club không thuộc league table (an toàn)
      if (!table.has(m.home_fc_id) || !table.has(m.away_fc_id)) continue;
      const h = table.get(m.home_fc_id);
      const a = table.get(m.away_fc_id);

      h.played++; a.played++;
      h.gf += m.home_score; h.ga += m.away_score;
      a.gf += m.away_score; a.ga += m.home_score;

      if (m.home_score > m.away_score) {
        h.won++; a.lost++;
        h.points += 3;
      } else if (m.home_score < m.away_score) {
        a.won++; h.lost++;
        a.points += 3;
      } else {
        h.draw++; a.draw++;
        h.points += 1; a.points += 1;
      }
    }

    const rows = Array.from(table.values()).map(r => ({ ...r, gd: r.gf - r.ga }))
      .sort((x, y) => (
        y.points - x.points || (y.gd - x.gd) || (y.gf - x.gf) || x.club_name.localeCompare(y.club_name)
      ));

    return rows.map((r, idx) => ({ position: idx + 1, ...r }));
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(500, "Cannot compute standings", error);
  }
}

module.exports = { getStandings };
