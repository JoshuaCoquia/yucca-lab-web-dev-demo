---
title: "We Are Rendering on the Server Again"
date: "2026-03-22"
tags: ["frontend"]
excerpt: "Server rendering left, single-page apps took over, and now rendering is moving back to the server. Here is why."
slug: "rendering-on-the-server-again"
---

The web rendered on the server for years, then single-page apps moved everything to the client for snappier navigation. The cost showed up later: blank initial loads, weak SEO, and shipping a small application just to display an article.

Meta-frameworks pulled rendering back to the server — or to build time — so the browser receives finished HTML and hydrates interactivity on top. View-source tells the whole story: an empty root element on a client-rendered app, real content on a server-rendered one. The pendulum did not swing back by accident.
