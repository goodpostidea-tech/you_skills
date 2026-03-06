#!/usr/bin/env node
import { startServer } from "./server/index.js";
import { BASE_URL } from "./constants.js";
import open from "open";

startServer();

// 延迟打开浏览器，确保服务已监听
setTimeout(() => {
  open(BASE_URL).catch(() => {
    console.log(`请手动打开: ${BASE_URL}`);
  });
}, 500);
