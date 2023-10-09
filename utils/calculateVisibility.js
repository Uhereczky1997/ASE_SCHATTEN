const getOrientationOfObstacle = ({x1_value, y1_value, x2_value, y2_value}) => {
  if (Number(y1_value) === Number(y2_value)) {
    return 1; //Horizontal
  } else if (Number(x1_value) === Number(x2_value)) {
    return -1; //Vertical
  } else return 0;
};

const isPointInFrontOfObstacle = (point, obstacle) => {
  if (getOrientationOfObstacle(obstacle) === 0) {
    throw new Error("Keine Numbervergleiche");
  } else if (getOrientationOfObstacle(obstacle) === 1) {
    let bool =
      Number(obstacle.y1_value) < 0
        ? Number(point.y_value) > Number(obstacle.y1_value)
        : Number(point.y_value) < Number(obstacle.y1_value);
    console.log(
      bool + " obstacle:" + obstacle.y1_value + "<->point:" + point.y_value
    );
    return bool;
  } else {
    let bool =
      Number(obstacle.x1_value) < 0
        ? Number(point.x_value) > Number(obstacle.x1_value)
        : Number(point.x_value) < Number(obstacle.x1_value);
    console.log(bool + " " + obstacle.x1_value + "<" + point.x_value);
    return bool;
  }
};

const isPointVisible = (point, obstacle) => {
  const pointAngle =
    (Math.atan2(Number(point.y_value), Number(point.x_value)) * 360) /
    (2 * Math.PI);
  const obstacleAngle1 =
    (Math.atan2(Number(obstacle.y1_value), Number(obstacle.x1_value)) * 360) /
    (2 * Math.PI);
  const obstacleAngle2 =
    (Math.atan2(Number(obstacle.y2_value), Number(obstacle.x2_value)) * 360) /
    (2 * Math.PI);
  console.log(pointAngle);
  console.log(obstacleAngle1);
  console.log(obstacleAngle2);
  if (obstacleAngle1 > obstacleAngle2) {
    return pointAngle > obstacleAngle1 || obstacleAngle2 > pointAngle
      ? true
      : false;
  } else {
    return pointAngle > obstacleAngle2 || obstacleAngle1 > pointAngle
      ? true
      : false;
  }
};

const getVisibilePoints = async (pool) => {
  let points = await pool.query("select * from point");
  points = points.rows;

  let obstacles = await pool.query("select * from obstacle");
  obstacles = obstacles.rows;

  let visiblePoints = [...points];

  points.forEach((e, index1) => {
    obstacles.forEach((d, index2) => {
      console.log(
        e.id +
          "->" +
          isPointVisible(e, d) +
          " " +
          isPointInFrontOfObstacle(e, d)
      );
      if (!isPointInFrontOfObstacle(e, d) && !isPointVisible(e, d)) {
        visiblePoints = visiblePoints.filter((c) => {
          return Number(c.id) !== Number(e.id);
        });
      }
    });
  });

  return visiblePoints;
};
const getInvisibilePoints = async (pool, visiblePoints) => {
  var insertStatement = `Select * from point where id not in(${visiblePoints[0].id}`;
  visiblePoints.forEach((e) => {
    insertStatement += `,${e.id}`;
  });
  insertStatement += `)`;
  console.log(insertStatement);
  let dbResponse = pool.query("S");
};

module.exports = {
  getInvisibilePoints,
  getVisibilePoints,
};
