import fs from "node:fs/promises";

const databasePath = new URL("../db.json", import.meta.url);

export class Database {
  #database = {};

  constructor() {
    fs.readFile(databasePath, "utf8")
      .then((data) => {
        this.#database = JSON.parse(data);
      })
      .catch(() => {
        this.#persist();
      });
  }

  #persist() {
    fs.writeFile(databasePath, JSON.stringify(this.#database));
  }

  findById(table, id) {
    const rows = this.#database[table] ?? [];
    return rows.findIndex((row) => row.id === id);
  }

  select(table, search) {
    let data = this.#database[table] ?? [];

    if (search) {
      data = data.filter((row) => {
        return Object.entries(search).some(([key, value]) => {
          return row[key].toLowerCase().includes(value.toLowerCase());
        });
      });
    }

    return data;
  }

  insert(table, data) {
    if (Array.isArray(this.#database[table])) {
      this.#database[table].push(data);
    } else {
      this.#database[table] = [data];
    }

    this.#persist();

    return data;
  }

  update(table, id, data) {
    const rowIndex = this.findById(table, id);

    if (rowIndex > -1) {
      const currentRow = this.#database[table][rowIndex];

      const hasTitleChange =
        data.title !== undefined && data.title !== currentRow.title;

      const hasDescriptionChange =
        data.description !== undefined &&
        data.description !== currentRow.description;

      if (hasTitleChange || hasDescriptionChange)
        this.#database[table][rowIndex] = {
          ...currentRow,
          title: data.title ?? currentRow.title,
          description: data.description ?? currentRow.description,
          updated_at: new Date(),
        };

      this.#persist();
    }
  }

  updateStatus(table, id) {
    const rowIndex = this.findById(table, id);

    if (rowIndex > -1) {
      const currentRow = this.#database[table][rowIndex];

      const completeAt = currentRow.completed_at ? null : new Date();

      console.log(completeAt);

      this.#database[table][rowIndex] = {
        ...currentRow,
        completed_at: completeAt,
        updated_at: new Date(),
      };

      this.#persist();
    }
  }

  delete(table, id) {
    const rowIndex = this.findById(table, id);

    if (rowIndex > -1) {
      this.#database[table].splice(rowIndex, 1);
      this.#persist();
    }
  }
}
