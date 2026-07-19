import { createRoot } from 'react-dom/client';
import RecipePrintTemplate, { PAGE_WIDTH } from '../components/RecipePrintTemplate';

function slugify(name) {
  return (name || 'recipe')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 60) || 'recipe';
}

function waitForImages(container) {
  const imgs = Array.from(container.querySelectorAll('img'));
  return Promise.all(
    imgs.map(img => img.complete
      ? Promise.resolve()
      : new Promise(resolve => {
          img.addEventListener('load', resolve, { once: true });
          img.addEventListener('error', resolve, { once: true });
        })
    )
  );
}

async function renderCanvas(recipe, { withPhoto }) {
  const html2canvas = (await import('html2canvas')).default;

  const container = document.createElement('div');
  container.style.cssText = `position:fixed; top:0; left:-99999px; width:${PAGE_WIDTH}px; z-index:-1;`;
  document.body.appendChild(container);

  const root = createRoot(container);
  const patchedRecipe = withPhoto ? recipe : { ...recipe, imageUrl: null };
  root.render(<RecipePrintTemplate recipe={patchedRecipe} />);

  // Let React commit, fonts settle, and any banner photo finish loading
  await new Promise(r => setTimeout(r, 50));
  await document.fonts?.ready?.catch(() => {});
  await waitForImages(container);
  await new Promise(r => setTimeout(r, 60));

  try {
    const canvas = await html2canvas(container, {
      scale: 2,
      useCORS: true,
      backgroundColor: '#fbf7f2',
      windowWidth: PAGE_WIDTH,
    });
    return canvas;
  } finally {
    root.unmount();
    container.remove();
  }
}

async function buildPdfBlob(recipe) {
  const { jsPDF } = await import('jspdf');

  let canvas;
  try {
    canvas = await renderCanvas(recipe, { withPhoto: true });
  } catch (err) {
    // Photo likely tainted the canvas (CORS) — retry without it rather than failing the export
    canvas = await renderCanvas(recipe, { withPhoto: false });
  }

  const pdf = new jsPDF({ unit: 'pt', format: 'letter' });
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();

  const imgWidth = pageWidth;
  const imgHeight = (canvas.height * imgWidth) / canvas.width;
  const pxPerPdfPt = canvas.width / imgWidth;
  const pageHeightPx = pageHeight * pxPerPdfPt;

  let renderedHeight = 0;
  let first = true;

  while (renderedHeight < canvas.height) {
    const sliceHeightPx = Math.min(pageHeightPx, canvas.height - renderedHeight);

    const sliceCanvas = document.createElement('canvas');
    sliceCanvas.width = canvas.width;
    sliceCanvas.height = sliceHeightPx;
    const ctx = sliceCanvas.getContext('2d');
    ctx.drawImage(canvas, 0, renderedHeight, canvas.width, sliceHeightPx, 0, 0, canvas.width, sliceHeightPx);

    const sliceImgHeight = (sliceHeightPx * imgWidth) / canvas.width;

    if (!first) pdf.addPage();
    pdf.addImage(sliceCanvas.toDataURL('image/jpeg', 0.92), 'JPEG', 0, 0, imgWidth, sliceImgHeight);

    renderedHeight += sliceHeightPx;
    first = false;
  }

  return pdf.output('blob');
}

// Generates the PDF and either opens the native share sheet (mobile) or
// triggers a direct download (desktop / unsupported browsers).
export async function shareRecipePdf(recipe) {
  const blob = await buildPdfBlob(recipe);
  const filename = `${slugify(recipe.name)}-recipe.pdf`;
  const file = new File([blob], filename, { type: 'application/pdf' });

  if (navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({ files: [file], title: recipe.name });
      return;
    } catch (err) {
      if (err?.name === 'AbortError') return; // user cancelled the share sheet
      // fall through to download on any other share failure
    }
  }

  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
