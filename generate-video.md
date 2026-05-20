# AI Video Generation Plan — GEMA Onboarding

## Workflow

```
Step 1: Text-to-Image (generate base frame)
         ↓
Step 2: Image-to-Video (animate the frame)
```

Video container `w-40 h-40` (160×160px), aspect ratio **1:1**, output harus **circular crop** — elemen utama harus di tengah.

---

## Video 1 — "Solusi Layanan Terpercaya"

**Concept:** Service provider (tukang ahli) memegang tools, tersenyum, dengan background rumah modern. Orang Indonesia nyata.

**Text-to-Image Prompt:**
```
A friendly Indonesian male technician in his 30s wearing a navy blue uniform, holding a wrench and hammer, smiling warmly at camera, standing in front of a modern Indonesian home with green plants, soft emerald green background blur, front-facing portrait, high quality, photorealistic, natural lighting, shot on DSLR
```

**Image-to-Video Prompt:**
```
The technician gently nods and smiles at camera, slight head movement, confident and welcoming expression, handheld camera subtle movement, warm natural lighting, professional portrait style
```

---

## Video 2 — "Vendor Terpilih, Kualitas Terjamin"

**Concept:** Shield/badge dengan checkmark, background tenang, trust/security feel. Atau orang sedang menunjukkan ID card.

**Text-to-Image Prompt:**
```
A professional Indonesian woman in her late 20s wearing a white shirt and hijab, holding a verified badge/shield with green checkmark, standing confidently, soft emerald gradient background, professional corporate style, photorealistic, high quality, natural lighting
```

**Image-to-Video Prompt:**
```
The woman slightly tilts her head with a confident smile, badge gently glows, subtle breathing movement, background has soft light particles floating, elegant and trustworthy atmosphere, professional portrait
```

---

## Video 3 — "Bayar Setelah Selesai, Tanpa Risiko"

**Concept:** Orang memegang smartphone dengan payment/escrow UI visible, confident gesture, aman dan santai.

**Text-to-Image Prompt:**
```
A friendly Indonesian man in his 30s wearing a casual shirt, holding a smartphone showing a green payment confirmation screen with a checkmark, smiling confidently with thumb up gesture, soft emerald green gradient background, modern fintech style, photorealistic, high quality, natural lighting
```

**Image-to-Video Prompt:**
```
The man gives a slight thumb-up gesture, eyes light up with satisfaction, phone screen glows softly, subtle smile animation, confident and reassuring feeling, warm professional lighting
```

---

## Technical Specs

| Property | Value |
|----------|-------|
| Aspect ratio | 1:1 (square) — match circular container |
| Duration | 3-5 detik per video, seamless loop |
| Style | Photorealistic, natural Indonesian people |
| Mood | Warm, trustworthy, professional, welcoming |
| Background | Soft emerald/green tones to match app theme |
| Output format | MP4 (H.264) |
| Resolution | 720p atau 1080p (720p cukup untuk 160×160px container) |

---

## Recommended AI Tools

**Image Generation:**
- **Midjourney** — best quality, photorealistic Indonesian faces
- **DALL-E 3** — good consistency
- **Stable Diffusion** — free, use RealisticVision model

**Image-to-Video:**
- **Runway Gen-3 Alpha** — best quality motion
- **Pika Labs** — good for portrait animation
- **Kling AI** — fast, good for product/portrait
- **Sora** (if available) — highest quality

---

## Steps

1. **Generate 3 images** pakai text-to-image prompt di atas (atau sesuaikan dengan preference)
2. **Crop ke square 1:1** — circular container artinya yang penting ada di tengah
3. **Generate video** dari setiap image pakai image-to-video prompt
4. **Download MP4** — Pastikan tidak ada watermark
5. **Place di** `public/onboarding/video-1.mp4`, `video-2.mp4`, `video-3.mp4`
6. **Test** — video autoplay, loop, no fullscreen di mobile

---

## Output Files

| File | Slide |
|------|-------|
| `public/onboarding/video-1.mp4` | Slide 1 — Solusi Layanan Terpercaya |
| `public/onboarding/video-2.mp4` | Slide 2 — Vendor Terpilih, Kualitas Terjamin |
| `public/onboarding/video-3.mp4` | Slide 3 — Bayar Setelah Selesai, Tanpa Risiko |