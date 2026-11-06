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

const FONTS_DIR = path.join(ASSETS_DIR, "fonts");
if (!fs.existsSync(FONTS_DIR)) fs.mkdirSync(FONTS_DIR, { recursive: true });

async function loadFont(filename, url) {
  const localPath = path.join(FONTS_DIR, filename);
  if (fs.existsSync(localPath)) return fs.readFileSync(localPath);
  const res = await fetch(url);
  if (!res.ok)
    throw new Error(`Gagal mengunduh font ${filename}: ${res.statusText}`);
  const buffer = Buffer.from(await res.arrayBuffer());
  fs.writeFileSync(localPath, buffer);
  return buffer;
}

const fonts = await Promise.all([
  loadFont(
    "Poppins-Bold.ttf",
    "https://raw.githubusercontent.com/google/fonts/main/ofl/poppins/Poppins-Bold.ttf",
  ).then((data) => ({ name: "Poppins", data, weight: 700, style: "normal" })),
  loadFont(
    "Poppins-SemiBold.ttf",
    "https://raw.githubusercontent.com/google/fonts/main/ofl/poppins/Poppins-SemiBold.ttf",
  ).then((data) => ({ name: "Poppins", data, weight: 600, style: "normal" })),
  loadFont(
    "Poppins-Medium.ttf",
    "https://raw.githubusercontent.com/google/fonts/main/ofl/poppins/Poppins-Medium.ttf",
  ).then((data) => ({ name: "Poppins", data, weight: 500, style: "normal" })),
  loadFont(
    "Poppins-Regular.ttf",
    "https://raw.githubusercontent.com/google/fonts/main/ofl/poppins/Poppins-Regular.ttf",
  ).then((data) => ({ name: "Poppins", data, weight: 400, style: "normal" })),
  loadFont(
    "Inter-Medium.ttf",
    "https://fonts.gstatic.com/s/inter/v20/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuI6fMZhrj72A.ttf",
  ).then((data) => ({ name: "Inter", data, weight: 500, style: "normal" })),
  loadFont(
    "Inter-Regular.ttf",
    "https://fonts.gstatic.com/s/inter/v20/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuLyfMZhrj72A.ttf",
  ).then((data) => ({ name: "Inter", data, weight: 400, style: "normal" })),
]);

