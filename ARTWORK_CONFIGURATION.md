# Artwork configuration guide

This guide documents the route-artwork renderer used by `/visualizer/` and the
template definitions in `src/data/artwork-templates/*.template.json`.

There are two configuration layers:

1. **Run-time artwork settings**: values a visitor can change while designing
   an artwork: template, title, and distance units.
2. **Template settings**: values maintained by the site author in a template
   JSON file: output size, composition, colors, typography, shadows, and the
   statistics shown by default.

GPX data is parsed in the browser and is not written to the repository or to
public content data.

## The rendering pipeline

```text
GPX file
   │
   ├─ route/activity selection ──► projected route geometry
   ├─ unit selection ─────────────► formatted statistic values
   └─ template + title ───────────► SVG poster
                                      │
                                      ├─ background
                                      ├─ route
                                      ├─ title and rule
                                      ├─ statistic panel/grid
                                      └─ optional scale bar
```

The route is fitted into the available poster area. `routePadding` is a
minimum; the renderer also reserves space for the header and statistics block.
Consequently, increasing header or statistics spacing can make the route
smaller even when `routePadding` is unchanged.

## What visitors can configure

### Template

The template selector loads one complete definition. It changes the output
dimensions, composition, palette, route styling, statistics arrangement, and
optional effects as one coherent design.

The bundled templates currently are:

| ID | Shape | Main effect |
| --- | --- | --- |
| `classic` | A4 portrait, 2480 × 3508 | Light editorial poster with scale bar |
| `minimal` | A4 portrait, 2480 × 3508 | Route-first, no panel and no scale bar |
| `night-run` | A4 portrait, 2480 × 3508 | Dark gradient, distance-led panel, glow/shadows |
| `city-half-marathon-poster` | 620 × 445 | Compact digital finisher card |
| `stats` | A4 portrait, 2480 × 3508 | Metric-led purple poster |

The output size is template-owned. Visitors cannot independently change the
width or height from the current UI.

### Title

The title is optional. It is rendered only when it contains non-whitespace
text. It may contain at most 80 Unicode code points and two lines. A title
changes both the visible header and the route layout:

- the title is placed using `layout.header.title`;
- the header rule uses `yWithTitleRatio`;
- without a title, the rule uses `yWithoutTitleRatio`;
- the route receives the resulting header clearance automatically.

Example:

```text
With title                         Without title
┌──────────────────────┐           ┌──────────────────────┐
│       MORNING RUN    │           │                      │
│ ─────────────────────│           │ ─────────────────────│
│       route map      │           │       route map      │
└──────────────────────┘           └──────────────────────┘
```

The title's position, size, weight, and alignment come from the selected
template; the visitor only supplies its text.

### Distance units

`metric` formats distance/elevation as kilometres/metres and pace as
minutes per kilometre. `imperial` formats them as miles/feet and pace as
minutes per mile. Duration and timestamps are not converted by this setting.
The same unit is used by the scale bar when the selected template enables it.

### GPX route selection

The upload step determines which activity and route fragments are rendered.
Changing the selection changes:

- the path geometry;
- the calculated distance, time, pace, and elevation values;
- the automatic scale-bar value;
- the number of visible path fragments in the SVG description.

## Template file structure

Every template must use the `run-template-definition/v2` schema and contain:

```json
{
  "$schema": "run-template-definition/v2",
  "version": 2,
  "id": "my-template",
  "name": { "en": "My template", "de": "Meine Vorlage" },
  "description": { "en": "...", "de": "..." },
  "output": {},
  "layout": {},
  "appearance": {},
  "settings": { "shadows": {} },
  "editor": []
}
```

The registry validates every bundled file at module load time. Invalid colors,
ratios, dimensions, enum values, or missing required objects prevent the
template registry from loading.

## Output settings

| Field | Allowed value | Effect |
| --- | --- | --- |
| `output.widthPx` | Integer 320–10000 | SVG width, horizontal coordinate system, and proportional text/route sizing |
| `output.heightPx` | Integer 320–10000 | SVG height, vertical coordinate system, route fitting, and statistic placement |
| `output.sizeDescription` | Localized text | Human-readable size shown in the template picker; it does not change rendering |

Dimensions are independent of the preview's CSS display size. A 2480 × 3508
poster is scaled down in the browser but retains its larger SVG coordinate
system.

Localized text can be a string or an object with both `en` and `de` values:

```json
"name": { "en": "Night Run", "de": "Nachtlauf" }
```

## Layout settings

Ratios are multiplied by the relevant output dimension. For example, with a
width of 2480, `xRatio: 0.12` places an item at x = 297.6 px. Values described
as pixels are literal artwork pixels.

### Route

| Field | Effect |
| --- | --- |
| `layout.routePadding` | Minimum empty space around the projected route, in px |
| `route.strokeWidthRatio` | Route line width as a fraction of output width |
| `route.minStrokeWidth` | Lower bound for route line width, in px |
| `route.linecap` | End shape: `round`, `butt`, or `square` |
| `route.linejoin` | Corner shape: `round`, `bevel`, or `miter` |

