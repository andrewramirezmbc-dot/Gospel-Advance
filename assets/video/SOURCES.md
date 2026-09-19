# Hero Background Sources

Temporary illustrative AI-and-stock montage, updated September 14, 2026. These are not recordings of Gospel Advance events, participants, or partner campuses. No endorsement by the depicted people or institutions is implied.

## Current Edit

September 18, 2026: removed the five-second Pexels shot of three students walking (previous timeline 2.5-7.5s) from both desktop and mobile exports. The loop is now 10 seconds: campus 2.5s, Bible 5s, campus 2.5s. The original campus posters and website noir treatment are unchanged. The full ministry trailer is untouched.

## Previous Hybrid Edit

15 seconds, silent. AI campus source 2.5-5s opens the loop; Pexels students walking source 1-6s follows; AI Bible source 0-5s follows; AI campus source 0-2.5s closes. The campus source remains continuous across the repeat boundary. No additional generation, effects, or color treatments were applied for this merge.

- Campus: in-app generated still, animated by fal.ai `bytedance/seedance-2.5/image-to-video`, successful corrected request `01a0a17a-f382-7153-a6ca-def6ecf297fd`.
- Bible: in-app generated still, animated with the same model, request `01a0a172-2f2d-76b1-8321-168b767964fd`.
- Students: RDNE Stock project, [Pexels 7683332](https://www.pexels.com/video/college-students-walking-in-the-campus-7683332/), under the [Pexels License](https://www.pexels.com/license/).
- AI prompts, request results and originals: `mockup/hero-ai-v1/`. Only the two successful clips were used; none of the three likeness-rejected images were animated or included.

## Original Stock Edit (Archived)

All four clips were downloaded from Pexels under the [Pexels License](https://www.pexels.com/license/), reviewed September 14, 2026. It permits free website use and editing, subject to its restrictions, including no implied endorsement. No music or original audio is included.

| Shot | Creator | Source | Source window |
| --- | --- | --- | --- |
| Campus aerial | Devin Huynh | [30284506](https://www.pexels.com/video/aerial-drone-footage-of-modern-university-campus-30284506/) | 5-10s opening; 0-5s closing |
| Students walking | RDNE Stock project | [7683332](https://www.pexels.com/video/college-students-walking-in-the-campus-7683332/) | 1-6s |
| Library | Tima Miroshnichenko | [9569667](https://www.pexels.com/video/students-studying-inside-the-library-9569667/) | 2-7s |
| Bible pages | Rodolfo Angulo A. | [29276173](https://www.pexels.com/video/bible-pages-turning-in-bright-daylight-29276173/) | 1-6s |

## Exports

- Desktop: `hero-campus-desktop.mp4`, 1600x900, 24fps, 10 seconds.
- Mobile: `hero-campus-mobile.mp4`, 720x1280, 24fps, 10 seconds, independently framed.
- Matching JPEG posters provide instant and reduced-motion fallbacks.
- H.264, yuv420p, fast-start MP4, no audio track.

The closing AI campus shot ends exactly where the opening begins in the source, preserving camera continuity across the loop boundary. The interior transitions are clean cuts.

The previous 25-second all-stock web exports and posters are preserved at `/Users/Andrew_1/Videos/gospel-advance-hero/archive-stock-v1/`. Original composition files are archived in `/Users/Andrew_1/Videos/gospel-advance-hero-stock-v1.tar.gz`; original source files and master renders remain in the editable project.

## Future Replacement

Editable HyperFrames project and original downloads: `/Users/Andrew_1/Videos/gospel-advance-hero/`. See its `BRIEF.md` and `STORYBOARD.md`. The campus clip is split into 2.5-second bookends; student and Bible shots occupy five seconds each. Replace source clips and adjust `data-media-start` values, then render desktop and mobile again.

Website paths are configured in `assets/media-config.js`; poster paths are in `gospel-advance-website.html`. Keep the two homepage HTML copies identical.

## Mission Trailer

Replaced September 18, 2026 from Andrew's `/Users/Andrew_1/Desktop/Gospel advance trailer.mp4`. The original remains untouched. Website export is 1920x1080 H.264 / AAC, 160.89 seconds, approximately 74.6 MB, with fast-start metadata. Poster extracted at one second from this replacement. The scroll reveal plays silently; sound requires a visitor's action.
