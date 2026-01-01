import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// --- USERS / AUTH ---
export const login = mutation({
  args: { email: v.string(), password: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();

    if (!user || user.password !== args.password) {
      return null;
    }
    return user;
  },
});

export const register = mutation({
  args: { email: v.string(), password: v.string(), name: v.string(), role: v.string() },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();
    
    if (existing) throw new Error("Email déjà utilisé");

    const id = await ctx.db.insert("users", args);
    return await ctx.db.get(id);
  },
});

export const getUser = query({
  args: { id: v.optional(v.id("users")) },
  handler: async (ctx, args) => {
    if (!args.id) return null;
    return await ctx.db.get(args.id);
  },
});

// --- MESSAGES ---
export const listMessages = query({
  handler: async (ctx) => {
    const messages = await ctx.db.query("messages").order("asc").take(100);
    
    // Jointure manuelle "rapide" pour récupérer les infos profil
    // Convex est si rapide qu'on peut souvent faire ça, ou dénormaliser.
    const messagesWithUser = await Promise.all(
      messages.map(async (msg) => {
        const user = await ctx.db.get(msg.user_id);
        return {
          ...msg,
          // On adapte au format attendu par le frontend (id string)
          id: msg._id, 
          user_id: msg.user_id,
          profile: user ? { name: user.name, role: user.role } : { name: "Inconnu", role: "élève" }
        };
      })
    );
    return messagesWithUser;
  },
});

export const sendMessage = mutation({
  args: { content: v.string(), user_id: v.id("users") },
  handler: async (ctx, args) => {
    await ctx.db.insert("messages", {
      user_id: args.user_id,
      content: args.content,
      created_at: new Date().toISOString(),
    });
  },
});

// --- ANNOUNCEMENTS ---
export const listAnnouncements = query({
  handler: async (ctx) => {
    const data = await ctx.db.query("announcements").order("desc").collect();
    return data.map(d => ({ ...d, id: d._id }));
  },
});

export const postAnnouncement = mutation({
  args: { title: v.string(), content: v.string(), priority: v.string() },
  handler: async (ctx, args) => {
    await ctx.db.insert("announcements", { ...args, created_at: new Date().toISOString() });
  },
});

export const deleteAnnouncement = mutation({
  args: { id: v.id("announcements") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});

// --- SCHEDULE ---
export const listSchedule = query({
  handler: async (ctx) => {
    const data = await ctx.db.query("schedule").collect();
    // Le tri par jour se fait côté client comme avant, ou ici si on mappe les jours
    return data.map(d => ({ ...d, id: d._id }));
  },
});

export const addScheduleItem = mutation({
  args: { day: v.string(), time: v.string(), subject: v.string(), room: v.string() },
  handler: async (ctx, args) => {
    await ctx.db.insert("schedule", args);
  },
});

export const deleteScheduleItem = mutation({
  args: { id: v.id("schedule") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});

// --- QUIZ ---
export const checkQuizSubmission = query({
  args: { user_id: v.id("users") },
  handler: async (ctx, args) => {
    const res = await ctx.db
      .query("quiz_results")
      .withIndex("by_user", (q) => q.eq("user_id", args.user_id))
      .order("desc")
      .first();
    
    if (res) return { ...res, id: res._id };
    return null;
  },
});

export const submitQuizResult = mutation({
  args: { user_id: v.id("users"), score: v.number(), total: v.number() },
  handler: async (ctx, args) => {
    await ctx.db.insert("quiz_results", {
      ...args,
      created_at: new Date().toISOString(),
    });
  },
});