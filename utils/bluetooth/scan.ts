import { bleManager } from "./bleManager";

bleManager.startDeviceScan(null, null, (error, device) => {
  if (error) {
    console.error(error);
    return;
  }

  if (device?.name) {
    console.log("Found device:", device.name);
  }
});
