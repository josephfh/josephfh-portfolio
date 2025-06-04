# josephhughes.info (work in progress)

## What is this?

Hi, I'm a frontend developer / architect / holistic UX engineer. This site has a tiny bit of information about me with some links to LinkedIn and GitHub.

It's also over-engineered: an excuse for me to make something with Astro/Svelte 5 and is event driven, has some SPA-like routing, and has global context running through a state machine.

## Why?

I like demoing XState and the Stately inspector. Also if I get some time I'll add the easter egg I've been planning for a while.

## Why?!

I like Astro a lot. For certain web apps, it's the perfect scaffolding to have your SPA-lite / local-first client application run on top of while making SEO and performance a priority.

## WHY?!!!

I like state machines and event driven architecture a lot. Once you make the decision to keep the UI layer free of all "business logic" then you are naturally going to use framework agnostic libraries and lean on slower moving technologies: web APIs and TypeScript. State machines, while unfamiliar in frontend coding, make complex logic and complex UI a lot less scary.

## HOW?!!!!111

Install [Bun](https://bun.sh/) (I can recommend [ASDF](https://asdf-vm.com/) if you haven't tried it)

### Take a look: development

Wow, Bun and Astro are fast. Run the following and visit [http://localhost:4321]( http://localhost:4321). You might notice your browser has blocked a pop-up... this is the inspector for the state machine which has opened in another window. (At the moment, the world's smallest state machine but you have to start somewhere).

```
bun dev
```

### Take a look: the built app

Astro.js does a great job here, and the client rehydration is easy and seamless. Considering how much _could_ be done with this set-up the final bundle size is more than acceptable.

```
bun build:app && bun preview
```

---

## Notes to myself

Netlify is not working well with Bun v1.2. For now, the older Ubuntu build image is being used.
