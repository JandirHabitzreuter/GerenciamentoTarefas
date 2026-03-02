import fs from "node:fs";
import { parse } from "csv-parse";

const filePath = new URL("./tasks.csv", import.meta.url);

async function importTasks() {
  const parser = fs.createReadStream(filePath).pipe(
    parse({
      columns: true,
      trim: true,
      skip_empty_lines: true,
    }),
  );

  for await (const record of parser) {
    try {
      const response = await fetch("http://localhost:3333/tasks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: record.title,
          description: record.description,
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        console.error(
          `Erro ao importar "${record.title}": ${response.status} - ${error}`,
        );
        continue;
      }

      console.log(`Task "${record.title}" criada com sucesso.`);
    } catch (err) {
      console.error(`Erro de conexão ao importar "${record.title}":`, err);
    }
  }

  console.log("Importação finalizada.");
}

importTasks();
