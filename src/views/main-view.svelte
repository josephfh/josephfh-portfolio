<script lang="ts">
  import Contact from "../components/contact.svelte";
  import Experience from "../components/experience.svelte";
  import Intro from "../components/intro.svelte";
  import type { View } from "../consts/views";
  import { session } from "../stores/session.svelte.ts";
  import Content from "../components/content.svelte";
  interface Props {
    view: View;
  }
  const { view }: Props = $props();
  session.send({ type: "NAVIGATE", view });
</script>

{#if session.state.matches({ journey: "contact" })}
  <Content>
    <Contact />
  </Content>
{:else if session.state.matches({ journey: "intro" })}
  <Content>
    <Intro />
  </Content>
{:else if session.state.matches({ journey: "experience" })}
  <Content>
    <Experience />
  </Content>
{:else}
  <p>Not found</p>
{/if}