Actual route width is `max(widthPx × strokeWidthRatio, minStrokeWidth)`. A
larger padding makes the route occupy less of the poster; a larger stroke makes
it more prominent and can obscure very dense tracks.

### Header and title

| Field | Effect |
| --- | --- |
| `header.title.xRatio` | Title x-position as a fraction of width |
| `header.title.yRatio` | Title baseline y-position as a fraction of height |
| `header.title.sizeRatio` | Title font size as a fraction of width |
| `header.title.weight` | Title weight; validated values are 400, 500, 600, or 700 |
| `header.title.anchor` | `start` left-aligns at x; `middle` centers at x |
| `header.rule.x1Ratio`, `x2Ratio` | Horizontal rule start/end positions |
| `header.rule.yWithTitleRatio` | Rule y-position when a title exists |
| `header.rule.yWithoutTitleRatio` | Rule y-position when the title is empty |
| `header.rule.strokeWidthRatio` | Rule thickness as a fraction of width, with a 1 px minimum |
| `header.rule.opacity` | Rule opacity from 0 to 1 |
| `header.routeTopPaddingRatio` | Extra route clearance below the header rule, as a fraction of height |

The rule uses `appearance.statisticColor`, not `textColor`.

### Statistics

The renderer supports these keys:

| Key | Rendered value |
| --- | --- |
| `distance` | Distance in the selected unit |
| `recordedTime` | Recorded duration |
| `pace` | Pace in the selected distance unit |
| `elevationGain` | Estimated ascent |
| `elevationLoss` | Estimated descent |
| `elevationRange` | Minimum–maximum elevation |
| `startTime` | Start timestamp, localized |
| `endTime` | End timestamp, localized |

| Field | Effect |
| --- | --- |
| `statistics.visibleStatistics` | Ordered list of statistics rendered by default |
| `statistics.columns` | Number of supporting-statistic columns; values are floored and at least 1 |
| `statistics.rowHeightRatio` | Supporting row height as a fraction of height |
| `statistics.minRowHeight` | Minimum supporting row height, in px |
| `statistics.blockTopPadding` | Space above the statistic block, in px |
| `statistics.bottomPaddingRatio` | Bottom reservation as a fraction of height |
| `statistics.rule.*` | Rule start/end, thickness, and opacity for the statistic section |
| `statistics.panel.enabled` | Adds a translucent panel behind the statistic section |
| `panel.xRatio`, `widthRatio` | Panel horizontal position and width |
| `panel.yOffset`, `bottomOffset` | Panel offsets from the statistic region, in px |
| `panel.opacity` | Panel opacity from 0 to 1 |
| `statistics.primaryMetric` | Optional large lead metric; must also be in `visibleStatistics` |
| `primary.labelSizeRatio` | Primary label size as a fraction of width |
| `primary.valueSizeRatio` | Primary value size as a fraction of width |
| `primary.valueYOffsetRatio` | Primary value baseline offset as a fraction of height |
| `primary.supportingOffsetRatio` | Supporting-grid offset below the primary metric, as a fraction of height |
| `supporting.startOffset` | Supporting-grid start offset from the statistic rule, in px |
| `supporting.columnXRatios` | X positions for supporting columns |
| `supporting.labelSizeRatio` | Supporting label size as a fraction of width |
| `supporting.valueSizeRatio` | Supporting value size as a fraction of width |

Example statistic compositions:

```text
No primary metric                    With primaryMetric: "distance"
┌────────────────────────┐           ┌────────────────────────┐
│ Distance       Time    │           │ Distance                │
│ 10.4 km         52:10  │           │ 10.4 km                 │
│ Pace           Gain    │           │ Time          Pace       │
│ 5:01 /km       120 m   │           │ 52:10         5:01 /km  │
└────────────────────────┘           └────────────────────────┘
```

If a statistic has no source value, the renderer displays `—`. If
`primaryMetric` is not present in `visibleStatistics`, it is ignored as a
primary metric and all selected values use the supporting grid.

### Scale bar

| Field | Effect |
| --- | --- |
| `scale.enabled` | Shows or hides the scale bar |
| `scale.xRatio` | Scale-bar left edge as a fraction of width |
| `scale.yOffset` | Distance from the bottom edge, in px |
| `scale.widthRatio` | Bar width as a fraction of width |
| `scale.strokeWidthRatio` | Bar thickness as a fraction of width |
| `scale.minStrokeWidth` | Minimum bar thickness, in px |
| `scale.labelOffset` | Gap between bar and label, in px |
| `scale.labelSizeRatio` | Label size as a fraction of width |

The scale label is calculated from the projected route and is displayed in the
selected distance unit. The bar is not a geographic north arrow or a fixed
map scale; it is a visual distance reference derived from the route extent.

## Appearance settings

All colors must be six-digit hex values such as `#13202A`.

