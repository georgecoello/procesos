/* eslint-disable */
import { Document, Packer, Paragraph, TextRun, HeadingLevel, Table, TableRow, TableCell, WidthType, AlignmentType, ShadingType, Header, LevelFormat, BorderStyle } from 'docx';

/**
 * Genera y descarga un .docx usando la librería 'docx'.
 * Incluye definiciones de numbering para viñetas, números y letras.
 */
export async function generateWordDocument(documentData = {}, procedureData = []) {
  try {
    const formattedDate = formatDate(documentData.headerConfig?.fecha);

    // Crear el documento con todas las secciones
    const doc = new Document({
      // Configuración de idioma español (Honduras)
      coreProperties: {
        title: documentData.headerConfig?.policyName || 'PROCEDIMIENTO',
        subject: 'Documento de procedimientos',
        creator: 'Sistema',
        description: 'Procedimiento generado automáticamente',
        language: 'es-HN', // Español Honduras
      },
      features: {
        updateFields: true,
      },
      styles: {
        paragraphStyles: [
          {
            id: 'Heading1',
            name: 'Título 1',
            basedOn: 'Normal',
            next: 'Normal',
            quickFormat: true,
            run: {
              size: 28,
              bold: true,
              color: '2C3E50',
              font: 'Arial'
            },
            paragraph: {
              spacing: { before: 400, after: 200 }
            }
          },
          {
            id: 'Normal',
            name: 'Normal',
            basedOn: 'Normal',
            next: 'Normal',
            run: {
              size: 22,
              font: 'Arial'
            },
            paragraph: {
              spacing: { after: 120 }
            }
          }
        ]
      },
      numbering: {
        config: [
          {
            reference: 'bullet-numbering',
            levels: [
              { 
                level: 0, 
                format: LevelFormat.BULLET, 
                text: '•', 
                alignment: AlignmentType.LEFT,
                style: {
                  paragraph: {
                    indent: { left: 720, hanging: 360 }
                  }
                }
              },
            ],
          },
          {
            reference: 'decimal-numbering',
            levels: [
              { 
                level: 0, 
                format: LevelFormat.DECIMAL, 
                text: '%1.', 
                alignment: AlignmentType.LEFT,
                style: {
                  paragraph: {
                    indent: { left: 720, hanging: 360 }
                  }
                }
              },
            ],
          },
          {
            reference: 'letter-numbering',
            levels: [
              { 
                level: 0, 
                format: LevelFormat.LOWER_LETTER, 
                text: '%1.', 
                alignment: AlignmentType.LEFT,
                style: {
                  paragraph: {
                    indent: { left: 720, hanging: 360 }
                  }
                }
              },
            ],
          },
        ],
      },
      sections: [{
        properties: {
          page: {
            margin: {
              top: 1440,
              right: 1440,
              bottom: 1440,
              left: 1440,
            },
          },
        },
        headers: {
          default: new Header({
            children: [createHeaderTable(documentData, formattedDate)]
          }),
        },
        children: [
          // 1. Objetivo o Propósito
          new Paragraph({
            children: [
              new TextRun({
                text: '1. Objetivo o Propósito',
                bold: true,
                size: 26,
                font: 'Arial',
                color: '2C3E50'
              })
            ],
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 400, after: 200 }
          }),
          ...parseHtmlToParagraphs(documentData.objetivo || 'Contenido pendiente de completar.'),

          // 2. Alcance
          new Paragraph({
            children: [
              new TextRun({
                text: '2. Alcance',
                bold: true,
                size: 26,
                font: 'Arial',
                color: '2C3E50'
              })
            ],
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 400, after: 200 }
          }),
          ...parseHtmlToParagraphs(documentData.alcance || 'Contenido pendiente de completar.'),

          // 3. Responsabilidades
          new Paragraph({
            children: [
              new TextRun({
                text: '3. Responsabilidades',
                bold: true,
                size: 26,
                font: 'Arial',
                color: '2C3E50'
              })
            ],
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 400, after: 200 }
          }),
          ...parseHtmlToParagraphs(documentData.responsabilidades || 'Contenido pendiente de completar.'),

          // 4. Normativa
          new Paragraph({
            children: [
              new TextRun({
                text: '4. Normativa',
                bold: true,
                size: 26,
                font: 'Arial',
                color: '2C3E50'
              })
            ],
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 400, after: 200 }
          }),
          ...parseHtmlToParagraphs(documentData.normativa || 'Contenido pendiente de completar.'),

          // 5. Procedimiento
          new Paragraph({
            children: [
              new TextRun({
                text: '5. Procedimiento',
                bold: true,
                size: 26,
                font: 'Arial',
                color: '2C3E50'
              })
            ],
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 400, after: 200 }
          }),
          createProcedureTable(procedureData),

          // 6. Anexos
          new Paragraph({
            children: [
              new TextRun({
                text: '6. Anexos',
                bold: true,
                size: 26,
                font: 'Arial',
                color: '2C3E50'
              })
            ],
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 400, after: 200 }
          }),
          ...parseHtmlToParagraphs(documentData.anexos || 'Contenido pendiente de completar.'),

          // 7. Términos y Referencias
          new Paragraph({
            children: [
              new TextRun({
                text: '7. Términos y Referencias',
                bold: true,
                size: 26,
                font: 'Arial',
                color: '2C3E50'
              })
            ],
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 400, after: 200 }
          }),
          ...parseHtmlToParagraphs(documentData.terminos || 'Contenido pendiente de completar.'),
        ]
      }]
    });

    const blob = await Packer.toBlob(doc);
    const fileName = `${documentData.headerConfig?.policyName || 'Procedimiento'}.docx`;

    if (window.navigator && window.navigator.msSaveOrOpenBlob) {
      window.navigator.msSaveOrOpenBlob(blob, fileName);
    } else {
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();
      setTimeout(() => {
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }, 150);
    }

    return true;
  } catch (error) {
    console.error('Error generando documento Word:', error);
    throw new Error(`Error al generar el documento: ${error.message}`);
  }
}

