import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    email: v.string(),
    password: v.string(), // Dans un cas réel, on utiliserait Convex Auth, ici on simule pour la migration simple
    name: v.string(),
    role: v.string(), // "élève" | "professeur"
    token: v.optional(v.string()),
  }).index("by_email", ["email"]),

  messages: defineTable({
    user_id: v.id("users"),
    content: v.string(),
    is_mandarin: v.optional(v.boolean()),
    pinyin: v.optional(v.string()),
    created_at: v.string(), // ISO string pour simplifier le tri frontend existant
  }),

  announcements: defineTable({
    title: v.string(),
    content: v.string(),
    priority: v.string(), // "NORMAL" | "URGENT"
    created_at: v.string(),
  }),

  schedule: defineTable({
    day: v.string(),
    time: v.string(),
    subject: v.string(),
    room: v.string(),
  }),

  quiz_results: defineTable({
    user_id: v.id("users"),
    score: v.number(),
    total: v.number(),
    created_at: v.string(),
  }).index("by_user", ["user_id"]),
});