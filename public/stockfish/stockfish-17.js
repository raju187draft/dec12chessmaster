// Stockfish 17 WASM loader - minimal stub that loads from CDN
// This file initializes Stockfish from the official CDN

;(() => {
  const STOCKFISH_CDN = "https://cdn.jsdelivr.net/npm/stockfish.wasm@1.0.0/stockfish.js"

  let stockfish = null
  const messageHandler = null

  self.onmessage = (e) => {
    if (!stockfish) {
      // Load Stockfish from CDN
      importScripts(STOCKFISH_CDN)
      stockfish = window.Stockfish()
      stockfish.addMessageListener((line) => {
        self.postMessage(line)
      })
    }
    stockfish.postMessage(e.data)
  }
})()
