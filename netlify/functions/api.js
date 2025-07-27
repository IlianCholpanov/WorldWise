const fs = require("fs");
const path = require("path");

const DATA_FILE = path.resolve(__dirname, "../../data/cities.json");

function readCities() {
  const fileData = fs.readFileSync(DATA_FILE, "utf-8");
  return JSON.parse(fileData);
}

function writeCities(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

exports.handler = async function (event) {
  const method = event.httpMethod;
  const id = event.queryStringParameters.id;

  try {
    if (method === "GET") {
      const cities = readCities();

      if (id) {
        const city = cities.find((c) => String(c.id) === id);
        if (!city) {
          return {
            statusCode: 404,
            body: JSON.stringify({ error: "City not found" }),
          };
        }

        return {
          statusCode: 200,
          body: JSON.stringify(city),
        };
      }

      // GET all cities
      return {
        statusCode: 200,
        body: JSON.stringify(cities),
      };
    }

    if (method === "POST") {
      const newCity = JSON.parse(event.body);
      const cities = readCities();

      // Generate new ID
      const newId = Math.max(0, ...cities.map((c) => c.id)) + 1;
      const cityWithId = { id: newId, ...newCity };
      cities.push(cityWithId);
      writeCities(cities);

      return {
        statusCode: 201,
        body: JSON.stringify(cityWithId),
      };
    }

    if (method === "DELETE") {
      if (!id) {
        return {
          statusCode: 400,
          body: JSON.stringify({ error: "City ID is required" }),
        };
      }

      let cities = readCities();
      const exists = cities.some((c) => String(c.id) === id);
      if (!exists) {
        return {
          statusCode: 404,
          body: JSON.stringify({ error: "City not found" }),
        };
      }

      cities = cities.filter((c) => String(c.id) !== id);
      writeCities(cities);

      return {
        statusCode: 204,
        body: "", // No content
      };
    }

    return {
      statusCode: 405,
      body: JSON.stringify({ error: "Method not allowed" }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: "Internal Server Error",
        details: error.message,
      }),
    };
  }
};
