const express = require("express");
const fs = require("fs");
const cors = require("cors");

// Load the generated JS wrapper
const MyModule = require("./myProg.js");

const app = express();
app.use(cors());
app.use(express.json());

// Create a promise that resolves when WASM is ready
let wasmModulePromise = MyModule({
    wasmBinary: fs.readFileSync("./myProg.wasm")
}).then((Module) => {
    console.log("Backend WASM loaded!");
    return Module;
});

// API endpoint
app.post("/api/compute", async (req, res) => {
    try {
        const { p, g, x } = req.body;

        if (!p || !g || !x) {
            return res.status(400).json({ error: "Missing p, g, x" });
        }

        // Wait until WASM is ready
        const Module = await wasmModulePromise;

        const modexp = Module.cwrap("modexp", "number",
            ["number", "number", "number"]
        );

        // Server picks b
        const b = Math.floor(Math.random() * (p - 1)) + 1;

        const y = modexp(g, b, p);
        const K = modexp(x, b, p);

        return res.json({ K, y });

    } catch (err) {
        console.error("SERVER ERROR:", err);
        return res.status(500).json({ error: err.toString() });
    }
});

app.listen(3000, () => {
    console.log("Server running on http://localhost:3000");
});
