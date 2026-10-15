<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Data access goes through the browser Cloud client with RLS (queries in `src/lib/drills.ts`); signed-in pages live under `src/routes/_authenticated/` (client-only gate) — keeps logic simple for an internal coach tool.
- YouTube link parsing lives only in `src/lib/youtube.ts` (tested in `src/test/youtube.test.ts`) — one place to support new URL formats.
