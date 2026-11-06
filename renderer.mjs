import fs from "fs";
import path from "path";
import satori from "satori";
import { Resvg } from "@resvg/resvg-js";

const ASSETS_DIR = path.resolve("assets");
const ICONS_DIR = path.join(ASSETS_DIR, "icons");
const OUTPUT_DIR = path.resolve("output");

if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });

const logoPath = path.join(ASSETS_DIR, "eegyo sims.png");
const logoBase64 = fs.existsSync(logoPath)
  ? fs.readFileSync(logoPath).toString("base64")
  : "";
const fontData = fs.readFileSync(
  "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
);

function getIconBase64(iconName) {
  const safeName = (iconName || "check").replace(".svg", "");
  const iconPath = path.join(ICONS_DIR, `${safeName}.svg`);
  const finalPath = fs.existsSync(iconPath)
    ? iconPath
    : path.join(ICONS_DIR, "check.svg");
  return fs.existsSync(finalPath)
    ? `data:image/svg+xml;base64,${fs.readFileSync(finalPath).toString("base64")}`
    : "";
}

export async function renderSlide(slideData, index, totalSlides) {
  slideData = {
    ...slideData,
    title: String(slideData.title ?? ""),
    subtitle: slideData.subtitle ? String(slideData.subtitle) : "",
    items: (slideData.items || []).map(String),
  };

  const isCarousel = totalSlides > 1;
  const slideCounter = isCarousel ? `${index + 1}/${totalSlides}` : "";
  const iconSrc = getIconBase64(slideData.icon);

  const template = {
    type: "div",
    props: {
      style: {
        height: "1350px",
        width: "1080px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        backgroundColor: "#0c0d11",
        backgroundImage:
          "radial-gradient(circle at 90% 10%, rgba(253, 244, 43, 0.15) 0%, transparent 45%), radial-gradient(circle at 10% 90%, rgba(30, 41, 59, 0.4) 0%, transparent 40%)",
        padding: "70px 65px",
        position: "relative",
        fontFamily: "DejaVu Sans",
        color: "#ffffff",
      },
      children: [
        // HEADER: Logo & Badge Dinamis
        {
          type: "div",
          props: {
            style: {
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              width: "100%",
            },
            children: [
              logoBase64
                ? {
                    type: "img",
                    props: {
                      src: `data:image/png;base64,${logoBase64}`,
                      style: { height: "52px", width: "auto" },
                    },
                  }
                : {
                    type: "div",
                    props: {
                      style: {
                        fontSize: "28px",
                        fontWeight: "bold",
                        color: "#ffffff",
                      },
                      children: "Eegyo SIMS",
                    },
                  },
              {
                type: "div",
                props: {
                  style: { display: "flex", alignItems: "center", gap: "12px" },
                  children: [
                    {
                      type: "div",
                      props: {
                        style: {
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                          backgroundColor: "#161922",
                          border: "1px solid rgba(253, 244, 43, 0.4)",
                          color: "#fdf42b",
                          padding: "8px 16px",
                          borderRadius: "100px",
                          fontSize: "18px",
                          letterSpacing: "1px",
                          textTransform: "uppercase",
                        },
                        children: [
                          iconSrc
                            ? {
                                type: "img",
                                props: {
                                  src: iconSrc,
                                  style: { width: "20px", height: "20px" },
                                },
                              }
                            : null,
                          {
                            type: "span",
                            props: {
                              children: slideData.badge || "INSIGHT",
                            },
                          },
                        ].filter(Boolean),
                      },
                    },
                    isCarousel
                      ? {
                          type: "div",
                          props: {
                            style: {
                              color: "#8b949e",
                              fontSize: "18px",
                              letterSpacing: "1px",
                            },
                            children: slideCounter,
                          },
                        }
                      : null,
                  ].filter(Boolean),
                },
              },
            ],
          },
        },

        // BODY: Headline & Card Items
        {
          type: "div",
          props: {
            style: {
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              gap: "28px",
              margin: "auto 0",
              width: "100%",
            },
            children: [
              {
                type: "div",
                props: {
                  style: {
                    fontSize: "54px",
                    lineHeight: 1.2,
                    fontWeight: "bold",
                    color: "#ffffff",
                    display: "flex",
                    flexWrap: "wrap",
                    wordBreak: "break-word",
                  },
                  children: slideData.title,
                },
              },
              slideData.subtitle
                ? {
                    type: "div",
                    props: {
                      style: {
                        fontSize: "26px",
                        lineHeight: 1.45,
                        color: "#9ba1b0",
                        display: "flex",
                        flexWrap: "wrap",
                        wordBreak: "break-word",
                      },
                      children: slideData.subtitle,
                    },
                  }
                : null,
              slideData.items && slideData.items.length > 0
                ? {
                    type: "div",
                    props: {
                      style: {
                        display: "flex",
                        flexDirection: "column",
                        gap: "16px",
                        marginTop: "15px",
                      },
                      children: slideData.items.map((item, idx) => ({
                        type: "div",
                        props: {
                          style: {
                            display: "flex",
                            alignItems: "center",
                            backgroundColor: "#131620",
                            border: "1px solid #202433",
                            borderRadius: "20px",
                            padding: "22px 26px",
                            gap: "20px",
                          },
                          children: [
                            {
                              type: "div",
                              props: {
                                style: {
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  width: "44px",
                                  height: "44px",
                                  borderRadius: "12px",
                                  backgroundColor: "#fdf42b",
                                  color: "#0c0d11",
                                  fontSize: "22px",
                                  fontWeight: "bold",
                                },
                                children: `${idx + 1}`,
                              },
                            },
                            {
                              type: "div",
                              props: {
                                style: {
                                  fontSize: "26px",
                                  color: "#e6edf3",
                                  display: "flex",
                                  flex: 1,
                                  wordBreak: "break-word",
                                },
                                children: item,
                              },
                            },
                          ],
                        },
                      })),
                    },
                  }
                : null,
            ].filter(Boolean),
          },
        },

        // FOOTER
        {
          type: "div",
          props: {
            style: {
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              borderTop: "1px solid #1e2230",
              paddingTop: "30px",
              width: "100%",
            },
            children: [
              {
                type: "div",
                props: {
                  style: {
                    color: "#fdf42b",
                    fontSize: "22px",
                    letterSpacing: "1px",
                  },
                  children: "@eegyosims",
                },
              },
              {
                type: "div",
                props: {
                  style: { color: "#6e7681", fontSize: "20px" },
                  children:
                    isCarousel && index < totalSlides - 1
                      ? "Geser untuk lanjut ➔"
                      : "Solusi Sekolah Modern",
                },
              },
            ],
          },
        },
      ],
    },
  };

  const svg = await satori(template, {
    width: 1080,
    height: 1350,
    fonts: [
      { name: "DejaVu Sans", data: fontData, weight: 700, style: "normal" },
    ],
  });

  const resvg = new Resvg(svg, { fitTo: { mode: "width", value: 1080 } });
  const pngData = resvg.render();
  const filePath = path.join(OUTPUT_DIR, `slide_${index + 1}.png`);
  fs.writeFileSync(filePath, pngData.asPng());
  return filePath;
}

const inputPayloadPath = process.argv[2];
if (inputPayloadPath) {
  const raw = fs.readFileSync(inputPayloadPath, "utf-8");
  const payload = JSON.parse(raw);
  const total = payload.slides.length;
  for (let i = 0; i < total; i++) {
    const file = await renderSlide(payload.slides[i], i, total);
    console.log(`RENDERED: ${file}`);
  }
}
