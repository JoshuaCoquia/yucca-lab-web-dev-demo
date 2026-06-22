# YuCCA Lab Web Dev Demo

## Prerequisites

* Install [Node.js](https://nodejs.org/en/download)
    * For this demo, feel free to just use the prebuilt Node.js installation.
    * If you want to do more serious work with web development or Node.js, use either a package manager on your system (ex. Chocolately) or install a Node version manager like:
        * [nvm-windows (for Windows)](https://github.com/coreybutler/nvm-windows)
        * [nvm (for macOS/Linux)](https://github.com/nvm-sh/nvm#installing-and-updating)
* Install [pnpm](https://pnpm.io/installation#using-corepack)

## Setup

To start, download this git repo onto your device, then `cd` into it.
```
git clone https://github.com/JoshuaCoquia/yucca-lab-web-dev-demo.git
cd yucca-lab-web-dev-demo
```

Directions for then setting up each individual project within this repo are below.

### v1-basic

No setup required; view the [HTML file](./v1-basic/index.html) within this project directly in your web browser.


### v2-react

1. Move into the `v2-react` directory:
```
cd v2-react
```
2. Install project dependencies using `pnpm`:
```
pnpm install
```
3. Run the dev server:
```
pnpm dev
```
4. Go to the URL listed by the dev server. Defaults to https://localhost:5173


### v3-nextjs

1. Move into the `v3-nextjs` directory:
```
cd v3-nextjs
```
2. Install project dependencies using `pnpm`:
```
pnpm install
```
3. Run the dev server to view the website:
```
pnpm dev
```
4. Go to the URL listed by the dev server. Defaults to https://localhost:3000
