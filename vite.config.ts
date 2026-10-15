import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  tanstackStart: {
    server: { entry: "server" },
  },
  vite: {
    define: {
      "import.meta.env.VITE_SUPABASE_URL": JSON.stringify("https://cjfvhzweeaipojoinhnx.supabase.co"),
      "import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY": JSON.stringify("eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNqZnZoendlZWFpcG9qb2luaG54Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTIwMTA0MzksImV4cCI6MjEwNzU4NjQzOX0.yfWFc5VhO8qdSbQOlmgaol-vFea876lLKF20qT4KReM"),
    },
  },
});
