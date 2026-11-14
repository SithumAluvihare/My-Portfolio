# Portfolio — Sithum Aluvihare

Live site: https://sithumaluvihare.github.io/My-Portfolio/

Static site: `index.html`, `css/style.css`, `js/main.js`. No build step.

## Adding images

Drop a file with the right name into `assets/images/` and it replaces its placeholder
automatically. `.jpg`, `.jpeg`, `.png` and `.webp` all work. Use lowercase names and
extensions (`profile.jpg`, not `Profile.JPG`), because most web hosts are case-sensitive.

| File name | Where it appears | Shape |
| --- | --- | --- |
| `profile` | Hero, inside the chip | Portrait 4:5 |
| `about` | About, large photo | Portrait 4:5 |
| `about-2` | About, small overlapping photo | Square |
| `project-1` | AeroSync 5 (featured) | Landscape 16:10 |
| `project-2` | Crazyflie rebuild | Landscape 16:10 |
| `project-3` | FPGA reaction time tester | Landscape 16:10 |
| `project-4` | Self-balancing robot | Landscape 16:10 |
| `project-5` | Water monitoring systems | Landscape 16:10 |
| `project-6` | Health and posture monitor | Landscape 16:10 |
| `project-7` | SkillShare website | Landscape 16:10 |
| `project-8` | Energy audit | Landscape 16:10 |
| `project-9` | Hospital management system | Landscape 16:10 |
| `activity-1` … `activity-5` | Beyond, top row (chess, swimming) | Landscape 4:3 |
| `activity-6` … `activity-10` | Beyond, bottom row (volunteering, lab, training) | Landscape 4:3 |
| `og-cover.jpg` | Link preview on LinkedIn | 1200 x 630 |

Keep each image under about 400 KB so the page loads fast on phones.
Your CV goes in `assets/cv.pdf`.

## Editing text

Everything is in `index.html`. Search for `EDIT` to find each block, and for `[` to find
the remaining placeholders.

## Previewing locally

```bash
python -m http.server 5173
```

Then open http://localhost:5173