// Función para crear la tabla del header
function createHeaderTable(documentData, formattedDate) {
  return new Table({
    width: {
      size: 100,
      type: WidthType.PERCENTAGE,
    },
    columnWidths: [2275, 2275, 2275, 2275], // 4 columnas de igual ancho
    borders: {
      top: { style: BorderStyle.SINGLE, size: 4, color: "000000" },
      left: { style: BorderStyle.SINGLE, size: 4, color: "000000" },
      bottom: { style: BorderStyle.SINGLE, size: 4, color: "000000" },
      right: { style: BorderStyle.SINGLE, size: 4, color: "000000" },
      insideHorizontal: { style: BorderStyle.SINGLE, size: 4, color: "000000" },
      insideVertical: { style: BorderStyle.SINGLE, size: 4, color: "000000" },
    },
    rows: [
      // Primera fila: Logo, Manual, Páginas
      new TableRow({
        children: [
          // Logo
          new TableCell({
            children: [new Paragraph({
              children: [new TextRun({
                text: "Logo",
                bold: true,
                size: 22,
                font: 'Arial'
              })]
            })]
          }),
          // Manual de Políticas y Procedimientos
          new TableCell({
            children: [new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [new TextRun({
                text: documentData.headerConfig?.manualName || 'Manual de Políticas y Procedimientos',
                bold: true,
                size: 22,
                font: 'Arial'
              })]
            })]
          }),
          // Páginas (ocupa 2 columnas) - Usando campos en español
          new TableCell({
            columnSpan: 2,
            children: [new Paragraph({
              alignment: AlignmentType.RIGHT,
              children: [
                new TextRun({ text: "Página ", bold: true, size: 22, font: 'Arial' }),
                // Campo para número de página actual en español
                new TextRun({
                  text: "1", // Este número será estático pero se actualizará en Word
                  bold: true,
                  size: 22,
                  font: 'Arial'
                }),
                new TextRun({ text: " de ", bold: true, size: 22, font: 'Arial' }),
                // Campo para total de páginas en español
                new TextRun({
                  text: "1", // Este número será estático pero se actualizará en Word
                  bold: true,
                  size: 22,
                  font: 'Arial'
                }),
              ]
            })]
          }),
        ],
      }),
      // Segunda fila: Nombre del Procedimiento y Código
      new TableRow({
        children: [
          // POLÍTICA O PROCEDIMIENTO DE (ocupa 2 columnas)
          new TableCell({
            columnSpan: 2,
            children: [new Paragraph({
              children: [new TextRun({
                text: documentData.headerConfig?.policyName || 'PROCEDIMIENTO',
                bold: true,
                size: 24,
                font: 'Arial',
                allCaps: true,
              })]
            })]
          }),
          // CÓDIGO (ocupa 2 columnas)
          new TableCell({
            columnSpan: 2,
            children: [new Paragraph({
              alignment: AlignmentType.RIGHT,
              children: [new TextRun({
                text: `CÓDIGO: ${documentData.headerConfig?.codigo || 'XX-P-XXX-#'}`,
                bold: true,
                size: 20,
                font: 'Arial'
              })]
            })]
          }),
        ],
      }),
      // Tercera fila: Área, Unidad, Revisión, Fecha
      new TableRow({
        children: [
          // Área
          new TableCell({
            children: [new Paragraph({
              children: [new TextRun({
                text: `Área: ${documentData.headerConfig?.area || 'Área responsable'}`,
                size: 18,
                font: 'Arial'
              })]
            })]
          }),
          // Unidad
          new TableCell({
            children: [new Paragraph({
              children: [new TextRun({
                text: `Unidad: ${documentData.headerConfig?.unidad || 'Unidad específica'}`,
                size: 18,
                font: 'Arial'
              })]
            })]
          }),
          // Revisión
          new TableCell({
            children: [new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [new TextRun({
                text: `Revisión: ${documentData.headerConfig?.revision || '(1)'}`,
                size: 18,
                font: 'Arial'
              })]
            })]
          }),
          // Fecha
          new TableCell({
            children: [new Paragraph({
              alignment: AlignmentType.RIGHT,
              children: [new TextRun({
                text: `Fecha: ${formattedDate}`,
                bold: true,
                size: 18,
                font: 'Arial'
              })]
            })]
          }),
        ],
      }),
    ],
  });
}

