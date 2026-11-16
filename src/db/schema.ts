import {
  pgTable,
  serial,
  text,
  integer,
  boolean,
  timestamp,
  jsonb,
} from "drizzle-orm/pg-core";

export const questions = pgTable("questions", {
  id: serial("id").primaryKey(),
  category: text("category").notNull(),
  difficulty: text("difficulty").notNull(), // principiante | medio | avanzado
  text: text("text").notNull(),
  optionA: text("option_a").notNull(),
  optionB: text("option_b").notNull(),
  optionC: text("option_c").notNull(),
  correct: text("correct").notNull(), // "A" | "B" | "C"
  explanation: text("explanation"),
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const settings = pgTable("settings", {
  id: integer("id").primaryKey(), // always 1
  defaultDifficulty: text("default_difficulty").notNull().default("principiante"),
  secondsPerQuestion: integer("seconds_per_question").notNull().default(16),
  secondsPerPlayer: integer("seconds_per_player").notNull().default(120),
  questionsPerTurn: integer("questions_per_turn").notNull().default(10),
  allowDifficultyChoice: boolean("allow_difficulty_choice").notNull().default(true),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const games = pgTable("games", {
  id: serial("id").primaryKey(),
  difficulty: text("difficulty").notNull(),
  players: jsonb("players").notNull().$type<
    { name: string; avatar: string; score: number; correct: number; timeMs: number }[]
  >(),
  winner: text("winner"),
  finished: boolean("finished").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export type Question = typeof questions.$inferSelect;
export type NewQuestion = typeof questions.$inferInsert;
export type Settings = typeof settings.$inferSelect;
export type Game = typeof games.$inferSelect;
