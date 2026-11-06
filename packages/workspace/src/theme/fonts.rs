//! Bundled Inter faces and the text-style map.
//!
//! egui only ships Ubuntu-Light (a single weight), so headings and controls
//! would have no real semibold. Three subset Inter faces — OFL licensed, ~80
//! KB each — give the UI an actual type hierarchy. Inter is also the primary
//! family of the website (`packages/site/app/globals.css`).

use std::collections::BTreeMap;
use std::sync::Arc;

use egui::{FontData, FontDefinitions, FontFamily, FontId, TextStyle};

/// Family names registered for each weight (also the `font_data` keys).
pub(crate) const FAMILY_REGULAR: &str = "Inter";
pub(crate) const FAMILY_MEDIUM: &str = "Inter Medium";
pub(crate) const FAMILY_SEMIBOLD: &str = "Inter SemiBold";

const REGULAR: &[u8] = include_bytes!("../../assets/fonts/Inter-Regular.ttf");
const MEDIUM: &[u8] = include_bytes!("../../assets/fonts/Inter-Medium.ttf");
const SEMIBOLD: &[u8] = include_bytes!("../../assets/fonts/Inter-SemiBold.ttf");

/// egui's built-in faces, kept as a fallback for glyphs Inter does not cover
/// (emoji, mathematical symbols) so nothing renders as a tofu box.
fn fallbacks() -> Vec<String> {
    vec![
        "Ubuntu-Light".to_owned(),
        "NotoEmoji-Regular".to_owned(),
        "emoji-icon-font".to_owned(),
    ]
}

/// Register the Inter weights and make them the default proportional family.
pub(crate) fn install(ctx: &egui::Context) {
    let mut fonts = FontDefinitions::default();

    for (name, bytes) in [
        (FAMILY_REGULAR, REGULAR),
        (FAMILY_MEDIUM, MEDIUM),
        (FAMILY_SEMIBOLD, SEMIBOLD),
    ] {
        fonts
            .font_data
            .insert(name.to_owned(), Arc::new(FontData::from_static(bytes)));
    }

    for name in [FAMILY_REGULAR, FAMILY_MEDIUM, FAMILY_SEMIBOLD] {
        let mut family = vec![name.to_owned()];
        family.extend(fallbacks());
        fonts
            .families
            .insert(FontFamily::Name(name.into()), family);
    }

    // Default proportional text = Inter first, then the built-in fallbacks.
    let mut proportional = vec![FAMILY_REGULAR.to_owned()];
    if let Some(existing) = fonts.families.get(&FontFamily::Proportional) {
        proportional.extend(existing.iter().cloned());
    }
    fonts
        .families
        .insert(FontFamily::Proportional, proportional);

    ctx.set_fonts(fonts);
}

/// The text-style map applied to [`egui::Style::text_styles`].
///
/// Sizes follow the website type scale: `md` (14) for body and buttons, `sm`
/// (12) for captions.
pub(crate) fn text_styles() -> BTreeMap<TextStyle, FontId> {
    let mut styles = BTreeMap::new();
    styles.insert(
        TextStyle::Body,
        FontId::new(14.0, FontFamily::Name(FAMILY_REGULAR.into())),
    );
    styles.insert(
        TextStyle::Small,
        FontId::new(12.0, FontFamily::Name(FAMILY_REGULAR.into())),
    );
    styles.insert(
        TextStyle::Button,
        FontId::new(14.0, FontFamily::Name(FAMILY_MEDIUM.into())),
    );
    styles.insert(
        TextStyle::Heading,
        FontId::new(24.0, FontFamily::Name(FAMILY_SEMIBOLD.into())),
    );
    styles.insert(TextStyle::Monospace, FontId::new(13.0, FontFamily::Monospace));
    styles
}