function getIconSvg(iconName, color = "#111111") {
  const safeName = (iconName || "check").replace(".svg", "");
  const iconPath = path.join(ICONS_DIR, `${safeName}.svg`);
  const finalPath = fs.existsSync(iconPath)
    ? iconPath
    : path.join(ICONS_DIR, "check.svg");
  if (!fs.existsSync(finalPath)) return "";
  let svg = fs.readFileSync(finalPath, "utf-8");
  svg = svg.replace(/stroke="[^"]*"/g, `stroke="${color}"`);
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`;
}

// ─────────────────────────────────────────────────────────────────────────────
// BRAND PALETTE — Kuning (#fdf42b) & Hitam Modern (Canva Pop Style)
// ─────────────────────────────────────────────────────────────────────────────
const C = {
  yellow: "#fdf42b",
  yellowTint: "#fffde6",
  yellowWarm: "#ffea00",
  black: "#111111",
  charcoal: "#222222",
  textMuted: "#4b5563",
  white: "#ffffff",
  borderDark: "#111111",
};

// ─────────────────────────────────────────────────────────────────────────────
// DECORATIVE VECTOR ASSETS (Canva-style)
// ─────────────────────────────────────────────────────────────────────────────

// Dotted pattern grid
function dotGridSvg(
  dotColor = "rgba(17,17,17,0.12)",
  cols = 7,
  rows = 7,
  gap = 22,
) {
  let circles = "";
  for (let c = 0; c < cols; c++) {
    for (let r = 0; r < rows; r++) {
      circles += `<circle cx="${c * gap + 4}" cy="${r * gap + 4}" r="3" fill="${dotColor}"/>`;
    }
  }
  const w = cols * gap + 8;
  const h = rows * gap + 8;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}">${circles}</svg>`;
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`;
}

// 4-point Sparkle / Starburst shape
function sparkleSvg(fill = C.yellow, stroke = C.black, size = 48) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 48 48">
    <path fill="${fill}" stroke="${stroke}" stroke-width="2.5" stroke-linejoin="round" d="M24 2 C25 14 34 23 46 24 C34 25 25 34 24 46 C23 34 14 25 2 24 C14 23 23 14 24 2 Z"/>
  </svg>`;
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`;
}

// Geometric Curved Wave / Blob
function organicBlobSvg(fill = C.yellow, opacity = 1) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 300" width="300" height="300">
    <path fill="${fill}" opacity="${opacity}" d="M225,50 C270,90 290,160 265,220 C240,280 170,300 110,285 C50,270 10,210 25,145 C40,80 110,35 175,25 C195,22 210,35 225,50 Z"/>
  </svg>`;
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`;
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN RENDER FUNCTION
// ─────────────────────────────────────────────────────────────────────────────
export async function renderSlide(slideData, index, totalSlides) {
  slideData = {
    ...slideData,
    title: String(slideData.title ?? ""),
    subtitle: slideData.subtitle ? String(slideData.subtitle) : "",
    items: (slideData.items || []).map(String),
    brandText: slideData.brandText
      ? String(slideData.brandText)
      : "Eegyo SIMS - Aplikasi Sekolah Super Lengkap",
    website: slideData.website
      ? String(slideData.website)
      : "Kunjungi eegyosims.com",
  };

  const isCarousel = totalSlides > 1;
  const isLastSlide = isCarousel && index === totalSlides - 1;
  const hasItems = slideData.items.length > 0;
  const slideCounter = isCarousel ? `${index + 1}/${totalSlides}` : "";
  const iconSrc = getIconSvg(slideData.icon, C.black);

  const dotGridSrc = dotGridSvg("rgba(17,17,17,0.12)", 7, 7, 20);
  const sparkleYellowSrc = sparkleSvg(C.yellow, C.black, 46);
  const sparkleBlackSrc = sparkleSvg(C.black, C.black, 32);
  const blobYellowSrc = organicBlobSvg(C.yellow, 0.4);

  // ── Item Cards (Canva neo-pop style) ──
  const itemCards = slideData.items.map((item, idx) => ({
    type: "div",
    props: {
      style: {
        display: "flex",
        alignItems: "center",
        backgroundColor: C.white,
        border: "2.5px solid #111111",
        borderRadius: "20px",
        padding: "20px 24px",
        gap: "20px",
        boxShadow: "4px 4px 0px #111111",
        position: "relative",
      },
      children: [
        // Number badge (Native Satori div so text renders reliably in Poppins Bold)
        {
          type: "div",
          props: {
            style: {
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "48px",
              height: "48px",
              minWidth: "48px",
              borderRadius: "14px",
              backgroundColor: C.yellow,
              border: "2px solid #111111",
              boxShadow: "2.5px 2.5px 0px #111111",
              color: C.black,
              fontSize: "24px",
              fontWeight: 700,
              fontFamily: "Poppins",
            },
            children: String(idx + 1),
          },
        },
        // Description text
        {
          type: "div",
          props: {
            style: {
              fontSize: "23px",
              lineHeight: 1.45,
              fontWeight: 500,
              fontFamily: "Inter",
              color: C.black,
              flex: 1,
              wordBreak: "break-word",
            },
            children: item,
          },
        },
        // Checkmark pill
        {
          type: "div",
          props: {
            style: {
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "36px",
              height: "36px",
              minWidth: "36px",
              borderRadius: "50%",
              backgroundColor: C.yellowTint,
              border: "2px solid #111111",
            },
            children: [
              {
                type: "img",
                props: {
                  src: getIconSvg("check", C.black),
                  style: { width: "18px", height: "18px" },
                },
              },
            ],
          },
        },
      ],
    },
  }));

  // ── Bottom Illustration / Feature Banner (Fills empty space with Canva-style graphic) ──
  const bottomIllustrationBanner = {
    type: "div",
    props: {
      style: {
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: C.yellowTint,
        border: "2.5px dashed rgba(17,17,17,0.35)",
        borderRadius: "20px",
        padding: "20px 26px",
        marginTop: "10px",
      },
      children: [
        {
          type: "div",
          props: {
            style: { display: "flex", alignItems: "center", gap: "16px" },
            children: [
              {
                type: "div",
                props: {
                  style: {
                    width: "50px",
                    height: "50px",
                    borderRadius: "14px",
                    backgroundColor: C.yellow,
                    border: "2px solid #111111",
                    boxShadow: "3px 3px 0px #111111",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  },
                  children: [
                    {
                      type: "img",
                      props: {
                        src: getIconSvg("sparkles", C.black),
                        style: { width: "26px", height: "26px" },
                      },
                    },
                  ],
                },
              },
              {
                type: "div",
                props: {
                  style: { display: "flex", flexDirection: "column" },
                  children: [
                    {
                      type: "div",
                      props: {
                        style: {
                          fontSize: "19px",
                          fontWeight: 700,
                          fontFamily: "Poppins",
                          color: C.black,
                        },
                        children: "Otomasi & Terintegrasi",
                      },
                    },
                    {
                      type: "div",
                      props: {
                        style: {
                          fontSize: "15px",
                          color: C.textMuted,
                          fontFamily: "Inter",
                        },
                        children:
                          "Kelola administrasi sekolah lebih cepat, akurat, dan modern.",
                      },
                    },
                  ],
                },
              },
            ],
          },
        },
        // Floating Sticker Tag
        {
          type: "div",
          props: {
            style: {
              display: "flex",
              alignItems: "center",
              gap: "6px",
              backgroundColor: C.black,
              color: C.yellow,
              padding: "9px 18px",
              borderRadius: "100px",
              fontSize: "14px",
              fontWeight: 700,
              fontFamily: "Poppins",
              letterSpacing: "0.5px",
            },
            children: "★ RESMI & AMAN",
          },
        },
      ],
    },
  };

  // ── Cover / Statement Graphic Card (When there are no items) ──
  const heroIllustrationBox = {
    type: "div",
    props: {
      style: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: C.white,
        border: "3px solid #111111",
        borderRadius: "28px",
        padding: "45px 35px",
        boxShadow: "8px 8px 0px #111111",
        gap: "28px",
        position: "relative",
        marginTop: "10px",
      },
      children: [
        // Central Illustration Icon Badge
        {
          type: "div",
          props: {
            style: {
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "110px",
              height: "110px",
              borderRadius: "32px",
              backgroundColor: C.yellow,
              border: "3px solid #111111",
              boxShadow: "5px 5px 0px #111111",
            },
            children: [
              iconSrc
                ? {
                    type: "img",
                    props: {
                      src: iconSrc,
                      style: { width: "56px", height: "56px" },
                    },
                  }
                : null,
            ].filter(Boolean),
          },
        },
        // Floating Sticker Badges row
        {
          type: "div",
          props: {
            style: {
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "14px",
              flexWrap: "wrap",
            },
            children: [
              {
                type: "div",
                props: {
                  style: {
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    backgroundColor: C.yellowTint,
                    border: "2px solid #111111",
                    padding: "8px 18px",
                    borderRadius: "100px",
                    fontSize: "15px",
                    fontWeight: 700,
                    fontFamily: "Poppins",
                    color: C.black,
                  },
                  children: [
                    {
                      type: "img",
                      props: {
                        src: getIconSvg("zap", C.black),
                        style: { width: "16px", height: "16px" },
                      },
                    },
                    {
                      type: "span",
                      props: { children: "100% Otomatis" },
                    },
                  ],
                },
              },
              {
                type: "div",
                props: {
                  style: {
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    backgroundColor: C.black,
                    color: C.yellow,
                    padding: "8px 18px",
                    borderRadius: "100px",
                    fontSize: "15px",
                    fontWeight: 700,
                    fontFamily: "Poppins",
                  },
                  children: [
                    {
                      type: "img",
                      props: {
                        src: getIconSvg("cloud", C.yellow),
                        style: { width: "16px", height: "16px" },
                      },
                    },
                    {
                      type: "span",
                      props: { children: "Cloud Terpadu" },
                    },
                  ],
                },
              },
              {
                type: "div",
                props: {
                  style: {
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    backgroundColor: C.yellow,
                    border: "2px solid #111111",
                    padding: "8px 18px",
                    borderRadius: "100px",
                    fontSize: "15px",
                    fontWeight: 700,
                    fontFamily: "Poppins",
                    color: C.black,
                  },
                  children: [
                    {
                      type: "img",
                      props: {
                        src: getIconSvg("check", C.black),
                        style: { width: "16px", height: "16px" },
                      },
                    },
                    {
                      type: "span",
                      props: { children: "Ramah Guru & Siswa" },
                    },
                  ],
                },
              },
            ],
          },
        },
        // Action CTA Banner
        {
          type: "div",
          props: {
            style: {
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "10px",
              backgroundColor: C.yellow,
              border: "2.5px solid #111111",
              boxShadow: "4px 4px 0px #111111",
              padding: "16px 36px",
              borderRadius: "100px",
              fontSize: "18px",
              fontWeight: 700,
              fontFamily: "Poppins",
              color: C.black,
            },
            children: "BACA SELENGKAPNYA →",
          },
        },
      ],
    },
  };

  // ─────────────────────────────────────────────────────────────
  // TEMPLATE ROOT
  // ─────────────────────────────────────────────────────────────
  const template = {
    type: "div",
    props: {
      style: {
        width: "1080px",
        height: "1350px",
        display: "flex",
        flexDirection: "column",
        backgroundColor: C.white,
        // Gradasi #fdf42b lembut di background dasar putih (dominan putih)
        backgroundImage:
          "radial-gradient(circle at 92% 8%, rgba(253, 244, 43, 0.28) 0%, rgba(253, 244, 43, 0.06) 35%, transparent 55%), radial-gradient(circle at 8% 92%, rgba(253, 244, 43, 0.22) 0%, rgba(253, 244, 43, 0.04) 35%, transparent 55%)",
        fontFamily: "Poppins",
        position: "relative",
        overflow: "hidden",
      },
      children: [
        // ══════════════════════════════════════════
        // LAYER 0 — CANVA DECORATIVE ORNAMENTS
        // ══════════════════════════════════════════

        // Yellow Organic Blob (Top Right)
        {
          type: "img",
          props: {
            src: blobYellowSrc,
            style: {
              position: "absolute",
              top: "-50px",
              right: "-50px",
              width: "360px",
              height: "360px",
              opacity: 0.35,
            },
          },
        },

        // Dotted grid patch (Top Right behind blob)
        {
          type: "img",
          props: {
            src: dotGridSrc,
            style: {
              position: "absolute",
              top: "130px",
              right: "40px",
              width: "150px",
              height: "150px",
              opacity: 0.7,
            },
          },
        },

        // Dotted grid patch (Bottom Left)
        {
          type: "img",
          props: {
            src: dotGridSrc,
            style: {
              position: "absolute",
              bottom: "130px",
              left: "40px",
              width: "150px",
              height: "150px",
              opacity: 0.7,
            },
          },
        },

        // Sparkle Star (Mid Right)
        {
          type: "img",
          props: {
            src: sparkleYellowSrc,
            style: {
              position: "absolute",
              top: "430px",
              right: "45px",
              width: "48px",
              height: "48px",
            },
          },
        },

        // Small Sparkle Star (Upper Left)
        {
          type: "img",
          props: {
            src: sparkleBlackSrc,
            style: {
              position: "absolute",
              top: "140px",
              left: "55px",
              width: "30px",
              height: "30px",
              opacity: 0.7,
            },
          },
        },

        // Decorative solid circle
        {
          type: "div",
          props: {
            style: {
              position: "absolute",
              top: "600px",
              left: "30px",
              width: "18px",
              height: "18px",
              borderRadius: "50%",
              backgroundColor: C.yellow,
              border: "2px solid #111111",
            },
          },
        },

        // ══════════════════════════════════════════
        // LAYER 1 — HEADER (Clean White/Transparent to make logo 100% clear)
        // ══════════════════════════════════════════
        {
          type: "div",
          props: {
            style: {
              position: "relative",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              paddingLeft: "65px",
              paddingRight: "65px",
              paddingTop: "40px",
              paddingBottom: "25px",
              borderBottom: "2px solid rgba(17,17,17,0.08)",
              zIndex: 10,
            },
            children: [
              // Logo
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
                        fontWeight: 700,
                        fontFamily: "Poppins",
                        color: C.black,
                      },
                      children: "Eegyo SIMS",
                    },
                  },

              // Right: Badge & Counter Pills
              {
                type: "div",
                props: {
                  style: {
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                  },
                  children: [
                    // Badge pill
                    {
                      type: "div",
                      props: {
                        style: {
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                          backgroundColor: C.yellow,
                          color: C.black,
                          border: "2px solid #111111",
                          boxShadow: "3px 3px 0px #111111",
                          paddingTop: "9px",
                          paddingBottom: "9px",
                          paddingLeft: "18px",
                          paddingRight: "18px",
                          borderRadius: "100px",
                          fontSize: "15px",
                          fontWeight: 700,
                          fontFamily: "Poppins",
                          letterSpacing: "0.5px",
                          textTransform: "uppercase",
                        },
                        children: [
                          iconSrc
                            ? {
                                type: "img",
                                props: {
                                  src: iconSrc,
                                  style: { width: "18px", height: "18px" },
                                },
                              }
                            : null,
                          {
                            type: "span",
                            props: { children: slideData.badge || "INSIGHT" },
                          },
                        ].filter(Boolean),
                      },
                    },
                    // Slide counter
                    isCarousel
                      ? {
                          type: "div",
                          props: {
                            style: {
                              backgroundColor: C.white,
                              color: C.black,
                              border: "2px solid #111111",
                              boxShadow: "3px 3px 0px #111111",
                              paddingTop: "9px",
                              paddingBottom: "9px",
                              paddingLeft: "16px",
                              paddingRight: "16px",
                              borderRadius: "100px",
                              fontSize: "15px",
                              fontWeight: 700,
                              fontFamily: "Poppins",
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

        // ══════════════════════════════════════════
        // LAYER 2 — MAIN CONTENT
        // ══════════════════════════════════════════
        {
          type: "div",
          props: {
            style: {
              display: "flex",
              flexDirection: "column",
              flex: 1,
              justifyContent: "center",
              paddingLeft: "65px",
              paddingRight: "65px",
              paddingTop: "30px",
              paddingBottom: "30px",
              gap: "24px",
              position: "relative",
              zIndex: 5,
            },
            children: [
              // ── Title area ──
              {
                type: "div",
                props: {
                  style: {
                    display: "flex",
                    flexDirection: "column",
                    gap: "16px",
                  },
                  children: [
                    // Highlighter Marker bar + tag
                    {
                      type: "div",
                      props: {
                        style: {
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                        },
                        children: [
                          {
                            type: "div",
                            props: {
                              style: {
                                width: "45px",
                                height: "8px",
                                borderRadius: "10px",
                                backgroundColor: C.yellow,
                                border: "1.5px solid #111111",
                              },
                            },
                          },
                          {
                            type: "div",
                            props: {
                              style: {
                                width: "12px",
                                height: "8px",
                                borderRadius: "10px",
                                backgroundColor: C.black,
                              },
                            },
                          },
                        ],
                      },
                    },
                    // Main Title
                    {
                      type: "div",
                      props: {
                        style: {
                          fontSize: hasItems ? "48px" : "56px",
                          lineHeight: 1.2,
                          fontWeight: 700,
                          fontFamily: "Poppins",
                          color: C.black,
                          wordBreak: "break-word",
                        },
                        children: slideData.title,
                      },
                    },
                  ],
                },
              },

              // ── Subtitle ──
              slideData.subtitle
                ? {
                    type: "div",
                    props: {
                      style: {
                        fontSize: hasItems ? "22px" : "26px",
                        lineHeight: 1.55,
                        fontWeight: 400,
                        fontFamily: "Inter",
                        color: C.textMuted,
                        wordBreak: "break-word",
                      },
                      children: slideData.subtitle,
                    },
                  }
                : null,

              // ── Multi-item list or Hero graphic box ──
              hasItems
                ? {
                    type: "div",
                    props: {
                      style: {
                        display: "flex",
                        flexDirection: "column",
                        gap: "14px",
                      },
                      children: itemCards,
                    },
                  }
                : heroIllustrationBox,

              // ── Bottom illustrative banner (Only shown when there are items, to enrich the layout) ──
              hasItems ? bottomIllustrationBanner : null,
            ].filter(Boolean),
          },
        },

        // ══════════════════════════════════════════
        // LAYER 3 — FOOTER (Bold Black Bar with Yellow Accents)
        // ══════════════════════════════════════════
        {
          type: "div",
          props: {
            style: {
              position: "relative",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              backgroundColor: C.black,
              paddingLeft: "65px",
              paddingRight: "65px",
              paddingTop: "26px",
              paddingBottom: "26px",
              zIndex: 10,
            },
            children: [
              // Brand Handle
              {
                type: "div",
                props: {
                  style: {
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                  },
                  children: [
                    {
                      type: "div",
                      props: {
                        style: {
                          width: "12px",
                          height: "12px",
                          borderRadius: "50%",
                          backgroundColor: C.yellow,
                        },
                      },
                    },
                    {
                      type: "div",
                      props: {
                        style: {
                          color: C.white,
                          fontSize: "19px",
                          fontWeight: 600,
                          fontFamily: "Poppins",
                          letterSpacing: "0.5px",
                        },
                        children: slideData.brandText,
                      },
                    },
                  ],
                },
              },

              // Swipe CTA or Tagline
              {
                type: "div",
                props: {
                  style: {
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                  },
                  children: [
                    {
                      type: "div",
                      props: {
                        style: {
                          color: "rgba(255, 255, 255, 0.75)",
                          fontSize: "17px",
                          fontWeight: 500,
                          fontFamily: "Inter",
                        },
                        children:
                          isCarousel && !isLastSlide
                            ? "Geser untuk lanjut"
                            : slideData.website,
                      },
                    },
                    isCarousel && !isLastSlide
                      ? {
                          type: "div",
                          props: {
                            style: {
                              backgroundColor: C.yellow,
                              color: C.black,
                              fontSize: "16px",
                              fontWeight: 700,
                              fontFamily: "Poppins",
                              paddingTop: "6px",
                              paddingBottom: "6px",
                              paddingLeft: "14px",
                              paddingRight: "14px",
                              borderRadius: "100px",
                            },
                            children: "→",
                          },
                        }
                      : null,
                  ].filter(Boolean),
                },
              },
            ],
          },
        },
      ],
    },
  };

  const svg = await satori(template, { width: 1080, height: 1350, fonts });
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
