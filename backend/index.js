require('dotenv').config();

const Connection = require("./database/data-source"); 
const app = require("./app");

const PORT = process.env.PORT || 4000;

Connection.initialize()
    .then(() => {
        console.log("Data Source initialized");
        app.listen(PORT, () => {
            console.log(`Server running on http://localhost:${PORT}`);
        });
    })
    .catch((error) => {
        console.error("Error during Data Source initialization:", error);
    });
