import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { Project, ObjectDefinition, RelationshipDefinition, RecordItem } from '../types/schema';

/**
 * Downloads a text file (JSON / SVG) to the client machine
 */
export function triggerFileDownload(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Exports project schema and relationships as formatted JSON (FR-10)
 */
export function exportSchemaJSON(
  project: Project,
  objects: ObjectDefinition[],
  relationships: RelationshipDefinition[],
  records?: RecordItem[]
) {
  const payload = {
    metadata: {
      generator: 'DataMesh Studio SRS v1.0',
      exportedAt: new Date().toISOString(),
      projectId: project.id,
      projectName: project.name,
      version: project.currentVersion
    },
    project,
    objects,
    relationships,
    records: records || []
  };

  const jsonStr = JSON.stringify(payload, null, 2);
  const filename = `${project.name.toLowerCase().replace(/[^a-z0-9]/g, '_')}_schema_${project.currentVersion}.json`;
  triggerFileDownload(jsonStr, filename, 'application/json');
}

/**
 * Captures the canvas element and downloads a high-res PNG image
 */
export async function exportDiagramPNG(elementId: string, projectName: string) {
  const targetElement = document.getElementById(elementId);
  if (!targetElement) {
    throw new Error(`Element with id #${elementId} not found`);
  }

  const canvas = await html2canvas(targetElement, {
    backgroundColor: '#0f172a', // Slate dark background
    scale: 2, // 2x Retina resolution
    useCORS: true,
    logging: false
  });

  const imgData = canvas.toDataURL('image/png');
  const link = document.createElement('a');
  link.download = `${projectName.toLowerCase().replace(/[^a-z0-9]/g, '_')}_diagram.png`;
  link.href = imgData;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Exports diagram as a structured vector SVG
 */
export function exportDiagramSVG(
  projectName: string,
  objects: ObjectDefinition[],
  relationships: RelationshipDefinition[]
) {
  // Compute bounding box
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  objects.forEach(obj => {
    minX = Math.min(minX, obj.position.x);
    minY = Math.min(minY, obj.position.y);
    maxX = Math.max(maxX, obj.position.x + 320);
    maxY = Math.max(maxY, obj.position.y + 260);
  });

  if (minX === Infinity) {
    minX = 0; minY = 0; maxX = 1200; maxY = 800;
  }

  const padding = 60;
  const width = Math.max(1000, maxX - minX + padding * 2);
  const height = Math.max(700, maxY - minY + padding * 2);

  const objMap = new Map(objects.map(o => [o.id, o]));

  let linesSvg = '';
  relationships.forEach(rel => {
    const fromObj = objMap.get(rel.fromObjectId);
    const toObj = objMap.get(rel.toObjectId);
    if (!fromObj || !toObj) return;

    const x1 = fromObj.position.x - minX + padding + 150;
    const y1 = fromObj.position.y - minY + padding + 60;
    const x2 = toObj.position.x - minX + padding + 150;
    const y2 = toObj.position.y - minY + padding + 60;

    const midX = (x1 + x2) / 2;
    const midY = (y1 + y2) / 2;

    linesSvg += `
      <g>
        <path d="M ${x1} ${y1} C ${x1 + (x2 - x1) * 0.5} ${y1}, ${x2 - (x2 - x1) * 0.5} ${y2}, ${x2} ${y2}" 
              stroke="#6366f1" stroke-width="2.5" fill="none" stroke-dasharray="0" />
        <circle cx="${x1}" cy="${y1}" r="4" fill="#6366f1" />
        <circle cx="${x2}" cy="${y2}" r="4" fill="#10b981" />
        <rect x="${midX - 45}" y="${midY - 12}" width="90" height="24" rx="12" fill="#1e293b" stroke="#334155" />
        <text x="${midX}" y="${midY + 4}" font-family="sans-serif" font-size="11" font-weight="600" fill="#e2e8f0" text-anchor="middle">
          ${rel.cardinality} • ${rel.label}
        </text>
      </g>
    `;
  });

  let nodesSvg = '';
  objects.forEach(obj => {
    const x = obj.position.x - minX + padding;
    const y = obj.position.y - minY + padding;
    const w = 300;
    const h = 48 + obj.fields.length * 28 + 20;

    let fieldsSvg = '';
    obj.fields.forEach((fld, idx) => {
      const fy = y + 54 + idx * 28;
      fieldsSvg += `
        <rect x="${x + 12}" y="${fy}" width="${w - 24}" height="24" rx="4" fill="#0f172a" opacity="0.6" />
        <text x="${x + 22}" y="${fy + 16}" font-family="sans-serif" font-size="12" font-weight="500" fill="#f8fafc">
          ${fld.name} ${fld.required ? '<tspan fill="#ef4444">*</tspan>' : ''}
        </text>
        <rect x="${x + w - 85}" y="${fy + 3}" width="65" height="18" rx="4" fill="#334155" />
        <text x="${x + w - 52}" y="${fy + 15}" font-family="monospace" font-size="10" fill="#94a3b8" text-anchor="middle">
          ${fld.type}
        </text>
      `;
    });

    nodesSvg += `
      <g id="node_${obj.id}">
        <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="12" fill="#1e293b" stroke="${obj.color}" stroke-width="2" />
        <path d="M ${x} ${y + 40} L ${x + w} ${y + 40}" stroke="#334155" stroke-width="1" />
        <rect x="${x + 12}" y="${y + 10}" width="24" height="24" rx="6" fill="${obj.color}" opacity="0.2" />
        <circle cx="${x + 24}" cy="${y + 22}" r="5" fill="${obj.color}" />
        <text x="${x + 44}" y="${y + 26}" font-family="sans-serif" font-size="14" font-weight="700" fill="#f8fafc">
          ${obj.singularLabel}
        </text>
        <text x="${x + w - 16}" y="${y + 26}" font-family="monospace" font-size="11" fill="#64748b" text-anchor="end">
          ${obj.key}
        </text>
        ${fieldsSvg}
      </g>
    `;
  });

  const svgContent = `<?xml version="1.0" standalone="no"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <rect width="100%" height="100%" fill="#0b0f19" />
  <g>
    ${linesSvg}
    ${nodesSvg}
  </g>
</svg>`;

  const filename = `${projectName.toLowerCase().replace(/[^a-z0-9]/g, '_')}_diagram.svg`;
  triggerFileDownload(svgContent, filename, 'image/svg+xml');
}

/**
 * Exports diagram as a multi-page or landscape PDF (FR-10)
 */
export async function exportDiagramPDF(elementId: string, projectName: string) {
  const targetElement = document.getElementById(elementId);
  if (!targetElement) {
    throw new Error(`Element with id #${elementId} not found`);
  }

  const canvas = await html2canvas(targetElement, {
    backgroundColor: '#0f172a',
    scale: 2,
    useCORS: true,
    logging: false
  });

  const imgData = canvas.toDataURL('image/png');
  const pdf = new jsPDF({
    orientation: 'landscape',
    unit: 'pt',
    format: 'a4'
  });

  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();

  // Add header banner
  pdf.setFillColor(15, 23, 42);
  pdf.rect(0, 0, pageWidth, pageHeight, 'F');

  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(18);
  pdf.setTextColor(248, 250, 252);
  pdf.text(`DataMesh Studio • ${projectName}`, 30, 40);

  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(10);
  pdf.setTextColor(148, 163, 184);
  pdf.text(`Exported on ${new Date().toLocaleString()} | SRS v1.0 Compliant`, 30, 56);

  // Add image scaled to fit
  const availableWidth = pageWidth - 60;
  const availableHeight = pageHeight - 90;
  const ratio = Math.min(availableWidth / canvas.width, availableHeight / canvas.height);

  const finalWidth = canvas.width * ratio;
  const finalHeight = canvas.height * ratio;
  const offsetX = (pageWidth - finalWidth) / 2;
  const offsetY = 70 + (availableHeight - finalHeight) / 2;

  pdf.addImage(imgData, 'PNG', offsetX, offsetY, finalWidth, finalHeight);

  pdf.save(`${projectName.toLowerCase().replace(/[^a-z0-9]/g, '_')}_export.pdf`);
}
