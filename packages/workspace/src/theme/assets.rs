//! Embedded brand assets decoded once at startup.
//!
//! Both PNGs are compiled into the binary; decoding happens a single time and
//! the result is cached as an egui texture. A decode failure never aborts the
//! app — it logs and installs a transparent placeholder.

use egui::{ColorImage, Color32, Context, TextureHandle, TextureOptions};

/// The Splic mark shown centred on the sign-in card.
pub(crate) struct BrandAssets {
    pub logo: TextureHandle,
    pub google_g: TextureHandle,
}

impl BrandAssets {
    pub(crate) fn new(ctx: &Context) -> Self {
        Self {
            logo: load(ctx, "splic-logo", include_bytes!("../../assets/logo-mark.png")),
            google_g: load(ctx, "google-g", include_bytes!("../../assets/google-g.png")),
        }
    }
}

fn load(ctx: &Context, name: &str, bytes: &[u8]) -> TextureHandle {
    match image::load_from_memory(bytes) {
        Ok(image) => {
            let rgba = image.to_rgba8();
            let size = [rgba.width() as usize, rgba.height() as usize];
            let image = ColorImage::from_rgba_unmultiplied(size, rgba.as_raw());
            ctx.load_texture(name, image, TextureOptions::LINEAR)
        }
        Err(error) => {
            log::error!("failed to decode embedded asset {name}: {error}");
            let placeholder = ColorImage::from_rgba_unmultiplied([1, 1], &[0, 0, 0, 0]);
            ctx.load_texture(name, placeholder, TextureOptions::NEAREST)
        }
    }
}

/// Convenience for the 1×1 fallback above; keeps `Color32` imported for docs.
const _: Color32 = Color32::TRANSPARENT;