| Field | Effect |
| --- | --- |
| `appearance.background` | Solid background color or linear gradient |
| `appearance.routeColor` | Route stroke color |
| `appearance.textColor` | Title and scale text color |
| `appearance.statisticColor` | Header rule, statistic panel/rule, and statistic text color |
| `appearance.footerColor` | Reserved footer color; the current renderer does not draw a footer |
| `appearance.titleFontFamily` | Currently must be `Source Serif 4` |
| `appearance.bodyFontFamily` | Currently must be `DM Sans` |
| `appearance.titleFontWeight` | Declared title weight; title layout weight is controlled by `header.title.weight` in the current renderer |
| `appearance.bodyFontWeight` | Validated template metadata; not currently applied to generated SVG text |
| `appearance.statisticLabelWeight` | Weight of statistic labels |
| `appearance.statisticValueWeight` | Weight of statistic values |
| `appearance.scaleWeight` | Weight of the scale label |

The two bundled fonts are loaded by the site, so the fixed font-family values
are intentional. Using a different family currently fails template validation.

### Solid backgrounds

```json
"background": "#FFFFFF"
```

The color fills the complete SVG canvas and the optional statistic panel uses
the same fill with its own opacity.

### Image backgrounds

An image background is loaded from the built site and placed behind the route,
title, statistics, and scale bar:

```json
"background": {
  "kind": "image",
  "src": "/images/route-paper.png",
  "opacity": 0.8,
  "fit": "cover"
}
```

| Field | Effect |
| --- | --- |
| `kind` | Must be `image` |
| `src` | URL/path to the image; files should be stored under `public/` |
| `opacity` | Image opacity from 0 to 1 |
| `fit` | `cover` fills the canvas and may crop; `contain` preserves the full image and may leave transparent space |

The image is an SVG `<image>` layer, so it does not replace the route or text
colors. Keep the source image large enough for the selected output dimensions;
the browser scales it to the poster canvas.

### Linear gradients

```json
"background": {
  "kind": "linear-gradient",
  "angle": 145,
  "stops": [
    { "color": "#071727", "position": 0 },
    { "color": "#102B42", "position": 100 }
  ]
}
```

`angle` is in degrees from 0 (inclusive) to 360 (exclusive). There must be 2–8
stops; each stop position is 0–100. The gradient is used for both the canvas
and a translucent statistics panel when that panel is enabled.

## Shadows

Shadows are declared under `settings.shadows` and can target `route`, `title`,
`statistics`, `scale`, or `footer`.

```json
"settings": {
  "shadows": {
    "route": {
      "enabled": true,
      "color": "#32C5BB",
      "blur": 18,
      "offsetX": 0,
      "offsetY": 0,
      "opacity": 0.65
    }
  }
}
```

| Field | Effect |
| --- | --- |
| `enabled` | Enables the target's SVG drop shadow |
| `color` | Shadow color |
| `blur` | Blur amount in artwork px; renderer uses half as SVG standard deviation |
| `offsetX`, `offsetY` | Shadow displacement in artwork px; negative values move up/left |
| `opacity` | Shadow opacity from 0 to 1 |

If a target is absent, it has no shadow. A shadow is skipped when disabled,
fully transparent, or has no blur/offset effect.

```text
No shadow                         Route shadow / glow
     ╱╲                                  ╱╲  · · ·
    ╱  ╲                                ╱  ╲ · · ·
───╱────╲───                       ───╱────╲──────
```

## Editor controls metadata

The `editor` array describes possible future or template-specific controls.
Each control has an `id`, localized `label`, `type`, and a dot-separated
`path`. Supported paths are:

- `content.headerText`
- `content.footerText`
- `content.headerMetaMetric`
- `content.metricSlots`
- `appearance.background`
- `appearance.routeColor`
- `appearance.textColor`
- `appearance.statisticColor`
- `appearance.footerColor`

Supported control types are:

| Type | Additional fields | Intended effect |
| --- | --- | --- |
| `text` | `maxLength` | Text content, bounded to 1–1000 characters |
| `metric` | none | Select a supported statistic |
| `metric-slots` | `minItems`, `maxItems`, `allowCustomLabels` | Configure a bounded list of metric slots |
| `color` | none | Choose a six-digit hex color |
| `linear-gradient` | `minStops`, `maxStops`, `allowAngle` | Configure gradient stops and optionally its angle |

At present, the visitor-facing artwork UI renders the built-in title and units
controls only. The `editor` array is validated and bundled, but is not yet a
generic form renderer. Adding an editor entry alone therefore does not create a
visible control or change the SVG.

## Safe template-editing workflow

1. Copy an existing `*.template.json` file and give it a lowercase kebab-case
   `id`.
2. Keep both English and German values for `name`, `description`, and
   `sizeDescription`.
3. Change output, layout, appearance, and shadows as needed.
4. Keep `visibleStatistics` non-empty and use unique supported statistic keys.
5. Run the test suite and production build:

   ```sh
   npm test
   npm run build
   ```

6. Preview both `/visualizer/` and `/de/visualizer/`, especially long titles,
   imperial units, missing statistics, and routes with multiple fragments.

The schema is versioned. If the contract changes, update the schema/version
and add migration support in `src/utils/artworkTemplateDefinition.ts` before
introducing a new template format.
