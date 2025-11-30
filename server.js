import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

// =====================
//   CREATE (POST)
// =====================
app.post("/weather", async (req, res) => {
  const { city, temperature_c } = req.body;

  if (!city || temperature_c === undefined) {
    return res.status(400).json({ error: "city e temperature_c são obrigatórios" });
  }

  const { data, error } = await supabase
    .from("weather_history")
    .insert([{ city, temperature_c }])
    .select();

  if (error) return res.status(400).json({ error });

  res.json(data[0]);
});

// =====================
//   READ (GET by city)
// =====================
app.get("/weather/:city", async (req, res) => {
  const { city } = req.params;

  const { data, error } = await supabase
    .from("weather_history")
    .select("*")
    .eq("city", city)
    .order("measured_at", { ascending: false });

  if (error) return res.status(400).json({ error });

  res.json(data);
});

// =====================
//   READ (GET ALL)
// =====================
app.get("/weather", async (req, res) => {
  const { data, error } = await supabase
    .from("weather_history")
    .select("*")
    .order("measured_at", { ascending: false });

  if (error) return res.status(400).json({ error });

  res.json(data);
});

// =====================
//   UPDATE (PUT)
// =====================
app.put("/weather/:id", async (req, res) => {
  const { id } = req.params;
  const { city, temperature_c } = req.body;

  const { data, error } = await supabase
    .from("weather_history")
    .update({ city, temperature_c })
    .eq("id", id)
    .select();

  if (error) return res.status(400).json({ error });

  res.json(data[0]);
});

// =====================
//   DELETE (DELETE)
// =====================
app.delete("/weather/:id", async (req, res) => {
  const { id } = req.params;

  const { error } = await supabase
    .from("weather_history")
    .delete()
    .eq("id", id);

  if (error) return res.status(400).json({ error });

  res.json({ message: "Registro deletado com sucesso" });
});

// =====================
app.listen(process.env.PORT, () =>
  console.log("API rodando na porta " + process.env.PORT)
);
