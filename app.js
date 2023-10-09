//imports
const express = require("express");
const pg = require("pg");
const pointsJson = require("./points.json");
const obstacleJson = require("./obstacle.json");
const {
  getInvisibilePoints,
  getVisibilePoints,
} = require("./utils/calculateVisibility");

//expres inti
const app = express();
const port = 8080;
app.use(express.json());

//pg init
const pool = new pg.Pool({
  user: "postgres",
  password: "1234",
  host: "localhost",
  port: "5432",
  database: "ase_schatten",
});

app.listen(port, () => {
  console.log("running on port: " + port);
});

//queries
const schwul = {
  Table_Point:
    "CREATE TABLE point(id bigint PRIMARY_KEY,x_value bigint,y_value bigint,name text)",
  Table_Obstacle:
    "CREATE TABLE obstacle(id bigint NOT NULL,x1_value bigint, y1_value bigint, x2_value bigint, y2_value bigint, name text, CONSTRAINT obstacle_pkey PRIMARY KEY (id))",
};

//endpunkte
app.get("/", async (req, res) => {
  try {
    const dbResponse = await pool.query(schwul.Table_Obstacle);
    console.log(dbResponse.command);
  } catch (error) {
    console.log(error);
    return res.status(400).json({error: error});
  }
});

app.get("/obstacles", async (req, res) => {
  try {
    const dbResponse = await pool.query("select * from obstacle");
    console.log(dbResponse.command);
    return res.status(200).json(dbResponse.rows);
  } catch (error) {
    console.log(error);
    return res.status(400).json({error: error});
  }
});

app.get("/points", async (req, res) => {
  try {
    const dbResponse = await pool.query("select * from point");
    console.log(dbResponse.command);
    return res
      .status(200)
      .json({size: dbResponse.rows.size, points: dbResponse.rows});
  } catch (error) {
    console.log(error);
    return res.status(400).json({error: error});
  }
});

app.post("/obstacles", async (req, res) => {
  const test = req.body;
  console.log(test);
  try {
    const dbResponse = await pool.query(
      "insert into obstacle (x1_value,y1_value,x2_value,y2_value,name) values ($1,$2,$3,$4,$5) returning *",
      [test.x1_value, test.y1_value, test.x2_value, test.y2_value, test.name]
    );
    console.log(dbResponse.command);
    return res.status(200).json(dbResponse.rows);
  } catch (error) {
    console.log(error);
    return res.status(400).json({error: error});
  }
});

app.post("/points", async (req, res) => {
  const test = req.body;
  console.log(test);
  try {
    const dbResponse = await pool.query(
      "insert into point (x_value,y_value,name) values ($1,$2,$3) returning *",
      [test.x_value, test.y_value, test.name]
    );
    console.log(dbResponse.command);
    return res.status(200).json({points: dbResponse.rows});
  } catch (error) {
    console.log(error);
    return res.status(400).json({error: error});
  }
});

app.get("/clear", async (req, res) => {
  try {
    const dbResponse = await pool.query(
      "delete from obstacle; delete from point;"
    );
    return res.status(200).send();
  } catch (error) {
    console.log(error);
    return res.status(500).send();
  }
});
app.get("/visible_points", async (req, res) => {
  try {
    const visiblePoints = await getVisibilePoints(pool);
    console.log(visiblePoints);
    //const invisiblePoints = getInvisibilePoints(pool, visiblePoints);
    //console.log(invisiblePoints);
    return res.status(200).json(visiblePoints);
  } catch (error) {
    console.log(error);
    return res.status(500).send();
  }
});

app.get("/init", async (req, res) => {
  try {
    var insertStatement = "BEGIN;\n";
    pointsJson.forEach((e) => {
      insertStatement += `INSERT INTO point (x_value,y_value) VALUES (${e.x_value},${e.y_value});\n`;
    });
    obstacleJson.forEach((e) => {
      insertStatement += `INSERT INTO obstacle (x1_value,y1_value,x2_value,y2_value) VALUES (${e.x1_value},${e.y1_value},${e.x2_value},${e.y2_value});\n`;
    });
    insertStatement = insertStatement + "COMMIT;";
    console.log(insertStatement);
    const dbResponse = await pool.query(insertStatement);
    return res.status(200).json(dbResponse.rows);
  } catch (error) {
    console.log(error);
    return res.status(500).send();
  }
});
