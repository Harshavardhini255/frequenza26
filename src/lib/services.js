import { supabase, isSupabaseEnabled } from "./supabase";
import { EVENTS, DEFAULT_SETTINGS, FALLBACK_COORDINATORS } from "../data/site";

const EVENTS_KEY = "frequenza_events_db_v3";
const SETTINGS_KEY = "frequenza_settings_fallback";
const COORDINATORS_KEY = "frequenza_coordinators_fallback_v3";

function mergeStaticFields(stored) {
  return stored.map((s) => {
    const fallback = EVENTS.find((o) => o.slug === s.slug || o.id === s.id);
    return fallback
      ? {
          ...s,
          rules: fallback.rules,
          description: fallback.description,
          tagline: fallback.tagline,
          coordinator_name: fallback.coordinator_name,
          coordinator_phone: fallback.coordinator_phone,
          coordinator_email: fallback.coordinator_email,
        }
      : s;
  });
}

export function getLocalEvents() {
  try {
    const raw =
      localStorage.getItem(EVENTS_KEY) || localStorage.getItem("frequenza_events_db");
    if (raw) {
      const parsed = mergeStaticFields(JSON.parse(raw));
      localStorage.setItem(EVENTS_KEY, JSON.stringify(parsed));
      return parsed;
    }
  } catch (err) {
    console.warn("Error loading local events store:", err);
  }
  localStorage.setItem(EVENTS_KEY, JSON.stringify(EVENTS));
  return EVENTS;
}

export function setLocalEvents(events) {
  try {
    localStorage.setItem(EVENTS_KEY, JSON.stringify(events));
  } catch (err) {
    console.warn("Error saving local events store:", err);
  }
}

export const eventService = {
  async getEvents() {
    let events = getLocalEvents();
    if (isSupabaseEnabled) {
      try {
        const { data, error } = await supabase
          .from("events")
          .select("*")
          .order("display_order", { ascending: true });
        if (!error && data && data.length > 0) events = data;
      } catch (err) {
        console.warn("Supabase fetch failed, using local storage fallback:", err);
      }
    }
    return mergeStaticFields(events);
  },

  async getEventBySlug(slug) {
    return (await this.getEvents()).find((e) => e.slug === slug) || null;
  },

  async createEvent(event) {
    if (isSupabaseEnabled) {
      try {
        const { data, error } = await supabase.from("events").insert([event]).select().single();
        if (!error && data) return data;
        if (error) throw error;
      } catch (err) {
        console.warn("Supabase create event failed, using local store:", err);
      }
    }
    const events = getLocalEvents();
    const created = {
      ...event,
      id: "event-" + Date.now(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    events.push(created);
    setLocalEvents(events);
    return created;
  },

  async updateEvent(id, patch) {
    if (isSupabaseEnabled) {
      try {
        const { data, error } = await supabase
          .from("events")
          .update(patch)
          .eq("id", id)
          .select()
          .single();
        if (!error && data) return data;
      } catch (err) {
        console.warn("Supabase update event failed, using local store:", err);
      }
    }
    const events = getLocalEvents();
    const index = events.findIndex((e) => e.id === id);
    if (index === -1) throw new Error("Event not found");
    const updated = { ...events[index], ...patch, updated_at: new Date().toISOString() };
    events[index] = updated;
    setLocalEvents(events);
    return updated;
  },

  async deleteEvent(id) {
    if (isSupabaseEnabled) {
      try {
        const { error } = await supabase.from("events").delete().eq("id", id);
        if (!error) return true;
      } catch (err) {
        console.warn("Supabase delete event failed:", err);
      }
    }
    setLocalEvents(getLocalEvents().filter((e) => e.id !== id));
    return true;
  },
};

export const settingsService = {
  async getSettings() {
    if (isSupabaseEnabled) {
      try {
        const { data, error } = await supabase.from("site_settings").select("*").single();
        if (!error && data) return data;
      } catch (err) {
        console.warn("Failed to fetch site settings from Supabase:", err);
      }
    }
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (raw) return JSON.parse(raw);
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(DEFAULT_SETTINGS));
    return DEFAULT_SETTINGS;
  },

  async updateSettings(patch) {
    const now = new Date().toISOString();
    const current = await this.getSettings();
    const merged = { ...current, ...patch, updated_at: now };
    if (isSupabaseEnabled) {
      try {
        const { data, error } = await supabase
          .from("site_settings")
          .update(patch)
          .eq("id", current.id)
          .select()
          .single();
        if (!error && data) return data;
      } catch (err) {
        console.warn("Failed to update site settings in Supabase:", err);
      }
    }
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(merged));
    return merged;
  },

  async updateRegistrationStatus(open) {
    return this.updateSettings({ registration_open: open });
  },

  async getCoordinators() {
    if (isSupabaseEnabled) {
      try {
        const { data, error } = await supabase
          .from("coordinators")
          .select("*")
          .order("display_order", { ascending: true });
        if (!error && data && data.length >= 4) return data;
      } catch (err) {
        console.warn("Failed to fetch coordinators from Supabase:", err);
      }
    }
    const raw = localStorage.getItem(COORDINATORS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed.length >= 4) return parsed;
    }
    localStorage.setItem(COORDINATORS_KEY, JSON.stringify(FALLBACK_COORDINATORS));
    return FALLBACK_COORDINATORS;
  },

  async saveCoordinator(coordinator) {
    const coordinators = await this.getCoordinators();
    if (coordinator.id) {
      const index = coordinators.findIndex((c) => c.id === coordinator.id);
      if (index !== -1) coordinators[index] = { ...coordinators[index], ...coordinator };
    } else {
      coordinators.push({
        id: `coord-${Date.now()}`,
        name: coordinator.name || "Coordinator",
        role: coordinator.role || "Event Coordinator",
        phone: coordinator.phone || "",
        email: coordinator.email,
        department: coordinator.department,
        is_student: coordinator.is_student ?? true,
        display_order: coordinators.length + 1,
      });
    }
    localStorage.setItem(COORDINATORS_KEY, JSON.stringify(coordinators));
    return coordinator;
  },
};
