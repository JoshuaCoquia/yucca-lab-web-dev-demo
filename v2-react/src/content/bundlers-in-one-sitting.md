---
title: "Bundlers in One Sitting"
date: "2025-09-14"
tags: ["tooling"]
excerpt: "What a bundler actually does, why you cannot just ship your source files, and where the build step comes from."
slug: "bundlers-in-one-sitting"
---

A browser cannot run your JSX, your TypeScript, or your hundred separate module files efficiently. A bundler walks your import graph, transforms each file into something browsers understand, and stitches the result into a small number of optimized assets. That is the build step everyone complains about.

The moment you add a framework, you inherit this machinery whether you wanted it or not. The cost is real — install time, config, a `node_modules` folder you do not read — but so is the payoff: modern syntax, code splitting, and assets sized for the network instead of for your filesystem.
