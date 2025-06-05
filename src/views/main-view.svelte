<script lang="ts">
  import { type View } from "../consts/views";
  import Architecture from "../components/architecture.svelte";
  import Contact from "../components/contact.svelte";
  import Content from "../components/content.svelte";
  import Experience from "../components/experience.svelte";
  import Intro from "../components/intro.svelte";
  import { session } from "../stores/actors.svelte.ts";

  interface Props {
    view: View;
  }
  const { view }: Props = $props();

  session.send({ type: "NAVIGATE", view });
</script>

{#if session.state.matches({ journey: "architecture" })}
  <Content>
    <Architecture />
  </Content>
{:else if session.state.matches({ journey: "contact" })}
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
