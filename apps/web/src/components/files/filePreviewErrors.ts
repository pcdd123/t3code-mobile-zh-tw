import type { useGT } from "gt-react";

// Preview workers and parsers report English messages; translate the known ones where they render.
export function localizeFilePreviewError(message: string, gt: ReturnType<typeof useGT>): string {
  switch (message) {
    case "The font could not be loaded.":
      return gt("The font could not be loaded.");
    case "Font previews are limited to 10 MB.":
      return gt("Font previews are limited to 10 MB.");
    case "The font is unavailable.":
      return gt("The font is unavailable.");
    case "The font could not be decoded.":
      return gt("The font could not be decoded.");
    case "The file could not be loaded. Close it and try again.":
      return gt("The file could not be loaded. Close it and try again.");
    case "The file could not be loaded. Try again.":
      return gt("The file could not be loaded. Try again.");
    case "Preview limited to files under 50 MB.":
      return gt("Preview limited to files under 50 MB.");
    case "The file is unavailable.":
      return gt("The file is unavailable.");
    case "Could not render this Office document.":
      return gt("Could not render this Office document.");
    case "This document took too long to preview. Open it in another app.":
      return gt("This document took too long to preview. Open it in another app.");
    case "Could not load the Office viewer.":
      return gt("Could not load the Office viewer.");
    case "Could not read the Office viewer response.":
      return gt("Could not read the Office viewer response.");
    case "Could not load the Office viewer. Close the file and try again.":
      return gt("Could not load the Office viewer. Close the file and try again.");
    case "Could not read this file.":
      return gt("Could not read this file.");
    case "Could not parse this file.":
      return gt("Could not parse this file.");
    case "Could not preview this file.":
      return gt("Could not preview this file.");
    case "This sheet is unavailable.":
      return gt("This sheet is unavailable.");
    case "Preview limited to 1,000 pages.":
      return gt("Preview limited to 1,000 pages.");
    case "This browser cannot draw slides.":
      return gt("This browser cannot draw slides.");
    case "Preview limited to presentations with 1 to 500 slides.":
      return gt("Preview limited to presentations with 1 to 500 slides.");
    case "This workbook has no visible sheets.":
      return gt("This workbook has no visible sheets.");
    case "This sheet could not be opened.":
      return gt("This sheet could not be opened.");
    case "These cells could not be drawn. Try scrolling to another area.":
      return gt("These cells could not be drawn. Try scrolling to another area.");
    case "These cells could not be drawn.":
      return gt("These cells could not be drawn.");
    case "Resizing preview...":
      return gt("Resizing preview...");
    case "This row or column could not be resized.":
      return gt("This row or column could not be resized.");
    case "Select fewer than 200,000 cells to copy.":
      return gt("Select fewer than 200,000 cells to copy.");
    case "The selected cells could not be copied.":
      return gt("The selected cells could not be copied.");
    case "This embedded image exceeds the preview pixel limit.":
      return gt("This embedded image exceeds the preview pixel limit.");
    case "This browser has no fonts in workers":
      return gt("This browser has no fonts in workers");
    case "The document's fonts could not be prepared":
      return gt("The document's fonts could not be prepared");
    case "The document produced no pages":
      return gt("The document produced no pages");
    case "The Office engine stopped":
      return gt("The Office engine stopped");
    case "The Office engine sent an unreadable reply":
      return gt("The Office engine sent an unreadable reply");
    case "The Office engine was closed":
      return gt("The Office engine was closed");
    case "Image previews are limited to 32 megapixels and 16,384 pixels per side.":
      return gt("Image previews are limited to 32 megapixels and 16,384 pixels per side.");
    case "This image has too much metadata.":
      return gt("This image has too much metadata.");
    case "Invalid or oversized TIFF strip.":
      return gt("Invalid or oversized TIFF strip.");
    case "Image decoding is unavailable.":
      return gt("Image decoding is unavailable.");
    case "Could not decode this image.":
      return gt("Could not decode this image.");
    case "Invalid HEIF dimensions.":
      return gt("Invalid HEIF dimensions.");
    case "Invalid HEIF metadata.":
      return gt("Invalid HEIF metadata.");
    case "Invalid TIFF LZW dictionary.":
      return gt("Invalid TIFF LZW dictionary.");
    case "Invalid TIFF metadata pointer.":
      return gt("Invalid TIFF metadata pointer.");
    case "Invalid TIFF metadata.":
      return gt("Invalid TIFF metadata.");
    case "Invalid TIFF strip.":
      return gt("Invalid TIFF strip.");
    case "Oversized TIFF strip.":
      return gt("Oversized TIFF strip.");
    case "This HEIF image has no readable dimensions.":
      return gt("This HEIF image has no readable dimensions.");
    case "This TIFF color format is not supported.":
      return gt("This TIFF color format is not supported.");
    case "This TIFF compression is not supported.":
      return gt("This TIFF compression is not supported.");
    case "This TIFF has no readable image.":
      return gt("This TIFF has no readable image.");
    case "This TIFF has too much image data.":
      return gt("This TIFF has too much image data.");
    case "This TIFF has too much or truncated metadata.":
      return gt("This TIFF has too much or truncated metadata.");
    case "This TIFF orientation is not supported.":
      return gt("This TIFF orientation is not supported.");
    case "Truncated TIFF strip.":
      return gt("Truncated TIFF strip.");
    case "Unsupported TIFF metadata type.":
      return gt("Unsupported TIFF metadata type.");
    case "Unsupported TIFF strip layout.":
      return gt("Unsupported TIFF strip layout.");
    case "Could not load the image decoder.":
      return gt("Could not load the image decoder.");
    case "Image decoding cancelled.":
      return gt("Image decoding cancelled.");
    case "This image took too long to decode.":
      return gt("This image took too long to decode.");
    case "A line or record exceeds the 1 MB preview limit.":
      return gt("A line or record exceeds the 1 MB preview limit.");
    case "Text previews support files up to 256 MB.":
      return gt("Text previews support files up to 256 MB.");
    case "Text previews support up to 5 million rows.":
      return gt("Text previews support up to 5 million rows.");
    case "The file download was incomplete. Close it and try again.":
      return gt("The file download was incomplete. Close it and try again.");
    case "This file contains binary data.":
      return gt("This file contains binary data.");
    case "Wait for the file to finish loading before copying.":
      return gt("Wait for the file to finish loading before copying.");
    case "Another copy is in progress.":
      return gt("Another copy is in progress.");
    case "Preview closed.":
      return gt("Preview closed.");
    case "The text viewer stopped.":
      return gt("The text viewer stopped.");
    case "Could not load the text viewer. Close the file and try again.":
      return gt("Could not load the text viewer. Close the file and try again.");
    case "An archive entry is too large or damaged.":
      return gt("An archive entry is too large or damaged.");
    case "Archive metadata is too large.":
      return gt("Archive metadata is too large.");
    case "Database previews are limited to 100 tables.":
      return gt("Database previews are limited to 100 tables.");
    case "Entry previews are limited to 10 MB.":
      return gt("Entry previews are limited to 10 MB.");
    case "The TAR header is damaged.":
      return gt("The TAR header is damaged.");
    case "The TAR metadata is damaged.":
      return gt("The TAR metadata is damaged.");
    case "The expanded archive exceeds the preview size or compression ratio limit.":
      return gt("The expanded archive exceeds the preview size or compression ratio limit.");
    case "This TAR uses an unsupported numeric format.":
      return gt("This TAR uses an unsupported numeric format.");
    case "This archive contains more than 2,048 entries.":
      return gt("This archive contains more than 2,048 entries.");
    case "This archive entry is unavailable.":
      return gt("This archive entry is unavailable.");
    case "This archive has no readable entries.":
      return gt("This archive has no readable entries.");
    case "This table is unavailable.":
      return gt("This table is unavailable.");
    case "Could not load the file viewer. Close it and try again.":
      return gt("Could not load the file viewer. Close it and try again.");
    case "This file took too long to preview. Close it and try again.":
      return gt("This file took too long to preview. Close it and try again.");
    case "A notebook cell has too many outputs to preview.":
      return gt("A notebook cell has too many outputs to preview.");
    case "A notebook cell is too large to preview.":
      return gt("A notebook cell is too large to preview.");
    case "A spreadsheet cell is too large to preview.":
      return gt("A spreadsheet cell is too large to preview.");
    case "Invalid rich text binary data.":
      return gt("Invalid rich text binary data.");
    case "Invalid rich text byte escape.":
      return gt("Invalid rich text byte escape.");
    case "Notebook preview limited to files under 8 MB.":
      return gt("Notebook preview limited to files under 8 MB.");
    case "Preview supports version 4 notebooks with up to 500 cells.":
      return gt("Preview supports version 4 notebooks with up to 500 cells.");
    case "Rich text preview limited to 500 pages.":
      return gt("Rich text preview limited to 500 pages.");
    case "Rich text preview limited to files under 8 MB.":
      return gt("Rich text preview limited to files under 8 MB.");
    case "The rendered document is too large to preview.":
      return gt("The rendered document is too large to preview.");
    case "This EPUB has no chapters or too many chapters to preview.":
      return gt("This EPUB has no chapters or too many chapters to preview.");
    case "This EPUB has no readable XHTML chapters.":
      return gt("This EPUB has no readable XHTML chapters.");
    case "This EPUB has no readable package.":
      return gt("This EPUB has no readable package.");
    case "This OpenDocument file has no readable content.":
      return gt("This OpenDocument file has no readable content.");
    case "This document contains invalid or unsupported XML.":
      return gt("This document contains invalid or unsupported XML.");
    case "This document contains invalid repeated content.":
      return gt("This document contains invalid repeated content.");
    case "This document has no pages or too many pages to preview.":
      return gt("This document has no pages or too many pages to preview.");
    case "This document has too much content to preview.":
      return gt("This document has too much content to preview.");
    case "This document is nested too deeply to preview.":
      return gt("This document is nested too deeply to preview.");
    case "This is not a valid rich text document.":
      return gt("This is not a valid rich text document.");
    case "This rich text code page is not supported.":
      return gt("This rich text code page is not supported.");
    case "This rich text document has too much content to preview.":
      return gt("This rich text document has too much content to preview.");
    case "This rich text document is damaged.":
      return gt("This rich text document is damaged.");
    case "This rich text document is nested too deeply.":
      return gt("This rich text document is nested too deeply.");
    case "This spreadsheet has too much text to preview.":
      return gt("This spreadsheet has too much text to preview.");
    case "This workbook has no sheets or too many sheets to preview.":
      return gt("This workbook has no sheets or too many sheets to preview.");
    case "Preview limited: this Word document has an aliased document part.":
      return gt("Preview limited: this Word document has an aliased document part.");
    case "Preview limited: this Word document has an unsupported document relationship.":
      return gt("Preview limited: this Word document has an unsupported document relationship.");
    case "Preview limited: this Word document has excessive XML nesting.":
      return gt("Preview limited: this Word document has excessive XML nesting.");
    case "Preview limited: this Word document has too much auxiliary markup.":
      return gt("Preview limited: this Word document has too much auxiliary markup.");
    case "Preview limited: this Word document has too much expanded markup.":
      return gt("Preview limited: this Word document has too much expanded markup.");
    case "Preview limited: this Word document has too much section markup.":
      return gt("Preview limited: this Word document has too much section markup.");
    case "Preview limited: this Word document has unsupported archive paths.":
      return gt("Preview limited: this Word document has unsupported archive paths.");
    case "The expanded document is too large to preview safely.":
      return gt("The expanded document is too large to preview safely.");
    case "This Word document has excessive XML nesting.":
      return gt("This Word document has excessive XML nesting.");
    case "This Word document has no readable body.":
      return gt("This Word document has no readable body.");
    case "This Word document has too much section markup.":
      return gt("This Word document has too much section markup.");
    case "This document contains unsupported XML declarations.":
      return gt("This document contains unsupported XML declarations.");
    case "This file contains too many archive entries to preview.":
      return gt("This file contains too many archive entries to preview.");
    case "This file is damaged, encrypted, or not a valid Office document.":
      return gt("This file is damaged, encrypted, or not a valid Office document.");
    case "This is not a valid Office Open XML file. Encrypted files are not supported.":
      return gt("This is not a valid Office Open XML file. Encrypted files are not supported.");
    case "This workbook contains duplicate stylesheet blocks.":
      return gt("This workbook contains duplicate stylesheet blocks.");
    case "This workbook contains excessive XML nesting.":
      return gt("This workbook contains excessive XML nesting.");
    case "This workbook contains inconsistent cell rows.":
      return gt("This workbook contains inconsistent cell rows.");
    case "This workbook contains invalid cell coordinates.":
      return gt("This workbook contains invalid cell coordinates.");
    case "This workbook contains invalid cell metadata.":
      return gt("This workbook contains invalid cell metadata.");
    case "This workbook contains invalid row coordinates.":
      return gt("This workbook contains invalid row coordinates.");
    case "This workbook contains invalid worksheet dimensions.":
      return gt("This workbook contains invalid worksheet dimensions.");
    case "This workbook contains invalid worksheet structure.":
      return gt("This workbook contains invalid worksheet structure.");
    case "This workbook exceeds the preview limit: 2 million cells or 8 million grid positions.":
      return gt(
        "This workbook exceeds the preview limit: 2 million cells or 8 million grid positions.",
      );
    case "This workbook exceeds the preview limit: 250,000 rows.":
      return gt("This workbook exceeds the preview limit: 250,000 rows.");
    case "This workbook has a missing worksheet.":
      return gt("This workbook has a missing worksheet.");
    case "This workbook has invalid or too many sheets.":
      return gt("This workbook has invalid or too many sheets.");
    case "This workbook has no worksheet data.":
      return gt("This workbook has no worksheet data.");
    case "This workbook has too many custom number formats.":
      return gt("This workbook has too many custom number formats.");
    case "This file is too large to preview.":
      return gt("This file is too large to preview.");
    case "This file is unavailable or too large to preview.":
      return gt("This file is unavailable or too large to preview.");
    case "This file is unavailable.":
      return gt("This file is unavailable.");
    case "Reconnect to the environment and try again.":
      return gt("Reconnect to the environment and try again.");
    case "The attachment is unavailable.":
      return gt("The attachment is unavailable.");
    case "Could not load this file.":
      return gt("Could not load this file.");
    case "Unable to load audio.":
      return gt("Unable to load audio.");
    case "Unable to load video.":
      return gt("Unable to load video.");
    case "Unable to load image.":
      return gt("Unable to load image.");
    case "Unable to load file preview.":
      return gt("Unable to load file preview.");
    case "This PDF page could not render.":
      return gt("This PDF page could not render.");
    case "Preview limited to 2,000 pages. Save this PDF to read it in full.":
      return gt("Preview limited to 2,000 pages. Save this PDF to read it in full.");
    case "Unable to open PDF.":
      return gt("Unable to open PDF.");
    case "Could not search this PDF.":
      return gt("Could not search this PDF.");
    case "This PDF has too much text to search. Save it to search in another app.":
      return gt("This PDF has too much text to search. Save it to search in another app.");
    case "This PDF took too long to load. Try again.":
      return gt("This PDF took too long to load. Try again.");
    case "Only UTF-8 text and images can be opened inside an archive.":
      return gt("Only UTF-8 text and images can be opened inside an archive.");
    case "The file could not be loaded. Reconnect and try again.":
      return gt("The file could not be loaded. Reconnect and try again.");
    case "Streaming file previews are unavailable in this runtime.":
      return gt("Streaming file previews are unavailable in this runtime.");
    case "Preview cancelled.":
      return gt("Preview cancelled.");
    case "The font took too long to load.":
      return gt("The font took too long to load.");
    case "The font is damaged or unsupported.":
      return gt("The font is damaged or unsupported.");
    default:
      return message;
  }
}