/* ---------------- Helpers ---------------- */

function formatDate(dateInput) {
  if (!dateInput) {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${day}-${month}-${year}`;
  }
  
  const d = new Date(dateInput);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}-${month}-${year}`;
}

function safeText(value) {
  if (value == null) return '';
  return String(value).replace(/\s+/g, ' ').trim();
}

/**
 * Parsea HTML simple (p, ul, ol, li, br) a Paragraphs de docx.
 * Asegura usar numbering.reference igual a la configuración del Document.
 */
function parseHtmlToParagraphs(html = '') {
  const paragraphs = [];
  if (!html) return paragraphs;

  try {
    // Si no contiene tags, dividir por saltos de línea
    if (!html.includes('<') && !html.includes('>')) {
      const lines = String(html).split(/\n+/).map(s => safeText(s)).filter(Boolean);
      lines.forEach(line => paragraphs.push(new Paragraph({
        children: [new TextRun({ text: line, size: 22, font: 'Arial' })],
        spacing: { after: 120 }
      })));
      return paragraphs;
    }

    const parser = new DOMParser();
    const doc = parser.parseFromString(`<div>${html}</div>`, 'text/html');
    const root = doc.body.firstElementChild || doc.body;

    root.childNodes.forEach(node => {
      if (node.nodeType !== Node.ELEMENT_NODE) {
        const text = safeText(node.textContent);
        if (text) paragraphs.push(new Paragraph({
          children: [new TextRun({ text, size: 22, font: 'Arial' })],
          spacing: { after: 120 }
        }));
        return;
      }

      const tag = node.tagName.toLowerCase();

      if (tag === 'p') {
        const text = safeText(node.textContent);
        if (text) paragraphs.push(new Paragraph({
          children: [new TextRun({ text, size: 22, font: 'Arial' })],
          spacing: { after: 120 }
        }));
      } else if (tag === 'ul' || tag === 'ol') {
        const isOrdered = tag === 'ol';
        const outer = node.outerHTML || '';
        const isLetter = /data-type\s*=\s*["']letter["']/i.test(outer);
        const numberingRef = isLetter ? 'letter-numbering' : (isOrdered ? 'decimal-numbering' : 'bullet-numbering');

        node.querySelectorAll('li').forEach(li => {
          const liText = safeText(li.textContent);
          if (!liText) return;
          paragraphs.push(new Paragraph({
            children: [new TextRun({ text: liText, size: 22, font: 'Arial' })],
            numbering: { reference: numberingRef, level: 0 },
            spacing: { after: 80 },
          }));
        });
      } else if (tag === 'br') {
        paragraphs.push(new Paragraph({ text: '' }));
      } else {
        const text = safeText(node.textContent);
        if (text) paragraphs.push(new Paragraph({
          children: [new TextRun({ text, size: 22, font: 'Arial' })],
          spacing: { after: 120 }
        }));
      }
    });
  } catch (e) {
    // Fallback: limpiar tags y dividir por saltos
    const cleaned = String(html).replace(/<br\s*\/?>/gi, '\n').replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').trim();
    if (cleaned) {
      cleaned.split(/\n+/).map(s => safeText(s)).filter(Boolean).forEach(t => {
        paragraphs.push(new Paragraph({
          children: [new TextRun({ text: t, size: 22, font: 'Arial' })],
          spacing: { after: 120 }
        }));
      });
    }
  }

  if (paragraphs.length === 0) paragraphs.push(new Paragraph({ text: '' }));
  return paragraphs;
}

/**
 * Crea una tabla para el procedimiento (uso de docx Table)
 */
function createProcedureTable(data = []) {
  if (!data || data.length === 0) {
    return new Paragraph({ 
      children: [new TextRun({ text: 'No se ha definido el procedimiento.', size: 22, font: 'Arial' })],
      spacing: { after: 120 } 
    });
  }

  const headerRow = new TableRow({
    children: [
      new TableCell({
        width: { size: 1700, type: WidthType.DXA },
        shading: { fill: '2C3E50', type: ShadingType.CLEAR },
        margins: { top: 100, bottom: 100, left: 100, right: 100 },
        children: [new Paragraph({
          children: [new TextRun({ 
            text: '(#)', 
            bold: true, 
            color: 'FFFFFF',
            size: 20,
            font: 'Arial'
          })],
          alignment: AlignmentType.CENTER,
          spacing: { before: 100, after: 100 }
        })],
      }),
      new TableCell({
        width: { size: 2800, type: WidthType.DXA },
        shading: { fill: '2C3E50', type: ShadingType.CLEAR },
        margins: { top: 100, bottom: 100, left: 100, right: 100 },
        children: [new Paragraph({
          children: [new TextRun({ 
            text: '(Quién)', 
            bold: true, 
            color: 'FFFFFF',
            size: 20,
            font: 'Arial'
          })],
          alignment: AlignmentType.CENTER,
          spacing: { before: 100, after: 100 }
        })],
      }),
      new TableCell({
        width: { size: 6800, type: WidthType.DXA },
        shading: { fill: '2C3E50', type: ShadingType.CLEAR },
        margins: { top: 100, bottom: 100, left: 100, right: 100 },
        children: [new Paragraph({
          children: [new TextRun({ 
            text: '(Actividad)', 
            bold: true, 
            color: 'FFFFFF',
            size: 20,
            font: 'Arial'
          })],
          alignment: AlignmentType.CENTER,
          spacing: { before: 100, after: 100 }
        })],
      }),
    ],
  });

  const rows = [headerRow];

  data.forEach((row, index) => {
    let number = safeText(row.number || '');
    if (number) {
      if (!number.includes('.') && !isNaN(number)) number = `5.${number}`;
      else if (!number.startsWith('5.')) {
        const segs = number.split('.');
        if (segs.every(s => /^\d+$/.test(s.trim()))) number = `5.${number}`;
      }
    }

    const who = safeText(row.who || '');
    const activity = safeText(row.activity || '');
    const level = safeText(row.level || '');
    const bg = getBackgroundColor(level);

    rows.push(new TableRow({
      children: [
        new TableCell({
          margins: { top: 100, bottom: 100, left: 100, right: 100 },
          children: [new Paragraph({
            children: [new TextRun({ 
              text: number, 
              size: 20,
              font: 'Arial',
              bold: true
            })],
            alignment: AlignmentType.CENTER,
            spacing: { before: 100, after: 100 }
          })],
          shading: bg ? { fill: bg, type: ShadingType.CLEAR } : undefined,
        }),
        new TableCell({
          margins: { top: 100, bottom: 100, left: 100, right: 100 },
          children: [new Paragraph({
            children: [new TextRun({ 
              text: who, 
              size: 20,
              font: 'Arial'
            })],
            spacing: { before: 100, after: 100 }
          })],
          shading: bg ? { fill: bg, type: ShadingType.CLEAR } : undefined,
        }),
        new TableCell({
          margins: { top: 100, bottom: 100, left: 100, right: 100 },
          children: [new Paragraph({
            children: [new TextRun({ 
              text: activity, 
              size: 20,
              font: 'Arial'
            })],
            spacing: { before: 100, after: 100 }
          })],
          shading: bg ? { fill: bg, type: ShadingType.CLEAR } : undefined,
        }),
      ],
    }));
  });

  return new Table({
    rows,
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: {
      top: { style: BorderStyle.SINGLE, size: 1, color: 'CCCCCC' },
      bottom: { style: BorderStyle.SINGLE, size: 1, color: 'CCCCCC' },
      left: { style: BorderStyle.SINGLE, size: 1, color: 'CCCCCC' },
      right: { style: BorderStyle.SINGLE, size: 1, color: 'CCCCCC' },
      insideHorizontal: { style: BorderStyle.SINGLE, size: 1, color: 'CCCCCC' },
      insideVertical: { style: BorderStyle.SINGLE, size: 1, color: 'CCCCCC' },
    },
  });
}

function getBackgroundColor(level) {
  const colors = {
    sub: 'E8F5E8',
    section: 'E3F2FD',
    question: 'FFF3CD',
    alternative: 'D1ECF1',
    end: 'D4EDDA',
  };
  return colors[level] || '';
}