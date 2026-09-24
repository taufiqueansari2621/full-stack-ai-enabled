import { readdir, readFile, stat } from "node:fs/promises";
import path from "node:path";

const dist = path.resolve("dist");
const assets = path.join(dist, "assets");
const kib = 1024;
const budgets = {
  entryJavaScript: 500 * kib,
  entryCss: 160 * kib,
  lazyJavaScript: 140 * kib,
  totalJavaScript: 800 * kib,
};

const index = await readFile(path.join(dist, "index.html"), "utf8");
const files = await readdir(assets);
const sizes = new Map(
  await Promise.all(
    files.map(async (file) => [
      file,
      (await stat(path.join(assets, file))).size,
    ]),
  ),
);

const entryJavaScript = index.match(/src="\/assets\/(index-[^"]+\.js)"/)?.[1];
const entryCss = index.match(/href="\/assets\/(index-[^"]+\.css)"/)?.[1];
if (!entryJavaScript || !entryCss)
  throw new Error("Could not identify the hashed entry JavaScript and CSS.");

const jsFiles = files.filter((file) => file.endsWith(".js"));
const lazyFiles = jsFiles.filter((file) => file !== entryJavaScript);
const largestLazy = lazyFiles.reduce(
  (largest, file) =>
    (sizes.get(file) ?? 0) > (sizes.get(largest) ?? 0) ? file : largest,
  lazyFiles[0],
);
const measurements = {
  entryJavaScript: sizes.get(entryJavaScript) ?? 0,
  entryCss: sizes.get(entryCss) ?? 0,
  lazyJavaScript: sizes.get(largestLazy) ?? 0,
  totalJavaScript: jsFiles.reduce(
    (total, file) => total + (sizes.get(file) ?? 0),
    0,
  ),
};

const failures = Object.entries(measurements).filter(
  ([name, size]) => size > budgets[name],
);
const format = (bytes) => `${(bytes / kib).toFixed(1)} KiB`;
console.log(
  [
    `Entry JavaScript: ${format(measurements.entryJavaScript)} / ${format(budgets.entryJavaScript)}`,
    `Entry CSS: ${format(measurements.entryCss)} / ${format(budgets.entryCss)}`,
    `Largest lazy JavaScript (${largestLazy}): ${format(measurements.lazyJavaScript)} / ${format(budgets.lazyJavaScript)}`,
    `Total JavaScript: ${format(measurements.totalJavaScript)} / ${format(budgets.totalJavaScript)}`,
  ].join("\n"),
);
if (failures.length)
  throw new Error(
    `Bundle budget exceeded: ${failures
      .map(
        ([name, size]) => `${name} ${format(size)} > ${format(budgets[name])}`,
      )
      .join(", ")}`,
  );
