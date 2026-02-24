# TPBLOG Frontend Structure

## Directory Architecture

```text
blog/
  index.html
  .nojekyll
  DEPLOY.md
  assets/
    css/
      main.css          # Entry stylesheet
      tokens.css        # Design tokens
      base.css          # Reset + global styles
      layout.css        # Header/layout grid
      sections.css      # Section-level UI styles
      effects.css       # Animation + motion styles
      responsive.css    # Responsive breakpoints
    js/
      main.js           # App bootstrap
      core/
        store.js        # Shared app state + storage keys
        i18n.js         # Bilingual system (zh/en)
        utils.js        # Utility helpers
      data/
        content.js      # Posts, knowledge cards, books, stats data
      features/
        static-sections.js  # Hero/topics/books/stats rendering
        posts.js            # Post list + filters
        knowledge.js        # Knowledge base search/tag filtering
        ideas.js            # Idea stream + local persistence
        weather.js          # Realtime weather + 7-day forecast
        effects.js          # Reveal/tilt/spotlight/counter effects
```

## Capability Summary

- Bilingual switch: Chinese/English runtime toggle.
- Knowledge base mode: keyword search + tag filtering.
- Idea stream: local posting and persistence (`localStorage`).
- Live weather: geolocation, current weather, and 7-day forecast.
- Motion system: reveal transitions, orbital hero, card tilt, spotlight.
