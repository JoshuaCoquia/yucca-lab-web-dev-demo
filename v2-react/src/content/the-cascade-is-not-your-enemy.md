---
title: "The Cascade Is Not Your Enemy"
date: "2025-11-02"
tags: ["frontend"]
excerpt: "Most CSS frustration comes from fighting specificity instead of understanding it. A short defense of the cascade."
slug: "the-cascade-is-not-your-enemy"
---

People reach for `!important` the moment a style does not apply, but the cascade is rarely the problem. Specificity is a scoring system: inline styles beat IDs, IDs beat classes, classes beat element selectors. Once you can read that score in your head, most "CSS is broken" moments resolve into "I wrote a more specific rule somewhere else."

The practical fix is almost always to lower specificity, not raise it. Flatten your selectors, lean on single-class rules, and let the source order do the tie-breaking it was designed to do. The cascade stops being an enemy the moment you stop trying to out-shout it.
